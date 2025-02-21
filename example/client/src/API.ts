import { RawNode, RawEdge, RawGraph } from "@linkurious/ogma";
import axios from "axios";
import { GraphTypeMap } from "./graph-types";

export class API<T extends keyof GraphTypeMap> {
  fetchNodesByType<NT extends keyof GraphTypeMap[T]["nodeLabels"]>(
    type: NT
  ): Promise<RawNode<GraphTypeMap[T]["nodeLabels"]>[]> {
    return axios.get(`nodes/${String(type)}`).then(({ data }) => data.nodes);
  }
  fetchEdgesByType<ET extends keyof GraphTypeMap[T]["edgeLabels"]>(
    type: ET
  ): Promise<RawEdge<GraphTypeMap[T]["edgeLabels"]>[]> {
    return axios
      .get(`edges/${String(type)}/4000/1000`)
      .then(({ data }) => data.edges);
  }
  expand(nodeId: string) {
    return axios
      .get<GraphTypeMap[T]["graph"]>(`expand/${nodeId}`)
      .then(({ data }) => {
        return data;
      });
  }
  fetchSubGraph() {
    return axios.get<GraphTypeMap[T]["graph"]>(`subgraph`).then(({ data }) => {
      return data;
    });
  }
}
