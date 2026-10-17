#!/usr/bin/env node
'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const cp = require('child_process');

const WRITE_TOOLS = new Set([
  'write_to_file',
  'replace_file_content',
  'multi_replace_file_content',
  'edit_file',
  'sed_file',
  'notebook_edit',
  'create_file',
  'delete_file'
]);

const SAFE_GIT_SUBCOMMANDS = new Set([
  'status', 'log', 'diff', 'show', 'rev-parse', 'ls-files', 'ls-tree',
  'cat-file', 'blame', 'shortlog', 'describe', 'rev-list', 'for-each-ref'
]);

let rawStdin = '';
process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => { rawStdin += chunk; });
process.stdin.on('end', () => {
  try {
    handle(JSON.parse(rawStdin));
  } catch {
    console.log(JSON.stringify({ decision: 'allow' }));
  }
});

function isMyceliumReadonlySession(parsed) {
  const transcriptPath = String(parsed.transcriptPath || '').replace(/\\/g, '/');
  if (!transcriptPath.includes('antigravity-cli')) {
    return false;
  }
  const convId = parsed.conversationId || '';
  const cacheFile = convId ? path.join(os.tmpdir(), `agy-ro-session-${convId}.json`) : null;
  if (cacheFile && fs.existsSync(cacheFile)) {
    try {
      return Boolean(JSON.parse(fs.readFileSync(cacheFile, 'utf8')).readonly);
    } catch {}
  }
  let readonly = false;
  try {
    const psCmd = `
      $cur = ${process.ppid};
      for ($i = 0; $i -lt 6 -and $cur; $i++) {
        $p = Get-CimInstance Win32_Process -Filter "ProcessId = $cur" -ErrorAction SilentlyContinue;
        if (-not $p) { break }
        if ($p.Name -match '^agy(\\.exe)?$') {
          Write-Output $p.CommandLine;
          break;
        }
        $cur = $p.ParentProcessId;
      }
    `;
    const cmdLine = cp.execFileSync('powershell.exe', ['-NoProfile', '-Command', psCmd], {
      encoding: 'utf8',
      timeout: 4000
    }).trim();
    if (/(?:^|\s)--agent(?:=|\s+)["']?mycelium-readonly["']?(?:\s|$)/i.test(cmdLine)) {
      readonly = true;
    }
  } catch {}
  if (cacheFile) {
    try {
      fs.writeFileSync(cacheFile, JSON.stringify({ readonly }));
    } catch {}
  }
  return readonly;
}

function checkSingleSegment(seg, cwd) {
  const s = seg.trim();
  if (!s) return null;

  // Reject output redirection (> or >>) except safe >$null, 2>$null, >/dev/null, >nul, 2>&1
  const noNullRedirects = s
    .replace(/[12]?>\s*\$null\b/gi, '')
    .replace(/[12]?>\s*\/dev\/null\b/gi, '')
    .replace(/[12]?>\s*nul\b/gi, '')
    .replace(/[12]?>&[12]/g, '');
  if (/(?:^|[^-=<>])>>?(?![=>&])/.test(noNullRedirects)) {
    return 'Blocked in mycelium-readonly mode: shell output redirection (> / >>) is not allowed.';
  }

  // Reject subshells / dynamic command evaluation
  if (/\$\(|\b(?:Invoke-Expression|iex|Start-Process|saps)\b/i.test(s)) {
    return 'Blocked in mycelium-readonly mode: subshell or dynamic execution is not allowed.';
  }

  // 1. Check git commands
  if (/^git(?:\.exe)?\b/i.test(s)) {
    if (/(?:^|\s)(?:--output|-o)(?:=|\s|$)/.test(s)) {
      return 'Blocked in mycelium-readonly mode: git --output is not allowed.';
    }
    const tokens = s.split(/\s+/).slice(1);
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i];
      if (t === '-C' || t === '-c' || t === '--git-dir' || t === '--work-tree') {
        i += 2;
        continue;
      }
      if (t.startsWith('-')) {
        i += 1;
        continue;
      }
      const sub = t.toLowerCase();
      if (SAFE_GIT_SUBCOMMANDS.has(sub)) return null;
      if (sub === 'branch') {
        const rest = tokens.slice(i + 1).join(' ');
        if (!rest || /^(?:--show-current|-a|--all|-r|--remotes|-l|--list|-v|-vv)\b/.test(rest)) {
          return null;
        }
      }
      if (sub === 'remote') {
        const rest = tokens.slice(i + 1).join(' ');
        if (!rest || /^-v$|^--verbose$/.test(rest)) return null;
      }
      if (sub === 'tag') {
        const rest = tokens.slice(i + 1).join(' ');
        if (!rest || /^(?:-l|--list)\b/.test(rest)) return null;
      }
      return `Blocked in mycelium-readonly mode: git subcommand "${sub}" is not in the read-only allowlist.`;
    }
    return null;
  }

  // 2. Check read-only PowerShell / shell inspection commands
  if (/^(?:Get-Content|Get-ChildItem|Get-Item|Get-Location|Select-String|Test-Path|Resolve-Path|Measure-Object|Write-Output|Out-String|Format-Table|Format-List|Select-Object|Where-Object|Sort-Object|cat|type|ls|dir|pwd|echo|head|tail|wc|rg|grep|find|which|where(?:\.exe)?)\b/i.test(s)) {
    return null;
  }

  // 3. Check safe read-only node script file execution (e.g. `node probe.js`)
  const nodeMatch = s.match(/^node(?:\.exe)?\s+([^\s;|&><"']+|"[^"]+"|'[^']+')$/i);
  if (nodeMatch) {
    const rawArg = nodeMatch[1].replace(/^["']|["']$/g, '');
    if (!rawArg.startsWith('-')) {
      const scriptPath = path.resolve(cwd || process.cwd(), rawArg);
      if (fs.existsSync(scriptPath) && fs.statSync(scriptPath).isFile()) {
        const src = fs.readFileSync(scriptPath, 'utf8');
        const unsafeNode = /\b(?:writeFile|writeFileSync|appendFile|appendFileSync|createWriteStream|unlink|unlinkSync|rm|rmSync|rmdir|rmdirSync|mkdir|mkdirSync|rename|renameSync|copyFile|copyFileSync|truncate|truncateSync|openSync|child_process|spawn|spawnSync|exec|execSync|execFile|execFileSync|fork)\b/;
        if (!unsafeNode.test(src)) {
          return null;
        }
      }
    }
  }

  return `Blocked in mycelium-readonly mode: command "${s.slice(0, 80)}" is not in the read-only allowlist.`;
}

function checkReadonlyCommand(cmd, cwd) {
  const s = String(cmd || '').trim();
  if (!s) return null;

  const segments = s.split(/(?:\r?\n|;|&&|\|\||\|)/);
  for (const seg of segments) {
    const err = checkSingleSegment(seg, cwd);
    if (err) return err;
  }
  return null;
}

function handle(parsed) {
  if (!isMyceliumReadonlySession(parsed)) {
    console.log(JSON.stringify({ decision: 'allow' }));
    return;
  }

  const toolName = parsed.toolCall?.name || '';
  if (WRITE_TOOLS.has(toolName)) {
    console.log(JSON.stringify({
      decision: 'deny',
      reason: `Blocked in mycelium-readonly mode: tool "${toolName}" is disabled.`
    }));
    return;
  }

  if (toolName === 'run_command') {
    const cmdLine = parsed.toolCall?.args?.CommandLine || '';
    const cwd = parsed.toolCall?.args?.Cwd || parsed.workspacePaths?.[0] || process.cwd();
    const denyReason = checkReadonlyCommand(cmdLine, cwd);
    if (denyReason) {
      console.log(JSON.stringify({
        decision: 'deny',
        reason: denyReason
      }));
      return;
    }
  }

  console.log(JSON.stringify({ decision: 'allow' }));
}