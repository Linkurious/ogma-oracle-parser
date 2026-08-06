import { Connection, OUT_FORMAT_OBJECT } from "oracledb";
import { EdgeSchema, GraphSchema, Schema } from "./types";

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
    {
      GRAPH_NAME: string;
      ELEMENT_NAME: string;
      ELEMENT_KIND: "VERTEX" | "EDGE";
      LABEL_NAME: string;
      OBJECT_OWNER: string;
      OBJECT_NAME: string;
      KEY_COLUMN: string;
    }
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
    AND e.element_name = k.element_name`,
    [],
    { outFormat: OUT_FORMAT_OBJECT }
  );
  console.log("elements", elements);
  elements?.forEach((row) => {

    const {
      GRAPH_NAME,
      ELEMENT_NAME,
      ELEMENT_KIND,
      LABEL_NAME,
      OBJECT_OWNER,
      OBJECT_NAME,
      KEY_COLUMN,
    } = row;
    // const [graphName, elementName, elementKind, label, owner, name, keyColumn] =
    row;
    if (!schema[GRAPH_NAME]) {
      schema[GRAPH_NAME] = {
        vertices: [],
        edges: [],
        edgeMap: new Map(),
        labelToElement: new Map(),
        elementNameToLabel: new Map(),
        verticeMap: new Map(),
      };
    }
    const graph = schema[GRAPH_NAME];
    graph.elementNameToLabel.set(ELEMENT_NAME, LABEL_NAME);
    if (ELEMENT_KIND === "VERTEX") {
      const vertex = {
        graphName: GRAPH_NAME,
        elementName: ELEMENT_NAME,
        label: LABEL_NAME,
        owner: OBJECT_OWNER,
        name: OBJECT_NAME,
        keyColumn: KEY_COLUMN,
        properties: {},
        propertiesType: {},
      };
      graph.vertices.push(vertex);
      graph.verticeMap.set(ELEMENT_NAME, vertex);
      graph.labelToElement.set(LABEL_NAME, vertex);
    } else {
      const edge = {
        graphName: GRAPH_NAME,
        elementName: ELEMENT_NAME,
        label: LABEL_NAME,
        owner: OBJECT_OWNER,
        name: OBJECT_NAME,
        keyColumn: KEY_COLUMN,
        properties: {},
        propertiesType: {},
      } as EdgeSchema;
      graph.edges.push(edge);
      graph.edgeMap.set(ELEMENT_NAME, edge);
      graph.labelToElement.set(LABEL_NAME, edge);
    }
  });
  // Find the column and alias for each
  const { rows: definitions } = await conn.execute<
    {
      GRAPH_NAME: string;
      ELEMENT_NAME: string;
      PROPERTY_NAME: string;
      COLUMN_NAME: string;
      DATA_TYPE: string;
    }
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
    AND p.PROPERTY_NAME = l.PROPERTY_NAME`,
    [],
    { outFormat: OUT_FORMAT_OBJECT }
  );
  definitions?.forEach((row) => {
    const {
      GRAPH_NAME,
      ELEMENT_NAME,
      PROPERTY_NAME,
      COLUMN_NAME,
      DATA_TYPE,
    } = row;
    // const [graphName, elementName, propertyName, columnName, dataType] =
    //   row;
    const graph = schema[GRAPH_NAME];
    if (!graph) {
      return;
    }
    const element =
      graph.verticeMap.get(ELEMENT_NAME) || graph.edgeMap.get(ELEMENT_NAME);
    element!.properties[PROPERTY_NAME] = COLUMN_NAME;
    element!.propertiesType[PROPERTY_NAME] = SQLTypeToType(DATA_TYPE);
  });
  // set source and destination
  const { rows: sourceDest } = await conn.execute<
    {
      GRAPH_NAME: string;
      EDGE_TAB_NAME: string;
      VERTEX_TAB_NAME: string;
      EDGE_END: "SOURCE" | "DESTINATION";
      EDGE_COL_NAME: string;
      VERTEX_COL_NAME: string;
    }
  >(
    `SELECT 
      GRAPH_NAME,EDGE_TAB_NAME,VERTEX_TAB_NAME,EDGE_END,EDGE_COL_NAME,VERTEX_COL_NAME 
      from ALL_PG_EDGE_RELATIONSHIPS`,
    [],
    { outFormat: OUT_FORMAT_OBJECT }
  );
  sourceDest?.forEach((row) => {
    const {
      GRAPH_NAME,
      EDGE_TAB_NAME,
      VERTEX_TAB_NAME,
      EDGE_END,
      EDGE_COL_NAME,
      VERTEX_COL_NAME,
    } = row;
    const graph = schema[GRAPH_NAME];
    if (!graph) {
      return;
    }
    const edge = graph.edgeMap.get(EDGE_TAB_NAME);
    if (!edge) {
      return;
    }
    edge[EDGE_END.toLowerCase() as "source" | "destination"] = {
      vertexTable: VERTEX_TAB_NAME,
      edgeColName: EDGE_COL_NAME,
      vertexColumn: VERTEX_COL_NAME,
    };
  });
  return schema;
}

export function parseSchema(str: string | Record<string, unknown>) {
  const schema = typeof str === "string" ? JSON.parse(str) : str;
  let graphSchemas: GraphSchema[];
  if (schema.vertices) {
    graphSchemas = [schema as GraphSchema];
  } else {
    graphSchemas = Object.values(schema);
  }

  graphSchemas.forEach((graphSchema) => {
    graphSchema.elementNameToLabel = new Map();
    graphSchema.labelToElement = new Map();
    graphSchema.edgeMap = new Map();
    graphSchema.verticeMap = new Map();
    graphSchema.vertices.forEach((vertex) => {
      graphSchema.elementNameToLabel.set(vertex.elementName, vertex.label);
      graphSchema.labelToElement.set(vertex.label, vertex);
      graphSchema.verticeMap.set(vertex.elementName, vertex);
    });
    graphSchema.edges.forEach((edge) => {
      graphSchema.elementNameToLabel.set(edge.elementName, edge.label);
      graphSchema.labelToElement.set(edge.label, edge);
      graphSchema.edgeMap.set(edge.elementName, edge);
    });
  });
  return schema;
}
