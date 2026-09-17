import path from "node:path";
import { fileURLToPath } from "node:url";

import AdmZip from "adm-zip";

const dirname = path.dirname(fileURLToPath(import.meta.url));
const directoryPath = path.resolve(dirname, "../dist");
const filePath = path.join(directoryPath, "plugin.zip");

const zip = new AdmZip();
zip.addLocalFolder(directoryPath);
zip.writeZip(filePath);
