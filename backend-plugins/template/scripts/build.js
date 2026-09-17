import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

import AdmZip from "adm-zip";
import { build } from "esbuild";

const require = createRequire(import.meta.url);
const { name, version, description } = require("../package.json");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");

// 前回の生成物を消してから作り直す。
fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

// 1. worker をバンドルする。
//    ZIP 内のパスは worker.js（dist/ という階層は ZIP の中に作らない）。
//    PoC 時点の暫定であり、配布フォーマットは未確定。
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

// 2. 監査用に pnpm-lock.yaml を同梱する。
//    フロントエンドのテンプレートは dist に含めていないので、ここで明示的にコピーする。
fs.copyFileSync(
  path.join(root, "pnpm-lock.yaml"),
  path.join(dist, "pnpm-lock.yaml"),
);

// 3. metadata.json。
//    worker.js はバンドル済みなので、どの export が Durable Object クラスかを
//    プラットフォーム側で静的に判定できない。ここで明示的に宣言する。
const versionId = `app_${randomUUID().replaceAll("-", "")}`;
fs.writeFileSync(
  path.join(dist, "metadata.json"),
  JSON.stringify(
    {
      name,
      version,
      description,
      type: "Backend",
      versionId,
      durableObjects: [{ className: "RoomState", bindingName: "ROOM_STATE" }],
    },
    null,
    2,
  ),
  "utf8",
);

// 4. dist の中身を ZIP ルートに詰める。
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

console.log(`plugin.zip has been created successfully. (versionId: ${versionId})`);
