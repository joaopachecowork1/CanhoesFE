import path from "path";
import { configDefaults, defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve("."),
    },
  },
  test: {
    environment: "node",
    exclude: [...configDefaults.exclude, ".next/**"],
  },
});
