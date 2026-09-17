const path = require("path");
const AdmZip = require("adm-zip");

const directoryPath = path.resolve(__dirname, "../", "dist");

const zip = new AdmZip();
zip.addLocalFolder(directoryPath);

const filePath = path.join(directoryPath, "plugin.zip");
zip.writeZip(filePath);
