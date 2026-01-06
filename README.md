# projectcli

Interactive project generator.

## Run (dev)

```bash
npm install
npm start
```

## Install as a single-word command

From this repo folder:

```bash
npm install
npm link
```

Then you can run:

```bash
projectcli
```

## Useful flags

```bash
projectcli --help
projectcli --version
projectcli --list
projectcli --language "JavaScript" --framework "Astro" --name myapp --pm pnpm
projectcli --language "TypeScript" --framework "TanStack Start" --name myapp --pm npm
projectcli --language "TypeScript" --framework "NestJS" --name myapi --pm pnpm
```

## Publish (npm)

1. Ensure the package name in package.json is unique on npm

2. Run:

```bash
npm login
npm publish
```

## How it works

- Choose language
- Choose framework
- Enter project name
- CLI runs the underlying generator commands (npm/cargo/django-admin/etc.)

If a generator command is missing on your machine, install it and re-run.
