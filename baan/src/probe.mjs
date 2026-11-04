// รันคำสั่งตรวจสภาพแวดล้อม (เช่น restore/build/test) บนเครื่องก่อนเปิด session ของ role
// จับ package feed/เครื่องมือขาด ก่อนที่ agent จะเสียเวลาหลายนาทีแล้วจบ BLOCKED · มองไม่เห็น sandbox ของ CLI เอง
// (คำสั่งรันนอก sandbox) — ส่วนนั้นเป็นหน้าที่ของ preflight
import { spawn } from "node:child_process";
import { looksLikeEnvironmentFailure } from "./failure-class.mjs";

const OUTPUT_KEEP_CHARS = 4000;

export function runProbe(command, cwd, timeoutSec = 600) {
  return new Promise((resolve) => {
    let output = "";
    let timedOut = false;
    const keep = (d) => { output = (output + d).slice(-OUTPUT_KEEP_CHARS); };
    const child = spawn(command, { cwd, shell: true, windowsHide: true, env: process.env });
    const timer = setTimeout(() => {
      timedOut = true;
      if (process.platform === "win32") spawn("taskkill", ["/pid", String(child.pid), "/T", "/F"], { stdio: "ignore", windowsHide: true });
      else child.kill("SIGKILL");
    }, timeoutSec * 1000);
    child.stdout.on("data", keep);
    child.stderr.on("data", keep);
    const done = (code) => {
      clearTimeout(timer);
      const failed = code !== 0 || timedOut;
      resolve({ code, output, timedOut, env: failed && (timedOut || looksLikeEnvironmentFailure(output)) });
    };
    child.on("error", (e) => { keep(e.message); done(null); });
    child.on("close", done);
  });
}
