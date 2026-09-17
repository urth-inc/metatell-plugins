import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const { name, version, description } = require("../package.json");

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const versionId = process.env.VERSION_ID;

const metadata = {
  name,
  version,
  description,
  type: "CustomTutorial",
  versionId,
};

const jsonData = JSON.stringify(metadata, null, 2);

const directoryPath = path.resolve(__dirname, "../", "dist");
const filePath = path.join(directoryPath, "metadata.json");

fs.writeFileSync(filePath, jsonData, "utf8");
console.log("metadata.json has been written successfully.");
