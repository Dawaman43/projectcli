const fs = require("node:fs");
const path = require("node:path");

function exists(cwd, rel) {
  return fs.existsSync(path.join(cwd, rel));
}

function detectPackageManager(cwd) {
  // JS/TS
  if (exists(cwd, "pnpm-lock.yaml")) return "pnpm";
  if (exists(cwd, "yarn.lock")) return "yarn";
  if (exists(cwd, "bun.lockb") || exists(cwd, "bun.lock")) return "bun";
  if (exists(cwd, "package-lock.json")) return "npm";

  // Python
  if (exists(cwd, "poetry.lock")) return "poetry";
  if (exists(cwd, "requirements.txt")) return "pip";
  if (exists(cwd, "pyproject.toml")) return "pip"; // Default to pip/standard if no specific lock file

  // Rust
  if (exists(cwd, "Cargo.toml")) return "cargo";

  // Go
  if (exists(cwd, "go.mod")) return "go";

  // PHP
  if (exists(cwd, "composer.json")) return "composer";

  // fallback for JS
  if (exists(cwd, "package.json")) return "npm";

  return "npm";
}

function detectLanguage(cwd) {
  if (exists(cwd, "package.json")) return "JavaScript/TypeScript";
  if (exists(cwd, "pyproject.toml") || exists(cwd, "requirements.txt"))
    return "Python";
  if (exists(cwd, "go.mod")) return "Go";
  if (exists(cwd, "Cargo.toml")) return "Rust";
  if (exists(cwd, "composer.json")) return "PHP";
  if (
    exists(cwd, "pom.xml") ||
    exists(cwd, "build.gradle") ||
    exists(cwd, "build.gradle.kts")
  )
    return "Java/Kotlin";
  if (
    fs.readdirSync(cwd).some((f) => f.endsWith(".csproj") || f.endsWith(".sln"))
  )
    return "C#";
  if (exists(cwd, "pubspec.yaml")) return "Dart";
  if (exists(cwd, "Gemfile")) return "Ruby";
  if (exists(cwd, "Package.swift")) return "Swift";
  if (exists(cwd, "CMakeLists.txt")) return "C++";
  return "Unknown";
}

module.exports = {
  detectLanguage,
  detectPackageManager,
};
