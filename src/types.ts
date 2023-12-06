import { RawEdge, RawNode } from "@linkurious/ogma/dev";

export type TableName = string;
export type RowId = number;
export type SQLID = `${TableName}\{"ID":${RowId}\}`;

export type SQLIDtoIdFn = (id: SQLID) => string;
export type SQLIDFromIdFn = (id: string) => SQLID;
export type parseNodeFn<ND = unknown> = (opts: { id: SQLID, properties: Record<string, any>; }) => RawNode<ND>;
export type parseEdgeFn<ED = unknown> = (opts: { id: SQLID, properties: Record<string, any>; }) => RawEdge<ED>;
export type parseFn<ND = unknown, ED = unknown> = (opts: OracleResponse<ND, ED>) => { nodes: RawNode<ND>[], edges: RawEdge<ED>[]; };
export type ParserOptions<ND, ED> = {
    SQLIDtoId?: SQLIDtoIdFn;
    SQLIDFromId?: SQLIDFromIdFn;
    indexFromId?: (id: string) => string;
    labelFromId?: (id: string) => string;
    parseFn?: parseFn<ND, ED>;
};

export type OracleResponse<
    ND = Record<string, unknown>,
    ED = Record<string, unknown>> =
    {
        vertices: { id: SQLID, properties: ND; }[],
        edges: { id: SQLID, properties: ED, source: SQLID, target: SQLID; }[],
    };;