import Ogma from "@linkurious/ogma";
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
      try {
        const { data: schema } = await axios.post<GraphSchema>(
          `graph/${graph}`
        );
        const connector = new Connector();
        showLoader("Loading Graph...");
        hideGraphSelect();
        const rawGraph = await connector.fetchSubGraph();
        await ogma.setGraph(rawGraph);
        hideLoader();
        leftPanel.show();
        return ogma.layouts.force({ locate: true, gpu: true });
      } catch (e) {
        showLoader(`Something went wrong: ${e.message}`);
        throw e;
      }
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
