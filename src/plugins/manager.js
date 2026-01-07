function uniqStrings(items) {
  const out = [];
  const seen = new Set();
  for (const v of items || []) {
    if (typeof v !== "string") continue;
    const s = v.trim();
    if (!s) continue;
    if (seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
}

function getEnabledPlugins(effectiveConfig) {
  const fromConfig = Array.isArray(effectiveConfig?.plugins)
    ? effectiveConfig.plugins
    : [];
  return uniqStrings(fromConfig);
}

function tryLoadPlugin(pluginId) {
  try {
    // Plugins are expected to be resolvable via Node resolution.
    // This command only enables/disables plugins in config; it does not install packages.
    // eslint-disable-next-line global-require, import/no-dynamic-require
    const mod = require(pluginId);
    return { ok: true, module: mod, error: null };
  } catch (err) {
    const message = err && err.message ? err.message : String(err);
    return { ok: false, module: null, error: message };
  }
}

module.exports = {
  getEnabledPlugins,
  tryLoadPlugin,
};
