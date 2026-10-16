# Audit โครงสร้าง MYCELIUM

วันที่: 2026-10-15

> **สถานะการแก้ (2026-10-16, release 0.4.0)**: P1 ครบทั้ง 5 ข้อ + P2 ข้อ 6 (CONVENTIONS.md ใน package + hard-fail), ข้อ 7 (แยกโมดูล bin/+src/: config/runner/prompts/plan/scheduler/run-store และรวม runner สอง CLI เป็นชุดเดียว) และข้อ 8 (context แนบสถานะ/path/แจ้งการตัด) แก้แล้ว พร้อม regression tests 35 กรณี (`npm test`) — รายละเอียดอยู่ใน `mycelium\README.md` หัวข้อ "release 0.3.0/0.4.0" · ยังค้าง: task-level write scope ก่อนใช้ --write จริง และ gate แบบ object ผูกกับ task

## ข้อสรุป

ควรปรับโครงสร้างแบบค่อยเป็นค่อยไป โดยเริ่มจากสัญญาสถานะงานและการเก็บ run ก่อนแยกโมดูล ปัจจุบันเป็น local CLI ขนาดเล็ก มี entrypoint 2 ไฟล์ (502 และ 278 บรรทัด) จึงยังไม่จำเป็นต้องทำ monorepo, microservices หรือเพิ่ม framework

จุดที่ทำได้ดี: dependency ภายนอกเป็นศูนย์, แยก role เป็น Markdown, แยก provider/tier เป็น JSON, ส่ง prompt ผ่าน stdin เมื่อทำได้ และมีรายงานแต่ละ run

## ขอบเขตและวิธีตรวจ

- อ่าน source ทั้งสอง entrypoint, config, package manifest, charter, conventions และ role ทั้ง 11
- เทียบกับ plan/output/summary ของ run `pipeline-2026-10-15-02-02-30`
- `node --check` ผ่านทั้งสองไฟล์ บน Node v24.21.0
- ตรวจรายการไฟล์ด้วย `npm pack ./mycelium --dry-run --json`
- ใช้ Node VM เรียกฟังก์ชันจริงจาก source โดยจำลอง provider และ filesystem ในหน่วยความจำ เพื่อตรวจ scheduler, resume และ validation
- ไม่เรียก AI CLI จริง ไม่ใช้โควตาเพิ่ม ไม่รันงานบน target และไม่แก้ source
- workspace นี้ไม่มี Git repository จึงไม่มี diff/history ให้ตรวจ; ไม่ได้ทดสอบ Node 18 ตาม engines

P1 = ควรแก้ก่อนใช้ pipeline เขียนงานจริง; P2 = ควรแก้ในรอบปรับโครงสร้างถัดไป

## Findings

### 1. [P1] สถานะ CLI ถูกใช้แทนสถานะงาน และ dependency ไม่ตรวจผลสำเร็จ

ตำแหน่ง: `mycelium/mycelium.mjs:137`, `:328`, `:345`, `:357`, `:366`

`runCli` ให้ `ok` จาก exit code ส่วน scheduler ตรวจเพียง `done.has(id)` แล้วใส่ผลทุกงานลง `done` รวมทั้งงานที่ fail จึงปล่อยงานลูกต่อได้ `humanGates` เป็นข้อความที่พิมพ์หลัง execute ทั้งแผน ไม่มี gate ผูกกับ task หรือหลักฐานอนุมัติ

ทดสอบ A → B: เมื่อ A exit 1, B ยังเริ่ม; เมื่อ A ตอบ NEEDS_HUMAN และ exit 0, B ยังเริ่มและ pipeline จบ exit 0 หลักฐานจาก run เดิมก็พบ BA ตอบ NEEDS_HUMAN และ TP ตอบ NEEDS_REQUIREMENT_CHANGE แต่ summary ระบุ ok=true ทั้งคู่

ข้อเสนอ: แยก `processStatus` กับ `taskState` ใช้ output JSON ที่ตรวจ schema ได้ พร้อม state เช่น pending/running/completed/failed/blocked/waiting_human ให้ dependency ผ่านเมื่อ prerequisite สำเร็จตามเกณฑ์เท่านั้น ระบุ gate เป็น object มี ID, task ที่ถูกกั้น และหลักฐานอนุมัติ งานอิสระที่ไม่ติด blocker ยังทำต่อได้

### 2. [P1] Resume เปลี่ยนคำตอบที่ไม่ว่างทุกชนิดเป็นงานสำเร็จ

ตำแหน่ง: `mycelium/mycelium.mjs:299`, `:304`, `:305`

`preloadDone` ไม่อ่าน exit code, timeout หรือสถานะงาน แค่มี answer ไม่ว่างก็สร้าง ok=true, exitCode=0 ขึ้นใหม่ ทำให้งานที่ timeout แต่มี output บางส่วน หรืองานที่รอคน ถูกข้ามและปล่อย dependency ต่อ

ตัวจำลองยืนยันว่า `Partial output: NEEDS_HUMAN` ถูกโหลดกลับเป็น success

ข้อเสนอ: บันทึกผลแต่ละ attempt ทันทีเป็น checkpoint แบบ atomic; ข้ามเฉพาะ completed ที่ตรงกับ plan/task ปัจจุบัน เก็บ attempt, status, error, timeout และ artifact references ห้ามใช้การมีไฟล์เป็นหลักฐาน success

### 3. [P1] Resume ไม่คืน target/cwd และบริบทจาก run เดิม

ตำแหน่ง: `mycelium/mycelium.mjs:395`, `:412`, `:431`, `:434`, `:493`

run ใหม่บันทึก target ใน plan แต่ตอน resume โหลดมาแล้วไม่ใช้คืน `opts.target`, `cwd` หรือ `projectCtx` หากเรียกเพียง `mycelium --resume <dir>` ตาม README จะได้ cwd เป็น TEAM_DIR เมื่อไม่ได้ส่ง --target/--cwd ซ้ำ อาจอ่านหรือเขียนผิดโปรเจกต์ โดยเฉพาะเมื่อเพิ่ม --write

ข้อเสนอ: เพิ่ม run manifest ที่เก็บ resolved target, cwd, knowledge root, mode และ config snapshot; resume คืนบริบทเดิม ตรวจว่า path ยังใช้ได้ และแสดงการ override ชัดเจน

### 4. [P1] Dry-run ถูกข้ามเมื่อใช้ plan-file หรือ resume

ตำแหน่ง: `mycelium/mycelium.mjs:427`, `:447`, `:496`

branch `--plan-file`/`--resume` เรียก execute แล้ว return ก่อนถึงจุดตรวจ `opts.dryRun` ดังนั้น `--plan-file <f> --dry-run` และ `--resume <dir> --dry-run` ที่มีงานค้างจะเริ่ม provider จริง; หากรวม --write ก็ส่งโหมดเขียนต่อด้วย

ข้อเสนอ: ให้ทุก input route ผ่านขั้น load → validate → preview → dry-run guard → execute เดียวกัน ตรวจ invocation ของ provider ว่าเป็นศูนย์ใน dry-run

### 5. [P1] Plan validation ยังไม่ป้องกัน task ID ออกจาก reports directory

ตำแหน่ง: `mycelium/mycelium.mjs:253`, `:258`, `:279`, `:314`, `:347`

ตรวจ id แค่ไม่ว่างและไม่ซ้ำ แต่ใช้ id ประกอบชื่อไฟล์โดยตรง ทั้ง read และ write ตัวจำลองยืนยันว่า `../../outside` ผ่าน validation จึงอาจชี้ไฟล์ออกนอก runDir ได้ วงจร A → B → A ก็ผ่าน validation และจะเพิ่งพบตอน execute; ถ้ามีงานอิสระ งานเหล่านั้นอาจรันไปก่อนรู้ว่าแผนใช้ไม่ได้

ข้อเสนอ: กำหนด ID เป็น string ที่เข้า pattern จำกัด เช่น `[A-Za-z0-9][A-Za-z0-9_-]*`, ตรวจ resolved path ให้อยู่ใต้ runDir และตรวจ types ของ tasks/dependsOn/humanGates รวมทั้ง cycle/self-dependency ก่อน spawn ใดๆ ตรวจ timeout/maxParallel เป็นจำนวนบวกที่มีขอบเขตด้วย

### 6. [P2] Package ไม่รวม conventions ที่ระบบประกาศว่าแนบให้ทุก role

ตำแหน่ง: `mycelium/package.json:10`, `mycelium/mycelium.mjs:161`, `mycelium/orchestrator.mjs:218`

`npm pack --dry-run` ยืนยันว่า CONVENTIONS.md ไม่อยู่ในรายการ 18 ไฟล์ ทั้งสอง entrypoint catch กรณีอ่านไม่ได้แล้วข้ามเงียบๆ จึงทำงานปกติผ่าน npm link แต่เมื่อติดตั้งจาก tarball จะขาดกติกากลางโดยไม่มี error

ข้อเสนอ: เพิ่ม CONVENTIONS.md ใน files; หากเป็นไฟล์สัญญาบังคับให้อ่านไม่ได้แล้วหยุด ตรวจ package content ใน automated checks พร้อม entrypoints และ role assets

### 7. [P2] กลไก provider และ policy ซ้ำหลายแหล่งและเริ่มต่างกัน

ตำแหน่ง: `mycelium/mycelium.mjs:102`, `:109`, `:149`, `:158`, `:205`; `mycelium/orchestrator.mjs:26`, `:52`, `:61`, `:206`

สอง entrypoint มี process runner, timeout, args, role loading และ report handling ซ้ำกัน ค่า cwd เริ่มต้นต่างกัน (TEAM_DIR กับ PROJECT_ROOT) และ plannerPrompt ประกอบ prompt แยกจนไม่มี CONVENTIONS.md แบบ roleDirective ขณะที่ tier policy อยู่ทั้ง source, charter และเอกสาร

ข้อเสนอ: รวม runner และ prompt builder เป็นโมดูลที่ทั้งสอง CLI เรียกใช้ แยก provider transport ออกจาก scheduler รวมข้อมูล role/tier/mode/ownership ที่เครื่องต้องตรวจไว้ registry เดียว แล้วให้เอกสารอ้างหรือสร้างตารางจากแหล่งเดียว

### 8. [P2] Context ส่งต่อถูกตัด 6,000 ตัวอักษรโดยไม่บอกว่าขาดอะไร

ตำแหน่ง: `mycelium/mycelium.mjs:33`, `:338`

dependency ได้เพียงหัวคำตอบ ซึ่งอาจตัด acceptance criteria, blockers หรือ handoff ตอนท้าย ตัวอย่าง TP-001.answer.txt ของ run เดิมยาว 11,850 ตัวอักษร และ NEEDS_REQUIREMENT_CHANGE อยู่ใกล้ท้ายไฟล์ หาก task ถัดไปพึ่ง output นี้จะไม่ได้รับสถานะดังกล่าวใน context block

ข้อเสนอ: ส่ง structured handoff ที่มี state, blockers, IDs และ artifact paths ครบเสมอ จำกัดความยาวเฉพาะส่วนรายละเอียด พร้อมระบุว่ามีการตัด และให้ task เปิด artifact เต็มตาม path ที่ได้รับอนุญาต

## โครงสร้างที่แนะนำ

```text
mycelium/
  bin/
    mycelium.mjs          # parse args → เรียก application
    mycelium-role.mjs
  src/
    config.mjs           # load/validate/resolve workspace
    runner.mjs           # spawn, args, stdin, timeout, provider result
    prompts.mjs          # role + conventions + context
    plan.mjs             # schema, normalize, DAG validation
    scheduler.mjs        # dependency, task state, gates
    run-store.mjs        # manifest, attempts, checkpoints, resume
  roles/
  tests/
  agents.json
  mycelium.example.json
  CONVENTIONS.md
  MYCELIUM.md
  README.md
```

ยังใช้ package เดียวและ Node built-ins ได้ แยก local config ที่มี path ของเครื่องออกจาก package ด้วย --config หรือ config discovery และแยก run data ออกไปยัง workspace/user data directory ผ่าน --reports-dir โดยให้ npm link เดิมยังใช้ต่อได้ในช่วงย้าย

การอนุญาตเขียนปัจจุบันเป็น flag ทั้ง run ไม่ได้คำนวณจาก ownership ราย task และไม่มีการตรวจไฟล์ชนกันก่อนรันขนาน หากใช้ write mode ให้เพิ่ม task-level write scope และจัดคิวงานที่เขียน path เดียวกัน หลังทำสัญญาสถานะและ gate แล้ว

## ลำดับดำเนินการ

1. แก้ correctness: states/dependencies/gates, checkpoint/resume, target restoration, dry-run guard และ plan validation
2. เพิ่ม regression checks สำหรับ failure → dependent blocked, NEEDS_HUMAN, partial resume, target restoration, dry-run ทุก route, cycle/path traversal และ package content
3. ค่อยแยก runner/prompts/config/run-store/scheduler โดยรักษา CLI เดิม เพิ่ม task-level write scope เมื่อเริ่มใช้งานเขียนจริง
4. แยก machine config/run data และลดเอกสารที่ซ้ำกัน; ทำ Git baseline เพื่อรีวิวและย้อนการเปลี่ยนแปลงก่อน refactor ใหญ่

## ข้อจำกัดของผลตรวจ

การจำลองยืนยันพฤติกรรมของฟังก์ชัน scheduler/resume/validation แต่ไม่ได้พิสูจน์ sandbox ของแต่ละ provider, ความเข้ากันได้ของ model/effort ปัจจุบัน หรือ end-to-end บน target จริง ประเด็น dry-run และการคืน target ตรวจจาก control flow ของ source ยังไม่ได้เรียก CLI กับ provider จริง
