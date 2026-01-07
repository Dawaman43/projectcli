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

const { getPluginPresets } = require("../plugins/contributions");

function getAllPresets(effectiveConfig) {
  const out = { ...PRESETS };

  const pluginPresets = getPluginPresets(effectiveConfig);
  for (const p of pluginPresets) {
    if (!p || typeof p.id !== "string") continue;
    const id = p.id.trim().toLowerCase();
    if (!id) continue;
    // Plugin presets can extend the catalog; do not override built-ins.
    if (out[id]) continue;

    out[id] = {
      id,
      label: typeof p.label === "string" ? p.label : id,
      defaults: p.defaults && typeof p.defaults === "object" ? p.defaults : {},
      pluginId: p.pluginId,
    };
  }

  return out;
}

function listPresets(effectiveConfig) {
  return Object.keys(getAllPresets(effectiveConfig));
}

function getPreset(presetId, effectiveConfig) {
  const all = getAllPresets(effectiveConfig);
  if (typeof presetId !== "string") return all.startup || PRESETS.startup;
  const key = presetId.trim().toLowerCase();
  return all[key] || all.startup || PRESETS.startup;
}

function describePreset(presetId, effectiveConfig) {
  const p = getPreset(presetId, effectiveConfig);
  return { id: p.id, label: p.label, defaults: p.defaults };
}

module.exports = {
  PRESETS,
  listPresets,
  getPreset,
  describePreset,
};
