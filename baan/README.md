# 🏗️ BAAN — นายช่างผู้คุมทีม AI 11 ตำแหน่ง

> แตกงานแต่ละตำแหน่งมีหน้าที่ชัด เปิด session ราย role ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์

## BAAN คืออะไร

เครื่องมือทำงาน software กับ AI หลายตัวพร้อมกันอย่างมีระเบียบ — แทนที่จะเปิด AI session เดียวให้ทำทุกอย่าง (วางแผน เขียนโค้ด เขียนเทส รีวิวความปลอดภัย) จนได้งานปนกันไม่มีคนตรวจ BAAN แบ่งงานเป็น **11 ตำแหน่งธีมไซต์งานก่อสร้าง** แต่ละตำแหน่งมีบทบาท เขตงาน และเขตห้ามแตะเป็นของตัวเอง แล้วเรียกใช้ผ่าน AI CLI ที่ติดตั้งไว้แล้วบนเครื่อง (claude / codex / agy) แบบ non-interactive (`claude -p` / `codex exec` / `agy --print`)

หลักการสำคัญที่ฝังไว้ทุก role:

- **แบ่งแยกหน้าที่กันข้อผิดพลาด** — คนเขียนโค้ดไม่ใช่คนตรวจโค้ด ผู้ออกแบบ schema ห้ามรัน SQL เอง
- **ประตูมนุษย์** — สิ่งที่ต้องเป็นคนตัดสิน (เซ็น UX, รัน SQL, ตัดสินธุรกิจ) ทีมหยุดถามเสมอ ไม่ทำแทน
- **จ่าย model ตามความยากงาน** — งานคิดหนักใช้ model แพง งานจำนวนมากใช้ model เบา ผ่านระบบ tier
- **อ่านอย่างเดียวโดยดีฟอลต์** — ทุก session เริ่มแบบ read-only จะแก้ไฟล์ได้ต่อเมื่อสั่ง `--write` ชัดๆ

คุณสมบัติ: **zero runtime dependency** (ต้องมีแค่ Node.js ≥ 18) · รัน local ทั้งหมด · รายงานของทุก run เก็บไว้ในเครื่อง (`reports/`)

## เริ่มต้นใช้งาน

ต้องมีก่อน: Node.js ≥ 18 และ AI CLI อย่างน้อยหนึ่งตัว (`claude` / `codex` / `agy`) ที่ล็อกอินใช้งานได้แล้ว (agy โหมดอ่านต้องติดตั้ง profile เพิ่มหนึ่งครั้ง — ดูหัวข้อ "ตัวรัน AI CLI")

```bash
git clone https://github.com/jtrp98/baan && cd baan/baan   # clone ไว้ตรงไหนก็ได้ เช่น C:\src\AICode\baan\baan
npm link                            # ติดตั้งครั้งเดียว ใช้ได้จากทุกโปรเจกต์
cd <โปรเจกต์ของคุณ>
baan --init                         # สร้าง baan.config.json + ไฟล์นำทาง AI session ในโปรเจกต์นี้
baan --list                         # ตรวจว่าเห็น knowledge/targets/roles/tiers ครบ
```

> ประวัติรุ่นและสิ่งที่เปลี่ยนแต่ละเวอร์ชัน: `RELEASE-NOTES.md`

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

โครงสร้างข้อมูลของ workspace หนึ่งๆ (config อยู่**นอก package** เพื่อให้ update version ไม่ทับ config ของคุณ):

- `<ราก workspace>\baan.config.json` — config ของ workspace นั้น (เช่น `C:\src\schoolbright\baan.config.json` · ตัวอย่างรูปแบบเต็ม: `baan.example.json`)
- **ที่เก็บเอกสาร** — `knowledge_roots` เช่น `C:\src\schoolbright\knowledge` (requirement/design/review แยกโฟลเดอร์รายโปรเจกต์)
- **ที่เก็บ code** — `targets` เช่น `C:\src\schoolbright\target\*` (repo ที่ทีมจะแตะ)

ตัว baan เดินหา config ขึ้นจากไดเรกทอรีที่เรียกอัตโนมัติ (หรือระบุ `--config <file>` / env `BAAN_CONFIG`) · โหมดอัตโนมัติอ้าง target ผ่าน `--target <ชื่อ>`

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
    init.mjs                ← ติดตั้งลง workspace (baan --init): สร้าง config + ไฟล์นำทาง AI session
    timeout.mjs             ← คำนวณ/ตรวจ timeout ที่ใช้ร่วมทั้งสองคำสั่ง
    knowledge-commit.mjs    ← auto commit ที่เก็บเอกสารหลังจบ run
  baan.example.json     ← template การตั้งค่า (config จริงอยู่นอก package ที่ <workspace>\baan.config.json)
  agents.json               ← ตัวรัน (claude/codex/agy/opencode) + tier ladder t0–t5
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

**โหมด solo** — สั่งเพิ่มใน prompt ว่า "solo" / "ทำเอง" ให้ session ที่สวม นายช่าง **เป็นทั้ง นายช่าง และทีมทั้งทีม**: แตก role เป็น subagent/งานเบื้องหลังของ session เอง (1 role ต่อตัว แนบไฟล์ role + CONVENTIONS ครบ จบด้วย output state) — เหมาะกับแอปที่ไม่มี CLI ให้ baan-role เรียก (เช่น ZCode) หรือกรณีอยากประหยัดโควตา runner · งาน `check`/`jpo` ของงานที่ solo เขียนเองใช้ subagent ได้ ถ้าเป็นตัวใหม่ + ตรวจจาก AC/spec เท่านั้น (ไม่แนบคำอ้างผู้เขียน) + ตรวจจริงด้วยหลักฐาน — ข้ามโมเดลผ่าน `baan-role` เหลือเป็นทางเลือกสำหรับงานวิกฤตก่อน production/security สำคัญ/FAIL ซ้ำรอบ · ส่ง `baan-role` บังคับเฉพาะงาน tier t0/t1 และงานที่เกินกำลัง session · บันทึกใน knowledge ว่าใครรันจริง — รายละเอียดอยู่ใน `BAAN.md`

## มาตรฐานเอกสารข้อมูล

งาน data model ต้องอธิบายตารางทำอะไร หนึ่งแถวหมายถึงอะไร ทุกฟิลด์เก็บอะไร และใช้ข้อมูลเดิมผ่านคอลัมน์ไหน พร้อมตัวอย่างและหลักฐาน ไม่จบที่รายชื่อฟิลด์/ชนิดย่อ

- `arch`: คู่มือภาพรวมและ dictionary ของตาราง/ฟิลด์ รวม JSON/enum, การเชื่อมตารางเก่า และขอบเขตอ่าน/เขียน
- `vault`: เทียบแบบกับ SQL จริงและส่งรายละเอียด physical delta ให้เจ้าของแบบปรับคู่มือ
- `inspect`/`check`: ตรวจความครบถ้วนในขอบเขตงาน แยก static documentation checks จากผลทดสอบระบบจริง
- นายช่าง: บันทึกผลและเชื่อมไฟล์ที่แบ่งไว้ให้เปิดอ่านได้ ความหมายที่ยังไม่พิสูจน์ต้องระบุว่าไม่ยืนยัน

งาน relational data model ต้องส่ง DBML แบบเต็มพร้อม Note ไทย/กลุ่มสี และภาพ integration ย่อเมื่อเชื่อมตารางเดิม โดยแยก FK จริงกับ logical mapping ชัดเจน ตรวจ parser และเทียบกับ SQL ก่อนส่ง พร้อมคู่มือเปิดอ่าน

ข้อกำหนดละเอียดอยู่ใน `roles/arch.md` และ `CONVENTIONS.md`; กติกานี้ถูกแนบไปกับ prompt ของ role ผ่านกลไกเดิม

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

# เก็บกวาดของที่ค้างใน knowledge repo ด้วยมือ (auto commit ทำให้เองท้ายทุก run อยู่แล้ว)
baan --commit

# คำสั่งระดับล่างอื่นๆ ของ baan-role (orchestrator)
baan-role --all --tier t0 --task "งานยากมาก ทุก agent พร้อมกัน"
baan-role --agent claude --model haiku --effort low --task "..."
baan-role --list              # ดูรายชื่อ agent + tier
```

### สัญญาของ `baan-role` (โหมดหลัก — ใช้กติกาเดียวกับโหมดอัตโนมัติ)

- **cwd เริ่มต้น = ไดเรกทอรีที่เรียก** · `--cwd` แบบ relative อิงจากที่เรียก
- **สถานะงานจาก output state ท้ายคำตอบ** (CONVENTIONS §8) ไม่ใช่ exit code ของ CLI — บรรทัดผลของแต่ละ agent แสดง `OK`/`NEEDS_HUMAN`/`FAIL(exit=…)`/... · `report.json` มี `state`/`marker`/`fallback` ราย agent · **exit 0 เฉพาะเมื่อทุกตัว completed**
- **fallback เมื่อติดโควตา** ตาม `_fallback` ของ tier — ทำเฉพาะเมื่อสั่ง agent เดียวพร้อม `--tier` (`--all` ไม่สลับ) · ตัวสำรองใช้ model/effort ของ tier (ไม่ใช้ `--model`/`--effort` ที่ระบุให้ตัวแรก) · ปิดด้วย `--no-fallback`
- **runDir ไม่ชนกัน**: `reports/<timestamp>-<role>-tier-<t>-<n>agents-<สุ่ม>/` — เปิดหลาย role ขนานกันในวินาทีเดียวได้
- **ป้าย `[baan-role: <ID>]`** บรรทัดแรกของ prompt ทุก role (งานไม่ผูก role = `adhoc`) + ประโยคข้อยกเว้นเดียวกับใน CLAUDE.md/AGENTS.md ที่ `--init` สร้าง — role ที่รันใน workspace จึงไม่สวมบท นายช่าง ซ้อนตามไฟล์ที่ CLI โหลดเอง (ข้อความอยู่ที่ `src/role-guard.mjs`)
- **auto commit ที่เก็บเอกสารหลังจบ run** — knowledge root ไหนเป็น git repo (มี `.git`) จะถูก commit ให้อัตโนมัติตอนจบ run ของทั้ง `baan` และ `baan-role` · แยก commit ต่อ module (โฟลเดอร์ย่อยแรกใต้ knowledge) ข้อความอังกฤษสั้นรูปแบบ `module: add|update|remove <ไฟล์> [+N more]` เช่น `school-bot: add db/review-001.md, index.md +2 more` · ไฟล์ที่ commit ไม่ทับของ module อื่นที่ staged ค้างไว้ · ไม่ใช่ git repo = ข้ามเงียบๆ · git พังเมื่อไหร่แจ้งเตือนแล้วไปต่อ ไม่ลากผล run ไปตายด้วย · เรียกด้วยมือได้ด้วย `baan --commit` (โค้ดอยู่ที่ `src/knowledge-commit.mjs`)
- **วันที่ของงาน** ใส่ใน prompt ทุก role (และ gm/plan ในโหมดอัตโนมัติ) — ค่าเริ่มต้น = วันที่ local ของเครื่อง · override ด้วย `--date YYYY-MM-DD` (ทั้ง `baan` และ `baan-role`) · resume ใช้วันที่ของวันที่รันจริง ไม่คืนจาก run เดิม

### เมื่อเอกสาร knowledge ยังไม่ถูก commit

hook ของ `baan`/`baan-role` ทำงานตอนคำสั่งนั้นจบเท่านั้น ถ้านายช่างรับ output จาก role แบบ read-only แล้วค่อยเขียนเอกสารเอง ต้องเรียกเก็บอีกรอบหลังบันทึกไฟล์ครบ:

```powershell
baan --commit --config C:/path/to/workspace/baan.config.json
```

ใช้ config จริงที่มี `knowledge_roots`; root ต้องมี Git repo ของตัวเองและมีสิทธิ์เขียน Git metadata รวมถึงตั้งชื่อ/อีเมลผู้ commit ไว้แล้ว ตรวจข้อความเตือนและ `git status` หลังรัน การ commit knowledge เป็นข้อยกเว้นที่อนุญาตในกติกากลาง; source/target และการ push ยังอยู่ภายใต้คำสั่งผู้ใช้

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

หลักการแบ่งหน้าที่ที่ฝังไว้ใน role:
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
- **งานที่เปลี่ยนสิ่งที่มีผู้อ้างอิง ต้องกวาดทุกจุด (related-impact sweep)** — เปลี่ยนสัญญา/ชื่อ/ค่า/revision/สถานะที่มีอยู่แล้ว แผนต้องมี task เก็บเอกสารผู้อ้างอิงทุกจุดตามเจ้าของไฟล์ (รวม index หลักของโมดูล) แม้เป็นงานเล็ก; ไม่มีผู้อ้างอิงต้องระบุไว้ชัดว่าไม่มี
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

### สถานะงาน · checkpoint · resume

- **สถานะงานแยกจาก exit code ของ CLI**: task จบด้วย `completed` เฉพาะเมื่อรันจบ + มีคำตอบ + output state ท้ายคำตอบ (CONVENTIONS §8) เป็น `DONE`/`PASS` (หรือไม่มี marker) — ถ้า role ตอบ `NEEDS_HUMAN` / `NEEDS_REQUIREMENT_CHANGE` / `NEEDS_DESIGN_CHANGE` / `FAIL` / `BLOCKED` ถือว่า**งานไม่สำเร็จแม้ exit code เป็น 0**
- **dependency ผ่านเฉพาะงานที่ completed** — งานลูกของงานที่ล้มจะถูก mark `blocked` แล้วข้าม แต่งานอิสระที่ไม่ติด blocker ยังทำต่อจนจบ
- **exit code ของ `baan`**: 0 เมื่อทุก task completed เท่านั้น — เจอ needs_*/fail/timeout/blocked ตัวใดตัวหนึ่งจะเป็น 1 พร้อมสรุปสาเหตุราย task
- **checkpoint ต่อ task**: ทุกงานเขียน `<id>.status.json` ทันทีที่จบ (สถานะ, marker, exit code, attempt, artifact paths) — `--resume` เชื่อเฉพาะ checkpoint (`completed` + มีไฟล์คำตอบจริง) งาน timeout/fail/needs_* และ run เก่าก่อน v0.3 จะถูกรันใหม่
- **manifest ของ run (`run.json`)**: เก็บ resolved target/cwd/write/projectCtx ตอนสร้าง run — `--resume` คืนบริบทเดิมอัตโนมัติ (flag ที่ส่งเองชนะเสมอ และจะพิมพ์บอกทุกครั้งที่คืนค่า) จึงไม่หลุดเป็นทำงานผิดโปรเจกต์
- **plan validation ก่อน spawn ใดๆ**: id ต้องเข้า pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` (id คือชื่อไฟล์ จึงกัน path traversal), ตรวจ types ของ tasks/dependsOn/humanGates, self-dependency และ cycle
- **context ส่งต่อระหว่าง task**: แนบสถานะ + path ฉบับเต็มเสมอ และถ้าเนื้อหาถูกตัดที่ 6,000 ตัวอักษรจะบอกว่าถูกตัดกี่ตัวอักษร
- regression tests: `npm test` (node:test ล้วน ไม่มี dependency เพิ่ม ไม่ยิง provider จริง)

งานที่ผลิตเอกสารยาว (เช่น arch @ t1) อาจใช้เวลานาน — ทั้ง `baan` และ `baan-role` ใช้ timeout เริ่มต้น 1800 วินาทีต่อ AI CLI job (t0 ใช้ 3600 วินาที)

**ลำดับ timeout** (ทั้งสองคำสั่ง รวมทุกขั้นและ fallback): `--timeout` ที่ระบุเอง > `_timeoutSec` ของ tier ใน `agents.json` > `defaults.timeout_sec` ใน workspace config > 1800 วินาที · ค่าต้องเป็นจำนวนเต็ม 1–86400 ค่าผิดจะ error ทันที ไม่เปลี่ยนเป็น default เงียบๆ เช่น `baan-role --agent codex --role arch --tier t1 --timeout 3600 --task "วิเคราะห์ระบบ"`

`baan-role` หา workspace config โดยเดินขึ้นจาก `--cwd` (หรือไดเรกทอรีที่เรียก) เพื่ออ่านเฉพาะ default timeout และราก workspace — ไม่เปลี่ยน agent/cwd/สิทธิ์จากที่สั่งไว้ · env `BAAN_CONFIG` ชนะการค้นหา · resume ไม่คืน timeout จาก run เดิม

## การเปลี่ยน model / effort (สำหรับแบ่ง tier)

แต่ละ CLI ใช้ syntax ต่างกัน — baan-role แปลงให้ผ่าน `modelArgs`/`effortArgs` ใน `agents.json`:

| Agent | เปลี่ยน model | เปลี่ยน effort | ระดับ effort ที่รองรับ |
|---|---|---|---|
| claude | `--model <alias>` เช่น `haiku`, `sonnet`, `opus` | `--effort <level>` | low, medium, high, xhigh, max |
| codex | `-m <model>` (เฉพาะชื่อใน list ของ /model) | `-c model_reasoning_effort=<level>` | none, minimal, low, medium, high, xhigh, max |
| agy | `--model <ชื่อจาก agy models>` | `--effort <level>` | low, medium, high, xhigh, max |
| opencode | `-m <provider/model#variant>` เช่น `zai-coding-plan/glm-5.3#high` | ฝังในชื่อ model ผ่าน `#variant` | default, low, high, max |

ข้อควรรู้ที่พิสูจน์แล้วจากการทดสอบจริง:

- **claude**: ยืนยันผ่าน `--output-format json` — `--model haiku` ได้ `claude-haiku-5-5` จริง และ JSON มี `total_cost_usd` ต่อ run ด้วย (เอาไปเก็บสถิติ cost ต่อ tier ได้)
- **codex**: header ของ `codex exec` พิมพ์ model/effort ที่ใช้จริงออกมาขณะรัน
- **codex (บัญชี ChatGPT)**: สลับ model ได้เฉพาะชื่อที่อยู่ใน `/model` ของ codex เอง ได้แก่ `gpt-6.1-sol` (default), `gpt-6-astra` (frontier), `gpt-6-sol`, `gpt-6-luna` (fast/cheap), `gpt-5.6-sol`, `gpt-5.6-terra`, `gpt-5.6-luna` — ชื่ออื่นเช่น `gpt-6.1-codex` หรือ `gpt-6.1` จะโดน API ปฏิเสธ (ตรวจรายชื่อล่าสุดได้จาก `/model` ใน codex interactive)
- **agy**: เป็น multi-provider (gemini/claude/gpt-oss) — ชื่อ model ฝัง effort ไว้ในตัวเลย เช่น `gemini-3.8-flash-low`, `claude-opus-5-5-high` (ดูทั้งหมดด้วย `agy models`) และ**ต้องวาง `--model` ก่อน `--print`** เพราะ `--print` จะกลืน argument ถัดไปเป็น prompt (baan-role จัดการลำดับนี้ให้อยู่แล้ว)
- **opencode**: รัน GLM ผ่าน **Z.AI Coding Plan (เหมาจ่าย cost 0 ต่อครั้ง)** — login ครั้งเดียวด้วย `opencode auth login` (เลือก Z.AI Coding Plan) · syntax variant `#low/#high/#max` มีตั้งแต่ **opencode 2.1.4** (ของเดิม 1.19.0 ส่ง effort ทาง CLI ไม่ได้) · ต้องมี opencode CLI ติดตั้ง (`npm i -g opencode-ai`)

tier ladder ปัจจุบัน (T1 = anchor ที่ Opus 5.5 high, ค่ายอื่นจัดตัวทัดเทียมตามระดับ, T0 = overdrive):

| tier | เหมาะกับ | claude | codex | agy | opencode |
|---|---|---|---|---|---|
| t0 | งานยากมาก "ไม่จบไม่สิ้น" ประเด็นซับซ้อน ต้องคิดลึกสุด | opus / max | gpt-6-astra / max | gemini-4-argon-high | — |
| t1 | งานคิดยาก ออกแบบสถาปัตยกรรม ตัดสินใจสำคัญ | opus / high | gpt-6-astra / high | gemini-4-argon-high | — |
| t2 | โค้ดซับซ้อน หลายไฟล์ มีเงื่อนไข | sonnet / high | gpt-6.1-sol / high | gemini-4-argon-medium | glm-5.3 / max |
| t3 | งานพัฒนาปกติ คุณภาพดี ราคาสมดุล | sonnet / medium | gpt-6.1-sol / low | gemini-3.8-flash-medium | glm-5.3 / high |
| t4 | งานประจำ เขียน test, refactor เล็กน้อย | haiku / medium | gpt-6-luna / high | gemini-3.8-flash-low | glm-5.3-flash / max |
| t5 | งานจำนวนมาก สรุป/จัดหมวด/ตอบคำถามง่าย | haiku / low | gpt-6-luna / medium | gemini-3.8-flash-low | glm-5.3-flash / high |

หมายเหตุ:
- **สลับตัวรันอัตโนมัติเมื่อติดโควตา (`_fallback` ต่อ tier ใน agents.json)**: ตัวรันที่สั่ง (defaults.agent หรือ `--agent`) เป็นตัวแรกเสมอ — ถ้าล้มเหลวด้วยข้อความโควตา/limit (เช่น `usage limit reached`, `rate limit`, `credits balance ... too low`) ระบบสลับไปตัวถัดไปตามลำดับ `_fallback` ของ tier นั้นทันที · **ล้มด้วยเหตุอื่นไม่สลับ** (กันเผาโควตาซ้ำหลายเท่า) · ตัวรันจริงและเส้นทางการสลับถูกบันทึกใน checkpoint และ summary
- **t3–t5 จัดคู่ model ให้ความสามารถใกล้กันใน tier เดียว** — สลับตัวรันตอนติดโควตาแล้วคุณภาพไม่ตกหนัก · agy ใช้ flash-low ซ้ำทั้ง t4/t5 เพราะขั้นความสามารถของ Gemini มีให้เลือกแค่นั้น (เช่นเดียวกับ argon-high ที่ซ้ำ t0/t1 — agy ไม่มี effort `max`)
- **`null` = ยังไม่มี model ทัดเทียมใน tier นั้น** — ใช้ `--all` แล้ว agent ตัวนั้นจะถูกข้ามอัตโนมัติพร้อมข้อความแจ้ง แต่ถ้าระบุ `--agent <name>` ตรงๆ จะ error ทันที
- **t0 ยืด timeout อัตโนมัติเป็น 3600 วินาที/agent** (ปกติ 1800) เพราะงานหนักกินเวลานาน — override ด้วย `--timeout` ได้เสมอ (ตั้งที่ `"_timeoutSec"` ใน tier)
- effort `xhigh`/`max` ของ codex กินโควตา ChatGPT เร็วกว่าปกติ — ใช้เฉพาะ t0 จริงๆ
- agy มี `gpt-oss-120b-medium` (open-weight ราคาถูกมาก) เผื่อทำ tier สำหรับงานจำนวนมาก
- แก้/เพิ่ม tier ได้ที่ส่วน `"tiers"` ใน `agents.json` · ชื่อ model ล่าสุดของแต่ละค่ายเช็คได้เสมอ (เช่น `agy models`)

## ตัวรัน AI CLI: ความปลอดภัยและสิทธิ์

| Agent | คำสั่งที่ baan-role ใช้ | รับ prompt ทาง | คำตอบอ่านจาก |
|---|---|---|---|
| claude | `claude -p --output-format text --allowedTools <ตามโหมด>` (write เพิ่ม `--permission-mode acceptEdits`) | stdin | stdout |
| codex | `codex exec --skip-git-repo-check -s read-only -o <answer.txt> -` | stdin | ไฟล์ answer.txt (option `-o`) |
| agy | `agy --add-dir <ราก workspace> --agent baan-readonly --print` (write: `--mode accept-edits --print`) | argument (spawn ตรง ไม่ผ่าน shell) | stdout |
| opencode | `opencode run -m <provider/model#variant>` (write เพิ่ม `--auto`) | stdin | stdout |

- ส่ง prompt ทาง **stdin** เมื่อทำได้ เพื่อเลี่ยงปัญหาการ quote อักขระพิเศษบน Windows
- โหมดเริ่มต้น **read-only** — ป้องกัน agent แก้ไฟล์โดยไม่ตั้งใจ จะเปิด `--write` เมื่อไรก็ตั้งใจ
  - แต่ละค่ายบังคับ read-only ต่างกัน: codex = sandbox `-s read-only` · agy = `--agent baan-readonly` (profile ระดับผู้ใช้ที่ตัดเครื่องมือเขียนออก + guard hook ยืนยันว่ารันได้แค่คำสั่งอ่าน) · claude = `--allowedTools` เฉพาะ Read/Grep/Glob + คำสั่งอ่านอย่างเดียว (git status/log/diff/show ฯลฯ) — claude ใน read-only จึง**รัน node/npm ไม่ได้โดยตั้งใจ** · opencode = ไม่ใส่ `--auto` ในโหมดอ่าน — non-interactive ที่ไม่มี `--auto` จะปฏิเสธการกระทำที่ต้องขออนุญาต (เช่น แก้ไฟล์) ให้เอง (โหมด write จึงต้องใส่ `--auto` เพราะไม่มีคนกดอนุมัติกลางทาง)
  - **agy ต้องติดตั้ง profile `baan-readonly` ครั้งเดียวต่อเครื่อง** — ไฟล์และขั้นตอนอยู่ที่ `setup/agy/README.md` (ไม่มี profile = agy ล้มทุกงาน read-only และไม่สลับตัวรันให้)
  - **agy ในโหมด headless อ่านไฟล์นอก cwd ไม่ได้** — นายช่างจึงส่ง `--add-dir <ราก workspace>` ให้ agy **เฉพาะโหมดอ่าน** (ค้นรากจาก baan.config.json ที่เดินขึ้นจาก cwd) · โหมด `--write` ไม่ส่ง เพราะ `--add-dir` ขยายขอบเขตการเขียนตามไปด้วย — งานเขียนที่ต้องอ่านไฟล์นอก cwd ให้ฝังเนื้อหาไว้ใน task หรือรันโหมดอ่านแยกก่อน
  - `-p` ของ claude ไม่มีคนกดอนุมัติ: tool ที่ไม่อยู่ใน `--allowedTools` ใช้ไม่ได้เลย — โหมด write จึงเปิด Edit/Write/Bash/PowerShell ให้ชัด
- **ทดสอบตัวรันจริงทุกค่าย**: `npm run smoke:live -- [--tier t3] [--agents claude,codex,agy]` (ใช้โควตาจริง 2 session/ค่าย ไม่อยู่ใน `npm test`) — sandbox ปลอมเป็นรูป workspace จริง (มี `baan.config.json` ที่ราก + ไฟล์ลับนอก cwd) แยกต่อค่าย/โหมด ตรวจด้วยค่าที่เดาไม่ได้: อ่านไฟล์ใน cwd และนอก cwd (nonce) · คำสั่งอ่านอย่างเดียว (commit hash) · รันโค้ด (sha256) · read-only กันเขียนจริง (ตรวจบนดิสก์) · `--write` เขียนไฟล์ได้ · role ไม่รายงาน `DONE` เกินจริง
- ทุก run เก็บรายงาน (answer, stdout, stderr, exit code, ระยะเวลา) ไว้ใน `reports/<timestamp>-…-<สุ่ม>/`
- เกิน timeout (default 1800 วินาที/ตัว, t0 3600 วินาที) จะถูก kill ทั้ง process tree อัตโนมัติ · เป็น timeout ของ AI CLI job เท่านั้น

## สถานะการทดสอบ

- **`npm test`** — regression ทั้งหมด (node:test ล้วน ไม่ยิง provider จริง ไม่ใช้โควตา) ต้องเขียวทุกครั้งก่อน commit
- **`npm run smoke:live`** — ทดสอบตัวรันจริงทุกค่ายด้วยโควตาจริง: อ่านไฟล์ใน/นอก cwd, คำสั่งอ่านอย่างเดียว, โหมดอ่านกันเขียนจริง, `--write` เขียนได้ (ดูรายละเอียดหัวข้อ "ตัวรัน AI CLI")
- ผลทดสอบย้อนหลังราย release: `RELEASE-NOTES.md`

## เพิ่ม/แก้ agent

แก้ไขที่ `agents.json` — กำหนดคำสั่ง, flag สำหรับโหมด read/write, ช่องทางรับ prompt และจุดอ่านคำตอบได้หมด เช่น เพิ่ม `gemini -p` หรือสลับ model ด้วย `--model`

## ข้อควรระวัง

- ทุกครั้งที่รันคือการใช้ token/โควตาของบัญชีเจ้าของ CLI นั้นๆ
- โหมด `--write` ให้ agent แก้ไขไฟล์ใน `--cwd` ได้ ควรรันใน git repo เพื่อย้อนดู diff ง่ายๆ
- codex บนเครื่องนี้มี MCP server (figma) ที่ auth ไม่ผ่าน จะเห็น error ใน stderr แต่ไม่กระทบผลลัพธ์

## ไอเดียต่อยอด

- เก็บผลลัพธ์ของแต่ละ task เป็น artifact ตามโครงสร้างที่เก็บเอกสาร (requirement/ design/ check/ ฯลฯ) อัตโนมัติ
- ให้ นายช่าง เลือก agent ราย task ตามความเหมาะสม (เช่น งานเขียนโค้ดให้ตัวที่ถนัด) หรือรันซ้ำเมื่อคำตอบไม่ผ่านเงื่อนไข
- ต่อยอดเป็น MCP server เพื่อให้ AI session ใดก็เรียกทีมนี้เป็น tool ได้

## Change Log

- 2026-10-24 — ผ่อนกติกา check/jpo ในโหมด solo: subagent ตรวจได้แบบมีเงื่อนไขความเป็นอิสระ (ตัวใหม่ + AC/spec เท่านั้น + หลักฐานจริง) ข้ามโมเดลเหลือเป็น escalation สำหรับงานวิกฤต/security/FAIL ซ้ำ

- 2026-10-24 — ขยายโหมด solo: session ที่สวม นายช่าง แตก role เป็น subagent/งานเบื้องหลังของตัวเองได้ (ใช้กับแอปไม่มี CLI เช่น ZCode) — runner ภายนอกเหลือเฉพาะงานตรวจของตัวเอง/tier t0/t1

- 2026-10-24 — เพิ่มโหมด solo ใน charter นายช่าง: ผู้ใช้สั่งได้ให้ session ที่สวม นายช่าง ทำงาน role เอง (ส่งต่อ baan-role เฉพาะงานตรวจของตัวเองและ tier t0/t1)

- 2026-10-24 — เพิ่มกติกา related-impact sweep ใน charter นายช่าง (BAAN.md), planner prompt และ roles/plan.md — งานที่เปลี่ยนสิ่งที่ถูกอ้างอิงต้องกวาดแก่เอกสารผู้อ้างอิงทุกจุดตามเจ้าของไฟล์

- 2026-10-23 — เพิ่ม DBML แบบเต็ม/ภาพ integration เป็นผลส่งมอบคู่ data model พร้อมบทบาทตรวจและหลักฐาน parser

- 2026-10-23 — แก้ข้อขัดแย้ง auto-commit knowledge และเพิ่มขั้นปิดงานหลังนายช่างบันทึกเอกสารครบ

- 2026-10-23 — เพิ่มมาตรฐานเอกสารข้อมูลและหน้าที่ arch/vault/inspect/check ให้ส่งต่อแบบอ่านเข้าใจและตรวจย้อนกลับได้
