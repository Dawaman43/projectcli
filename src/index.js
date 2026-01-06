const path = require("node:path");
const fs = require("node:fs");
const os = require("node:os");
const chalk = require("chalk");
const boxen = require("boxen");
const figlet = require("figlet");
const gradient = require("gradient-string");
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
const { checkBinaries } = require("./preflight");
const { gitClone, removeGitFolder } = require("./remote");
const { generateCI, generateDocker } = require("./cicd");
const { getDescription } = require("./descriptions");
const { detectLanguage, detectPackageManager } = require("./detect");
const { loadConfig } = require("./config");
const { runConfig } = require("./settings");

const RUST_KEYWORDS = new Set(
  [
    // Strict + reserved keywords (covers the common Cargo failure cases)
    "as",
    "break",
    "const",
    "continue",
    "crate",
    "else",
    "enum",
    "extern",
    "false",
    "fn",
    "for",
    "if",
    "impl",
    "in",
    "let",
    "loop",
    "match",
    "mod",
    "move",
    "mut",
    "pub",
    "ref",
    "return",
    "self",
    "Self",
    "static",
    "struct",
    "super",
    "trait",
    "true",
    "type",
    "unsafe",
    "use",
    "where",
    "while",
    "async",
    "await",
    "dyn",
    "union",
    // Reserved (historical / future)
    "abstract",
    "become",
    "box",
    "do",
    "final",
    "macro",
    "override",
    "priv",
    "try",
    "typeof",
    "unsized",
    "virtual",
    "yield",
  ].map(String)
);

function validateProjectNameForSelection({ language, framework }, name) {
  if (language === "Rust" && typeof framework === "string") {
    const usesCargo = framework.toLowerCase().includes("cargo");
    if (usesCargo && RUST_KEYWORDS.has(name)) {
      return `That name is a Rust keyword (${name}). Pick a different name.`;
    }
  }
  return true;
}

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
    yes: false,
    dryRun: false,
    language: undefined,
    framework: undefined,
    name: undefined,
    pm: undefined,
    ci: false,
    docker: false,
    learning: false,
    template: undefined,
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
    else if (a === "--yes" || a === "-y") out.yes = true;
    else if (a === "--dry-run") out.dryRun = true;
    else if (a === "--ci") out.ci = true;
    else if (a === "--docker") out.docker = true;
    else if (a === "--learning") out.learning = true;
    else if (a.startsWith("--template="))
      out.template = a.slice("--template=".length);
    else if (a === "--template") {
      out.template = nextValue(i);
      i++;
    } else if (a.startsWith("--language="))
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
  console.log("  projectcli config        # configure defaults");
  console.log("");
  console.log("Flags:");
  console.log("  --help, -h       Show help");
  console.log("  --version, -v    Show version");
  console.log("  --list           List available languages/frameworks");
  console.log("  --yes, -y        Skip confirmation");
  console.log("  --dry-run        Print planned actions, do nothing");
  console.log("  --language       Preselect language");
  console.log("  --framework      Preselect framework");
  console.log("  --name           Project folder name");
  console.log(
    "  --pm             Package manager for JS/TS (npm|pnpm|yarn|bun)"
  );
  console.log("  --ci             Auto-add GitHub Actions CI");
  console.log("  --docker         Auto-add Dockerfile");
  console.log("  --learning       Enable learning mode (shows descriptions)");
  console.log("  --template       Clone from a Git repository URL");
}

const BACK = "__back__";
const COMMUNITY = "Community / Remote";

function withBack(choices) {
  return [
    { name: "← Back", value: BACK },
    new inquirer.Separator(),
    ...choices,
  ];
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

function showBanner() {
  console.log("");
  console.log(
    gradient.pastel.multiline(
      figlet.textSync("ProjectCLI", { font: "Standard" })
    )
  );
  console.log(chalk.bold.magenta("  The Swiss Army Knife for Developers"));
  console.log(chalk.dim("  v" + readPackageVersion()));
  console.log("");
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

  if (
    !args.list &&
    !args.version &&
    !args.help &&
    rest.length === 0 &&
    cmd === "init"
  ) {
    showBanner();
  }

  if (args.help) {
    showBanner();
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

  if (cmd === "config") {
    await runConfig({ prompt });
    return;
  }

  // Smart Context Detection
  if (
    cmd === "init" &&
    rest.length === 0 &&
    !args.language &&
    !args.framework &&
    !args.template &&
    !args.name
  ) {
    const detected = detectLanguage(process.cwd());
    if (detected && detected !== "Unknown") {
      console.clear();
      console.log(
        gradient.pastel.multiline(
          figlet.textSync("ProjectCLI", { font: "Standard" })
        )
      );
      console.log(chalk.bold.magenta("  The Swiss Army Knife for Developers"));
      console.log("");
      console.log(
        chalk.green(`✓ Detected active ${chalk.bold(detected)} project.`)
      );

      const { action } = await prompt([
        {
          type: "list",
          name: "action",
          message: "What would you like to do?",
          choices: [
            { name: "Add Library / Dependency", value: "add" },
            { name: "Add GitHub Actions CI", value: "ci" },
            { name: "Add Dockerfile", value: "docker" },
            new inquirer.Separator(),
            { name: "Start New Project Here", value: "new" },
            { name: "Exit", value: "exit" },
          ],
        },
      ]);

      if (action === "exit") process.exit(0);

      if (action === "add") {
        // reuse the add logic, passing empty args so it detects locally
        await runAdd({ prompt, argv: [] });
        return;
      }

      if (action === "ci" || action === "docker") {
        const pm = detectPackageManager(process.cwd());
        let langArg = detected;
        if (detected === "JavaScript/TypeScript") langArg = "JavaScript";
        if (detected === "Java/Kotlin") langArg = "Java";

        const steps =
          action === "ci"
            ? generateCI(process.cwd(), langArg, pm)
            : generateDocker(process.cwd(), langArg);

        if (steps.length > 0) {
          console.log("\nApplying changes...");
          await runSteps(steps, { projectRoot: process.cwd() });
          console.log(chalk.green("Done!"));
        } else {
          console.log(
            chalk.yellow(
              "No standard template available for this language yet."
            )
          );
        }
        return;
      }

      // If 'new', fall through to normal wizard
    }
  }

  // Clear console for a fresh start
  console.clear();

  const title = figlet.textSync(" PROJECT CLI", { font: "Slant" });
  console.log(gradient.pastel.multiline(title));

  const subtitle = "   The Ultimate Interactive Project Generator   ";
  console.log(gradient.vice(subtitle));
  console.log(chalk.dim("   v" + readPackageVersion()));
  console.log("\n");

  console.log(
    chalk.cyan.bold(" ? ") +
      chalk.bold("Select a Language") +
      chalk.dim(" (Type to search)")
  );

  const languages = getLanguages();
  if (languages.length === 0) {
    throw new Error("No languages configured.");
  }

  const userConfig = loadConfig();

  const allowedPms = ["npm", "pnpm", "yarn", "bun"];
  let preselectedPm =
    typeof args.pm === "string" && allowedPms.includes(args.pm)
      ? args.pm
      : undefined;

  if (!preselectedPm && userConfig.packageManager) {
    if (allowedPms.includes(userConfig.packageManager)) {
      preselectedPm = userConfig.packageManager;
    }
  }

  if (userConfig.learningMode && args.learning === false) {
    args.learning = true;
  }

  const state = {
    template: args.template || undefined,
    language:
      args.language && languages.includes(args.language)
        ? args.language
        : undefined,
    framework: undefined,
    pm: preselectedPm,
    name: args.name && isSafeProjectName(args.name) ? args.name : undefined,
  };

  if (state.language) {
    const frameworksForLanguage = getFrameworks(state.language);
    state.framework =
      args.framework && frameworksForLanguage.includes(args.framework)
        ? args.framework
        : undefined;
  }

  const needsPackageManager =
    state.language === "JavaScript" || state.language === "TypeScript";

  let step = "language";
  if (state.template) {
    if (!state.name) step = "name";
    else step = "confirm";
  } else if (!state.language) step = "language";
  else if (!state.framework) step = "framework";
  else if (needsPackageManager && !state.pm) step = "pm";
  else if (!state.name) step = "name";
  else step = "confirm";

  while (true) {
    if (step === "language") {
      const languageChoices = languages.map((lang) => {
        const count = getFrameworks(lang).length;
        return { name: `${lang} (${count})`, value: lang, short: lang };
      });

      const languageQuestion = hasAutocomplete
        ? {
            type: "autocomplete",
            name: "language",
            message: "Language (type to search):",
            pageSize: 12,
            source: async (_answersSoFar, input) => {
              const q = String(input || "")
                .toLowerCase()
                .trim();
              if (!q) return languageChoices;
              // Fuzzy/Simple filter
              return languageChoices.filter((c) =>
                String(c.name).toLowerCase().includes(q)
              );
            },
          }
        : {
            type: "list",
            name: "language",
            message: "Language:",
            choices: languageChoices,
            pageSize: 12,
          };

      const { language } = await prompt([languageQuestion]);

      state.language = language;
      state.framework = undefined;
      if (!preselectedPm) state.pm = undefined;
      step = "framework";
      continue;
    }

    if (step === "framework") {
      const frameworks = getFrameworks(state.language);
      if (frameworks.length === 0) {
        throw new Error(`No frameworks configured for ${state.language}.`);
      }

      const frameworkChoices = frameworks.map((fw) => {
        const gen = getGenerator(state.language, fw);
        const note = gen?.notes ? ` — ${gen.notes}` : "";
        return { name: `${fw}${note}`, value: fw, short: fw };
      });

      const frameworkQuestion = hasAutocomplete
        ? {
            type: "autocomplete",
            name: "framework",
            message: "Framework (type to search):",
            pageSize: 12,
            source: async (_answersSoFar, input) => {
              const q = String(input || "")
                .toLowerCase()
                .trim();
              const backOption = { name: "← Back", value: BACK };
              if (!q) return [backOption, ...frameworkChoices];

              const filtered = frameworkChoices.filter((c) =>
                String(c.name).toLowerCase().includes(q)
              );
              return [backOption, ...filtered];
            },
          }
        : {
            type: "list",
            name: "framework",
            message: "Framework:",
            choices: withBack(frameworkChoices),
            pageSize: 12,
          };

      const answer = await prompt([frameworkQuestion]);
      if (answer.framework === BACK) {
        step = "language";
        continue;
      }

      state.framework = answer.framework;

      // Preflight Checks
      const gen = getGenerator(state.language, state.framework);
      if (gen && gen.check && gen.check.length > 0) {
        /* eslint-disable-next-line no-console */
        console.log(chalk.dim("\n(checking requirements...)"));
        const results = await checkBinaries(gen.check);
        const missing = results.filter((r) => !r.ok);

        if (missing.length > 0) {
          console.log(chalk.red.bold("\nMissing required tools:"));
          missing.forEach((m) => console.log(chalk.red(` - ${m.bin}`)));
          console.log(
            chalk.yellow("You may not be able to build or run this project.\n")
          );

          const { proceed } = await prompt([
            {
              type: "confirm",
              name: "proceed",
              message: "Continue anyway?",
              default: false,
            },
          ]);

          if (!proceed) {
            step = "framework";
            continue;
          }
        }
      }

      step = "pm";
      continue;
    }

    if (step === "pm") {
      const needsPackageManager =
        state.language === "JavaScript" || state.language === "TypeScript";

      if (!needsPackageManager) {
        state.pm = undefined;
        step = "name";
        continue;
      }

      if (state.pm) {
        step = "name";
        continue;
      }

      const { pm } = await prompt([
        {
          type: "list",
          name: "pm",
          message: "Package manager:",
          choices: withBack([
            { name: "npm (default)", value: "npm" },
            { name: "pnpm", value: "pnpm" },
            { name: "yarn", value: "yarn" },
            { name: "bun", value: "bun" },
          ]),
          pageSize: 10,
        },
      ]);

      if (pm === BACK) {
        step = "framework";
        continue;
      }

      state.pm = pm;
      step = "name";
      continue;
    }

    if (step === "name") {
      if (state.name) {
        step = "confirm";
        continue;
      }

      const { projectName } = await prompt([
        {
          type: "input",
          name: "projectName",
          message: "Project folder name (or type 'back'):",
          validate: (input) => {
            const v = String(input || "").trim();
            if (v.toLowerCase() === "back") return true;
            if (!isSafeProjectName(v)) {
              return "Use a simple folder name (no slashes).";
            }
            const target = path.resolve(process.cwd(), v);
            if (fs.existsSync(target)) {
              return "That folder already exists. Pick a different name.";
            }
            return validateProjectNameForSelection(
              { language: state.language, framework: state.framework },
              v
            );
          },
        },
      ]);

      const v = String(projectName || "").trim();
      if (v.toLowerCase() === "back") {
        if (state.template) {
          console.log("Operation cancelled.");
          process.exit(0);
        }
        step =
          state.language === "JavaScript" || state.language === "TypeScript"
            ? "pm"
            : "framework";
        continue;
      }

      state.name = v;
      step = "confirm";
      continue;
    }

    if (step === "confirm") {
      const projectRoot = path.resolve(process.cwd(), state.name);
      const targetExists = fs.existsSync(projectRoot);

      if (state.template) {
        if (targetExists && !args.dryRun) {
          console.error(
            `\nError: Target folder already exists: ${projectRoot}`
          );
          state.name = undefined;
          step = "name";
          continue;
        }

        console.log("\nProject Configuration:");
        console.log(`  Template: ${state.template}`);
        console.log(`  Folder:   ${state.name}`);
        console.log("");

        if (!args.yes) {
          const { action } = await prompt([
            {
              type: "list",
              name: "action",
              message: "Clone this template?",
              choices: [
                { name: "Clone template", value: "create" },
                { name: "Cancel", value: "cancel" },
              ],
            },
          ]);
          if (action === "cancel") {
            console.log("Aborted.");
            return;
          }
        }

        if (args.dryRun) {
          console.log(
            `[Dry Run] Would clone ${state.template} to ${projectRoot}`
          );
          return;
        }

        console.log(chalk.dim("\nCloning repository..."));
        try {
          await gitClone(state.template, projectRoot);
          // Remove .git to make it a fresh project
          removeGitFolder(projectRoot);

          console.log(
            chalk.green(`\nSuccess! Created project at ${projectRoot}`)
          );
          console.log(
            chalk.dim(
              "You may need to run 'npm install' or similar inside the folder."
            )
          );
        } catch (err) {
          console.error(chalk.red("\nFailed to clone template:"), err.message);
          process.exit(1);
        }
        return;
      }

      const generator = getGenerator(state.language, state.framework);
      if (!generator) {
        throw new Error("Generator not found (registry mismatch).");
      }

      if (targetExists && !args.dryRun) {
        console.error(`\nError: Target folder already exists: ${projectRoot}`);
        state.name = undefined;
        step = "name";
        continue;
      }

      const summaryLines = [
        `Project: ${state.name}`,
        `Language: ${state.language}`,
        `Framework: ${state.framework}`,
      ];
      if (state.pm) summaryLines.push(`Package manager: ${state.pm}`);

      if (args.learning) {
        const desc = getDescription(generator.id);
        console.log(
          chalk.cyan(
            boxen(desc, {
              padding: 1,
              title: `About ${state.framework}`,
              borderStyle: "round",
            })
          )
        );
      }

      console.log("\n" + summaryLines.join("\n") + "\n");

      if (targetExists && args.dryRun) {
        console.log(`Note: target folder already exists: ${projectRoot}`);
      }

      const steps = generator.commands({
        projectName: state.name,
        packageManager: state.pm,
      });

      if (args.dryRun) {
        printStepsPreview(steps);
        console.log("Dry run: nothing executed.");
        return;
      }

      if (!args.yes) {
        const { action } = await prompt([
          {
            type: "list",
            name: "action",
            message: "Continue?",
            choices: [
              { name: "Create project", value: "create" },
              { name: "← Back", value: "back" },
              { name: "Cancel", value: "cancel" },
            ],
            pageSize: 6,
          },
        ]);

        if (action === "cancel") return;
        if (action === "back") {
          state.name = undefined;
          step = "name";
          continue;
        }
      }

      const needsCwd = steps.some((s) => s.cwdFromProjectRoot);
      if (needsCwd) {
        fs.mkdirSync(projectRoot, { recursive: true });
      }

      console.log(`\nCreating: ${state.name}`);
      if (generator.notes) console.log(`Note: ${generator.notes}`);

      try {
        await runSteps(steps, { projectRoot });
      } catch (err) {
        const message = err && err.message ? err.message : String(err);
        console.error(`\nError: ${message}`);

        const looksLikeNameIssue =
          /cannot be used as a package name|Rust keyword|keyword|Cargo\.toml/i.test(
            message
          );

        if (args.yes) {
          throw err;
        }

        const { next } = await prompt([
          {
            type: "list",
            name: "next",
            message: "What next?",
            choices: [
              { name: "Try again (same settings)", value: "retry" },
              { name: "Change project name", value: "name" },
              { name: "← Back", value: "back" },
              { name: "Cancel", value: "cancel" },
            ],
            pageSize: 6,
            default: looksLikeNameIssue ? "name" : "retry",
          },
        ]);

        if (next === "cancel") return;
        if (next === "name") {
          state.name = undefined;
          step = "name";
          continue;
        }
        if (next === "back") {
          state.name = undefined;
          step = "name";
          continue;
        }

        // retry
        step = looksLikeNameIssue ? "name" : "confirm";
        if (step === "name") state.name = undefined;
        continue;
      }

      // Git init
      if (!args.dryRun) {
        let doGit = args.yes;
        if (!doGit) {
          const { git } = await prompt([
            {
              type: "confirm",
              name: "git",
              message: "Initialize a new git repository?",
              default: true,
            },
          ]);
          doGit = git;
        }

        if (doGit) {
          try {
            await runSteps(
              [
                { program: "git", args: ["init"], cwdFromProjectRoot: true },
                {
                  program: "git",
                  args: ["add", "."],
                  cwdFromProjectRoot: true,
                },
                {
                  program: "git",
                  args: ["commit", "-m", "Initial commit"],
                  cwdFromProjectRoot: true,
                },
              ],
              { projectRoot }
            );
            console.log("Initialized git repository.");
          } catch (e) {
            console.warn("Git init failed (is git installed?):", e.message);
          }
        }
      }

      // CI/CD & Docker
      if (!args.dryRun) {
        let wantCi = args.ci;
        let wantDocker = args.docker;

        if (!args.yes) {
          const { extras } = await prompt([
            {
              type: "checkbox",
              name: "extras",
              message: "Extras:",
              choices: [
                { name: "GitHub Actions CI", value: "ci", checked: wantCi },
                { name: "Dockerfile", value: "docker", checked: wantDocker },
              ],
            },
          ]);
          if (extras) {
            wantCi = extras.includes("ci");
            wantDocker = extras.includes("docker");
          }
        }

        const extraSteps = [];
        if (wantCi) {
          extraSteps.push(...generateCI(projectRoot, state.language, state.pm));
        }
        if (wantDocker) {
          extraSteps.push(...generateDocker(projectRoot, state.language));
        }

        if (extraSteps.length > 0) {
          console.log("Adding extras...");
          await runSteps(extraSteps, { projectRoot });
        }
      }

      console.log(`\nDone. Created project in: ${projectRoot}`);
      return;
    }

    throw new Error(`Unknown wizard step: ${step}`);
  }
}

module.exports = {
  main,
};
