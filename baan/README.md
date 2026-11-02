# BAAN

BAAN แบ่งงานพัฒนาซอฟต์แวร์ให้ AI หลายตัวทำตามตำแหน่ง คล้ายทีมจริงที่มีคนเขียน requirement, คนออกแบบ, คนเขียนโค้ด และคนตรวจแยกกัน แต่ละตำแหน่งรันผ่าน AI CLI ที่ติดตั้งไว้ในเครื่อง (claude, codex, agy หรือ opencode) แบบ non-interactive

ทำไมต้องแยก: ถ้าให้ AI ตัวเดียววางแผน เขียนโค้ด เขียนเทส และตรวจงานตัวเอง ผลที่ได้มักไม่มีใครตรวจจริง BAAN เลยกำหนดว่า

- คนเขียนโค้ดไม่ใช่คนตรวจโค้ด และคนออกแบบ schema ไม่รัน SQL เอง
- เรื่องที่ต้องให้คนตัดสิน ทีมจะหยุดถามเสมอ ได้แก่ เรื่องธุรกิจ, การเปลี่ยน schema หรือ contract, การเซ็น UX, ผลตรวจที่ตกซ้ำ, ความเสี่ยงด้าน security, การ deploy และการตัด scope
- งานยากใช้ model แพง งานง่ายใช้ model ถูก ผ่านระบบ tier
- ทุก session เริ่มแบบอ่านอย่างเดียว จะแก้ไฟล์ได้ต้องสั่ง `--write`

ไม่มี runtime dependency ใช้แค่ Node.js 18 ขึ้นไป

## ติดตั้ง

ต้องมี AI CLI อย่างน้อยหนึ่งตัวที่ login แล้ว ถ้าใช้ agy ต้องติดตั้ง profile เพิ่มหนึ่งครั้ง ดู [setup/agy/README.md](setup/agy/README.md)

```bash
git clone https://github.com/jtrp98/baan
cd baan/baan
npm link
```

จากนั้นไปที่โฟลเดอร์ workspace ของคุณ แล้วสร้าง config

```bash
cd C:\src\myworkspace
baan --init
baan --list
```

`baan --init` สร้างไฟล์ 3 ไฟล์

| ไฟล์ | ใช้ทำอะไร |
|---|---|
| `baan.config.json` | path ของ repo โค้ด, ที่เก็บเอกสาร และค่า default ของ workspace นี้ (ดูตัวอย่างเต็มใน [baan.example.json](baan.example.json)) |
| `CLAUDE.md`, `AGENTS.md` | บอก AI session ที่เปิดในโฟลเดอร์นี้ให้ทำหน้าที่คุมงาน (ถ้ามีไฟล์ของคุณเองอยู่แล้ว จะไม่เขียนทับ) |

แก้ path ใน `baan.config.json` ให้ตรงเครื่อง แล้วรัน `baan --list` เพื่อตรวจว่าเห็นทุกอย่างครบ

## โครงสร้าง workspace

config อยู่นอก package เพื่อไม่ให้การอัปเดต BAAN ไปทับค่าของคุณ ตัวอย่าง workspace

```
C:\src\myworkspace\
  baan.config.json   config ของ workspace
  knowledge\         เอกสารที่ทีมใช้ร่วมกัน (requirement, design, test plan, backlog)
  memory\            สิ่งที่ทีม AI ใช้ทำงานต่อ (ใบงาน, คิว, ผลตรวจรายรอบ, หลักฐาน)
  target\            repo โค้ดที่ทีมจะแก้
  reports\baan\      ผลดิบของทุกครั้งที่รัน (คำตอบ, stdout, stderr)
```

- `knowledge` และ `memory` ควรเป็น git repo แยกกัน BAAN จะ commit ให้อัตโนมัติตอนจบงาน
- ถ้าไม่ตั้ง `memory_root` ทุกอย่างจะลง `knowledge`
- ทั้ง `baan` และ `baan-role` หา `baan.config.json` โดยไล่ขึ้นจากโฟลเดอร์ที่เรียก ถ้าต้องการระบุเองใช้ `--config <file>` หรือ env `BAAN_CONFIG`

## วิธีใช้

มี 2 แบบ

### แบบที่ 1: ให้ AI session คุมงาน (แนะนำ)

เปิด AI session ในโฟลเดอร์ workspace ไฟล์ `CLAUDE.md`/`AGENTS.md` ที่ `--init` สร้างไว้จะทำให้ session นั้นรับบทผู้คุมงาน (ในเอกสารเรียกว่า "นายช่าง") หรือสั่งตรงๆ ก็ได้

```
อ่าน C:\src\AICode\baan\baan\BAAN.md แล้วทำหน้าที่นายช่าง
เป้าหมาย: เพิ่มหน้า export รายงานคะแนน (โปรเจกต์: school-bot)
```

session นั้นจะอ่านเอกสารเดิม แบ่งงาน เปิด session ของแต่ละตำแหน่งด้วย `baan-role` ส่งผลต่อกัน และรวบรวมเรื่องที่ต้องให้คุณตัดสินมาถาม กติกาทั้งหมดของผู้คุมงานอยู่ใน [BAAN.md](BAAN.md)

ถ้าใช้แอปที่ไม่มี CLI ให้เรียก (เช่น ZCode) หรืออยากประหยัดโควตา ให้บอกว่า "solo" session นั้นจะทำงานทุกตำแหน่งเองด้วย subagent

### แบบที่ 2: โหมดอัตโนมัติ

รันทั้งก้อนโดยไม่ต้องมี session คุม ระบบจะให้ `gm` รับเป้าหมาย ให้ `plan` แตกเป็นแผน แล้วรันตามแผน งานที่ไม่ต้องรอกันจะรันพร้อมกัน

```bash
baan --target school-bot --goal "แก้บั๊ก login ค้าง" --dry-run   # ดูแผนก่อน ยังไม่รัน
baan --target school-bot --goal "แก้บั๊ก login ค้าง"
baan --resume <runDir>                                          # ต่อ run ที่ค้าง
```

แผนที่ได้ต้องมีงานเขียนโค้ดอย่างน้อยหนึ่งงานที่ไม่ต้องรอคนตัดสิน ของที่ยังรอคน (DB จริง, UX ที่ยังไม่เซ็น) ให้ใช้ stub ไปก่อน ถ้างานนั้นเป็นเอกสารล้วนจริงๆ ให้ใส่ `"docsOnly": "<เหตุผล>"` ในแผน

## ทีม

| ID | ชื่อ | หน้าที่ | tier |
|---|---|---|---|
| `plan` | นักวางผัง | แตก goal ใหญ่เป็นแผน DAG ที่เล็กที่สุดที่ได้งาน แล้วส่งให้ gm (เฉพาะงานใหญ่) | t2 |
| `gm` | ผู้จัดการหน้างาน | เป็นเจ้าของ plan.md, backlog และ release scope ข้าม run — คุ้มกัน scope creep (เฉพาะงานใหญ่) | t2 |
| `spec` | ผู้เขียนข้อกำหนด | เค้นความต้องการจริงออกจากผู้ใช้ แปลงเป็น REQ/AC/BR ที่ทดสอบได้ และทะเบียนคำถามค้าง (OQ) | t2 |
| `arch` | สถาปนิก | ออกแบบ DES และสัญญา API แบบเรียบง่าย ตรวจกับโค้ดจริง (as-built) เสมอ | t1 |
| `int` | นักออกแบบตกแต่งภายใน | ร่าง UX ราย feature รอคนเซ็น และดูแล design system | t2 |
| `front` | ช่างหน้างาน | implement ตาม UX ที่เซ็นแล้วเป๊ะ และสัญญา backend ตัวจริง — ไม่เพิ่มของที่ไม่ได้ขอ | เลือกราย task (t2–t5) |
| `sys` | ช่างระบบ | implement ตามสัญญาเป๊ะ — validation ครบทุกขาเข้า และ error contract สมบูรณ์ | เลือกราย task (t2–t5) |
| `vault` | ผู้ดูแลห้องนิรภัย | ออกแบบ schema กันบั๊กและเขียน SQL พร้อม rollback — แต่ห้ามรันเองเด็ดขาด | t2 |
| `inspect` | หัวหน้าตรวจรับ | ทำ TP, test matrix และ traceability ครบทุก AC — ล่าช่องโหว่ ไม่ใช่แค่ครอบคลุม | t2 |
| `check` | ผู้ตรวจงานอิสระ | เขียน unit test จาก spec และตัดสิน PASS/FAIL ราย task — ทำหน้าที่ศัตรูของโค้ด | t2 |
| `jpo` | จป. | ตรวจ OWASP และ PDPA/GDPR ตามพื้นผิวจริง แล้วประกาศ blocker ตามความเสี่ยงจริง | t2 |

ลำดับงานเต็มรูปแบบ: `plan` วางแผน, `gm` เรียกทีมตามแผน, `spec` เขียน requirement, `int` ร่าง UX ให้คุณเซ็น, `arch` ออกแบบ, `vault` เขียน SQL ให้คุณรัน, `front`/`sys` เขียนโค้ด, `inspect` วางแผนทดสอบ, `check` เขียนเทสและตัดสิน PASS/FAIL, `jpo` ตรวจ security ก่อนขึ้น production

งานเล็กไม่ต้องใช้ทั้งทีม `plan` และ `gm` เข้ามาเฉพาะงานใหญ่ที่ต้องมี backlog ต่อเนื่อง

แต่ละตำแหน่งคือไฟล์ใน [roles/](roles/) อยากเพิ่มหรือลดตำแหน่งก็เพิ่มหรือลบไฟล์ `.md` ได้เลย กติกาที่ทุกตำแหน่งต้องทำตามอยู่ใน [CONVENTIONS.md](CONVENTIONS.md) ซึ่งถูกแนบไปกับทุก prompt

## คำสั่ง

### baan

| คำสั่ง | ทำอะไร |
|---|---|
| `baan --init` | ตั้งค่า workspace ครั้งแรก |
| `baan --list` | ดู config, repo, ตำแหน่ง และ tier ทั้งหมด |
| `baan --goal "..." [--target <ชื่อ>]` | รันโหมดอัตโนมัติ (เพิ่ม `--dry-run` เพื่อดูแผนอย่างเดียว) |
| `baan --plan-file <file>` | รันแผนที่แก้เอง |
| `baan --resume <runDir>` | ต่อ run ที่ค้าง ข้ามงานที่เสร็จแล้ว และใช้ target เดิม |
| `baan --sweep "<ค่าเดิม>"` | หาทุกไฟล์ที่อ้างค่าเดิม แยกตามเจ้าของไฟล์ ใช้ก่อนเปลี่ยนชื่อหรือค่าที่ถูกอ้างหลายที่ |
| `baan --lint-plan <tasks.json>` | ตรวจแผน ตกถ้าไม่มีงานเขียนโค้ด, งานเขียนโค้ดเกินครึ่งรอคนตัดสิน หรือสถานะเกินจริง |
| `baan --commit` | commit เอกสารที่ค้างใน knowledge/memory ด้วยมือ |

### baan-role

เปิด session ของตำแหน่งเดียว เป็นคำสั่งที่ผู้คุมงานใช้

```bash
baan-role --agent codex --role spec --tier t2 --task "เขียน requirement ของหน้า export"
baan-role --agent codex --role sys --tier t3 --cwd C:\src\myworkspace\target\api --write --task "แก้บั๊ก..."
baan-role --all --role jpo --tier t2 --task "ตรวจ security ของ API ใหม่"
baan-role --list
```

| option | ความหมาย |
|---|---|
| `--agent <ชื่อ>` / `--all` | เลือก AI CLI ตัวเดียว หรือทุกตัวพร้อมกัน |
| `--role <ID>` | ตำแหน่งจากตารางด้านบน |
| `--tier <t0-t5>` | ระดับ model |
| `--cwd <dir>` | repo ที่ให้ทำงาน (ค่าเริ่มต้นคือโฟลเดอร์ที่เรียก) |
| `--write` | อนุญาตให้แก้ไฟล์ |
| `--model`, `--effort` | ระบุ model หรือ effort เอง แทนค่าของ tier |
| `--no-fallback` | ไม่สลับไป AI ตัวอื่นเมื่อโควตาหมด |

option ที่ใช้ได้ทั้งสองคำสั่ง: `--config <file>`, `--timeout <วินาที>`, `--date YYYY-MM-DD`

## ผลลัพธ์และสถานะงาน

ทุก role ต้องจบคำตอบด้วยสถานะเดียว: `DONE`, `PASS`, `FAIL`, `BLOCKED`, `NEEDS_DESIGN_CHANGE`, `NEEDS_REQUIREMENT_CHANGE` หรือ `NEEDS_HUMAN` BAAN ตัดสินจากสถานะนี้ ไม่ได้ดูแค่ exit code ของ CLI

- งานนับว่าสำเร็จเมื่อจบด้วย `DONE` หรือ `PASS` เท่านั้น
- `baan` และ `baan-role` คืน exit code 0 เมื่อทุกงานสำเร็จ ไม่อย่างนั้นคืน 1 พร้อมสรุปสาเหตุ
- งานที่พึ่งงานที่ล้มจะถูกข้าม แต่งานอื่นที่ไม่เกี่ยวยังทำต่อ
- ผลดิบของทุก run อยู่ที่ `<workspace>\reports\baan\<เวลา>-<role>-...\` และมี `report.json` สรุปสถานะ
- จบ run แล้ว BAAN จะ commit `knowledge` และ `memory` ให้ แยก commit ตาม module ถ้าผู้คุมงานเขียนเอกสารเองหลังจากนั้น ให้รัน `baan --commit` อีกครั้ง
- `--resume` รันใหม่เฉพาะงานที่ยังไม่สำเร็จ

timeout เริ่มต้นคือ 1800 วินาทีต่องาน (t0 ใช้ 3600) ลำดับความสำคัญคือ `--timeout` > `_timeoutSec` ของ tier ใน `agents.json` > `defaults.timeout_sec` ใน config > 1800

## Tier และ model

เลือก tier ตามความยากของงาน ตำแหน่งส่วนใหญ่ใช้ tier คงที่ตามตารางทีม มีแค่ `front` และ `sys` ที่เลือกตามงาน

| tier | เหมาะกับ | claude | codex | agy | opencode |
|---|---|---|---|---|---|
| t0 | ปัญหายากมาก ต้องคิดลึกที่สุด | opus / xhigh | gpt-6-astra / max | ไม่มี | ไม่มี |
| t1 | ออกแบบระบบ ตัดสินใจสำคัญ | opus / high | gpt-6.1-sol / high | gemini-4-argon-high | ไม่มี |
| t2 | โค้ดซับซ้อน หลายไฟล์ | opus / medium | gpt-6.1-sol / medium | gemini-4-argon-medium | ไม่มี |
| t3 | งานพัฒนาทั่วไป | sonnet / high | gpt-6.1-terra / medium | gemini-3.8-flash-medium | glm-5.3-flash / high |
| t4 | เขียนเทส, refactor เล็กๆ | haiku / medium | gpt-6-luna / medium | gemini-3.8-flash-low | glm-5.3-flash / low |
| t5 | สรุป จัดหมวด ตอบคำถามง่าย | haiku / low | gpt-6-luna / low | gemini-3.8-flash-low | glm-5.3-flash / low |

- "ไม่มี" หมายถึงค่ายนั้นยังไม่มี model ที่เก่งพอสำหรับ tier นั้น ถ้าใช้ `--all` ตัวนั้นจะถูกข้าม ถ้าระบุ `--agent` ตรงๆ จะ error
- ถ้า AI ตัวแรกติดโควตา ระบบจะสลับไปตัวถัดไปตาม `_fallback` ของ tier นั้น ถ้าล้มด้วยเหตุอื่นจะไม่สลับ
- ถ้า model เต็มชั่วคราว ระบบรอ 30 วินาทีและ 90 วินาทีแล้วลองใหม่ก่อนจะสลับ
- แก้ tier หรือเพิ่ม AI CLI ตัวใหม่ได้ที่ [agents.json](agents.json)

## AI CLI ที่รองรับ

| CLI | คำสั่งที่ BAAN เรียก | วิธีกันไม่ให้แก้ไฟล์ในโหมดอ่าน |
|---|---|---|
| claude | `claude -p --allowedTools ...` | อนุญาตแค่ tool อ่านไฟล์และคำสั่ง git แบบอ่าน (จึงรัน node/npm ไม่ได้) |
| codex | `codex exec -s read-only` | sandbox read-only ของ codex |
| agy | `agy --agent baan-readonly --print` | profile `baan-readonly` และ guard hook (ติดตั้งครั้งเดียว) |
| opencode | `opencode run -m ...` | ไม่ใส่ `--auto` ทำให้การกระทำที่ต้องขออนุญาตถูกปฏิเสธ |

- ส่ง prompt ทาง stdin เมื่อทำได้ เพื่อเลี่ยงปัญหา quote บน Windows
- agy โหมด headless อ่านไฟล์นอก cwd ไม่ได้ BAAN จึงส่ง `--add-dir <workspace>` ให้ในโหมดอ่าน ถ้าใช้โหมดเขียนแล้วต้องอ่านไฟล์นอก repo ให้รัน `node setup/agy/grant-read.mjs` หนึ่งครั้ง
- ทุกครั้งที่รันใช้โควตาของบัญชีที่ login CLI นั้นอยู่
- `--write` ให้ AI แก้ไฟล์ใน `--cwd` ได้ ควรใช้กับ git repo เพื่อดู diff ได้

## เอกสารที่ทีมเขียน

ทีมแยกเอกสารเป็น 2 ที่ ก่อนเขียนไฟล์ไหนจะถามก่อนว่า "คนที่ไม่ได้รัน BAAN ต้องใช้ไฟล์นี้ไหม"

- `knowledge` เก็บสิ่งที่คนอื่นต้องรู้หรือใช้ตัดสินใจ เช่น requirement, มติ, design, contract, schema, test plan, backlog ทุกไฟล์เขียนให้ dev ในทีมที่ไม่เคยรัน BAAN อ่านรอบเดียวรู้เรื่อง แก้ทับให้เป็นข้อมูลปัจจุบันเสมอ และเก็บประวัติการแก้ไว้ที่ `changelog/YYYY-MM.md` ของแต่ละ module
- `memory` เก็บสิ่งที่ทีม AI ใช้ทำงานต่อ เช่น ใบงาน คิว ผลตรวจรายรอบ หลักฐาน

รายละเอียดอยู่ใน [CONVENTIONS.md](CONVENTIONS.md) หัวข้อ 3

## พัฒนา BAAN

```
bin\       baan.mjs, baan-role.mjs (entrypoint ของสองคำสั่ง)
src\       config, runner (เรียก CLI), prompts, plan, scheduler, run-store, init, sweep, knowledge-commit
roles\     prompt ของแต่ละตำแหน่ง
setup\agy\ profile อ่านอย่างเดียวของ agy
scripts\   live-smoke.mjs
tests\     regression tests
```

```bash
npm test               # ไม่เรียก AI จริง ไม่ใช้โควตา ต้องผ่านทั้งหมดก่อน commit
npm run smoke:live     # ทดสอบกับ AI CLI จริงทุกตัว ใช้โควตาจริง
```

`npm run smoke:live -- --tier t3 --agents claude,codex` เลือก tier และ CLI ที่จะทดสอบได้ ตัวทดสอบตรวจว่าอ่านไฟล์ได้จริง, โหมดอ่านกันการเขียนได้จริง และ `--write` เขียนได้

สิ่งที่เปลี่ยนในแต่ละรุ่นอยู่ใน [RELEASE-NOTES.md](RELEASE-NOTES.md)
