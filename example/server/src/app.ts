import {
  getRawGraph,
  labelFromId,
  rowId,
  OgmaOracleParser,
} from "@linkurious/ogma-oracle-parser";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import oracledb from "oracledb";
import dbConfig from "./config";
const { user, password, connectString } = dbConfig;

const parser = new OgmaOracleParser({
  schema: {
    nodes: {
      airport: [
        "NAME",
        "IATA",
        "ICAO",
        "AIRPORT_TYPE",
        "LONGITUDE",
        "LATITUDE",
        "ALTITUDE",
        "TIMEZONE",
        "TZDBTIME",
        "DST",
      ],
      city: ["CITY", "COUNTRY"],
    },
    edges: {
      route: [
        "codeshare",
        "airline_id",
        "equipment",
        "stops",
        "distance_in_mi",
        "distance_in_km",
      ],
      located_in: [],
    },
  },
});
const labelMap = new Map([
  ["CITIES", "CITY"],
  ["ROUTES", "ROUTE"],
  ["AIRPORTS", "AIRPORT"],
]);
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
      app.get("/test", async (req, res) => {
        const airportC = parser.getColumns("v1", "airport");
        const routeC = parser.getColumns("e1", "route");
        // const query = `select *
        //   from graph_table (
        //     openflights_graph
        //     match (v1 is ${type})
        //     columns (
        //       VERTEX_ID(v1) as v,
        //       ${parser.columnsToQuery("v1", columns)}
        //     )
        //   )`;
        const query = `select *
          from graph_table (
            openflights_graph
            match (v1 is airport)-[e1 is route]-()
            columns (
              EDGE_ID(e1) as e1,
              VERTEX_ID(v1) as v1,
              ${airportC.join(", ")},
              ${routeC.join(", ")}
            )
          ) FETCH FIRST 10 ROWS ONLY`;
        return parser
          .getRawGraph2({
            query,
            conn,
            columns: [],
            vertex: ["v1"],
            edges: ["e1"],
          })
          .then((r) => res.json(r));
      });
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
      app.get("/edges/:type/:pageStart/:pageLength", (req, res) => {
        const { type, pageStart, pageLength } = req.params;
        const query = `SELECT e
          FROM graph_table (
            openflights_graph
            MATCH ()-[e1 IS ${type}]-()
            COLUMNS (
              EDGE_ID(e1) AS e
            )
          )
          OFFSET ${pageStart} ROWS FETCH NEXT ${pageLength} ROWS ONLY`;
        return getRawGraph({
          query,
          conn,
        }).then((r) => res.json(r));
      });
      app.get("/nodes/:type", (req, res) => {
        const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
        return getRawGraph({ query, conn, maxResults: 300 }).then((r) =>
          res.json(r)
        );
      });
    });
  return app;
}
