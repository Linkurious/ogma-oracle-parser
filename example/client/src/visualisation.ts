import Ogma, { StyleRule } from "@linkurious/ogma";
import { GraphSchema } from "@linkurious/ogma-oracle-parser";
import { API } from "./API";
import { icons } from "./icons";
import { leftPanel } from "./left-panel";
import { idToLabel } from "./utils";

const fontName = "Font Awesome 6 Free";
const colors = [
  `#1499FF`,
  `#AFD3F0`,
  `#FFFAC2`,
  `#B9E8D6`,
  `#E8E8E8`,
  `#C74634`,
];
export class Visualisation {
  private ogma: Ogma;
  private styleRule: StyleRule;
  constructor(container: HTMLDivElement) {
    const ogma = new Ogma({
      container,
    });
    this.ogma = ogma;
    ogma.layers.addLayer(leftPanel.getRootElement());
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
    ogma.events.on("doubleclick", (evt) => {
      if (!evt.target || !evt.target.isNode) return;
      const nodeId = evt.target.getId() as string;
      highlighted.clearNodes();
      highlighted.clearEdges();
      API.expand(nodeId).then(({ nodes, edges }) => {
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
    this.styleRule = ogma.styles.addRule({
      nodeAttributes: {
        icon: {
          font: fontName,
          color: "white",
          scale: 0.5,
        },
        text: {
          //   ? n.getData("CITY")
          //   : n.getData("IATA"),
          size: 15,
          padding: 10,
          minVisibleSize: 2,
        },
      },
    });
  }

  getOgma() {
    return this.ogma;
  }

  updateStyles(schema: GraphSchema) {
    const colorByType = schema.vertices.reduce((colorByType, { label }) => {
      return colorByType.set(label, colors[colorByType.size % colors.length]);
    }, new Map());

    this.styleRule.update({
      nodeAttributes: {
        color: (n) => {
          const label = idToLabel(schema, n.getId() as string);
          return colorByType.get(label);
        },
        icon: {
          content: (n) => {
            const label = idToLabel(schema, n.getId() as string);
            return label ? icons[label] : undefined;
          },
        },
        text: {
          content: (n) => {
            const label = idToLabel(schema, n.getId() as string);
            if (label === "AIRPORT") {
              return n.getData("IATA");
            }
            if (label === "CITY") {
              return n.getData("CITY");
            }
            if (label === "ACCOUNT") {
              return n.getData("NAME");
            }
            return n.getId();
          },
        },
      },
    });
  }
}
