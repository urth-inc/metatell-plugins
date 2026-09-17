import { randomUUID } from "node:crypto";

const uuid = randomUUID();
const versionId = `app_${uuid.replace(/-/g, "")}`;

console.log(`VERSION_ID=${versionId}`);
