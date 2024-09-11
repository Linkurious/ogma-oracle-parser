import "./style.css";
import { setupLoader } from "./loader.ts";
import { setupOgma } from "./ogma.ts";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="ogma">
  </div>
`;

setupLoader(document.querySelector<HTMLDivElement>("#app")!);
setupOgma(document.querySelector<HTMLDivElement>("#ogma")!);
