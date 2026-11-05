# Release Notes — BAAN

ใหม่สุดไว้บนสุด · เวอร์ชันอยู่ที่ `package.json`

## 0.28.0 — 2026-11-05 · วัดได้ว่าเวลาไปไหน และเลิกเสียเวลากับ sandbox

ที่มา: วิเคราะห์ run จริงของ school-bot 133 call — ไม่สำเร็จ 43% และครึ่งหนึ่งของนั้นเกิดจาก sandbox/สิทธิ์/เครื่องมือ ไม่ใช่ตัวงาน, ขนานจริงเฉลี่ยแค่ 1.3–1.65 จาก 3 slot, CONVENTIONS 17 KB แนบเต็มทุก call และไม่มีข้อมูลพอจะบอกว่าเวลาไปไหน

### ⚠ ต้องทำตอนอัปเกรด

- **โหมดเขียน (`--write`) ไม่มี sandbox แล้วทุกค่าย** — codex `--dangerously-bypass-approvals-and-sandbox` · claude `--permission-mode bypassPermissions` · agy `--mode auto` · AI แก้ไฟล์และรันคำสั่งได้ทุกที่บนเครื่องเหมือน session ที่เปิดเอง ขอบเขตคุมด้วยใบงานเท่านั้น · ถ้าต้องการ sandbox แบบเดิม ใช้ `BAAN_AGENTS_FILE=<ไฟล์ agents ของตัวเอง>` · โหมดอ่านยังจำกัดเหมือนเดิม
- `baan --goal` ไม่มีขั้น PM (gm เขียน brief) แล้ว — goal ส่งให้ planner ตรง · run ใหม่ไม่มี `pm.answer.txt` · สคริปต์ที่อ่านไฟล์นี้ต้องแก้
- preflight เลิกตรวจ `write-outside` และ `git-parent` (เป็นข้อจำกัดของ sandbox โหมดเขียน) — ใบงานที่เคยต้องใส่ `--no-preflight` เพราะสองข้อนี้ไม่ต้องใส่แล้ว

### เพิ่ม

- **วัดเวลา**: `report.json` มี `startedAt`, `taskIds`, `promptBytes` และ `failureClass` ต่อผลลัพธ์ (แยก `ENVIRONMENT_FAILURE` ออกจาก `VERDICT_FAIL`/`NEEDS_*`/`RUNNER_FAILURE`/`TIMEOUT`) · ledger ราย call ที่ `<workspace>\reports\baan\ledger\YYYY-MM-DD.jsonl` · `node scripts/metrics.mjs [<reports dir>] [--json]` สรุปเวลาราย role, เหตุล้ม, เวลาที่เสียกับสภาพแวดล้อมและรอบแก้, การใช้ slot ต่อวัน
- `baan-role --task-id <id[,id...]>` ผูก call กับ task ในแผน
- `--usage` (`baan`, `baan-role`) เก็บ token จาก claude/codex/agy (claude มีค่าใช้จ่ายด้วย)
- `baan-role --probe "<cmd>"` รันคำสั่งตรวจสภาพแวดล้อมก่อนเปิด session — ล้มเพราะ feed/สิทธิ์/เครื่องมือ = exit 2 ไม่เปิด agent · ล้มเพราะเหตุอื่น (เช่น test แดงซึ่งเป็นงานของ role) เปิดต่อ
- env `BAAN_AGENTS_FILE` ใช้ชุดตัวรันอื่นชั่วคราวโดยไม่แก้ `agents.json` ของ package
- **role ใช้ subagent ของ CLI ได้** (CONVENTIONS §7 + หัวข้อ Subagents ใน `sys`/`front`/`check`): อ่าน/สำรวจ/ตรวจขนานภายใน role แทนการส่งงานข้าม session · เขียนได้ทีละตัวต่อ repo · ตัวที่ตรวจต้องใหม่และได้แค่ AC/สัญญา/path · ทดลองแล้วกับ codex t2 โหมดเขียน (t4/t5 และโหมดอ่านปฏิเสธ)

### เปลี่ยน

- สลับตัวรันเมื่อ CLI เริ่มทำงานไม่ได้ (codex `Access is denied` ตอนเริ่ม, claude โหลดตั้งค่าองค์กรไม่ได้, DNS ล้มภายใน 60 วินาทีแรก) — เดิมจบ failed ให้สั่งใหม่เอง · ล้มหลังทำงานไปนานไม่สลับ
- idle timeout: `idleTimeoutSec` ใน `agents.json` (codex 1200 วินาที) หยุด process ที่เงียบเกินกำหนด · claude/agy ไม่ตั้งเพราะไม่พิมพ์อะไรจนจบงาน
- `baan --goal`/`--plan-file`/`--resume`: เติม slot ทันทีที่ว่างแทนรอทั้ง wave จบ · งานที่มีงานอื่นพึ่งมากได้ก่อน · สรุปท้าย run แสดง "ขนานสูงสุด" แทนจำนวน wave
- อ่าน output state แม่นขึ้น: บรรทัดที่ขึ้นต้นด้วยสถานะชนะคำที่ถูกพูดถึงในประโยค · ไม่นับคำใน `code` · มีทั้งสำเร็จและไม่สำเร็จในประโยค = ไม่สำเร็จ (เดิมคำตอบ "BLOCKED … ขอให้จบด้วย `PASS`" ถูกนับว่าสำเร็จ) · คำตอบจริง 133 ตัวของ school-bot ได้สถานะเหมือนเดิมทุกตัว
- แต่ละ role ได้ CONVENTIONS เฉพาะหัวข้อที่ใช้: `sys`/`front` ไม่ได้ §3 §10 §12 §13 · `check` ไม่ได้ §3 — prompt ของ `sys` เล็กลง 39% (24.3 → 14.8 KB)

## 0.27.0 — 2026-11-03 · คนวางแผนรู้จักระดับการตรวจ

ที่มา: 0.26.0 ใส่ระดับการตรวจให้ check/inspect/writer แล้ว แต่คนวางแผน (gm, plan, planner ของโหมดอัตโนมัติ) ยังวางตรวจเต็มหลังทุก task อยู่ · อัปเกรดแล้วไม่ต้องทำอะไรเพิ่ม

### เพิ่ม

- โหมดอัตโนมัติ (`baan --goal`): task ในแผนใส่ `"testLevel": "full"` ได้ ให้ full pass อยู่ในแผนเดียวกับงาน dev (ไม่ใส่ = ระดับของ run) · ค่าผิด = แผนไม่ผ่าน validation · planner ถูกสั่งให้วาง full pass ท้ายแผน

### เปลี่ยน

- gm และ plan ไม่วางตรวจละเอียดหลังทุก task · ปิด scope ด้วย full pass หนึ่งรอบ (inspect + check ระดับ full ราย module/flow + jpo) แล้วตามด้วยใบแก้ใบเดียวต่อเจ้าของต่อ module · gm ลง `test_level` ใน ledger

## 0.26.0 — 2026-11-03 · พัฒนาให้จบก่อน แล้วค่อยตรวจเต็มรอบเดียว

ที่มา: school-bot ตรวจเต็มทุก task ทันทีที่เขียนเสร็จ งาน License (BE-003/004) วนแก้เคส race/replay จนติดเพดาน ขณะที่อีก 75 task ยังไม่ได้เริ่ม ผู้ใช้ขอให้พัฒนาให้จบก่อน แล้วค่อยตรวจเต็มและแก้ทีเดียว

### ⚠ ต้องทำตอนอัปเกรด

- **ค่าเริ่มต้นของการตรวจเปลี่ยนเป็น `normal`** — ระหว่างพัฒนา check ไม่ไล่ edge case แล้ว ถ้าอยากได้แบบเดิมใส่ `"test_level": "full"` ใน `defaults` ของ `baan.config.json`
- ตอนตรวจผ่านระดับ normal ให้ลง `"test_level": "normal"` ที่ task/slice ในแผน JSON ด้วย ไม่งั้น lint จะนับว่าผ่าน full แล้ว
- แผนเดิมที่ผูกงานพัฒนาไว้หลัง QA ของ License/Login/DB: รัน `baan --lint-plan` แล้วปรับ dependency และใบงานตามคำเตือน โดยรักษา IDs, AC, findings และ release scope เดิม

### เพิ่ม

- **ระดับการตรวจ `normal`/`full`** (charter ข้อ 14)
  - `normal` (ระหว่างพัฒนา): check ตรวจ happy flow ของ AC ทุกข้อ + build/test อัตโนมัติ · ของที่เจอนอกทางหลักจดเป็นรายการรอ full pass ไม่ตกและไม่เปิดรอบแก้ · ไม่เปิด jpo
  - `full` (พัฒนาครบแล้ว / ก่อน release): ตรวจเต็มรอบเดียวทั้ง scope แล้วรวม finding เป็นใบแก้ใบเดียวต่อเจ้าของต่อ module · ก่อน release ต้องผ่าน full
  - ตั้งที่ `defaults.test_level` ใน config ของ workspace หรือ `--test-level normal|full` ของ `baan`/`baan-role` · baan-role ใส่ระดับเข้าใบงานของ inspect/check/sys/front ให้เอง และบันทึกไว้ใน `report.json`
  - inspect ติดป้าย `normal`/`full` ให้ทุกเคส · writer ลองเองเฉพาะเคสของระดับที่สั่ง
  - `baan --lint-plan` อ่าน `test_level` ใน ledger ของ task/slice: เตือน verified ที่ยังเป็น normal และ error เมื่อค่าผิด · ledger เดิมที่ไม่มีฟิลด์นี้ถือว่าตรวจ full แล้ว
- `baan --lint-plan` เตือนงานพัฒนาที่รอ check/jpo ให้ทบทวน dependency (ไม่ข้าม dependency ให้เอง)

### เปลี่ยน

- นายช่าง, plan, gm และ planner อัตโนมัติเดินงานพัฒนาทุกส่วนที่พร้อม โดยแยกงานบนสัญญา/ข้อมูลจำลองเฉพาะ development ออกจากงานเชื่อมระบบจริงและตรวจรับ
- QA ของ License/Login/DB และงานที่แก้ครบเพดานไม่หยุดทั้งแผน: แจ้งผู้ใช้ทันทีและพักเฉพาะงานที่ต้องใช้ผลจริง งานอื่นเดินต่อ พร้อมเก็บผู้รับผิดชอบและเงื่อนไขปิด QA ค้าง
- done-local ยังต้อง build/test ผ่านและลอง flow หลัก; verified, security และประตู release คงเดิม ข้อมูลจำลองไม่ใช้กับ production ข้อมูลจริง หรือหุ่นจริง
- `baan-role` ไม่ระบุ `--agent` = ใช้ `defaults.agent` ของ workspace (เดิม exit 2)

## 0.25.0 — 2026-11-03 · ลดเวลาที่เสียไปกับรันเปล่าและรอบแก้งาน

ที่มา: ข้อมูลการรันของ school-bot ตั้งแต่ 26 ต.ค. ถึง 3 พ.ย. ตัวการตรวจเองไม่ได้เปลือง แต่มีสองก้อนที่เปลือง ก้อนแรกคือรันที่จบ BLOCKED เพราะ sandbox ขวาง กินราว 19% ของเวลา agent ก้อนที่สองคือเวลาแก้งานรวมกันมากกว่าเวลาเขียนรอบแรก ต้นเหตุคือ writer กับ check ทดสอบกันคนละ setup, บั๊กแบบเดิมโผล่ซ้ำ, ปัญหาเชิงออกแบบถูกส่งให้ writer เดาแก้ และงานความเสี่ยงสูงถูกเขียนด้วย model รุ่นเล็ก

### ⚠ ต้องทำตอนอัปเกรด

- **`baan-role` อาจจบด้วย exit 2 ก่อนเปิด session** ถ้าใบงานจะติด sandbox แน่ๆ (ดูหัวข้อ "เพิ่ม") ให้แก้ใบงาน, `--cwd` หรือ `--write` ตามข้อความ ถ้าตรวจแล้วว่าเตือนผิดให้ใส่ `--no-preflight`
- **รัน `baan --lint-plan` กับแผนที่มีอยู่** ถ้าเจอคำเตือน "task high ที่ writer ใช้ tier ต่ำกว่า t2" ให้แก้ `tier` ของงานนั้นในแผนเป็น t2
- **writer (`sys`/`front`) ต้องลอง test-plan case เองก่อนส่งงาน** เดิมห้าม writer เขียน test ตอนนี้ต้องลองตาม setup ที่ระบุไว้ (test ที่ใช้ตัดสินผลยังเป็นของ check) ใบงานจึงต้องแนบ setup ของแต่ละ case ไปด้วย ไม่ใช่แค่ id

### เพิ่ม

- **preflight ของ `baan-role`** ตรวจใบงาน (รวมไฟล์ `.txt` ที่ใบงานอ้างถึง) ก่อนเปิด session แล้วหยุดทันทีเมื่อเจอ:
  - `read-build` — สั่ง build หรือรัน test ในโหมดอ่าน
  - `write-outside` — โหมดเขียน แต่ให้สร้างไฟล์นอก `--cwd`
  - `git-parent` — โหมดเขียน และให้อ่านประวัติ git ขณะที่ cwd อยู่ใต้ราก repo
  - ลองย้อนกับ 70 รันจริงของ school-bot: จับรันที่ล้มได้ 8 จาก 10 (อีก 2 คือโควตาหมดกับ API ล่ม)
- `--no-preflight` สำหรับข้ามการตรวจนี้
- `baan --lint-plan` เตือนงาน `risk: high` ของ `sys`/`front` ที่ตั้ง tier ต่ำกว่า t2

### เปลี่ยน

- **ใบงานเดียวกันถึงทั้ง writer และ check** oracle pack คัดลอก setup และผลที่คาดของแต่ละ test-plan case ไปด้วย และ `inspect` ต้องเขียน setup ให้รันตามได้ เช่น จำนวน host, ใช้ store ร่วมไหม, actor, จุดที่ทำให้ fail
- **checklist บั๊ก 4 แบบ** ให้ writer ไล่เช็กก่อนส่ง และให้ check ใช้เป็นเป้าแรก: idempotency key ไม่ผูกเจ้าของ/เนื้อหา · คำขอที่ถูกปฏิเสธยังแก้ข้อมูล · บันทึกหลายขั้นค้างครึ่งทาง · กติกาที่ถือได้แค่ใน process เดียว
- **check ติดป้าย `fix: code` / `fix: design`** ทุก finding ที่ตก ถ้าเป็น design นายช่างส่ง `arch` ตัดสินก่อนให้ writer แก้ และรอบของ arch ไม่นับเป็นรอบแก้
- **บันไดของรอบแก้**: งาน high เริ่มที่ t2 · ตกด้วย `fix: code` ให้ขยับ tier แรงขึ้นหนึ่งขั้น · ขยับแล้วยังตกให้แก้ต้นเหตุที่ระบบก่อนเปิดรอบสุดท้าย · จดผลแต่ละรอบลง memory `status.md`
- charter: นิยาม slot คือ `max_parallel` ของ workspace และห้ามยกสถานะโควตาจาก run ก่อนมาเป็นกติกา
- charter บอกชัดว่า agent คือการเลือกค่าย ส่วนฝีมือของ model มาจาก tier (เดิมเขียนว่า agy เป็น gemini-4-argon ทุก tier ทั้งที่ t3–t5 เป็น gemini-3.8-flash นายช่างจึงเลือก agy t3 มาเขียนงานความเสี่ยงสูงมาตลอด)
- ทดสอบผ่าน 168 รายการ

## 0.24.0 — 2026-11-02 · ทีมออกแบบและ knowledge แบบ project/module

- เพิ่มทีมออกแบบ survey/ui/review และ /pencil สำหรับคุย requirement สด พร้อมคลังความรู้ UX แยกแพลตฟอร์ม
- เพิ่ม layout project, --module, --index และ --lint-knowledge รวมถึงตรวจ module ในแผน และแยก auto-commit ระดับ project กับ module
- --init รองรับ --workspace, --knowledge-git และ --memory-git พร้อมติดตั้งทางเข้าทีมออกแบบและ skill โดยรักษาไฟล์ของผู้ใช้
- แก้ตรวจลิงก์ที่มีช่องว่างและเลขบรรทัดไม่ให้รายงานผิด
- layout เดิมยังใช้ได้โดยไม่ต้องเปลี่ยน config
- ทดสอบผ่าน 159 รายการ

- **changelog ของ module อ่านรู้เรื่อง** แทนบรรทัดสั้นที่คั่นด้วยจุด changelog จัดเป็นหัวข้อตามวัน การแก้ที่เปลี่ยนความหมายแต่ละครั้งบอกว่าเดิมเป็นอย่างไรและตอนนี้เป็นอย่างไร พร้อม Rev และใครแก้/ใครขอ ส่วนงานจัดรูปแบบที่ความหมายไม่เปลี่ยนรวมเป็นรายการเดียวต่อรอบ จะได้ไม่กลบการแก้จริง
- ตอนเรียบเรียงไฟล์ที่ยังมี `## Change Log` role ต้องย้ายประวัติเดิมเข้า changelog ของเดือนนั้นก่อน ห้ามลบทิ้งเฉยๆ
- `changelog/` ของ module เป็นของร่วม ทุก role ที่เขียน knowledge เพิ่มรายการของตัวเองได้ แต่ห้ามแก้รายการของคนอื่น

## 0.23.0 — 2026-11-02 · แยก memory ออกจาก knowledge, กติกาเอกสารที่คนอ่านรู้เรื่อง, README ใหม่

ที่มา: เอกสารใน knowledge ของ school-bot ใช้ร่วมกับคนอื่นไม่ได้ ไฟล์ 255 จาก 707 เป็นใบงานและหลักฐานของทีม AI ส่วนเอกสารที่เหลือซ้อนเป็นชั้น "Override RevN", อ้าง ID โดยไม่บอกความหมาย และมี Change Log ในทุกไฟล์ ต้นเหตุคือกติกาเดิมสั่งให้ทุก output ลง knowledge และให้ "แก้เฉพาะจุด + เพิ่ม Change Log ทุกครั้ง"

### ⚠ ต้องทำตอนอัปเกรด

- **คำสั่ง `mycelium` และ `mycelium-role` ถูกลบ** ใช้ `baan` และ `baan-role` แทน หลังอัปเดตให้รัน `npm link` ใหม่ในโฟลเดอร์ `baan/` เพื่อล้างลิงก์ของคำสั่งเก่า
- **BAAN ไม่หา config ชื่อเก่าแล้ว** (`mycelium.config.json`, `mycelium/mycelium.json`, env `MYCELIUM_CONFIG`) และ `baan --init` ไม่ย้ายให้ ถ้ายังใช้ชื่อเก่าอยู่ ให้เปลี่ยนชื่อไฟล์เป็น `baan.config.json` เอง
- **กติกาเอกสาร knowledge เปลี่ยน** เอกสารที่ role เขียนหลังอัปเกรดจะไม่มี `## Change Log` ท้ายไฟล์ ประวัติไปอยู่ที่ `changelog/YYYY-MM.md` ของแต่ละ module แทน ของเดิมไม่ต้องแก้ทันที แต่จะถูกเรียบเรียงใหม่เมื่อมีงานแตะไฟล์นั้น
- **memory_root ไม่ตั้งก็ทำงานแบบเดิม** (ทุกอย่างลง knowledge) ถ้าจะใช้ ให้สร้างโฟลเดอร์ใต้ราก workspace (เช่น `C:\src\schoolbright\memory`) แล้ว `git init`, ใส่ `"memory_root"` ใน knowledge root ของ `baan.config.json`, รัน `baan --list` ให้ไม่มีคำเตือน แล้วย้ายใบงาน ผลตรวจรายรอบ และหลักฐานเดิมออกจาก knowledge

### เพิ่ม

- `memory_root` ต่อ knowledge root ใน config สำหรับเก็บสิ่งที่ทีม AI ใช้ทำงานต่อ (ใบงาน, การ์ด task, คิว, แผน JSON, ผลตรวจรายรอบ, หลักฐาน, `status.md`) แยกจากเอกสารที่คนอ่าน `baan --list` เตือนถ้า path ไม่มี, ไม่ใช่ git repo, อยู่ใน knowledge หรืออยู่นอก workspace (agy อ่านไม่ได้)
- auto commit ครอบ memory repo ด้วย แยก commit ตาม module เหมือน knowledge (log ขึ้นต้น `<root>-memory:`)
- `baan --sweep` ข้ามโฟลเดอร์ `changelog/` เพราะเป็นประวัติ ไม่ใช่จุดที่ต้องตามแก้

### เปลี่ยน

- **CONVENTIONS หัวข้อ 3 เขียนใหม่** ผู้อ่านเอกสาร knowledge คือ dev ในทีมที่ไม่เคยรัน BAAN
  - ID ต้องบอกความหมายตอนอ้างครั้งแรก และตัวย่อต้องอธิบาย ไม่ใช้ศัพท์ของ run (wave, slice, oracle) ใน knowledge
  - แก้ไฟล์ให้ทั้งไฟล์เป็นข้อมูลปัจจุบัน ห้ามต่อท้ายด้วย "Override RevN" หรือ "Precedence"
  - หัวไฟล์มีบรรทัดเดียวบอก Rev, วันที่แก้ล่าสุด, ใครแก้, ใครขอ ส่วนประวัติเต็มอยู่ใน `changelog/YYYY-MM.md`
  - `path:line` ไปไว้หัวข้อ `## หลักฐาน` ท้ายไฟล์ สมมติฐานไปไว้ `## ยังไม่ยืนยัน`
  - `requirement/decisions.md` สรุปมติที่ใช้อยู่ตอนนี้
  - ใช้ศัพท์อังกฤษได้ถ้าชัดกว่าคำไทย
- **knowledge กับ memory แยกกัน** ก่อนเขียนไฟล์ role ต้องถามว่า "คนที่ไม่ได้รัน BAAN ต้องใช้ไฟล์นี้ไหม" knowledge อ้างของใน memory เป็นข้อความ ไม่ใช่ลิงก์ `check` เขียนผลตรวจลง memory, `gm` เก็บการ์ด task และ JSON ใน memory ส่วน `plan/index.md` อยู่ knowledge
- ตัด Change Log ออกจาก CONVENTIONS, BAAN.md และไฟล์ role ทุกไฟล์ เพราะไฟล์พวกนี้ถูกแนบเข้า prompt ทุกครั้ง
- README ราก repo และ `baan/README.md` เขียนใหม่ให้คนใหม่อ่านรู้เรื่อง (จาก 66 KB เหลือราว 22 KB)

### ลบ

- คำสั่ง `mycelium`, `mycelium-role` และทุกอย่างที่เกี่ยวกับชื่อเดิม (ดูหมวด ⚠)
- `demo-notes.md` และ `docs/` ออกจาก git

ชื่อ role แบบเก่า (`be`, `fe`, `qa` ฯลฯ) ยังใช้ได้ในแผนเดิม

tests 140 → 142

## 0.22.0 — 2026-10-29 · จัด model ต่อ tier ตามชนิดงานและความคุ้มค่า (ทุกค่าย)

ที่มา: `docs/tier-selection-prompt.md` — ให้แต่ละค่ายเลือก model/effort ที่เบาที่สุดซึ่งทำงานระดับนั้นได้ดี แทนการจัดตัวให้ "ทัดเทียม" Opus · Intelligence Index เป็นข้อมูลประกอบ (AA v5.0 ณ 2026-10-29 ชุดเดียวทั้งตาราง) · ยังไม่ได้วัดคุณภาพ/โควตากับงาน BAAN จริง

### ⚠ ต้องทำตอนอัปเกรด
- **tier ที่เป็น `null` ใหม่: agy t0 · opencode t0/t1/t2** — สั่ง `--agent agy --tier t0` หรือ `--agent opencode --tier t0|t1|t2` ตรงๆ จะ error ทันที (ใช้ `--all` ข้ามให้เอง) · ใบงาน/แผนที่ผูก agent เหล่านี้กับ tier ดังกล่าวต้องเปลี่ยน agent หรือ tier
- **fallback สั้นลง** — t0 เหลือ codex→claude · t1/t2 เหลือ codex→agy→claude (opencode ถูกข้าม)
- **model เริ่มต้นเปลี่ยน** — ใครที่ override `tiers` เองใน config ของ workspace ไม่กระทบ · ที่ใช้ค่า package จะเห็นโควตา/เวลาเปลี่ยน (เช่น claude t2 เป็น Opus แทน Sonnet)

### เปลี่ยน
- **codex** — t1 `gpt-6.1-sol/high` (เดิม astra) · t2 sol/medium · t3 `gpt-6.1-terra/medium` · t4 luna/medium · t5 luna/low · t0 คง astra/max
- **claude** — t0 `opus/xhigh` (เดิม max: ได้ +1 คะแนนแต่ช้ากว่า ~6 เท่า — max เป็น override รายงาน) · t2 `opus/medium` (เดิม sonnet/high: 48 vs 41) · t3 `sonnet/high` (เดิม medium: 41 vs 30) · t1/t4/t5 คงเดิม
- **agy** — t0 `null` (argon-high คือเพดาน Gemini ใน `agy models` และใช้ที่ t1 แล้ว) · t1–t5 คงเดิม
- **opencode (GLM)** — t0–t2 `null` (GLM-5.3 max ได้ 32 บน v5.0 ต่ำกว่า t1/t2 ค่ายอื่น 46–52) · t3 `glm-5.3-flash#high` · t4/t5 `glm-5.3-flash#low` (เดิม flash#max/#high — effort สูงสุดกับงานตามแบบ)
- README tier ladder + หมายเหตุรายค่าย · tests ปรับตามผังใหม่ (140 เท่าเดิม)

## 0.21.1 — 2026-10-29 · DAG lint: งานที่ verified แล้วไม่ขวางงานที่พึ่ง

ที่มา: re-gate แผน school-bot — SA-002/UX-002/UX-004 ตรวจผ่านแล้วแต่ `--lint-plan` ยังนับ gate ของมันว่าขวางงาน implement ที่พึ่ง 31 งาน

### แก้
- **`--lint-plan` / DAG lint** — task ที่ verified แล้ว (รวม verified ตาม `slices`) ไม่นับว่าติดประตูและไม่ส่งต่อการติดประตูให้งานที่พึ่ง เพราะผ่านประตูของมันมาแล้ว · งานที่ยังไม่ verified ขวางเหมือนเดิม
- ผลข้างเคียงที่ตั้งใจ: แผนที่เคย exit 1 เพราะงานที่เสร็จแล้วอาจผ่านได้ — ไม่มีอะไรต้องทำตอนอัปเกรด
- tests 139 → 140

## 0.21.0 — 2026-10-29 · ตรวจตามความเสี่ยง (risk-gated waves) + run dir ย้ายเข้า workspace

ที่มา: ผลวิเคราะห์ workflow (`docs/workflow-verification-analysis.md`) — school-bot ใช้เวลาตรวจ (451 นาที) เท่าเวลาเขียนโค้ด (453 นาที) · งานเอกสารกินเวลา agent 44% · 35/110 task ไม่มี AC ผูก รวมงานฐานรากที่มีงานพึ่งทางอ้อม 79–89 งาน · และ agy โหมดเขียนอ่านคำตอบ role ก่อนหน้าใน `reports/` ของ package ไม่ได้

### ⚠ ต้องทำตอนอัปเกรด
- **run dir ย้ายไปอยู่ที่ `<ราก workspace>/reports/baan/`** (เดิม `reports/` ของ package) — ใบงาน/prompt ที่อ้าง path reports ของ package ต้องเปลี่ยน (schoolbright ตรวจแล้ว ไม่มีที่อ้าง) · ถ้าราก workspace เป็น git repo ให้ใส่ `reports/` ใน .gitignore · หา workspace ไม่เจอ = ใช้ `reports/` ของ package เหมือนเดิม · `--resume` รับ path จึง resume run เก่าใน package ได้
- **allow-rule `read_file(<baan>/reports)` ของ agy ไม่จำเป็นแล้ว** — `setup/agy/grant-read.mjs` ให้แค่ราก workspace (rule เดิมที่ตั้งไว้ไม่เป็นอันตราย ลบทิ้งได้)
- **`--lint-plan` มี warning ใหม่** (ไม่กระทบ exit code) — แผนเก่าที่ไม่มีฟิลด์ใหม่จะเห็น warning เรื่อง `ac_ids`/`risk`/`oracle` แต่ไม่ตก

### เพิ่ม
- **charter ข้อ 13 "ตรวจตามความเสี่ยง"** — ค่าตรวจขึ้นกับความเสี่ยงของ task ไม่ใช่จำนวน task:
  - **oracle pack** = หัวข้อ Acceptance/References ของ `<task-id>.md` (AC ตามต้นฉบับ + revision ที่ตรึง + TP case ids + non-goals) ใช้แทนการอ่าน docs เต็มทุก task · อ่านใหม่เฉพาะ revision เปลี่ยน / NEEDS_*_CHANGE / pack ตอบไม่ได้ / ตรวจปิดโปรเจกต์
  - **`risk: high`** ตรวจทันทีก่อนเปิดงานต่อยอด · **`risk: low`** รอ **wave gate** (check ใบเดียวต่อ wave, verdict ยังราย task) · สายเดี่ยว module เดียวตรวจอิสระแค่แกนเสี่ยงสุด + ทางออกของสาย
  - **ledger** `oracle` + `ref` บนงานที่ verified — ไม่เปลี่ยน = ไม่ตรวจซ้ำ
  - **ขอบเขตตรวจซ้ำเมื่อ task ล้มเหลว** ตามต้นเหตุ (ในตัว task / interface ที่ใช้ร่วม → `baan --sweep` / task ก่อนหน้า → เปิดตาม oracle เดิมของมัน / ของกลาง → full regression ด้วยเครื่อง)
  - full regression เมื่อ: แตะของกลาง · ก่อน release/merge · ไม่มี coverage map · fix ≥ 3 จุดใน wave
  - pipelining: wave ถัดไปเปิดงานที่ input ตรวจแล้วได้เลย · ห้ามต่อยอด task high ที่ยังไม่ผ่าน
  - จังหวะ test: เคสจาก AC ก่อนเขียนโค้ด · contract test ก่อนผู้ใช้ interface เริ่ม
- **ฟิลด์ใหม่ในแผน JSON** (optional ทั้งหมด): `"risk": "high"|"low"`, `"wave": <จำนวนเต็มบวก>`, `"oracle"`, `"ref"` (ระดับ task หรือ slice)
- **verification lint ใน `--lint-plan`** — สรุป high/low/wave เมื่อแผนใช้ฟิลด์ · **error** เมื่อ `risk`/`wave` ค่าผิดหรือ wave ย้อน dependency · **warning** เมื่อ task ยังไม่ verified ไม่มี `ac_ids`, ฐานรากไม่มี `risk` (เรียงตาม fan-out ทางตรง+ทางอ้อม), verified ไม่มี `oracle` หรือมีแต่ไม่มี `ref`, งานที่ลง done-local ทั้งที่ task high ที่พึ่งยังไม่ผ่าน, wave เกิน 6 task

### เปลี่ยน
- **run dir** สร้างใต้ `<ราก workspace>/reports/baan/` ทั้ง `baan` และ `baan-role` — role ถัดไป (รวม agy ที่สิทธิ์อ่านผูกกับ workspace) อ่านคำตอบของ role ก่อนหน้าได้โดยไม่ต้องขยายสิทธิ์
- **role gm** กำหนด `risk`/`wave` ต่อ task, เก็บ oracle pack, ลง ledger, release runbook รวมการตรวจปิดโปรเจกต์ (full regression + E2E + AC trace เทียบต้นฉบับ + security) · **role plan** เสนอ risk/wave พร้อมเหตุผล · **role check** ตัดสินจาก pack และรับ wave gate หลาย task ในใบเดียว
- tests 129 → 139

## 0.20.0 — 2026-10-28 · งานต้องจบได้: check มีขอบเขต + เส้นชัยตรึงต่อ task + ถามทันทีเมื่อติดเพดาน rework + สถานะราย slice

ที่มา: วิเคราะห์ school-bot — 91 ใบงานแต่ไม่มีงานโค้ด verified/done-local สักงาน · check gRPC logout สร้างเคสเองถึง 2222 เคสแล้วตกที่ header ซ้ำของ test server หลังแก้ 2 รอบ · เรื่องติดเพดานถูกพักไว้ "ท้ายวง" ที่ไม่เคยมาถึง · วันเดียวมี check 31 runs/267 นาทีเทียบ writer 26 runs · คิวบอก 21 งาน local ready แต่ JSON ไม่มี done-local สักงาน

### ⚠ ต้องทำตอนอัปเกรด
- **prompt รันต่อของ workspace** (เช่น `CONTINUE-NORMAL.md`/`CONTINUE.md`) ที่สั่ง "ถามประตูมนุษย์ทีเดียวตอนจบ" ต้องเพิ่มข้อยกเว้น: ติดเพดาน rework = หยุดเปิดงานใหม่แล้วถามทันที · ใบงาน check/jpo ต้องระบุ oracle (AC ids + test-plan cases + revision ของ design) · ลง done-local/verdict ราย slice ในไฟล์แผน (schoolbright แก้แล้ว)
- **`baan --lint-plan` exit 1 เพิ่ม** เมื่อ task อ้าง `verified` แต่ `slices` ที่ verified ยังไม่ครอบ `ac_ids` ครบ, slice ไม่ระบุ AC หรืออ้าง AC นอก task — แผนที่ไม่มีฟิลด์ `slices` ไม่กระทบ
- **task ที่ติดเพดาน rework อยู่แล้ว** (เช่น school-bot: B gRPC, G JPO) — session ถัดไปจะหยุดถามเรื่องเหล่านี้ก่อนเปิดงานใหม่

### เพิ่ม
- **charter ข้อ 12 "งานต้องจบได้"** — ตรึง oracle ต่อ task (กฎที่ arch ออกหลังเปิด task ผูกกับ task ถัดไป) · ติดเพดาน rework (แก้ครบ 2 รอบยังตก หรือ jpo ยังมี Critical/Important) = หยุดเปิดงานใหม่แล้วถามทันทีแม้ในโหมด "ทำจนหมดงานแล้วถามทีเดียว" · งานตรวจกิน slot ได้ไม่เกินครึ่ง
- **สถานะราย slice** — task ใน JSON ของแผนเก็บ `"slices": [{ "id", "ac_ids", "status" }]` · task เป็น `verified` เมื่อ slice ที่ verified ครอบ `ac_ids` ครบ · มี slice done-local/verified แล้ว task อย่างน้อย `done-local` · นายช่างลงในไฟล์แผนตอนปิด slice ทันที
- **progress lint ใน `--lint-plan`** — แสดงความคืบหน้างาน implement (verified/done-local/slice) · error เมื่อสถานะอ้างเกินหลักฐาน · warning (ไม่กระทบ exit code) เมื่อ slices ไปไกลกว่าสถานะที่ลงไว้ หรือเอกสาร verified ≥ 5 งานแต่งานโค้ดยังไม่มี done-local/verified (แผน school-bot จริง: 15 เทียบ 0)

### เปลี่ยน
- **role check มีขอบเขต** — เอาประโยค "haven't looked hard enough" ออก · ตัดสินตาม AC/test-plan/revision ที่ระบุตอนเปิด task และเขียน revision ไว้หัวรายงาน · เคสเพิ่มไม่เกิน 20 ต่อ task ห้ามชุดเคสแบบ combinatorial · FAIL เฉพาะ scoped AC ตก หรือ Critical/Important ที่เกิดได้จริงใน deployment ตามแบบ (artefact ของ test host/hardening = backlog) · re-check หลังแก้ = เคสที่ตกรอบก่อน + regression · verdict ราย slice
- **role jpo** — re-audit ครอบเฉพาะ finding ที่ทวน + สิ่งที่การแก้เปลี่ยน · ของใหม่เป็น finding แยก ไม่รีเซ็ตรอบ rework
- **CONVENTIONS §10 / role gm** — เพดาน rework = คนตัดสินทันที · finish line ตรึงต่อ task · บันทึก slices พร้อม `ac_ids` ที่แน่นอน
- tests 121 → 129

## 0.19.0 — 2026-10-26 · ตัวรันไม่ล้มเงียบ: retry เมื่อโมเดลเต็ม + เหตุล้มอยู่ใน report + agy โหมดเขียนอ่านนอก cwd

ที่มา: run จริงของ school-bot — codex T2 ล้มทันทีด้วย `ERROR: Selected model is at capacity` (สั่ง `--no-fallback` จึงไม่มีทางรอด) และ agy T3 โหมดเขียน (cwd = target) อ่าน knowledge ไม่ได้ จบ exit 0 คำตอบว่าง · ทั้งสองกรณี `report.json` มี `error` ว่าง ต้องเปิด stderr เองถึงรู้เหตุ

### เพิ่ม
- **retry เมื่อโมเดลเต็มชั่วคราว** — บรรทัด error ของ CLI ที่บอก `at capacity`/`overloaded` = รอ 30s แล้ว 90s ลองตัวรันเดิมซ้ำ · ใช้ได้แม้ `--no-fallback` เพราะไม่เปลี่ยนตัวรัน · ลองครบยังเต็มค่อยนับเป็นเหตุสลับตาม `_fallback` · ทำงานขนานได้เหมือนเดิม (รอเฉพาะงานที่เต็ม แต่ wave ถัดไปของ `baan` จะเริ่มหลังงานนั้นจบ)
- **`setup/agy/grant-read.mjs`** — เพิ่ม/ถอน allow-rule `read_file(<dir>)` ใน settings ของ agy (ไม่ระบุ = ราก workspace จาก `baan.config.json`, สำรองเดิมเป็น `.baan-bak`) ให้งาน `--write` อ่าน knowledge/repo อื่นใน workspace ได้ โดยไม่ขยายสิทธิ์เขียนแบบ `--add-dir` (live test: อ่านได้ · `write_file` ไปที่เดียวกันยังถูกปฏิเสธ) — แนะนำรันครั้งเดียวต่อเครื่องถ้าใช้ agy โหมดเขียน (ดู `setup/agy/README.md`)

### เปลี่ยน
- **ช่อง `error`** ใน `report.json`/checkpoint มีบรรทัด error ที่ CLI ประกาศเองจาก stderr (`ERROR:`/`AGY_ERROR:`/`jetski:` ฯลฯ) เมื่อล้มหรือคำตอบว่าง — เดิมมีเฉพาะ spawn error · agy ถูกปฏิเสธสิทธิ์อ่านมีคำแนะนำทางแก้ต่อท้าย · `baan-role` แสดงเป็น `error:` แทน `spawn error:`
- tests 112 → 121

## 0.18.0 — 2026-10-26 · ดันให้ถึงโค้ดเร็ว + เอกสารเบาลง (จากผลตรวจอิสระ)

ที่มา: ผลตรวจอิสระของ framework เทียบกับ school-bot — 6 วันมีใบงานเขียนโค้ด 5/80 ใบ, งาน implement 62/63 ติดประตูมนุษย์ทางอ้อม, archive กิน 39% ของ knowledge, index.md เป็น change log 70%, response JSON ดิบ 63 ไฟล์ปนใน knowledge และ sweep มติเดียวใช้ 9 role calls

### ⚠ ต้องทำตอนอัปเกรด
- **planner ปฏิเสธแผนที่ไม่มีงาน implement** (`baan --goal`) — goal ที่ตั้งใจเป็นเอกสารล้วน planner ต้องใส่ `"docsOnly": "<เหตุผล>"` (prompt บอกให้แล้ว) · แผนสดที่งาน implement ทุกงานหรือเกินครึ่งติดประตูมนุษย์ก็ถูกปฏิเสธ · แผนจาก `--plan-file`/`--resume` แค่เตือน — run เก่ายัง resume ได้
- **index เปลี่ยนวิธีเขียน** — `index.md` ของโมดูลและ index ทุกหมวดเป็น "สถานะปัจจุบัน": เขียนทับ ไม่มี `## Change Log` ไม่ซ้อนย่อหน้า Precedence/Amendment · index เดิมที่ยังมี change log/precedence ให้เขียนใหม่ครั้งเดียวเมื่อแตะ (school-bot ทำแล้ว)
- **เลิก snapshot/archive** — ไม่คัดลอกไฟล์ไป `archive\`/`archive.md`/`before-xxx` ก่อนแก้อีก (ใช้ git) · ผลดิบของ role (response JSON/stdout/.trx) ไม่เก็บใน knowledge — ของเดิมในโมดูลอื่นย้ายออกเมื่อสะดวก (ทำ tag กันประวัติก่อนลบ)
- **status ใหม่ `done-local`** ในคอลัมน์ Status ของแผน — ตารางเดิมใช้ต่อได้ ไม่ต้องแก้

### เพิ่ม
- **walking skeleton + time-box** (charter ข้อ 10, planner prompt, roles plan/gm) — งานที่สร้าง/แก้ซอฟต์แวร์ต้องมีงาน `front`/`sys` ที่ได้ของรันได้และไม่รอประตูมนุษย์ (ของที่รอคนใช้ stub/fake) · เอกสารทำเท่าที่ slice ใช้ ไม่เกิน 3 งานก่อนงานโค้ดแรก · ใบงานเอกสารล้วนติดกัน 5 ใบ = หยุดเสนอ slice โค้ด · CONVENTIONS §9: ประตูขวางเฉพาะงานที่ต้องใช้คำตอบนั้นจริง
- **`baan --lint-plan <tasks.json>`** — ตรวจรูปร่าง DAG ทั้งแผน runtime และแผนโปรเจกต์ของ gm (อ่าน `owner`/`depends_on`/`gate_ids` + ชื่อ role เดิม) — exit 1 เมื่อไม่มีงาน implement หรือเกินครึ่งติดประตูทางตรง/ทางอ้อม (แผน school-bot จริงได้ exit 1: 62/63)
- **สถานะ `done-local`** — โค้ด+test ผ่านในเครื่อง นายช่างลงเองหลังรัน test ซ้ำ ไม่ต้องรอรอบ check · ไม่ปิด gate · ยังต้องผ่าน check ก่อน `verified`
- **`baan --sweep "<ค่าเดิม>" [--target <t>] [--sweep-in <module dir>]`** — หาผู้อ้างอิงทุกจุดเป็นตาราง เจ้าของ|ไฟล์|บรรทัด ใช้ `git ls-files` (เคารพ .gitignore) ข้าม archive/binary/ไฟล์เกิน 2MB · related-impact sweep ใหม่: ค้นด้วย script → แทนค่าตรงตัว นายช่าง แก้เองไม่แตก task/ไม่เปิดรอบ check → task ต่อเจ้าของเฉพาะที่ความหมายเปลี่ยน (เจ้าของละหนึ่ง) → รัน sweep ซ้ำเป็นหลักฐาน

### เปลี่ยน
- **planner prompt เลิกบังคับ "ทุก task read-only ผลเป็นเอกสาร"** — บอกโหมดรันตาม `--write` แทน: read-only = front/sys ส่ง diff/patch + คำสั่ง test จริง
- **เอกสารเบา** (charter ข้อ 11, CONVENTIONS §1/§3/§6/§10, role arch) — ประวัติอยู่ใน git · index = สถานะปัจจุบัน · ผลดิบอยู่ `reports\` · เอกสารเกินงบให้แยกไฟล์ ไม่ archive
- **ผ่อนกติกา check/jpo ในโหมด solo** — ใช้ subagent ตรวจได้เมื่อเป็น subagent ใหม่ + prompt จาก AC/spec + path เท่านั้น + ตรวจด้วยหลักฐาน · ข้ามโมเดลผ่าน `baan-role` เหลือเป็น escalation (งานวิกฤตก่อน production, security finding สำคัญ, FAIL ซ้ำ)
- tests 100 → 112

## 0.17.0 — 2026-10-24 · โหมด solo — ทีมทั้งทีมรันใน session เดียว (subagent แทน runner ภายนอก)

### เพิ่ม
- **โหมด solo ใน charter นายช่าง** — ผู้ใช้สั่ง "solo" / "ทำเอง" ใน prompt ได้ ให้ session ที่สวม นายช่าง **เป็นทั้ง นายช่าง และทีมทั้งทีม**: แตก role เป็น subagent/งานเบื้องหลังของ session เอง 1 role ต่อตัว — prompt แนบ `[baan-role: <ID>]` + เนื้อหาเต็ม `roles\<ID>.md` + `CONVENTIONS.md` + task + context จาก role ก่อนหน้า และจบด้วย output state เดียวตามสัญญา เหมือนเปิดผ่าน `baan-role` ทุกประการ — เหมาะกับ session แบบแอปที่ไม่มี CLI ให้ `baan-role` เรียก (เช่น ZCode) หรือกรณีอยากประหยัดโควตา runner · งานเล็กที่ไม่คุ้แตก subagent นายช่าง ทำเองได้หลังสวมบท role ครบทุกครั้ง · ขนานตามกติกาเดิม (path ไม่ชนขนานได้ / repo เดียวกัน serialize)
- **runner ภายนอกเหลือเฉพาะ 3 กรณี**: งาน `check`/`jpo` ที่ตรวจของที่ solo เขียนเอง (ให้ค่ายอื่นตรวจ**ข้ามโมเดล** กันผู้เขียนตรวจของตัวเอง) · งาน tier **t0/t1** ที่ tier ladder จัด model ใหญ่กว่าให้ · งานที่เกิน context/กำลังของ session — สั่งด้วย `--tier` อย่างเดียว ระบบสลับ fallback ให้เองเหมือนเดิม
- **บันทึกความซื่อตรง** — ใบงาน/ผลใน knowledge ต้องระบุว่าใครรันจริง: "รันโดย นายช่าง solo (subagent role X)" / "solo ตรง" / runner ภายนอกตัวไหน
- ที่มา: ผู้ใช้สั่งงาน school-bot ให้ ZCode ทำเองผ่าน subagent แต่ charter เดิมห้าม นายช่าง ลงมือ ทำให้ session ปฏิเสธและส่งงานทั้งหมดไป codex ทั้งที่ไม่จำเป็น · ทดสอบจริงแล้ว: subagent สวม role spec/check อ่าน knowledge จริง คืน handoff พร้อม DONE/PASS ถูกต้อง · กติกาอื่นทั้งหมดคงเดิม (ประตูมนุษย์ · vault ห้ามรัน SQL · append-only · Git ของ source เป็นของผู้ใช้)

## 0.16.0 — 2026-10-24 · กติกา related-impact sweep — แก้ของที่ถูกอ้างอิงต้องกวาดทุกจุด

### เพิ่ม
- **กติกา related-impact sweep** — งานที่เปลี่ยน "สิ่งที่ถูกอ้างอิง" (สัญญา/ชื่อ/ค่า/URL/revision/สถานะที่มีอยู่แล้ว) ต้องระบุผู้อ้างอิงทุกจุดก่อนแก้ แล้วสั่งเจ้าของไฟล์แก่ทุกจุดตาม owner — **แม้เป็นงานเล็ก** แก้จุดเดียวแล้วปิดงานทิ้งผู้อ้างอิงค้างเดิมถือว่างานไม่จบ · ฝังสามที่: **charter นายช่าง** (BAAN.md กติกาข้อ 9 + หัวข้อ "กวาดของที่เกี่ยวข้องก่อนปิดงาน": coverage list ก่อนแก้ → แตก task ต่อ owner โดยนายช่างเป็นเจ้าของ module index เอง → ตรวจตัวเลขรุ่น/สถานะใน index ทุกชั้นให้ตรงของจริงก่อน knowledge commit), **planner prompt** (กติกาข้อ 5: แผนที่เปลี่ยนของที่มีผู้อ้างอิงแต่ไม่มี task เก็บเอกสารผู้อ้างอิง = แผนบกพร่อง; ไม่มีผู้อ้างอิงต้องระบุไว้ชัดว่าเป็นการตัดสินใจ), **role plan** (หน้าที่ Sweep referencing artifacts) และ README · ที่มา: เคสจริง school-bot — รอบแก้เอกสาร transport ครั้งแรกแก้แคบจนผู้ใช้ต้องสั่งกวาดทุกเอกสารที่เกี่ยวข้องซ้ำเอง (ใบงาน050–055) และรอบกวาดเต็มยังหลุด revision หนึ่งจุดใน module index · งานที่ไม่มีผู้อ้างอิงยังอยู่ในเกณฑ์ "แผนเล็กที่สุด" เดิม ไม่บวมโดยไม่จำเป็น

## 0.15.1 — 2026-10-23 · fallback ข้ามตัวรันที่ไม่ได้ติดตั้งแทนที่จะล้ม

### แก้
- **ตัวรันที่ไม่ได้ติดตั้งบนเครื่องถูกข้ามไปตัวถัดไปแทนที่จะล้มจบ** — เดิมสลับต่อเฉพาะ error โควตา ทำให้เครื่องที่ไม่มี opencode CLI เจอ codex ติดโควตาแล้วล้มที่ "command not found" แทนที่จะไปต่อ agy · ตอนนี้จับเพิ่มจาก error/stderr ของ process (spawn ENOENT / command not found / not recognized) — งานยังไม่ได้เริ่มรันจึงสลับต่อได้โดยไม่เสี่ยงเผาโควตาค่ายอื่น · ไม่ดูจากคำตอบของ role เพราะ check อาจรายงาน "command not found" ของงานที่ตรวจ ซึ่งไม่ใช่อาการของตัวรัน · log แยกเหตุผล "ไม่ได้ติดตั้งบนเครื่อง" ออกจาก "ติดโควตา/limit" · **คำเตือน ⚠ ของ 0.15.0 เลิกจำเป็น: เครื่องไม่ติดตั้ง opencode ก็แค่ถูกข้ามเฉยๆ** · tests 98 → 100

## 0.15.0 — 2026-10-23 · เพิ่มตัวรันที่สี่ opencode — GLM ผ่าน Z.AI Coding Plan (cost 0)

### ⚠ ต้องทำตอนอัปเกรด (รู้ไว้)
- **opencode เข้าลำดับ fallback ทุก tier (`codex→opencode→agy→claude`)** — เครื่องที่ไม่มี opencode CLI: เมื่อ codex ติดโควตา ระบบจะสลับไป opencode แล้วล้มด้วย "command not found" แทนที่จะไปต่อที่ agy (spawn ล้มไม่ใช่ limit error จึงไม่สลับต่อ) · **ถ้าใช้ GLM:** ติดตั้ง `npm i -g opencode-ai` + `opencode auth login` (เลือก Z.AI Coding Plan) ครั้งเดียวต่อเครื่อง · **ถ้าไม่ใช้ GLM:** ถือ `agents.json` เดิมของตัวเองต่อ หรือลบ opencode ออกจาก `_fallback` ใน agents.json ของ workspace

### เพิ่ม
- **ตัวรันที่สี่: opencode (GLM ผ่าน Z.AI Coding Plan — เหมาจ่าย cost 0 ต่อครั้ง)** — tier: t2=`glm-5.3#max` · t3=`glm-5.3#high` · t4=`glm-5.3-flash#max` · t5=`glm-5.3-flash#high` (จัดตาม Intelligence Index ที่ผู้ใช้วัด: 5.3 max ≈ sonnet high) · t0/t1 = null (GLM เพดาน t2 — fallback ข้ามไปค่ายอื่นอัตโนมัติ) · ลำดับ `_fallback` ทุก tier เป็น codex→opencode→agy→claude · effort ฝังใน model string ผ่าน `#variant` (ต้องใช้ opencode ≥ 2.1.4 — ทดสอบจริง: รันได้ ตอบถูก #max คิดนานกว่า #low) · read-only = ไม่ใส่ `--auto` (non-interactive ปฏิเสธการกระทำที่ต้องขออนุญาตเอง) · write = `--auto` · ต้อง `opencode auth login` เลือก Z.AI Coding Plan ก่อนใช้ · smoke จริงผ่านครบ: t2 glm-5.3#max อ่าน knowledge จริงจบ DONE ตรง marker / t4 flash#max อ่าน / t5 flash#high เขียนไฟล์จริง · tests 96 → 98

## 0.14.0 — 2026-10-23 · planner กันชนไฟล์ตอน parallel + gm เป็นเจ้าของ release runbook

### เพิ่ม
- **กติกา parallel ระดับไฟล์** — task implement ที่เขียน target repository เดียวกันต้อง serialize (หรือระบุในใบงานว่าไฟล์/path ไม่ชนกันแน่) แม้จะไม่แชร์ API contract — เดิมคำแนะนำของ planner พูดถึง parallel เฉพาะระดับ contract ทำให้สอง task ขนานที่แตะโมดูลเดียวกันใน working tree เดียวกันเสี่ยงชนกันโดยไม่มีใครเลี่ยงให้ · แก้ทั้งใน prompt ของ planner และหน้าที่ role plan
- **gm เป็นเจ้าของ release runbook** — ก่อนปิดรอบ release ให้ gm รวม SQL/rollback ของ vault + ลำดับ deploy + สิ่งที่มนุษย์ต้องรัน เป็น runbook เดียวพร้อมจุด rollback ไว้ใต้ `plan\**` — ปิดช่องว่างที่งาน release ไม่มีเจ้าของ โดยไม่เพิ่ม role ใหม่ (การรันจริงยังเป็นของมนุษย์เหมือนเดิม)

## 0.13.0 — 2026-10-23 · มาตรฐานเอกสารข้อมูลอ่านรู้เรื่อง + DBML คู่ data model + แก้ auto-commit

### เพิ่ม
- **กำหนด DBML เป็นผลส่งมอบคู่ relational data model** — แบบเต็มพร้อม Note ไทย/กลุ่มสี และภาพ integration ย่อเมื่อมีตารางเดิม พร้อมคู่มือสี/เส้นและข้อจำกัด · arch ดูแล artifact; vault เทียบ SQL; inspect/check ตรวจ parser/version/dialect และ physical/logical refs รวม structural comparison เมื่องานเปลี่ยนเฉพาะคำอธิบาย; นายช่างบันทึกก่อน final knowledge commit
- **เพิ่มมาตรฐานคู่มือ data model** — หน้าที่ตาราง/หนึ่งแถว/ความหมายทุกฟิลด์/JSON/enum และตารางเก่าที่ใช้พร้อมคอลัมน์เชื่อมและหลักฐาน · กำหนดผู้รับผิดชอบให้ชัด: arch ดูแลคู่มือหลัก, vault เทียบ physical SQL, inspect/check ตรวจความครบถ้วนในขอบเขตงาน; นายช่างตรวจและบันทึกก่อนส่งต่อ
- อนุญาตตามลิงก์ตรงจาก data-model/index ไปยังส่วนของสัญญาที่แยกไฟล์ และแยกการขยายคำอธิบายออกจากการเปลี่ยน schema/การตรวจ runtime
- ปรับเอกสาร/บทบาทด้วยกลไกประกอบ prompt เดิม — คำสั่งและวิธีใช้กับผู้ใช้ไม่เปลี่ยน · tests 94 → 96 กรณี

### แก้
- **auto-commit knowledge อ่านชื่อ module/path ผิดเมื่อรายการแรกใน git status เป็น tracked file ที่แก้แต่ยังไม่ stage** — คง stdout ของ porcelain แบบ raw ไม่ตัด leading space พร้อม regression test กับ Git repo ชั่วคราว
- แก้กติกา Git ที่ขัดกับฟีเจอร์: อนุญาตเฉพาะ configured knowledge commits และกำหนดให้นายช่างเรียก commit หลังบันทึก output/เอกสารของตัวเองครบ ไม่อาศัย hook ของ role ที่จบไปก่อนหน้านั้น

## 0.12.0 — 2026-10-22 · เปลี่ยนชื่อ MYCELIUM→BAAN + prompt อังกฤษทั้งระบบ + auto commit ที่เก็บเอกสาร

### ⚠ ต้องทำตอนอัปเกรด
- **เปลี่ยนชื่อ project ทั้งระบบ: MYCELIUM → BAAN (🏗️ นายช่าง) ธีมงานก่อสร้าง** — คำสั่ง `mycelium`/`mycelium-role` → `baan`/`baan-role` (คำสั่งเก่ายังใช้ได้ผ่าน bin compat) · role ทั้ง 11 เปลี่ยน ID+ตำแหน่ง: `planner→plan` นักวางผัง · `pm→gm` ผู้จัดการหน้างาน · `ba→spec` ผู้เขียนข้อกำหนด · `sa→arch` สถาปนิก · `ux→int` นักออกแบบตกแต่งภายใน · `fe→front` ช่างหน้างาน · `be→sys` ช่างระบบ · `dba→vault` ผู้ดูแลห้องนิรภัย · `tp→inspect` หัวหน้าตรวจรับ · `qa→check` ผู้ตรวจงานอิสระ · `sec→jpo` จป. — **ID เก่าทุกรุ่น (ba/sa/fe และชื่อยาว business-analyst ฯลฯ) ยังใช้ได้เป็น alias** ทั้ง `--role`, แผนเก่าและ `--plan-file`
- **repo ย้ายราก `project-ai` → `baan` และย้ายโฟลเดอร์ package `mycelium/` → `baan/`** — ใคร `npm link` จาก path เก่าต้อง clone ใหม่ที่ path ปัจจุบันแล้ว `npm link` อีกครั้ง (ตัวคำสั่งและพฤติกรรมไม่เปลี่ยน)
- config ของ workspace เปลี่ยนชื่อเป็น `baan.config.json` — ชื่อเก่า `mycelium.config.json` และ `mycelium/mycelium.json` ยังถูกพบอัตโนมัติ (อยากได้ชื่อใหม่ให้รัน `baan --init` ที่ราก workspace ซึ่งจะย้ายให้เอง) · env `BAAN_CONFIG` มาแทน `MYCELIUM_CONFIG` (ตัวเก่ายังรับ) · ตัวอย่างใน package เป็น `baan.example.json`
- **ผู้ใช้ agy ต้องติดตั้ง agent profile `baan-readonly` ต่อเครื่อง** (เดิม `mycelium-readonly`) — ไฟล์อยู่ที่ `setup/agy/` เหมือนเดิม แค่ชื่อใหม่ (profile เก่าที่ติดตั้งไว้ไม่ถูกอ้างอีกต่อไป ลบได้) · charter เปลี่ยนชื่อไฟล์ `MYCELIUM.md` → `BAAN.md` · workspace ที่ `--init` ไว้แล้ว: รัน `baan --init` อีกครั้งเพื่ออัปเดต CLAUDE.md/AGENTS.md stub

### เปลี่ยน
- **prompt ที่ส่งเข้า AI ทั้งหมดเป็นภาษาอังกฤษ** — เนื้อหา role ทั้ง 11 ไฟล์, CONVENTIONS.md, ป้าย `[baan-role:]`/ข้อยกเว้น, หัวข้อประกอบ prompt (date/assignment/context) และบล็อก context ระหว่าง task · **ผลลัพธ์ยังเป็นไทยเหมือนเดิม** — บังคับด้วยกฎ "Working language" ในทุก role + CONVENTIONS §11 (เอกสาร/คำตอบไทย ศัพท์เทคนิค/โค้ด/ID อังกฤษ) · หัวไฟล์ role (`# บทบาท:`/`> หน้าที่:`/`> tier:`) คงไว้เป็นไทยเพื่อ `--list` และตารางเอกสาร · ตรวจจริงแล้วกับ agy: prompt อังกฤษ ตอบไทยครบทั้งฉบับ (schoolbright 2026-10-22)
- **ยกระดับบทบาททุกตำแหน่งให้คมขึ้น มี "philosophy" เฉพาะตัว** — spec เค้นความต้องการจริงด้วยคำถามเชิงรุก (ห้ามยอมรับคำกำกวม ถามจนทดสอบได้) · arch เรียบง่ายก่อนเสมอ (ของเดิมที่ใช้ได้ชนะท่ายาก แต่กล้าเปลี่ยนรากฐานเมื่อผิดทาง — "เสาหลักของบ้าน รากฐานไม่ดีไม่ใช่บ้านที่ดี") · plan แผนเล็กที่สุดที่ได้งาน (task เกินความจำเป็น = แผนบกพร่อง) · gm คุ้มกัน scope creep · front ทำเป๊ะตามที่ขอ ไม่เพิ่มของที่ไม่ได้ขอ · sys validation ทุกขาเข้า + boring defensive code · vault schema ที่ทำให้บั๊กเป็นไปไม่ได้ · inspect ล่าช่องโหว่ ไม่ใช่แค่ครอบคลุม · check เดินหน้าเป็นศัตรูของโค้ด (สมมติว่าพังจนพิสูจน์ว่าไม่พัง) · jpo ตรวจตามพื้นผิวจริง จัดระดับตามความเสี่ยงจริง

### เพิ่ม
- **auto commit ที่เก็บเอกสาร (knowledge) หลังจบ run** — knowledge root ที่เป็น git repo ถูก commit ให้อัตโนมัติตอนจบ run ของทั้ง `baan` และ `baan-role` · แยก commit ต่อ module (โฟลเดอร์ย่อยแรกใต้ knowledge) ข้อความอังกฤษสั้นรูปแบบ `module: add|update|remove <ไฟล์> [+N more]` · commit ของ module หนึ่งไม่กลืนของที่ staged ค้างข้าม module · ไม่ใช่ git repo = ข้ามเงียบๆ · git พังไม่กระทบผล run · เรียกด้วยมือได้ด้วย `baan --commit`
- **เอกสารเขียนใหม่เป็นการแนะนำโปรเจกต์** — `README.md` ของ package มี "BAAN คืออะไร / เริ่มต้นใช้งาน" ตอนต้น ตัดเหตุผลเฉพาะวงในออก (ประวัติทดสอบรายรุ่นอยู่ที่ RELEASE-NOTES ฉบับนี้) · README ราก repo เป็นหน้าแรกบางๆ ชี้มาคู่มือเดียว
- tests 87 → 94 กรณี (ชุดใหม่: parse/group/ข้อความของ auto commit รวม integration กับ git repo จริงใน temp dir)

## 0.11.0 — 2026-10-22 · timeout รวมศูนย์ + tier กลาง–ล่างตาม Intelligence Index + agy อ่านไฟล์นอก workspace ได้

### ⚠ ต้องทำตอนอัปเกรด (รู้ไว้)
- **tier t3–t5 เปลี่ยน model/effort ของ codex และ agy** — t3 codex `gpt-6.1-sol` medium→**low** · t4 codex `gpt-6-luna` medium→**high** + agy `gemini-3.8-flash-medium`→**flash-low** · t5 codex `gpt-6-luna` low→**medium** · เหตุผล: จัดตาม Intelligence Index ให้สติปาร์ตี้ใน tier เดียวกันใกล้กัน (เดิม t3 ของ codex สูงกว่าเพื่อน 7–8 คะแนนจนเผาโควตาเกินจำเป็น และตอน fallback ความสามารถกระโดดหนักในแผนเดียว) · ผู้ใช้ที่แก้ `agents.json` ของตัวเองไว้ = ยังใช้ของตัวเองต่อ (ไม่พัง แค่ไม่ได้รับการจัดใหม่)
- **timeout เริ่มต้นขยับ 600 → 1800 วินาที (t0: 900 → 3600)** — งานที่ค้างจะถูก kill ช้าขึ้นกว่าเดิม · คุมค่าเดิมได้ด้วย `defaults.timeout_sec` ใน workspace config, `_timeoutSec` ของ tier หรือ `--timeout` เหมือนเดิม

### เปลี่ยน
- **priority ของ timeout เป็นชุดเดียวทุกจุด** (role, PM/planner, งานในแผน, fallback): `--timeout` ที่ระบุเอง > `_timeoutSec` ของ tier > `defaults.timeout_sec` ของ workspace > 1800 วินาที · ค่าที่เลือกต้องเป็น integer 1–86400 — ค่าผิด = error ทันที ไม่เปลี่ยนเป็น default เงียบๆ
- `mycelium-role` อ่าน `defaults.timeout_sec` ด้วย workspace loader ร่วม (ค้นจาก `--cwd` หรือไดเรกทอรีที่เรียก รองรับ `MYCELIUM_CONFIG`) โดยไม่เปลี่ยน agent, cwd หรือโหมดสิทธิ์จาก workspace defaults

### แก้
- **agy เคยได้คำตอบว่างเปล่าเมื่องานอ้างไฟล์นอก cwd** (เช่น SA @ t1 ที่ cwd=target อ่าน `knowledge/` ไม่ได้ตอน fallback จาก codex — พบจริงที่ schoolbright 2026-10-22) — jetski ของ agy กันอ่านไฟล์นอก workspace และ headless ปฏิเสธคำขอแทนการถาม · ตอนนี้ MYCELIUM ส่ง `--add-dir <ราก workspace>` ให้ agy **เฉพาะโหมดอ่าน** (ค้นรากจาก `mycelium.config.json` เดินขึ้นจาก cwd — ไม่เจอ config = ไม่ส่ง) · โหมด `--write` ไม่ส่ง เพราะ `--add-dir` ขยายขอบเขต *การเขียน* ตามไปด้วย (ทดสอบแล้วใน accept-edits) — งานเขียนที่ต้องอ่านไฟล์นอก cwd ให้ฝังเนื้อหาใน task หรือรัน read แยกก่อน

### เพิ่ม
- **`workspaceDirArgs` ใน `agents.json`** — กลไกส่ง `--add-dir` ของ agy แบบ placeholder `<WORKSPACE_ROOT>` (ใช้ได้กับ agent อื่นด้วยถ้า CLI นั้นมี flag แบบเดียวกัน)
- **`smoke:live` ปลอม sandbox เป็นรูป workspace จริง** (มี `mycelium.config.json` ที่ราก + ไฟล์ลับนอก cwd ของ agent) และเพิ่มช่องตรวจ "อ่านนอก cwd" — sandbox เดิมอยู่ใน %TEMP% ซึ่งเป็น safe area ของ jetski จึงตรวจไม่พบบั๊กแบบที่เจอจริง
- จัดส่ง `scripts/live-smoke.mjs` มากับ package ด้วย (0.10.0 ลืมใส่ `files` — ผู้ติดตั้งรัน `npm run smoke:live` ไม่ได้ทั้งที่เอกสารสั่งใช้)
- tests 80 (0.10.0) → 86 กรณี

### ผลทดสอบจริงก่อนปล่อย (2026-10-22)
- `npm run smoke:live -- --tier t1 --agents agy` และ `--tier t4 --agents agy`: **PASS ครบทุกช่อง** (t4 รวมคอลัมน์ใหม่ "อ่านนอก cwd")
- งานจริงที่ schoolbright: `mycelium-role --agent agy --role sa --tier t1` ที่ cwd=target อ่าน `req-043.md`/`des-008.md` ใน `knowledge/` ได้ (completed + อ้าง path จริง) — คือกรณีเดิมที่ได้คำตอบว่างตอน fallback จาก codex
- codex ติดโควตาถึง 27 ต.ค. 2026 — config ใหม่ของ codex ทุกตัว (sol-low @ t3, luna-high @ t4, luna-medium @ t5) ผ่านการเปิด session จริง (CLI รับ model/effort ถูกต้อง) แต่ยังตรวจพฤติกรรมเต็มไม่ได้ · เมื่อโควตากลับ รัน `npm run smoke:live -- --tier t3 --agents codex` และ `--tier t4 --agents codex` ได้เลย

## Change Log

- 2026-10-21: บันทึก timeout fix ที่ยังไม่ release
- 2026-10-22: ปรับ t3–t5 ตาม Intelligence Index (fallback parity) — แยก commit จาก timeout
- 2026-10-22: แก้ agy อ่านนอก workspace ไม่ได้ใน headless + smoke ครอบคลุมกรณีนี้

## 0.10.0 — 2026-10-17 · ตัวรันทั้ง 3 ค่ายผ่าน live smoke + role ไม่สวมบท MYCELIUM ซ้อน + กติกาสไตล์โค้ด

### แก้
- **session ที่ถูกเปิดเป็น role ไม่สวมบท MYCELIUM ซ้อนแล้ว** — CLAUDE.md/AGENTS.md ที่ `--init` วางไว้ถูก AI CLI โหลดเองอัตโนมัติ (claude อ่านของโฟลเดอร์แม่ด้วย) role จึงได้คำสั่ง "คุณคือ MYCELIUM" ซ้อนกับบทบาทของตัวเอง (พบจาก smoke จริงที่ schoolbright: codex ที่เปิดเป็น `ba` พยายามเปิด charter ก่อนทำงาน)
  - prompt ของทุก role (รวม PM/planner และงานไม่ผูก role = `adhoc`) ขึ้นต้นด้วยป้าย `[mycelium-role: <ID>]` + ประโยคข้อยกเว้น
  - stub ของ `--init` มีประโยคข้อยกเว้นเดียวกันอยู่ก่อนคำสั่งสวมบท — เจอป้ายนี้ = ทำตามบทบาท ไม่อ่าน charter ไม่เรียก mycelium/mycelium-role ต่อ
- **agy `--write` ใช้ได้แล้ว** — `--mode accept-edits` เคยอยู่หลัง `--print` จน `--print` กลืนเป็น prompt แล้วล้ม exit 2 ทุกครั้ง · ย้ายไว้ก่อน `--print` + test กันลำดับ
- **agy read-only บังคับห้ามเขียนได้จริงแล้ว** — `--mode plan` เดิมยังเขียนไฟล์ได้ และ `--sandbox` กันแค่ terminal · `readArgs` เป็น `["--agent", "mycelium-readonly", "--print"]` คู่กับ custom agent profile ระดับผู้ใช้ (`~/.gemini/config/agents/mycelium-readonly/agent.md` ตัด write tools ออกจาก toolset) และ `PreToolUse` guard hook (`~/.gemini/config/mycelium-readonly-guard.js` บังคับ allowlist คำสั่งอ่านอย่างเดียวเฉพาะเซสชัน `mycelium-readonly`)
- **claude รันคำสั่งได้ตามโหมด** — `-p` ไม่มีคนกดอนุมัติ tool จึงเคยรันคำสั่งไม่ได้เลย · read-only: `--allowedTools` เฉพาะ Read/Grep/Glob + คำสั่งอ่านอย่างเดียว (git status/log/diff/show ฯลฯ) · write: เพิ่ม Edit/Write/Bash/PowerShell
- **CONVENTIONS §8: ทำไม่ได้เพราะสภาพแวดล้อม = `BLOCKED`** — เคยเห็น role จบ `DONE` ทั้งที่รันคำสั่งไม่ได้ จนนับเป็น completed

### เพิ่ม
- **กติกาสไตล์โค้ดและ comment ของ `fe`/`be`/`qa`** (role ที่เขียนโค้ดลง target — หมวดเดียวกันทั้งสามไฟล์ + test กันไม่ให้ต่างกัน): เขียนให้เหมือนโค้ดรอบข้างใน target ห้ามเปลี่ยนสไตล์/reformat/refactor นอก task · comment เฉพาะ "why" ห้าม comment what · ห้ามใส่ task id หรือ ID เอกสาร (T1/BL/REQ/DES ฯลฯ) ลงในโค้ดหรือ comment — การโยงงานอยู่ใน handoff เท่านั้น (สำหรับ `qa` รวมถึงชื่อเคส test — traceability AC ↔ test อยู่ใน test plan ของ `tp`)
- **`setup/agy/`** — profile `mycelium-readonly` ของ agy (agent.md + guard hook + ตัวอย่าง hooks.json + ขั้นตอนติดตั้ง) มากับ package
- **`npm run smoke:live`** (`scripts/live-smoke.mjs`) — ทดสอบตัวรันจริงทุกค่ายด้วยค่าที่เดาไม่ได้และตรวจบนดิสก์: อ่านไฟล์ · คำสั่งอ่านอย่างเดียว · รันโค้ด · read-only กันเขียนจริง · `--write` · สถานะไม่เกินจริง (ใช้โควตาจริง ไม่อยู่ใน `npm test`)
- tests 72 (0.9.0) → 80 กรณี

### ผลทดสอบจริงก่อนปล่อย (2026-10-17)
- `npm run smoke:live -- --tier t3`: **claude / codex / agy PASS ครบทุกช่อง** (อ่านไฟล์ · git log · read-only กันเขียนบนดิสก์ · `--write` · สถานะตรงจริง) — claude ผ่านที่ t1/t3/t5 ด้วย
- e2e งานจริง (โปรเจกต์จำลองที่มีสไตล์เฉพาะ + spec 5 AC): `be` → `DONE`, `qa` → `PASS` **ทั้งสามค่าย** · test ลับ 8/8 · สไตล์ตรง target · ไม่มี task/AC id ในโค้ด · ไม่เพิ่ม comment · ไม่มี state-changing git ค้าง
- shell ของ codex (`setup refresh had errors`) แก้ที่เครื่องแล้ว — `codex doctor` = `✓ sandbox` (เป็นเรื่องของเครื่อง ไม่เกี่ยวกับ package)

### ⚠ ต้องทำตอนอัปเกรด
- **ใช้ agy แบบ read-only (ค่าเริ่มต้น และ fallback ทุก tier) ต้องมี agent profile `mycelium-readonly` ในเครื่อง** — ไม่มี = agy ล้มทุกงาน read-only (ไม่ใช่ข้อผิดพลาดโควตา จึงไม่สลับตัวรัน) · ไฟล์ทั้งหมดมากับ package ที่ `setup/agy/` — ทำตาม `setup/agy/README.md` (คัดลอก `agent.md` + `mycelium-readonly-guard.js` ไป `~/.gemini/config/` และรวม entry จาก `hooks.example.json` เข้า `hooks.json` ของเครื่องเอง โดยไม่ทับ hook เดิม) · ตรวจด้วย `agy agents` (ต้องเห็น `mycelium-readonly`) แล้ว `npm run smoke:live -- --agents agy`
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
