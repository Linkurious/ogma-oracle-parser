
import { OracleResponse, RawId } from "./types";
import { RawGraph } from "@linkurious/ogma";
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
  return match[1];
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
