# Changelog

This project follows Semantic Versioning.

## 0.3.0 (2026-01-06)

- Add per-project config via `.projectclirc` / `projectcli.config.json` (CLI > project config > `~/.projectcli.json`).
- Improve preflight + missing-command errors with actionable install hints.
- Add generator stability metadata (defaults to `core`) and show in UI + `--list`.
- README improvements: demo placeholder, “Why ProjectCLI?”, explicit safety guarantees.

## 0.2.2 (2026-01-06)

- Interactive wizard for selecting language → framework → project name.
- `--dry-run` prints planned actions without executing.
- Remote template cloning via `--template` (strips `.git`).
- Preflight tool checks for generators that declare `check: [...]`.
- Extras generation: GitHub Actions CI, Dockerfile, Dev Container, LICENSE.
- Defaults via `projectcli config` (`~/.projectcli.json`).
- Basic smoke tests via Node’s built-in test runner.
