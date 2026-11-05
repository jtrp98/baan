#!/usr/bin/env node
import { cli } from "../src/cli.mjs";
cli(process.argv.slice(2)).then((result) => {
  console.log(typeof result === "string" ? result : JSON.stringify(result, null, 2));
  process.exitCode = result?.ok === false ? 1 : 0;
}).catch((error) => { console.error(error.message); process.exitCode = 2; });
