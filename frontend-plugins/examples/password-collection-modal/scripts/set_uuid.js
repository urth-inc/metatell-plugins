const { v4: uuidv4 } = require("uuid");

const uuid = uuidv4();
const versionId = "app_" + uuid.replace(/-/g, "");

console.log(`VERSION_ID=${versionId}`);
