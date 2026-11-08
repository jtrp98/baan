# 🏗️ BAAN — นายช่าง

Local npm package สำหรับควบคุมงานพัฒนาผ่าน AI CLI: **Orchestrator → Planner เมื่อจำเป็น → Worker → Verifier ตามความเสี่ยง**
Core ที่เป็นโค้ดจัดคิว ล็อก repository เก็บ snapshot รัน machine gates และเก็บหลักฐาน
Node.js ≥18, Git และ provider CLI ที่ติดตั้ง/ลงชื่อเข้าใช้แล้ว; ไม่มี runtime dependency

สิ่งที่เปลี่ยนใน **0.34.0** และขั้นตอนอัปเกรดอยู่ใน [Release notes](RELEASE-NOTES.md)

## ติดตั้งและตั้งค่า

```sh
cd framework
npm link
baan --version
baan --help
baan --init --workspace C:/src/workspace
baan --list --workspace C:/src/workspace
baan sync [--push] [--pull-only] [--dry-run] [--no-self-update]
baan survey [--target <name>] [--project <name>] [--cwd <path>] [--json]
baan monitor [--port 3456] [--no-open] [--tui]
```

`baan monitor` (หรือ `baan ui`) มอนิเตอร์การทำงานสดและสรุป 3-CLI Usage แยกอิสระจากการสั่งงาน:
- **Decoupled Architecture**: เปิดทิ้งไว้ในหน้าต่างแยกหรือเบราว์เซอร์ (`http://localhost:3456`) ขณะที่คุณสั่งงานใน session ตามปกติ (เช่น คุยกับ AI ใน `C:\src\schoolbright`)
- **Real-time Process & Tool Calls**: แสดงสด ณ วินาทีนั้นว่า AI กำลังอ่านไฟล์ไหน (`read_file`), แก้ไฟล์อะไร (`edit_file`), หรือรันคำสั่งอะไร (`bash: npm test`) พร้อม Snippet ความคิดล่าสุด
- **Used ทั้ง 3 CLI แบบสดๆ**: คำนวณ Token In/Out/Cache, Turns, และ Cost ($) ของ **Claude Code**, **Codex**, และ **Google Antigravity (AGY)**
- **Multi-Session & Multi-Project**: สลับดูภาพรวมทุกโปรเจกต์ (Overview) หรือคลิกเลือกดูเฉพาะโปรเจกต์เดี่ยว (Single Project Focus) เช่น `school-bot`, `sb-api-gateway`
- **TUI Mode**: เพิ่ม `--tui` เพื่อแสดงผลแบบ Dashboard ในเทอร์มินัลสไตล์ `htop` โดยไม่ต้องเปิดเบราว์เซอร์
- **Pixel HQ (หน้าเว็บ)**: ออฟฟิศ pixel-art ที่มีตัวละคร 12 บทบาท + 3 provider (Claude / Codex / AGY) แยกกันคนละตัว — provider เดินไปนั่งข้างโต๊ะของ role เมื่อ telemetry จริงบอกว่ากำลังทำงานคู่กัน (มาจาก `active-<pkg>.json` + `call_end` ใน ledger) คลิกตัวละคร/โต๊ะเพื่อดูรายละเอียด ปิดแอนิเมชันได้ด้วยปุ่ม `PIXEL ANIMATION` (มอนิเตอร์ยังทำงานต่อ)
  - ไม่เดาข้อมูล: role/provider ที่ไม่รู้จะขึ้น `ROLE UNKNOWN` / `PROVIDER UNKNOWN`, โควตาที่อ่านไม่ได้ขึ้น `UNAVAILABLE` (ไม่ใช่ 0%), การเชื่อมต่อหลุดขึ้น `RECONNECTING` ไม่ใช่ "ว่าง"
  - บทบาทคุยสด (spec, arch, pm, build, check, survey, ui, review) ไม่มี runtime telemetry จึงเดินเล่นเป็นการตกแต่งเท่านั้น
  - ไฟล์หน้าเว็บอยู่ที่ `src/monitor-ui/` (ES modules ล้วน ไม่มี dependency) เสิร์ฟผ่าน `/ui/<file>` แบบ whitelist

`baan survey` สำรวจ target codebase และตรวจจับความคลาดเคลื่อน (Drift Detection) เทียบกับ Knowledge:
- ตรวจจับ Tech Stacks (.NET, Next.js, Go, Python, React, ฯลฯ) และ Architecture Components (`features/`, `backend/src/`, `engines/`)
- วิเคราะห์ Drift: โค้ดที่เดินหน้าไปไกลกว่า Knowledge (Unmapped Code) หรือโมดูลใน Knowledge ที่หาโค้ดจริงไม่พบ
- สร้างโครงสร้างโมดูล (`--scaffold-module <name>`) หรือโปรเจค (`--scaffold-project <name>`) ครบสัญญา 3-slot พร้อมอัปเดตสารบัญ `INDEX.md` อัตโนมัติ
- **สั่งผ่าน AI ในแชทได้โดยตรง**: ผู้ใช้ไม่ต้องพิมพ์ CLI เอง สามารถสั่ง AI ในแชท (เช่น บทบาท `arch` หรือนายช่าง) AI จะใช้ skill `project-survey` สำรวจ วิเคราะห์ และสร้างโมดูลให้ทั้งหมด

`baan sync` ทำงานครบวงจรสำหรับการซิงค์และอัปเดตระบบ:
1. ตรวจสอบและอัปเดตตัวแม่ BAAN อัตโนมัติ (Self-Update) เมื่อมี commit หรือเวอร์ชันใหม่ใน Git
2. รีเฟรชไฟล์ stubs (`.claude/agents/*.md`, skills, `CLAUDE.md`, `AGENTS.md`) ใน workspace ให้ตรงกับ BAAN รุ่นล่าสุด
3. ทำ Safe Auto-Commit สำหรับการแก้ไขค้างใน `knowledge_roots` และ `memory`
4. ดึงข้อมูลล่าสุดด้วย `git pull --rebase --autostash` และส่งงานขึ้น remote ด้วย `git push`
5. รีเฟรช `knowledge-index.json` อัตโนมัติ

หากมี artifact ที่ pack จากรุ่นนี้แล้ว ติดตั้งได้ด้วย `npm install -g <path>/baan-0.34.0.tgz` (ไม่ได้หมายถึงมีรุ่นนี้เผยแพร่บน npm)
`--init` สร้าง `baan.config.json` และทางเข้า AGENTS.md/CLAUDE.md ไปยัง [BAAN.md](BAAN.md)
อัปเดตเฉพาะไฟล์ที่ BAAN สร้างไว้ ไม่ทับไฟล์ของผู้ใช้; รันซ้ำหลังอัปเกรดได้
แก้ paths/targets ใน config ให้ตรงเครื่อง ตัวอย่างอยู่ [baan.example.json](baan.example.json)
`--knowledge-git <url>` / `--memory-git <url>` clone เฉพาะปลายทางที่ยังไม่มี

Config discovery: `--config` → `BAAN_CONFIG` → เดินขึ้นจาก `--workspace`/`--cwd`/จุดที่เรียก
ไม่มี config ใช้ defaults; config จริงอยู่นอก package
Provider/tier ใช้ [agents.json](agents.json); override ทั้งชุดด้วย `BAAN_AGENTS_FILE=<path>`
`local.json` (ดูตัวอย่างที่ [local.example.json](local.example.json)) ใช้ตั้งค่าเฉพาะเครื่อง: กำหนด `auto_update`, ลงทะเบียน `workspaces`, และเปิด/ปิด AI Agents (`"claude": true`, `"codex": true`, `"agy": false` หรือใช้ string "open"/"close"); agent ที่ปิดจะถูกคัดออกจาก Fallback Chain, ข้ามใน `update-clis`, และแสดง `disabled_by_config` ใน `parity`
`baan --list` แสดงชุดที่ใช้อยู่ ห้ามเดาชื่อ model จากเอกสารเก่า

| ค่า | ค่าเริ่มต้น / ที่ตั้ง |
|---|---|
| Worker/Verifier agent | `defaults.agent` ใน workspace config; ไม่ตั้งใช้ `codex`; override ด้วย `--agent` |
| Worker/Verifier tier | `t2`; override ด้วย `--tier` |
| Planner tier | `defaults.planner_tier` (`t2`); override ด้วย `--planner-tier` |
| งานขนานสูงสุด | `defaults.max_parallel` (`3`); override ด้วย `--max-parallel` |
| Timeout | `--timeout` → tier `_timeoutSec` → `defaults.timeout_sec` (`0` วินาที = unlimited) |
| นโยบายสิทธิ์ | `defaults.permission_policy` (`native-safe`); override ด้วย `--permission-policy` หรือ `--allow-bypass` |

Tier เลือก model/effort และลำดับ fallback จาก agents config ไม่ใช่การผูก provider ถาวร
BAAN ยึดหลัก **Native First, Orchestrate Outside, Preserve Inside**:
- **Codex**: ลงชื่อเข้าใช้ CLI; ใช้ native `exec`, structured schema, native read-only sandbox สำหรับ Planner/Verifier และ native session resume สำหรับ Worker
- **Claude**: ลงชื่อเข้าใช้ CLI; ใช้ native `plan` mode สำหรับ Planner/Verifier โดยรักษา MCP, Skills และ Subagents; ใช้ `acceptEdits` หรือ Approval Bridge ใน Worker
- **agy**: ลงชื่อเข้าใช้ CLI; ใช้ native `plan` mode และรองรับ `invoke_subagent` สำหรับ Planner/Verifier; Worker รองรับ `accept-edits` ใน safe mode และ opt-in bypass เมื่อต้องการ

บน Windows core เรียก native executable หรือ Node entry ของ npm Codex โดยไม่ผ่าน shell
ตรวจความพร้อมและ Parity ของเครื่องด้วย `baan parity` ก่อนเริ่มงานจริง

## เตรียมและรันงาน

คุยให้ได้ acceptance ต้นฉบับพร้อม source ก่อน ใช้ agent spec และทีมออกแบบตาม [BAAN.md](BAAN.md) และ [LEARNING.md](LEARNING.md)
สร้าง `packet.json` ตาม [schema](schemas/packet.schema.json) โดยเลือก scope และ commands ให้ตรงงาน:

```json
{
  "id": "WP-1",
  "title": "แก้ผลรวม",
  "goal": "คำนวณยอดรวมตาม requirement",
  "kind": "code",
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

ระบุ `"kind": "code" | "docs"` ใน packet หรือ task (ไม่ระบุอนุมานจาก role):
- งาน `docs`: Worker สามารถใช้ tier ประหยัด (`worker_tier: "t4"|"t5"`) และใช้ Hybrid Verification (เอกสารทั่วไปตรวจผ่าน linter + human gate; เอกสารวิกฤต ADR/Contracts มี LLM Verifier)
- งาน `code`: Worker ลด tier ได้ (`worker_tier: "t3"`) เฉพาะเมื่องานมี `contracts` ชัดเจน และห้ามลดสำหรับงาน `risk: high` เพื่อป้องกัน Rework Penalty ดูรายละเอียดใน [MIGRATION.md](MIGRATION.md)

งานใหม่ใช้ `baan run --goal "..." --cwd <repo> --owns "src/**,tests/**" --build "npm run build" --test "npm test"`
Core ใช้ข้อความ goal เป็น acceptance เริ่มต้นให้รอยืนยัน; กำหนดข้อความ/source เองด้วย `--acceptance`/`--source`
ระบุ `--build` และ `--test` เสมอ; `--test-full` ไม่ตั้งใช้คำสั่งเดียวกับ `--test` ส่วน `--setup` เป็นทางเลือก
`--owns` ไม่ตั้งใช้ `**` จึงควรกำหนดขอบเขตให้แคบก่อนให้คนยืนยัน; `--goal-file <file>` อ่าน goal จากไฟล์แทน `--goal`
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
ห้ามส่ง `--agent`, `--tier`, `--planner-tier`, `--timeout` หรือ `--max-parallel` ใหม่พร้อม `--resume`

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
ใช้ `--workspace <dir>` ให้ตรง workspace ที่สร้าง run หรือใช้ run directory แบบ absolute; `status`/`report` คืนรายงาน JSON และ `inbox` คืนรายการ package ที่ต้องตอบ
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

## ทีมสร้าง ทีมออกแบบ และความรู้

`baan --init` ติดตั้งทีมสร้าง (`spec`, `arch`, `pm`, `build`, `check`) และทีมออกแบบ (`survey`, `ui`, `review`) ใน `.claude/agents/`
บทบาทเหล่านี้ทำงานแบบคุยสด วางแผนก่อนทำเสมอ (`/plan` first) และใช้ Subagents ของแต่ละ CLI ช่วยสำรวจและเขียน Docs ตาม 3-Step Workflow ใน [LEARNING.md](LEARNING.md)
`--module project/module[+module]` โหลด module context และ references; owns ยังคงเป็นขอบเขตเขียนของ packet
`baan --index`, `--lint-knowledge`, `--lint-plan <tasks.json>`, `--repair-mojibake <file>`, `--sweep "term" [--sweep-in <dir>]`
`baan --commit` เก็บเอกสารเฉพาะ knowledge/memory Git repos ที่ตั้งใน config ไม่มี auto commit ของ run
`baan --commit` ค้นหา Git repo ในแต่ละ root ตาม path ที่ระบุใน `knowledge_roots` และ `memory_root` แล้ว commit การเปลี่ยนแปลงเอกสารโดยอัตโนมัติ
เครื่องมืออ่าน metrics เดิมยังอ่านประวัติ reports ได้; run ใหม่ใช้ ledger/evidence ของ engine เดียว

## เอกสารและแผนจากระบบเดิม

ชื่อ owner/role เดิมในแผนเป็น metadata ที่ normalizer ยังอ่านได้ ไม่ใช่ execution roles ที่เรียกแยก
การอ่าน tasks เป็น input ไม่ได้ย้ายสถานะ `verified`, checkpoint หรือ approval เดิมให้กลายเป็น `done` ของ run ใหม่
ต้องมี AC/source, owns และ commands ครบ และให้คนยืนยัน basis ของ run ใหม่ก่อน dispatch

| สิ่งที่ใช้ในระบบเดิม | วิธีใช้ปัจจุบัน |
|---|---|
| `baan-role` หรือ role execution แยก | `baan run --packet <file>` หรือ `baan run --plan <file>` |
| `baan --goal` / `--plan-file` | ยังรองรับและเข้าทาง engine เดียวกับ `baan run` |
| `--write` | Worker เขียนหลัง approval และ human gates ครบ |
| `--test-level` | ระบุ `commands.build/test_targeted/test_full` ใน packet หรือ flags ของ goal |
| `--date` / `--usage` | Core บันทึกเวลาจริงและ usage เมื่อ provider ส่งข้อมูลให้ |
| `--no-preflight` | ไม่มี flag ข้ามการตรวจของ core; แก้ environment/blocker แล้ว resume |
| `--no-fallback` | ไม่มี flag นี้; ใช้ agents config ที่ตรวจแล้วผ่าน `BAAN_AGENTS_FILE` |
| Run/checkpoint เดิม | ใช้รุ่นที่สร้าง run นั้น; เก็บประวัติเดิมไว้ |

มติคนที่อ้างคำสั่งหรือ provider routing เดิมยังเป็นหลักฐานของวันนั้น ไม่ใช่คำสั่ง CLI ปัจจุบัน
หากข้อจำกัดเดิมทำตามไม่ได้ ให้รายงานและขอการตัดสินใจ ไม่เปลี่ยนมติหรืออนุมัติ fallback แทนคน

## สำหรับ maintainer

Source ของ npm package อยู่ใน `framework/`; BAAN ไม่เก็บเอกสารของโครงการไว้ใน repo กลาง แต่เชื่อมโยงกับ knowledge roots ผ่าน config ของ workspace

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
