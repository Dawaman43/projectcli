// V3 registry wrapper.
// Combines the legacy built-in registry with plugin-provided generators.

const legacy = require("../registry_legacy");
const { getPluginRegistryAdditions } = require("../plugins/contributions");

function normalizeLanguageName(name) {
  return String(name || "").trim();
}

function normalizeFrameworkName(name) {
  return String(name || "").trim();
}

function getPluginRegistryMap(effectiveConfig) {
  const additions = getPluginRegistryAdditions(effectiveConfig);
  const out = {};

  for (const add of additions) {
    const languages = add.languages;
    if (!languages || typeof languages !== "object") continue;

    for (const langKey of Object.keys(languages)) {
      const langName = normalizeLanguageName(langKey);
      if (!langName) continue;

      const frameworks = languages[langKey];
      if (!frameworks || typeof frameworks !== "object") continue;

      if (!out[langName]) out[langName] = {};

      for (const fwKey of Object.keys(frameworks)) {
        const fwName = normalizeFrameworkName(fwKey);
        if (!fwName) continue;
        const gen = frameworks[fwKey];
        if (!gen) continue;

        // Do not override existing plugin framework entries.
        if (!out[langName][fwName]) {
          out[langName][fwName] = gen;
        }
      }
    }
  }

  return out;
}

function getLanguages(effectiveConfig) {
  const base = legacy.getLanguages();
  const pluginMap = getPluginRegistryMap(effectiveConfig);

  const extra = Object.keys(pluginMap);
  const merged = [...base];
  for (const lang of extra) {
    if (!merged.includes(lang)) merged.push(lang);
  }

  return merged;
}

function getFrameworks(language, effectiveConfig) {
  const lang = normalizeLanguageName(language);
  const base = legacy.getFrameworks(lang);
  const pluginMap = getPluginRegistryMap(effectiveConfig);
  const pluginFrameworks = pluginMap[lang] ? Object.keys(pluginMap[lang]) : [];

  const merged = [...base];
  for (const fw of pluginFrameworks) {
    if (!merged.includes(fw)) merged.push(fw);
  }

  return merged;
}

function getGenerator(language, framework, effectiveConfig) {
  const lang = normalizeLanguageName(language);
  const fw = normalizeFrameworkName(framework);

  const base = legacy.getGenerator(lang, fw);
  if (base) return base;

  const pluginMap = getPluginRegistryMap(effectiveConfig);
  return pluginMap[lang]?.[fw] || null;
}

module.exports = {
  getLanguages,
  getFrameworks,
  getGenerator,
};
