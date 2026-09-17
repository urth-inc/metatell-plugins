import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import AdmZip from "adm-zip";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const directoryPath = path.resolve(__dirname, "../", "dist");
const zip = new AdmZip();

const excludeFiles = ["plugin.zip"];

function addFolderToZip(folderPath, zipFolderPath = "") {
  const items = fs.readdirSync(folderPath);
  items.forEach(item => {
    const fullPath = path.join(folderPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      addFolderToZip(fullPath, path.join(zipFolderPath, item) + "/");
    } else {
      if (!excludeFiles.includes(item)) {
        const fileData = fs.readFileSync(fullPath);
        zip.addFile(path.join(zipFolderPath, item), fileData);
      }
    }
  });
}

addFolderToZip(directoryPath);

const filePath = path.join(directoryPath, "plugin.zip");
zip.writeZip(filePath);
console.log("plugin.zip has been created successfully.");
