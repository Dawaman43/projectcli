module.exports = {
  presets: [
    {
      id: "acme",
      label: "Acme Team",
      defaults: {
        packageManager: "npm",
        js: { formatter: false, linter: false, tests: false },
        extras: { ci: true, docker: false, devcontainer: false, license: true },
      },
    },
  ],

  doctorChecks: [
    {
      id: "has-readme",
      title: "README.md present",
      detect: ({ projectRoot }) => {
        const fs = require("node:fs");
        const path = require("node:path");
        return fs.existsSync(path.join(projectRoot, "README.md"));
      },
      fix: ({ projectRoot }) => {
        return [
          {
            type: "writeFile",
            path: "README.md",
            overwrite: false,
            content: "# Project\n",
          },
        ];
      },
    },
  ],

  registry: {
    DemoLang: {
      DemoFramework: {
        id: "demo.demo.framework",
        label: "DemoFramework",
        check: [],
        commands: () => [],
        notes: "Provided by sample plugin",
        stability: "community",
      },
    },
  },
};
