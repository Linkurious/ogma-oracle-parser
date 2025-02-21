import { RawGraph } from "@linkurious/ogma";
import { Connection, Lob } from "oracledb";
import {
  ElementID,
  OracleResponse,
  ParserOptions,
  Schema,
  SQLID,
} from "./types";
import { SQLIDfromId, SQLIDtoId } from "./utils";
export * from "./types";
export * from "./schema";
export * from "./utils";

/**
 * Read a lob and parse it as JSON
 * @param lob Lob to read (from oracledb)
 * @returns The parsed JSON
 */
export function readLob<T = unknown>(lob: Lob) {
  return new Promise<T>((resolve, reject) => {
    let json = "";
    lob.setEncoding("utf8");
    lob.on("error", (err) => {
      reject(err);
    });
    lob.on("data", (chunk) => {
      json += chunk;
    });
    lob.on("end", () => {
      lob.destroy();
    });
    lob.on("close", () => {
      resolve(JSON.parse(json));
    });
  });
}

export async function getRawGraphFromSchema<N, E>({
  query,
  conn,
  schema,
  batch,
}: {
  query: string;
  conn: Connection;
  schema: Schema;
  batch?: number;
}) {
  const graph: RawGraph<N, E> = { nodes: [], edges: [] };
  const { rows } = await conn.execute<ElementID[]>(query);
  if (!rows) {
    return graph;
  }
  return await getGraph({
    conn,
    ids: rows.flat(),
    schema,
    batch,
  });
}

async function getGraph<N, E>({
  conn,
  ids,
  schema,
  batch = 50,
}: {
  conn: Connection;
  ids: ElementID[];
  schema: Schema;
  batch?: number;
}) {
  const graph = { nodes: [], edges: [] } as RawGraph<N, E>;
  const idsPerType: Map<string, Set<number>> = new Map();
  let graphName = "";

  for (let i = 0; i < ids.length; i++) {
    if (!graphName) {
      graphName = ids[i].GRAPH_NAME;
    }
    const table = ids[i].ELEM_TABLE;
    const id = ids[i].KEY_VALUE.ID;
    if (!idsPerType.has(table)) {
      idsPerType.set(table, new Set());
    }
    idsPerType.get(table)!.add(id);
  }

  const graphTables = Array.from(idsPerType.keys());
  for (let i = 0; i < graphTables.length; i++) {
    const graphTable = graphTables[i];
    const ids = Array.from(idsPerType.get(graphTable) || []);
    const isEdge = schema[graphName].edgeMap.has(graphTable);
    const isVertex = schema[graphName].verticeMap.has(graphTable);
    if (!isEdge && !isVertex) {
      //TODO: Should throw ?
      throw new Error(
        `Ogma Oracle Parser: Element ${graphTable} not found in schema`
      );
    }
    const arr: unknown[] = isEdge ? graph.edges : graph.nodes;
    const element = isEdge
      ? schema[graphName].edgeMap.get(graphTable)!
      : schema[graphName].verticeMap.get(graphTable)!;
    const table = element.name;
    const properties = Object.keys(element.properties);
    if (properties.length === 0) {
      for (let j = 0; j < ids.length; j++) {
        arr.push({
          id: ids[j],
          data: {},
        });
      }
    } else {
      for (let j = 0; j < ids.length; j += batch) {
        const slice = ids.slice(j, j + batch);
        const req = `
      WITH ElementIDs AS (
      SELECT ${slice[0]} as id FROM DUAL
      ${slice
        .slice(1)
        .map((id) => `UNION ALL SELECT ${id} FROM DUAL`)
        .join("\n")}
      )
        SELECT ${properties.join(",")}
        FROM ${table} e
        JOIN ElementIDs i ON e.id = i.id`;
        // console.time("req");
        const { rows: data } = await conn.execute<(string | number)[]>(req);
        // console.timeEnd("req");

        for (let k = 0; k < slice.length; k++) {
          const row = data![k];
          const id = slice[k];
          arr.push({
            id,
            data: Object.fromEntries(properties.map((key, l) => [key, row[l]])),
          });
        }
      }
    }
  }
  return graph;
}
/**
 * Parser for Oracle SQL Graph
 * @typeParam ND [Node data type](https://doc.linkurious.com/ogma/latest/tutorials/typescript/index.html#data-typing)
 * @typeParam ED [Edge data type](https://doc.linkurious.com/ogma/latest/tutorials/typescript/index.html#data-typing)
 */
export class OgmaOracleParser<ND = unknown, ED = unknown> {
  /**
   * Function to transform a SQL ID to a string id
   */
  public SQLIDtoId: (id: SQLID) => string;
  /**
   * Function to transform a string id to a SQL ID
   */
  public SQLIDfromId: (id: string) => SQLID;
  constructor(options: ParserOptions<ND, ED>) {
    this.SQLIDtoId = options.SQLIDtoId || SQLIDtoId;
    this.SQLIDfromId = options.SQLIDfromId || SQLIDfromId;
  }
  /**
   * Takes an [OracleResponse](/api/modules.html#oracleresponse) and returns a RawGraph
   * @param param0 The JSON returned by CUST_SQLGRAPH_JSON
   * @returns A [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
   */
  parse<N = ND, E = ED>({ vertices, edges }: OracleResponse<N, E>) {
    const idFn = this.SQLIDtoId;
    return {
      nodes: vertices.map(({ id: sqlid, properties }) => {
        return {
          id: idFn(sqlid),
          data: properties,
        };
      }),
      edges: edges.map(({ id: sqlid, properties, source, target }) => {
        return {
          source: idFn(source),
          target: idFn(target),
          id: idFn(sqlid),
          data: properties,
        };
      }),
    } as RawGraph<N, E>;
  }

  /**
   * Read a lob and parse it as [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
   * @param lob
   * @returns A [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
   */
  parseLob<N = ND, E = ED>(lob: Lob) {
    return readLob<OracleResponse<N, E> & { numResults: number }>(lob).then(
      (result) => ({
        ...this.parse<N, E>(result),
        numResults: result.numResults,
      })
    );
  }

  /**
   * Executes a query (wrapped in CUST_SQLGRAPH_JSON)
   * and returns a [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
   *
   * @param options
   * @param options.query The query to execute
   * @param options.conn The connection to use
   * @param options.pageStart The page to start from (default 0)
   * @param options.pageLength The page length (default 32000)
   * @param options.maxResults The maximum number of elements returned (nodes + edges) (default Infinity)
   * @returns a RawgGraph
   */
  async getRawGraph<N = ND, E = ED>({
    query,
    conn,
    pageStart,
    pageLength,
    maxResults,
  }: {
    query: string;
    conn: Connection;
    pageStart?: number;
    pageLength?: number;
    maxResults?: number;
  }) {
    let hasFinised = false;
    let totalResults = 0;
    pageStart = pageStart || 0;
    pageLength = pageLength || 32000;
    maxResults = maxResults || Infinity;
    const graph: RawGraph<N, E> = { nodes: [], edges: [] };
    while (!hasFinised && totalResults < maxResults) {
      const lobs = await conn.execute<Lob[]>(
        `SELECT CUST_SQLGRAPH_JSON('${query}', ${pageStart}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`
      );
      if (!lobs.rows) {
        return graph;
      }
      const { numResults, nodes, edges } = await this.parseLob<N, E>(
        lobs.rows![0][0]
      );
      hasFinised = pageStart >= numResults || numResults < pageLength;
      pageStart += pageLength;
      graph.nodes.push(...nodes);
      graph.edges.push(...edges);
      totalResults = graph.nodes.length + graph.edges.length;
    }
    return graph;
  }
}
const parser = new OgmaOracleParser({ SQLIDtoId, SQLIDfromId });
export default parser;
/**
 * Takes an [OracleResponse](/api/modules.html#oracleresponse) and returns a RawGraph
 * @param param0 The JSON returned by CUST_SQLGRAPH_JSON
 * @returns A [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
 */
export const parse = parser.parse.bind(parser);
/**
 * Read a lob and parse it as [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
 * @param lob
 * @returns A [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
 */
export const parseLob = parser.parseLob.bind(parser);
/**
 * Executes a query (wrapped in CUST_SQLGRAPH_JSON)
 * and returns a [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
 * @param options
 * @param options.query The query to execute
 * @param options.conn The connection to use
 * @param options.pageStart The page to start from (default 0)
 * @param options.pageLength The page length (default 32000)
 * @param options.maxResults The maximum number of elements returned (nodes + edges) (default Infinity)
 * @returns a RawgGraph
 */
export const getRawGraph = parser.getRawGraph.bind(parser);
