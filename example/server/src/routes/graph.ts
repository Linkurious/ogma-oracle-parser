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

  app.post("/database", async (req, res) => {
    const { host, port, user, password, service } = req.body;
    await state.connect({
      user,
      password,
      host,
      port,
      service,
    });
    return res.json(state.getGraphSchema());
  });
}
