# Roadmap

This is a lightweight, intention-revealing roadmap (not a promise). PRs welcome.

## v0.3

- Improve `--dry-run` output (include file diffs / more structured output).
- Add `--no-ci`, `--no-docker`, `--no-devcontainer` to override config defaults.
- More actionable errors (install hints for more tools; better command failure summaries).

## v0.4

- Generator snapshot tests (golden files) for core templates.
- More built-in templates for CI/Docker/Dev Container across languages.

## v0.5

- Performance polish: cache tool availability, parallel preflight, reduce prompt startup cost.

## v1.0

- Lock in stability guarantees and backwards-compat for core generators.
- Document long-term support expectations for generator metadata.
