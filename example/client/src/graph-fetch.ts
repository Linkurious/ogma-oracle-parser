import axios from 'axios';
import { DBSchema } from './types';
import { RawNode, RawEdge } from '@linkurious/ogma/umd';
import { parse, OracleResponse, rawIdFromId } from "@linkurious/ogma-oracle-parser";

export class Connector<S extends DBSchema>{
  public schema: S;
  constructor(schema: S) {
    this.schema = schema;
  }

  fetchNodesByType<
    TableName extends string & keyof S['nodes'],
    NodeData extends S['nodes'][TableName]['properties']
  >(type: TableName,): Promise<RawNode<NodeData>[]> {
    return axios.get(`http://localhost:1337/nodes/${type}`)
      .then(({ data }) => {
        const { nodes } = data;
        return nodes;
      });
  }

  fetchEdgesByType<
    TableName extends string & keyof S['edges'],
    EdgeData extends S['edges'][TableName]['properties']
  >(type: TableName,): Promise<RawEdge<EdgeData>[]> {
    return axios.get(`http://localhost:1337/edges/${type}`)
      .then(({ data }) => {
        const { edges } = data;
        return edges;
      });
  };

  getJSON<ND = unknown, ED = unknown>(query: string) {
    const sql = `SELECT CUST_SQLGRAPH_JSON('${query}', 0, 32000) AS COLUMN_ALIAS FROM DUAL`;
    // const queryTest = query.replaceAll(/\'\'/g, `'`).replaceAll(/[\n|\t| ]+/g, ' ')
    // console.log(queryTest);
    // console.log(sql.replaceAll(/\'\'/g, `'`).replaceAll(/[\n|\t| ]+/g, ' '));
    // axios.post(queryRoute, {
    //   sql: queryTest,
    // })
    //   .then(({ data }) => {
    //     console.log(data);
    //   });
    return axios.post<{ data: OracleResponse<ND, ED>; }>(clobRoute, {
      sql,
    })
      .then(({ data }) => {
        const { vertices, edges } = data;
        return parse({ vertices, edges });
      });
  }

  test() {
    return axios.get('http://localhost:1337/expand/1');
  }

  expand(nodeId: string) {
    return axios.get(`http://localhost:1337/expand/${nodeId}`)
      .then(({ data }) => { return data; });
  }
}