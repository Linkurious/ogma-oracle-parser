import fs from "fs/promises";
import path from "path";
const toDelete = [
  "## Hierarchy",
  "## Variables",
  "## Functions",
  "## Table of contents",
  "### \\_",
  `#### Defined in`,
  `#### Inherited from`,
  `#### Type parameters`,
  `#### Overrides`,
];

function getTitles(content, title) {
  return [...content.matchAll(new RegExp(`(^${title} .*)`, "gm"))];
}
function getTitle(content, title) {
  return content.match(new RegExp(`(^${title}$)`, "m"));
}

function removePrivateProperties(content) {
  const properties = getTitle(content, "## Properties");
  if (!properties) return content;
  const nextTitle = [...getTitles("#"), getTitles("##")]
    .sort((a, b) => a.index - b.index)
    .find((t) => t.index > properties.index);
  const nextTitleIndex = nextTitle ? nextTitle.index : content.length;
  return content
    .slice(0, properties.index)
    .concat(
      content
        .slice(properties.index, nextTitleIndex)
        .replaceAll(/### (.*)\n\n• `Private`(.*)\n/gm, "")
    )
    .concat(content.slice(nextTitleIndex));
}
async function cleanupFile(src) {
  const shouldKeepFunctions = src.endsWith("functions.md");
  // const shouldKeepTypes = src.endsWith("types.md");
  const keysDelete = toDelete.filter((td) => {
    return !shouldKeepFunctions || td !== "## Functions";
  });
  if (shouldKeepFunctions) {
    keysDelete.push("## Type Aliases");
    console.log("ICI", keysDelete);
  }

  let content = await fs.readFile(src, "utf-8");
  ["#", "##", "###", "####"].forEach((title, i, arr) => {
    const higherTitles = [];
    for (let j = 0; j < i; j++) {
      higherTitles.push(...getTitles(content, arr[j]));
    }
    higherTitles.sort((a, b) => a.index - b.index);
    const titles = getTitles(content, title);
    titles
      .slice()
      .reverse()
      .forEach((t, i, revTitles) => {
        const title = t[0];
        const match = keysDelete.find((td) => title.startsWith(td));
        if (!match) return;
        const nextSameTitle = i > 0 ? revTitles[i - 1] : null;
        const nextHigherTitle = higherTitles.find((ht) => ht.index > t.index);
        const nexTitle =
          nextSameTitle && nextHigherTitle
            ? nextSameTitle.index < nextHigherTitle.index
              ? nextSameTitle
              : nextHigherTitle
            : nextHigherTitle
              ? nextHigherTitle
              : nextSameTitle;
        const nextTitleIndex = nexTitle ? nexTitle.index : content.length;
        content = content
          .slice(0, t.index)
          .concat(content.slice(nextTitleIndex));
      });
  });

  // remove everything before first title:
  const firstTitle = getTitles(content, "#")[0];
  if (firstTitle) {
    content = content.slice(firstTitle.index);
    content = content.replace(/# Class: (.*)/, `# $1`);
  }
  // remove private properties
  content = removePrivateProperties(content);
  // replace the title of module to Types:
  content = content.replace("# @linkurious/ogma-oracle-parser", "");
  // remove type Aliases:
  content = content.replace(/## Type Aliases\n\n/gm, "# Types\n\n");
  content = content.replace(/## Functions/, "# Functions");

  // prevent from generating  :$ emoji
  content = content.replace(/:\$/gm, ": $");
  return await fs.writeFile(src, content);
}

// recursively go into input dir and call cleanupFile on every md file
async function cleanupDir(dir) {
  const files = await fs.readdir(dir, { withFileTypes: true });
  const promises = files.map((file) => {
    if (file.isDirectory()) {
      return cleanupDir(`${dir}/${file.name}`);
    } else if (file.name.endsWith(".md")) {
      if (file.name === "modules.md") {
        return Promise.resolve();
      }
      return cleanupFile(`${dir}/${file.name}`);
    }
  });
  return Promise.all(promises);
}

function removeFiles(base) {
  return Promise.all(
    ["README.md", ".nojekyll"].map((file) => fs.rm(path.resolve(base, file)))
  );
}
async function rename() {
  await fs.copyFile("docs/api/modules.md", "docs/api/types.md");
  // await fs.copyFile("docs/api/modules.md", "docs/api/functions.md");
  await fs.rename("docs/api/modules.md", "docs/api/functions.md");
}
async function main() {
  await rename();
  await cleanupDir("docs/api");
  await removeFiles("docs/api");
}

main();
