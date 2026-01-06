const test = require("node:test");
const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const { getGenerator } = require("../src/registry");

const SNAP_DIR = path.join(__dirname, "__snapshots__");

function sanitizeSteps(steps) {
  return (steps || []).map((s) => {
    const type = s.type || "command";
    if (type === "writeFile") {
      // Keep content, but normalize line endings to avoid platform diffs.
      return {
        ...s,
        content:
          typeof s.content === "string"
            ? s.content.replace(/\r\n/g, "\n")
            : s.content,
      };
    }
    return s;
  });
}

function snapshotPath(name) {
  return path.join(SNAP_DIR, `${name}.json`);
}

function assertSnapshot(name, value) {
  const p = snapshotPath(name);
  const serialized = JSON.stringify(value, null, 2) + "\n";

  const update = process.env.UPDATE_SNAPSHOTS === "1";

  if (!fs.existsSync(p)) {
    if (!update) {
      assert.fail(
        `Missing snapshot ${path.relative(
          process.cwd(),
          p
        )}. Re-run with UPDATE_SNAPSHOTS=1 to create it.`
      );
    }
    fs.writeFileSync(p, serialized, "utf8");
    return;
  }

  const existing = fs.readFileSync(p, "utf8");
  if (existing !== serialized) {
    if (update) {
      fs.writeFileSync(p, serialized, "utf8");
      return;
    }
    assert.equal(existing, serialized, `Snapshot mismatch: ${name}`);
  }
}

test("snapshot: Node.js (basic) generator", () => {
  const gen = getGenerator("JavaScript", "Node.js (basic)");
  assert.ok(gen, "generator missing");
  const steps = sanitizeSteps(
    gen.commands({ projectName: "demo-app", packageManager: "npm" })
  );
  assertSnapshot("js.node.basic", steps);
});

test("snapshot: HTML/CSS/JS (static) generator", () => {
  const gen = getGenerator("Others", "HTML/CSS");
  assert.ok(gen, "generator missing");
  const steps = sanitizeSteps(gen.commands({ projectName: "site" }));
  assertSnapshot("other.html", steps);
});
