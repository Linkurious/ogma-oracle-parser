import "./style.css";
import axios from "axios";
import { setupLoader } from "./loader.ts";
import { setupOgma } from "./ogma.ts";
axios.get(`http://localhost:1337/test`).then(({ data }) => {
  const lobs = data;

  const vertices = ["V1"];
  const edges = ["E1"];
  const idToIndex = new Map();
  vertices.forEach((id, i) => idToIndex.set(id, i));
  edges.forEach((id, i) => idToIndex.set(id, vertices.length + i));
  const struct = lobs.metaData.map(({ name }) => {
    const [id, key] = name.split("__");
    return { index: idToIndex.get(id), key, isId: !key };
  });
  const graph = {
    nodes: [],
    edges: [],
  };
  lobs.rows.forEach((row) => {
    const elements = vertices.concat(edges).map(() => ({ id: "", data: {} }));
    row.forEach((prop, i) => {
      const { index, key, isId } = struct[i];
      if (isId) {
        elements[index].id = `${prop.ELEM_TABLE}{"ID":${prop.KEY_VALUE.ID}}`;
        return;
      }
      elements[index].data[key] = prop;
    });
    graph.nodes.push(...elements.slice(0, vertices.length));
    // TODO: How to know who is source and target ?
    graph.edges.push(...elements.slice(vertices.length));
  });
  console.log(graph);
});
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="ogma">
  </div>
`;

setupLoader(document.querySelector<HTMLDivElement>("#app")!);
setupOgma(document.querySelector<HTMLDivElement>("#ogma")!);
