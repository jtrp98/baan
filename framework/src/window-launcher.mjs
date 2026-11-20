import { spawn } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import path from "node:path";
import { alive } from "./repolock.mjs";

export const MAX_GRID_WINDOWS = 4;

// Manages a 0..3 slot pool for the 2x2 terminal grid so concurrent workers never overlap visually.
export function createWindowSlotPool(maxSlots = MAX_GRID_WINDOWS) {
  const limit = Math.max(1, Math.min(MAX_GRID_WINDOWS, Number(maxSlots) || MAX_GRID_WINDOWS));
  const used = new Set();
  return {
    acquire() {
      for (let i = 0; i < limit; i++) {
        if (!used.has(i)) {
          used.add(i);
          return i;
        }
      }
      return 0;
    },
    release(slot) {
      used.delete(slot);
    },
    activeSlots() {
      return [...used].sort((a, b) => a - b);
    },
  };
}

export function gridGeometry(slot, workArea = { x: 0, y: 0, width: 1920, height: 1040 }) {
  const s = ((Number(slot) || 0) % MAX_GRID_WINDOWS + MAX_GRID_WINDOWS) % MAX_GRID_WINDOWS;
  const col = s % 2;
  const row = Math.floor(s / 2);
  const w = Math.max(480, Math.floor(workArea.width / 2));
  const h = Math.max(320, Math.floor(workArea.height / 2));
  return {
    slot: s,
    x: workArea.x + col * w,
    y: workArea.y + row * h,
    width: w,
    height: h,
  };
}

function cmdEscape(arg) {
  const s = String(arg ?? "");
  if (!s.length) return '""';
  if (/[\s"&|<>^()%!]/.test(s)) {
    return `"${s.replaceAll('"', '\\"')}"`;
  }
  return s;
}

export function buildLaunchCmdScript({
  title,
  cwd,
  command,
  args = [],
  env = {},
  pidFile,
  doneFile,
  briefFile = "",
  bannerLines = [],
  autoCloseBanner = false,
}) {
  const lines = [
    "@echo off",
    "chcp 65001 >nul",
    `title ${String(title || "BAAN CLI").replace(/[\r\n&|<>^]/g, " ")}`,
    `cd /d "${cwd}"`,
  ];

  // Record the child cmd PID from PowerShell/WMIC-free self-probe fallback if not written by launcher.
  if (pidFile) {
    lines.push(`if not exist "${pidFile}" (`);
    lines.push(`  powershell -NoProfile -Command "$p = (Get-CimInstance Win32_Process -Filter ('ProcessId=' + $PID)).ParentProcessId; Set-Content -Path '${pidFile.replaceAll("'", "''")}' -Value $p -NoNewline" >nul 2>&1`);
    lines.push(")");
  }

  for (const [k, v] of Object.entries(env)) {
    if (v !== undefined && v !== null) {
      lines.push(`set "${k}=${String(v).replace(/[\r\n"]/g, "")}"`);
    }
  }

  lines.push("echo ============================================================================");
  for (const line of bannerLines) {
    const safe = String(line ?? "").replace(/[&|<>^()%]/g, " ");
    if (safe.trim()) lines.push(`echo ${safe}`);
  }
  if (briefFile) {
    lines.push(`echo Brief: ${briefFile}`);
  }
  lines.push(autoCloseBanner
    ? "echo [BAAN FLOW] Running automated step in clean session (window will auto-close on finish)..."
    : "echo [BAAN] When finished, type /exit (or close this window) to run Machine Gate.");
  lines.push("echo ============================================================================");
  lines.push("echo.");

  const cmdLine = [cmdEscape(command), ...args.map(cmdEscape)].join(" ");
  lines.push(cmdLine);
  lines.push("set BAAN_EXIT_CODE=%ERRORLEVEL%");

  if (doneFile) {
    lines.push(`> "${doneFile}" echo {"exitCode":%BAAN_EXIT_CODE%}`);
  }
  lines.push("echo.");
  lines.push("echo [BAAN] CLI exited (%BAAN_EXIT_CODE%). Handing back to BAAN Core...");
  lines.push("exit /b %BAAN_EXIT_CODE%");
  return lines.join("\r\n") + "\r\n";
}

function killPid(pid) {
  if (!pid || !Number.isInteger(pid) || pid <= 0) return;
  if (process.platform === "win32") {
    try {
      spawn("taskkill", ["/pid", String(pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
    } catch {}
  } else {
    try { process.kill(-pid, "SIGKILL"); } catch {
      try { process.kill(pid, "SIGKILL"); } catch {}
    }
  }
}

function moveWindowBestEffort(pid, slot) {
  if (process.platform !== "win32" || !pid) return;
  const col = slot % 2;
  const row = Math.floor((slot % MAX_GRID_WINDOWS) / 2);
  const ps = [
    "$ErrorActionPreference = 'SilentlyContinue'",
    "Add-Type -AssemblyName System.Windows.Forms",
    "Add-Type @'\nusing System;\nusing System.Runtime.InteropServices;\npublic class BaanWin {\n  [DllImport(\"user32.dll\")] public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);\n}\n'@",
    "$wa = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea",
    `$w = [int]($wa.Width / 2); $h = [int]($wa.Height / 2); $x = $wa.X + (${col} * $w); $y = $wa.Y + (${row} * $h)`,
    `for ($i = 0; $i -lt 25; $i++) {`,
    `  $proc = Get-Process -Id ${pid} -ErrorAction SilentlyContinue`,
    `  if ($proc -and $proc.MainWindowHandle -ne [IntPtr]::Zero) { [void][BaanWin]::MoveWindow($proc.MainWindowHandle, $x, $y, $w, $h, $true); break }`,
    `  Start-Sleep -Milliseconds 150`,
    `}`,
  ].join("\n");
  try {
    const child = spawn("powershell.exe", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", ps], {
      stdio: "ignore",
      windowsHide: true,
    });
    child.unref();
  } catch {}
}

export async function runInteractiveWindow({
  command,
  args = [],
  cwd,
  env = {},
  runDir,
  name,
  slot = 0,
  title = "BAAN CLI",
  briefFile = "",
  bannerLines = [],
  autoCloseBanner = false,
  signal,
  onSpawn,
  pollMs = 400,
}) {
  if (process.platform !== "win32") {
    const { runInteractiveCli } = await import("./runner.mjs");
    return runInteractiveCli(command, args, cwd, env, { signal, onSpawn });
  }

  mkdirSync(runDir, { recursive: true });
  const wrapperFile = path.join(runDir, `${name}.launch.cmd`);
  const pidFile = path.join(runDir, `${name}.pid`);
  const doneFile = path.join(runDir, `${name}.done.json`);

  for (const f of [pidFile, doneFile]) {
    if (existsSync(f)) {
      try { unlinkSync(f); } catch {}
    }
  }

  const script = buildLaunchCmdScript({
    title,
    cwd,
    command,
    args,
    env,
    pidFile,
    doneFile,
    briefFile,
    bannerLines,
    autoCloseBanner,
  });
  writeFileSync(wrapperFile, script, "utf8");

  const started = Date.now();
  const launchPs = [
    "$ErrorActionPreference = 'Stop'",
    `$p = Start-Process -FilePath 'cmd.exe' -ArgumentList @('/c', '${wrapperFile.replaceAll("'", "''")}') -WorkingDirectory '${cwd.replaceAll("'", "''")}' -PassThru`,
    `Set-Content -Path '${pidFile.replaceAll("'", "''")}' -Value $p.Id -NoNewline`,
    `Write-Output $p.Id`,
  ].join("; ");

  const spawnedPid = await new Promise((resolve, reject) => {
    const child = spawn("powershell.exe", ["-NoProfile", "-WindowStyle", "Hidden", "-Command", launchPs], {
      cwd,
      windowsHide: true,
    });
    let stdout = "";
    let stderr = "";
    child.stdout.on("data", (d) => { stdout += d; });
    child.stderr.on("data", (d) => { stderr += d; });
    child.on("error", reject);
    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(`เปิดหน้าต่าง cmd ไม่สำเร็จ (${code}): ${stderr.trim() || stdout.trim()}`));
        return;
      }
      const pid = Number(stdout.trim().split(/\s+/).at(-1));
      resolve(Number.isInteger(pid) && pid > 0 ? pid : null);
    });
  });

  if (spawnedPid) {
    onSpawn?.(spawnedPid);
    moveWindowBestEffort(spawnedPid, slot);
  }

  return new Promise((resolve) => {
    let settled = false;
    let currentPid = spawnedPid;
    let missingSince = null;

    const cleanup = () => {
      clearInterval(timer);
      signal?.removeEventListener("abort", onAbort);
    };

    const finish = (exitCode = 0) => {
      if (settled) return;
      settled = true;
      cleanup();
      resolve({
        ok: exitCode === 0 && !signal?.aborted,
        exitCode,
        durationMs: Date.now() - started,
        pid: currentPid,
        slot,
      });
    };

    const onAbort = () => {
      if (currentPid) killPid(currentPid);
      finish(130);
    };
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) {
      onAbort();
      return;
    }

    const timer = setInterval(() => {
      if (!currentPid && existsSync(pidFile)) {
        try {
          const parsed = Number(readFileSync(pidFile, "utf8").trim());
          if (Number.isInteger(parsed) && parsed > 0) {
            currentPid = parsed;
            onSpawn?.(currentPid);
          }
        } catch {}
      }

      if (existsSync(doneFile)) {
        let code = 0;
        try {
          const parsed = JSON.parse(readFileSync(doneFile, "utf8").trim());
          if (Number.isInteger(parsed.exitCode)) code = parsed.exitCode;
        } catch {}
        finish(code);
        return;
      }

      // User closed the window via the X button before .done.json could be written.
      if (currentPid && !alive(currentPid)) {
        if (!missingSince) missingSince = Date.now();
        else if (Date.now() - missingSince >= 600) finish(0);
      } else {
        missingSince = null;
      }
    }, pollMs);
  });
}
