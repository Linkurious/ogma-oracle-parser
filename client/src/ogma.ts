import Ogma from "@linkurious/ogma/umd";
import { Connector } from "./graph-fetch";
import { icons } from './icons'
const fontName = 'Font Awesome 6 Free';

const schema = {
  nodes: {
    city: {
      label: 'city',
      properties: {
        city: 'string',
        country: 'string',
      },
    },
    airport: {
      label: 'located_in',
      properties: {
        name: 'string',
        iata: 'string',
        icao: 'string',
        airport_type: 'string',
        longitude: 'number',
        latitude: 'number',
        altitude: 'number',
        timezone: 'string',
        tzdbtime: 'string',
        dst: 'string',
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

export function setupOgma(element: HTMLButtonElement) {
  const ogma = new Ogma({
    container: element,
  });
  window.ogma = ogma;
  ogma.styles.addNodeRule({
    color: node => node.getData('type') === 'CITIES' ? 'red' : 'blue',
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
  })
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
          return ogma.layouts.force({ gpu: true })

        })
      })
  })

  return Promise.all([
    connector.fetchNodesByType('city'),
    connector.fetchNodesByType('airport'),
  ])

    .then(([cities, airports]) => ogma.addNodes(cities
      .slice(0, 300)
      .concat(airports.slice(0, 300))))
    .then(() => connector.fetchEdgesByType('route'))
    .then((edges) => ogma.addEdges(edges, { ignoreInvalid: true }))
    .then(() => {
      return ogma.layouts.force({ locate: true, gpu: true })
    })
    .then(() => {
      console.log(ogma.getNodes());
    })
}
