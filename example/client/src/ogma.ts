import Ogma from "@linkurious/ogma/umd";
import { labelFromId } from "@linkurious/ogma-oracle-parser";
import { showLoader, hideLoader } from './loader';
import { Connector } from "./graph-fetch";
import { LeftPanel } from "./left-panel";
import { icons } from './icons';

const leftPanelRoot = document.createElement('div');
leftPanelRoot.classList.add('left-panel');
const leftPanel = new LeftPanel(leftPanelRoot);
const fontName = 'Font Awesome 6 Free';
const schema = {
  nodes: {
    city: {
      label: 'city',
      properties: {
        CITY: 'string',
        COUNTRY: 'string',
      },
    },
    airport: {
      label: 'located_in',
      properties: {
        NAME: 'string',
        IATA: 'string',
        ICAO: 'string',
        AIRPORT_TYPE: 'string',
        LONGITUDE: 'number',
        LATITUDE: 'number',
        ALTITUDE: 'number',
        TIMEZONE: 'string',
        TZDBTIME: 'string',
        DST: 'string',
      }
    }
  },
  edges: {
    route: {
      label: 'route',
      properties: {
        codeshare: 'string',
        airline_id: 'string',
        equipment: 'string',
        stops: 'number',
        distance_in_mi: 'number',
        distance_in_km: 'number',
      }
    },
    airports_in_cities: {
      label: "located_in",
      properties: {}
    }
  }
};

const connector = new Connector<typeof schema>(schema);
export function setupOgma(element: HTMLDivElement) {
  const ogma = new Ogma({
    container: element,
  });
  ogma.styles.addNodeRule({
    color: node => labelFromId(`${node.getId()}`) === 'CITIE' ? 'red' : 'blue',
    icon: {
      font: fontName,
      color: 'white',
      content: n => icons[n.getData('type')],
      scale: 0.75
    },
    text: {
      content: n => n.getData('name'),
      size: 15,
      padding: 10,
      minVisibleSize: 2,
    },
  });
  const highlighted = ogma.styles.createClass({
    name: 'highlighted',
    nodeAttributes: {
      radius: 10,
      outerStroke: {
        color: 'black',
        width: 2,
      },
    },
    edgeAttributes: {
      color: 'black',
      width: 2,
    },
  });
  ogma.layers.addLayer(leftPanelRoot);
  ogma.events.on('doubleclick', (evt) => {
    if (!evt.target || !evt.target.isNode) return;
    const nodeId = evt.target.getId();
    highlighted.clearNodes();
    highlighted.clearEdges();
    connector.expand(nodeId)
      .then(({ nodes, edges }) => {
        const nodeIds = nodes.map(n => n.id);
        const edgeIds = edges.map(e => e.id);

        return ogma.addNodes(nodes, { ignoreInvalid: true })
          .then(() => ogma.addEdges(edges, { ignoreInvalid: true }))
          .then(() => {
            const neighbors = ogma.getNodes(nodeIds);
            const edges = ogma.getEdges(edgeIds);
            highlighted.add(neighbors);
            highlighted.add(edges);
            ogma.getNodes().setAttribute('layoutable', false);
            neighbors.setAttribute('layoutable', true);
            return ogma.layouts.force({ gpu: true });

          });
      });
  });
  ogma.events.on('click', (evt) => {
    if (!evt.target) return leftPanel.clear();
    leftPanel.setGraphElement(evt.target);
  });

  showLoader('Loading Airports and Cities');
  return Promise.all([
    connector.fetchNodesByType('city'),
    connector.fetchNodesByType('airport'),
  ])
    .then(([cities, airports]) => ogma.addNodes(cities
      .slice(0, 300)
      .concat(airports.slice(0, 300))))
    .then(() => {
      showLoader('Loading Routes');
      return Promise.all([
        connector.fetchEdgesByType('located_in'),
        connector.fetchEdgesByType('route'),
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
}
