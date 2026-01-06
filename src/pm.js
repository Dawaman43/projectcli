function pmInstallCommand(pm) {
  if (pm === "pnpm") return { program: "pnpm", args: ["install"] };
  if (pm === "yarn") return { program: "yarn", args: ["install"] };
  if (pm === "bun") return { program: "bun", args: ["install"] };
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

  return { program: "npm", args: ["install", ...(dev ? ["-D"] : []), ...pkgs] };
}

function pmExecCommand(pm, pkg, pkgArgs) {
  const args = Array.isArray(pkgArgs) ? pkgArgs : [];

  if (pm === "pnpm") return { program: "pnpm", args: ["dlx", pkg, ...args] };
  if (pm === "yarn") return { program: "yarn", args: ["dlx", pkg, ...args] };
  if (pm === "bun") return { program: "bunx", args: [pkg, ...args] };

  // npm default
  return { program: "npx", args: ["--yes", pkg, ...args] };
}

module.exports = {
  pmInstallCommand,
  pmAddCommand,
  pmExecCommand,
};
