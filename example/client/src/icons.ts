// dummy icon element to retrieve the HEX code
const placeholder = document.getElementById("icon-placeholder")!;
placeholder.style.visibility = "hidden";

// helper routine to get the icon HEX code
const getIconCode = (className: string) => {
  placeholder.className = className;
  const code = getComputedStyle(placeholder, ":before").content;
  return code.replace(/"/g, "");
};

export const icons = {
  AIRPORT: getIconCode("fa-solid fa-plane"),
  CITY: getIconCode("fa-solid fa-city"),
  ACCOUNT: getIconCode("fa-solid fa-dollar-sign"),
};
