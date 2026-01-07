const fs = require("node:fs");
const path = require("node:path");
const os = require("node:os");

const CONFIG_PATH = path.join(os.homedir(), ".projectcli.json");

const PROJECT_CONFIG_FILES = [".projectclirc", "projectcli.config.json"];

function safeReadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, "utf8");
    return JSON.parse(content);
  } catch {
    return null;
  }
}

function normalizeConfig(raw) {
  if (!raw || typeof raw !== "object") return {};

  const out = {};

  if (typeof raw.packageManager === "string")
    out.packageManager = raw.packageManager;
  if (typeof raw.author === "string") out.author = raw.author;

  // Accept either `license` (project-level) or `defaultLicense` (global config shape)
  if (typeof raw.license === "string" || raw.license === null) {
    out.license = raw.license;
  }
  if (typeof raw.defaultLicense === "string" || raw.defaultLicense === null) {
    out.defaultLicense = raw.defaultLicense;
  }

  if (typeof raw.learningMode === "boolean")
    out.learningMode = raw.learningMode;
  if (typeof raw.learning === "boolean") out.learning = raw.learning;

  if (typeof raw.preset === "string" || raw.preset === null) {
    out.preset = raw.preset;
  }

  if (typeof raw.ci === "boolean") out.ci = raw.ci;
  if (typeof raw.docker === "boolean") out.docker = raw.docker;
  if (typeof raw.devcontainer === "boolean")
    out.devcontainer = raw.devcontainer;

  return out;
}

function loadProjectConfig(cwd) {
  const root = path.resolve(cwd || process.cwd());
  for (const name of PROJECT_CONFIG_FILES) {
    const candidate = path.resolve(root, name);
    // Defensive: ensure we never read outside cwd.
    const rel = path.relative(root, candidate);
    if (rel.startsWith("..") || path.isAbsolute(rel)) continue;
    const parsed = safeReadJson(candidate);
    if (parsed && typeof parsed === "object") {
      return { path: candidate, data: normalizeConfig(parsed) };
    }
  }
  return { path: null, data: {} };
}

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
  loadProjectConfig,
  PROJECT_CONFIG_FILES,
};
