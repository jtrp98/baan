# Project ในเครื่อง — migration และ receipt

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [ขอบเขตการบันทึก Project ในเครื่อง](local-project-boundary-001.md) กำหนดการย้ายงานเดิมและการกู้เมื่อบันทึก receipt ไม่สำเร็จ

## การอ่านข้อมูลเดิม

อ่าน SchoolBotPoC ก่อน ArmStudioPoC และ fallback เฉพาะเมื่อไม่มีไฟล์ ไม่ fallback เมื่อไฟล์เสียหรืออ่านไม่ได้ ใช้ deterministic UUID seed เดิมจาก source app/slot/mode ไม่ใส่ path/time/source hash เก็บ source bytes เดิม Slot เสียไม่ขัด slot อื่น Invalid legacy JSON/schema/content/size คืน `MIGRATION_UNSUPPORTED`; I/O หรือ containment failure คืน `STORE_UNAVAILABLE`

Arm ที่ระบุ t/ts/v/enum/bounds ผิดต้อง reject slot ไม่ clamp/default/truncate ใช้ optional default เฉพาะที่พิสูจน์จาก legacy reader แล้ว กลุ่ม legacy ที่ผิดให้ละเฉพาะกลุ่มเสีย เก็บกลุ่มดีและเตือนผ่าน `MigrationResult.Message` เดิม ส่วน v2 ใหม่ต้อง valid ทั้งหมด

Blockly รองรับ 3 types รวม enabled/fields/body จริง ไม่แก้ malformed number เป็น 1 และไม่เปิด disabled เอง Unsupported คืน `MIGRATION_UNSUPPORTED` แยก allowlist legacy จาก v2 ไม่ปฏิเสธ Blockly metadata ที่รองรับเพราะใช้ strict v2

## Commit และการกู้ receipt

Commit project ก่อน receipt ภายใต้ lock เดียว Receipt ต้องตรวจ schema/app/mode/hash H/ID แบบ strict; H คือ SHA-256 ตาม [ชนิดข้อมูลกลาง](data-dictionary/contract-001.md)

| State | ผล/การกู้ |
|---|---|
| project+receipt สำเร็จ | migrated |
| project สำเร็จ receipt write/sync/close/replacefail | error/STORE_UNAVAILABLE, คืน projectID ได้ ไม่รายงาน migrated/ไม่ลบ project เพื่อ rollback |
| validreceipt+validproject | skipped_up_to_date คง user edits |
| receipt absent/project revision 1 ตรง deterministic conversion ปัจจุบันทั้ง mode/name/content | กู้เฉพาะ receipt หลังตรวจใต้ lock ใช้ hash ของ source bytes ครั้งกู้ ไม่เขียน project ซ้ำ |
| receipt absent/project ถูกแก้หรือพิสูจน์ไม่ได้ | STATE_CONFLICT คง project/source ไม่สร้าง receipt อ้างสำเร็จ |
| validreceipt/source hash เปลี่ยน/destination มี | skipped_existing คง project+receipt เดิม |
| corrupt/mismatchedreceipt หรือ receipt มีแต่ project หาย | STATE_CONFLICT ไม่ overwrite/resurrect |

## การแยกหน้าที่และเกณฑ์ตรวจ

แยก file I/O และ platform locking จาก store แยก migration orchestration/receipt จาก Arm และ Blockly adapters ตามหน้าที่ ไม่เพิ่ม framework ลำดับแก้คือ containment/shared locks/entitlement recheck แล้ว strict codec, receipt/legacy และ depth/pure fuel ตามกฎในไฟล์หลัก

ต้องตรวจสอง instances, สอง processes, crash lock release, root/ancestor/receipt junction, swap fixture ที่ setup สำเร็จ, strict JSON ของ array ความยาว 5/6/7, empty roundtrip, receipt failure ทุกขั้น และ restart recovery macOS ต้องตรวจ runtime บน macOS เอง ไม่ใช้ Windows cross-compile แทน
