const { spawn } = require("node:child_process");

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
};
