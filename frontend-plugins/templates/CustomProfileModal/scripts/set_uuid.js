import { randomUUID } from "node:crypto";

const uuid = randomUUID();
const versionId = "app_" + uuid.replace(/-/g, "");

process.stdout.write(`VERSION_ID=${versionId}\nVITE_VERSION_ID=${versionId}\n`);
