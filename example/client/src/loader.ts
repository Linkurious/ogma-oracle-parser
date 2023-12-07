export function setupLoader(element: HTMLDivElement) {
  const loader = document.createElement('div');
  loader.classList.add('loader');
  const loaderText = document.createElement('div');
  loaderText.classList.add('loader-text');
  loaderText.innerText = 'Loading...';
  loader.appendChild(loaderText);
  element.appendChild(loader);
  return loader;
}

export function showLoader(text: string) {
  const loader = document.querySelector<HTMLDivElement>('.loader')!;
  const loaderText = document.querySelector<HTMLDivElement>('.loader-text')!;
  loaderText.innerText = text;
  loader.classList.add('active');
}
export function hideLoader() {
  const loader = document.querySelector<HTMLDivElement>('.loader')!;
  loader.classList.remove('active');
}