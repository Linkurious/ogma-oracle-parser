import { build } from "esbuild";

build({
  entryPoints: ["cli/cli.ts"], // Change to your main file
  outfile: "dist/cli.js",
  platform: "node", // Ensures Node.js compatibility
  bundle: true, // Enables bundling
  minify: true, // Minifies output
  external: ["fs", "path"], // Keeps built-in Node.js modules external
}).catch(() => process.exit(1));
