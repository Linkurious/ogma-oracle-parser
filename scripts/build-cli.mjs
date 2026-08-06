import { build } from "esbuild";

build({
  entryPoints: ["cli/cli.ts"],
  outfile: "dist/cli.js",
  platform: "node",
  bundle: true,
  minify: true,
  sourcemap: true,
  external: ["fs", "path", "oracledb"],
}).catch(() => process.exit(1));
