# Changelog

This project follows Semantic Versioning.

## 0.2.2 (2026-01-06)

- Interactive wizard for selecting language → framework → project name.
- `--dry-run` prints planned actions without executing.
- Remote template cloning via `--template` (strips `.git`).
- Preflight tool checks for generators that declare `check: [...]`.
- Extras generation: GitHub Actions CI, Dockerfile, Dev Container, LICENSE.
- Defaults via `projectcli config` (`~/.projectcli.json`).
- Per-project config via `.projectclirc` / `projectcli.config.json`.
- Basic smoke tests via Node’s built-in test runner.
