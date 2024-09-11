import { RawNode, RawEdge } from "@linkurious/ogma";
import axios from "axios";
import { NodeData, EdgeData, NodeType, EdgeType } from "./types";

export class Connector {
  constructor() {}

  fetchNodesByType<T extends NodeType>(
    type: T
  ): Promise<RawNode<NodeData<T>>[]> {
    return axios
      .get(`http://localhost:1337/nodes/${type}`)
      .then(({ data }) => data.nodes);
  }

  fetchEdgesByType<T extends EdgeType>(
    type: T
  ): Promise<RawEdge<EdgeData<T>>[]> {
    return axios
      .get(`http://localhost:1337/edges/${type}/4000/1000`)
      .then(({ data }) => data.edges);
  }
  expand(nodeId: string) {
    return axios
      .get(`http://localhost:1337/expand/${nodeId}`)
      .then(({ data }) => {
        return data;
      });
  }
}
