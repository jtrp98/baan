# Knowledge Base — ศูนย์กลางความรู้และสัญญาของระบบ

คลังเอกสารนี้จัดเก็บตามสถาปัตยกรรม **Modular 3-Slot Architecture** ของ BAAN โดยแบ่งเป็น 2 ระดับอย่างเคร่งครัด:

1. **ระดับ Project Root (`<project>/`)**: เก็บเฉพาะสิ่งที่เป็น **Cross-Cutting (ใช้ร่วมกันทั้งโปรเจกต์)**
   - `INDEX.md`: Master Portal นำทางหลัก + ตาราง Modules
   - `shared/`: ภาพรวมระบบ (`context.md`), ดัชนีข้อกำหนดรวม (`requirements.md`), มติสถาปัตยกรรม (`adr/`), คำถามค้างระดับระบบ (`oq/`), ช่องว่างความรู้ (`knowledge-gaps.md`)
   - `design/`: **Design System กลางเท่านั้น** (`system/` tokens/CSS, `assets/` brand/logos) — *ห้ามนำหน้าจอรายโมดูลมาวาง*
   - `build/`: **สถาปัตยกรรมเชื่อมระบบรวม & Shared DB** (`architecture/` host-gateway-grpc, `db/` schema รวม, `security/`, `plan/` tasks รวม) — *ห้ามตั้งชื่อโฟลเดอร์ build/design*

2. **ระดับ Module (`<project>/modules/<module>/`)**: **ของโดเมนไหน ต้องจบในโดเมนนั้นครบทั้ง 3 มิติ (Folder-First)**
   - `INDEX.md`: สารบัญโมดูลและสถานะปัจจุบัน (ห้ามเกิน 20 KB)
   - `shared/`:
     - `requirements/`: ข้อกำหนดฟีเจอร์ (`INDEX.md` + ไฟล์ย่อยราย Feature `F#` หรือ `REQ-#`)
     - `oq/`: คำถามค้าง (`INDEX.md` เฉพาะข้อที่ยัง `open` + โฟลเดอร์ `resolved/` สำหรับข้อที่ตอบแล้ว)
   - `design/`:
     - `feasibility/`: ผลสำรวจความเป็นไปได้หน้าจอและ UI States (`INDEX.md` + `R#-<topic>.md`)
     - `screens/`: สเปกหน้าจอและ UI Flow (`INDEX.md` + `D#-<screen>.md`)
     - `reviews/`: ผลตรวจ Usability & Accessibility (`INDEX.md` + `review-<screen>.md`)
     - `handoff/`: สัญญาส่งมอบหน้าจอให้ Dev (`INDEX.md`)
   - `build/`:
     - `contracts/`: สัญญาทางเทคนิค API / RPC / IPC / State Machine (`INDEX.md` + `contract-*.md` หรือ `des-*.md`)
     - `db/`: (ถ้ามี) SQL Migration / Schema เฉพาะโมดูลนี้
     - `test-plan/`: กรณีทดสอบและเกณฑ์ตรวจรับ (`INDEX.md` + `tp-*.md`)
