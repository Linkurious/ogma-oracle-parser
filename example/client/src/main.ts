import "./style.css";
import axios from "axios";
import { setupLoader } from "./loader.ts";
import { setupOgma } from "./ogma.ts";

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

setupLoader(document.querySelector<HTMLDivElement>("#app")!);
setupOgma(document.querySelector<HTMLDivElement>("#ogma")!);
