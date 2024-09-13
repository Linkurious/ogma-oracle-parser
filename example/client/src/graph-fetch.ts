import { RawNode, RawEdge, RawGraph } from "@linkurious/ogma/umd";
import axios from "axios";
import { DBSchema } from "./types";

export class Connector<S extends DBSchema> {
  public schema: S;
  constructor(schema: S) {
    this.schema = schema;
  }

  fetchNodesByType<
    TableName extends string & keyof S["nodes"],
    NodeData extends S["nodes"][TableName]["properties"],
  >(type: TableName): Promise<RawNode<NodeData>[]> {
    return axios.get(`http://localhost:1337/nodes/${type}`).then(({ data }) => {
      const { nodes } = data;
      return nodes;
    });
  }

  fetchEdgesByType<
    TableName extends string & keyof S["edges"],
    EdgeData extends S["edges"][TableName]["properties"],
  >(type: TableName): Promise<RawEdge<EdgeData>[]> {
    return axios
      .get(`http://localhost:1337/edges/${type}/1/5000/5000`)
      .then(({ data }) => {
        const { edges } = data;
        return edges;
      });
  }
  expand(nodeId: string) {
    return axios
      .get<RawGraph>(`http://localhost:1337/expand/${nodeId}`)
      .then(({ data }) => {
        return data;
      });
  }
}
