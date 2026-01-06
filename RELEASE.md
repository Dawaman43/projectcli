# Release Process

This repo uses SemVer and a human-written changelog.

## One-time setup

- Ensure `bin/projectcli.js` is tracked and the `bin` field in `package.json` is correct.
- Ensure GitHub Actions secrets/permissions allow creating releases.

## Cut a release

1. Update `package.json` version.
2. Add a new section to `CHANGELOG.md`.
3. Verify locally:

```bash
npm run release:check
```

4. Commit:

```bash
git commit -m "release: vX.Y.Z"
```

5. Tag + push:

```bash
git tag vX.Y.Z
git push && git push --tags
```

6. GitHub Actions will create a GitHub Release from the `CHANGELOG.md` section automatically (see `.github/workflows/release.yml`).

## Generate release notes locally

```bash
npm run release:notes
```
