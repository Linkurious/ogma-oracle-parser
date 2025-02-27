import {
  eltNameFromId,
  generateSchema,
  type Schema,
} from "@linkurious/ogma-oracle-parser";
import oracledb, { Connection } from "oracledb";

class State {
  private graphName: string;
  private schema: Schema;
  private connection: Connection;
  constructor() {}
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
  async connect({
    user,
    password,
    host,
    port,
    service,
  }: {
    user: string;
    password: string;
    host: string;
    port: number;
    service: string;
  }) {
    const connectString = host + ":" + port + "/" + service;
    this.connection = await oracledb.getConnection({
      user,
      password,
      connectString,
    });
    // @ts-ignore
    this.schema = await generateSchema(this.connection);
    this.graphName = Object.keys(this.schema)[0];
  }
  getConnection() {
    return this.connection;
  }
}

export const state = new State();
