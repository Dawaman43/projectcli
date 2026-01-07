const chalk = require("chalk");

const { loadConfig, saveConfig, CONFIG_PATH } = require("./config");
const { getEnabledPlugins, tryLoadPlugin } = require("./plugins/manager");

function parsePluginArgs(argv) {
  const out = { yes: false, dryRun: false };
  const args = Array.isArray(argv) ? argv : [];
  for (const a of args) {
    if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

function firstPositional(argv) {
  const args = Array.isArray(argv) ? argv : [];
  for (const a of args) {
    if (typeof a !== "string") continue;
    if (a.startsWith("-")) continue;
    return a;
  }
  return null;
}

function secondPositional(argv) {
  const args = Array.isArray(argv) ? argv : [];
  let seenFirst = false;
  for (const a of args) {
    if (typeof a !== "string") continue;
    if (a.startsWith("-")) continue;
    if (!seenFirst) {
      seenFirst = true;
      continue;
    }
    return a;
  }
  return null;
}

function printPluginList(effectiveConfig) {
  const enabled = getEnabledPlugins(effectiveConfig);

  console.log(chalk.bold("\nPlugins:"));
  if (enabled.length === 0) {
    console.log(chalk.dim("(none enabled)"));
    console.log(chalk.dim(`Config: ${CONFIG_PATH}`));
    console.log("");
    return;
  }

  for (const id of enabled) {
    const loaded = tryLoadPlugin(id);
    if (loaded.ok) {
      console.log(`${chalk.green("✓")} ${id}`);
    } else {
      console.log(`${chalk.red("✗")} ${id}`);
      console.log(chalk.dim(`  → ${loaded.error}`));
    }
  }
  console.log(chalk.dim(`\nConfig: ${CONFIG_PATH}`));
  console.log("");
}

async function runPlugin({ prompt, argv, effectiveConfig }) {
  const flags = parsePluginArgs(argv);
  const args = Array.isArray(argv) ? argv : [];

  const sub = firstPositional(args);

  if (!sub || sub === "list") {
    printPluginList(effectiveConfig);
    return;
  }

  if (sub === "install") {
    const pluginId = secondPositional(args);
    if (!pluginId) {
      throw new Error(
        "Missing plugin id. Example: projectcli plugin install my-company"
      );
    }

    const cfg = loadConfig();
    const current = Array.isArray(cfg.plugins) ? cfg.plugins : [];
    const enabled = new Set(
      current.map((p) => String(p || "").trim()).filter(Boolean)
    );

    if (enabled.has(pluginId)) {
      console.log(chalk.dim(`\nAlready enabled: ${pluginId}`));
      return;
    }

    const loaded = tryLoadPlugin(pluginId);
    if (!loaded.ok) {
      console.log(
        chalk.yellow("\nNote: this command does not install packages.")
      );
      console.log(
        chalk.yellow(
          `It only enables a plugin that is already resolvable by Node: ${pluginId}`
        )
      );
    }

    if (flags.dryRun) {
      console.log(chalk.bold("\nPlanned actions:"));
      console.log(chalk.gray("- ") + chalk.yellow(`enable plugin ${pluginId}`));
      console.log("\nDry run: nothing executed.");
      return;
    }

    if (!flags.yes) {
      const { ok } = await prompt([
        {
          type: "confirm",
          name: "ok",
          message: `Enable plugin ${pluginId} in ${CONFIG_PATH}?`,
          default: true,
        },
      ]);
      if (!ok) return;
    }

    enabled.add(pluginId);
    saveConfig({ plugins: Array.from(enabled) });
    console.log(chalk.green(`\n✓ Enabled plugin: ${pluginId}`));
    console.log(chalk.dim(`Config: ${CONFIG_PATH}`));
    return;
  }

  throw new Error(
    `Unknown plugin subcommand: ${sub}. Try: projectcli plugin list | projectcli plugin install <id>`
  );
}

module.exports = {
  runPlugin,
};
