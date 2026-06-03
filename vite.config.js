import { resolve } from "node:path";
import { copyFileSync, cpSync, existsSync, mkdirSync } from "node:fs";
import { defineConfig } from "vite";

const pages = [
  "index",
  "calculadoras",
  "modelos",
  "aviso-legal",
  "privacidad",
  "desistimiento",
  "404",
  "recrear",
];

const input = Object.fromEntries(
  pages.map((page) => [page === "index" ? "main" : page, resolve(__dirname, `${page}.html`)])
);

const runtimeFiles = [
  ".nojekyll",
  "app.js",
  "calculadoras.js",
  "robots.txt",
  "sitemap.xml",
  "qr-contacto.png",
  "qr-contacto.svg",
];

function copyRuntimeStaticFiles() {
  return {
    name: "copy-runtime-static-files",
    closeBundle() {
      const outputDir = resolve(__dirname, "dist");
      mkdirSync(outputDir, { recursive: true });

      cpSync(resolve(__dirname, "assets"), resolve(outputDir, "assets"), {
        recursive: true,
        force: true,
      });

      for (const file of runtimeFiles) {
        const source = resolve(__dirname, file);
        if (existsSync(source)) {
          copyFileSync(source, resolve(outputDir, file));
        }
      }
    },
  };
}

export default defineConfig({
  appType: "mpa",
  base: "./",
  publicDir: false,
  plugins: [copyRuntimeStaticFiles()],
  build: {
    outDir: "dist",
    emptyOutDir: true,
    assetsDir: "assets",
    rollupOptions: {
      input,
    },
  },
});
