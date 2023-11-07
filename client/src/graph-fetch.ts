import axios from 'axios';
import { DBSchema } from './types';
import { RawNode, RawEdge } from '@linkurious/ogma';

const queryRoute = 'http://localhost:1337/query';
const clobRoute = 'http://localhost:1337/clob-query';

export function rawIdToId(jsonId: string) {
  const match = jsonId.match(/(.*)\{.+:([0-9]+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return `${match[1]}:${match[2]}`;
}

export function indexFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[2];
}
export function tableFromId(id: string) {
  const match = id.match(/(.+):(.+)/);
  if (!match || match.length !== 3) throw new Error('Invalid ID');
  return match[1];
}

export class Connector<S extends DBSchema>{
  public schema: S;
  constructor(schema: S) {
    this.schema = schema;
  }

  fetchNodesByType<
    TableName extends string & keyof S['nodes'],
    NodeData extends S['nodes'][TableName]['properties']
  >(type: TableName,): Promise<RawNode<NodeData>[]> {
    const sql = `select * 
    from graph_table (
      openflights_graph
      match (v is ${type})
      columns (
        VERTEX_ID(v) as node
      )
    )`;
    return this.getJSON(sql)
      .then(({ nodes }) => nodes);
  }

  fetchEdgesByType<
    TableName extends string & keyof S['edges'],
    EdgeData extends S['edges'][TableName]['properties']
  >(type: TableName,): Promise<RawEdge<EdgeData>[]> {
    const sql = `select e1
    from graph_table (
      openflights_graph
      match ()-[e is ${type}]-()
      columns (
        EDGE_ID(e) as e1
      )
    ) fetch first 32767 rows only`;
    // TODO: remove the fetch first 32767 rows only
    // when Oracle will have confirmed wether it is a bug on their side or not
    return this.getJSON(sql)
      .then(({ edges }) => edges);
  }

  getJSON(query: string) {
    const sql = `
    SELECT CUST_SQLGRAPH_JSON('${query}') AS COLUMN_ALIAS FROM DUAL`;
    const queryTest = query.replaceAll(/\'\'/g, `'`).replaceAll(/[\n|\t| ]+/g, ' ')
    console.log(queryTest);
    console.log(sql.replaceAll(/\'\'/g, `'`).replaceAll(/[\n|\t| ]+/g, ' '));
    axios.post(queryRoute, {
      sql: queryTest,
    })
      .then(({ data }) => {
        console.log(data);
      });
    return axios.post(clobRoute, {
      sql,
    })
      .then(({ data }) => {
        const { vertices, edges } = JSON.parse(data);
        console.log(vertices);
        return {
          nodes: vertices.map(({ id: rawId, properties }) => {
            return {
              // Could two vertices have the same ID if they are from different tables?
              id: rawIdToId(rawId),
              data: properties,
            }
          }),
          edges: edges.map(({ id: rawId, properties, source, target }) => {
            return {
              source: rawIdToId(source),
              target: rawIdToId(target),
              id: rawIdToId(rawId),
              data: properties,
            }
          })
        };
      });
  }

  expand(nodeId: number) {
    const query = `select v, e
    from graph_table (
      openflights_graph
      match (v1)<-[e]->(v2)
      where (JSON_VALUE(VERTEX_ID(v1), ''$.KEY_VALUE.ID'') = ''${indexFromId(`${nodeId}`)}'')
      columns (
        VERTEX_ID(v2) as v,
        EDGE_ID(e) as e
        )
    )`;
    return this.getJSON(query)
  }
}