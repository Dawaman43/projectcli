const fs = require("node:fs");
const path = require("node:path");

const { detectLanguage, detectPackageManager } = require("./detect");
const { getCatalog } = require("./libraries");
const { pmAddCommand, pmExecCommand } = require("./pm");
const { runSteps } = require("./run");

function uniq(arr) {
  return Array.from(new Set(arr));
}

async function runAdd({ prompt, argv }) {
  const cwd = process.cwd();
  const language = detectLanguage(cwd);
  const pm = detectPackageManager(cwd);

  if (language === "Unknown") {
    throw new Error(
      "Couldn't detect project type here. Run inside a project folder (package.json, pyproject.toml, go.mod, etc.)."
    );
  }

  console.log(`\nDetected project: ${language}`);
  if (language === "JavaScript/TypeScript") {
    console.log(`Detected package manager: ${pm}`);
  }

  const catalog = getCatalog(language);
  const categories = Object.keys(catalog);
  if (categories.length === 0) {
    throw new Error(`No library catalog configured for: ${language}`);
  }

  const categoryChoices = categories.map((c) => ({
    name: `${c} (${catalog[c].length})`,
    value: c,
  }));

  const { category } = await prompt([
    {
      type: "list",
      name: "category",
      message: "Choose a category:",
      choices: categoryChoices,
      pageSize: 12,
    },
  ]);

  const items = catalog[category] || [];
  const { picks } = await prompt([
    {
      type: "checkbox",
      name: "picks",
      message: "Select libraries to add:",
      choices: items.map((i) => ({ name: i.label, value: i.label })),
      validate: (v) => (v && v.length ? true : "Pick at least one library."),
      pageSize: 14,
    },
  ]);

  const chosen = items.filter((i) => picks.includes(i.label));

  const packages = uniq(chosen.flatMap((i) => i.packages || []));
  const packagesDev = uniq(chosen.flatMap((i) => i.packagesDev || []));
  const posts = uniq(chosen.map((i) => i.post).filter(Boolean));

  const steps = [];

  if (language === "JavaScript/TypeScript") {
    if (!fs.existsSync(path.join(cwd, "package.json"))) {
      throw new Error(
        "No package.json found; run this inside a JS/TS project."
      );
    }

    if (packages.length) {
      const cmd = pmAddCommand(pm, packages, { dev: false });
      steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
    }
    if (packagesDev.length) {
      const cmd = pmAddCommand(pm, packagesDev, { dev: true });
      steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
    }

    // Optional post-steps
    for (const post of posts) {
      if (post === "tailwind-init") {
        const cmd = pmExecCommand(pm, "tailwindcss", ["init", "-p"]);
        steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
      }
      if (post === "playwright-install") {
        const cmd = pmExecCommand(pm, "playwright", ["install"]);
        steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
      }
      if (post === "shadcn-init") {
        // shadcn/ui uses a CLI; keep it interactive.
        const cmd = pmExecCommand(pm, "shadcn@latest", ["init"]);
        steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
      }
    }

    const { ok } = await prompt([
      {
        type: "confirm",
        name: "ok",
        message: "Install selected libraries now?",
        default: true,
      },
    ]);
    if (!ok) return;

    await runSteps(steps, { projectRoot: cwd });
    console.log("\nDone. Libraries added.");
    return;
  }

  if (language === "Python") {
    const all = uniq([...packages, ...packagesDev]);
    const { mode } = await prompt([
      {
        type: "list",
        name: "mode",
        message: "How to add Python packages?",
        choices: [
          {
            name: "Append to requirements.txt (no install)",
            value: "requirements",
          },
          {
            name: "pip install now (and append requirements.txt)",
            value: "pip",
          },
        ],
        default: "requirements",
      },
    ]);

    const reqPath = path.join(cwd, "requirements.txt");
    const toAppend = all.map((p) => `${p}\n`).join("");

    if (mode === "pip") {
      await runSteps(
        [
          {
            type: "command",
            program: "python",
            args: ["-m", "pip", "install", ...all],
            cwdFromProjectRoot: true,
          },
        ],
        { projectRoot: cwd }
      );
    }

    fs.appendFileSync(reqPath, toAppend, "utf8");
    console.log("\nDone. Updated requirements.txt");
    return;
  }

  throw new Error(`Add mode not implemented yet for: ${language}`);
}

module.exports = {
  runAdd,
};
