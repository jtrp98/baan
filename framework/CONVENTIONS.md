# CONVENTIONS — สัญญาร่วม

ใช้กับ Orchestrator, ทีมสร้าง (5 บทบาท) และทีมออกแบบ (3 บทบาท) ที่คุยสด; execution roles ใช้ contract ใน `prompts/` และ structured schemas
ปฏิบัติตามสัญญาการเรียนรู้และการตัดสินใจทางวิศวกรรมใน [LEARNING.md](LEARNING.md)
Core ไม่แนบเอกสารนี้ซ้ำในทุก call

## ขอบเขตและหลักฐาน

- วางแผนก่อนทำเสมอ (`/plan` first): สำรวจบริบท ตั้งคำถามเมื่อไม่ชัด และให้คนเห็นชอบแผนก่อนแก้ไขจริง
- อ่าน INDEX ก่อน แล้วอ่าน source ที่งานอ้างถึงและไฟล์ที่จำเป็นต่อ scope เท่านั้น
- Source จริงชนะความจำ แยกข้อเท็จจริง สมมติฐาน และ OQ ชัดเจน ห้ามแต่ง test results หรือ approval
- เขียนเฉพาะส่วนที่ได้รับมอบหมาย เจ้าของไฟล์อื่นเสนอแก้ผ่าน OQ; ห้ามแก้ของคนอื่นเงียบ ๆ
- ตอบภาษาไทย ยกเว้น code/identifiers และ convention ของ target; ใช้วันที่ของงานหรือวันที่ปัจจุบันของ session
- การตรวจอิสระใช้ acceptance/contracts/diff/evidence โดยไม่ใช้คำอธิบายของคนเขียนโค้ดเป็นข้อพิสูจน์
- ห้ามเห็นด้วยกับผู้ใช้เพียงเพราะผู้ใช้เป็นผู้ตัดสินใจ; หากมีข้อผิดพลาดหรือความเสี่ยงต้องแย้งด้วยหลักฐาน
- อย่าถือว่าการเห็นตรงกันของหลาย Agent เป็นหลักฐาน; ห้าม Overengineer เพื่อแก้ปัญหาที่ยังไม่มีหลักฐาน
- ไม่เปิด role อื่นหรือเรียก BAAN ซ้อนจาก execution role; หนึ่ง writer ต่อ repository รวม linked worktrees
- ขอบเขตเครื่องมือภายนอกและ ToS ของ 3 ค่าย (OpenAI, Anthropic, Google): เชื่อมต่อผ่าน official CLIs (`codex`, `claude`, `agy`) แบบ sanctioned subprocess adapters เท่านั้น ห้ามส่อง credentials/tokens ส่วนตัวของ CLI อื่น (เช่น `.credentials.json`, `auth.json`), ห้ามยิง private/internal web APIs (เช่น backend web chat APIs), ไม่ทำ User-Agent spoofing, ไม่ bypass rate limits/quotas, ไม่ทำ cross-provider distillation และยึดหลัก Account Safety First เสมอ
- ใบงาน/Packet ระบุประเภทงานด้วย `"kind": "code"` หรือ `"kind": "docs"`: งาน Docs อนุญาตให้ Worker ใช้ Tier ประหยัด (t4/t5) และใช้ Hybrid Verification (เอกสารทั่วไปตรวจผ่าน linter + human gate, เอกสารวิกฤตใช้ LLM Verifier); งาน Code ควบคุมด้วย Contract-Gated Risk Policy (งาน high risk ล็อค Worker t2 ขึ้นไป และลด tier ได้เฉพาะเมื่อมี contracts)

## การใช้ Subagents ภายใน Role (ทุก Role และทุก Tier)

Subagents ของแต่ละ CLI (codex: `collaboration.spawn_agent` + `collaboration.wait_agent` · Claude Code: the `Agent` (`Task`) tool · agy: `invoke_subagent`) ได้รับอนุญาตทั้งในโหมดอ่านและโหมดเขียน เพื่อช่วยให้งานเสร็จเร็วขึ้นตาม 3-Step Workflow:
- **ขั้นที่ 1 — สำรวจบริบท**: ใช้ Subagent (รุ่นเร็ว/ประหยัด เช่น sonnet/haiku บน Claude, flash บน agy) ค้นหาโค้ดหรือเอกสารขนานกัน แล้วส่งกลับเฉพาะข้อสรุปเพื่อรักษา Context ตัวหลักให้สะอาด
- **ขั้นที่ 2 — ตัวหลักวางแผน (/plan first)**: ตัวหลักวิเคราะห์และทำข้อตกลง/สอน/ท้าทายกับผู้ใช้จนได้ Approved Plan
- **ขั้นที่ 3 — เขียนเอกสาร/ลงมือทำ**: สั่ง Subagent ไปเขียน Docs ยาวๆ (`requirements.md`, `adr/`, `feasibility.md` ฯลฯ) หรือทำงานย่อยตามแผน
- **กฎเหล็กการเขียน**: หนึ่ง writer ต่อ repository เสมอ — Subagent เขียนได้เฉพาะไฟล์ที่ไม่มีใครแตะ และ Subagent ที่ใช้ตรวจงานต้องได้รับเฉพาะ AC/สัญญา/path เท่านั้น ห้ามส่งคำอธิบายของคนทำไปให้ (ป้องกัน Shared-Assumption Bias)

## ประตูมนุษย์และการตัดสินใจ

การตัดสิน business, schema/migration/breaking contract, security, UX sign-off, deploy และ release scope เป็นของคน
ทุกการตัดสินใจทางเทคนิคสำคัญต้องผ่าน **Learning Protocol (8 ขั้นตอน)** และ **Decision Quality Gate (8 คำถาม)** ตาม [LEARNING.md](LEARNING.md)
บันทึกใคร/เมื่อไร/source ตามคำตอบจริง งานที่ต้องใช้คำตอบนั้นรอ; งานอิสระทำต่อได้
Acceptance ต้องได้รับการยืนยันก่อน dispatch และยืนยันใหม่เมื่อ source/scope/commands เปลี่ยน
Approval และแต่ละ human gate ผูกกับ basis ของ packet ปัจจุบัน; มติเดิมเป็น source ได้แต่ไม่เซ็น audit record ของ run ใหม่โดยอัตโนมัติ
`DONE`/`PASS` ของโมเดลไม่ใช่ความสำเร็จของ run: core ตรวจ schema, machine evidence และ risk policy อีกชั้น
Rework สูงสุดตาม budget (default 2) แล้วถามคน; ไม่มีการลดมาตรฐาน test เพื่อให้ผ่าน

## Knowledge

- Knowledge = สิ่งที่ทีมคนต้องใช้ตัดสินใจวันนี้: requirements, decisions, contracts, design, handoff, OQ, gaps
- บันทึกช่องว่างความรู้ใน `<project>/shared/knowledge-gaps.md` และบันทึกการตัดสินใจสถาปัตยกรรมใน `<project>/shared/adr/`
- Memory เดิมเป็นประวัติ อย่าย้าย/เขียนทับ; หลักฐาน run ใหม่อยู่ `.baan/runs/<id>`
- เขียนทั้งไฟล์ให้เป็นความจริงปัจจุบัน ไม่ append override ทับกติกาเก่า; ประวัติอยู่ Git และ changelog
- ID ไม่ใช้ซ้ำ ไม่เปลี่ยนหมายเลข; เก็บ ID เก่าที่ถูกอ้างผ่าน `shared/id-map.md`
- เอกสารสัญญามี Rev/วันที่/ผู้แก้/ผู้ขอ; การเปลี่ยนความหมายเพิ่ม Rev และ append changelog รายเดือน
- Changelog/backlog/security findings เป็น append-only; ไม่ลบข้อมูลประวัติเพื่อ cleanup
- Knowledge อ้าง memory ที่ไม่ได้แจกให้ทีมด้วยข้อความ; ไม่สร้างลิงก์ไป path ที่ผู้อ่านไม่มี
- ไฟล์ยาวให้แยกตามเรื่องและมี INDEX; ไม่คัดลอกเอกสารข้าม project

## Layout และเจ้าของ

`layout: project`: 
- **ระดับ Project (`<project>/`)**: เก็บเฉพาะสิ่งที่เป็น Cross-Cutting ทั้งโปรเจกต์ (`INDEX.md` เป็น Master Portal, `shared/` ความจริงร่วม/Glossary/ADR/ดัชนี REQ รวม, `design/` Design System กลาง/Brand Assets, `build/` สถาปัตยกรรมเชื่อมระบบรวม `build/architecture/` และ Shared DB `build/db/` — *ห้ามตั้งชื่อโฟลเดอร์ build/design ซ้ำซ้อนกับ design UX/UI*)
- **ระดับ Module (`<project>/modules/<module>/`)**: ของโดเมนไหนต้องจบในโมดูลนั้นครบ 3 ช่อง (`shared/`, `design/`, `build/`) และมี `INDEX.md` ประจำโมดูล
- **Folder-First & Progressive Disclosure**: เพื่อป้องกัน Context Bloat ของ AI ให้ใช้โฟลเดอร์ย่อยที่มี `INDEX.md` คุมหน้าบ้านเสมอ (`shared/requirements/`, `shared/oq/`, `design/feasibility/`, `design/screens/`, `build/contracts/`, `build/test-plan/`)
  - ไฟล์ `INDEX.md` ต้องสั้นกระชับ (ห้ามเกิน 20 KB) ห้ามใส่ประวัติยาวหรือบันทึก Canvas ย้อนหลังลงใน INDEX
  - ไฟล์ `.md` ทั่วไปไม่ควรเกิน 50 KB หากยาวให้แยกไฟล์ย่อย และคำถาม OQ ที่ตอบแล้วให้ย้ายไป `oq/resolved/`
`shared` ระบุ owner ของเอกสาร, `design` เป็นทีมออกแบบ UX/UI, `build` เป็นสัญญา/หลักฐานส่งมอบด้านพัฒนา
`shared/requirements/` (หรือ `shared/requirements.md`) จัด feature `F#` → requirement `R#` → AC; OQ อยู่ `shared/oq/` (หรือ `shared/oq.md`)
หัว INDEX เป็นแหล่งจริงของ status/updated/depends_on/requested_by/target/platform/os
สถานะ `draft → approved → designed → reviewed → built` ต้องสะท้อนหลักฐานและการเซ็นของคนจริง
สถานะเอกสาร/โครงการไม่ใช่ package state ใน `.baan/runs`; ไม่แปลงสถานะหรือยอดผลตรวจเดิมจากการอัปเดตคู่มือ
`baan --index` สร้างตาราง project จากหัว module; ไม่แก้ตารางที่สร้างเองด้วยมือ
ไม่ตั้ง layout ใช้โฟลเดอร์ module เดิมและเส้นทางที่งานระบุ

## Git และการส่งมอบ

อ่าน Git ได้ ห้าม reset/revert/commit/push/เปลี่ยน branch ของ target โดยพลการ
`baan --commit` เก็บเฉพาะเอกสารใน knowledge/memory roots ที่มี Git ของตัวเองตาม config
ไม่รัน SQL/migration/deploy บนระบบร่วม ไม่มี network หรือ permission เพิ่มโดยอนุมานจากใบงาน
ทีมส่งผลสั้น ๆ: สิ่งที่ตัดสิน/ไฟล์ที่แก้/หลักฐาน/คำถามค้าง/ผู้รับต่อ; ห้ามอ้างว่าเซ็นแล้วถ้าคนยังไม่เซ็น
