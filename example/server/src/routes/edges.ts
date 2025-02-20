import { getRawGraph, rowId } from "@linkurious/ogma-oracle-parser";
import { Express } from "express";
import { Connection } from "oracledb";
import { state } from "../state";

export async function edges(app: Express, conn: Connection) {
  app.get("/edge/:id", (req, res) => {
    const label = state.idToLabel(req.params.id);
    const index = rowId(req.params.id);
    const idColumn = state.getIdColumn(label);
    const query = `select e
          from graph_table (
          ${state.getGraphName()}
            match ()-[e1 is ${label}]-()
            where (JSON_VALUE(EDGE_ID(e1), ''$.KEY_VALUE.${idColumn}'') = ''${index}'')
            columns (
              EDGE_ID(e1) as e
            )
          )`;
    return getRawGraph({ query, conn }).then((r) => res.json(r));
  });
  app.get("/edges/:type/:pageStart/:maxResults", (req, res) => {
    //TODO: index on database the id column
    const { type, pageStart, maxResults } = req.params;
    const query = `SELECT e
          FROM graph_table (
          ${state.getGraphName()}
            MATCH ()-[e1 IS ${type}]-()
            COLUMNS (
              EDGE_ID(e1) AS e
            )
          )
          OFFSET ${pageStart} ROWS FETCH NEXT ${maxResults} ROWS ONLY`;
    return getRawGraph({
      query,
      conn,
      pageStart: 0,
      maxResults: Number(maxResults),
    }).then((r) => res.json(r));
  });
}
