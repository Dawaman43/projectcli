const fs = require("node:fs");
const path = require("node:path");
const chalk = require("chalk");

const { detectLanguage, detectPackageManager } = require("./detect");
const { generateCI, generateDocker } = require("./cicd");
const { generateDevContainer } = require("./devcontainer");
const { runSteps } = require("./run");

function readFileSafe(filePath) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return null;
  }
}

function normalizeNewlines(s) {
  return String(s || "").replace(/\r\n/g, "\n");
}

function parseUpgradeArgs(argv) {
  const out = {
    preview: false,
    yes: false,
    dryRun: false,
    only: null,
  };

  const args = Array.isArray(argv) ? argv : [];
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--preview") out.preview = true;
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--only") {
      out.only = args[i + 1] || null;
      i++;
    } else if (a.startsWith("--only=")) {
      out.only = a.slice("--only=".length) || null;
    }
  }

  if (typeof out.only === "string") {
    out.only = out.only.trim().toLowerCase();
  }

  return out;
}

function printStepsPreview(steps) {
  console.log(chalk.bold.cyan("\nPlanned actions:"));
  for (const step of steps) {
    const type = step.type || "command";
    if (type === "writeFile") {
      const mode = step.overwrite ? "update" : "write";
      console.log(chalk.gray("- ") + chalk.yellow(`${mode} ${step.path}`));
    } else if (type === "mkdir") {
      console.log(chalk.gray("- ") + chalk.yellow(`mkdir -p ${step.path}`));
    } else if (type === "command") {
      const where = step.cwdFromProjectRoot ? "(in project)" : "(here)";
      console.log(
        chalk.gray("- ") +
          chalk.green(`${step.program} ${(step.args || []).join(" ")}`) +
          chalk.dim(` ${where}`)
      );
    } else {
      console.log(chalk.gray(`- ${type}`));
    }
  }
  console.log("");
}

function computeCIUpgradeSteps(projectRoot, language, pm) {
  const langForTemplates =
    language === "JavaScript/TypeScript" ? "JavaScript" : language;
  const candidateSteps = generateCI(projectRoot, langForTemplates, pm);

  const out = [];
  for (const step of candidateSteps) {
    if (!step || step.type !== "writeFile" || typeof step.path !== "string")
      continue;

    const target = path.join(projectRoot, step.path);
    const existing = readFileSafe(target);
    const desired = step.content;

    if (existing !== null) {
      if (normalizeNewlines(existing) === normalizeNewlines(desired)) {
        continue; // already up-to-date
      }
    }

    out.push({ ...step, overwrite: true });
  }

  return out;
}

function computeDockerUpgradeSteps(projectRoot, language) {
  const langForTemplates =
    language === "JavaScript/TypeScript" ? "JavaScript" : language;
  const candidateSteps = generateDocker(projectRoot, langForTemplates);

  const out = [];
  for (const step of candidateSteps) {
    if (!step || step.type !== "writeFile" || typeof step.path !== "string")
      continue;

    const target = path.join(projectRoot, step.path);
    const existing = readFileSafe(target);
    const desired = step.content;

    if (existing !== null) {
      if (normalizeNewlines(existing) === normalizeNewlines(desired)) {
        continue;
      }
    }

    out.push({ ...step, overwrite: true });
  }

  return out;
}

function computeDevContainerUpgradeSteps(projectRoot, language) {
  const langForTemplates =
    language === "JavaScript/TypeScript" ? "JavaScript" : language;
  const candidateSteps = generateDevContainer(projectRoot, langForTemplates);

  const out = [];
  for (const step of candidateSteps) {
    if (!step) continue;
    if (step.type === "mkdir") {
      // Safe to keep; mkdir -p is idempotent.
      out.push(step);
      continue;
    }
    if (step.type !== "writeFile" || typeof step.path !== "string") continue;

    const target = path.join(projectRoot, step.path);
    const existing = readFileSafe(target);
    const desired = step.content;

    if (existing !== null) {
      if (normalizeNewlines(existing) === normalizeNewlines(desired)) {
        continue;
      }
    }

    out.push({ ...step, overwrite: true });
  }

  return out;
}

async function runUpgrade({ prompt, argv }) {
  const flags = parseUpgradeArgs(argv);
  const projectRoot = process.cwd();
  const language = detectLanguage(projectRoot);
  const pm = detectPackageManager(projectRoot);

  const only = flags.only;
  const wantCI = !only || only === "ci";
  const wantDocker = !only || only === "docker";
  const wantDevContainer = !only || only === "devcontainer";

  if (only && !wantCI && !wantDocker && !wantDevContainer) {
    throw new Error(
      `Unsupported --only value: ${only}. Supported: ci, docker, devcontainer`
    );
  }

  const steps = [];
  if (wantCI) {
    steps.push(...computeCIUpgradeSteps(projectRoot, language, pm));
  }

  if (wantDocker) {
    steps.push(...computeDockerUpgradeSteps(projectRoot, language));
  }

  if (wantDevContainer) {
    steps.push(...computeDevContainerUpgradeSteps(projectRoot, language));
  }

  console.log(chalk.bold("\nProjectCLI Upgrade"));
  console.log(chalk.dim(`Project: ${projectRoot}`));
  console.log(chalk.dim(`Detected: ${language} (${pm})`));

  if (steps.length === 0) {
    console.log(chalk.green("\nNothing to upgrade."));
    return;
  }

  printStepsPreview(steps);

  if (flags.preview || flags.dryRun) {
    console.log(
      chalk.dim(
        flags.preview
          ? "Preview: no changes applied."
          : "Dry run: nothing executed."
      )
    );
    return;
  }

  if (!flags.yes) {
    const { ok } = await prompt([
      {
        type: "confirm",
        name: "ok",
        message: "Apply these upgrades?",
        default: true,
      },
    ]);
    if (!ok) return;
  }

  await runSteps(steps, { projectRoot });
  console.log(chalk.green("\nDone."));
}

module.exports = {
  runUpgrade,
  parseUpgradeArgs,
};
