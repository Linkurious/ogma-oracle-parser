
import { Lob } from "oracledb";
import { OracleResponse, RawId } from "./types";
import { RawGraph, RawNode } from "@linkurious/ogma";
export * from './types';


export function rawIdToId(rawId: RawId) {
  const match = rawId.match(/(.*)\{.+:([0-9]+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return `${match[1]}:${match[2]}`;
}
export function indexFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[2];
}
export function tableFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[1].slice(0, -1);
}
export function rawIdFromId(id: string): RawId {
  return `${tableFromId(id)}{"ID":${+indexFromId(id)}}`;
}

export function parse<ND, ED>({ vertices, edges }: OracleResponse<ND, ED>, idFn = rawIdToId): RawGraph<ND, ED> {
  return {
    nodes: vertices.map(({ id: rawId, properties }) => {
      return {
        id: idFn(rawId),
        data: properties,
      };
    }),
    edges: edges.map(({ id: rawId, properties, source, target }) => {
      return {
        source: idFn(source),
        target: idFn(target),
        id: idFn(rawId),
        data: properties,
      };
    })
  };
}

function readLob<T = unknown>(lob: Lob) {
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

export function parseLob<ND = unknown, ED = unknown>(lob: Lob) {
  return readLob<OracleResponse<ND, ED> & { numResults: number; }>(lob)
    .then((result) => ({ ...parse<ND, ED>(result), numResults: result.numResults }));
}


type ParserOptions<ND, ED> = {
  rawIdtoId: (id: RawId) => string;
  indexFromId: (id: string) => string;
  labelFromId: (id: string) => string;
  parseNode: (opts: { id: RawId, properties: Record<string, any>; }) => RawNode<ND>;
};
export class OgmaOracleParser {

  constructor(options) {

  }

  parseNode({ id, properties }: ) {

  }

}