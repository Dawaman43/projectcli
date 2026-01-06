#!/usr/bin/env node

const { main } = require("../src/index");

main({ argv: process.argv.slice(2) }).catch((err) => {
  const message = err && err.message ? err.message : String(err);
  console.error(`\nError: ${message}`);
  process.exitCode = 1;
});
