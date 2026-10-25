# Disposition workflow อัปเดต — Rev1

ต่อจาก [DES-007](des-007.md); สถานะอยู่ที่ [index](index.md)

### Disposition GAP-07 สำหรับผู้มีอำนาจ

| ทางเลือก | ผลต่อสัญญา/หลักฐาน | ข้อเสนอ arch |
|---|---|---|
| คง PrepareUpdate/InstallPreparedUpdate | เป็น operation แยกจาก check; REQ-030/BE-019 ครอบเฉพาะ check จึงต้องให้ spec เสนอ AC สำหรับ download/verify/install/recovery แล้วผู้ใช้อนุมัติ; gm จัด coverage/dependencies ภายใต้ gate เดิม | แนะนำเสนอให้คงแบบ explicit เพราะรักษา trusted update ที่ DES เสนอ โดยไม่แอบตีความว่า AC-030 รับรองแล้ว |
| check-only | BE-019 ทำ check ตาม AC-030-01..03; installer ภายนอกยังตาม REQ-031/032 แต่ workflow Prepare/Install ที่ DES เสนอจะไม่อยู่ในสิ่งที่ส่งมอบ | ถ้าเลือกต้องให้ผู้มีอำนาจยืนยัน disposition/ผลต่อ frozen scope ก่อน gm/spec amend; arch ไม่ตัดเอง |

Task SA-001/BE-019 · Reference GAP-07, DES-007, REQ-030 · Reason: coverage ยังไม่ลงรอย ห้าม build Prepare/Install จาก DES นี้ก่อนตัดสิน. ผู้มีอำนาจเลือกคง explicit workflow พร้อมให้ spec ร่าง AC หรือให้จัด disposition เป็น check-only? เป็นคำถามส่งผ่านนายช่างหลังแพ็กเอกสารพร้อม ไม่ถาม transport/OS/Guest ซ้ำ. รอบนี้ไม่เพิ่ม AC ไม่เปลี่ยน Release Scope/task status/dependencies/gates และ `install_supported=false` คงอยู่; ไม่ถือคำแนะนำเป็น approval

## หลักฐานและหัวข้อที่ spec ต้องรับต่อ

`app/desktopservice.go:109–115` เรียก GET /v1/updates/check; `web/src/SchoolBot.Api/Program.cs:96–99` คืน install_supported=false. [REQ-030](../requirement/req-030.md) กำหนด metadata-only; [BE-019](../plan/BE-019.md) รอ disposition ก่อนเปลี่ยน coverage. Source นี้ไม่ใช่ Prepare/Install proof

หากคง workflow ให้ spec ร่างเกณฑ์เรื่อง explicit intent, trust/hash/publisher pin/registry, staging TOCTOU, stop/close guard, expiry/withdraw/downgrade และ installer fail/repair ให้คนตรวจ. เป็นหัวข้อเสนอ ไม่ใช่ AC ใหม่. หาก check-only ให้เจ้าของ scope/แผนจัดการก่อน build; ไม่แก้ใบงาน gm เอง

## Change Log
- 2026-10-24 — Rev1: ใบงาน060a แยกสัญญาเฉพาะเรื่องและหลักฐาน; ไม่เปลี่ยน schema/gates/AC
- 2026-10-24 — **ผู้ใช้เลือก "คง PrepareUpdate/InstallPreparedUpdate"** ผ่านแบบฟอร์มคำถามของนายช่าง — บันทึกเป็น [decisions-036](../requirement/decisions-036.md): spec ร่าง AC-030-04..08 แล้ว (ข้อเสนอรอผู้ใช้ตรวจรับอีกครั้งตามเงื่อนไขของเอกสารนี้), inspect เพิ่ม TP001-080, gate/`install_supported=false` คงเดิมจน implement

