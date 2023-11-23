import { Node, Edge } from '@linkurious/ogma';
import { indexFromId, tableFromId } from '@linkurious/ogma-oracle-parser';
export class LeftPanel {
  private rootElement: HTMLElement;
  constructor(rootElement: HTMLElement) {
    this.rootElement = rootElement;
  }

  setGraphElement(element: Node | Edge) {
    this.rootElement.classList.add('slide-in');
    this.rootElement.classList.remove('slide-out');

    const eltType = element.isNode ? 'node' : 'edge';
    const tableName = tableFromId(element.getId());
    const id = indexFromId(element.getId());
    const graphId = `${tableName}{"ID":${id}}`;
    const properties = `<ul>${Object.entries(element.getData())
      .reduce((acc, [key, value]) => {
        return acc + `<li><span>${key}:</span> ${value}</li>`;
      }, '')}</ul>`;

    const dbProperties = `
      <ul>
        <li><span>Table:</span> ${tableName}</li>
        <li><span>ID:</span> ${graphId}</li>
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
    this.rootElement.classList.remove('slide-in');
    this.rootElement.classList.add('slide-out');

    this.rootElement.innerHTML = '';
  }
}