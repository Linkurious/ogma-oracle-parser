// dummy icon element to retrieve the HEX code
const placeholder = document.getElementById('icon-placeholder');
placeholder.style.visibility = 'hidden';

// helper routine to get the icon HEX code
const getIconCode = className => {
  placeholder.className = className;
  const code = getComputedStyle(placeholder, ':before').content;
  return code;
};


export const icons = {
  AIRPORTS: getIconCode('fa-solid fa-plane'),
  CITIES: getIconCode('fa-solid fa-city'),
}
