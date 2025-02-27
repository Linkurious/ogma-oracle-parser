import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import path from "path";
import dbConfig from "./config";
import { nodes, edges, graph as graphRoutes } from "./routes";
import { state } from "./state";
const { user, password, host, port, service } = dbConfig;

export default async function createApp() {
  const app = express();
  await state.connect({
    user,
    password,
    host,
    port,
    service,
  });
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(bodyParser.json());
  app.use(
    cors({
      origin: "*",
    })
  );
  app.use("/", express.static(path.resolve(__dirname, "../../client/dist")));
  nodes(app);
  edges(app);
  graphRoutes(app);
  return app;
}
