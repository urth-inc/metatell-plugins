import { createHash } from "node:crypto";
import path from "node:path";
import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig, lazyPlugins } from "vite-plus";

import pkg from "./package.json";

const versionId = process.env.VERSION_ID || "custom_megaphone_button";

const rawPublicPath = process.env.MF_PUBLIC_PATH || process.env.PUBLIC_PATH || "";
const publicPath = rawPublicPath ? rawPublicPath.replace(/\/?$/, "/") : "auto";

/**
 * webpack の css-loader (localIdentName + localIdentHashSalt) と同じ命名規則。
 * VERSION_ID をソルトに含めることで、ホスト上で他プラグインとクラス名が衝突しない。
 */
const generateScopedName = (name: string, filename: string) => {
  const file = path
    .basename(filename)
    .replace(/\.\w+$/, "")
    .replace(/\./g, "-");
  const hash = createHash("sha256")
    .update(`${versionId}:${filename}:${name}`)
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5);
  return `${file}__${name}__${hash}`;
};

export default defineConfig(({ command }) => ({
  fmt: {
    ignorePatterns: ["dist/**"],
  },
  lint: {
    ignorePatterns: ["dist/**"],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: {
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    options: {
      typeAware: true,
      typeCheck: true,
    },
  },
  base: command === "build" ? "./" : "/",
  plugins: lazyPlugins(() => [
    react(),
    federation({
      name: versionId,
      filename: "remoteEntry.js",
      manifest: true,
      publicPath,
      exposes: {
        "./CustomMegaphoneButton": "./src/components/CustomMegaphoneButton",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: pkg.dependencies["react"],
        },
        "react-dom": {
          singleton: true,
          requiredVersion: pkg.dependencies["react-dom"],
        },
        "react-toastify": {
          singleton: true,
          requiredVersion: pkg.dependencies["react-toastify"],
        },
      },
    }),
  ]),
  css: {
    modules: {
      localsConvention: "camelCase",
      generateScopedName,
    },
  },
  build: {
    target: "esnext",
    outDir: "dist",
    emptyOutDir: true,
  },
  server: {
    port: 3004,
    strictPort: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    passWithNoTests: true,
  },
}));
