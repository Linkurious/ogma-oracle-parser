import axios from 'axios';
import { DBSchema, GRAPH_ID, SQL_RESPONSE } from './types';
import { RawNode, RawEdge } from '@linkurious/ogma';

const queryRoute = 'http://localhost:1337/query';

export class Connector<S extends DBSchema>{
  public schema: S;
  constructor(schema: S) {
    this.schema = schema;
  }


  getNodes<
    TableName extends string & keyof S['nodes'],
    NodeData extends S['nodes'][TableName]['properties']
  >(type: TableName, data: SQL_RESPONSE): RawNode<NodeData>[] {
    const { metaData, rows } = data;
    const nodes = rows.map((row: (string | GRAPH_ID)[]) => {
      const node: Partial<RawNode<NodeData>> = { id: '', data: {} };
      metaData.forEach(({ name }) => {
        if (name === 'ID') {
          const { KEY_VALUE, ELEM_TABLE } = row.shift() as GRAPH_ID;
          node[name.toLowerCase() as 'id'] = KEY_VALUE.ID;
          node.data.type = ELEM_TABLE;
        } else {
          node.data[name.toLowerCase() as keyof NodeData] = row.shift() as string;
        }
      })
      return node;
    });
    return nodes as RawNode<NodeData>[];
  }

  getEdges<
    TableName extends string & keyof S['edges'],
    EdgeData extends S['edges'][TableName]['properties']
  >(type: TableName, data: SQL_RESPONSE): RawEdge<EdgeData>[] {
    const { metaData, rows } = data;
    const edges = rows.map((row: (string | GRAPH_ID)[]) => {
      const edge: Partial<RawEdge<EdgeData>> = { source: '', edge: '', data: {} };
      metaData.forEach(({ name }) => {
        if (name === 'SOURCE' || name === 'TARGET' || name === 'ID') {
          const { KEY_VALUE, ELEM_TABLE } = row.shift() as GRAPH_ID;
          edge[name.toLowerCase()] = +KEY_VALUE.ID;
          if (name === 'ID') {
            edge.data.type = ELEM_TABLE;
          }
        } else {
          edge.data[name.toLowerCase()] = row.shift() as string;
        }
      })
      return edge;
    });
    return edges;
  }

  fetchNodesByType<
    TableName extends string & keyof S['nodes'],
    NodeData extends S['nodes'][TableName]['properties']
  >(type: TableName,): Promise<RawNode<NodeData>[]> {

    const keys = Object.keys(this.schema.nodes[type].properties);
    const sql = `select * 
    from graph_table (
      openflights_graph
      match (v is ${type})
      columns (
        VERTEX_ID(v) as id
        ${keys.map((key) => `,v.${key} as ${key}`).join('')}
      )
    )`;
    return axios.post(queryRoute, {
      sql
    })
      .then(({ data }) => this.getNodes(type, data))

  }
  fetchEdgesByType<
    TableName extends string & keyof S['edges'],
    NodeData extends S['edges'][TableName]['properties']
  >(type: TableName,): Promise<RawNode<NodeData>[]> {

    const keys = Object.keys(this.schema.edges[type].properties);
    const sql = `select *
    from graph_table (
      openflights_graph
      match (v1)<-[e is ${type}]->(v2)
      columns (
        EDGE_ID(e) as id,
        VERTEX_ID(v1) as source,
        VERTEX_ID(v2) as target
        ${keys.map((key) => `,e.${key} as ${key}`).join('')}
      )
    )`;
    return axios.post(queryRoute, {
      sql
    })
      .then(({ data }) => this.getEdges(type, data))

  }

  expand(nodeId: number) {
    const neighborType = 'airport';
    const edgeType = 'route';
    const nodeKeys = Object.keys(this.schema.nodes[neighborType].properties);
    const edgeKeys = Object.keys(this.schema.edges[edgeType].properties);
    const name = ogma.getNode(nodeId).getData('name')
    const sql = `select *
    from graph_table (
      openflights_graph
      match (v1)<-[e]->(v2 is ${neighborType})
      where (v1.name = '${name}')
      columns (
        EDGE_ID(e) as edgeId,
        VERTEX_ID(v2) as target
        ${nodeKeys.map((key) => `,v2.${key} as NODE${key}`).join('')}
        ${edgeKeys.map((key) => `,e.${key} as EDGE${key}`).join('')}
      )
    )`;
      console.log(sql);
      window.sql = sql;
    return axios.post(queryRoute, {
      sql
    })
      .then(({ data }) => {
        const nodes = [];
        const edges = [];
        const { rows, metaData } = data;
        const properties = metaData.slice(2);
        for (let i = 0; i < rows.length; i++) {
          const row = rows[i];
          const edgeId = row[0] as GRAPH_ID;
          const neighborId = row[1] as GRAPH_ID;
          const edge = {
            id: edgeId.KEY_VALUE.ID, source: nodeId, target: neighborId.KEY_VALUE.ID, data: {
              type: edgeId.ELEM_TABLE
            }
          };
          const node = {
            id: neighborId.KEY_VALUE.ID, data: {
              type: neighborId.ELEM_TABLE
            }
          };
          for (let j = 0; j < properties.length; j++) {
            const { name } = properties[j];
            if (name.startsWith('NODE')) {
              node.data[name.substring(4).toLowerCase()] = row[j + 2];
            }
            if (name.startsWith('EDGE')) {
              edge.data[name.substring(4).toLowerCase()] = row[j + 2];
            }
          }
          nodes.push(node);
          edges.push(edge);
        }

        return {
          nodes, edges
        };
      });
  }
}