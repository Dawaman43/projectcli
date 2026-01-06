const fs = require("node:fs");
const path = require("node:path");

function readChangelog() {
  const p = path.resolve(__dirname, "..", "CHANGELOG.md");
  return fs.readFileSync(p, "utf8");
}

function extractSection(markdown, version) {
  const header = `## ${version}`;
  const idx = markdown.indexOf(header);
  if (idx === -1) return null;
  const rest = markdown.slice(idx);
  const nextIdx = rest.indexOf("\n## ", header.length);
  const section = nextIdx === -1 ? rest : rest.slice(0, nextIdx);
  return section.trim() + "\n";
}

function main() {
  const version = process.argv[2];
  if (!version) {
    console.error("Usage: node scripts/release-notes.js <version>");
    process.exit(2);
  }
  const changelog = readChangelog();
  const section = extractSection(changelog, version);
  if (!section) {
    console.error(`Could not find section '## ${version}' in CHANGELOG.md`);
    process.exit(1);
  }
  process.stdout.write(section);
}

main();
