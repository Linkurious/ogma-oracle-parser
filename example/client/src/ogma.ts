import Ogma from "@linkurious/ogma";
import { eltNameFromId } from "@linkurious/ogma-oracle-parser";
import { Connector } from "./graph-fetch";
import { icons } from "./icons";
import { leftPanel } from "./left-panel";

const fontName = "Font Awesome 6 Free";
const connector = new Connector();
export function setupOgma(element: HTMLDivElement) {
  const ogma = new Ogma({
    container: element,
  });
  ogma.styles.addNodeRule({
    color: (node) =>
      eltNameFromId(`${node.getId()}`) === "CITIES" ? "#dbd3ad" : "#d36060",
    icon: {
      font: fontName,
      color: "white",
      // @ts-expect-error any
      content: (n) => icons[n.getData("type")],
      scale: 0.75,
    },
    text: {
      content: (n) =>
        eltNameFromId(`${n.getId()}`) === "CITIES"
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
  ogma.layers.addLayer(leftPanel.getRootElement());
  ogma.events.on("doubleclick", (evt) => {
    if (!evt.target || !evt.target.isNode) return;
    const nodeId = evt.target.getId() as string;
    highlighted.clearNodes();
    highlighted.clearEdges();
    connector.expand(nodeId).then(({ nodes, edges }) => {
      const nodeIds = nodes.map((n) => n.id) as string[];
      const edgeIds = edges.map((e) => e.id) as string[];
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
  return ogma;
}
