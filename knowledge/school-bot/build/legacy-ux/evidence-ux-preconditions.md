# เงื่อนไขตรวจหลักฐาน UX admin และข้อสอบ

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย int · ขอโดย ผู้ใช้ (ใบงาน 095 — จัดหลักฐานแบบที่อนุมัติแล้ว)

[UX-005](evidence-ux-005.md) ครอบคลุม 12 เกณฑ์ตรวจรับ (Acceptance Criteria: AC) และ [UX-007](../../modules/quiz/build/legacy-ux/evidence-ux-007.md) ครอบคลุม 16 เกณฑ์ตาม build/plan/tasks-001.json ไม่มีแบบใหม่ในงานนี้ ผลการเทียบเอกสารไม่ใช่ผลทดสอบ UI/runtime

## เงื่อนไขก่อนตรวจรับ

| เงื่อนไขจาก evidence-002 | Actual และผลต่อการตรวจ |
|---|---|
| UX sign-off | ผู้ใช้อนุมัติ Q39–Q46 รวมข้อความหมดเวลา 2026-10-26 ตามมติ 043 ไม่มีส่วนใหม่รอเซ็น |
| Auth/ผู้ตรวจ/H5 | DES-012 Rev9 แยก staff_admin/school_web/desktop; four-eyes ห้ามผู้สร้างหรือผู้แก้ร่างเผยแพร่เอง; H5 คือ route/env/network/trust และ staff bootstrap ของจริงยังต้องมีหลักฐาน |
| เนื้อหา | UX approval ไม่อนุมัติเนื้อหาแต่ละ revision หรือ numeric rubric; มติ 053 ให้พัฒนาบนร่าง/stub ได้ รอคนเซ็นเนื้อหาก่อนเชื่อมจริงตามงานที่กำหนด |
| DB/อุปกรณ์/ความปลอดภัย | ไม่มีการรัน SQL เชื่อม DB deploy หรือสั่งหุ่น; UX approval ไม่ปิดเงื่อนไข runtime/security/hardware |
| Dependencies | ทั้งคู่ขึ้นกับ BA-002 (ข้อกำหนดหลักสูตร) และ SA-002 (แบบ Learning); gate_ids ว่างตาม JSON ไม่ปรับสถานะแผน |

## เทียบข้อจำกัดเก่ากับสัญญาปัจจุบัน

ฐาน: [DES-005 หลักสูตร Rev9](../design/des-005.md), [DES-010 ข้อสอบ Rev6](../design/des-010.md), [DES-011 เลื่อน Level Rev7](../design/des-011.md), [DES-012 auth Rev9](../design/des-012.md) เลข Rev ของไฟล์ย่อยคงตามหัวไฟล์นั้น

| เรื่อง | Actual จากเอกสาร | ช่องว่างที่ยังต้องแยกจาก UX approval |
|---|---|---|
| Curriculum draft | [draft Rev2](../design/learning-curriculum-draft-001.md) มี list/detail/metadata และ approval read-back แล้ว | publish เต็มยังรอ storage: approval_ref 2048 กับ Reason 1000 ห้าม truncate |
| Sheet | [supplied-row Rev1](../design/learning-sheet-import-001.md) มี validator/preview ตัด O และสื่อ P–X อยู่ Lesson เดิม | source identity/manifest และ ImportSource รอคำตัดสิน; atomic commit/dedup/read-back ยังไม่พร้อม |
| Bank draft | [bank Rev2](../design/learning-bank-draft-001.md) มี list/detail/replace และ visibility แล้ว | publish/read-back หลักฐานเต็มรอ storage เช่น curriculum |
| Attempt | [attempt read Rev1](../design/learning-attempt-read-001.md) มี discovery/saved answers/history/policy/revision/reveal แล้ว | authority และเส้นทางบริการจริงยังต้องพิสูจน์ |
| หมดเวลา | [finalization Rev1](../design/learning-attempt-finalization-001.md) ตรึง clock, t_accept < deadline, race/replay/recovery คง state expired | local fake ทำได้; DB clock/durability/multi-process locks/worker ยังไม่มีผลจากงานนี้ |
| Aggregate/Level | [projection Rev1](../design/learning-snapshot-projection-001.md) มี aggregate และ snapshot reader แล้ว | JSON reconciliation/reader compatibility/roster authority ยังต้องพิสูจน์ ไม่ใช้ผลสดแต่งอดีต |

ข้อจำกัดเก่าใน companion UX ที่ว่าไม่มี route หรือ field ข้างต้นต้องเทียบสัญญาล่าสุด ไม่ใช้เป็นข้อสรุปปัจจุบัน การมีสัญญาไม่ยืนยัน implementation งานนี้ไม่แก้แบบที่เซ็นแล้วและไม่พบ AC ที่ไม่มีแบบรองรับ

## ส่งต่อ

check ตรวจ approval และ coverage จากตารางแต่ละงาน แล้วรับภาพ UI ผล request/read-back และผลผิดพลาดจริงแยกตาม AC ผล local/fake ไม่แทน integration ไม่มีคำถามขอเซ็น UX ซ้ำ

ข้อรอเดิมให้ผู้คุมส่ง arch/vault และผู้ใช้ตัดสินจากข้อเสนอที่มีอยู่: “อนุมัติขยาย Reason เพื่อเก็บ approval_ref ครบหรือไม่?” และ “อนุมัติ ImportSource พร้อม source identity/mapping สำหรับ import persistence หรือไม่?” ปลดล็อก publish/import ของจริง ไม่ขวางตรวจเอกสารหรือ preview บน stub int ไม่บันทึกคำอนุมัติแทนคน

## หลักฐาน

- [evidence-002 เงื่อนไขก่อนดำเนินงาน](../plan/evidence-002.md), [มติ 043 อนุมัติ UX](../../shared/decisions/decisions-043.md), [มติ 053 เปิดงานบน stub](../../shared/decisions/decisions-053.md) อ่านวันที่ 2026-11-03; ข้อความเก่าที่ว่า UX ยังไม่เซ็นไม่แทนมติ 043
- [authorization Rev9](../design/des-012-authorization.md); build/plan/UX-005.md, build/plan/UX-007.md และ build/plan/tasks-001.json ตรวจรายการ acceptance/req_ids/ac_ids ตรงทั้งสองงาน
- [trace admin เดิม](../../../schoolbright-web/modules/school-bot/build/legacy-ux/int-006-admin-trace-contracts.md), [trace Attempt เดิม](../../modules/quiz/build/legacy-ux/int-007-trace-constraints.md) ใช้ค้นข้อจำกัดเดิมเทียบสัญญาปัจจุบัน
