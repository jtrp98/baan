# 🏗️ นายช่าง — ผู้คุมทีม AI 11 role

> แตกงาน เปิด session ราย role ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์

> ประวัติรุ่นและสิ่งที่เปลี่ยนแต่ละเวอร์ชัน: `RELEASE-NOTES.md`

**นายช่าง คือบทบาทที่ AI session สวม** — session ที่สวม นายช่าง เป็นผู้คุมทั้ง 11 ตำแหน่ง และเปิด session ของแต่ละ role เองได้ (ผ่าน `claude -p` / `codex exec` / `agy --print` แบบ non-interactive — กลไกเดียวกับที่พิสูจน์ไปตอนแรก)

ระบบนี้เป็น **local npm package** (clone ไว้ที่ไหนก็ได้บนเครื่อง — เช่น `C:\src\AICode\baan\baan`) — ติดตั้งครั้งเดียวด้วย `npm link` แล้วเรียกจากโปรเจกต์ไหนก็ได้ ไม่ต้อง copy code ไปทุกที่ ไม่รก

## สถาปัตยกรรม

```
AI session ใดก็ได้ (claude/codex/agy/ZCode/...)
  └─ สวมบท นายช่าง ตาม BAAN.md (charter)
       └─ เปิด session ของ 11 role ผ่านคำสั่ง:
            baan-role --agent codex --role <ชื่อ> --tier <t> --task "..."
            (แต่ละ role รันด้วย claude/codex/agy ตาม tier ใน agents.json)
```

การใช้งานสองโหมด:
1. **โหมดหลัก** — AI session สวม นายช่าง แล้วคุมเอง (อ่าน `BAAN.md`)
2. **โหมดอัตโนมัติ** — `baan --goal "..."` (gm → plan → execute เป็นสคริปต์ ตาม DAG)

โครงสร้างข้อมูล (config ของ workspace อยู่**นอก package** ที่ `<ราก workspace>\baan.config.json` เช่น `C:\src\schoolbright\baan.config.json` — กัน update version ทับ config): **ที่เก็บเอกสาร** (`knowledge_roots` เช่น `C:\src\schoolbright\knowledge`) · **ที่เก็บ code** (`targets` เช่น `C:\src\schoolbright\target\*`) — ตัว baan เดินหา config ขึ้นจากไดเรกทอรีที่เรียกอัตโนมัติ (หรือ `--config <file>` / env `BAAN_CONFIG`) · ติดตั้ง workspace ด้วย `baan --init` · โหมดอัตโนมัติใช้ผ่าน `--target <ชื่อ>` · ตัวอย่างรูปแบบไฟล์: `baan.example.json`

```
C:\src\AICode\baan\baan\            ← ตัว package (npm link แล้วใช้ได้จากทุกที่)
  BAAN.md               ← charter: บทบาท นายช่าง สำหรับ AI session สวม
  bin\
    baan.mjs            ← entrypoint โหมดอัตโนมัติ (คำสั่ง baan) — parse args + ลำดับใหญ่ gm → plan → execute
    baan-role.mjs       ← entrypoint เปิด session ราย role (คำสั่ง baan-role)
  src\
    config.mjs              ← อ่าน/resolve การตั้งค่า: baan.config.json (+ ชื่อเก่า mycelium.config.json), agents.json, roles/, targets
    runner.mjs              ← เรียก AI CLI: args, stdin, timeout, อ่านคำตอบ (ใช้ร่วมสองคำสั่ง)
    prompts.mjs             ← ประกอบ prompt: ไฟล์ role + CONVENTIONS + บริบทโปรเจกต์ + context งานก่อนหน้า
    plan.mjs                ← schema แผน DAG + validation (id, types, cycle) + FIXED_ROLE_TIER
    scheduler.mjs           ← สถานะงาน (state/marker) + dependency + execute ตาม wave + dry-run guard
    run-store.mjs           ← checkpoint ราย task + manifest ของ run (run.json) + resume
    role-guard.mjs          ← ป้าย [baan-role: <ID>] + ประโยคข้อยกเว้น ใช้ร่วมใน prompt ของ role และ stub ของ --init
    role-session.mjs        ← แกนของ baan-role: parse args, runDir ไม่ชน, สถานะงาน + fallback ราย agent
  baan.example.json     ← template การตั้งค่า (config จริงอยู่นอก package ที่ <workspace>\baan.config.json)
  agents.json               ← ตัวรัน (claude/codex/agy) + tier ladder t0–t5
  roles\                    ← 11 ตำแหน่งในทีม
  setup\agy\                ← profile baan-readonly ของ agy (agent.md + guard hook) — ติดตั้งครั้งเดียวต่อเครื่อง
  scripts\                  ← live-smoke.mjs (npm run smoke:live — ใช้โควตาจริง)
  tests\                    ← regression tests (npm test)
  reports\                  ← ผลการรันทุกครั้ง
```

## การสวมบท นายช่าง (โหมดหลัก)

เปิด AI session ใดก็ได้ แล้วสั่ง:

```
อ่าน C:\src\AICode\baan\baan\BAAN.md แล้วสวมบทบาท นายช่าง
เป้าหมาย: <goal ของคุณ>   (โปรเจกต์: <path หรือชื่อ target>)
```

session นั้นจะกลายเป็นสมอง — รับ goal แตกงาน สั่ง `baan-role` เปิด session ของแต่ละ role ตาม tier ที่กำหนด ส่งต่อ context ระหว่าง role และรวบรวมประตูมนุษย์มาถามคุณตอนจบ

## วิธีใช้ (คำสั่งของ package — ใช้ได้จากทุกไดเรกทอรี)

```bash
# ดูทุกอย่างที่ตั้งค่าไว้ (knowledge/targets/roles/tiers/defaults)
baan --list

# เปิด session ของ role เดียว (มือของ นายช่าง)
baan-role --agent codex --role spec --tier t2 --task "เขียน requirement ของ..."
baan-role --agent codex --role check --tier t2 --cwd C:\path\to\repo --task "เขียน unit test ของ utils.js"
baan-role --all --role jpo --tier t2 --task "รีวิว API..."      # ทุก agent พร้อมกัน
baan-role --agent codex --role sys --tier t3 --write --task "แก้บั๊ก..."  # อนุญาตแก้ไฟล์

# โหมดอัตโนมัติทั้งก้อน
baan --target sb-api-academic-timetable-ai --goal "..." --dry-run
baan --target sb-api-gateway --goal "แก้บั๊ก ..."
baan --resume <runDir>        # ต่อ run ที่ค้าง ข้ามเฉพาะ task ที่ completed (คืน target/cwd เดิมอัตโนมัติ)

# คำสั่งระดับล่างอื่นๆ ของ baan-role (orchestrator)
baan-role --all --tier t0 --task "งานยากมาก ทุก agent พร้อมกัน"
baan-role --agent claude --model haiku --effort low --task "..."
baan-role --list              # ดูรายชื่อ agent + tier
```

### สัญญาของ `baan-role` (โหมดหลัก — ใช้กติกาเดียวกับโหมดอัตโนมัติ)

- **cwd เริ่มต้น = ไดเรกทอรีที่เรียก** (เดิมคือโฟลเดอร์แม่ของ package ซึ่งทำให้ role อ่านผิด repo เมื่อลืม `--cwd`) · `--cwd` แบบ relative อิงจากที่เรียก
- **สถานะงานจาก output state ท้ายคำตอบ** (CONVENTIONS §8) ไม่ใช่ exit code ของ CLI — บรรทัดผลของแต่ละ agent แสดง `OK`/`NEEDS_HUMAN`/`FAIL(exit=…)`/... · `report.json` มี `state`/`marker`/`fallback` ราย agent · **exit 0 เฉพาะเมื่อทุกตัว completed**
- **fallback เมื่อติดโควตา** ตาม `_fallback` ของ tier — ทำเฉพาะเมื่อสั่ง agent เดียวพร้อม `--tier` (`--all` ไม่สลับ) · ตัวสำรองใช้ model/effort ของ tier (ไม่ใช้ `--model`/`--effort` ที่ระบุให้ตัวแรก) · ปิดด้วย `--no-fallback`
- **runDir ไม่ชนกัน**: `reports/<timestamp>-<role>-tier-<t>-<n>agents-<สุ่ม>/` — เปิดหลาย role ขนานกันในวินาทีเดียวได้
- **ป้าย `[baan-role: <ID>]`** บรรทัดแรกของ prompt ทุก role (งานไม่ผูก role = `adhoc`) + ประโยคข้อยกเว้นเดียวกับใน CLAUDE.md/AGENTS.md ที่ `--init` สร้าง — role ที่รันใน workspace จึงไม่สวมบท นายช่าง ซ้อนตามไฟล์ที่ CLI โหลดเอง (ข้อความอยู่ที่ `src/role-guard.mjs`)
- **วันที่ของงาน** ใส่ใน prompt ทุก role (และ gm/plan ในโหมดอัตโนมัติ) — ค่าเริ่มต้น = วันที่ local ของเครื่อง · override ด้วย `--date YYYY-MM-DD` (ทั้ง `baan` และ `baan-role`) · resume ใช้วันที่ของวันที่รันจริง ไม่คืนจาก run เดิม

# กำหนดบทบาท (role) — ตำแหน่งในทีม

ไฟล์นิยามบทบาทอยู่ที่ `roles/<ID>.md` (หัวไฟล์มี `# บทบาท:` ชื่อแสดง · `> หน้าที่:` หนึ่งบรรทัด · `> tier:` — `--list` และ prompt ของ plan อ่านจากตรงนี้) ใช้กับ flag `--role` โดย baan-role จะผูกบทบาทเข้ากับ task ให้ agent ก่อนส่งงาน:

```bash
baan-role --agent agy --role check --tier t3 --task "เขียน unit test ของ utils.js ตาม acceptance criteria ใน spec.md"
baan-role --all --role jpo --tier t1 --task "รีวิวความปลอดภัยของ API ที่เพิ่งสร้าง"
```

| ID | ชื่อ | หน้าที่ | tier | ชื่อเดิม (alias) |
|---|---|---|---|---|
| `plan` | นักวางผัง | แตก goal ใหญ่เป็นแผน DAG ที่เล็กที่สุดที่ได้งาน แล้วส่งให้ gm (เฉพาะงานใหญ่) | t2 | — |
| `gm` | ผู้จัดการหน้างาน | เป็นเจ้าของ plan.md, backlog และ release scope ข้าม run — คุ้มกัน scope creep (เฉพาะงานใหญ่) | t2 | `project-manager` |
| `spec` | ผู้เขียนข้อกำหนด | เค้นความต้องการจริงออกจากผู้ใช้ แปลงเป็น REQ/AC/BR ที่ทดสอบได้ และทะเบียนคำถามค้าง (OQ) | t2 | `business-analyst` |
| `arch` | สถาปนิก | ออกแบบ DES และสัญญา API แบบเรียบง่าย ตรวจกับโค้ดจริง (as-built) เสมอ | t1 | `system-analyst` |
| `int` | นักออกแบบตกแต่งภายใน | ร่าง UX ราย feature รอคนเซ็น และดูแล design system | t2 | `uxui-designer` |
| `front` | ช่างหน้างาน | implement ตาม UX ที่เซ็นแล้วเป๊ะ และสัญญา backend ตัวจริง — ไม่เพิ่มของที่ไม่ได้ขอ | **นายช่าง/plan เลือกราย task (t2–t5 ตามความยาก)** | `frontend-engineer` |
| `sys` | ช่างระบบ | implement ตามสัญญาเป๊ะ — validation ครบทุกขาเข้า และ error contract สมบูรณ์ | **นายช่าง/plan เลือกราย task (t2–t5 ตามความยาก)** | `backend-engineer` |
| `vault` | ผู้ดูแลห้องนิรภัย | ออกแบบ schema กันบั๊กและเขียน SQL พร้อม rollback — แต่ห้ามรันเองเด็ดขาด | t2 | `database-administrator` |
| `inspect` | หัวหน้าตรวจรับ | ทำ TP, test matrix และ traceability ครบทุก AC — ล่าช่องโหว่ ไม่ใช่แค่ครอบคลุม | t2 | `test-planner` |
| `check` | ผู้ตรวจงานอิสระ | เขียน unit test จาก spec และตัดสิน PASS/FAIL ราย task — ทำหน้าที่ศัตรูของโค้ด | t2 | — |
| `jpo` | จป. | ตรวจ OWASP และ PDPA/GDPR ตามพื้นผิวจริง แล้วประกาศ blocker ตามความเสี่ยงจริง | t2 | `security` |

หลักการแบ่งหน้าที่ที่ฝังไว้ใน role (สอดคล้อง convention ของโปรเจกต์ timetableai):
- **วางแผนกับสั่งงานแยกกัน** — plan วางแผน, gm เป็นคนเรียกใช้ทีมตามแผน
- **check แยกจาก dev** — dev ไม่เขียน unit test โค้ดตัวเอง (เข้าข้างตัวเอง) check เขียนจาก AC + test plan และห้ามแก้โค้ด production เพื่อให้ test ผ่าน
- **Artifact ต้องเซ็นก่อนใช้** — int draft ของ `int` ใช้ implement ไม่ได้จนกว่าผู้ใช้เซ็น; sign-off เป็นการกระทำของคนเสมอ
- **vault ห้ามรัน SQL ทุกกรณี** — เขียน script พร้อม rollback plan ให้คนรันเท่านั้น
- ทุก role ระบุ "ขอบเขตที่ต้องส่งต่อ" ชัดเจน และทุกเอกสารเดินแนว append-only + change log
- **เพิ่ม/ลดตำแหน่งได้อิสระ** — แค่เพิ่ม/ลบไฟล์ `.md` ใน `roles/` ระบบหาอัตโนมัติ (ดูรายชื่อด้วย `--list`)

ตัวอย่าง flow งานเต็มรูปแบบ: `plan` วางแผน → `gm` เรียกทีมตามแผน → `spec` เขียน REQ/AC → `int` ร่าง UX รอผู้ใช้เซ็น → `arch` ออกแบบ DES/สัญญา → `vault` รีวิม schema + เขียน SQL (คนรัน) → `front`/`sys` implement ตาม signed artifact → `inspect` วางแผนทดสอบ → `check` เขียน unit test อิสระ + รายงานรอบ → `jpo` รีวิวก่อนขึ้น production

## โหมดอัตโนมัติ (`baan`)

สำหรับงานที่อยากให้รันทั้งก้อนโดยไม่ต้องมี session คุมเอง — การไหล: **goal → gm (จุดเข้า เขียนคำมอบหมาย) → plan (วางแผนเป็น DAG) → execute ตามแผน** (สคริปต์ทำหน้าที่เป็น "มือของ gm" แทน session ที่สวม นายช่าง)

กติกาสำคัญที่ฝังไว้:
- **plan เลือก tier ได้เฉพาะ task ของ `front` / `sys`** (งาน implement ที่ผ่าน design ของ arch มาแล้ว) — role อื่นทุกตัวใช้ tier คงที่ตาม `FIXED_ROLE_TIER` ใน `src/plan.mjs` (บรรทัด `> tier:` ในไฟล์ role และตาราง role ถูก test ให้ตรงกับค่านี้เสมอ)
- task ที่ไม่พึ่งกัน (dependsOn ว่าง) **รันขนานกัน** ตามลำดับ wave
- งานง่าย plan ให้น้อย task เอง — ไม่ต้องใช้ทั้งทีม
- สิ่งที่ต้องเป็นประตูมนุษย์ (sign-off int / รัน SQL / ตัดสินธุรกิจ) รวมเป็น `humanGates` รายงานตอนจบ — ไม่ทำแทน
- default agent = **codex** (`--agent` เปลี่ยนได้)
- ตัวเปิด session ราย role (มือระดับล่าง) คือคำสั่ง `baan-role`

```bash
baan --goal "..." --dry-run   # gm + plan แล้วดูแผน ยังไม่ execute
baan --goal "..."             # รันครบทุก wave
baan --resume <runDir>        # ต่อ run ที่ค้าง ข้ามเฉพาะ task ที่ completed (ประหยัด token)
baan --plan-file <f>          # รันแผนที่แก้เอง
# --dry-run ใช้กับทุก route ได้ (รวม --plan-file/--resume) — การ์ดห้ามเรียก provider อยู่ที่ execute จุดเดียว
```

### สถานะงาน · checkpoint · resume (ตั้งแต่ v0.3.0)

- **สถานะงานแยกจาก exit code ของ CLI**: task จบด้วย `completed` เฉพาะเมื่อรันจบ + มีคำตอบ + output state ท้ายคำตอบ (CONVENTIONS §8) เป็น `DONE`/`PASS` (หรือไม่มี marker) — ถ้า role ตอบ `NEEDS_HUMAN` / `NEEDS_REQUIREMENT_CHANGE` / `NEEDS_DESIGN_CHANGE` / `FAIL` / `BLOCKED` ถือว่า**งานไม่สำเร็จแม้ exit code เป็น 0**
- **dependency ผ่านเฉพาะงานที่ completed** — งานลูกของงานที่ล้มจะถูก mark `blocked` แล้วข้าม แต่งานอิสระที่ไม่ติด blocker ยังทำต่อจนจบ
- **exit code ของ `baan`**: 0 เมื่อทุก task completed เท่านั้น — เจอ needs_*/fail/timeout/blocked ตัวใดตัวหนึ่งจะเป็น 1 พร้อมสรุปสาเหตุราย task
- **checkpoint ต่อ task**: ทุกงานเขียน `<id>.status.json` ทันทีที่จบ (สถานะ, marker, exit code, attempt, artifact paths) — `--resume` เชื่อเฉพาะ checkpoint (`completed` + มีไฟล์คำตอบจริง) งาน timeout/fail/needs_* และ run เก่าก่อน v0.3 จะถูกรันใหม่
- **manifest ของ run (`run.json`)**: เก็บ resolved target/cwd/write/projectCtx ตอนสร้าง run — `--resume` คืนบริบทเดิมอัตโนมัติ (flag ที่ส่งเองชนะเสมอ และจะพิมพ์บอกทุกครั้งที่คืนค่า) จึงไม่หลุดเป็นทำงานผิดโปรเจกต์
- **plan validation ก่อน spawn ใดๆ**: id ต้องเข้า pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` (id คือชื่อไฟล์ จึงกัน path traversal), ตรวจ types ของ tasks/dependsOn/humanGates, self-dependency และ cycle
- **context ส่งต่อระหว่าง task**: แนบสถานะ + path ฉบับเต็มเสมอ และถ้าเนื้อหาถูกตัดที่ 6,000 ตัวอักษรจะบอกว่าถูกตัดกี่ตัวอักษร
- regression tests: `npm test` (node:test ล้วน ไม่มี dependency เพิ่ม ไม่ยิง provider จริง)

งานที่ผลิตเอกสารยาว (เช่น arch @ t1) อาจใช้เวลานาน — ทั้ง `baan` และ `baan-role` ใช้ timeout เริ่มต้น 1800 วินาทีต่อ AI CLI job (t0 ใช้ 3600 วินาที)

ลำดับ timeout ของทั้งสองคำสั่ง รวม gm/plan, scheduler task และ fallback: **`--timeout` ที่ระบุเอง > tier `_timeoutSec` ใน `agents.json` > workspace `defaults.timeout_sec` > 1800 วินาที** ค่าที่เลือกใช้ต้องเป็นจำนวนเต็ม 1–86400; ค่าผิดจะ error ไม่เปลี่ยนเป็น default เงียบๆ ตัวอย่าง: `baan-role --agent codex --role arch --tier t1 --timeout 3600 --task "วิเคราะห์ระบบ"`

`baan-role` อ่านเฉพาะ timeout จาก workspace config ผ่าน loader ร่วม: `BAAN_CONFIG` ชนะ discovery ซึ่งเดินขึ้นจาก `--cwd` หรือไดเรกทอรีที่เรียกเมื่อไม่ได้ส่ง `--cwd` (รองรับทั้ง `baan.config.json` และชื่อเก่า `mycelium/mycelium.json`) โดยไม่เปลี่ยน agent, cwd หรือโหมดสิทธิ์จาก workspace defaults ส่วน `baan` คง discovery จากไดเรกทอรีที่เรียก และรับ `--config` ตามเดิม การ resume ไม่คืน timeout จาก manifest ตามพฤติกรรมเดิม

## การเปลี่ยน model / effort (สำหรับแบ่ง tier)

แต่ละ CLI ใช้ syntax ต่างกัน — baan-role แปลงให้ผ่าน `modelArgs`/`effortArgs` ใน `agents.json`:

| Agent | เปลี่ยน model | เปลี่ยน effort | ระดับ effort ที่รองรับ |
|---|---|---|---|
| claude | `--model <alias>` เช่น `haiku`, `sonnet`, `opus` | `--effort <level>` | low, medium, high, xhigh, max |
| codex | `-m <model>` (เฉพาะชื่อใน list ของ /model) | `-c model_reasoning_effort=<level>` | none, minimal, low, medium, high, xhigh, max |
| agy | `--model <ชื่อจาก agy models>` | `--effort <level>` | low, medium, high, xhigh, max |

ข้อควรรู้ที่พิสูจน์แล้วจากการทดสอบจริง:

- **claude**: ยืนยันผ่าน `--output-format json` — `--model haiku` ได้ `claude-haiku-5-5` จริง และ JSON มี `total_cost_usd` ต่อ run ด้วย (เอาไปเก็บสถิติ cost ต่อ tier ได้)
- **codex**: header ของ `codex exec` พิมพ์ model/effort ที่ใช้จริงออกมาขณะรัน
- **codex (บัญชี ChatGPT)**: สลับ model ได้เฉพาะชื่อที่อยู่ใน `/model` ของ codex เอง ได้แก่ `gpt-6.1-sol` (default), `gpt-6-astra` (frontier), `gpt-6-sol`, `gpt-6-luna` (fast/cheap), `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` — ชื่ออื่นเช่น `gpt-6.1-codex` หรือ `gpt-6.1` จะโดน API ปฏิเสธ (ตรวจรายชื่อล่าสุดได้จาก `/model` ใน codex interactive)
- **agy**: เป็น multi-provider (gemini/claude/gpt-oss) — ชื่อ model ฝัง effort ไว้ในตัวเลย เช่น `gemini-3.8-flash-low`, `claude-opus-5-5-high` (ดูทั้งหมดด้วย `agy models`) และ**ต้องวาง `--model` ก่อน `--print`** เพราะ `--print` จะกลืน argument ถัดไปเป็น prompt (baan-role จัดการลำดับนี้ให้อยู่แล้ว)

tier ladder ปัจจุบัน (T1 = anchor ที่ Opus 5.5 high, ค่ายอื่นจัดตัวทัดเทียมตามระดับ, T0 = overdrive):

| tier | เหมาะกับ | claude | codex | agy |
|---|---|---|---|---|
| t0 | งานยากมาก "ไม่จบไม่สิ้น" ประเด็นซับซ้อน ต้องคิดลึกสุด | opus / max | gpt-6-astra / max | gemini-4-argon-high |
| t1 | งานคิดยาก ออกแบบสถาปัตยกรรม ตัดสินใจสำคัญ | opus / high | gpt-6-astra / high | gemini-4-argon-high |
| t2 | โค้ดซับซ้อน หลายไฟล์ มีเงื่อนไข | sonnet / high | gpt-6.1-sol / high | gemini-4-argon-medium |
| t3 | งานพัฒนาปกติ คุณภาพดี ราคาสมดุล | sonnet / medium | gpt-6.1-sol / low | gemini-3.8-flash-medium |
| t4 | งานประจำ เขียน test, refactor เล็กน้อย | haiku / medium | gpt-6-luna / high | gemini-3.8-flash-low |
| t5 | งานจำนวนมาก สรุป/จัดหมวด/ตอบคำถามง่าย | haiku / low | gpt-6-luna / medium | gemini-3.8-flash-low |

หมายเหตุ:
- **ลำดับสลับตัวรันเมื่อติดโควตา (`_fallback` ต่อ tier ใน agents.json)**: ตัวรันที่สั่ง (defaults.agent หรือ --agent) เป็นตัวแรกเสมอ — ถ้าตัวปัจจุบันล้มเหลวด้วยข้อความโควตา/limit (เช่น `usage limit reached`, `rate limit`, `credits balance ... too low`) ระบบสลับไปตัวถัดไปตามลำดับ `_fallback` ของ tier นั้นทันที ทั้งงานในแผนและขั้น gm/plan · **ความล้มเหลวด้วยเหตุอื่นไม่สลับ** (กันเผาโควตาซ้ำหลายเท่า) · ตัวรันจริงและเส้นทางการสลับถูกบันทึกใน checkpoint (`fallback`) และ summary · ค่าตั้งปัจจุบัน: t0–t3 = codex → agy → claude, t4–t5 = agy → codex → claude (claude ท้ายสุดทุก tier — โควตาแพงสุด เก็บไว้งานหนัก)
- **`null` = ยังไม่มี model ทัดเทียมใน tier นั้น** — ใช้ `--all` แล้ว agent ตัวนั้นจะถูกข้ามอัตโนมัติพร้อมข้อความแจ้ง แต่ถ้าระบุ `--agent <name>` ตรงๆ จะ error ทันที (กันสงสัยว่าทำไมไม่ทำงาน)
- **Argon เปิดตัวแล้ว (เติมครบ 2026-10-17)** — `agy models` มี `gemini-4-argon-low/medium/high` จึงเติม agy กลับที่ t0–t2 ได้ครบ · ข้อจำกัด: agy ไม่มี effort `max` ให้ ที่ t0 จึงใช้ argon-high เป็นเพดานสูงสุด · ชื่อ model ล่าสุดเช็คได้เสมอด้วย `agy models`
- **t0 ยืด timeout อัตโนมัติเป็น 3600 วินาที/agent** (ปกติ 1800) เพราะงานหนักกินเวลานาน — override ได้ด้วย `--timeout` เสมอ โดยตั้งค่านี้ไว้ที่ `"_timeoutSec"` ใน tier ของ agents.json
- effort `xhigh`/`max` ของ codex กินโควตา ChatGPT เร็วกว่าปกติ (ตามที่ UI เตือน) — ใช้เฉพาะ t0 จริงๆ
- **t3–t5 จัดตาม Intelligence Index ให้สติปาร์ตี้ใกล้กันใน tier เดียว (2026-10-22)** — ก่อนหน้านี้ t3 ของ codex (sol/medium = 48) ฉลาดกว่าเพื่อนใน tier ถึง 7–8 คะแนนจนเผาโควตาเกินจำเป็น และ t4 ของ codex/agy ห่าง anchor ถึง ±4–6 คะแนน คู่ปัจจุบัน: t3 = 41/42/40 · t4 = 34/33/34 · t5 = 29/30/34 — เหตุผลหลักคือ fallback parity (codex ติดโควตาแล้วตกไป agy ที่ t3 เดิมหาย 8 คะแนนกลางแผน) · agy ใช้ flash-low ซ้ำทั้ง t4/t5 เพราะ Gemini มีขั้นระดับจริงแค่ 34/40/41/53 (แบบเดียวกับ argon-high ที่ซ้ำ t0/t1) · ยืนยันแล้ว: agy@t4 ผ่าน live smoke · codex รอโควตากลับ (27 ต.ค. 2026) — CLI รับ config และเริ่ม session ได้ปกติ แต่ยังตรวจพฤติกรรมจริงไม่ได้
- agy ยังมี `gpt-oss-120b-medium` (open-weight ราคาถูกมาก) เผื่ออยากทำ tier bulk สำหรับงาน mass
- แก้/เพิ่ม tier ได้ที่ส่วน `"tiers"` ใน `agents.json`

## หลักการทำงานของแต่ละตัว

| Agent | คำสั่งที่ baan-role ใช้ | รับ prompt ทาง | คำตอบอ่านจาก |
|---|---|---|---|
| claude | `claude -p --output-format text --allowedTools <ตามโหมด>` (write เพิ่ม `--permission-mode acceptEdits`) | stdin | stdout |
| codex | `codex exec --skip-git-repo-check -s read-only -o <answer.txt> -` | stdin | ไฟล์ answer.txt (option `-o`) |
| agy | `agy --add-dir <ราก workspace> --agent baan-readonly --print` (write: `--mode accept-edits --print`) | argument (spawn ตรง ไม่ผ่าน shell) | stdout |

- ส่ง prompt ทาง **stdin** เมื่อทำได้ เพื่อเลี่ยงปัญหาการ quote อักขระพิเศษบน Windows
- โหมดเริ่มต้น **read-only** — ป้องกัน agent แก้ไฟล์โดยไม่ตั้งใจ จะเปิด `--write` เมื่อไรก็ตั้งใจ
  - แต่ละค่ายบังคับ read-only ต่างกัน: codex = sandbox `-s read-only` · agy = `--agent baan-readonly` (custom agent profile ระดับผู้ใช้ที่ตัด write/edit tools ออกจาก schema + `PreToolUse` guard hook ใน `~/.gemini/config/hooks.json` ที่บังคับ allowlist คำสั่งอ่านอย่างเดียวเฉพาะเซสชัน `baan-readonly` เพราะ `--mode plan` เดิมกันการเขียนไม่ได้) · claude = `--allowedTools` เฉพาะ Read/Grep/Glob + คำสั่งอ่านอย่างเดียว (git status/log/diff/show ฯลฯ) — claude ใน read-only จึง**รัน node/npm ไม่ได้โดยตั้งใจ**
  - **agy ต้องติดตั้ง profile `baan-readonly` ครั้งเดียวต่อเครื่อง** — ไฟล์และขั้นตอนอยู่ที่ `setup/agy/README.md` (ไม่มี profile = agy ล้มทุกงาน read-only และไม่สลับตัวรันให้)
  - **agy (jetski) กันอ่านไฟล์นอก workspace และ headless ปฏิเสธคำขอแทนการถาม** จนได้คำตอบว่างเปล่า — พบจริง 2026-10-22 จาก arch ที่ cwd=target อ่าน `knowledge/` ไม่ได้ตอน fallback จาก codex (sandbox ของ smoke เดิมอยู่ใน %TEMP% ซึ่งเป็น safe area จึงตรวจไม่พบ) · นายช่าง จึงส่ง `--add-dir <ราก workspace>` ให้ agy **เฉพาะโหมดอ่าน** (ค้นรากจาก `baan.config.json` เดินขึ้นจาก cwd — ไม่เจอ config = ไม่ส่ง) · โหมด `--write` ไม่ส่งเพราะ `--add-dir` ขยายขอบเขต *การเขียน* ตามไปด้วย (ทดสอบแล้วใน accept-edits) — งานเขียนที่ต้องอ่านไฟล์นอก cwd ให้ฝังเนื้อหาใน task หรือรัน read แยกก่อน
  - `-p` ของ claude ไม่มีคนกดอนุมัติ: tool ที่ไม่อยู่ใน `--allowedTools` ใช้ไม่ได้เลย — โหมด write จึงเปิด Edit/Write/Bash/PowerShell ให้ชัด
- **ทดสอบตัวรันจริงทุกค่าย**: `npm run smoke:live -- [--tier t3] [--agents claude,codex,agy]` (ใช้โควตาจริง 2 session/ค่าย ไม่อยู่ใน `npm test`) — sandbox ปลอมเป็นรูป workspace จริง (มี `baan.config.json` ที่ราก + ไฟล์ลับนอก cwd) แยกต่อค่าย/โหมด ตรวจด้วยค่าที่เดาไม่ได้: อ่านไฟล์ใน cwd และนอก cwd (nonce) · คำสั่งอ่านอย่างเดียว (commit hash) · รันโค้ด (sha256) · read-only กันเขียนจริง (ตรวจบนดิสก์) · `--write` เขียนไฟล์ได้ · role ไม่รายงาน `DONE` เกินจริง
- ทุก run เก็บรายงาน (answer, stdout, stderr, exit code, ระยะเวลา) ไว้ใน `reports/<timestamp>-…-<สุ่ม>/`
- เกิน timeout (default 1800 วินาที/ตัว, t0 3600 วินาที) จะถูก kill ทั้ง process tree อัตโนมัติ · เป็น timeout ของ AI CLI job เท่านั้น

## Change Log

- 2026-10-22: แก้ agy อ่านไฟล์นอก workspace ไม่ได้ใน headless (ส่ง `--add-dir` ราก workspace เฉพาะโหมดอ่าน) + `smoke:live` ปลอม sandbox เป็นรูป workspace และตรวจอ่านนอก cwd
- 2026-10-21: เพิ่ม timeout เริ่มต้นและอธิบาย priority, workspace discovery ของ role และ validation ที่ใช้ร่วมกัน

## ผลการทดสอบ (2026-10-14)

1. **อ่านไฟล์ข้าม CLI**: สั่งทั้ง 3 agent ให้อ่าน `demo-notes.md` แล้วตอบคำลับ — ตอบ `MANGO-77` ถูกต้องครบทุกตัว (claude ~7s, agy ~14s, codex ~35s) แสดงว่า agent รัน tool จริง (อ่านไฟล์ได้) ไม่ใช่แค่ตอบแชท
2. **เปลี่ยน model/effort**: โจทย์ bat-and-ball รันด้วย `--tier low` และ `--tier high` (ชื่อสมัยแรก) — ผ่าน 3/3 ทั้งสอง tier โดยแต่ละตัวใช้ model/effort ตาม preset จริง (ตรวจแยกด้วย JSON metadata ของ claude และ header ของ codex ไปแล้ว)
3. **tier ladder 5 ระดับ (t1–t5)**: ทดสอบครบทุก tier ผ่าน 15/15 (5 tier × 3 agent) — T1 ใช้ opus 5.5 high ได้จริงทั้ง claude (`--model opus`) และ agy (`claude-opus-5-5-high`)
4. **codex เปลี่ยน model ได้**: รายชื่อจริงจาก `/model` ของ codex (gpt-6-astra, gpt-6.1-sol, gpt-6-luna ฯลฯ) — ทดสอบผ่าน CLI แล้วทั้ง astra และ luna ตอบกลับถูกต้อง และรันครบ 5 tier ด้วย model/effort ต่างกันทุกระดับ (5/5)
5. **t0 overdrive**: claude `opus/max` + codex `gpt-6-astra/max` ใช้ได้จริง (codex header ยืนยัน `reasoning effort: max`) — ผ่าน 3/3 พร้อม timeout อัตโนมัติ 900s
6. **role directive**: สั่ง `--role check` แล้ว agent ตอบในบทบาท check พร้อมอ้างหลักการ "เขียน test จาก spec ไม่ใช่จากโค้ด dev" จากไฟล์ role จริง — ยืนยันว่าบทบาทส่งถึง agent ครบ

## ผลการทดสอบ release 0.4.0 (2026-10-16 — แยกโมดูลตาม AUDIT ข้อ 7)

- **แยกไฟล์เป็น `bin/` + `src/`** ตามโครงสร้างที่ audit แนะนำ: entrypoint เหลือ parse args + ลำดับใหญ่ (195 บรรทัด/ไฟล์) ส่วนกลไกแยกเป็น config / runner / prompts / plan / scheduler / run-store (61–177 บรรทัด/ไฟล์) จากเดิมไฟล์เดียว 660+ บรรทัด
- **runner ร่วมหนึ่งชุด** — baan กับ baan-role เรียก spawn/args/stdin/timeout จาก `src/runner.mjs` เดียวกัน ไม่ซ้ำสองแหล่งแล้ว
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
6. **CONVENTIONS.md ติด package** (`npm pack` ยืนยัน) และทั้งสอง entrypoint หยุดชัดเจนเมื่ออ่านไม่ได้ · plan ได้กติกากลางครบเหมือน role อื่นแล้ว
7. **context ส่งต่อ**: แนบสถานะ + path ฉบับเต็มเสมอ และแจ้งเมื่อถูกตัด

ยังเหลือจาก audit (ไว้รอบถัดไป): แยก runner/prompts/config/run-store/scheduler เป็นโมดูล, task-level write scope ก่อนใช้ --write จริง, gate ผูกกับ task เป็น object มีหลักฐานอนุมัติ

## ผลการทดสอบ release 0.2.0 (2026-10-15 — ทั้งหมดบน codex)

1. **role ชุดใหม่ + CONVENTIONS ส่งถึงจริง**: smoke test `check` และ `backend-engineer` (t5) — ตอบครบทุกข้อ: เขต Owns/ห้ามแตะ `knowledge\`, stop-and-route (`NEEDS_*` พร้อมอ้างอิง), output states, check เป็นเจ้าของ unit test ✓
2. **plan เคารพกติกาใหม่**: dry-run — plan ให้ 2 task ตามขนาดงาน (ไม่ใช้ทั้งทีม), tier ตรง FIXED_ROLE_TIER (spec=t2, inspect=t2), dependency ถูก, humanGates มีเนื้อหาจริง, จบ handoff ตามรูปแบบ ✓
3. **โหมดอัตโนมัติจบครบ run แรก**: execute แผนเดียวกันจบ 2/2 task 2 wave exit 0 — output ทั้งสอบจบด้วย handoff รูปแบบ charter + **output state พร้อม Task/Reference/Reason** (`NEEDS_HUMAN`, `NEEDS_REQUIREMENT_CHANGE`) ตรงตาม CONVENTIONS §8 และ role ไม่ตัดสินธุรกิจแทนคน ✓ (รายงาน: `reports\pipeline-2026-10-15-02-02-30`)
4. แก้บั๊กเครื่องสำอำรึก: ข้อความ console อ้าง path เก่า `ai-team/roles/` → `roles/`

ยังค้างข้อเดียวก่อนใช้เต็มรูปแบบ: **โหมดหลัก (session สวมบท นายช่าง)** ยังไม่เคยรันกับ goal จริงบน target จริง — กลไกทุกชิ้นที่มันใช้พิสูจน์ครบแล้ว เริ่มใช้ได้ทันทีโดยให้ session อ่าน `BAAN.md` พร้อม goal จริง

## เพิ่ม/แก้ agent

แก้ไขที่ `agents.json` — กำหนดคำสั่ง, flag สำหรับโหมด read/write, ช่องทางรับ prompt และจุดอ่านคำตอบได้หมด เช่น เพิ่ม `gemini -p` หรือสลับ model ด้วย `--model`

## ข้อควรระวัง

- ทุกครั้งที่รันคือการใช้ token/โควตาของบัญชีเจ้าของ CLI นั้นๆ
- โหมด `--write` ให้ agent แก้ไขไฟล์ใน `--cwd` ได้ ควรรันใน git repo เพื่อย้อนดู diff ง่ายๆ
- codex บนเครื่องนี้มี MCP server (figma) ที่ auth ไม่ผ่าน จะเห็น error ใน stderr แต่ไม่กระทบผลลัพธ์

## ไอเดียต่อยอด

- **Pipeline อัตโนมัติ (นายช่าง) มีแล้ว** — ดูหัวข้อ "🏗️ นายช่าง" ด้านบน; ต่อยอดได้อีกเช่น เก็บผลลัพธ์เป็น artifact ตามโครงสร้าง knowledge base (requirement/ design/ check/ ฯลฯ)
- ให้ นายช่าง เลือก agent ราย task ตามความเหมาะสม (เช่น งานเขียนโค้ดให้ตัวที่ถนัด) หรือรันซ้ำเมื่อคำตอบไม่ผ่านเงื่อนไข
- ต่อยอดเป็น MCP server เพื่อให้ AI session ใดก็เรียกทีมนี้เป็น tool ได้
