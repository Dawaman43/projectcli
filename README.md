# projectcli

Interactive project generator.

Run it as a single command, pick language → framework, and it scaffolds the project by calling the underlying official CLIs (Vite, Next.js, Nest, etc.).

## Run with npx (recommended)

After you publish this package to npm:

```bash
npx projectcli@latest
```

You can also run non-interactively:

```bash
npx projectcli@latest --language "TypeScript" --framework "NestJS" --name my-api --pm npm
```

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

## Add libraries to an existing project

Run inside a project folder:

```bash
projectcli add
```

## Notes

- If you type a project name that already exists, the CLI will ask for another name (it won’t quit).
- Some generators (like Vite/Next/etc.) can still ask their own questions — those prompts come from the underlying tool.

## Useful flags

```bash
projectcli --help
projectcli --version
projectcli --list
projectcli --language "JavaScript" --framework "Astro" --name myapp --pm pnpm
projectcli --language "TypeScript" --framework "TanStack Start" --name myapp --pm npm
projectcli --language "TypeScript" --framework "NestJS" --name myapi --pm pnpm
projectcli --dry-run --language "JavaScript" --framework "Vite (React)" --name demo --pm pnpm
```

## How it works

- Choose language
- Choose framework
- Enter project name
- CLI runs the underlying generator commands (npm/cargo/django-admin/etc.)

If a generator command is missing on your machine, install it and re-run.
