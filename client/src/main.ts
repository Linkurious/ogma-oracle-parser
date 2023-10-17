import './style.css'
import typescriptLogo from './typescript.svg'
import viteLogo from '/vite.svg'
import { setupOgma } from './ogma.ts'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div id="ogma">
  </div>
`

setupOgma(document.querySelector<HTMLButtonElement>('#ogma')!)
