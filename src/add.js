const fs = require("node:fs");
const path = require("node:path");

const { detectLanguage, detectPackageManager } = require("./detect");
const { getCatalog } = require("./libraries");
const { pmAddCommand, pmExecCommand } = require("./pm");
const { runSteps } = require("./run");

function uniq(arr) {
  return Array.from(new Set(arr));
}

function parseAddArgs(argv) {
  const out = { yes: false, dryRun: false };
  const args = Array.isArray(argv) ? argv : [];
  for (const a of args) {
    if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--dry-run") out.dryRun = true;
  }
  return out;
}

function printStepsPreview(steps) {
  console.log("\nPlanned actions:");
  for (const step of steps) {
    const type = step.type || "command";
    if (type === "command") {
      const where = step.cwdFromProjectRoot ? "(in project)" : "(here)";
      console.log(`- ${step.program} ${step.args.join(" ")} ${where}`);
    } else if (type === "mkdir") {
      console.log(`- mkdir -p ${step.path}`);
    } else if (type === "writeFile") {
      console.log(`- write ${step.path}`);
    } else {
      console.log(`- ${type}`);
    }
  }
  console.log("");
}

async function runAdd({ prompt, argv }) {
  const flags = parseAddArgs(argv);
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

  const BACK = "__back__";
  const EXIT = "__exit__";

  let selectedCategory = null;
  let selectedLabels = null;

  while (true) {
    if (!selectedCategory) {
      const categoryChoices = [
        ...categories.map((c) => ({
          name: `${c} (${catalog[c].length})`,
          value: c,
        })),
        new (require("inquirer").Separator)(),
        { name: "Exit", value: EXIT },
      ];

      const { category } = await prompt([
        {
          type: "list",
          name: "category",
          message: "Category:",
          choices: categoryChoices,
          pageSize: 14,
        },
      ]);

      if (category === EXIT) return;
      selectedCategory = category;
      continue;
    }

    if (!selectedLabels) {
      const items = catalog[selectedCategory] || [];
      const { picks } = await prompt([
        {
          type: "checkbox",
          name: "picks",
          message: "Select libraries (space to toggle):",
          choices: items.map((i) => ({ name: i.label, value: i.label })),
          validate: (v) =>
            v && v.length ? true : "Pick at least one library.",
          pageSize: 14,
        },
      ]);

      selectedLabels = picks;

      const { next } = await prompt([
        {
          type: "list",
          name: "next",
          message: "Next:",
          choices: [
            { name: "Continue", value: "continue" },
            { name: "← Back", value: BACK },
            { name: "Cancel", value: EXIT },
          ],
          pageSize: 8,
        },
      ]);

      if (next === EXIT) return;
      if (next === BACK) {
        selectedLabels = null;
        selectedCategory = null;
        continue;
      }

      // continue
    }

    const items = catalog[selectedCategory] || [];
    const chosen = items.filter((i) => selectedLabels.includes(i.label));

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

      if (flags.dryRun) {
        printStepsPreview(steps);
        console.log("Dry run: nothing executed.");
        return;
      }

      if (!flags.yes) {
        const { ok } = await prompt([
          {
            type: "confirm",
            name: "ok",
            message: "Install selected libraries now?",
            default: true,
          },
        ]);
        if (!ok) {
          selectedLabels = null;
          continue;
        }
      }

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

      if (flags.dryRun) {
        console.log("\nPlanned actions:");
        if (mode === "pip") {
          console.log(`- python -m pip install ${all.join(" ")} (here)`);
        }
        console.log(`- append requirements.txt: ${all.join(", ")}`);
        console.log("\nDry run: nothing executed.");
        return;
      }

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
}

module.exports = {
  runAdd,
};
