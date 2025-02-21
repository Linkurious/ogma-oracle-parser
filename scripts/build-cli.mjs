import { build } from "esbuild";

build({
  entryPoints: ["cli/cli.ts"],
  outfile: "dist/cli.js",
  platform: "node",
  bundle: true,
  minify: true,
  external: ["fs", "path"],
}).catch(() => process.exit(1));
