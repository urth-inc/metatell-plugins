import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const frontend = path.join(root, "frontend");
const worker = path.join(root, "worker");
const dist = path.join(root, "dist");
const bundleDir = path.join(dist, "bundle");
const assetsDir = path.join(frontend, "dist");

// プラットフォームが受け付ける worker.js の上限。
const MAX_WORKER_SIZE = 10 * 1024 * 1024;
// Cloudflare の Static Assets の、1 ファイルの上限。
const MAX_ASSET_SIZE = 25 * 1024 * 1024;

const bin = (packageDir, pkg, file) => {
  const full = path.join(packageDir, "node_modules", pkg, "bin", file);
  if (!fs.existsSync(full)) {
    throw new Error(`${pkg} が見つからない。先に pnpm install を実行する。`);
  }
  return full;
};

const run = (cwd, script, args) =>
  execFileSync(process.execPath, [script, ...args], { cwd, stdio: "inherit" });

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    return entry.isDirectory() ? walk(full) : [full];
  });

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

run(frontend, bin(frontend, "vite", "vite.js"), ["build"]);
run(worker, bin(worker, "wrangler", "wrangler.js"), [
  "deploy",
  "--dry-run",
  "--outdir",
  bundleDir,
]);

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

const workerSize = fs.statSync(path.join(dist, "worker.js")).size;
if (workerSize > MAX_WORKER_SIZE) {
  throw new Error(
    `worker.js が ${(workerSize / 1024 / 1024).toFixed(1)} MB あり、上限の 10 MB を超えている。`,
  );
}

const assets = walk(assetsDir);
for (const file of assets) {
  if (fs.statSync(file).size > MAX_ASSET_SIZE) {
    throw new Error(
      `${path.relative(assetsDir, file)} が 1 ファイルの上限 25 MiB を超えている。`,
    );
  }
}

fs.copyFileSync(
  path.join(worker, "wrangler.jsonc"),
  path.join(dist, "wrangler.jsonc"),
);

const zip = new AdmZip();
zip.addLocalFile(path.join(dist, "worker.js"));
zip.addLocalFile(path.join(dist, "wrangler.jsonc"));
for (const file of assets) {
  const relative = path.relative(assetsDir, file).split(path.sep).join("/");
  zip.addFile(`assets/${relative}`, fs.readFileSync(file));
}
zip.writeZip(path.join(dist, "plugin.zip"));

console.log(
  `plugin.zip has been created successfully. (worker.js: ${(workerSize / 1024).toFixed(0)} KB, assets: ${assets.length} files)`,
);
