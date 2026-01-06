const { spawn } = require("node:child_process");

function getInstallHint(binary) {
  const bin = String(binary || "").toLowerCase();
  if (bin === "git") return "Install Git: https://git-scm.com/downloads";
  if (bin === "node" || bin === "npm")
    return "Install Node.js (includes npm): https://nodejs.org/en/download";
  if (bin === "pnpm") return "Install pnpm: https://pnpm.io/installation";
  if (bin === "yarn")
    return "Install Yarn: https://yarnpkg.com/getting-started/install";
  if (bin === "bun") return "Install Bun: https://bun.sh/docs/installation";
  if (bin === "cargo" || bin === "rustc")
    return "Install Rust: https://rustup.rs";
  if (bin === "go") return "Install Go: https://go.dev/dl/";
  if (bin === "python" || bin === "python3")
    return "Install Python: https://www.python.org/downloads/";
  if (bin === "poetry")
    return "Install Poetry: https://python-poetry.org/docs/#installation";
  if (bin === "php") return "Install PHP: https://www.php.net/downloads";
  if (bin === "dotnet")
    return "Install .NET SDK: https://dotnet.microsoft.com/download";
  if (bin === "java" || bin === "javac")
    return "Install a JDK: https://adoptium.net/";
  if (bin === "dart") return "Install Dart SDK: https://dart.dev/get-dart";
  return null;
}

function checkBinary(binary, args = ["--version"]) {
  return new Promise((resolve) => {
    const child = spawn(binary, args, {
      stdio: "ignore",
      shell: false,
    });
    child.on("error", () => resolve(false));
    child.on("close", (code) => resolve(code === 0));
  });
}

function checkBinaries(binaries) {
  if (!binaries || binaries.length === 0) return [];
  const checks = binaries.map((bin) =>
    checkBinary(bin).then((ok) => ({ bin, ok }))
  );
  return Promise.all(checks);
}

module.exports = {
  checkBinary,
  checkBinaries,
  getInstallHint,
};
