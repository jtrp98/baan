# Release Notes — 🍄 MYCELIUM

ใหม่สุดไว้บนสุด · เวอร์ชันอยู่ที่ `package.json` · ผลทดสอบละเอียดอยู่ใน `README.md`

## ยังไม่ release (dev/golf) · role ไม่สวมบท MYCELIUM ซ้อนตาม CLAUDE.md/AGENTS.md ของ workspace

### แก้
- **session ที่ถูกเปิดเป็น role ไม่สวมบท MYCELIUM ซ้อนแล้ว** — CLAUDE.md/AGENTS.md ที่ `--init` วางไว้ถูก AI CLI โหลดเองอัตโนมัติ (claude อ่านของโฟลเดอร์แม่ด้วย) role จึงได้คำสั่ง "คุณคือ MYCELIUM" ซ้อนกับบทบาทของตัวเอง (พบจาก smoke จริงที่ schoolbright: codex ที่เปิดเป็น `ba` พยายามเปิด charter ก่อนทำงาน)
  - prompt ของทุก role (รวม PM/planner และงานไม่ผูก role = `adhoc`) ขึ้นต้นด้วยป้าย `[mycelium-role: <ID>]` + ประโยคข้อยกเว้น
  - stub ของ `--init` มีประโยคข้อยกเว้นเดียวกันอยู่ก่อนคำสั่งสวมบท — เจอป้ายนี้ = ทำตามบทบาท ไม่อ่าน charter ไม่เรียก mycelium/mycelium-role ต่อ
- tests 72 → 77 กรณี

### เพิ่ม
- **กติกาสไตล์โค้ดและ comment ของ `fe`/`be`/`qa`** (role ที่เขียนโค้ดลง target — หมวดเดียวกันทั้งสามไฟล์ + test กันไม่ให้ต่างกัน): เขียนให้เหมือนโค้ดรอบข้างใน target ห้ามเปลี่ยนสไตล์/reformat/refactor นอก task · comment เฉพาะ "why" ห้าม comment what · ห้ามใส่ task id หรือ ID เอกสาร (T1/BL/REQ/DES ฯลฯ) ลงในโค้ดหรือ comment — การโยงงานอยู่ใน handoff เท่านั้น (สำหรับ `qa` รวมถึงชื่อเคส test — traceability AC ↔ test อยู่ใน test plan ของ `tp`)

### ⚠ ต้องทำตอนอัปเกรด
- workspace ที่ `--init` ไว้แล้ว: รัน `mycelium --init` ที่ราก workspace อีกครั้งเพื่อให้ CLAUDE.md/AGENTS.md มีข้อยกเว้น (ไฟล์ที่ผู้ใช้เขียนเองจะถูกข้าม — เพิ่มประโยคข้อยกเว้นจาก `src/role-guard.mjs` เอง)

## 0.9.0 — 2026-10-17 · โหมดหลักได้สถานะงาน/fallback เดียวกับโหมดอัตโนมัติ + ID role สั้น

### เปลี่ยน
- **`mycelium-role` cwd เริ่มต้น = ไดเรกทอรีที่เรียก** (เดิม = โฟลเดอร์แม่ของ package → role อ่านผิด repo เงียบๆ เมื่อลืม `--cwd`)
- **`mycelium-role` ตัดสินผลด้วย output state ท้ายคำตอบ** — role ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` = งานไม่สำเร็จแม้ CLI exit 0 · exit 0 เฉพาะเมื่อทุกตัว completed
- โฟลเดอร์ผลของ `mycelium-role` มีชื่อ role + suffix สุ่ม — เปิดหลาย role พร้อมกันในวินาทีเดียวไม่เขียนทับกันอีก
- **ID role สั้นลง**: `pm` `ba` `sa` `ux` `fe` `be` `dba` `tp` `sec` (`planner`/`qa` เท่าเดิม) — ไฟล์ย้ายเป็น `roles/<ID>.md` · ชื่อยาวเดิม (เช่น `business-analyst`) ยังใช้ได้เป็น alias ทั้ง `--role` และในแผน (plan.json เก่า/`--plan-file` ถูกแปลงให้เอง จึง resume run เดิมได้)
- **tier ตรงกันทุกที่**: แก้บรรทัด tier ในไฟล์ role และตาราง README ที่เพี้ยนจากโค้ด (SA เคยเขียน t0–t1 แต่ใช้จริง t1 · PM/security t1–t2 แต่ใช้จริง t2 · FE/BE t2–t3 แต่เลือกได้ t2–t5)
- คำอธิบายใหม่: "ผู้คุมทีม AI 11 role: แตกงาน เปิด session ราย role ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์" · `dba` แสดงชื่อเป็น Database Advisor (ตรงกับหน้าที่ที่ปรึกษา ห้ามรัน SQL)

### เพิ่ม
- `mycelium-role` สลับตัวรันเมื่อติดโควตาตาม `_fallback` ของ tier (agent เดียว + `--tier`) · `--no-fallback` ปิดได้ · `report.json` มี `state`/`marker`/`fallback`
- **วันที่ของงานใน prompt ทุก role** + PM/planner — ค่าเริ่มต้น = วันที่ local ของเครื่อง · `--date YYYY-MM-DD` ทั้งสองคำสั่ง · CONVENTIONS §4 ให้ role ใช้วันที่นี้แทนการถาม (role รัน non-interactive ถามไม่ได้)
- หัวไฟล์ role รูปแบบเดียว: `# บทบาท:` ชื่อแสดง · `> หน้าที่:` หนึ่งบรรทัด · `> tier:` — `--list` แสดง ID/ชื่อ/tier/หน้าที่/ชื่อเดิม และ prompt ของ planner ได้หน้าที่ของแต่ละ role ด้วย
- กลไก fallback รวมเป็น `runWithFallback` ชุดเดียว (งานในแผน, PM/planner, mycelium-role) · `mycelium-role` ประกอบ prompt ผ่าน `roleDirective` ร่วมกับโหมดอัตโนมัติ
- tests 54 → 72 กรณี: cwd, runDir ไม่ชน, state/fallback ของ mycelium-role, วันที่ใน prompt, alias ชื่อ role และ test กันตาราง role/tier เพี้ยนจากโค้ด

### ⚠ ต้องทำตอนอัปเกรด
- สคริปต์/session ที่เรียก `mycelium-role` โดยไม่ส่ง `--cwd` และพึ่ง cwd เดิม (โฟลเดอร์แม่ของ package) — ส่ง `--cwd` ให้ชัด
- ผู้ที่ใช้ exit code ของ `mycelium-role`: ตอนนี้ role ที่ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` ได้ exit 1 (เดิม 0) — อ่านบรรทัด `สรุป:` เพื่อดูสถานะราย agent
- ใครอ้าง path ไฟล์ role ตรงๆ (เช่น `roles/business-analyst.md`) เปลี่ยนเป็น `roles/<ID>.md` · คำสั่ง `--role` ชื่อเดิมไม่ต้องแก้ (alias) · workspace ที่ `--init` ไว้แล้ว: รัน `mycelium --init` อีกครั้งเพื่ออัปเดตหัวข้อ CLAUDE.md/AGENTS.md (ไม่บังคับ)

## 0.8.0 — 2026-10-17 · เติม agy กลับทุก tier ด้วย Gemini 4 Argon

### เปลี่ยน
- **agy ใช้ได้ครบทุก tier แล้ว** หลัง Gemini 4 Argon เปิดตัว: t0/t1 = `gemini-4-argon-high` · t2 = `gemini-4-argon-medium` (t3–t5 คง `gemini-3.8-flash` เดิม)
- ข้อจำกัด: agy ไม่มี effort `max` ให้ — ที่ t0 จึงใช้ argon-high เป็นเพดานสูงสุด (ต่างจาก claude/codex ที่ได้ max)
- ตรวจชื่อ model จริงจาก `agy models` ก่อนเติม · อัปเดตตาราง tier ladder ใน README + charter ให้ตรง

### เพิ่ม
- tests ตรวจ `agents.json` (ทุก tier ประกาศครบสาม agent · รูปแบบ entry ถูกต้อง · argon อยู่ t0–t2, flash อยู่ t3–t5) — รวม 48 กรณี

## 0.7.0 — 2026-10-16 · config เหลือไฟล์เดียว `mycelium.config.json` ที่ราก workspace

### เปลี่ยน
- config ของ workspace จาก `<workspace>\mycelium\mycelium.json` (โฟลเดอร์ซ้อนชื่อไฟล์) → **`<workspace>\mycelium.config.json`** ไฟล์เดียว
- discovery เดินหาขึ้นจากจุดที่เรียก **ตัวใกล้สุดชนะ** — workspace ซ้อนกันได้ · แผนเก่า `mycelium\mycelium.json` ยังถูกพบได้ (ไม่พังทันทีเมื่ออัปเกรด)
- `mycelium --init` ย้าย config แผนเก่าให้อัตโนมัติ + ทำไฟล์นำทาง (CLAUDE.md/AGENTS.md) ใหม่ให้ชี้ตำแหน่งถูก

### ⚠ ต้องทำตอนอัปเกรด
- workspace ที่ตั้งไว้สมัย 0.5–0.6: รัน `mycelium --init` ที่ราก workspace หนึ่งครั้ง ระบบจะย้าย config เป็นแผนใหม่ให้เอง

(พร้อมกันนี้เพิ่ม `mycelium --init` ใน 0.6.0 สำหรับผู้ที่พลาด: สร้าง CLAUDE.md/AGENTS.md ให้ AI session สวมบท MYCELIUM เอง + config จาก template)

## 0.6.0 — 2026-10-16 · `mycelium --init` ติดตั้ง workspace ครั้งเดียว จบเรื่องสวมบท

### เพิ่ม
- **`mycelium --init`** — รันครั้งเดียวที่ราก workspace (เช่น `C:\src\schoolbright`):
  - สร้าง `mycelium\mycelium.json` จากตัวอย่าง (ถ้ายังไม่มี — ถ้ามีอยู่แล้วไม่แตะ)
  - สร้าง **`CLAUDE.md`** (Claude Code โหลดอัตโนมัติ) และ **`AGENTS.md`** (codex และ agent อื่นโหลดอัตโนมัติ) ที่ราก workspace
  - สองไฟล์นี้เป็น "ทางเข้า" ที่ชี้ไป charter `MYCELIUM.md` ตัวจริงใน package — เปิด AI session ที่ workspace ได้เลย สวมบท MYCELIUM เองโดยไม่ต้องพิมพ์คำสั่ง และ charter ตกรุ่นไม่ได้เพราะไม่มีสำเนา
- รัน `--init` ซ้ำได้: config ของผู้ใช้ไม่ถูกแตะ · stub ที่เราสร้างไว้ถูก regenerate · ไฟล์ CLAUDE.md ที่ผู้ใช้เขียนเองจะถูกข้ามพร้อมเตือน (ไม่ทับเด็ดขาด)

## 0.5.0 — 2026-10-16 · แยก config ออกจาก package

config ของ workspace (targets/knowledge paths ของแต่ละเครื่อง) ย้ายออกจาก package — update version หรือ clone package ใหม่จะไม่ทับ config อีกต่อไป

### เพิ่ม
- **config discovery**: เดินหา `<dir>\mycelium\mycelium.json` ขึ้นจากไดเรกทอรีที่เรียก (เช่นเรียกจากใน `C:\src\schoolbright\...` จะเจอ `C:\src\schoolbright\mycelium\mycelium.json` เอง)
- `--config <file>` และ env `MYCELIUM_CONFIG` สำหรับระบุตำแหน่งตรงๆ (ชนะ discovery)
- `mycelium --list` แสดงว่าอ่าน config จากไหน · ไม่พบ target จะบอกตำแหน่ง config ที่ใช้อยู่ด้วย
- `mycelium.example.json` — template ตัวอย่างใน package แทนไฟล์จริง

### เปลี่ยน
- `mycelium.json` หายไปจาก package (ย้ายเป็นของ workspace แต่ละที่) — `files` ใน package.json ใช้ example แทน
- เรียกจากนอก workspace ที่ไม่มี config → ใช้ default ในโค้ด (ไม่มี targets) พร้อมข้อความแนะนำ

### ⚠ ต้องทำตอนอัปเกรด
- ย้าย config เดิมไปวางที่ `<ราก workspace>\mycelium\mycelium.json` (เช่น `C:\src\schoolbright\mycelium\mycelium.json`) หรือส่ง `--config` ทุกครั้ง

## 0.4.0 — 2026-10-16 · แยกโครงสร้างไฟล์

แยกโค้ดจาก 2 ไฟล์ใหญ่ (938 บรรทัดรวม) เป็น `bin/` + `src/` ตามโครงสร้างที่ AUDIT ข้อ 7 แนะนำ

### เปลี่ยน
- `bin/mycelium.mjs` + `bin/mycelium-role.mjs` — entrypoint เหลือแค่ parse args และลำดับใหญ่ (~195 บรรทัด/ไฟล์)
- `src/` แยกหน้าที่: `config` (การตั้งค่า/targets/roles) · `runner` (spawn AI CLI) · `prompts` (ประกอบ prompt) · `plan` (validation แผน DAG) · `scheduler` (สถานะงาน/execute) · `run-store` (checkpoint/manifest/resume)
- กลไก spawn/args/stdin/timeout ที่เคยซ้ำในสองคำสั่ง รวมเป็น `src/runner.mjs` ชุดเดียว
- comment เหลือเฉพาะเหตุผล (why) ที่โค้ดบอกเองไม่ได้ · ลบของไม่ใช้ (`PLANNER_TIERS_ROLES`, ตัวช่วย smoke ชั่วคราว)

### ⚠ ต้องทำตอนอัปเกรด
- path ของ bin เปลี่ยน — เครื่องที่ link ไว้ต้อง `npm link` ใหม่หนึ่งครั้ง

## 0.3.0 — 2026-10-16 · แก้ความถูกต้องตาม AUDIT.md (2026-10-15)

แก้ P1 ครบ 5 ข้อ + P2 สองข้อ พร้อม regression tests 35 กรณี (`npm test` — จำลอง provider ไม่ใช้โควตา)

### เพิ่ม
- **สถานะงานแยกจาก exit code** — task เป็น `completed` เฉพาะเมื่อรันจบ + มีคำตอบ + output state ท้ายคำตอบ (CONVENTIONS §8) เป็น `DONE`/`PASS`; role ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` ถือว่างานล้มแม้ exit code เป็น 0
- **checkpoint ราย task** (`<id>.status.json`) เขียนทันทีแบบ atomic พร้อม attempt และ artifact paths
- **manifest ของ run** (`run.json`) เก็บ resolved target/cwd/write/projectCtx — `--resume` คืนบริบทเดิมอัตโนมัติ (flag ที่ส่งเองชนะเสมอ)
- **exit code ใหม่**: 0 เมื่อทุก task completed เท่านั้น · 1 เมื่อมี needs_*/fail/timeout/blocked พร้อมสาเหตุราย task
- context ส่งต่อระหว่าง task แนบสถานะ + path ฉบับเต็ม และแจ้งเมื่อถูกตัดที่ 6,000 ตัวอักษร

### แก้
- **dependency ผ่านเฉพาะงานที่ completed** — เดิมงาน fail แล้วงานลูกยังรันต่อและ pipeline จบ exit 0 ได้; ตอนนี้งานลูกถูก mark `blocked` แต่งานอิสระยังทำต่อจนจบ
- **resume เลิกเชื่อไฟล์คำตอบลอยๆ** — เดิมมี answer ไม่ว่าง = สำเร็จ ทำให้งาน timeout ที่มี output บางส่วนถูกข้าม; ตอนนี้เชื่อเฉพาะ checkpoint completed ที่มีคำตอบจริง
- **`--dry-run` ถูกกันทุก route** — เดิม `--plan-file`/`--resume` ข้ามจุดตรวจจนเรียก provider จริง; ตอนนี้การ์ดอยู่ใน `execute` จุดเดียว
- **plan validation ก่อน spawn ใดๆ** — id จำกัด pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` (กัน path traversal เพราะ id คือชื่อไฟล์), ตรวจ types ของ tasks/dependsOn/humanGates, self-dependency, cycle, และขอบเขต `--max-parallel`/`--timeout`
- **CONVENTIONS.md ติด package** แล้ว (`npm pack` ยืนยัน) — เดิมติดตั้งจาก tarball แล้วกติกากลางหายเงียบๆ; ตอนนี้อ่านไม่ได้ = หยุดชัดเจน · planner ได้กติกากลางครบเหมือน role อื่น

### ⚠ ต้องทำตอนอัปเกรด
- run ที่สร้างก่อน 0.3.0 ไม่มี checkpoint — `--resume` จะรันงานใหม่ทั้งหมด (โดย design เพื่อไม่เชื่อผลที่ไม่รู้สถานะ)

## 0.2.0 — 2026-10-15 · ทีม 11 role + CONVENTIONS + โหมดอัตโนมัติ

### เพิ่ม
- บทบาททีม 11 ตำแหน่งใน `roles/` (planner ถึง security) พร้อม `CONVENTIONS.md` เป็นกติกากลางที่แนบให้ทุก role อัตโนมัติ
- โหมดอัตโนมัติทั้งก้อน: `mycelium --goal "..."` — goal → PM → planner (แผน DAG) → execute ตาม wave · planner เลือก tier ได้เฉพาะ frontend/backend-engineer
- output state มาตรฐานตาม charter: `DONE`/`PASS`/`FAIL`/`BLOCKED`/`NEEDS_*`
- tier ladder t0–t5 (claude/codex/agy) + FIXED_ROLE_TIER + humanGates รวมรายงานตอนจบ

### แก้
- ข้อความ console อ้าง path เก่า `ai-team/roles/` → `roles/`

## ก่อน 0.2.0 (ช่วง POC — 2026-10-14)

พิสูจน์กลไกก่อนตั้งทีม: agent CLI ทั้งสาม (claude/codex/agy) อ่านไฟล์จริงได้, เปลี่ยน model/effort ตาม tier ได้จริง (ผ่าน 15/15), role directive ส่งถึง agent จริง — รายละเอียดอยู่ใน `README.md` หัวข้อผลการทดสอบ

## ถัดไป (ยังค้างจาก audit)

- task-level write scope + จัดคิวงานที่เขียน path เดียวกัน — ก่อนใช้ `--write` กับงานจริง
- humanGate เป็น object ผูกกับ task พร้อมหลักฐานการอนุมัติ
- Git baseline ของทั้ง workspace เพื่อรีวิว/ย้อนการเปลี่ยนแปลง
