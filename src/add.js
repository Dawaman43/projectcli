const fs = require("node:fs");
const path = require("node:path");
const chalk = require("chalk");
const Fuse = require("fuse.js");
const inquirerImport = require("inquirer");
const inquirer = inquirerImport.default ?? inquirerImport;

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
  console.log(chalk.bold.cyan("\nPlanned actions:"));
  for (const step of steps) {
    const type = step.type || "command";
    if (type === "command") {
      const where = step.cwdFromProjectRoot ? "(in project)" : "(here)";
      console.log(
        chalk.gray("- ") +
          chalk.green(`${step.program} ${step.args.join(" ")}`) +
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

async function runAdd({ prompt, argv }) {
  const flags = parseAddArgs(argv);
  const cwd = process.cwd();
  const language = detectLanguage(cwd);
  const pm = detectPackageManager(cwd); // Now returns pip, poetry, cargo, go, etc.

  if (language === "Unknown") {
    throw new Error(
      "Couldn't detect project type here. Run inside a project folder (package.json, pyproject.toml, go.mod, etc.)."
    );
  }

  console.log(chalk.bold(`\nDetected project: ${chalk.blue(language)}`));
  console.log(chalk.dim(`Detected package manager: ${pm}`));

  const catalog = getCatalog(language);
  const categories = Object.keys(catalog);
  if (categories.length === 0) {
    throw new Error(`No library catalog configured for: ${language}`);
  }

  // Flatten catalog for fuzzy search
  const allItems = [];
  for (const cat of categories) {
    for (const item of catalog[cat]) {
      allItems.push({
        ...item,
        category: cat,
        displayName: `${cat}: ${item.label}`,
      });
    }
  }

  const fuse = new Fuse(allItems, {
    keys: ["label", "category"],
    threshold: 0.4,
  });

  const BACK = "__back__";
  const EXIT = "__exit__";

  let selectedItems = [];

  while (true) {
    // If we have selected items, show them
    if (selectedItems.length > 0) {
      console.log(chalk.green(`\nSelected:`));
      selectedItems.forEach((i) => console.log(` - ${i.displayName}`));
    }

    const choices = [
      { name: "Done (Install selected)", value: "DONE" },
      { name: "Search libraries (Fuzzy)", value: "SEARCH" },
      { name: "Browse by Category", value: "BROWSE" },
      new inquirer.Separator(),
      { name: "Exit", value: EXIT },
    ];

    const { action } = await prompt([
      {
        type: "list",
        name: "action",
        message: "What do you want to do?",
        choices,
        pageSize: 10,
      },
    ]);

    if (action === EXIT) return;

    if (action === "SEARCH") {
      // Fuzzy search
      const { item } = await prompt([
        {
          type: "autocomplete",
          name: "item",
          message: "Search library:",
          source: (answersSoFar, input) => {
            if (!input)
              return Promise.resolve(
                allItems.map((i) => ({ name: i.displayName, value: i }))
              );
            return Promise.resolve(
              fuse
                .search(input)
                .map((r) => ({ name: r.item.displayName, value: r.item }))
            );
          },
        },
      ]);
      if (item) {
        if (!selectedItems.find((i) => i.label === item.label)) {
          selectedItems.push(item);
        }
      }
      continue;
    }

    if (action === "BROWSE") {
      const { category } = await prompt([
        {
          type: "list",
          name: "category",
          message: "Category:",
          choices: [...categories, { name: "Back", value: BACK }],
        },
      ]);
      if (category === BACK) continue;

      const items = catalog[category];
      const { picked } = await prompt([
        {
          type: "checkbox",
          name: "picked",
          message: "Select libraries:",
          choices: items.map((i) => ({
            name: i.label,
            value: i,
            checked: !!selectedItems.find((s) => s.label === i.label),
          })),
        },
      ]);

      for (const p of picked) {
        if (!selectedItems.find((i) => i.label === p.label)) {
          selectedItems.push(p);
        }
      }
      continue;
    }

    if (action === "DONE") {
      if (selectedItems.length === 0) {
        console.log(chalk.yellow("No libraries selected. Exiting."));
        return;
      }
      break;
    }
  }

  // Install phase
  const packages = uniq(selectedItems.flatMap((i) => i.packages || []));
  const packagesDev = uniq(selectedItems.flatMap((i) => i.packagesDev || []));
  const posts = uniq(selectedItems.map((i) => i.post).filter(Boolean));

  const steps = [];

  // Generic handling based on 'pm'
  if (packages.length) {
    const cmd = pmAddCommand(pm, packages, { dev: false });
    steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
  }

  if (packagesDev.length) {
    const cmd = pmAddCommand(pm, packagesDev, { dev: true });
    steps.push({ type: "command", ...cmd, cwdFromProjectRoot: true });
  }

  // Post install steps
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
    printStepsPreview(steps);
    const { ok } = await prompt([
      {
        type: "confirm",
        name: "ok",
        message: "Proceed with installation?",
        default: true,
      },
    ]);
    if (!ok) return;
  }

  await runSteps(steps, { projectRoot: cwd });
  console.log(chalk.green("\nDone. Libraries added."));
}

module.exports = {
  runAdd,
};
