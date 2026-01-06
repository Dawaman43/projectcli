const { spawn } = require("node:child_process");

function gitClone(url, targetDir) {
  return new Promise((resolve, reject) => {
    // git clone --depth 1 url targetDir
    const child = spawn("git", ["clone", "--depth", "1", url, targetDir], {
      stdio: "inherit",
      shell: false,
    });

    child.on("error", (err) => reject(err));
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`Git clone failed with code ${code}`));
    });
  });
}

/**
 * Removes the .git folder from the target directory so it becomes a fresh project.
 */
function removeGitFolder(targetDir) {
  const fs = require("node:fs");
  const path = require("node:path");
  const gitPath = path.join(targetDir, ".git");

  try {
    if (fs.existsSync(gitPath)) {
      fs.rmSync(gitPath, { recursive: true, force: true });
    }
  } catch (err) {
    // ignore
  }
}

module.exports = {
  gitClone,
  removeGitFolder,
};
