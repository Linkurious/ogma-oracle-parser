
import { Connection, Lob } from "oracledb";
import { OracleResponse, ParserOptions, SQLID, SQLIDtoIdFn, parseFn, parseNodeFn } from "./types";
import { RawGraph, RawNode } from "@linkurious/ogma";
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
export function indexFromId(id: string) {
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
export function SQLIDFromId(id: string): SQLID {
  return `${labelFromId(id)}{"ID":${+indexFromId(id)}}`;
}

/**
 * READ LOB function
 * @param lob 
 * @returns 
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

export class OgmaOracleParser<ND = unknown, ED = unknown> {

  public SQLIDtoId: (id: SQLID) => string;
  public SQLIDFromId: (id: string) => SQLID;
  constructor(options: ParserOptions<ND, ED>) {
    this.SQLIDtoId = options.SQLIDtoId || SQLIDtoId;
    this.SQLIDFromId = options.SQLIDFromId || SQLIDFromId;
  }

  parse({ vertices, edges }: OracleResponse<ND, ED>) {
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
    } as RawGraph<ND, ED>;
  }

  parseLob(lob: Lob) {
    return readLob<OracleResponse<ND, ED> & { numResults: number; }>(lob)
      .then((result) => ({ ...this.parse(result), numResults: result.numResults }));
  }

  async getRawGraph({ query, conn, pageStart, pageLength, maxResults }:
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
    const graph: RawGraph<ND, ED> = { nodes: [], edges: [] };
    while (!hasFinised && totalResults < maxResults) {
      const lobs = await conn.execute<Lob[]>(`SELECT CUST_SQLGRAPH_JSON('${query}', ${pageStart}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`);
      if (!lobs.rows) {
        return graph;
      }
      const { numResults, nodes, edges } = await this.parseLob(lobs.rows[0][0]);
      hasFinised = pageStart >= numResults;
      pageStart += pageLength;
      graph.nodes.push(...nodes);
      graph.edges.push(...edges);
      totalResults = graph.nodes.length + graph.edges.length;
    }
    return graph;
  }
}
const parser = new OgmaOracleParser({ SQLIDtoId, SQLIDFromId });
export default parser;
export const { parse, parseLob, getRawGraph } = parser;