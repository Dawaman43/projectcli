const { spawn } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

function runCommand({ program, args, cwd }) {
  return new Promise((resolve, reject) => {
    const child = spawn(program, args, {
      cwd,
      stdio: "inherit",
      shell: false,
    });

    child.on("error", (err) => {
      if (err && err.code === "ENOENT") {
        reject(new Error(`Command not found: ${program}`));
        return;
      }
      reject(err);
    });

    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${program} exited with code ${code}`));
    });
  });
}

function resolveUnderProject(projectRoot, relativePath) {
  const resolved = path.resolve(projectRoot, relativePath);
  const rel = path.relative(projectRoot, resolved);
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(
      `Refusing to write outside project folder: ${relativePath}`
    );
  }
  return resolved;
}

async function runStep(step, { projectRoot }) {
  const type = step.type || "command";

  if (type === "mkdir") {
    const target = resolveUnderProject(projectRoot, step.path);
    fs.mkdirSync(target, { recursive: true });
    return;
  }

  if (type === "writeFile") {
    const target = resolveUnderProject(projectRoot, step.path);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    const overwrite = Boolean(step.overwrite);
    if (!overwrite && fs.existsSync(target)) {
      throw new Error(`File already exists: ${target}`);
    }
    fs.writeFileSync(target, step.content, "utf8");
    return;
  }

  if (type === "command") {
    const cwd = step.cwdFromProjectRoot ? projectRoot : process.cwd();
    await runCommand({ program: step.program, args: step.args, cwd });
    return;
  }

  throw new Error(`Unknown step type: ${type}`);
}

async function runSteps(steps, { projectRoot }) {
  for (const step of steps) {
    await runStep(step, { projectRoot });
  }
}

module.exports = {
  runCommand,
  runSteps,
};
