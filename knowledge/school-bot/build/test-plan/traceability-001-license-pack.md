# ตารางส่งต่อ License — BE-003 และ BE-004

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — setup และ traceability ก่อนตรวจงานแก้ไข)

ตารางนี้ส่งให้ผู้พัฒนาและ check ใช้ร่วมกัน ครอบ AC (Acceptance Criteria: เกณฑ์ตรวจรับ) ต้นฉบับ 7 ข้อ และขอบเขต unbind สองข้อที่ตรึงไว้ โดยไม่เพิ่ม AC ผลทุก case ยัง NOT_RUN

[S-LIC/S-OBS/S-GATE — topology, reader และประตู](traceability-001-license-setup.md) เป็นส่วนบังคับ: หนึ่ง process/host สอง adapter/service; memory store object เดียว หรือ file สอง store object directory เดียว; อ่านด้วย instance ที่สาม/reopen file ทุกคำว่า “พัก” หมายถึงหลังอ่าน/proof ก่อน store lock และไม่แก้ข้อมูล

| Case → AC/criterion | Setup สั้น | Response + persisted state ที่คาด | Actual / ข้อจำกัด |
|---|---|---|---|
| [TP001-005](tp-001-cases-license.md#tp001-005) → AC-028-01 (activate ซ้ำ/จำกัดหนึ่งเครื่อง), AC-028-02 (validate ก่อน/หลัง activate) | License ว่าง A/B proof จริง พักทั้งคู่ก่อน commit ปล่อยพร้อมกัน ≥50 รอบต่อ backend | 200 หนึ่ง/409 DEVICE_LIMIT หนึ่ง; live=1, pointer ชี้ผู้ชนะ epoch เดิม; validate ไม่เพิ่มแถว/ไม่เปลี่ยน License; token ตรงข้อมูล commit; fail ไม่เผยแพร่ครึ่งหน่วย | NOT_RUN; [fault/replay เพิ่มเติม](traceability-001-license-device.md); หลาย process/DB รอ DBA-003/G-CORE + QA-001 |
| [TP001-006](tp-001-cases-license-2.md#tp001-006) → AC-028-03 (revoke/expiry ปฏิเสธ activate และ validate) | A ผูกอยู่ fake clock E−1/E/E+1; พัก device writer ให้ revoke commit ก่อน แล้วปล่อย | ก่อน E→200 exp≤E; ที่/หลัง E หรือ revoke→403 LICENSE_INACTIVE/no token; ไม่เปลี่ยน pointer/epoch/DetachedAt/lease/audit/result จากหลัง revoke | NOT_RUN; PostgreSQL lock/rollback และ transport รอ DBA-003/G-CORE + QA-001 |
| [TP001-007](tp-001-cases-license-2.md#tp001-007) → AC-027-01 (auth/role), AC-027-02 (สร้าง Key หนึ่งเครื่อง), AC-027-03 (list metadata) | P1 staff_admin+license_admin active; actor/payload ผิดแยก fixture; create/list คนละ instance; ชุดถอน role พักก่อน commit | 503/401/403 ตาม auth; valid→201 License เดียว live=0/pointer=null+audit/result; list→200 ไม่มี key/hash/device IDs; denial/fail ไม่สร้างข้อมูล | NOT_RUN; [รายละเอียดทุก fixture/TTL](traceability-001-license-admin.md); staff authority/custody/transport จริงยังรอ QA-001/ประตูเดิม |
| [TP001-008](tp-001-cases-license-2.md#tp001-008) → AC-027-04 (restart แล้วยังพบ License/สถานะเดิม) | สอง file store object directory เดียว create 201 แล้ว dispose/reopen ทุก instance; แยก fail ก่อน publish และตัด response หลัง commit | list 200 ID/status/epoch เดิม live=0; before-publish fail คงชุดเก่าครบ; lost response หลัง commit เห็นชุดใหม่ครบและ retry ไม่สร้างซ้ำ | NOT_RUN; memory ไม่พิสูจน์ process restart; kill/DB restart รอ DBA-003/G-CORE + QA-001; AC-036-03 โครงงานคง scope เดิมแยกจาก BE-003 |
| [TP001-009](tp-001-cases-license-3.md#tp001-009) → BE-003: 412 ไม่เปลี่ยนข้อมูล / success คง detached history | P1 ถือ ETag เก่า อีก service unbind สำเร็จแล้วส่ง stale; success/fail/denial ใช้ fresh fixture | stale→412 VERSION_CONFLICT+current_etag state/audit/result ไม่เปลี่ยน; success→200 live=0/pointer=null/epoch+1/DetachedAt มีค่า เก็บประวัติ+admin audit/result ไม่ต่อ lease | NOT_RUN; ส่วน AC-035 (ย้ายเครื่อง) คง owner/ขอบเขตเดิม; หลาย process/DB รอ DBA-003/G-CORE + QA-001 |
| [TP001-083](tp-001-cases-license-3.md#tp001-083) → AC-028-01/AC-028-02 และ BE-003: success คง detached history | A validate หรือ activate เครื่องเดิมอ่านแล้วพัก; P1 unbind 200 ก่อนปล่อย; ทดสอบลำดับกลับและ admin อนุญาต A กลับด้วย | writer ที่ค้าง→403 BINDING_REVOKED ไม่เปลี่ยน snapshot หลัง unbind; A ขอ activate ใหม่→409 DEVICE_LIMIT; B→200/live=1; A กลับได้เมื่อ admin อนุญาตและสร้างแถวใหม่เท่านั้น ประวัติไม่ย้อน null | NOT_RUN; [ตารางทุก subcase](traceability-001-license-race.md); หลาย process/DB รอ DBA-003/G-CORE + QA-001 |

## Coverage และช่องว่าง

BE-003 มี case ครบ AC-027-01–04 และขอบเขต unbind สองข้อ; BE-004 มี case ครบ AC-028-01–03 รวม regression เดิม ไม่มี AC ในขอบเขตที่ขาด case ทุก case ตรวจ response และ persisted state พร้อม actor/store/fault point ที่ทำซ้ำได้ ไม่มีการเขียน actual tests หรือให้ verdict ของ implementation

ยังไม่มีผลรันชุด setup นี้; stub ไม่ครอบหลาย process/host, PostgreSQL isolation/physical constraints/OS crash durability, Gateway/authority/custody จริง ประตู DBA-003/G-CORE และ QA-001 ยังค้างตาม S-GATE ไม่บันทึกว่ามนุษย์ยอมรับความเสี่ยง Important จาก finding เดิม

สารบัญ/case catalog/จำนวนรวม/JSON และ changelog อยู่นอก write scope ใบงาน 096 ให้ผู้ควบคุมปรับเอกสารที่ตนมีสิทธิ์ภายหลังรวมงาน inspect ขนาน โดยคง TP001-083 และ AC เดิม ไม่แก้ learning/quiz ในใบงานนี้

## หลักฐาน

- ต้นฉบับ AC: reports/school-bot/normal-096/ac-verbatim.txt หัวข้อ BE-003/BE-004
- Finding: reports/school-bot/normal-095/snapshot-rw1/check/round-095-rw1-findings.md หัวข้อ validate ค้างล้างประวัติ unbind
- สัญญาที่ตรึง: DES-002/entitlement/recovery Rev4 และ data-contract-rules-transactions Rev12 ตามลิงก์ใน S-LIC