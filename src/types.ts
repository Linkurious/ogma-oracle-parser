import { RawEdge, RawNode } from "@linkurious/ogma";

export type Label = string;
export type RowId = number;
export type SQLID = `${Label}{"ID":${RowId}}`;

export type SQLIDtoIdFn = (id: SQLID) => string;
export type SQLIDFromIdFn = (id: string) => SQLID;
export type parseFn<ND = unknown, ED = unknown> = (opts: OracleResponse<ND, ED>) => { nodes: RawNode<ND>[], edges: RawEdge<ED>[]; };
export type ParserOptions<ND, ED> = {
    SQLIDtoId?: SQLIDtoIdFn;
    SQLIDFromId?: SQLIDFromIdFn;
    rowId?: (id: string) => string;
    labelFromId?: (id: string) => string;
    parseFn?: parseFn<ND, ED>;
};

/**
 * Object returned by CUST_SQLGRAPH_JSON function
 */
export type OracleResponse<
    ND = Record<string, unknown>,
    ED = Record<string, unknown>> =
    {
        vertices: { id: SQLID, properties: ND; }[],
        edges: { id: SQLID, properties: ED, source: SQLID, target: SQLID; }[],
    };;