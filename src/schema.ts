import { Connection } from "oracledb";
import { EdgeSchema, Schema } from "./types";

function SQLTypeToType(type: string) {
  if (type.includes("NUMBER")) {
    return "number";
  }
  if (type.includes("VARCHAR")) {
    return "string";
  }
  if (type.includes("DATE")) {
    return "date";
  }
  if (type.includes("BOOLEAN")) {
    return "boolean";
  }
  return "string";
}
/**
 * Generates a schema from the database
 * @param conn Connection The connection to use
 * @returns A [Schema](/api/modules.html#schema) representing the graphs in the database
 */
export async function generateSchema(conn: Connection): Promise<Schema> {
  const schema: Schema = {};
  const { rows: elements } = await conn.execute<
    [string, string, string, string, string, string, string]
  >(
    `
    SELECT 
    e.graph_name,
    e.element_name,
    e.element_kind,
    l.label_name,
    e.object_owner,
    e.object_name,
    k.column_name AS key_column
FROM USER_PG_ELEMENTS e
JOIN USER_PG_ELEMENT_LABELS l 
    ON e.element_name = l.element_name
JOIN USER_PG_KEYS k 
    ON e.graph_name = k.graph_name 
    AND e.element_name = k.element_name`
  );

  elements?.forEach((row) => {
    const [graphName, elementName, elementKind, label, owner, name, keyColumn] =
      row;
    if (!schema[graphName]) {
      schema[graphName] = {
        vertices: [],
        edges: [],
        edgeMap: new Map(),
        labelToElement: new Map(),
        elementNameToLabel: new Map(),
        verticeMap: new Map(),
      };
    }
    const graph = schema[graphName];
    graph.elementNameToLabel.set(elementName, label);
    if (elementKind === "VERTEX") {
      const vertex = {
        graphName,
        elementName,
        label,
        owner,
        name,
        keyColumn,
        properties: {},
        propertiesType: {},
      };
      graph.vertices.push(vertex);
      graph.verticeMap.set(elementName, vertex);
      graph.labelToElement.set(label, vertex);
    } else {
      const edge = {
        graphName,
        elementName,
        label,
        owner,
        name,
        keyColumn,
        properties: {},
        propertiesType: {},
      } as EdgeSchema;
      graph.edges.push(edge);
      graph.edgeMap.set(elementName, edge);
      graph.labelToElement.set(label, edge);
    }
  });
  // Find the column and alias for each
  const { rows: definitions } = await conn.execute<
    [string, string, string, string, string]
  >(
    `
SELECT 
    p.GRAPH_NAME,
    p.ELEMENT_NAME,
    p.PROPERTY_NAME,
    p.COLUMN_NAME,
    l.DATA_TYPE
FROM USER_PG_PROP_DEFINITIONS p
LEFT JOIN USER_PG_LABEL_PROPERTIES l
    ON p.GRAPH_NAME = l.GRAPH_NAME
    AND p.PROPERTY_NAME = l.PROPERTY_NAME`
  );
  definitions?.forEach((row) => {
    const [graphName, elementName, propertyName, columnName, dataType] = row;
    const graph = schema[graphName];
    if (!graph) {
      return;
    }
    const element =
      graph.verticeMap.get(elementName) || graph.edgeMap.get(elementName);
    element!.properties[propertyName] = columnName;
    element!.propertiesType[propertyName] = SQLTypeToType(dataType);
  });
  // set source and destination
  const { rows: sourceDest } = await conn.execute<
    [string, string, string, string, string, string]
  >(`SELECT 
      GRAPH_NAME,EDGE_TAB_NAME,VERTEX_TAB_NAME,EDGE_END,EDGE_COL_NAME,VERTEX_COL_NAME 
      from ALL_PG_EDGE_RELATIONSHIPS`);
  sourceDest?.forEach((row) => {
    const [
      graphName,
      edgeTabName,
      vertexTable,
      edgeEnd,
      edgeColName,
      vertexColumn,
    ] = row;
    const graph = schema[graphName];
    if (!graph) {
      return;
    }
    const edge = graph.edgeMap.get(edgeTabName);
    if (!edge) {
      return;
    }
    edge[edgeEnd.toLowerCase() as "source" | "destination"] = {
      vertexTable,
      edgeColName,
      vertexColumn,
    };
  });
  return schema;
}
