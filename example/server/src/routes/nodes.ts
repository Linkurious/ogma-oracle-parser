import { getRawGraphFromSchema, rowId } from "@linkurious/ogma-oracle-parser";
import { Express } from "express";
import { state } from "../state";

export async function nodes(app: Express) {
  app.get("/expand/:id", (req, res) => {
    const label = state.idToLabel(req.params.id);
    const index = rowId(req.params.id);
    const idColumn = state.getIdColumn(label);
    const conn = state.getConnection();
    const schema = state.getSchema();
    const query = `select v, e
      from graph_table (
          ${state.getGraphName()}
          match (v1 is ${label})-[e]-(v2)
          where (JSON_VALUE(VERTEX_ID(v1), '$.KEY_VALUE.${idColumn}') = ${index})
          columns (
            VERTEX_ID(v2) as v,
            EDGE_ID(e) as e
            )
        )`;
    // @ts-ignore
    return getRawGraphFromSchema({ query, conn, schema }).then((r) =>
      res.json(r)
    );
  });

  app.get("/node/:id", (req, res) => {
    const label = state.idToLabel(req.params.id);
    const idColumn = state.getIdColumn(label);
    const index = rowId(req.params.id);
    const conn = state.getConnection();
    const schema = state.getSchema();
    const query = `select v
        from graph_table (
          ${state.getGraphName()}
          match (v1 is ${label})
          where (JSON_VALUE(VERTEX_ID(v1), '$.KEY_VALUE.${idColumn}') = '${index}')
          columns (
            VERTEX_ID(v1) as v
          )
        )`;
    // @ts-ignore
    return getRawGraphFromSchema({ query, conn, schema }).then((r) =>
      res.json(r)
    );
  });

  app.get("/nodes/:type", (req, res) => {
    const maxResults = 5;
    const conn = state.getConnection();
    const schema = state.getSchema();
    const query = `select v
        from graph_table (
          ${state.getGraphName()}
          match (v1 is ${req.params.type})
          columns (
            VERTEX_ID(v1) as v
          )
        )
          OFFSET 0 ROWS FETCH NEXT ${maxResults} ROWS ONLY  
        `;
    // @ts-ignore
    return getRawGraphFromSchema({ query, conn, schema }).then((r) =>
      res.json(r)
    );
  });

  app.get("/nodes", (req, res) => {
    const maxResults = 5;
    const conn = state.getConnection();
    const schema = state.getSchema();
    const query = `select v1, v2, e
        from graph_table (
          ${state.getGraphName()}
          match (v1)-[e]-(v2)
          columns (
            VERTEX_ID(v1) as v1,
            VERTEX_ID(v2) as v2,
            EDGE_ID(e) as e
          )
        )
          OFFSET 0 ROWS FETCH NEXT ${maxResults} ROWS ONLY  
        `;
    // @ts-ignore
    return getRawGraphFromSchema({ query, conn, schema }).then((r) =>
      res.json(r)
    );
  });
}
