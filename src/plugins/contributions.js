const { getEnabledPlugins, tryLoadPlugin } = require("./manager");

function loadEnabledPlugins(effectiveConfig) {
  const enabled = getEnabledPlugins(effectiveConfig);
  const plugins = [];
  const errors = [];

  for (const id of enabled) {
    const res = tryLoadPlugin(id);
    if (res.ok) {
      plugins.push({ id, module: res.module });
    } else {
      errors.push({ id, error: res.error || "Failed to load plugin" });
    }
  }

  return { plugins, errors };
}

function getPluginPresets(effectiveConfig) {
  const { plugins } = loadEnabledPlugins(effectiveConfig);
  const out = [];

  for (const p of plugins) {
    const mod = p.module || {};
    const presets = mod.presets;
    if (!presets) continue;

    if (Array.isArray(presets)) {
      for (const preset of presets) {
        if (preset && typeof preset.id === "string") {
          out.push({ ...preset, pluginId: p.id });
        }
      }
      continue;
    }

    if (typeof presets === "object") {
      for (const key of Object.keys(presets)) {
        const preset = presets[key];
        if (!preset) continue;
        const id = typeof preset.id === "string" ? preset.id : key;
        if (!id) continue;
        out.push({ ...preset, id, pluginId: p.id });
      }
    }
  }

  return out;
}

function getPluginRegistryAdditions(effectiveConfig) {
  const { plugins } = loadEnabledPlugins(effectiveConfig);
  const out = [];

  for (const p of plugins) {
    const mod = p.module || {};
    const reg = mod.registry;
    if (!reg) continue;

    // Supported shapes:
    // 1) registry: { "Language": { "Framework": generator, ... }, ... }
    // 2) registry: { languages: { ... } }
    const languages =
      reg.languages && typeof reg.languages === "object" ? reg.languages : reg;
    if (!languages || typeof languages !== "object") continue;

    out.push({ pluginId: p.id, languages });
  }

  return out;
}

function getPluginDoctorChecks(effectiveConfig) {
  const { plugins } = loadEnabledPlugins(effectiveConfig);
  const out = [];

  for (const p of plugins) {
    const mod = p.module || {};

    const checks = Array.isArray(mod.doctorChecks)
      ? mod.doctorChecks
      : Array.isArray(mod.doctor?.checks)
      ? mod.doctor.checks
      : [];

    for (const check of checks) {
      if (!check || typeof check.id !== "string") continue;
      out.push({ ...check, pluginId: p.id });
    }
  }

  return out;
}

module.exports = {
  loadEnabledPlugins,
  getPluginPresets,
  getPluginRegistryAdditions,
  getPluginDoctorChecks,
};
