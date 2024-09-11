import Ogma from "@linkurious/ogma";
import { labelFromId } from "@linkurious/ogma-oracle-parser";
import { Connector } from "./graph-fetch";
import { icons } from "./icons";
import { LeftPanel } from "./left-panel";
import { showLoader, hideLoader } from "./loader";
import { NodeData, EdgeData } from "./types";

const leftPanelRoot = document.createElement("div");
leftPanelRoot.classList.add("left-panel");
const leftPanel = new LeftPanel(leftPanelRoot);
const fontName = "Font Awesome 6 Free";
const connector = new Connector();
export function setupOgma(element: HTMLDivElement) {
  const ogma = new Ogma<
    NodeData<"city"> | NodeData<"airport">,
    EdgeData<"route"> | EdgeData<"located_in">
  >({
    container: element,
  });
  ogma.styles.addNodeRule({
    color: (node) =>
      labelFromId(`${node.getId()}`) === "CITIES" ? "#dbd3ad" : "#d36060",
    icon: {
      font: fontName,
      color: "white",
      content: (n) => icons[n.getData("type")],
      scale: 0.75,
    },
    text: {
      content: (n) =>
        labelFromId(`${n.getId()}`) === "CITIES"
          ? n.getData("CITY")
          : n.getData("IATA"),
      size: 15,
      padding: 10,
      minVisibleSize: 2,
    },
  });
  const highlighted = ogma.styles.createClass({
    name: "highlighted",
    nodeAttributes: {
      radius: 10,
      outerStroke: {
        color: "black",
        width: 2,
      },
    },
    edgeAttributes: {
      color: "black",
      width: 2,
    },
  });
  ogma.layers.addLayer(leftPanelRoot);
  ogma.events.on("doubleclick", (evt) => {
    if (!evt.target || !evt.target.isNode) return;
    const nodeId = evt.target.getId() as string;
    highlighted.clearNodes();
    highlighted.clearEdges();
    connector.expand(nodeId).then(({ nodes, edges }) => {
      const nodeIds = nodes.map((n) => n.id);
      const edgeIds = edges.map((e) => e.id);
      return ogma
        .addNodes(nodes, { ignoreInvalid: true })
        .then(() => ogma.addEdges(edges, { ignoreInvalid: true }))
        .then(() => {
          const neighbors = ogma.getNodes(nodeIds);
          const edges = ogma.getEdges(edgeIds);
          highlighted.add(neighbors);
          highlighted.add(edges);
          return ogma.layouts.force({ gpu: true });
        });
    });
  });
  ogma.events.on("click", (evt) => {
    if (!evt.target) return leftPanel.clear();
    leftPanel.setGraphElement(evt.target);
  });

  showLoader("Loading Airports and Cities");
  return Promise.all([
    connector.fetchNodesByType("city"),
    connector.fetchNodesByType("airport"),
  ])
    .then(([cities, airports]) => {
      return Promise.all([
        ogma.addNodes(cities, { ignoreInvalid: true }),
        ogma.addNodes(airports, { ignoreInvalid: true }),
      ]);
    })
    .then(() => {
      showLoader("Loading Routes");
      return Promise.all([
        connector.fetchEdgesByType("located_in"),
        connector.fetchEdgesByType("route"),
      ]);
    })
    .then(([located, route]) => {
      hideLoader();
      return Promise.all([
        ogma.addEdges(located, { ignoreInvalid: true }),
        ogma.addEdges(route, { ignoreInvalid: true }),
      ]);
    })
    .then(() => {
      return ogma.layouts.force({ locate: true, gpu: true });
    })
    .catch((e) => {
      showLoader(`Something went wrong: ${e.message}`);
      throw e;
    });
}
