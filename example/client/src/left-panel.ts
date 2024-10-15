import { Node, Edge } from "@linkurious/ogma";
import { rowId, labelFromId } from "@linkurious/ogma-oracle-parser";
export class LeftPanel {
  private rootElement: HTMLElement;
  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
  }

  setGraphElement(element: Node | Edge) {
    this.rootElement.classList.add("slide-in");
    this.rootElement.classList.remove("slide-out");

    const eltType = element.isNode ? "node" : "edge";
    const eltId = element.getId() as string;
    const type = labelFromId(eltId);
    const id = rowId(eltId);
    const properties = `<ul>${Object.entries(element.getData()).reduce(
      (acc, [key, value]) => {
        return acc + `<li><span>${key}:</span> ${value}</li>`;
      },
      ""
    )}</ul>`;

    const dbProperties = `
      <ul>
        <li><span>TYPE:</span> ${type}</li>
        <li><span>ID:</span> ${id}</li>
      </ul>
    `;
    this.rootElement.innerHTML = `
      <h3>${eltType} ${id}</h3>
      ${dbProperties}
      <h3>Data</h3>

      ${properties}
    `;
  }
  clear() {
    this.rootElement.classList.remove("slide-in");
    this.rootElement.classList.add("slide-out");

    this.rootElement.innerHTML = "";
  }
}
