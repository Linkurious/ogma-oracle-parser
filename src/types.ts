import { RawEdge, RawNode } from "@linkurious/ogma";

/**
 * Label set in create property graph query
 */
export type Label = string;
/**
 * Row ID of a node or edge in the database
 */
export type RowId = number;
/**
 * ID Format used by CUST_SQLGRAPH_JSON
 *  - Label is the label set in create property graph query
 *  - RowId is the rowid of the node or edge in the database
 */
export type SQLID = `${Label}{"ID":${RowId}}`;

/**
 * Function used within [parse functions](/api/classes/OgmaOracleParser.html#parse)
 * to generate the id of a node or edge from its SQLID
 */
export type SQLIDtoIdFn = (id: SQLID) => string;
/**
 * Function to transform back a string id to a SQL ID
 */
export type SQLIDfromIdFn = (id: string) => SQLID;
export type parseFn<ND = unknown, ED = unknown> = (
  opts: OracleResponse<ND, ED>
) => { nodes: RawNode<ND>[]; edges: RawEdge<ED>[] };
export type ParserOptions<ND, ED> = {
  SQLIDtoId?: SQLIDtoIdFn;
  SQLIDfromId?: SQLIDfromIdFn;
  rowId?: (id: string) => string;
  eltNameFromId?: (id: string) => string;
  parseFn?: parseFn<ND, ED>;
};

/**
 * Object returned by CUST_SQLGRAPH_JSON function
 */
export type OracleResponse<
  ND = Record<string, unknown>,
  ED = Record<string, unknown>,
> = {
  vertices: { id: SQLID; properties: ND }[];
  edges: { id: SQLID; properties: ED; source: SQLID; target: SQLID }[];
};

export type VerticeSchema = {
  graphName: string;
  elementName: string;
  label: string;
  keyColumn: string;
  owner: string;
  name: string;
  properties: Record<string, string>;
};
export type EdgeSchema = {
  graphName: string;
  elementName: string;
  label: string;
  keyColumn: string;
  owner: string;
  name: string;
  properties: Record<string, string>;
  source: {
    vertexTable: string;
    edgeColName: string;
    vertexColumn: string;
  };
  destination: {
    vertexTable: string;
    edgeColName: string;
    vertexColumn: string;
  };
};
export type GraphSchema = {
  vertices: VerticeSchema[];
  verticeMap: Map<string, VerticeSchema>;
  edges: EdgeSchema[];
  edgeMap: Map<string, EdgeSchema>;
  labelToElement: Map<string, VerticeSchema | EdgeSchema>;
  elementNameToLabel: Map<string, string>;
};
export type Schema = Record<string, GraphSchema>;

export type ElementID = {
  GRAPH_NAME: string;
  ELEM_TABLE: string;
  KEY_VALUE: { ID: number };
};
