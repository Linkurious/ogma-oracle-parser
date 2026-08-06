import type {
  EdgeSchema,
  VerticeSchema,
  GraphSchema,
  Schema,
} from "../src/types";

/**
 * Transforms a snake_case string to a camelCase string
 * @param s Input string
 * @param firstUpper Weather the first letter should be upper case
 * @returns The transformed string
 */
function toTypeCase(s: string, firstUpper = true) {
  s = s.toLocaleLowerCase().replace(/_./g, (m) => {
    return m[1].toUpperCase();
  });
  return firstUpper ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}
/**
 * Makes the input string CamelCase and removes the Graph suffix
 * @param s Input string
 * @returns The transformed string
 */
function toGraphName(s: string) {
  return toTypeCase(s).replace(/Graph$/g, "");
}

/**
 * Generates this
 * export type AirportData = {
 *   TIMEZONE: number;
 *   TZDBTIME: string;
 *   DST: string;
 *   NAME: string;
 * };
 */
function getDataType(schema: VerticeSchema | EdgeSchema, tabs = 1) {
  const ts = `\t`.repeat(tabs);
  const t1 = `\t`.repeat(Math.max(tabs - 1, 0));
  const properties = Object.entries(schema.propertiesType);
  const value = properties.length
    ? `{
${properties.map(([key, value]) => `${ts}${key}: ${value}`).join(";\n")}
${t1}}`
    : "Record<string, never>";
  const key = toTypeCase(schema.label);
  return `export type ${key}Data = ${value}`;
}

/**
 * Generates this
 * export interface AirportGraph extends RawGraph {
 *   nodes: RawNode<AirportData | CityData>[];
 *   edges: RawEdge<RouteData>[];
 * }
 */

function getRawGraphType(schema: GraphSchema, label: string, tabs = 1) {
  const ts = `\t`.repeat(tabs);
  const nodes = `${ts}RawNode<${schema.vertices
    .map((s) => `${toTypeCase(s.label)}Data`)
    .join(" | ")}>`;
  const edges = `${ts}RawEdge<${schema.edges
    .map((s) => `${toTypeCase(s.label)}Data`)
    .join(" | ")}>`;
  return `export interface ${toGraphName(label)}Graph extends RawGraph {
${ts}nodes: ${nodes}[];
${ts}edges: ${edges}[];
}`;
}
/**
 * Generates this
 * export type AirportMap = {
 *  graph: AirportGraph;
 *  nodeLabels: {
 *    airport: AirportData;
 *  };
 *  edgeLabels: {
 *   route: RouteData;
 *   located_in: Located_inData;
 *  };
 * };
 */
function getGraphMap(schema: GraphSchema, label: string, tabs = 1) {
  const ts = `\t`.repeat(tabs);
  const t2 = `\t`.repeat(Math.max(tabs + 1, 0));
  const nodes = schema.vertices
    .map(
      (s) => `${t2}${toTypeCase(s.label, false)}: ${toTypeCase(s.label)}Data;`
    )
    .join("\n");
  const edges = schema.edges
    .map(
      (s) => `${t2}${toTypeCase(s.label, false)}: ${toTypeCase(s.label)}Data;`
    )
    .join("\n");
  return `export type ${toGraphName(label)}Map = {
${ts}graph: ${toGraphName(label)}Graph;
${ts}nodeLabels: {
${nodes}
${ts}};
${ts}edgeLabels: {
${edges}
${ts}};
}`;
}

/**
 * Generates this
 * export type GraphTypeMap = {
 * airport: AirportsMap;
 * bank: BankMap;
 * };
 */
export function getGraphsMap(schema: Schema, tabs = 1) {
  const ts = `\t`.repeat(tabs);
  return `export type GraphTypeMap = {
${Object.entries(schema)
  .map(([label, schema]) => {
    return `${ts}${toGraphName(label)}: ${toGraphName(label)}Map;`;
  })
  .join("\n")}
}`;
}

export function generateTypes(schema: Schema) {
  const header = `import { RawNode, RawEdge, RawGraph } from "@linkurious/ogma";`;
  const types = Object.entries(schema).reduce((acc, [label, schema]) => {
    const nodes = schema.vertices.map((s) => getDataType(s)).join("\n");
    const edges = schema.edges.map((s) => getDataType(s)).join("\n");
    const graph = getRawGraphType(schema, label);
    const graphMap = getGraphMap(schema, label);
    return `${acc}
${nodes}
${edges}
${graph}
${graphMap}
`;
  }, "");
  const graphsMap = getGraphsMap(schema);
  return `${header}\n${types}\n${graphsMap}`;
}
