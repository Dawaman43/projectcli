const chalk = require("chalk");

const { loadConfig, saveConfig, CONFIG_PATH } = require("./config");
const { listPresets, getPreset } = require("./presets");

function printPresetList(effectiveConfig) {
  console.log(chalk.bold("\nPresets:"));
  for (const id of listPresets(effectiveConfig)) {
    const p = getPreset(id, effectiveConfig);
    console.log(`- ${p.id}: ${chalk.dim(p.label)}`);
  }
  console.log("");
}

async function runPreset({ prompt, argv, effectiveConfig }) {
  const args = Array.isArray(argv) ? argv : [];
  const sub = args[0];

  if (!sub || sub === "list") {
    printPresetList(effectiveConfig);
    return;
  }

  if (sub === "use") {
    const presetArg = args[1];
    const preset = getPreset(presetArg, effectiveConfig);

    const config = loadConfig();

    if (!presetArg) {
      const { picked } = await prompt([
        {
          type: "list",
          name: "picked",
          message: "Choose a preset:",
          choices: listPresets(effectiveConfig),
          default: config.preset || preset.id,
        },
      ]);
      saveConfig({ preset: picked });
      console.log(chalk.green(`\n✓ Preset set to: ${picked}`));
      console.log(chalk.dim(`Config: ${CONFIG_PATH}`));
      return;
    }

    saveConfig({ preset: preset.id });
    console.log(chalk.green(`\n✓ Preset set to: ${preset.id}`));
    console.log(chalk.dim(`Config: ${CONFIG_PATH}`));
    return;
  }

  throw new Error(
    `Unknown preset subcommand: ${sub}. Try: projectcli preset list | projectcli preset use <name>`
  );
}

module.exports = {
  runPreset,
};
