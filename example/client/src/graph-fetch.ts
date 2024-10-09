import { RawNode, RawEdge, RawGraph } from "@linkurious/ogma";
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
    return axios.get(`nodes/${type}`).then(({ data }) => data.nodes);
  }

  fetchEdgesByType<
    TableName extends string & keyof S["edges"],
    EdgeData extends S["edges"][TableName]["properties"],
  >(type: TableName): Promise<RawEdge<EdgeData>[]> {
    return axios.get(`edges/${type}/4000/1000`).then(({ data }) => data.edges);
  }
  expand(nodeId: string) {
    return axios.get<RawGraph>(`expand/${nodeId}`).then(({ data }) => {
      return data;
    });
  }
}
