import './style.css'
import { setupOgma } from './ogma.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="ogma">
  </div>
`

setupOgma(document.querySelector<HTMLButtonElement>('#ogma')!)
