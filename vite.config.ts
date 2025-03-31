import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const rootDir = dirname(fileURLToPath(import.meta.url));

export default {
  resolve: {
    alias: {
      gleam: resolve(rootDir, "build/dev/javascript/sonatina"),
    },
  },
};
