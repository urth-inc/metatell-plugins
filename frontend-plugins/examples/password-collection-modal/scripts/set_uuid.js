import { v4 as uuidv4 } from "uuid";

const uuid = uuidv4();
const versionId = "app_" + uuid.replace(/-/g, "");

process.stdout.write(`VERSION_ID=${versionId}\nVITE_VERSION_ID=${versionId}\n`);
