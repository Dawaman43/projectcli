const test = require("node:test");
const assert = require("node:assert/strict");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");

const repoRoot = path.resolve(__dirname, "..");
const binPath = path.join(repoRoot, "bin", "projectcli.js");

function run(args, opts = {}) {
  const cwd = opts.cwd || repoRoot;
  const env = { ...process.env, ...(opts.env || {}) };

  const res = spawnSync(process.execPath, [binPath, ...args], {
    cwd,
    env,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  return {
    code: res.status,
    stdout: res.stdout || "",
    stderr: res.stderr || "",
  };
}

test("--help exits 0", () => {
  const r = run(["--help"]);
  assert.equal(r.code, 0);
  assert.match(r.stdout + r.stderr, /Usage:/);
});

test("--list exits 0", () => {
  const r = run(["--list"]);
  assert.equal(r.code, 0);
});

test("dry-run noninteractive init exits 0", () => {
  const r = run([
    "--dry-run",
    "--yes",
    "--language",
    "JavaScript",
    "--framework",
    "Vite (React)",
    "--name",
    "demo-app",
    "--pm",
    "npm",
  ]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout + r.stderr, /Dry run/i);
});

test("template dry-run exits 0 (does not clone)", () => {
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "projectcli-"));
  const r = run(
    [
      "--dry-run",
      "--template",
      "https://github.com/example/starter-repo",
      "--name",
      "my-remote-app",
      "--yes",
      "--ci",
      "--docker",
      "--devcontainer",
      "--no-license",
    ],
    { cwd: tmp }
  );
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout + r.stderr, /Would clone/i);
  assert.equal(
    fs.existsSync(path.join(tmp, "my-remote-app")),
    false,
    "dry-run should not create target folder"
  );
});

test("upgrade --preview --only ci exits 0", () => {
  const r = run(["upgrade", "--preview", "--only", "ci"]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout + r.stderr, /Upgrade/i);
});

test("add ci --dry-run --yes exits 0", () => {
  const r = run(["add", "ci", "--dry-run", "--yes"]);
  assert.equal(r.code, 0, r.stderr);
  assert.match(r.stdout + r.stderr, /Dry run/i);
});
