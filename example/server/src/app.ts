import express from 'express';
import bodyParser from 'body-parser';
import oracledb, { Connection, Lob } from 'oracledb';
import cors from 'cors';
import dbConfig from './config';
import { indexFromId, parseLob, tableFromId } from '@linkurious/ogma-oracle-parser';
const { user, password, connectString } = dbConfig;

function getRawGraph<ND = unknown, ED = unknown>(query: string, conn: Connection, pageStart = 0, pageLength = 32000) {
  return conn.execute<Lob[]>(`SELECT CUST_SQLGRAPH_JSON('${query}', ${pageStart}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`)
    .then(result => {
      const { numResults, nodes, edges } = parseLob(result.rows[0][0]);
      // TODO: Handle pagination
      return { nodes, edges };
    });
}


export default function createApp() {
  const app = express();
  oracledb.getConnection({
    user,
    password,
    connectString,
  })
    .then((conn) => {
      app.use(bodyParser.urlencoded({ extended: true }));
      app.use(bodyParser.json());
      app.use(cors());
      app.get('/expand/:id', (req, res) => {
        const table = tableFromId(req.params.id);
        const index = indexFromId(req.params.id);
        const query = `select v, e
          from graph_table (
            openflights_graph
            match (v1 is ${table})<-[e]->(v2)
            where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ${index})
            columns (
              VERTEX_ID(v2) as v,
              EDGE_ID(e) as e
              )
          )`;
        return getRawGraph(query, conn)
          .then(r => res.json(r));
      });

      app.get('/node/:id', (req, res) => {
        const table = tableFromId(req.params.id);
        const index = indexFromId(req.params.id);
        const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${table})
            where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ''${index}'')
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
        return getRawGraph(query, conn)
          .then(r => res.json(r));
      });
      app.get('/edge/:id', (req, res) => {
        const table = tableFromId(req.params.id);
        const index = indexFromId(req.params.id);
        const query = `select e
          from graph_table (
            openflights_graph
            match [e1 is ${table}]
            where (JSON_VALUE(EDGE_ID(e1), ''$.KEY_VALUE.ID'') = ''${index}'')
            columns (
              EDGE_ID(e1) as e
            )
          )`;
        return getRawGraph(query, conn)
          .then(r => res.json(r));
      });
      app.get('/edges/:type', (req, res) => {
        const query = `select e
          from graph_table (
            openflights_graph
            match ()-[e1 is ${req.params.type}]-()
            columns (
              EDGE_ID(e1) as e
            )
          )`;
        return getRawGraph(query, conn)
          .then(r => res.json(r));
      });
      app.get('/nodes/:type', (req, res) => {
        const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${req.params.type})
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
        return getRawGraph(query, conn)
          .then(r => res.json(r));
      });
    });
  return app;
}

