const DESCRIPTIONS = {
  // JavaScript
  "js.vite.vanilla":
    "Native ESM-based build tool. Best for: fast prototyping, zero-framework learning.",
  "js.vite.react":
    "Most popular UI library. Best for: interactive UIs, large ecosystem, jobs.",
  "js.vite.vue":
    "Progressive framework. Best for: easy learning curve, clean template syntax.",
  "js.vite.svelte":
    "Compiler-based framework. Best for: performance, less boilerplate, true reactivity.",
  "js.nextjs":
    "The React Framework for the Web. Best for: SEO, SSR/SSG, full-stack apps.",
  "js.astro":
    "Content-focused site builder. Best for: blogs, documentation, portfolios (ships less JS).",
  "js.express":
    "Minimalist web framework for Node.js. Best for: REST APIs, learning backend basics.",
  "js.nestjs":
    "Angular-style backend framework. Best for: enterprise, scalable architecture, TypeScript.",

  // Python
  "py.django":
    "Batteries-included web framework. Best for: rapid dev, CMS, huge ecosystem.",
  "py.flask.basic":
    "Microframework. Best for: simple services, learning, flexibility.",
  "py.fastapi.basic":
    "Modern, fast (high-performance). Best for: APIs with auto-docs (Swagger), async support.",

  // Rust
  "rs.cargo.bin":
    "Standard Rust binary. Best for: CLI tools, backend services, learning Rust.",
  "rs.tauri":
    "Build smaller, faster, and more secure desktop applications with a web frontend.",

  // Go
  "go.module.basic":
    "Go's dependency management system. Best for: microservices, high concurrency.",
};

function getDescription(id) {
  return DESCRIPTIONS[id] || "No description available.";
}

module.exports = {
  getDescription,
};
