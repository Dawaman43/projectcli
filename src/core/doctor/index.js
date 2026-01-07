const fs = require("node:fs");
const path = require("node:path");
const chalk = require("chalk");

const { detectLanguage, detectPackageManager } = require("../../detect");
const { generateCI, generateDocker } = require("../../cicd");
const { generateLicense, licenseTypes } = require("../../license");
const { pmAddCommand } = require("../../pm");
const { runSteps } = require("../../run");
const { getPreset } = require("../../presets");

function exists(projectRoot, relPath) {
  return fs.existsSync(path.join(projectRoot, relPath));
}

function listFilesSafe(dir) {
  try {
    return fs.readdirSync(dir);
  } catch {
    return [];
  }
}

function detectGitHubActions(projectRoot) {
  const workflowsDir = path.join(projectRoot, ".github", "workflows");
  const files = listFilesSafe(workflowsDir);
  return files.some((f) => f.endsWith(".yml") || f.endsWith(".yaml"));
}

function readJsonSafe(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return null;
  }
}

function detectNodeTooling(projectRoot) {
  const pkgPath = path.join(projectRoot, "package.json");
  const pkg = readJsonSafe(pkgPath) || {};
  const deps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };

  const hasPrettier =
    Boolean(deps.prettier) ||
    exists(projectRoot, ".prettierrc") ||
    exists(projectRoot, ".prettierrc.json") ||
    exists(projectRoot, ".prettierrc.yml") ||
    exists(projectRoot, ".prettierrc.yaml") ||
    exists(projectRoot, ".prettierrc.js") ||
    exists(projectRoot, "prettier.config.js") ||
    Boolean(pkg.prettier);

  const hasEslint =
    Boolean(deps.eslint) ||
    exists(projectRoot, "eslint.config.js") ||
    exists(projectRoot, ".eslintrc") ||
    exists(projectRoot, ".eslintrc.json") ||
    exists(projectRoot, ".eslintrc.js") ||
    exists(projectRoot, ".eslintrc.cjs") ||
    Boolean(pkg.eslintConfig);

  const scripts = pkg.scripts || {};
  const hasTests =
    Boolean(scripts.test) ||
    exists(projectRoot, "test") ||
    exists(projectRoot, "tests") ||
    Boolean(deps.vitest) ||
    Boolean(deps.jest) ||
    Boolean(deps.mocha);

  return { hasPrettier, hasEslint, hasTests };
}

function filterExistingWriteFiles(steps, projectRoot) {
  const kept = [];
  const skipped = [];
  for (const step of steps || []) {
    if (step && step.type === "writeFile" && typeof step.path === "string") {
      const target = path.resolve(projectRoot, step.path);
      if (fs.existsSync(target)) {
        skipped.push(step.path);
        continue;
      }
    }
    kept.push(step);
  }
  return { kept, skipped };
}

function printStepsPreview(steps) {
  console.log(chalk.bold.cyan("\nPlanned actions:"));
  for (const step of steps) {
    const type = step.type || "command";
    if (type === "command") {
      const where = step.cwdFromProjectRoot ? "(in project)" : "(here)";
      console.log(
        chalk.gray("- ") +
          chalk.green(`${step.program} ${(step.args || []).join(" ")}`) +
          chalk.dim(` ${where}`)
      );
    } else if (type === "mkdir") {
      console.log(chalk.gray("- ") + chalk.yellow(`mkdir -p ${step.path}`));
    } else if (type === "writeFile") {
      console.log(chalk.gray("- ") + chalk.yellow(`write ${step.path}`));
    } else {
      console.log(chalk.gray(`- ${type}`));
    }
  }
  console.log("");
}

function parseDoctorArgs(argv) {
  const out = {
    fix: false,
    json: false,
    ciOnly: false,
    yes: false,
    dryRun: false,
  };

  const args = Array.isArray(argv) ? argv : [];
  for (const a of args) {
    if (a === "--fix") out.fix = true;
    else if (a === "--json") out.json = true;
    else if (a === "--ci-only") out.ciOnly = true;
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--dry-run") out.dryRun = true;
  }

  return out;
}

function formatCheckLine(check) {
  const symbol = check.ok ? chalk.green("✓") : chalk.red("✗");
  return `${symbol} ${check.title}`;
}

async function runDoctor({ prompt, argv, effectiveConfig }) {
  const flags = parseDoctorArgs(argv);
  const projectRoot = process.cwd();
  const language = detectLanguage(projectRoot);
  const pm = detectPackageManager(projectRoot);

  const presetId =
    typeof effectiveConfig?.preset === "string" && effectiveConfig.preset.trim()
      ? effectiveConfig.preset.trim()
      : "startup";
  const preset = getPreset(presetId);
  const presetDefaults = preset?.defaults || {};

  const checks = [];

  const hasCI = detectGitHubActions(projectRoot);
  const hasDocker = exists(projectRoot, "Dockerfile");
  const hasLicense =
    exists(projectRoot, "LICENSE") || exists(projectRoot, "LICENSE.md");

  const langForTemplates =
    language === "JavaScript/TypeScript" ? "JavaScript" : language;

  if (!flags.ciOnly) {
    checks.push({
      id: "missing-ci",
      title: `GitHub Actions CI (${langForTemplates})`,
      ok: Boolean(hasCI),
      fixable: langForTemplates !== "Unknown",
      fixId: "add-ci",
    });
  } else {
    checks.push({
      id: "missing-ci",
      title: `GitHub Actions CI (${langForTemplates})`,
      ok: Boolean(hasCI),
      fixable: langForTemplates !== "Unknown",
      fixId: "add-ci",
    });
  }

  if (!flags.ciOnly) {
    checks.push({
      id: "missing-docker",
      title: "Dockerfile",
      ok: Boolean(hasDocker),
      fixable: langForTemplates !== "Unknown",
      fixId: "add-docker",
    });

    checks.push({
      id: "missing-license",
      title: "LICENSE",
      ok: Boolean(hasLicense),
      fixable: true,
      fixId: "add-license",
    });

    if (language === "JavaScript/TypeScript") {
      const node = detectNodeTooling(projectRoot);

      checks.push({
        id: "missing-formatter",
        title: "Formatter (Prettier)",
        ok: Boolean(node.hasPrettier),
        fixable: pm === "npm" || pm === "pnpm" || pm === "yarn" || pm === "bun",
        fixId: "add-prettier",
      });

      checks.push({
        id: "missing-linter",
        title: "Linter (ESLint)",
        ok: Boolean(node.hasEslint),
        fixable: pm === "npm" || pm === "pnpm" || pm === "yarn" || pm === "bun",
        fixId: "add-eslint",
      });

      checks.push({
        id: "missing-tests",
        title: "Tests",
        ok: Boolean(node.hasTests),
        fixable: pm === "npm" || pm === "pnpm" || pm === "yarn" || pm === "bun",
        fixId: "add-vitest",
      });
    }
  }

  const ok = checks.every((c) => c.ok);

  if (flags.json) {
    console.log(
      JSON.stringify(
        {
          ok,
          projectRoot,
          language,
          packageManager: pm,
          checks,
        },
        null,
        2
      )
    );
    process.exitCode = ok ? 0 : 1;
    return;
  }

  console.log(chalk.bold(`\nProjectCLI Doctor`));
  console.log(chalk.dim(`Project: ${projectRoot}`));
  console.log(chalk.dim(`Detected: ${language} (${pm})\n`));

  for (const check of checks) {
    console.log(formatCheckLine(check));
  }

  const missingFixable = checks.filter((c) => !c.ok && c.fixable);
  if (missingFixable.length === 0) {
    if (!ok) {
      console.log(
        chalk.yellow(
          "\nSome checks failed, but there are no safe automatic fixes for this project yet."
        )
      );
    } else {
      console.log(chalk.green("\nAll good."));
    }
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const shouldFix = flags.fix
    ? true
    : await (async () => {
        const { go } = await prompt([
          {
            type: "confirm",
            name: "go",
            message: "\nFix now?",
            default: true,
          },
        ]);
        return Boolean(go);
      })();

  if (!shouldFix) {
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const defaultFixEnabled = (fixId) => {
    if (!fixId) return true;
    if (fixId === "add-ci") return presetDefaults?.extras?.ci !== false;
    if (fixId === "add-docker") return presetDefaults?.extras?.docker === true;
    if (fixId === "add-license")
      return presetDefaults?.extras?.license !== false;

    if (fixId === "add-prettier") return presetDefaults?.js?.formatter === true;
    if (fixId === "add-eslint") return presetDefaults?.js?.linter === true;
    if (fixId === "add-vitest") return presetDefaults?.js?.tests === true;
    return true;
  };

  const selectable = missingFixable.map((c) => ({
    name: c.title,
    value: c.fixId,
    checked: defaultFixEnabled(c.fixId),
  }));

  const selectedFixIds = flags.yes
    ? selectable.filter((s) => s.checked).map((s) => s.value)
    : (
        await prompt([
          {
            type: "checkbox",
            name: "picked",
            message: "Select fixes to apply:",
            choices: selectable,
          },
        ])
      ).picked;

  const fixIds = Array.isArray(selectedFixIds) ? selectedFixIds : [];
  if (fixIds.length === 0) {
    console.log(chalk.dim("\nNo fixes selected."));
    process.exitCode = ok ? 0 : 1;
    return;
  }

  const steps = [];

  if (fixIds.includes("add-ci")) {
    steps.push(...generateCI(projectRoot, langForTemplates, pm));
  }

  if (fixIds.includes("add-docker")) {
    steps.push(...generateDocker(projectRoot, langForTemplates));
  }

  if (fixIds.includes("add-license")) {
    const type =
      typeof effectiveConfig?.license === "string" &&
      licenseTypes.includes(effectiveConfig.license)
        ? effectiveConfig.license
        : "MIT";
    const author =
      typeof effectiveConfig?.author === "string" &&
      effectiveConfig.author.trim()
        ? effectiveConfig.author.trim()
        : "The Authors";

    steps.push(...generateLicense(projectRoot, type, author));
  }

  if (fixIds.includes("add-prettier")) {
    const cmd = pmAddCommand(pm, ["prettier"], { dev: true });
    steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
    steps.push({
      type: "writeFile",
      path: ".prettierrc.json",
      content:
        JSON.stringify({ semi: true, singleQuote: false }, null, 2) + "\n",
    });
  }

  if (fixIds.includes("add-eslint")) {
    const cmd = pmAddCommand(pm, ["eslint"], { dev: true });
    steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
    steps.push({
      type: "writeFile",
      path: "eslint.config.js",
      content:
        "export default [\n" +
        "  {\n" +
        '    files: ["**/*.js", "**/*.cjs", "**/*.mjs"],\n' +
        "    languageOptions: { ecmaVersion: 2022 },\n" +
        "    rules: {\n" +
        '      "no-unused-vars": "warn",\n' +
        '      "no-undef": "error",\n' +
        "    },\n" +
        "  },\n" +
        "];\n",
    });
  }

  if (fixIds.includes("add-vitest")) {
    const cmd = pmAddCommand(pm, ["vitest"], { dev: true });
    steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
  }

  const { kept, skipped } = filterExistingWriteFiles(steps, projectRoot);

  if (flags.dryRun) {
    printStepsPreview(kept);
    if (skipped.length > 0) {
      console.log(chalk.dim(`Skipped existing files: ${skipped.join(", ")}`));
    }
    console.log("Dry run: nothing executed.");
    return;
  }

  printStepsPreview(kept);

  if (!flags.yes) {
    const { ok: proceed } = await prompt([
      {
        type: "confirm",
        name: "ok",
        message: "Proceed?",
        default: true,
      },
    ]);
    if (!proceed) return;
  }

  if (kept.length > 0) {
    await runSteps(kept, { projectRoot });
  }

  if (skipped.length > 0) {
    console.log(chalk.dim(`Skipped existing files: ${skipped.join(", ")}`));
  }

  console.log(chalk.green("\nDone."));
}

module.exports = {
  runDoctor,
  parseDoctorArgs,
};
