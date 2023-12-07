
import { RawGraph } from "@linkurious/ogma";
import { Connection, Lob } from "oracledb";
import { OracleResponse, ParserOptions, SQLID } from "./types";
export * from './types';
/**
 * Transforms an id from SQL database to a string id
 * @param rawId SQL Oracle ID
 * @returns string id
 */
export function SQLIDtoId(sqlid: SQLID) {
  const match = sqlid.match(/(.*)\{.+:([0-9]+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return `${match[1]}:${match[2]}`;
}
/**
 * Retrieves the elment ID in his table ID from a string id
 * @param id a string id (from SQLIDToId)
 * @returns SQL ID in table
 */
export function rowId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[2];
}
/**
 * Retrieves the label from a string id
 * @param id a string id (from SQLIDToId)
 * @returns label defined in create property graph query
 */
export function labelFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[1].slice(0, -1);
}
/**
 * Transforms a string id to a SQL ID
 * @param id a string id (from rawIdToId)
 * @returns a SQL ID
 */
export function SQLIDfromId(id: string): SQLID {
  return `${labelFromId(id)}{"ID":${+rowId(id)}}`;
}

/**
 * Read a lob and parse it as JSON
 * @param lob Lob to read (from oracledb)
 * @returns The parsed JSON
 */
export function readLob<T = unknown>(lob: Lob) {
  return new Promise<T>((resolve, reject) => {
    let json = "";
    lob.setEncoding('utf8');
    lob.on('error', (err) => {
      reject(err);
    });
    lob.on('data', (chunk) => {
      json += chunk;
    });
    lob.on('end', () => {
      lob.destroy();
    });
    lob.on('close', () => {
      resolve(JSON.parse(json));
    });
  });
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
      })
    } as RawGraph<N, E>;
  }
  /**
   * Read a lob and parse it as [RawGraph](https://doc.linkurious.com/ogma/latest/api.html#RawGraph)
   * @param lob 
   * @returns 
   */
  parseLob<N = ND, E = ED>(lob: Lob) {
    return readLob<OracleResponse<N, E> & { numResults: number; }>(lob)
      .then((result) => ({ ...this.parse<N, E>(result), numResults: result.numResults }));
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
  async getRawGraph<N = ND, E = ED>({ query, conn, pageStart, pageLength, maxResults }:
    {
      query: string,
      conn: Connection,
      pageStart?: number,
      pageLength?: number,
      maxResults?: number;
    }) {

    let hasFinised = false;
    let totalResults = 0;
    pageStart = pageStart || 0;
    pageLength = pageLength || 32000;
    maxResults = maxResults || Infinity;
    const graph: RawGraph<N, E> = { nodes: [], edges: [] };
    while (!hasFinised && totalResults < maxResults) {
      const lobs = await conn.execute<Lob[]>(`SELECT CUST_SQLGRAPH_JSON('${query}', ${pageStart}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`);
      if (!lobs.rows) {
        return graph;
      }
      const lobsPromise = () => this.parseLob<N, E>(lobs.rows![0][0]);
      const { numResults, nodes, edges } = await lobsPromise();
      hasFinised = pageStart >= numResults;
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

export const parse = parser.parse.bind(parser);
export const parseLob = parser.parseLob.bind(parser);
export const getRawGraph = parser.getRawGraph.bind(parser);