import express from 'express';
import bodyParser from 'body-parser';
import oracledb, { Connection, Lob } from 'oracledb';
import cors from 'cors';
import dbConfig from './config';
import { RawEdge, RawNode } from '../../../../ogma/dist/ogma';
import { OracleResponse, indexFromId, parse, tableFromId } from '@linkurious/ogma-oracle-parser';
const { user, password, connectString } = dbConfig;

function readClob<T = unknown>(clob: Lob) {
  return new Promise<T>((resolve, reject) => {
    let myclob = "";
    clob.setEncoding('utf8');
    clob.on('error', (err) => {
      reject(err);
    });
    clob.on('data', (chunk) => {
      myclob += chunk;
    });
    clob.on('end', () => {
      clob.destroy();
    });
    clob.on('close', () => {
      resolve(JSON.parse(myclob));
    });
  });
}

async function getJSON<ND = unknown, ED = unknown>(query: string, conn: Connection) {
  let pageLength = 32000;
  let startPage = 0;
  let hasFinised = false;
  const nodes: RawNode<ND>[] = [];
  const edges: RawEdge<ED>[] = [];

  while (!hasFinised) {
    await conn.execute<Lob[]>(`SELECT CUST_SQLGRAPH_JSON('${query}', ${startPage}, ${pageLength}) AS COLUMN_ALIAS FROM DUAL`)
      .then(result => {
        if (!result.rows) {
          console.log('no rows');
          hasFinised = true;
          return Promise.resolve();
        }
        return readClob<OracleResponse<ND, ED> & { numResults: number; }>(result.rows[0][0])
          .then((result) => {
            const { nodes: ns, edges: es } = parse(result);
            for (let i = startPage === 0 ? 0 : 1; i < ns.length; i++) {
              nodes.push(ns[i]);
            }
            for (let i = startPage === 0 ? 0 : 1; i < es.length; i++) {
              edges.push(es[i]);
            }
            startPage += pageLength;
            // TODO: handle pagination properlly, waiting for oracle answer
            hasFinised = true;
            // if (result.numResults < startPage * pageLength) {
            //   pageLength = result.numResults - startPage;
            // }
            // if (result.numResults < pageLength * startPage) {
            //   hasFinised = true;
            // }
          });
      });
  }
  return { nodes, edges };
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
        console.log(req.params.id, table, index);
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
        console.log(query);
        return getJSON(query, conn)
          .then(r => res.json(r));
      });

      app.get('/node/:id', (req, res) => {
        const table = tableFromId(req.params.id);
        const index = indexFromId(req.params.id);
        console.log(table, index);
        const query = `select v
          from graph_table (
            openflights_graph
            match (v1 is ${table})
            where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ''${index}'')
            columns (
              VERTEX_ID(v1) as v
            )
          )`;
        return getJSON(query, conn)
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
        return getJSON(query, conn)
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
        return getJSON(query, conn)
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
        console.log(query);
        return getJSON(query, conn)
          .then(r => res.json(r));
      });
    });
  return app;
}

