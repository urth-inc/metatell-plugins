import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";
import { build } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

// 前回の生成物を消してから作り直す。
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1. worker をバンドルする。
//    ZIP 内のパスは worker.js（dist/ という階層は ZIP の中に作らない）。
await build({
  entryPoints: [path.join(root, "src/index.ts")],
  outfile: path.join(dist, "worker.js"),
  bundle: true,
  format: "esm",
  platform: "neutral",
  conditions: ["worker", "browser"],
  target: "es2022",
  // ランタイム組み込みモジュールはバンドルせず、そのまま import を残す。
  external: ["cloudflare:*", "node:*"],
});

// 2. wrangler.jsonc を同梱する。
//    プラットフォームはこの設定で Worker を上げるため、バインディングと
//    migrations はここに書いたものがそのまま効く。
//    main だけは ZIP 内の配置に合わせて書き換える。src/ は同梱しない。
const config = fs.readFileSync(path.join(root, "wrangler.jsonc"), "utf8");
const rewritten = config.replace(
  /("main"\s*:\s*)"[^"]*"/,
  '$1"worker.js"',
);
if (rewritten === config) {
  throw new Error('wrangler.jsonc に "main" が見つからない。');
}
fs.writeFileSync(path.join(dist, "wrangler.jsonc"), rewritten, "utf8");

// 3. dist の中身を ZIP ルートに詰める。
const zip = new AdmZip();
const exclude = new Set(["plugin.zip"]);

const addFolder = (folder, zipFolder = "") => {
  for (const item of fs.readdirSync(folder)) {
    const full = path.join(folder, item);
    if (fs.statSync(full).isDirectory()) {
      addFolder(full, `${path.join(zipFolder, item)}/`);
    } else if (!exclude.has(item)) {
      zip.addFile(path.join(zipFolder, item), fs.readFileSync(full));
    }
  }
};

addFolder(dist);
zip.writeZip(path.join(dist, "plugin.zip"));

console.log("plugin.zip has been created successfully.");
