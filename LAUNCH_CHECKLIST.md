# Launch Checklist

If you are planning to post this on Hacker News (HN), Product Hunt, or Reddit, here is a suggested checklist and some copy you can reuse.

## 1. Pre-Launch Verification

- [ ] **Test Installation:** Run `npm install -g @dawitworku/projectcli` (if published) or `npm link` locally and ensure `projectcli` command works.
- [ ] **Test Common Paths:** Test `projectcli` (interactive), `projectcli --language Rust` (flags), and `cd some-repo && projectcli` (context awareness).
- [ ] **Repository Hygiene:** Ensure `LICENSE` is present, `CONTRIBUTING.md` is present, and `package.json` links to the repo.

## 2. Publishing to NPM

Before you share, you need to publish the package so `npx` works for others.

```bash
npm login
npm publish --access public
```

## 3. Hacker News "Show HN" Draft

**Title:** Show HN: ProjectCLI – A Swiss Army Knife for bootstrapping projects in 10+ languages

**Url:** (Link to your GitHub repo)

**Text:**
Hello HN!

I built **ProjectCLI** because I was tired of remembering the specific scaffolding commands for every language I use (`cargo new`, `npm create vite@latest`, `django-admin startproject`, `laravel new`, etc.).

**ProjectCLI** unifies them into a single, interactive CLI.

**Key Features:**

- **Polyglot:** Supports Rust, Go, Python, JS/TS, PHP, Java, and more.
- **Smart Context:** If you run it inside an existing project, it detects the language and helps you add libraries, Dockerfiles, or CI/CD pipelines.
- **Remote Templates:** `projectcli --template <url>` clones any repo and strips the git history for a fresh start.
- **Preflight Checks:** Warns you if you are missing the underlying tools (e.g., trying to create a Rust project without Cargo).

It's open source and I'd love your feedback!

repo: https://github.com/dawitworku/projectcli
install: `npx @dawitworku/projectcli@latest`

```

## 4. Reddit /r/programming or /r/webdev Draft

**Title:** I built a CLI that unifies scaffolding for Rust, Go, JS, Python, and more

(Same body text as above, maybe slightly more conversational).
```
