import { defineConfig, lazyPlugins } from "vite-plus";
import react from "@vitejs/plugin-react";
import { federation } from "@module-federation/vite";

const versionId = process.env.VERSION_ID || "custom-exit-screen";

const rawPublicPath = process.env.MF_PUBLIC_PATH || process.env.PUBLIC_PATH || "";
const publicPath = rawPublicPath ? rawPublicPath.replace(/\/?$/, "/") : "auto";

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
        "./CustomExitScreen": "./src/components/CustomExitScreen",
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: "18.3.1",
        },
        "react-dom": {
          singleton: true,
          requiredVersion: "18.3.1",
        },
      },
    }),
  ]),
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
