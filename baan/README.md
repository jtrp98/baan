# 🏗️ BAAN — นายช่าง

Local npm package สำหรับควบคุมงานพัฒนาผ่าน AI CLI: **Orchestrator → Planner เมื่อจำเป็น → Worker → Verifier ตามความเสี่ยง**
Core ที่เป็นโค้ดจัดคิว ล็อก repository เก็บ snapshot รัน machine gates และเก็บหลักฐาน
Node.js ≥18, Git และ provider CLI ที่ติดตั้ง/ลงชื่อเข้าใช้แล้ว; ไม่มี runtime dependency

## ติดตั้งและตั้งค่า

```sh
cd baan
npm link
baan --version
baan --help
baan --init --workspace C:/src/workspace
baan --list --workspace C:/src/workspace
```

ติดตั้งจาก artifact ได้ด้วย `npm install -g <path>/baan-0.29.0.tgz`
`--init` สร้าง `baan.config.json` และทางเข้า AGENTS.md/CLAUDE.md ไปยัง [BAAN.md](BAAN.md)
อัปเดตเฉพาะไฟล์ที่ BAAN สร้างไว้ ไม่ทับไฟล์ของผู้ใช้; รันซ้ำหลังอัปเกรดได้
แก้ paths/targets ใน config ให้ตรงเครื่อง ตัวอย่างอยู่ [baan.example.json](baan.example.json)
`--knowledge-git <url>` / `--memory-git <url>` clone เฉพาะปลายทางที่ยังไม่มี

Config discovery: `--config` → `BAAN_CONFIG` → เดินขึ้นจาก `--workspace`/`--cwd`/จุดที่เรียก
ไม่มี config ใช้ defaults; config จริงอยู่นอก package
Provider/tier ใช้ [agents.json](agents.json); override ทั้งชุดด้วย `BAAN_AGENTS_FILE=<path>`
`baan --list` แสดงชุดที่ใช้อยู่ ห้ามเดาชื่อ model จากเอกสารเก่า

- **Codex**: ลงชื่อเข้าใช้ CLI; ใช้ `exec`, structured schema, read-only sandbox สำหรับ Planner/Verifier และ session resume สำหรับ Worker
- **Claude**: ลงชื่อเข้าใช้ CLI; ใช้ JSON schema/session และจำกัด Planner/Verifier ให้มีเฉพาะ Read/Grep/Glob โดยปิด MCP ของ call นั้น
- **agy**: ลงชื่อเข้าใช้ CLI และติดตั้ง [read-only profile + guard](setup/agy/README.md) ที่ตรง package ก่อนใช้ Planner/Verifier; รองรับ schema/conversation resume
- **OpenCode**: ใช้ Worker ได้ตาม tier ที่ประกาศ; ไม่มี read-only contract ที่ core ยืนยันได้ จึงข้ามเมื่อเลือก Planner/Verifier
  Worker เริ่ม process ใหม่พร้อม context เมื่อไม่มี session ID; ไม่อ้างว่าเป็น native resume

บน Windows core เรียก native executable หรือ Node entry ของ npm Codex โดยไม่ผ่าน shell
รองรับ npm OpenCode ที่ `@opencode/cli/bin/opencode.exe`; wrapper แบบอื่นต้องตั้ง `command` เป็น executable จริง
การเปลี่ยน CLI/model ของเครื่องต้องตรวจ `--help` และรัน live smoke อีกครั้ง

## เตรียมและรันงาน

คุยให้ได้ acceptance ต้นฉบับพร้อม source ก่อน งาน UI ใช้ `/pencil` และทีมออกแบบตาม [BAAN.md](BAAN.md)
สร้าง `packet.json` ตาม [schema](schemas/packet.schema.json) โดยเลือก scope และ commands ให้ตรงงาน:

```json
{
  "id": "WP-1",
  "title": "แก้ผลรวม",
  "goal": "คำนวณยอดรวมตาม requirement",
  "tasks": ["TASK-1"],
  "repo": {"path": "C:/src/project"},
  "owns": ["src/total.mjs", "tests/total.test.mjs"],
  "read_first": [{"path": "src/total.mjs"}, {"path": "requirements.md"}],
  "acceptance": [{"id": "AC-1", "text": "รวมค่าบวก ศูนย์ และลบได้ถูกต้อง", "source": "requirements.md#AC-1"}],
  "depends_on": [],
  "risk": "low",
  "commands": {
    "build": "node --check src/total.mjs",
    "test_targeted": "node --test tests/total.test.mjs",
    "test_full": "npm test"
  },
  "acceptance_approved": false
}
```

```sh
baan run --direct --packet packet.json --workspace C:/src/workspace --dry-run
baan run --direct --packet packet.json --workspace C:/src/workspace
baan inbox --run <run-dir>
baan decide WP-1 --run <run-dir> --approve --by user --decision "ยืนยัน acceptance, scope และ commands ที่แสดง" --source "chat 2026-11-05"
baan run --resume <run-dir>
baan report <run-dir>
```

เริ่มแบบไม่อนุมัติเพื่อเก็บ inbox ได้ ไม่มี provider call ก่อนยืนยัน
บันทึก `--by user` เฉพาะเมื่อมีคำตอบจริงจากผู้ใช้ เป็น audit record ในเครื่อง ไม่ใช่ระบบพิสูจน์ตัวตนของผู้ใช้
Approval ผูกกับ acceptance/scope/commands/dependencies/risk และ hash ของ source/contracts
`read_first` ที่เป็น Markdown/DBML ถูก pin อัตโนมัติ; ไฟล์อื่นใช้ `{"path":"schema.json","pin":true}`
implementation files ที่อ่านเป็น context ไม่ทำให้ approval stale เพียงเพราะ Worker แก้โค้ด

`human_gates: [{"id":"G-UX","text":"คนเซ็น handoff ก่อนสร้างหน้าจอ"}]` เพิ่มประตูเฉพาะงาน
บันทึกแยกด้วย `baan decide WP-1 --run <run-dir> --gate G-UX --by user --decision "..." --source "..."`
Acceptance approval ไม่เซ็นประตูอื่นแทน ถ้า approval stale ต้องใช้ `--approve` อีกครั้ง; คำตอบทั่วไปไม่ refresh approval
งานค้างที่ทับ owns ต้องให้คนยืนยันด้วย `--allow-dirty --by user` พร้อม decision/source

งานใหม่ใช้ `baan run --goal "..." --cwd <repo> --owns "src/**,tests/**" --build "npm run build" --test "npm test"`
Core สร้าง acceptance จาก goal ให้รอยืนยัน; ระบุข้อความ/source เพิ่มด้วย `--acceptance`/`--source`
`--direct` ข้าม Planner สำหรับ package เดียว แต่ยังผ่าน approval, gates และ verifier policy
งานมี contracts, ประมาณเกิน 120 นาที หรือ `needs_planning: true` ใช้ Planner โดยปริยาย
แผนที่มี work packages ครบแล้วจัดคิวได้โดยไม่เปิด Planner ซ้ำ งานที่รอคนไม่ปล่อย dependencies แต่ approved independent work เดินต่อได้

## แผนและการจัดคิว

`baan run --plan plan.json --select A,B` รับ `{ "packages": [ ... ], "integration": [ ... ] }`
เส้นทาง repo แบบ relative อ้างจากโฟลเดอร์แผน การ select ต้องรวม dependencies ที่ต้องใช้
`--plan-file` เป็น alias ของ `--plan`; `baan --goal` เข้าทาง run เดียวกัน
แผน tasks อ่าน owner/role, depends_on/dependsOn, ac_ids/acIds และชื่อ role เดิมผ่าน normalizer เดียว
ต้องมี owns, commands และข้อความ AC/source ที่ตรวจได้; ระบุที่ task หรือ plan.acceptance
`gate_ids`, `gateIds`, `humanGate` และ human_gates ยังคงเป็นประตูที่ต้องยืนยัน ไม่ถูกทิ้งตอนรวม task
แผนต้นฉบับและประวัติเดิมไม่ถูกแก้; task ที่รวม package เดียวกันต้องมี repo/scope/commands ตรงกัน

หนึ่ง BAAN writer ต่อ Git repository รวมข้าม workspace/run/linked worktrees
หลาย repo ที่มีอย่างน้อยสอง package ประมาณ ≥30 นาทีเลือก parallel; งานอื่น planned ทีละ package
Planner แตกได้เฉพาะ scope/AC/task ของ parent และสืบ approval ที่ตรวจแล้วจาก core
`--agent`, `--tier` (default t2), `--planner-tier`, `--max-parallel` (1–64), `--timeout` (1–86400 วินาที)
Timeout ที่ระบุเองชนะ tier._timeoutSec แล้วจึง defaults.timeout_sec; resume ใช้ค่าที่บันทึกไว้

```json
{"packages": [], "integration": [{"packages": ["A", "B"], "command": "npm run test:contract"}]}
```

ตัวอย่างนี้แสดงเฉพาะรูปแบบ integration; แผนจริงต้องมี packages A และ B
ตรวจเมื่อ packages ที่เกี่ยว done ครบ cwd คือ repo ของ package แรก ถือ lock ทุก repo ที่เกี่ยว
ล้มเหลวส่ง evidence กลับ Worker ภายใน budget.max_rework (default 2); เกินเพดานรอคน
Integration command ที่เปลี่ยน working tree/Git state ทำให้หลักฐานใช้ต่อไม่ได้และรอการตรวจจากคน

## สถานะ หลักฐาน resume และ cancel

ข้อมูลทั้งหมดของ run อยู่ `<workspace>/.baan/runs/<id>/`: run.json เป็นสถานะหลัก, packets/, ledger.jsonl,
status.md, task-*.md, evidence/*.log/*.json และ provider input/result แยกตาม call
เพิ่ม `.baan/` ใน gitignore; อาจมีโค้ด/prompt/ข้อมูลจากผลคำสั่ง จึงไม่ควรเผยแพร่

`baan status [<run>]`, `baan report [<run>]`, `baan inbox [<run>]` อ่าน run ล่าสุดเมื่อไม่ระบุชื่อ
`baan decide <package> --run <run> --by user --decision "..." --source "..."` บันทึกคำตอบแล้วให้ resume
`baan run --cancel <package> --run <run>` หยุด process ของ runner ที่ยังทำงาน เก็บการแก้ไว้และไม่ปล่อยงานลูก
Cancel ก่อนเริ่มไม่เปิด provider; resume งาน cancelled ต้องมี decide ชัดเจนก่อน
ถ้า core หายและเหลือ orphan CLI จะไม่ฆ่า PID ที่อาจถูกนำกลับมาใช้ ให้หยุด process ต้นฉบับเองก่อน resume

| State | ความหมาย / ทำต่อ |
|---|---|
| pending / probing / running / gating / verifying | อยู่ในคิวหรือกำลังทำงาน |
| done | ผ่าน local machine gates และการตรวจที่ risk policy กำหนด |
| waiting_human | ดู inbox แล้วบันทึก decide |
| stale | reference/approval เปลี่ยน แสดง acceptance ใหม่แล้วขอยืนยัน |
| env_failed | แก้ CLI/toolchain/feed/permission แล้ว resume |
| blocked | รอ dependency หรือแผนยังใช้ไม่ได้ ดู questions |
| cancelled | หยุดแล้ว เก็บไฟล์เดิมไว้ |

Core สร้าง diff_file/snapshots_file ให้ Verifier อ่านโดยไม่ต้องเปิด terminal; หลักฐานแต่ละ attempt ใช้ชื่อเฉพาะ ไม่เขียนทับรอบก่อน
Machine gates รัน build/targeted/full, ตรวจ diff นอก owns, head/branch/index/stash และ AC ↔ test names
ขาด test mapping, แก้ existing tests, high risk, security/auth/PII, DB/schema, เงิน/คะแนน, public contract,
fan-out, milestone หรือ release ต้องมี Verifier ใหม่ที่ไม่รับคำเล่าของ Worker; Verifier อ่านอย่างเดียว
ถ้าไม่มี mapping ที่ parser รู้จัก ให้ Verifier ตรวจหลักฐานแทน ไม่ถือว่าคำว่า AC ใน stdout เป็น test proof
Cache เฉพาะคำสั่งผ่านบน snapshot/Git state/command เดิม; integration รวม snapshot ทุก repo

Snapshot เก็บ tracked recovery object (`git stash create`) และ untracked blobs โดยไม่เปลี่ยน working tree,
index content, stash list หรือ branch Core ไม่ reset/revert/commit target; การกู้เป็นการตัดสินใจของคน
Snapshot เก็บ target ของ untracked symbolic links ด้วย และครอบไฟล์ tracked/untracked ที่ Git เห็น ไม่ใช่ backup ของ ignored files หรือข้อมูลภายนอก repo
Scope gate เป็นการตรวจหลังแก้ ไม่ใช่ provider sandbox; Worker write mode ใน agents.json อนุญาตกว้างบนเครื่อง
Commands ใน packet/config เป็น trusted local shell commands ต้องตรวจเองก่อนอนุมัติ ไม่รับ commands ใหม่จาก LLM
Read-only permissions ขึ้นกับ provider/การตั้งค่าของเครื่อง มีการตรวจ mutation อีกชั้นแต่ไม่ rollback อัตโนมัติ

## เครื่องมือ knowledge และ UX/UI

`baan --init` ติดตั้ง spec ผ่าน `/pencil`, survey/ui/review และ web-design-guidelines ใน `.claude/`
ทีมนี้ใช้แบบคุยสด ไม่ถูกส่งเป็น execution roles; รักษา Design System, handoff และ human UX sign-off
`--module project/module[+module]` โหลด module context และ references; owns ยังคงเป็นขอบเขตเขียนของ packet
`baan --index`, `--lint-knowledge`, `--lint-plan <tasks.json>`, `--sweep "term" [--sweep-in <dir>]`
`baan --commit` เก็บเอกสารเฉพาะ knowledge/memory Git repos ที่ตั้งใน config ไม่มี auto commit ของ run
เครื่องมืออ่าน metrics เดิมยังอ่านประวัติ reports ได้; run ใหม่ใช้ ledger/evidence ของ engine เดียว

## สำหรับ maintainer

| Module | หน้าที่ |
|---|---|
| bin/baan.mjs → src/cli.mjs | CLI parser, run lifecycle, status/decisions |
| packet / planner / triage | input/result validation, trusted plan splitting, risk policy |
| scheduler / repolock | dependencies, one writer, rework, cancel |
| session / runner | provider arguments, native process, schema, usage, fallback/session |
| snapshot / gate / integrate | Git safety, command evidence/cache, integration checks |
| store | atomic run persistence, derived packet/status/task views, append-only events |
| config / workspace / utilities / init | workspace discovery, module context และคำสั่งจัดการ workspace |
| prompts / schemas / roles | execution contracts / structured data / interactive design contracts |

ไม่มี package exports map หรือ runtime dependency; src modules เป็น implementation ภายใน
Result schemas ใช้ subset ของ JSON Schema ที่ validator รองรับ: types/required/properties/enum/arrays/string bounds/numeric bounds
`promptBytes` วัด UTF-8 bytes ของ prompt ที่ส่งเท่านั้น ไม่ใช่ token/cost ทั้งหมด
Logs เต็มอยู่บน disk; Worker ได้ command summaries/paths และ rework findings, Verifier ไม่ได้ Worker summary

```sh
npm test
npm pack --dry-run
npm run validate:release
npm run smoke:live -- --agents codex --tier t3
```

Release validation สร้าง tarball จริง ตรวจ contents ติดตั้ง offline ใน temp workspace แล้วตรวจ imports/CLI/init/
direct/planned execution ผ่าน provider fixture และ machine commands จริง; ไม่ใช้ workspace งานจริง
Live smoke ใช้ provider จริงใน temp repo จึงใช้โควตา ไม่รวมใน npm test

การอัปเกรดที่ต้องแก้คำสั่งเป็น minor ระหว่าง 0.x พร้อมหมวด ⚠ ใน release notes
เตรียมรุ่นและ artifacts ได้ แต่ push/tag/merge release/publish ต้องมีคำสั่งเผยแพร่ชัดเจน
[Release notes](RELEASE-NOTES.md) เก็บการเปลี่ยนแปลงและประวัติตามจริง

## Troubleshooting

CLI ไม่พบ/เรียก wrapper ไม่ได้: ตรวจ PATH/native executable และ agents.json
JSON/schema ไม่ผ่าน: ดู call.json/input.json และอัปเดต provider CLI; ไม่ fallback เพราะ JSON ผิดหรือแก้ไฟล์ไปแล้ว
ENVIRONMENT_FAILURE: ดู probe/output_file และแก้ dependency/toolchain/permission ก่อน resume
LOCK_BUSY: ตรวจ run/CLI เดิมให้หยุดจริง; core กู้ lock เฉพาะเจ้าของ PID ที่ตายแล้ว ไม่ลบ lock ที่ยังทำงาน
Approval stale: ดู source/scope/commands ที่เปลี่ยน บันทึก --approve ใหม่จากคำตอบคนจริง
Scope/Git state violation: ตรวจ evidence แล้วให้คนแก้หรือกู้เอง Core ไม่ล้างการแก้ที่ค้าง
แผน/run เก่าที่เป็น task checkpoints ใช้ BAAN รุ่นที่สร้างมัน; รุ่นนี้อ่าน tasks เป็น input แต่ไม่เขียนทับประวัติเดิม
