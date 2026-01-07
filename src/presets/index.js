const PRESETS = {
  minimal: {
    id: "minimal",
    label: "Minimal",
    defaults: {
      packageManager: null,
      js: {
        formatter: false,
        linter: false,
        tests: false,
      },
      extras: {
        ci: false,
        docker: false,
        devcontainer: false,
        license: true,
      },
    },
  },

  startup: {
    id: "startup",
    label: "Startup",
    defaults: {
      packageManager: "pnpm",
      js: {
        formatter: true,
        linter: true,
        tests: true,
      },
      extras: {
        ci: true,
        docker: true,
        devcontainer: false,
        license: true,
      },
    },
  },

  strict: {
    id: "strict",
    label: "Strict",
    defaults: {
      packageManager: "pnpm",
      js: {
        formatter: true,
        linter: true,
        tests: true,
      },
      extras: {
        ci: true,
        docker: true,
        devcontainer: true,
        license: true,
      },
    },
  },

  enterprise: {
    id: "enterprise",
    label: "Enterprise",
    defaults: {
      packageManager: "pnpm",
      js: {
        formatter: true,
        linter: true,
        tests: true,
      },
      extras: {
        ci: true,
        docker: true,
        devcontainer: true,
        license: true,
      },
    },
  },
};

function listPresets() {
  return Object.keys(PRESETS);
}

function getPreset(presetId) {
  if (typeof presetId !== "string") return PRESETS.startup;
  const key = presetId.trim().toLowerCase();
  return PRESETS[key] || PRESETS.startup;
}

function describePreset(presetId) {
  const p = getPreset(presetId);
  return { id: p.id, label: p.label, defaults: p.defaults };
}

module.exports = {
  PRESETS,
  listPresets,
  getPreset,
  describePreset,
};
