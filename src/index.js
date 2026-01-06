const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const inquirerImport = require("inquirer");
const inquirer = inquirerImport.default ?? inquirerImport;
const prompt =
  typeof inquirer?.prompt === "function"
    ? inquirer.prompt.bind(inquirer)
    : typeof inquirer?.createPromptModule === "function"
    ? inquirer.createPromptModule()
    : null;

let hasAutocomplete = false;
try {
  if (typeof inquirer?.registerPrompt === "function") {
    const autocomplete = require("inquirer-autocomplete-prompt");
    inquirer.registerPrompt("autocomplete", autocomplete);
    hasAutocomplete = true;
  }
} catch {
  hasAutocomplete = false;
}

const { getLanguages, getFrameworks, getGenerator } = require("./registry");
const { runSteps } = require("./run");
const { runAdd } = require("./add");

function isSafeProjectName(name) {
  // Avoid path traversal / empty names; keep permissive.
  if (!name) return false;
  if (name.includes("..")) return false;
  if (name.includes(path.sep)) return false;
  if (name.includes("/")) return false;
  if (name.includes("\\")) return false;
  return true;
}

function readPackageVersion() {
  try {
    const pkgPath = path.resolve(__dirname, "..", "package.json");
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
    return pkg.version || "0.0.0";
  } catch {
    return "0.0.0";
  }
}

function parseArgs(argv) {
  const out = {
    help: false,
    version: false,
    list: false,
    language: undefined,
    framework: undefined,
    name: undefined,
    pm: undefined,
  };

  const nextValue = (i) => {
    if (i + 1 >= argv.length) return undefined;
    return argv[i + 1];
  };

  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") out.help = true;
    else if (a === "--version" || a === "-v") out.version = true;
    else if (a === "--list") out.list = true;
    else if (a.startsWith("--language="))
      out.language = a.slice("--language=".length);
    else if (a === "--language") {
      out.language = nextValue(i);
      i++;
    } else if (a.startsWith("--framework="))
      out.framework = a.slice("--framework=".length);
    else if (a === "--framework") {
      out.framework = nextValue(i);
      i++;
    } else if (a.startsWith("--name=")) out.name = a.slice("--name=".length);
    else if (a === "--name") {
      out.name = nextValue(i);
      i++;
    } else if (a.startsWith("--pm=")) out.pm = a.slice("--pm=".length);
    else if (a === "--pm" || a === "--package-manager") {
      out.pm = nextValue(i);
      i++;
    }
  }

  return out;
}

function splitCommand(argv) {
  if (!argv || argv.length === 0) return { cmd: "init", rest: [] };
  const first = argv[0];
  if (typeof first === "string" && !first.startsWith("-")) {
    if (first === "init" || first === "add") {
      return { cmd: first, rest: argv.slice(1) };
    }
  }
  return { cmd: "init", rest: argv };
}

function printHelp() {
  console.log("projectcli - interactive project generator");
  console.log("");
  console.log("Usage:");
  console.log("  projectcli               # init a new project");
  console.log("  projectcli init          # init a new project");
  console.log("  projectcli add           # add libraries to current project");
  console.log("  projectcli --list        # list all frameworks");
  console.log(
    "  projectcli --language <lang> --framework <fw> --name <project>"
  );
  console.log("");
  console.log("Flags:");
  console.log("  --help, -h       Show help");
  console.log("  --version, -v    Show version");
  console.log("  --list           List available languages/frameworks");
  console.log("  --language       Preselect language");
  console.log("  --framework      Preselect framework");
  console.log("  --name           Project folder name");
  console.log(
    "  --pm             Package manager for JS/TS (npm|pnpm|yarn|bun)"
  );
}

function printList() {
  for (const lang of getLanguages()) {
    console.log(`${lang}:`);
    for (const fw of getFrameworks(lang)) {
      const gen = getGenerator(lang, fw);
      const note = gen?.notes ? ` - ${gen.notes}` : "";
      console.log(`  - ${fw}${note}`);
    }
  }
}

async function main(options = {}) {
  if (!prompt) {
    throw new Error(
      "Unable to initialize prompts (inquirer import shape not supported)."
    );
  }

  const argv = options.argv || [];
  const { cmd, rest } = splitCommand(argv);
  const args = parseArgs(rest);
  if (args.help) {
    printHelp();
    return;
  }
  if (args.version) {
    console.log(readPackageVersion());
    return;
  }
  if (args.list) {
    printList();
    return;
  }

  if (cmd === "add") {
    await runAdd({ prompt, argv: rest });
    return;
  }

  console.log("\nprojectcli");
  console.log("Create a project in seconds.");
  console.log(`Host: ${os.platform()} ${os.arch()}\n`);

  const languages = getLanguages();
  if (languages.length === 0) {
    throw new Error("No languages configured.");
  }

  const languageChoices = languages.map((lang) => {
    const count = getFrameworks(lang).length;
    return { name: `${lang} (${count})`, value: lang, short: lang };
  });

  const selectedLanguage =
    args.language && languages.includes(args.language)
      ? args.language
      : (
          await prompt([
            {
              type: "list",
              name: "language",
              message: "Choose a language:",
              choices: languageChoices,
              pageSize: 12,
            },
          ])
        ).language;

  const frameworks = getFrameworks(selectedLanguage);
  if (frameworks.length === 0) {
    throw new Error(`No frameworks configured for ${selectedLanguage}.`);
  }

  const frameworkChoices = frameworks.map((fw) => {
    const gen = getGenerator(selectedLanguage, fw);
    const note = gen?.notes ? ` — ${gen.notes}` : "";
    return { name: `${fw}${note}`, value: fw, short: fw };
  });

  const selectedFramework =
    args.framework && frameworks.includes(args.framework)
      ? args.framework
      : hasAutocomplete && frameworkChoices.length > 12
      ? (
          await prompt([
            {
              type: "autocomplete",
              name: "framework",
              message: "Choose a framework (type to search):",
              pageSize: 12,
              source: async (_answersSoFar, input) => {
                const q = String(input || "")
                  .toLowerCase()
                  .trim();
                if (!q) return frameworkChoices;
                return frameworkChoices.filter((c) =>
                  String(c.name).toLowerCase().includes(q)
                );
              },
            },
          ])
        ).framework
      : (
          await prompt([
            {
              type: "list",
              name: "framework",
              message: "Choose a framework:",
              choices: frameworkChoices,
              pageSize: 12,
            },
          ])
        ).framework;

  const needsPackageManager =
    selectedLanguage === "JavaScript" || selectedLanguage === "TypeScript";

  const allowedPms = ["npm", "pnpm", "yarn", "bun"];
  const preselectedPm =
    typeof args.pm === "string" && allowedPms.includes(args.pm)
      ? args.pm
      : undefined;

  const packageManager = needsPackageManager
    ? preselectedPm ||
      (
        await prompt([
          {
            type: "list",
            name: "pm",
            message: "Package manager:",
            choices: [
              { name: "npm (default)", value: "npm" },
              { name: "pnpm", value: "pnpm" },
              { name: "yarn", value: "yarn" },
              { name: "bun", value: "bun" },
            ],
            default: "npm",
          },
        ])
      ).pm
    : undefined;

  const generator = getGenerator(selectedLanguage, selectedFramework);
  if (!generator) {
    throw new Error("Generator not found (registry mismatch).");
  }

  const projectName =
    args.name && isSafeProjectName(args.name)
      ? args.name
      : (
          await prompt([
            {
              type: "input",
              name: "projectName",
              message: "Project name (folder):",
              validate: (input) =>
                isSafeProjectName(input)
                  ? true
                  : "Use a simple folder name (no slashes).",
            },
          ])
        ).projectName;

  const projectRoot = path.resolve(process.cwd(), projectName);
  if (fs.existsSync(projectRoot)) {
    throw new Error(`Target folder already exists: ${projectRoot}`);
  }

  const { ok } = await prompt([
    {
      type: "confirm",
      name: "ok",
      message: `Create '${projectName}' using ${selectedLanguage} / ${selectedFramework}?`,
      default: true,
    },
  ]);
  if (!ok) return;

  console.log(`\nCreating: ${projectName}`);
  console.log(`Language: ${selectedLanguage}`);
  console.log(`Framework: ${selectedFramework}`);
  if (packageManager) console.log(`Package manager: ${packageManager}`);
  if (generator.notes) console.log(`Note: ${generator.notes}`);

  // Some generators create the folder themselves (e.g., npm create vite, cargo new).
  // Others expect the folder to exist and run inside it.
  // We'll create the folder upfront only if any step needs cwdFromProjectRoot.
  const steps = generator.commands({
    projectName,
    packageManager,
  });
  const needsCwd = steps.some((s) => s.cwdFromProjectRoot);
  if (needsCwd) {
    fs.mkdirSync(projectRoot, { recursive: true });
  }

  await runSteps(steps, { projectRoot });

  console.log(`\nDone. Created project in: ${projectRoot}`);
}

module.exports = {
  main,
};
