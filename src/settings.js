const chalk = require("chalk");
const { loadConfig, saveConfig, CONFIG_PATH } = require("./config");
const { listPresets, getPreset } = require("./presets");

async function runConfig({ prompt }) {
  const config = loadConfig();

  console.log(chalk.bold.cyan("\nConfiguration Settings"));
  console.log(chalk.dim(`File: ${CONFIG_PATH}\n`));

  const answers = await prompt([
    {
      type: "list",
      name: "preset",
      message: "Default Preset:",
      choices: listPresets().map((id) => {
        const p = getPreset(id);
        return { name: `${p.id} (${p.label})`, value: p.id };
      }),
      default: config.preset || "startup",
    },
    {
      type: "list",
      name: "packageManager",
      message: "Default Package Manager (for JS/TS):",
      choices: [
        { name: "None (Always ask)", value: null },
        inquirerSeparator(),
        { name: "npm", value: "npm" },
        { name: "pnpm", value: "pnpm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: config.packageManager || null,
    },
    {
      type: "input",
      name: "author",
      message: "Default Author Name (for LICENSE):",
      default: config.author || "The Authors",
      filter: (v) => String(v || "").trim(),
    },
    {
      type: "list",
      name: "defaultLicense",
      message: "Default License Type:",
      choices: [
        { name: "None", value: null },
        inquirerSeparator(),
        { name: "MIT", value: "MIT" },
        { name: "Apache-2.0", value: "Apache2" },
        { name: "ISC", value: "ISC" },
      ],
      default: config.defaultLicense || "MIT",
    },
    {
      type: "confirm",
      name: "learningMode",
      message: "Enable Learning Mode by default?",
      default: config.learningMode || false,
    },
  ]);

  saveConfig(answers);
  console.log(chalk.green("\n✓ Settings saved!"));
}

// Helper for pure inquirer usage if needed,
// though index.js passes the prompt instance.
function inquirerSeparator() {
  return { name: "──────────────", disabled: true };
}

module.exports = { runConfig };
