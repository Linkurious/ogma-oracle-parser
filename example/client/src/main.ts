import "./style.css";
import axios from "axios";
import {
  setupGraphSelect,
  setupDBForm,
  showGraphSelect,
} from "./graph-select.ts";
import { leftPanel } from "./left-panel.ts";
import { hideLoader, setupLoader } from "./loader.ts";
import { Visualisation } from "./visualisation.ts";

interface ImportMeta {
  env: {
    VITE_SERVER_URL: string;
  };
}

axios.interceptors.request.use((config) => {
  const root = (import.meta as unknown as ImportMeta).env.VITE_SERVER_URL || "";
  config.url = `${root}/${config.url}`;
  return config;
});
document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="ogma">
  </div>
`;
const app = document.querySelector<HTMLDivElement>("#app")!;
setupLoader(app);
hideLoader();
leftPanel.hide();
const visualisation = new Visualisation(
  document.querySelector<HTMLDivElement>("#ogma")!
);
await setupGraphSelect(app, visualisation);
setupDBForm(app, visualisation);
showGraphSelect();
