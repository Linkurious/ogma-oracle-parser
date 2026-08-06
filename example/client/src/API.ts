import { RawNode, RawEdge } from "@linkurious/ogma";
import axios from "axios";
import { GraphTypeMap } from "./graph-types";

export class API {
  static fetchNodesByType<
    T extends keyof GraphTypeMap,
    NT extends keyof GraphTypeMap[T]["nodeLabels"],
  >(type: NT): Promise<RawNode<GraphTypeMap[T]["nodeLabels"]>[]> {
    return axios.get(`nodes/${String(type)}`).then(({ data }) => data.nodes);
  }
  static fetchEdgesByType<
    T extends keyof GraphTypeMap,
    ET extends keyof GraphTypeMap[T]["edgeLabels"],
  >(type: ET): Promise<RawEdge<GraphTypeMap[T]["edgeLabels"]>[]> {
    return axios
      .get(`edges/${String(type)}/4000/1000`)
      .then(({ data }) => data.edges);
  }
  static expand<T extends keyof GraphTypeMap>(nodeId: string) {
    return axios
      .get<GraphTypeMap[T]["graph"]>(`expand/${nodeId}`)
      .then(({ data }) => {
        return data;
      });
  }
  static fetchSubGraph<T extends keyof GraphTypeMap>() {
    return axios.get<GraphTypeMap[T]["graph"]>(`nodes`).then(({ data }) => {
      return data;
    });
  }
}
