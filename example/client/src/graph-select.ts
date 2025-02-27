import { GraphSchema, parseSchema } from "@linkurious/ogma-oracle-parser";
import axios from "axios";
import { API } from "./API";
import { leftPanel } from "./left-panel";
import { hideLoader, showLoader } from "./loader";
import { Visualisation } from "./visualisation";

const list = document.createElement("div");
const formContainer = document.createElement("div");

export async function setupGraphSelect(
  element: HTMLDivElement,
  vis: Visualisation
) {
  element.appendChild(list);
  element.appendChild(formContainer);
  await refreshGraphSelect(vis);
}
async function refreshGraphSelect(vis: Visualisation) {
  const { data: graphs } = await axios.get<string[]>(`graphs`);
  list.innerHTML = "";
  list.classList.add("graphs");
  list.classList.add("hidden");
  graphs.forEach((graph) => {
    const item = document.createElement("button");
    item.innerText = graph;
    list.appendChild(item);
    item.addEventListener("click", async () => {
      try {
        const response = await axios.post<GraphSchema>(`graph/${graph}`);
        const schema = parseSchema(response.data);
        showLoader("Loading Graph...");
        hideGraphSelect();
        const ogma = vis.getOgma();
        const rawGraph = await API.fetchSubGraph();
        await vis.updateStyles(schema);
        await ogma.setGraph(rawGraph);
        hideLoader();
        leftPanel.show();
        return ogma.layouts.force({ locate: true, gpu: true });
      } catch (e) {
        showLoader(`Something went wrong: ${e.message}`);
        throw e;
      }
    });
  });

  const custom = document.createElement("button");
  custom.innerText = "Custom";
  list.appendChild(custom);
  custom.addEventListener("click", () => {
    hideGraphSelect();
    showDBForm();
  });
}

export function showGraphSelect() {
  list.classList.remove("hidden");
}
export function hideGraphSelect() {
  list.classList.add("hidden");
}
export function setupDBForm(element: HTMLDivElement, vis: Visualisation) {
  formContainer.classList.add("hidden");
  formContainer.classList.add("db-form");
  const title = document.createElement("h2");
  title.innerText = "Connect to Database";
  formContainer.appendChild(title);
  element.appendChild(formContainer);
  const form = document.createElement("form");
  formContainer.appendChild(form);
  form.innerHTML = "";
  form.innerHTML = `
    <label for="host" >Host</label>
    <input type="text" name="host" value="localhost" required />
    <label for="port">Port</label>
    <input type="number" name="port" value="1521" required />
    <label for="user">User</label>
    <input type="text" name="user" value="graphuser" required />
    <label for="password">Password</label>
    <input type="password" name="password" value="Welcome_1234#" required />
    <label for="service">Service</label>
    <input type="text" name="service" required value="freepdb1" />
    <button type="submit">Connect</button>
    `;
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const host = formData.get("host") as string;
    const port = formData.get("port") as string;
    const user = formData.get("user") as string;
    const password = formData.get("password") as string;
    const service = formData.get("service") as string;
    try {
      await axios.post(`database`, {
        host,
        port,
        user,
        password,
        service,
      });
      await refreshGraphSelect(vis);
      showGraphSelect();
      hideDBForm();
    } catch (e) {
      showLoader(`Something went wrong: ${e.message}`);
      throw e;
    }
  });
}
export function showDBForm() {
  formContainer.classList.remove("hidden");
}
function hideDBForm() {
  formContainer.classList.add("hidden");
}
