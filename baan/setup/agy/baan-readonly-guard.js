#!/usr/bin/env node
'use strict';

// The runner sets this per call; standalone agy sessions keep their own permissions.
const readonly = process.env.BAAN_READONLY === '1';
const readTools = new Set(['view_file', 'grep_search', 'find_by_name', 'list_dir']);
const respond = (decision, reason) => console.log(JSON.stringify({ decision, ...(reason ? { reason } : {}) }));
let input = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', (chunk) => { input += chunk; });
process.stdin.on('end', () => {
  if (!readonly) { respond('allow'); return; }
  try {
    const name = JSON.parse(input)?.toolCall?.name;
    if (readTools.has(name)) respond('allow');
    else respond('deny', `BAAN read-only: tool ${String(name)} is not a file inspection tool.`);
  } catch { respond('deny', 'BAAN read-only: invalid hook input.'); }
});
