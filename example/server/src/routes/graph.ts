import { Express } from "express";
import { state } from "../state";

export async function graph(app: Express) {
  app.get("/graphs", (req, res) => {
    return res.json(Object.keys(state.getSchema()));
  });
  app.post("/graph/:name", (req, res) => {
    state.setGraphName(req.params.name);
    return res.json(state.getGraphSchema());
  });
}
