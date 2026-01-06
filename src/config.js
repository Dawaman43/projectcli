const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CONFIG_PATH = path.join(os.homedir(), ".projectcli.json");

function loadConfig() {
  try {
    if (fs.existsSync(CONFIG_PATH)) {
      const content = fs.readFileSync(CONFIG_PATH, "utf8");
      return JSON.parse(content);
    }
  } catch (err) {
    // ignore
  }
  return {};
}

function saveConfig(data) {
  try {
    const current = loadConfig();
    const updated = { ...current, ...data };
    fs.writeFileSync(CONFIG_PATH, JSON.stringify(updated, null, 2));
    return true;
  } catch (err) {
    return false;
  }
}

module.exports = {
  loadConfig,
  saveConfig,
  CONFIG_PATH,
};
