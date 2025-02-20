import { eltNameFromId, type Schema } from "@linkurious/ogma-oracle-parser";

class State {
  private graphName: string;
  private schema: Schema;
  constructor(schema: Schema) {
    this.schema = schema;
    this.graphName = Object.keys(schema)[0];
  }
  setGraphName(graphName: string) {
    this.graphName = graphName;
  }
  getGraphName() {
    return this.graphName;
  }
  getGraphSchema() {
    return this.schema[this.graphName];
  }
  setSchema(schema: Schema) {
    this.schema = schema;
    this.graphName = Object.keys(schema)[0];
  }
  getSchema() {
    return this.schema;
  }
  idToLabel(id: string) {
    return this.getGraphSchema().elementNameToLabel.get(eltNameFromId(id));
  }
  getIdColumn(label: string) {
    return this.getGraphSchema().labelToElement.get(label)!.keyColumn;
  }
}

export const state = new State({} as Schema);
