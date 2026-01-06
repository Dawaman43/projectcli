const fs = require("node:fs");
const path = require("node:path");

const GITHUB_ACTIONS_JS = `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - run: npm ci
      - run: npm run build --if-present
      - run: npm test --if-present
`;

const GITHUB_ACTIONS_PY = `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
          cache: 'pip'
      - run: pip install -r requirements.txt
`;

const GITHUB_ACTIONS_RUST = `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: dtolnay/rust-toolchain@stable
      - run: cargo build --verbose
      - run: cargo test --verbose
`;

const GITHUB_ACTIONS_GO = `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-go@v5
        with:
          go-version: '1.21'
      - run: go build -v ./...
      - run: go test -v ./...
`;

function getGitHubAction(language, pm) {
  if (language === "JavaScript" || language === "TypeScript")
    return GITHUB_ACTIONS_JS;
  if (language === "Python") return GITHUB_ACTIONS_PY;
  if (language === "Rust") return GITHUB_ACTIONS_RUST;
  if (language === "Go") return GITHUB_ACTIONS_GO;
  // Default generic
  return `name: CI
on: [push, pull_request]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: echo "Add build steps here"
`;
}

const DOCKERFILE_JS = `FROM node:20-alpine AS base

FROM base AS deps
WORKDIR /app
COPY package.json ./
RUN npm install

FROM base AS runner
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# RUN npm run build
CMD ["node", "index.js"]
`;

const DOCKERFILE_PY = `FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
CMD ["python", "app.py"]
`;

const DOCKERFILE_GO = `FROM golang:1.21-alpine AS builder
WORKDIR /app
COPY . .
RUN go build -o myapp main.go

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/myapp .
CMD ["./myapp"]
`;

const DOCKERFILE_RUST = `FROM rust:1.75 as builder
WORKDIR /usr/src/myapp
COPY . .
RUN cargo install --path .

FROM debian:buster-slim
COPY --from=builder /usr/local/cargo/bin/myapp /usr/local/bin/myapp
CMD ["myapp"]
`;

function getDockerfile(language) {
  if (language === "JavaScript" || language === "TypeScript")
    return DOCKERFILE_JS;
  if (language === "Python") return DOCKERFILE_PY;
  if (language === "Go") return DOCKERFILE_GO;
  if (language === "Rust") return DOCKERFILE_RUST;
  return `# Dockerfile
FROM ubuntu:latest
WORKDIR /app
COPY . .
CMD ["echo", "Start..."]
`;
}

function generateCI(projectRoot, language, pm) {
  const steps = [];

  // GitHub Actions
  const ghContent = getGitHubAction(language, pm);
  steps.push({
    type: "writeFile",
    path: ".github/workflows/ci.yml",
    content: ghContent,
  });

  return steps;
}

function generateDocker(projectRoot, language) {
  const content = getDockerfile(language);
  return [
    {
      type: "writeFile",
      path: "Dockerfile",
      content: content,
    },
    {
      type: "writeFile",
      path: ".dockerignore",
      content: "node_modules\ntarget\n.venv\n.git\n",
    },
  ];
}

module.exports = {
  generateCI,
  generateDocker,
};
