import { getRawGraph, rowId } from "@linkurious/ogma-oracle-parser";
import { Express } from "express";
import { Connection } from "oracledb";
import { state } from "../state";

export async function nodes(app: Express, conn: Connection) {
  app.get("/expand/:id", (req, res) => {
    const label = state.idToLabel(req.params.id);
    const index = rowId(req.params.id);
    const query = `select v, e
      from graph_table (
          openflights_graph
          match (v1 is ${label})-[e]-(v2)
          where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ${index})
          columns (
            VERTEX_ID(v2) as v,
            EDGE_ID(e) as e
            )
        )`;
    return getRawGraph({ query, conn }).then((r) => res.json(r));
  });

  app.get("/node/:id", (req, res) => {
    const label = state.idToLabel(req.params.id);
    const index = rowId(req.params.id);
    const query = `select v
        from graph_table (
          openflights_graph
          match (v1 is ${label})
          where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ''${index}'')
          columns (
            VERTEX_ID(v1) as v
          )
        )`;
    return getRawGraph({ query, conn }).then((r) => res.json(r));
  });

  app.get("/nodes/:type", (req, res) => {
    const maxResults = 300;
    const query = `select v
        from graph_table (
          openflights_graph
          match (v1 is ${req.params.type})
          columns (
            VERTEX_ID(v1) as v
          )
        )
          OFFSET 0 ROWS FETCH NEXT ${maxResults} ROWS ONLY  
        `;
    return getRawGraph({ query, conn, maxResults: 300 }).then((r) =>
      res.json(r)
    );
  });
}
