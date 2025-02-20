import Ogma, { RawNode } from "@linkurious/ogma";
import { GraphSchema } from "@linkurious/ogma-oracle-parser";
import axios from "axios";
import { Connector } from "./graph-fetch";
import { leftPanel } from "./left-panel";
import { hideLoader, showLoader } from "./loader";

export async function setupGraphSelect(element: HTMLDivElement, ogma: Ogma) {
  const { data: graphs } = await axios.get<string[]>(`graphs`);
  const list = document.createElement("div");
  list.classList.add("graphs");
  graphs.forEach((graph) => {
    const item = document.createElement("button");
    item.innerText = graph;
    list.appendChild(item);
    item.addEventListener("click", async () => {
      const { data: schema } = await axios.post<GraphSchema>(`graph/${graph}`);
      const connector = new Connector();
      const nodeTypes = Object.values(schema.vertices).map((v) => v.label);
      const edgeTypes = Object.values(schema.edges).map((e) => e.label);
      showLoader("Loading nodes...");
      hideGraphSelect();
      return Promise.all(
        nodeTypes.map((type) => connector.fetchNodesByType(type))
      )
        .then((nodeLists) =>
          Promise.all(nodeLists.map((nodes) => ogma.addNodes(nodes)))
        )
        .then(() => {
          showLoader("Loading edges...");
          return Promise.all(
            edgeTypes.map((type) => connector.fetchEdgesByType(type))
          );
        })
        .then((edgeTypes) => {
          hideLoader();
          leftPanel.show();
          return Promise.all(
            edgeTypes.map((edges) =>
              ogma.addEdges(edges, { ignoreInvalid: true })
            )
          );
        })
        .then(() => {
          return ogma.layouts.force({ locate: true, gpu: true });
        })
        .catch((e) => {
          showLoader(`Something went wrong: ${e.message}`);
          throw e;
        });
    });
  });
  element.appendChild(list);
}

export function showGraphSelect() {
  const graphs = document.querySelector<HTMLDivElement>(".graphs")!;
  graphs.classList.remove("hidden");
}
export function hideGraphSelect() {
  const graphs = document.querySelector<HTMLDivElement>(".graphs")!;
  graphs.classList.add("hidden");
}
