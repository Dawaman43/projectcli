# Contributing to ProjectCLI

We love your input! We want to make contributing to ProjectCLI as easy and transparent as possible, whether it's:

- Reporting a bug
- Discussing the current state of the code
- Submitting a fix
- Proposing new features
- Becoming a maintainer

## We use Github Flow

We use GitHub Flow, so all code changes happen through pull requests. Pull requests are the best way to propose changes to the codebase (we use Squash and Merge).

1. Fork the repo and create your branch from `main`.
2. If you've added code that should be tested, add tests.
3. If you've changed APIs, update the documentation.
4. Ensure the test suite passes.
5. Make sure your code lints.
6. Issue that pull request!

## Local development

```bash
npm install
npm run lint
npm test
```

Run the CLI locally:

```bash
node bin/projectcli.js --help
node bin/projectcli.js --list
```

## Adding a new generator

Most contributions land in the registry:

- Add/modify generators in `src/registry.js`
- If the generator requires system tools, add them to the generator's `check: []` array (preflight)

Try to keep generators:

- Deterministic (prefer non-interactive underlying CLIs when possible)
- Cross-platform (avoid shell-specific commands)

## Tests

Smoke tests live in `test/` and run with Node's built-in test runner:

```bash
npm test
```

## Any contributions you make will be under the MIT Software License

In short, when you submit code changes, your submissions are understood to be under the same [MIT License](LICENSE) that covers the project. Feel free to contact the maintainers if that's a concern.

## Report bugs using Github's [issues](https://github.com/dawitworku/projectcli/issues)

We use GitHub issues to track public bugs. Report a bug by [opening a new issue](); it's that easy!

Open a new issue: https://github.com/dawitworku/projectcli/issues/new/choose

## Write bug reports with detail, background, and sample code

**Great Bug Reports** tend to have:

- A quick summary and/or background
- Steps to reproduce
  - Be specific!
  - Give sample code if you can.
- What you expected would happen
- What actually happened
- Notes (possibly including why you think this might be happening, or stuff you tried that didn't work)

## License

By contributing, you agree that your contributions will be licensed under its MIT License.
