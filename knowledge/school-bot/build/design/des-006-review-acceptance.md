# DES-006 — Coverage และข้อเสนอเกณฑ์ตรวจ SA-003

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย arch · ขอโดย ผู้ใช้ (SA-003 — ส่งต่อเกณฑ์จาก requirement เดิม)

ส่วนของ [ผลทบทวน Host/IPC/หุ่น](des-006-review.md) ตารางนี้ตรวจความครบของเอกสารที่เตรียม ไม่ใช่ QA verdict ว่า implementation ผ่าน AC การปิด G-ROBOT-CONTRACT ต้องมีคำตัดสินของคนแยกต่างหาก

## เกณฑ์ใบงานและ close_evidence

| Criterion | Deliverable / วิธีตรวจ | Expected | Actual ของงานเอกสาร | ข้อจำกัด |
|---|---|---|---|---|
| Payload | [payload](des-006-review-payload.md#input-และผลเฉพาะ-action) เทียบ C++ handlers | ทุก Host action มี input/output/default/bounds | ครบ 9 actions รวม alias/nested group/exchange | board reply grammar ยังไม่มีหลักฐาน |
| Validation | [IPC](des-006-review-ipc.md#envelope-เดิมและ-validation-ที่ต่างกัน), [payload](des-006-review-payload.md#c2--ขอบเขตเสนอรอคน-review) | แยก schema/code/ข้อเสนอเข้มขึ้น | ครบ; C1/C2 ติดป้าย breaking | ไม่ได้เปลี่ยน runtime |
| Bounds | [IPC](des-006-review-ipc.md#bounds-และเวลาเดิม) และ payload | byte budget, numeric ranges, group/profile ชัด | ครบ พร้อม default/units | ไม่ใช่ hardware SLA |
| Request matching | [IPC](des-006-review-ipc.md#envelope-เดิมและ-validation-ที่ต่างกัน) และ simulator | protocol/ID ตรง, กัน late result | ครบ; แยก ID กับ generation/context | stale serial reply ID เดิมยังพิสูจน์ freshness ไม่ได้ |
| Timeout/cancel | [lifecycle](des-006-review-lifecycle.md#ลำดับเดิมที่อ่านพบ) และ IPC | cancel ≠ physical stop; deadline/drain แยก | ครบ | ไม่ได้รัน OS/process tests |
| Drain→stop | [lifecycle](des-006-review-lifecycle.md#c3--สัญญาลำดับที่เสนอรอคน-review) | cancel/reap/drain ก่อน stop, admission กันแทรก | ครบแบบ review; C3 breaking | host reservation ยังไม่มี, รอคนที่ BE-010 |
| Written/predicted/measured | [ตารางความหมายผล](des-006-review-lifecycle.md#written--predicted--measured--simulated) | ไม่ใช้ write/timer เป็นผลวัดจริง | ครบ แยก simulated/unknown ด้วย | mechanical accuracy/stop proof รออุปกรณ์ |
| Windows/Darwin HID/Serial | [platform](des-006-review-platform.md#baseline-ที่อ่านพบ) | ของเดิม/สิ่งต้องเพิ่ม/compatibility แยก | ครบ; native Darwin ยังไม่มี | ไม่ได้ทดสอบ runtime/hardware/installer |
| Breaking review | [รายการ C1–C7](des-006-review.md#รายการเปลี่ยนที่เสนอให้ทบทวน) | ประเภท+consumer impact+ผู้ตัดสิน | รายการครบ; คำตัดสินรอคน | gate ผูก BE-010 ไม่ใช่อนุมัติโดย arch |
| Fake สำหรับ BE-010/Labs | [scenarios](des-006-review-scenarios.md#กรณีทดสอบที่ต้องส่งต่อ) | deterministic timeout/partial/stale/stop/lost โดยไม่ต่อจริง | แบบ harness/expected ครบ | เป็นเอกสาร ไม่อ้างว่ามี implementation ใหม่ |

## หลักฐาน

- Acceptance ของ SA-003 ใน build/plan/SA-003.md และ build/plan/tasks-001.json:1296–1322 ระบุ drain→stop, written/predicted/measured และ Darwin HID/Serial/compatibility; ไม่มี ac_ids ที่ตรึงไว้
- build/plan/tasks-001.json:266–272 กำหนด payload/validation/bounds/request matching/timeout/cancel/drain-stop และ Windows/Darwin compatibility เป็น close_evidence
- Source ของแต่ละประเด็นและวันที่ตรวจอยู่ในหัวข้อหลักฐานของไฟล์ย่อย ไม่ได้รัน tests ของ target และไม่ได้สั่งอุปกรณ์

## ข้อเสนอ ac_ids ให้ผูก SA-003

เลือกจาก requirement เดิม 17 AC ต่อไปนี้ ให้นายช่างพิจารณาตรึงก่อนงานตรวจรอบถัดไป ไม่เพิ่ม AC ไม่เปลี่ยน plan/oracle ของใบงานนี้

| Requirement และความหมาย | ac_ids เดิมที่เสนอ | ส่วนที่ใช้เตรียมตรวจ |
|---|---|---|
| [REQ-013 (ขอบเขต sample/preview/mock)](../../modules/app-shell/shared/requirements/req-013.md) | AC-013-01, AC-013-02, AC-013-03 | missing bridge ไม่ fallback, preview ไม่เรียก API, sample ไม่ส่ง USB/copy/เก็บผลจริง |
| [REQ-014 (ค้นหาและเชื่อมต่อหุ่น)](../../modules/arm-lab/shared/requirements/req-014.md) | AC-014-01, AC-014-02, AC-014-03 | เริ่ม disconnected, target/profile/probe ก่อน connected โดยไม่ movement |
| [REQ-021 (ขอหยุดและยกเลิกงานค้าง)](../../modules/arm-lab/shared/requirements/req-021.md) | AC-021-01, AC-021-02, AC-021-03, AC-021-04 | drain ก่อน stop, late callback ไม่ส่งต่อ, stop failure ไม่อ้างหยุดจริง, exit ขอ stop |
| [REQ-022 (อ่านค่าตำแหน่ง servo)](../../modules/arm-lab/shared/requirements/req-022.md) | AC-022-01, AC-022-02, AC-022-03 | ID/PWM ตรง profile; ครบหกก่อนสร้างท่า; error ไม่ commit บางส่วน |
| [REQ-024 (การเชื่อมต่อขาดและคำสั่งล้มเหลว)](../../modules/arm-lab/shared/requirements/req-024.md) | AC-024-01, AC-024-02, AC-024-03 | idle lost/error/no retry/reconnect ไม่ replay; busy/cancelled ไม่ lost โดยตัวมันเอง |
| [REQ-032 (ติดตั้งแอปบน macOS)](../../modules/app-shell/shared/requirements/req-032.md) | AC-032-02 | ระบุช่องว่าง native transport ของ Intel/Apple Silicon และ matrix หลักฐานจริง ไม่ปิด AC ด้วย fake |

AC-032-01 (ติดตั้ง Universal package) และ AC-032-03 (ถอนแอปแล้วคงข้อมูล) เป็นขอบเขต installer ไม่เสนอผูกงานทบทวน Host นี้ การมีรายการ AC ไม่ถือว่า SA-003 ปิดการตรวจรับ runtime ของ AC เหล่านั้น
