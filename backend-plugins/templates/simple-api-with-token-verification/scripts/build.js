import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dist = path.join(root, "dist");
const bundleDir = path.join(dist, "bundle");

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const wrangler = path.join(root, "node_modules", "wrangler", "bin", "wrangler.js");
if (!fs.existsSync(wrangler)) {
  throw new Error("wrangler が見つからない。先に pnpm install を実行する。");
}
execFileSync(
  process.execPath,
  [wrangler, "deploy", "--dry-run", "--outdir", bundleDir],
  { cwd: root, stdio: "inherit" },
);

const scripts = fs
  .readdirSync(bundleDir)
  .filter((file) => file.endsWith(".js"));
if (scripts.length !== 1) {
  throw new Error(
    `バンドルが 1 ファイルにまとまらなかった: ${scripts.join(", ")}`,
  );
}
fs.copyFileSync(path.join(bundleDir, scripts[0]), path.join(dist, "worker.js"));
fs.rmSync(bundleDir, { recursive: true, force: true });

fs.copyFileSync(
  path.join(root, "wrangler.jsonc"),
  path.join(dist, "wrangler.jsonc"),
);

const zip = new AdmZip();
zip.addLocalFile(path.join(dist, "worker.js"));
zip.addLocalFile(path.join(dist, "wrangler.jsonc"));
zip.writeZip(path.join(dist, "plugin.zip"));

console.log("plugin.zip has been created successfully.");
