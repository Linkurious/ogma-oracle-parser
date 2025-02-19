import Ogma from "@linkurious/ogma";
import axios from "axios";
import { Connector } from "./graph-fetch";
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
      await axios.post(`graph/${graph}`);
      const connector = new Connector();

      return Promise.all([
        connector.fetchNodesByType("city"),
        connector.fetchNodesByType("airport"),
      ])
        .then(([cities, airports]) =>
          Promise.all([ogma.addNodes(cities), ogma.addNodes(airports)])
        )
        .then(() => {
          showLoader("Loading Routes");
          hideGraphSelect();
          return Promise.all([
            connector.fetchEdgesByType("located_in"),
            connector.fetchEdgesByType("route"),
          ]);
        })
        .then(([located, route]) => {
          hideLoader();
          return ogma.addEdges(located.concat(route), { ignoreInvalid: true });
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
