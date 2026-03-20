import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],
  root: ".",
  publicDir: "public",
  base: "./",
  build: {
    rollupOptions: {
      input: {
        popup: resolve(__dirname, "popup.html"),
      },
    },
    outDir: "dist",
    emptyOutDir: false,
  },
});
