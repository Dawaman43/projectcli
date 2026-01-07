/**
 * Registry of (language -> framework -> generator).
 * Each generator provides:
 * - id: stable id
 * - label: display name
 * - commands: array of steps (each step is a program + args)
 * - notes: optional help text shown before running
 */

function getProjectName(ctx) {
  return typeof ctx === "string" ? ctx : ctx?.projectName;
}

function getPackageManager(ctx) {
  const pm = typeof ctx === "object" ? ctx?.packageManager : undefined;
  return pm || "npm";
}

const { pmExecCommand, pmInstallCommand } = require("./pm");

function pmExec(pm, pkg, pkgArgs, opts = {}) {
  const cmd = pmExecCommand(pm, pkg, pkgArgs);
  return { type: "command", ...cmd, ...opts };
}

function pmInstall(pm, opts = {}) {
  const cmd = pmInstallCommand(pm);
  return { type: "command", ...cmd, ...opts };
}

const REGISTRY = {
  JavaScript: {
    "Vite (Vanilla)": {
      id: "js.vite.vanilla",
      label: "Vite (Vanilla)",
      check: ["npm"],
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "vanilla",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite (JS)",
    },
    "Vite (React)": {
      id: "js.vite.react",
      label: "Vite (React)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "react",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + React (JS)",
    },
    "Vite (Vue)": {
      id: "js.vite.vue",
      label: "Vite (Vue)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [projectName, "--template", "vue"]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + Vue (JS)",
    },
    "Vite (Svelte)": {
      id: "js.vite.svelte",
      label: "Vite (Svelte)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "svelte",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + Svelte (JS)",
    },
    "Vite (Preact)": {
      id: "js.vite.preact",
      label: "Vite (Preact)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "preact",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + Preact (JS)",
    },
    "Vite (Lit)": {
      id: "js.vite.lit",
      label: "Vite (Lit)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [projectName, "--template", "lit"]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + Lit (JS)",
    },
    "Next.js": {
      id: "js.nextjs",
      label: "Next.js",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-next-app@latest", [projectName])];
      },
      notes: "Next.js app (wizard)",
    },
    Astro: {
      id: "js.astro",
      label: "Astro",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-astro@latest", [projectName])];
      },
      notes: "Astro site (wizard)",
    },
    SvelteKit: {
      id: "js.sveltekit",
      label: "SvelteKit",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-svelte@latest", [projectName])];
      },
      notes: "SvelteKit app (wizard)",
    },
    Remix: {
      id: "js.remix",
      label: "Remix",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-remix@latest", [projectName])];
      },
      notes: "Remix app (wizard)",
    },
    Nuxt: {
      id: "js.nuxt",
      label: "Nuxt",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "nuxi@latest", ["init", projectName]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Nuxt via nuxi init",
    },
    "Express (Generator)": {
      id: "js.express",
      label: "Express",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "express-generator", [projectName]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Scaffolds basic Express app",
    },
    "Fastify (CLI)": {
      id: "js.fastify",
      label: "Fastify",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "fastify-cli", ["generate", projectName]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Scaffolds Fastify app",
    },
    "React Native (Expo)": {
      id: "js.expo",
      label: "React Native (Expo)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        // create-expo-app
        return [pmExec(pm, "create-expo-app@latest", [projectName])];
      },
      notes: "Expo for React Native",
    },
    "Electron (Forge)": {
      id: "js.electron",
      label: "Electron (Forge)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-electron-app@latest", [projectName])];
      },
      notes: "Electron Forge template",
    },
    "Qwik City": {
      id: "js.qwik",
      label: "Qwik City",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [pmExec(pm, "create-qwik@latest", ["basic", projectName])];
      },
      notes: "Qwik framework",
    },
    "Node.js (basic)": {
      id: "js.node.basic",
      label: "Node.js (basic)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          { type: "mkdir", path: "." },
          {
            type: "writeFile",
            path: "package.json",
            content: JSON.stringify(
              {
                name: projectName,
                version: "0.1.0",
                private: true,
                type: "commonjs",
                scripts: { start: "node index.js" },
              },
              null,
              2
            ).concat("\n"),
          },
          {
            type: "writeFile",
            path: "index.js",
            content: "console.log('hello');\n",
          },
          {
            type: "writeFile",
            path: ".gitignore",
            content: "node_modules\n.DS_Store\n.env\n",
          },
        ];
      },
      notes: "No external generator required",
    },
  },

  TypeScript: {
    "Vite (React + TS)": {
      id: "ts.vite.react",
      label: "Vite (React + TS)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "react-ts",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + React + TS",
    },
    "Vite (Vanilla + TS)": {
      id: "ts.vite.vanilla",
      label: "Vite (Vanilla + TS)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "vanilla-ts",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + TypeScript",
    },
    "Vite (Vue + TS)": {
      id: "ts.vite.vue",
      label: "Vite (Vue + TS)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          pmExec(pm, "create-vite@latest", [
            projectName,
            "--template",
            "vue-ts",
          ]),
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Vite + Vue + TypeScript",
    },
    "TanStack Start": {
      id: "ts.tanstack.start",
      label: "TanStack Start",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        // TanStack docs: npm/pnpm create @tanstack/start@latest
        // Running the package via pm exec is equivalent.
        return [pmExec(pm, "@tanstack/start@latest", [projectName])];
      },
      notes: "Full-stack React framework (wizard)",
    },
    NestJS: {
      id: "ts.nestjs",
      label: "NestJS",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        // Nest CLI is interactive; it may ask about package manager.
        return [pmExec(pm, "@nestjs/cli", ["new", projectName])];
      },
      notes: "Nest CLI (wizard)",
    },
    "Node.js (basic TS)": {
      id: "ts.node.basic",
      label: "Node.js (basic TS)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx);
        return [
          { type: "mkdir", path: "src" },
          {
            type: "writeFile",
            path: "package.json",
            content: JSON.stringify(
              {
                name: projectName,
                version: "0.1.0",
                private: true,
                type: "module",
                scripts: {
                  build: "tsc -p tsconfig.json",
                  start: "node dist/index.js",
                },
                devDependencies: {
                  typescript: "^5.0.0",
                },
              },
              null,
              2
            ).concat("\n"),
          },
          {
            type: "writeFile",
            path: "tsconfig.json",
            content: JSON.stringify(
              {
                compilerOptions: {
                  target: "ES2022",
                  module: "ES2022",
                  outDir: "dist",
                  strict: true,
                },
                include: ["src"],
              },
              null,
              2
            ).concat("\n"),
          },
          {
            type: "writeFile",
            path: "src/index.ts",
            content: "console.log('hello');\n",
          },
          pmInstall(pm, { cwdFromProjectRoot: true }),
        ];
      },
      notes: "Writes files + installs TypeScript",
    },
  },

  Python: {
    Django: {
      id: "py.django",
      label: "Django",
      check: ["django-admin"],
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "django-admin",
            args: ["startproject", projectName],
          },
        ];
      },
      notes: "Requires django-admin on PATH (pip install django).",
    },
    Flask: {
      id: "py.flask.basic",
      label: "Flask (basic)",
      check: ["python3"],
      commands: (_ctx) => [
        { type: "mkdir", path: "." },
        {
          type: "writeFile",
          path: "app.py",
          content:
            "from flask import Flask\\n\\napp = Flask(__name__)\\n\\n@app.get('/')\\ndef hello():\\n    return {'status': 'ok'}\\n\\nif __name__ == '__main__':\\n    app.run(debug=True)\\n",
        },
        {
          type: "writeFile",
          path: "requirements.txt",
          content: "flask\\n",
        },
        {
          type: "writeFile",
          path: ".gitignore",
          content: ".venv\\n__pycache__\\n*.pyc\\n.DS_Store\\n",
        },
      ],
      notes: "Writes app.py + requirements.txt (no pip install).",
    },
    FastAPI: {
      id: "py.fastapi.basic",
      label: "FastAPI (basic)",
      commands: (_ctx) => [
        { type: "mkdir", path: "." },
        {
          type: "writeFile",
          path: "main.py",
          content:
            "from fastapi import FastAPI\\n\\napp = FastAPI()\\n\\n@app.get('/')\\ndef root():\\n    return {'status': 'ok'}\\n",
        },
        {
          type: "writeFile",
          path: "requirements.txt",
          content: "fastapi\\nuvicorn\\n",
        },
        {
          type: "writeFile",
          path: "README.md",
          content:
            "# FastAPI app\\n\\nRun:\\n\\n- python -m venv .venv\\n- . .venv/bin/activate\\n- pip install -r requirements.txt\\n- uvicorn main:app --reload\\n",
        },
        {
          type: "writeFile",
          path: ".gitignore",
          content: ".venv\\n__pycache__\\n*.pyc\\n.DS_Store\\n",
        },
      ],
      notes: "Writes files only (no pip install).",
    },
    Pyramid: {
      id: "py.pyramid",
      label: "Pyramid",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          { type: "mkdir", path: "." },
          {
            type: "writeFile",
            path: "requirements.txt",
            content: "pyramid\\nwaitress\\n",
          },
          {
            type: "writeFile",
            path: "app.py",
            content:
              "from wsgiref.simple_server import make_server\\nfrom pyramid.config import Configurator\\nfrom pyramid.response import Response\\n\\ndef hello_world(request):\\n    return Response('Hello World!')\\n\\nif __name__ == '__main__':\\n    with Configurator() as config:\\n        config.add_route('hello', '/')\\n        config.add_view(hello_world, route_name='hello')\\n        app = config.make_wsgi_app()\\n    server = make_server('0.0.0.0', 6543, app)\\n    server.serve_forever()\\n",
          },
        ];
      },
      notes: "Pyramid basic app",
    },
  },

  Rust: {
    "Cargo (bin)": {
      id: "rs.cargo.bin",
      label: "Cargo (bin)",
      check: ["cargo"],
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "cargo",
            args: ["new", projectName],
          },
        ];
      },
      notes: "Uses cargo new",
    },
    "Cargo (lib)": {
      id: "rs.cargo.lib",
      label: "Cargo (lib)",
      check: ["cargo"],
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "cargo",
            args: ["new", "--lib", projectName],
          },
        ];
      },
      notes: "Uses cargo new --lib",
    },
    "Tauri (App)": {
      id: "rs.tauri",
      label: "Tauri (App)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        const pm = getPackageManager(ctx); // usually npm for tauri frontend
        return [pmExec(pm, "create-tauri-app@latest", [projectName])];
      },
      notes: "Cross-platform desktop app",
    },
    "Leptos (CSR)": {
      id: "rs.leptos",
      label: "Leptos (CSR)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "cargo",
            args: ["init", "--name", projectName],
            cwdFromProjectRoot: true,
          },
        ];
      },
      notes: "Init basic Rust project (Leptos needs template usually)",
    },
  },

  Go: {
    "Go module (basic)": {
      id: "go.module.basic",
      label: "Go module (basic)",
      check: ["go"],
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "go",
            args: ["mod", "init", projectName],
            cwdFromProjectRoot: true,
          },
        ];
      },
      notes: "Creates folder then runs go mod init",
    },
    "Go module (hello)": {
      id: "go.module.hello",
      label: "Go module (hello)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          { type: "mkdir", path: "." },
          {
            program: "go",
            args: ["mod", "init", projectName],
            cwdFromProjectRoot: true,
          },
          {
            type: "writeFile",
            path: "main.go",
            content:
              'package main\\n\\nimport "fmt"\\n\\nfunc main() {\\n    fmt.Println("hello")\\n}\\n',
          },
        ];
      },
      notes: "Writes main.go + runs go mod init",
    },
    "Buffalo (Web)": {
      id: "go.buffalo",
      label: "Buffalo (Web)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "buffalo",
            args: ["new", projectName],
          },
        ];
      },
      notes: "Requires 'buffalo' CLI installed",
    },
    "Fiber (Skeleton)": {
      id: "go.fiber",
      label: "Fiber (Skeleton)",
      commands: (_ctx) => [
        { type: "mkdir", path: "." },
        {
          type: "writeFile",
          path: "main.go",
          content: `package main

import "github.com/gofiber/fiber/v2"

func main() {
  app := fiber.New()

  app.Get("/", func(c *fiber.Ctx) error {
    return c.SendString("Hello, World!")
  })

  app.Listen(":3000")
}
`,
        },
        {
          program: "go",
          args: ["mod", "init", "fiber-app"],
          cwdFromProjectRoot: true,
        },
        {
          program: "go",
          args: ["get", "github.com/gofiber/fiber/v2"],
          cwdFromProjectRoot: true,
        },
      ],
      notes: "Basic Fiber setup",
    },
  },

  "C++": {
    "CMake (Basic)": {
      id: "cpp.cmake",
      label: "CMake (Basic)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          { type: "mkdir", path: "src" },
          {
            type: "writeFile",
            path: "CMakeLists.txt",
            content: `cmake_minimum_required(VERSION 3.10)
project(${projectName})

set(CMAKE_CXX_STANDARD 17)

add_executable(${projectName} src/main.cpp)
`,
          },
          {
            type: "writeFile",
            path: "src/main.cpp",
            content: `#include <iostream>

int main() {
    std::cout << "Hello, World!" << std::endl;
    return 0;
}
`,
          },
        ];
      },
      notes: "Standard CMake structure",
    },
  },

  "C#": {
    ".NET console": {
      id: "cs.dotnet.console",
      label: ".NET console",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "dotnet",
            args: ["new", "console", "-n", projectName],
          },
        ];
      },
      notes: "Requires dotnet SDK",
    },
    ".NET webapi": {
      id: "cs.dotnet.webapi",
      label: ".NET webapi",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "dotnet",
            args: ["new", "webapi", "-n", projectName],
          },
        ];
      },
      notes: "Requires dotnet SDK",
    },
  },

  Ruby: {
    Rails: {
      id: "rb.rails",
      label: "Rails",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "rails",
            args: ["new", projectName],
          },
        ];
      },
      notes: "Requires rails gem installed",
    },
    "Bundler (gem)": {
      id: "rb.bundler",
      label: "Bundler (new gem)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "bundle",
            args: ["gem", projectName],
          },
        ];
      },
      notes: "Creates a new gem with bundler",
    },
  },

  PHP: {
    Laravel: {
      id: "php.laravel",
      label: "Laravel",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "composer",
            args: ["create-project", "laravel/laravel", projectName],
          },
        ];
      },
      notes: "Uses composer create-project",
    },
    Symfony: {
      id: "php.symfony",
      label: "Symfony",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "composer",
            args: ["create-project", "symfony/skeleton", projectName],
          },
        ];
      },
      notes: "Uses composer create-project",
    },
  },

  "Java/Kotlin": {
    "Spring Boot (Maven)": {
      id: "java.springboot.maven",
      label: "Spring Boot (Maven)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "mvn",
            args: [
              "archetype:generate",
              "-DgroupId=com.example",
              `-DartifactId=${projectName}`,
              "-DarchetypeArtifactId=maven-archetype-quickstart",
              "-DinteractiveMode=false",
            ],
          },
        ];
      },
      notes: "Basic Maven Quickstart",
    },
    "Gradle (Basic)": {
      id: "java.gradle.basic",
      label: "Gradle (Basic)",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          { type: "mkdir", path: projectName },
          {
            program: "gradle",
            args: [
              "init",
              "--type",
              "basic",
              "--dsl",
              "kotlin",
              "--project-name",
              projectName,
            ],
            cwd: projectName,
            cwdFromProjectRoot: true,
          },
        ];
      },
      notes: "Gradle init",
    },
    Quarkus: {
      id: "java.quarkus",
      label: "Quarkus",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "mvn",
            args: [
              "io.quarkus.platform:quarkus-maven-plugin:create",
              `-DprojectGroupId=org.acme`,
              `-DprojectArtifactId=${projectName}`,
            ],
          },
        ];
      },
      notes: "Quarkus app (Maven)",
    },
  },

  Others: {
    "HTML/CSS": {
      id: "other.html",
      label: "HTML/CSS (Vanilla)",
      commands: (ctx) => {
        return [
          { type: "mkdir", path: "." },
          {
            type: "writeFile",
            path: "index.html",
            content:
              '<!DOCTYPE html>\\n<html lang="en">\\n<head>\\n    <meta charset="UTF-8">\\n    <title>My App</title>\\n</head>\\n<body>\\n    <h1>Hello World</h1>\\n</body>\\n</html>',
          },
          {
            type: "writeFile",
            path: "style.css",
            content: "body { font-family: sans-serif; }",
          },
        ];
      },
      notes: "Just static files",
    },
  },

  Dart: {
    "Console Application": {
      id: "dart.console",
      label: "Console Application",
      commands: (ctx) => {
        const projectName = getProjectName(ctx);
        return [
          {
            program: "dart",
            args: ["create", "-t", "console", projectName],
          },
        ];
      },
      notes: "Requires Dart SDK",
    },
  },
};

function getLanguages() {
  return Object.keys(REGISTRY);
}

function getFrameworks(language) {
  return Object.keys(REGISTRY[language] || {});
}

function getGenerator(language, framework) {
  const lang = REGISTRY[language];
  if (!lang) return null;
  const gen = lang[framework] || null;
  if (!gen) return null;
  return { ...gen, stability: gen.stability || "core" };
}

module.exports = {
  REGISTRY,
  getLanguages,
  getFrameworks,
  getGenerator,
};
