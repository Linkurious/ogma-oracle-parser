import './style.css';
import { setupOgma } from './ogma.ts';
import { setupLoader } from './loader.ts';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="ogma">
  </div>
`;

setupLoader(document.querySelector<HTMLDivElement>('#app')!);
setupOgma(document.querySelector<HTMLDivElement>('#ogma')!);

