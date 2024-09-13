import {
  rowId,
  getRawGraph,
  labelFromId,
} from "@linkurious/ogma-oracle-parser";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import oracledb from "oracledb";
import path from "path";
import dbConfig from "./config";

const { user, password, connectString } = dbConfig;

const labelMap = new Map([["CITIE", "CITY"]]);
export default function createApp() {
  const app = express();
  oracledb
    .getConnection({
      user,
      password,
      connectString,
    })
    .then((conn) => {
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(
        cors({
          origin: "*",
        })
      );
      app.use(
        "/",
        express.static(path.resolve(__dirname, "../../client/dist"))
      );
      app.get("/expand/:id", (req, res) => {
        const label =
          labelMap.get(labelFromId(req.params.id)) ||
          labelFromId(req.params.id);
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
        const label = labelFromId(req.params.id);
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
      app.get("/edge/:id", (req, res) => {
        const label = labelFromId(req.params.id);
        const index = rowId(req.params.id);
        const query = `select e
          from graph_table (
            openflights_graph
            match ()-[e1 is ${label}]-()
            where (JSON_VALUE(EDGE_ID(e1), ''$.KEY_VALUE.ID'') = ''${index}'')
            columns (
              EDGE_ID(e1) as e
            )
          )`;
        return getRawGraph({ query, conn }).then((r) => res.json(r));
      });
      app.get(
        "/edges/:type/:pageStart?/:pageLength?/:maxResults?",
        (req, res) => {
          const { type, pageStart, pageLength, maxResults } = req.params;
          const query = `select e
          from graph_table (
            openflights_graph
            match ()-[e1 is ${type}]-()
            columns (
              EDGE_ID(e1) as e
            )
          )`;

          return getRawGraph({
            query,
            conn,
            maxResults: +maxResults,
            pageStart: +pageStart,
            pageLength: +pageLength,
          }).then((r) => res.json(r));
        }
      );
      app.get("/nodes/:type", (req, res) => {
        const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
        return getRawGraph({ query, conn }).then((r) => res.json(r));
      });
    });
  return app;
}
