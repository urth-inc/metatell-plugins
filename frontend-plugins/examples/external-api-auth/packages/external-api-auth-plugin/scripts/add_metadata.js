import fs from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const require = createRequire(import.meta.url);
const { description, metatellPlugin, name: packageName, version } = require("../package.json");
const dirname = path.dirname(fileURLToPath(import.meta.url));
const versionId = process.argv[2];

if (!versionId) {
  throw new Error("VERSION_ID is required.");
}

const metadata = {
  name: metatellPlugin?.name ?? packageName,
  version,
  description,
  type: "CustomOverlay",
  versionId
};

const directoryPath = path.resolve(dirname, "../dist");
const filePath = path.join(directoryPath, "metadata.json");

fs.writeFileSync(filePath, JSON.stringify(metadata, null, 2), "utf8");
