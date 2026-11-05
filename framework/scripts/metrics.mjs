#!/usr/bin/env node
import path from "node:path";
import { reportsDirOf, workspaceRootOf } from "../src/config.mjs";
import { formatSummary, loadReports, summarize } from "../src/metrics.mjs";

const args = process.argv.slice(2);
const json = args.includes("--json");
const dirArg = args.find((a) => !a.startsWith("--"));
const dir = path.resolve(dirArg ?? reportsDirOf(workspaceRootOf(null)));
let rows;
try { rows = loadReports(dir); } catch (e) { console.error(`อ่าน report ไม่ได้ (${dir}): ${e.message}`); process.exit(2); }
if (!rows.length) { console.error(`ไม่พบ report.json ใน ${dir}`); process.exit(1); }
const s = summarize(rows);
console.log(json ? JSON.stringify(s, null, 2) : `# BAAN metrics — ${dir}\n\n${formatSummary(s)}`);
