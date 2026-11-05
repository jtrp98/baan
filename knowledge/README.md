# Knowledge — เอกสารร่วมของโครงการ

เก็บ requirements, decisions, contracts, design, handoff, แผนงานและหลักฐานที่ทีมต้องใช้ โดยจัดตาม project และ module เอกสารในชุดนี้มีทั้งข้อมูลปัจจุบันและประวัติจากเครื่องมือรุ่นก่อน ชื่อผู้ทำงาน วันที่ สถานะ และผลตรวจให้ตีความตาม source และขอบเขตของเอกสารนั้น

## โครงสร้าง

```text
knowledge/
├── _shared/                    # ข้อกำหนดร่วมขององค์กร
└── <project>/
    ├── INDEX.md                # ทางเข้าของ project และตาราง module ที่สร้างจาก metadata
    ├── shared/                 # ข้อกำหนด มติ สัญญาร่วม และ brand
    ├── design/                 # เอกสารออกแบบระดับ project
    ├── build/                  # สัญญา แผน และหลักฐานด้านพัฒนา
    ├── changelog/              # ประวัติรายเดือน เพิ่มต่อท้าย
    └── modules/<module>/
        ├── INDEX.md            # metadata/status/platform/os/dependencies ของ module
        └── shared/ design/ build/
```

ไม่ใช่ทุก project ต้องมีทุกโฟลเดอร์ เอกสารเดิมอาจแยก requirements หรือ OQ เป็นหลายไฟล์ ให้เปิด INDEX และใช้พาธที่อ้างจริง ไม่ย้ายหรือรวมไฟล์เพียงเพื่อให้เหมือนตัวอย่าง

## วิธีอ่าน

1. เริ่มที่ `<project>/INDEX.md` และ INDEX ของ module แล้วอ่าน requirement/AC, decisions, contracts และ handoff ที่งานอ้างถึง
2. รักษา IDs และ alias เดิม เมื่อเอกสารขัดกันให้ตรวจวันที่ Rev และ source ของมติ ไม่อนุมานจากชื่อ role หรือสถานะอย่างเดียว
3. ชื่อ `gm`, `arch`, `front`, `sys`, `check` และชื่อผู้ทำงานเดิมในใบงานเป็นข้อมูลผู้รับผิดชอบ/ผู้บันทึกในบริบทนั้น ไม่ใช่คำสั่งเปิด execution role ของ BAAN ปัจจุบัน
4. สถานะโครงการ/เอกสารและ `verified` ในแผนเดิมไม่ใช่ package state `done` ของ run ใหม่ การจัดเอกสารไม่ได้ตรวจรับงาน เซ็น UX หรือรับรองผลทดสอบใหม่
5. บันทึกผลทดสอบ การส่งมอบ approval และจำนวนงานตามหลักฐานเดิม ไม่เพิ่ม verdict จากการอ่านหรือย้ายคู่มือ

การอ้าง `.claude/shared/conventions.md` หรือเลขหัวข้อของ conventions ในเอกสารเก่าเป็นบริบทของชุดกติกาวันนั้น เลขหัวข้อไม่จำเป็นต้องตรงกับ `CONVENTIONS.md` ใน package ปัจจุบัน ให้ตรวจ source ก่อนนำมาเป็นข้อกำหนดของงานใหม่

## BAAN 0.29.0

BAAN ใช้ execution engine เดียว: Orchestrator เตรียม goal/acceptance/scope → Planner เมื่อจำเป็น → Worker → Verifier ตามความเสี่ยง Core จัด dependencies, repository locks, machine gates และหลักฐาน ทีมออกแบบ `spec` (`/pencil`), `survey`, `ui`, `review` ใช้แบบคุยสดตาม Design System และ UX sign-off ของงาน

คู่มือ CLI, packet schema, provider setup และการอัปเกรดอยู่ใน package BAAN (`README.md`, `BAAN.md`, `CONVENTIONS.md`, `RELEASE-NOTES.md`) ใน checkout ของ BAAN นี้ package อยู่ที่ `framework/` ข้าง `knowledge/` เมื่อนำ knowledge ไปใช้ใน workspace อื่น ให้เปิดเอกสารจาก package ที่ติดตั้งจริง

- เริ่มด้วย `baan --version`, `baan --help` และ `baan --list --workspace <workspace>` เพื่อดูรุ่น/config/tiers ที่ใช้อยู่ Paths ของ target และ knowledge กำหนดใน `baan.config.json` ของ workspace
- เตรียม packet หรือ plan ที่มี AC พร้อมข้อความ/source ต้นฉบับ, repository-relative owns และคำสั่ง build/targeted/full test ที่ตรวจแล้ว ใช้ `baan run --packet <file>` หรือ `baan run --plan <file>`; `--dry-run` ตรวจ input/readiness โดยไม่สร้าง run หรือเรียก provider
- Run ที่ยังไม่อนุมัติใช้เก็บ inbox ได้ ต้องบันทึกคำตอบจริงด้วย `baan decide <package> --run <run-dir> --approve --by user --decision "..." --source "..."` ก่อน dispatch
- ประตู UX/schema/อื่น ๆ ใช้ `--gate <id>` พร้อม `--by user`, decision และ source แยกจาก acceptance approval; basis เปลี่ยนต้องยืนยันใหม่ตาม inbox ไม่อนุมัติแทนคน
- อ่าน `baan status`, `baan inbox`, `baan report` โดยระบุ workspace หรือ run directory ให้ตรงงาน แล้วใช้ `baan run --resume <run-dir>` หลังแก้ blocker หรือตอบคำถาม
- Run ใหม่และ evidence อยู่ `<workspace>/.baan/runs/<id>/` ไม่เขียนทับแผน/ผลตรวจใน knowledge หรือ memory เดิม เพิ่ม `.baan/` ใน gitignore ของ workspace และไม่แจกข้อมูล run เป็นเอกสารสาธารณะ

### คำสั่งและแผนเก่า

`baan-role`, `--write`, `--test-level`, `--date`, `--usage`, `--no-preflight` และ `--no-fallback` ไม่ใช่คำสั่ง/flags ของ CLI ปัจจุบัน ข้อความเหล่านี้ในคิว ใบงานและมติเดิมเป็นหลักฐานของ runner รุ่นนั้น วิธีใช้ปัจจุบันดูตารางอัปเกรดใน README ของ package

Tier ไม่ได้เลือก provider ถาวร: ตรวจ `agents.json` ที่ใช้อยู่ด้วย `baan --list` หากต้องตรึง provider/fallback ให้ใช้ agents config ที่ตรวจแล้วผ่าน `BAAN_AGENTS_FILE` โดยคง read-only provider สำหรับ Planner/Verifier หากข้อจำกัดจากมติเดิมทำตามไม่ได้ให้รายงานและขอการตัดสินใจ ไม่ตีความว่าเปลี่ยน routing หรือยอมรับ fallback ได้เอง

แผน tasks เดิมยังเป็น input ได้เมื่อมี AC/source, owns และ commands ครบ แต่ไม่มีการย้าย checkpoint, task status หรือ approval มาเป็นผลของ run ใหม่โดยอัตโนมัติ Run/checkpoint เดิมต้องใช้ BAAN รุ่นที่สร้างมัน การปรับเอกสารชุดนี้คง JSON และประวัติเดิม ไม่สร้างแผนใหม่หรือสั่ง rerun งานที่เสร็จแล้ว

### หลักฐานที่อยู่นอก knowledge

`memory/...`, `target/...`, reports และพาธเครื่องในเอกสารเป็นที่อยู่หลักฐานของ workspace ต้นทาง อาจไม่มีใน checkout นี้ ให้คงพาธต้นฉบับพร้อมระบุว่าเป็นหลักฐานภายนอก ถ้าไม่ได้แจกไฟล์นั้น ให้เขียนพาธเป็นข้อความอ้างอิงแทน Markdown link ที่เปิดไม่ได้ ไม่สร้างไฟล์เปล่าหรือเดาผลหลักฐาน

### การดูแลและ Git

- แก้เนื้อหาปัจจุบันให้ชัดเจนและรักษา ID เดิม เอกสารสัญญาที่เปลี่ยนความหมายเพิ่ม Rev/วันที่/ผู้แก้/ผู้ขอ และ append changelog รายเดือน; changelog และหลักฐานประวัติไม่ลบหรือเขียนความหมายย้อนหลัง
- สำหรับ `layout: project` ให้ชี้ config ไป knowledge root ที่แก้ แล้วใช้ `baan --index --config <config>` และ `baan --lint-knowledge --config <config>` ตาราง project สร้างจากหัว INDEX ของ module ไม่แก้ตารางด้วยมือหรือเปลี่ยนสถานะเพื่อให้ lint ผ่าน
- Knowledge ชุดนี้นำเข้าใน BAAN ด้วย Git subtree จึงไม่มี `.git` ของตัวเอง ใช้ Git ของ repository หลักและ subtree workflow ของ checkout; ไม่สร้าง `.git` ซ้อน ไม่ใช้ `git -C knowledge push`
- `baan --commit` ใช้เฉพาะ knowledge/memory ที่มี Git repo ของตัวเองตาม config; ไม่ใช้แทน subtree sync ไม่มี auto commit ของ target หลัง run
- การแก้เอกสารไม่ได้อนุญาต push/sync subtree, SQL/migration, deploy หรือ release งานเหล่านั้นต้องมีคำสั่งของผู้ใช้แยกตาม scope
