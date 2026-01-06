const chalk = require("chalk");
const { loadConfig, saveConfig, CONFIG_PATH } = require("./config");

async function runConfig({ prompt }) {
  const config = loadConfig();

  console.log(chalk.bold.cyan("\nConfiguration Settings"));
  console.log(chalk.dim(`File: ${CONFIG_PATH}\n`));

  const answers = await prompt([
    {
      type: "list",
      name: "packageManager",
      message: "Default Package Manager (for JS/TS):",
      choices: [
        { name: "None (Always ask)", value: null },
        new inquirerSeparator(),
        { name: "npm", value: "npm" },
        { name: "pnpm", value: "pnpm" },
        { name: "yarn", value: "yarn" },
        { name: "bun", value: "bun" },
      ],
      default: config.packageManager || null,
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
  // We can't easily import inquirer.Separator here without adding dependency
  // or passing it in. Let's just use a string for now or skip it.
  return { name: "──────────────", disabled: true };
}

module.exports = { runConfig };
