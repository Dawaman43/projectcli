const DEVCONTAINER_NODE = `{
  "name": "Node.js",
  "image": "mcr.microsoft.com/devcontainers/javascript-node:20",
  "features": {
    "ghcr.io/devcontainers/features/node:1": {}
  },
  "forwardPorts": [3000],
  "postCreateCommand": "npm install"
}`;

const DEVCONTAINER_PYTHON = `{
  "name": "Python 3",
  "image": "mcr.microsoft.com/devcontainers/python:3.11",
  "features": {
    "ghcr.io/devcontainers/features/python:1": {}
  },
  "postCreateCommand": "pip install -r requirements.txt"
}`;

const DEVCONTAINER_RUST = `{
  "name": "Rust",
  "image": "mcr.microsoft.com/devcontainers/rust:1",
  "features": {
    "ghcr.io/devcontainers/features/rust:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": ["rust-lang.rust-analyzer", "tamasfe.even-better-toml"]
    }
  },
  "postCreateCommand": "cargo build"
}`;

const DEVCONTAINER_GO = `{
  "name": "Go",
  "image": "mcr.microsoft.com/devcontainers/go:1.21",
  "features": {
    "ghcr.io/devcontainers/features/go:1": {}
  },
  "customizations": {
    "vscode": {
      "extensions": ["golang.Go"]
    }
  },
  "postCreateCommand": "go mod download"
}`;

function getDevContainer(language) {
  if (language === "JavaScript" || language === "TypeScript")
    return DEVCONTAINER_NODE;
  if (language === "Python") return DEVCONTAINER_PYTHON;
  if (language === "Rust") return DEVCONTAINER_RUST;
  if (language === "Go") return DEVCONTAINER_GO;

  // Generic fallback
  return `{
  "name": "Default",
  "image": "mcr.microsoft.com/devcontainers/base:ubuntu",
  "features": {
    "ghcr.io/devcontainers/features/common-utils:2": {}
  }
}`;
}

function generateDevContainer(projectRoot, language) {
  const content = getDevContainer(language);
  return [
    {
      type: "mkdir",
      path: ".devcontainer",
    },
    {
      type: "writeFile",
      path: ".devcontainer/devcontainer.json",
      content: content,
    },
  ];
}

module.exports = {
  generateDevContainer,
};
