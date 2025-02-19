import {
  getRawGraph,
  eltNameFromId,
  rowId,
  generateSchema,
  getRawGraphFromSchema,
  GraphSchema,
} from "@linkurious/ogma-oracle-parser";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import oracledb from "oracledb";
import path from "path";
import dbConfig from "./config";
import { nodes, edges, graph } from "./routes";
import { state } from "./state";
const { user, password, connectString } = dbConfig;
async function test(conn) {
  try {
    const schema = await generateSchema(conn);
    graphSchema = schema.OPENFLIGHTS_GRAPH;
    const type = "route";
    const maxResults = 10000;
    const query = `select V_ID
from graph_table (
    openflights_graph
    match (v1)-[e IS ${type}]-(v2)
    columns (
        edge_id(e) AS E_ID,
        vertex_id(v2) AS V_ID
    )
)
FETCH FIRST ${maxResults} ROWS ONLY`;
    console.log(`query`, query);
    // const res = await conn.execute<Lob[]>(query);
    // console.log(`res`, JSON.stringify(res.rows, 0, 2));
    console.time("using Direct queries");
    const g2 = await getRawGraphFromSchema({
      query,
      conn,
      schema,
      batch: 50,
    });
    console.log(`nodes: ${g2.nodes.length}, edges: ${g2.edges.length}`);
    console.timeEnd("using Direct queries");
    console.time("using CUST_SQL_TOJSON");
    const g1 = await getRawGraph({
      query,
      conn,
      pageStart: 0,
      maxResults: Number(maxResults),
    });
    console.timeEnd("using CUST_SQL_TOJSON");
    console.log(`nodes: ${g1.nodes.length}, edges: ${g1.edges.length}`);

    console.groupEnd();
  } catch (e) {
    console.error(e);
  }
  return conn;
}

export default async function createApp() {
  const app = express();
  const conn = await oracledb.getConnection({
    user,
    password,
    connectString,
  });
  const schema = await generateSchema(conn);
  state.setSchema(schema);
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use("/", express.static(path.resolve(__dirname, "../../client/dist")));
  nodes(app, conn);
  edges(app, conn);
  graph(app);
  return app;
}
