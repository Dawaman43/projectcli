function pmInstallCommand(pm) {
  if (pm === "pnpm") return { program: "pnpm", args: ["install"] };
  if (pm === "yarn") return { program: "yarn", args: ["install"] };
  if (pm === "bun") return { program: "bun", args: ["install"] };
  if (pm === "poetry") return { program: "poetry", args: ["install"] };
  if (pm === "pip")
    return { program: "pip", args: ["install", "-r", "requirements.txt"] };
  if (pm === "cargo") return { program: "cargo", args: ["build"] };
  if (pm === "go") return { program: "go", args: ["mod", "tidy"] };
  return { program: "npm", args: ["install"] };
}

function pmAddCommand(pm, packages, { dev = false } = {}) {
  const pkgs = Array.isArray(packages) ? packages.filter(Boolean) : [];
  if (pkgs.length === 0) {
    throw new Error("No packages to install.");
  }

  if (pm === "pnpm") {
    return { program: "pnpm", args: ["add", ...(dev ? ["-D"] : []), ...pkgs] };
  }

  if (pm === "yarn") {
    return { program: "yarn", args: ["add", ...(dev ? ["-D"] : []), ...pkgs] };
  }

  if (pm === "bun") {
    return { program: "bun", args: ["add", ...(dev ? ["-d"] : []), ...pkgs] };
  }

  // Python
  if (pm === "pip") {
    return { program: "pip", args: ["install", ...pkgs] };
  }
  if (pm === "poetry") {
    return {
      program: "poetry",
      args: ["add", ...(dev ? ["--group", "dev"] : []), ...pkgs],
    };
  }

  // Rust
  if (pm === "cargo") {
    return { program: "cargo", args: ["add", ...pkgs] };
  }

  // Go
  if (pm === "go") {
    // go get matches 'add' somewhat, but typically go get <pkg>
    return { program: "go", args: ["get", ...pkgs] };
  }

  return { program: "npm", args: ["install", ...(dev ? ["-D"] : []), ...pkgs] };
}

function pmExecCommand(pm, pkg, pkgArgs) {
  const args = Array.isArray(pkgArgs) ? pkgArgs : [];

  if (pm === "pnpm") return { program: "pnpm", args: ["dlx", pkg, ...args] };
  if (pm === "yarn") return { program: "yarn", args: ["dlx", pkg, ...args] };
  if (pm === "bun") return { program: "bunx", args: [pkg, ...args] };
  if (pm === "mvn")
    return { program: "mvn", args: ["archetype:generate", ...args] };
  if (pm === "gradle") return { program: "gradle", args: ["init", ...args] };
  if (pm === "composer")
    return { program: "composer", args: ["create-project", pkg, ...args] };

  // npm default
  return { program: "npx", args: ["--yes", pkg, ...args] };
}

module.exports = {
  pmInstallCommand,
  pmAddCommand,
  pmExecCommand,
};
