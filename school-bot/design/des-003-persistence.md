# DES-003 — หลายโครงงาน Local/Cloud — สถานะ การแก้ข้อมูลชน และการกู้คืน

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-003 — หลายโครงงาน Local/Cloud](des-003.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `U` = UUID; `H` = SHA-256 hex 64 ตัว; `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## สถานะ การแก้ข้อมูลชน และการกู้คืน

`clean → dirty → saving → clean|conflict|save_failed`

ขณะ saving ถ้าแก้ต่อ ให้ snapshot ที่ส่งมี revision ของตัวเอง ผลตอบเก่าไม่ล้าง dirty ของการแก้ใหม่ Cloud ขาด If-Match → `428 PRECONDITION_REQUIRED`; ชน → `412 VERSION_CONFLICT` พร้อม `details.current_etag`; ให้ reload หรือ Save As ไม่มี silent last-write-wins/auto-merge. Local counter ชนใช้ VERSION_CONFLICT โดยไม่มี HTTP และคืน current_local_revision

404 รวมงานที่ไม่มีสิทธิ์เห็น; 400 PROJECT_INVALID, 413 PROJECT_TOO_LARGE, 409 PROJECT_EXISTS/STATE_CONFLICT, 503 STORE_UNAVAILABLE; local ใช้ codes เดียวกันโดยไม่มี HTTP

Guest write ใช้ per-project lock + atomic replace; index เป็นข้อมูล derive/rebuild ได้ ไม่ใช้ index สำเร็จแทนไฟล์สำเร็จ ป้องกัน traversal/symlink escape และ concurrent writer

Cloud timeout ใช้ idempotency key เดิม; ถ้าค้างไม่อ้าง saved Login ที่ offline ยังแก้ draft ในหน่วยความจำได้ ไม่สลับเป็น Guest เอง. ข้อเสนอ encrypted Cloud recovery snapshot แยก P ใช้ `base_etag` แบบ opaque; เป็นเรื่อง retention/custody ของ Cloud cache แยกจาก Guest policy ที่ยืนยันแล้ว และยังไม่อนุญาตให้เปิด Cloud cache ข้ามบัญชี. Close guard ต้องให้ retry หรือ explicit discard

Cloud create/copy retry ต้องใช้ Idempotency-Key:U และ payload เดิมจนทราบผล; ห้ามสร้าง key ใหม่เพราะ timeout

## การย้ายข้อมูลเดิม

อ่าน slot ใน SchoolBotPoC ก่อน ArmStudioPoC ตามพฤติกรรมเดิม ถ้าปลายทางใหม่มีแล้วไม่ import ต้นทางเก่าทับ ตรวจขนาด/JSON/content ก่อนแปลง

สร้าง UUID แบบ deterministic ต่อ source slot และ mode พร้อม local receipt:
`{schema:1,source_app:"SchoolBotPoC"|"ArmStudioPoC",mode,source_hash:H,project_id:U}`
เขียน project ก่อน receipt; rerun ตรวจ ID/hash แล้วไม่ overwrite งานที่ผู้ใช้แก้ ต้นฉบับคงอยู่เสมอ ไฟล์เสียแจ้งแยกและไม่ขัดขวางโครงงานอื่น

Legacy Code คงจุดโหลด UI ที่นับ UTF-16 code units ≤16384 และขนาดไฟล์รวม ≤1 MiB; ไม่เพิ่มเงื่อนไข source UTF-8 bytes ที่โหลด/บันทึกแทน REQ. เพดาน source 16384 bytes ตรวจตอนรันใน engine; source หลายไบต์อาจโหลดได้แต่รันถูกปฏิเสธ ต้องแสดงข้อผิดพลาดโดยไม่ทิ้งต้นฉบับ. Blockly adapter แปลงเฉพาะสาม block types ที่อ่านพบ; unsupported content คืน MIGRATION_UNSUPPORTED ไม่ทิ้งเงียบ

Guest→Login ใช้ explicit selection+copy เป็น Cloud ID ใหม่หลังแสดงบัญชี/โรงเรียนปลายทางตาม [REQ-041 (เลือกนำเข้าโครงงาน Guest)](../requirement/req-041.md); Guest policy ยืนยันแล้ว ไม่รอ [OQ-007 (หน่วยของโครงงานและการใช้เครื่องร่วมกัน)](../open-questions/oq-007.md) ซ้ำ. การเลือกประวัติเป็นอีก operation ตาม [guest-history-001.md](guest-history-001.md); ครูนำเข้า Project ได้ แต่ห้ามสร้าง Submission/Attempt Cloud ตาม [มติ 032 (ผลทดลองของครูและ cardinality/การล็อก mapping คะแนน)](../requirement/decisions-032.md)

Import ไม่ส่ง Cloud project_id; Host เก็บ receipt ก่อนส่งและเติม cloud K หลัง durable response. รูปแบบ, identity, การกู้หลัง restart/คำตอบหาย และ server tombstone ตาม [guest-import-001.md](guest-import-001.md); ไม่เพิ่ม ClientId column

