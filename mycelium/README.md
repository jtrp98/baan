# 🍄 MYCELIUM — ผู้คุมทีม AI 11 role

> แตกงาน เปิด session ราย role ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์

> ประวัติรุ่นและสิ่งที่เปลี่ยนแต่ละเวอร์ชัน: `RELEASE-NOTES.md`

**MYCELIUM คือบทบาทที่ AI session สวม** — session ที่สวม MYCELIUM เป็นผู้คุมทั้ง 11 ตำแหน่ง และเปิด session ของแต่ละ role เองได้ (ผ่าน `claude -p` / `codex exec` / `agy --print` แบบ non-interactive — กลไกเดียวกับที่พิสูจน์ไปตอนแรก)

ระบบนี้เป็น **local npm package** (อยู่ที่ `C:\src\AICode\project-ai\mycelium`) — ติดตั้งครั้งเดียวด้วย `npm link` แล้วเรียกจากโปรเจกต์ไหนก็ได้ ไม่ต้อง copy code ไปทุกที่ ไม่รก

## สถาปัตยกรรม

```
AI session ใดก็ได้ (claude/codex/agy/ZCode/...)
  └─ สวมบท MYCELIUM ตาม MYCELIUM.md (charter)
       └─ เปิด session ของ 11 role ผ่านคำสั่ง:
            mycelium-role --agent codex --role <ชื่อ> --tier <t> --task "..."
            (แต่ละ role รันด้วย claude/codex/agy ตาม tier ใน agents.json)
```

การใช้งานสองโหมด:
1. **โหมดหลัก** — AI session สวม MYCELIUM แล้วคุมเอง (อ่าน `MYCELIUM.md`)
2. **โหมดอัตโนมัติ** — `mycelium --goal "..."` (PM → planner → execute เป็นสคริปต์ ตาม DAG)

โครงสร้างข้อมูล (config ของ workspace อยู่**นอก package** ที่ `<ราก workspace>\mycelium.config.json` เช่น `C:\src\schoolbright\mycelium.config.json` — กัน update version ทับ config): **ที่เก็บเอกสาร** (`knowledge_roots` เช่น `C:\src\schoolbright\knowledge`) · **ที่เก็บ code** (`targets` เช่น `C:\src\schoolbright\target\*`) — ตัว mycelium เดินหา config ขึ้นจากไดเรกทอรีที่เรียกอัตโนมัติ (หรือ `--config <file>` / env `MYCELIUM_CONFIG`) · ติดตั้ง workspace ด้วย `mycelium --init` · โหมดอัตโนมัติใช้ผ่าน `--target <ชื่อ>` · ตัวอย่างรูปแบบไฟล์: `mycelium.example.json`

```
C:\src\AICode\project-ai\mycelium\            ← ตัว package (npm link แล้วใช้ได้จากทุกที่)
  MYCELIUM.md               ← charter: บทบาท MYCELIUM สำหรับ AI session สวม
  bin\
    mycelium.mjs            ← entrypoint โหมดอัตโนมัติ (คำสั่ง mycelium) — parse args + ลำดับใหญ่ PM → planner → execute
    mycelium-role.mjs       ← entrypoint เปิด session ราย role (คำสั่ง mycelium-role)
  src\
    config.mjs              ← อ่าน/resolve การตั้งค่า: mycelium.json, agents.json, roles/, targets
    runner.mjs              ← เรียก AI CLI: args, stdin, timeout, อ่านคำตอบ (ใช้ร่วมสองคำสั่ง)
    prompts.mjs             ← ประกอบ prompt: ไฟล์ role + CONVENTIONS + บริบทโปรเจกต์ + context งานก่อนหน้า
    plan.mjs                ← schema แผน DAG + validation (id, types, cycle) + FIXED_ROLE_TIER
    scheduler.mjs           ← สถานะงาน (state/marker) + dependency + execute ตาม wave + dry-run guard
    run-store.mjs           ← checkpoint ราย task + manifest ของ run (run.json) + resume
    role-session.mjs        ← แกนของ mycelium-role: parse args, runDir ไม่ชน, สถานะงาน + fallback ราย agent
  mycelium.example.json     ← template การตั้งค่า (config จริงอยู่นอก package ที่ <workspace>\mycelium.config.json)
  agents.json               ← ตัวรัน (claude/codex/agy) + tier ladder t0–t5
  roles\                    ← 11 ตำแหน่งในทีม
  tests\                    ← regression tests (npm test)
  reports\                  ← ผลการรันทุกครั้ง
```

## การสวมบท MYCELIUM (โหมดหลัก)

เปิด AI session ใดก็ได้ แล้วสั่ง:

```
อ่าน C:\src\AICode\project-ai\mycelium\MYCELIUM.md แล้วสวมบทบาท MYCELIUM
เป้าหมาย: <goal ของคุณ>   (โปรเจกต์: <path หรือชื่อ target>)
```

session นั้นจะกลายเป็นสมอง — รับ goal แตกงาน สั่ง `mycelium-role` เปิด session ของแต่ละ role ตาม tier ที่กำหนด ส่งต่อ context ระหว่าง role และรวบรวมประตูมนุษย์มาถามคุณตอนจบ

## วิธีใช้ (คำสั่งของ package — ใช้ได้จากทุกไดเรกทอรี)

```bash
# ดูทุกอย่างที่ตั้งค่าไว้ (knowledge/targets/roles/tiers/defaults)
mycelium --list

# เปิด session ของ role เดียว (มือของ MYCELIUM)
mycelium-role --agent codex --role ba --tier t2 --task "เขียน requirement ของ..."
mycelium-role --agent codex --role qa --tier t2 --cwd C:\path\to\repo --task "เขียน unit test ของ utils.js"
mycelium-role --all --role sec --tier t2 --task "รีวิว API..."      # ทุก agent พร้อมกัน
mycelium-role --agent codex --role be --tier t3 --write --task "แก้บั๊ก..."  # อนุญาตแก้ไฟล์

# โหมดอัตโนมัติทั้งก้อน
mycelium --target sb-api-academic-timetable-ai --goal "..." --dry-run
mycelium --target sb-api-gateway --goal "แก้บั๊ก ..."
mycelium --resume <runDir>        # ต่อ run ที่ค้าง ข้ามเฉพาะ task ที่ completed (คืน target/cwd เดิมอัตโนมัติ)

# คำสั่งระดับล่างอื่นๆ ของ mycelium-role (orchestrator)
mycelium-role --all --tier t0 --task "งานยากมาก ทุก agent พร้อมกัน"
mycelium-role --agent claude --model haiku --effort low --task "..."
mycelium-role --list              # ดูรายชื่อ agent + tier
```

### สัญญาของ `mycelium-role` (โหมดหลัก — ใช้กติกาเดียวกับโหมดอัตโนมัติ)

- **cwd เริ่มต้น = ไดเรกทอรีที่เรียก** (เดิมคือโฟลเดอร์แม่ของ package ซึ่งทำให้ role อ่านผิด repo เมื่อลืม `--cwd`) · `--cwd` แบบ relative อิงจากที่เรียก
- **สถานะงานจาก output state ท้ายคำตอบ** (CONVENTIONS §8) ไม่ใช่ exit code ของ CLI — บรรทัดผลของแต่ละ agent แสดง `OK`/`NEEDS_HUMAN`/`FAIL(exit=…)`/... · `report.json` มี `state`/`marker`/`fallback` ราย agent · **exit 0 เฉพาะเมื่อทุกตัว completed**
- **fallback เมื่อติดโควตา** ตาม `_fallback` ของ tier — ทำเฉพาะเมื่อสั่ง agent เดียวพร้อม `--tier` (`--all` ไม่สลับ) · ตัวสำรองใช้ model/effort ของ tier (ไม่ใช้ `--model`/`--effort` ที่ระบุให้ตัวแรก) · ปิดด้วย `--no-fallback`
- **runDir ไม่ชนกัน**: `reports/<timestamp>-<role>-tier-<t>-<n>agents-<สุ่ม>/` — เปิดหลาย role ขนานกันในวินาทีเดียวได้
- **วันที่ของงาน** ใส่ใน prompt ทุก role (และ PM/planner ในโหมดอัตโนมัติ) — ค่าเริ่มต้น = วันที่ local ของเครื่อง · override ด้วย `--date YYYY-MM-DD` (ทั้ง `mycelium` และ `mycelium-role`) · resume ใช้วันที่ของวันที่รันจริง ไม่คืนจาก run เดิม

# กำหนดบทบาท (role) — ตำแหน่งในทีม

ไฟล์นิยามบทบาทอยู่ที่ `roles/<ID>.md` (หัวไฟล์มี `# บทบาท:` ชื่อแสดง · `> หน้าที่:` หนึ่งบรรทัด · `> tier:` — `--list` และ prompt ของ planner อ่านจากตรงนี้) ใช้กับ flag `--role` โดย mycelium-role จะผูกบทบาทเข้ากับ task ให้ agent ก่อนส่งงาน:

```bash
mycelium-role --agent agy --role qa --tier t3 --task "เขียน unit test ของ utils.js ตาม acceptance criteria ใน SPEC.md"
mycelium-role --all --role sec --tier t1 --task "รีวิวความปลอดภัยของ API ที่เพิ่งสร้าง"
```

| ID | ชื่อ | หน้าที่ | tier | ชื่อเดิม (alias) |
|---|---|---|---|---|
| `planner` | Planner | แตก goal ใหญ่เป็นแผน DAG แล้วส่งให้ PM (เฉพาะงานใหญ่) | t2 | — |
| `pm` | Project Manager | เป็นเจ้าของ plan.md, backlog และ release scope ข้าม run (เฉพาะงานใหญ่) | t2 | `project-manager` |
| `ba` | Business Analyst | เขียน REQ/AC/BR ที่ทดสอบได้ และทะเบียนคำถามค้าง (OQ) | t2 | `business-analyst` |
| `sa` | System Analyst | ออกแบบ DES และสัญญา API แล้วตรวจกับโค้ดจริง (as-built) | t1 | `system-analyst` |
| `ux` | UX/UI Designer | ร่าง UX ราย feature รอคนเซ็น และดูแล design system | t2 | `uxui-designer` |
| `fe` | Frontend Engineer | implement ตาม UX ที่เซ็นแล้ว และสัญญา backend ตัวจริง | **MYCELIUM/planner เลือกราย task (t2–t5 ตามความยาก)** | `frontend-engineer` |
| `be` | Backend Engineer | implement ตามสัญญา โดย validation และ error contract ต้องครบ | **MYCELIUM/planner เลือกราย task (t2–t5 ตามความยาก)** | `backend-engineer` |
| `dba` | Database Advisor | ออกแบบ schema และเขียน SQL พร้อม rollback แต่ห้ามรันเอง | t2 | `database-administrator` |
| `tp` | Test Planner | ทำ TP, test matrix และ traceability ครบทุก AC | t2 | `test-planner` |
| `qa` | QA | เขียน unit test จาก spec และตัดสิน PASS/FAIL ราย task | t2 | — |
| `sec` | Security & Compliance | ตรวจ OWASP และ PDPA/GDPR แล้วประกาศ blocker | t2 | `security` |

หลักการแบ่งหน้าที่ที่ฝังไว้ใน role (สอดคล้อง convention ของโปรเจกต์ timetableai):
- **วางแผนกับสั่งงานแยกกัน** — planner วางแผน, PM เป็นคนเรียกใช้ทีมตามแผน
- **QA แยกจาก dev** — dev ไม่เขียน unit test โค้ดตัวเอง (เข้าข้างตัวเอง) QA เขียนจาก AC + test plan และห้ามแก้โค้ด production เพื่อให้ test ผ่าน
- **Artifact ต้องเซ็นก่อนใช้** — UX draft ของ `ux` ใช้ implement ไม่ได้จนกว่าผู้ใช้เซ็น; sign-off เป็นการกระทำของคนเสมอ
- **DBA ห้ามรัน SQL ทุกกรณี** — เขียน script พร้อม rollback plan ให้คนรันเท่านั้น
- ทุก role ระบุ "ขอบเขตที่ต้องส่งต่อ" ชัดเจน และทุกเอกสารเดินแนว append-only + change log
- **เพิ่ม/ลดตำแหน่งได้อิสระ** — แค่เพิ่ม/ลบไฟล์ `.md` ใน `roles/` ระบบหาอัตโนมัติ (ดูรายชื่อด้วย `--list`)

ตัวอย่าง flow งานเต็มรูปแบบ: `planner` วางแผน → `pm` เรียกทีมตามแผน → `ba` เขียน REQ/AC → `ux` ร่าง UX รอผู้ใช้เซ็น → `sa` ออกแบบ DES/สัญญา → `dba` รีวิม schema + เขียน SQL (คนรัน) → `fe`/`be` implement ตาม signed artifact → `tp` วางแผนทดสอบ → `qa` เขียน unit test อิสระ + รายงานรอบ → `sec` รีวิวก่อนขึ้น production

## โหมดอัตโนมัติ (`mycelium`)

สำหรับงานที่อยากให้รันทั้งก้อนโดยไม่ต้องมี session คุมเอง — การไหล: **goal → PM (จุดเข้า เขียนคำมอบหมาย) → planner (วางแผนเป็น DAG) → execute ตามแผน** (สคริปต์ทำหน้าที่เป็น "มือของ PM" แทน session ที่สวม MYCELIUM)

กติกาสำคัญที่ฝังไว้:
- **planner เลือก tier ได้เฉพาะ task ของ `fe` / `be`** (งาน implement ที่ผ่าน design ของ SA มาแล้ว) — role อื่นทุกตัวใช้ tier คงที่ตาม `FIXED_ROLE_TIER` ใน `src/plan.mjs` (บรรทัด `> tier:` ในไฟล์ role และตาราง role ถูก test ให้ตรงกับค่านี้เสมอ)
- task ที่ไม่พึ่งกัน (dependsOn ว่าง) **รันขนานกัน** ตามลำดับ wave
- งานง่าย planner ให้น้อย task เอง — ไม่ต้องใช้ทั้งทีม
- สิ่งที่ต้องเป็นประตูมนุษย์ (sign-off UX / รัน SQL / ตัดสินธุรกิจ) รวมเป็น `humanGates` รายงานตอนจบ — ไม่ทำแทน
- default agent = **codex** (`--agent` เปลี่ยนได้)
- ตัวเปิด session ราย role (มือระดับล่าง) คือคำสั่ง `mycelium-role`

```bash
mycelium --goal "..." --dry-run   # PM + planner แล้วดูแผน ยังไม่ execute
mycelium --goal "..."             # รันครบทุก wave
mycelium --resume <runDir>        # ต่อ run ที่ค้าง ข้ามเฉพาะ task ที่ completed (ประหยัด token)
mycelium --plan-file <f>          # รันแผนที่แก้เอง
# --dry-run ใช้กับทุก route ได้ (รวม --plan-file/--resume) — การ์ดห้ามเรียก provider อยู่ที่ execute จุดเดียว
```

### สถานะงาน · checkpoint · resume (ตั้งแต่ v0.3.0)

- **สถานะงานแยกจาก exit code ของ CLI**: task จบด้วย `completed` เฉพาะเมื่อรันจบ + มีคำตอบ + output state ท้ายคำตอบ (CONVENTIONS §8) เป็น `DONE`/`PASS` (หรือไม่มี marker) — ถ้า role ตอบ `NEEDS_HUMAN` / `NEEDS_REQUIREMENT_CHANGE` / `NEEDS_DESIGN_CHANGE` / `FAIL` / `BLOCKED` ถือว่า**งานไม่สำเร็จแม้ exit code เป็น 0**
- **dependency ผ่านเฉพาะงานที่ completed** — งานลูกของงานที่ล้มจะถูก mark `blocked` แล้วข้าม แต่งานอิสระที่ไม่ติด blocker ยังทำต่อจนจบ
- **exit code ของ `mycelium`**: 0 เมื่อทุก task completed เท่านั้น — เจอ needs_*/fail/timeout/blocked ตัวใดตัวหนึ่งจะเป็น 1 พร้อมสรุปสาเหตุราย task
- **checkpoint ต่อ task**: ทุกงานเขียน `<id>.status.json` ทันทีที่จบ (สถานะ, marker, exit code, attempt, artifact paths) — `--resume` เชื่อเฉพาะ checkpoint (`completed` + มีไฟล์คำตอบจริง) งาน timeout/fail/needs_* และ run เก่าก่อน v0.3 จะถูกรันใหม่
- **manifest ของ run (`run.json`)**: เก็บ resolved target/cwd/write/projectCtx ตอนสร้าง run — `--resume` คืนบริบทเดิมอัตโนมัติ (flag ที่ส่งเองชนะเสมอ และจะพิมพ์บอกทุกครั้งที่คืนค่า) จึงไม่หลุดเป็นทำงานผิดโปรเจกต์
- **plan validation ก่อน spawn ใดๆ**: id ต้องเข้า pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` (id คือชื่อไฟล์ จึงกัน path traversal), ตรวจ types ของ tasks/dependsOn/humanGates, self-dependency และ cycle
- **context ส่งต่อระหว่าง task**: แนบสถานะ + path ฉบับเต็มเสมอ และถ้าเนื้อหาถูกตัดที่ 6,000 ตัวอักษรจะบอกว่าถูกตัดกี่ตัวอักษร
- regression tests: `npm test` (node:test ล้วน ไม่มี dependency เพิ่ม ไม่ยิง provider จริง)

หมายเหตุจากการทดสอบ: task ที่ผลิตเอกสารยาว (เช่น SA @ t1) ใช้เวลาเกิน 240 วินาที — MYCELIUM ตั้ง default timeout 600 วินาทีแล้ว และถ้ายังช้าอยู่ใช้ `--timeout` เพิ่มได้

## การเปลี่ยน model / effort (สำหรับแบ่ง tier)

แต่ละ CLI ใช้ syntax ต่างกัน — mycelium-role แปลงให้ผ่าน `modelArgs`/`effortArgs` ใน `agents.json`:

| Agent | เปลี่ยน model | เปลี่ยน effort | ระดับ effort ที่รองรับ |
|---|---|---|---|
| claude | `--model <alias>` เช่น `haiku`, `sonnet`, `opus` | `--effort <level>` | low, medium, high, xhigh, max |
| codex | `-m <model>` (เฉพาะชื่อใน list ของ /model) | `-c model_reasoning_effort=<level>` | none, minimal, low, medium, high, xhigh, max |
| agy | `--model <ชื่อจาก agy models>` | `--effort <level>` | low, medium, high, xhigh, max |

ข้อควรรู้ที่พิสูจน์แล้วจากการทดสอบจริง:

- **claude**: ยืนยันผ่าน `--output-format json` — `--model haiku` ได้ `claude-haiku-5-5` จริง และ JSON มี `total_cost_usd` ต่อ run ด้วย (เอาไปเก็บสถิติ cost ต่อ tier ได้)
- **codex**: header ของ `codex exec` พิมพ์ model/effort ที่ใช้จริงออกมาขณะรัน
- **codex (บัญชี ChatGPT)**: สลับ model ได้เฉพาะชื่อที่อยู่ใน `/model` ของ codex เอง ได้แก่ `gpt-6.1-sol` (default), `gpt-6-astra` (frontier), `gpt-6-sol`, `gpt-6-luna` (fast/cheap), `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` — ชื่ออื่นเช่น `gpt-6.1-codex` หรือ `gpt-6.1` จะโดน API ปฏิเสธ (ตรวจรายชื่อล่าสุดได้จาก `/model` ใน codex interactive)
- **agy**: เป็น multi-provider (gemini/claude/gpt-oss) — ชื่อ model ฝัง effort ไว้ในตัวเลย เช่น `gemini-3.8-flash-low`, `claude-opus-5-5-high` (ดูทั้งหมดด้วย `agy models`) และ**ต้องวาง `--model` ก่อน `--print`** เพราะ `--print` จะกลืน argument ถัดไปเป็น prompt (mycelium-role จัดการลำดับนี้ให้อยู่แล้ว)

tier ladder ปัจจุบัน (T1 = anchor ที่ Opus 5.5 high, ค่ายอื่นจัดตัวทัดเทียมตามระดับ, T0 = overdrive):

| tier | เหมาะกับ | claude | codex | agy |
|---|---|---|---|---|
| t0 | งานยากมาก "ไม่จบไม่สิ้น" ประเด็นซับซ้อน ต้องคิดลึกสุด | opus / max | gpt-6-astra / max | gemini-4-argon-high |
| t1 | งานคิดยาก ออกแบบสถาปัตยกรรม ตัดสินใจสำคัญ | opus / high | gpt-6-astra / high | gemini-4-argon-high |
| t2 | โค้ดซับซ้อน หลายไฟล์ มีเงื่อนไข | sonnet / high | gpt-6.1-sol / high | gemini-4-argon-medium |
| t3 | งานพัฒนาปกติ คุณภาพดี ราคาสมดุล | sonnet / medium | gpt-6.1-sol / medium | gemini-3.8-flash-medium |
| t4 | งานประจำ เขียน test, refactor เล็กน้อย | haiku / medium | gpt-6-luna / medium | gemini-3.8-flash-medium |
| t5 | งานจำนวนมาก สรุป/จัดหมวด/ตอบคำถามง่าย | haiku / low | gpt-6-luna / low | gemini-3.8-flash-low |

หมายเหตุ:
- **ลำดับสลับตัวรันเมื่อติดโควตา (`_fallback` ต่อ tier ใน agents.json)**: ตัวรันที่สั่ง (defaults.agent หรือ --agent) เป็นตัวแรกเสมอ — ถ้าตัวปัจจุบันล้มเหลวด้วยข้อความโควตา/limit (เช่น `usage limit reached`, `rate limit`, `credits balance ... too low`) ระบบสลับไปตัวถัดไปตามลำดับ `_fallback` ของ tier นั้นทันที ทั้งงานในแผนและขั้น PM/planner · **ความล้มเหลวด้วยเหตุอื่นไม่สลับ** (กันเผาโควตาซ้ำหลายเท่า) · ตัวรันจริงและเส้นทางการสลับถูกบันทึกใน checkpoint (`fallback`) และ summary · ค่าตั้งปัจจุบัน: t0–t3 = codex → agy → claude, t4–t5 = agy → codex → claude (claude ท้ายสุดทุก tier — โควตาแพงสุด เก็บไว้งานหนัก)
- **`null` = ยังไม่มี model ทัดเทียมใน tier นั้น** — ใช้ `--all` แล้ว agent ตัวนั้นจะถูกข้ามอัตโนมัติพร้อมข้อความแจ้ง แต่ถ้าระบุ `--agent <name>` ตรงๆ จะ error ทันที (กันสงสัยว่าทำไมไม่ทำงาน)
- **Argon เปิดตัวแล้ว (เติมครบ 2026-10-17)** — `agy models` มี `gemini-4-argon-low/medium/high` จึงเติม agy กลับที่ t0–t2 ได้ครบ · ข้อจำกัด: agy ไม่มี effort `max` ให้ ที่ t0 จึงใช้ argon-high เป็นเพดานสูงสุด · ชื่อ model ล่าสุดเช็คได้เสมอด้วย `agy models`
- **t0 ยืด timeout อัตโนมัติเป็น 900 วินาที/agent** (ปกติ 240) เพราะงานหนักกินเวลานาน — override ได้ด้วย `--timeout` เสมอ โดยตั้งค่านี้ไว้ที่ `"_timeoutSec"` ใน tier ของ agents.json
- effort `xhigh`/`max` ของ codex กินโควตา ChatGPT เร็วกว่าปกติ (ตามที่ UI เตือน) — ใช้เฉพาะ t0 จริงๆ
- agy ยังมี `gpt-oss-120b-medium` (open-weight ราคาถูกมาก) เผื่ออยากทำ tier bulk สำหรับงาน mass
- แก้/เพิ่ม tier ได้ที่ส่วน `"tiers"` ใน `agents.json`

## หลักการทำงานของแต่ละตัว

| Agent | คำสั่งที่ mycelium-role ใช้ | รับ prompt ทาง | คำตอบอ่านจาก |
|---|---|---|---|
| claude | `claude -p --output-format text` | stdin | stdout |
| codex | `codex exec --skip-git-repo-check -s read-only -o <answer.txt> -` | stdin | ไฟล์ answer.txt (option `-o`) |
| agy | `agy --print` | argument (spawn ตรง ไม่ผ่าน shell) | stdout |

- ส่ง prompt ทาง **stdin** เมื่อทำได้ เพื่อเลี่ยงปัญหาการ quote อักขระพิเศษบน Windows
- โหมดเริ่มต้น **read-only** — ป้องกัน agent แก้ไฟล์โดยไม่ตั้งใจ จะเปิด `--write` เมื่อไรก็ตั้งใจ
- ทุก run เก็บรายงาน (answer, stdout, stderr, exit code, ระยะเวลา) ไว้ใน `reports/<timestamp>-…-<สุ่ม>/`
- เกิน timeout (default 240 วินาที/ตัว) จะถูก kill ทั้ง process tree อัตโนมัติ

## ผลการทดสอบ (2026-10-14)

1. **อ่านไฟล์ข้าม CLI**: สั่งทั้ง 3 agent ให้อ่าน `demo-notes.md` แล้วตอบคำลับ — ตอบ `MANGO-77` ถูกต้องครบทุกตัว (claude ~7s, agy ~14s, codex ~35s) แสดงว่า agent รัน tool จริง (อ่านไฟล์ได้) ไม่ใช่แค่ตอบแชท
2. **เปลี่ยน model/effort**: โจทย์ bat-and-ball รันด้วย `--tier low` และ `--tier high` (ชื่อสมัยแรก) — ผ่าน 3/3 ทั้งสอง tier โดยแต่ละตัวใช้ model/effort ตาม preset จริง (ตรวจแยกด้วย JSON metadata ของ claude และ header ของ codex ไปแล้ว)
3. **tier ladder 5 ระดับ (t1–t5)**: ทดสอบครบทุก tier ผ่าน 15/15 (5 tier × 3 agent) — T1 ใช้ opus 5.5 high ได้จริงทั้ง claude (`--model opus`) และ agy (`claude-opus-5-5-high`)
4. **codex เปลี่ยน model ได้**: รายชื่อจริงจาก `/model` ของ codex (gpt-6-astra, gpt-6.1-sol, gpt-6-luna ฯลฯ) — ทดสอบผ่าน CLI แล้วทั้ง astra และ luna ตอบกลับถูกต้อง และรันครบ 5 tier ด้วย model/effort ต่างกันทุกระดับ (5/5)
5. **t0 overdrive**: claude `opus/max` + codex `gpt-6-astra/max` ใช้ได้จริง (codex header ยืนยัน `reasoning effort: max`) — ผ่าน 3/3 พร้อม timeout อัตโนมัติ 900s
6. **role directive**: สั่ง `--role qa` แล้ว agent ตอบในบทบาท QA พร้อมอ้างหลักการ "เขียน test จาก spec ไม่ใช่จากโค้ด dev" จากไฟล์ role จริง — ยืนยันว่าบทบาทส่งถึง agent ครบ

## ผลการทดสอบ release 0.4.0 (2026-10-16 — แยกโมดูลตาม AUDIT ข้อ 7)

- **แยกไฟล์เป็น `bin/` + `src/`** ตามโครงสร้างที่ audit แนะนำ: entrypoint เหลือ parse args + ลำดับใหญ่ (195 บรรทัด/ไฟล์) ส่วนกลไกแยกเป็น config / runner / prompts / plan / scheduler / run-store (61–177 บรรทัด/ไฟล์) จากเดิมไฟล์เดียว 660+ บรรทัด
- **runner ร่วมหนึ่งชุด** — mycelium กับ mycelium-role เรียก spawn/args/stdin/timeout จาก `src/runner.mjs` เดียวกัน ไม่ซ้ำสองแหล่งแล้ว
- **comment เหลือเฉพาะ why** (เหตุผล/ข้อจำกัดที่โค้ดบอกเองไม่ได้) + ลบของไม่ใช้ (`PLANNER_TIERS_ROLES`, ตัวช่วย smoke ชั่วคราว)
- tests เดิม 35 กรณีผ่านครบหลังย้าย (import ชี้ src โมดูลตรงตัว) + `npm link` ใหม่ + smoke `--plan-file --dry-run` ผ่าน bin ใหม่ + `npm pack` ยืนยัน bin/ และ src/ ติด package (25 ไฟล์)
- หมายเหตุ: path ของ bin เปลี่ยน — ใคร link ไว้บนเครื่องอื่นต้อง `npm link` ใหม่หนึ่งครั้ง

## ผลการทดสอบ release 0.8.0 (2026-10-17 — Argon ผ่าน agy)

1. **Gemini 4 Argon ใช้งานจริงผ่าน agy**: โจทย์ smoke คลาสสิก (อ่าน `demo-notes.md` แล้วตอบคำลับ) — `t1 = gemini-4-argon-high` ตอบ `MANGO-77` ถูกต้องใน 25.6 วิ · `t2 = gemini-4-argon-medium` ถูกต้องใน 11.6 วิ — ผ่านทั้งคู่แปลว่า model รันจริงและใช้ tool อ่านไฟล์ได้ (ไม่ใช่แค่ตอบแชท) · รายงาน: `reports\2026-10-17-04-11-59-tier-t1-1agents` และ `reports\2026-10-17-04-12-32-tier-t2-1agents`
2. **claude/codex ยังใช้ได้เต็มรูปแบบรอบนี้**: รันคู่กันที่ `t1` (opus/high + gpt-6-astra/high) — ตอบ `MANGO-77` ถูกทั้งคู่ (claude 11.6 วิ · codex 96.3 วิ) · โควตา claude ที่เคยใกล้หมด (10-14) กลับมาใช้ได้แล้ว · รายงาน: `reports\2026-10-17-04-14-42-tier-t1-2agents` — สรุป: **สาม agent ผ่าน smoke t1 ครบในวันเดียว (2026-10-17)**

## ผลการทดสอบ release 0.3.0 (2026-10-16 — แก้ตาม AUDIT.md 2026-10-15)

แก้ P1 ครบ 5 ข้อ + P2 สองข้อ พร้อม regression tests 35 กรณี (`npm test` — node:test ล้วน จำลอง provider ไม่ใช้โควตา):

1. **แยกสถานะงานจาก exit code**: dependency ผ่านเฉพาะ task ที่ completed · role ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` (แม้ exit 0) = งานล้ม → งานลูก `blocked` งานอิสระทำต่อ · exit 0 เมื่อทุก task completed เท่านั้น — ทดสอบกับรูปแบบคำตอบจริงจาก run `pipeline-2026-10-15-02-02-30` (bold marker, marker ที่มีข้อความต่อท้าย) ✓
2. **checkpoint/resume**: `<id>.status.json` เขียนทันทีทีละงานแบบ atomic · resume ข้ามเฉพาะ completed ที่มีคำตอบจริง · timeout/needs_*/run เก่าก่อน v0.3 รันใหม่ · attempt สะสมข้ามรอบ ✓
3. **resume คืนบริบท**: `run.json` manifest เก็บ resolved target/cwd/write/projectCtx แล้วคืนค่าตอน resume (explicit flag ชนะ, cwd ที่ถูกลบไปแล้ว = error ไม่ใช่เขียนผิดที่) ✓
4. **dry-run ทุก route**: การ์ดห้ามเรียก provider ย้ายมาอยู่ใน execute จุดเดียว — `--plan-file <f> --dry-run` และ `--resume <dir> --dry-run` ผ่าน smoke test จริงทาง CLI (สร้างแค่ plan.json/run.json ไม่มี provider ถูกเรียก) ✓
5. **plan validation กันหนี directory**: id pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` · types ของ tasks/dependsOn/humanGates · self-dep/cycle จับก่อน spawn ใดๆ · `--max-parallel`/`--timeout` ตรวจขอบเขต ✓
6. **CONVENTIONS.md ติด package** (`npm pack` ยืนยัน) และทั้งสอง entrypoint หยุดชัดเจนเมื่ออ่านไม่ได้ · planner ได้กติกากลางครบเหมือน role อื่นแล้ว
7. **context ส่งต่อ**: แนบสถานะ + path ฉบับเต็มเสมอ และแจ้งเมื่อถูกตัด

ยังเหลือจาก audit (ไว้รอบถัดไป): แยก runner/prompts/config/run-store/scheduler เป็นโมดูล, task-level write scope ก่อนใช้ --write จริง, gate ผูกกับ task เป็น object มีหลักฐานอนุมัติ

## ผลการทดสอบ release 0.2.0 (2026-10-15 — ทั้งหมดบน codex)

1. **role ชุดใหม่ + CONVENTIONS ส่งถึงจริง**: smoke test `qa` และ `backend-engineer` (t5) — ตอบครบทุกข้อ: เขต Owns/ห้ามแตะ `knowledge\`, stop-and-route (`NEEDS_*` พร้อมอ้างอิง), output states, QA เป็นเจ้าของ unit test ✓
2. **planner เคารพกติกาใหม่**: dry-run — planner ให้ 2 task ตามขนาดงาน (ไม่ใช้ทั้งทีม), tier ตรง FIXED_ROLE_TIER (BA=t2, TP=t2), dependency ถูก, humanGates มีเนื้อหาจริง, จบ handoff ตามรูปแบบ ✓
3. **โหมดอัตโนมัติจบครบ run แรก**: execute แผนเดียวกันจบ 2/2 task 2 wave exit 0 — output ทั้งสอบจบด้วย handoff รูปแบบ charter + **output state พร้อม Task/Reference/Reason** (`NEEDS_HUMAN`, `NEEDS_REQUIREMENT_CHANGE`) ตรงตาม CONVENTIONS §8 และ role ไม่ตัดสินธุรกิจแทนคน ✓ (รายงาน: `reports\pipeline-2026-10-15-02-02-30`)
4. แก้บั๊กเครื่องสำอำรึก: ข้อความ console อ้าง path เก่า `ai-team/roles/` → `roles/`

ยังค้างข้อเดียวก่อนใช้เต็มรูปแบบ: **โหมดหลัก (session สวมบท MYCELIUM)** ยังไม่เคยรันกับ goal จริงบน target จริง — กลไกทุกชิ้นที่มันใช้พิสูจน์ครบแล้ว เริ่มใช้ได้ทันทีโดยให้ session อ่าน `MYCELIUM.md` พร้อม goal จริง

## เพิ่ม/แก้ agent

แก้ไขที่ `agents.json` — กำหนดคำสั่ง, flag สำหรับโหมด read/write, ช่องทางรับ prompt และจุดอ่านคำตอบได้หมด เช่น เพิ่ม `gemini -p` หรือสลับ model ด้วย `--model`

## ข้อควรระวัง

- ทุกครั้งที่รันคือการใช้ token/โควตาของบัญชีเจ้าของ CLI นั้นๆ
- โหมด `--write` ให้ agent แก้ไขไฟล์ใน `--cwd` ได้ ควรรันใน git repo เพื่อย้อนดู diff ง่ายๆ
- codex บนเครื่องนี้มี MCP server (figma) ที่ auth ไม่ผ่าน จะเห็น error ใน stderr แต่ไม่กระทบผลลัพธ์

## ไอเดียต่อยอด

- **Pipeline อัตโนมัติ (MYCELIUM) มีแล้ว** — ดูหัวข้อ "🍄 MYCELIUM" ด้านบน; ต่อยอดได้อีกเช่น เก็บผลลัพธ์เป็น artifact ตามโครงสร้าง knowledge base (requirement/ design/ qa/ ฯลฯ)
- ให้ MYCELIUM เลือก agent ราย task ตามความเหมาะสม (เช่น งานเขียนโค้ดให้ตัวที่ถนัด) หรือรันซ้ำเมื่อคำตอบไม่ผ่านเงื่อนไข
- ต่อยอดเป็น MCP server เพื่อให้ AI session ใดก็เรียกทีมนี้เป็น tool ได้
