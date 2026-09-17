import { createHash } from "node:crypto";
import path from "node:path";
import { federation } from "@module-federation/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import pkg from "./package.json";

const versionId = process.env.VERSION_ID || "custom_nearest_user_profile";

const rawPublicPath =
  process.env.MF_PUBLIC_PATH || process.env.PUBLIC_PATH || "";
const publicPath = rawPublicPath ? rawPublicPath.replace(/\/?$/, "/") : "auto";

/**
 * webpack の css-loader (localIdentName + localIdentHashSalt) と同じ命名規則。
 * VERSION_ID をソルトに含めることで、ホスト上で他プラグインとクラス名が衝突しない。
 */
const generateScopedName = (name: string, filename: string) => {
  const file = path.basename(filename).replace(/\.\w+$/, "").replace(/\./g, "-");
  const hash = createHash("sha256")
    .update(`${versionId}:${filename}:${name}`)
    .digest("base64")
    .replace(/[^a-zA-Z0-9]/g, "")
    .slice(0, 5);
  return `${file}__${name}__${hash}`;
};

export default defineConfig(({ command }) => ({
  base: command === "build" ? "./" : "/",
  plugins: [
    react(),
    federation({
      name: versionId,
      filename: "remoteEntry.js",
      manifest: true,
      publicPath,
      exposes: {
        "./CustomNearestUserProfile": "./src/components/CustomNearestUserProfile",
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
      },
    }),
  ],
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
}));
