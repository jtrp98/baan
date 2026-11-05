# รายละเอียด fault และ replay ของ TP001-005

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — แยกรายละเอียด fault ของ activate/validate)

ส่วนบังคับของ [TP001-005 — activate A/B บน store ร่วม](tp-001-cases-license.md#tp001-005) ผูก AC-028-01 (activate ซ้ำ/จำกัดหนึ่งเครื่อง) และ AC-028-02 (validate ก่อน/หลัง activate) ใช้ [setup ร่วม](traceability-001-license-setup.md) และ DES-002 (License/device binding) Rev4/transaction Rev12 ตาม setup นั้น
ส่วน stub ใน slice นี้: ใช้ barrier ข้างต้น รวม validate สองคำขอใน epoch เดียวให้คำขออ่านก่อน commit ทีหลัง เวลา/lease ต้องไม่ถอย; replay key+payload เดิมคืน exp เดิม ไม่เพิ่ม audit/result ซ้ำ; payload ต่าง→409 ไม่เปลี่ยน state; proof ผิด/challenge reuse/เกิน 120s→DEVICE_PROOF_INVALID ไม่ออกสิทธิ์ Inject signer throw ก่อน publish และ store write throw ก่อน publish แยก fixture: ไม่ตอบ success/no token และ domain/audit/result คงเดิม; file inject publish failure ก่อนสลับ generation แล้ว reopen ต้องเห็นชุดเก่าครบ ไม่ใช่ License ใหม่กับ binding เก่า



ผลที่คาด: activate ได้ 200 หนึ่งคำขอ อีกฝ่าย `409 DEVICE_LIMIT`; live=1, CurrentBindingId ชี้ผู้ชนะ, BindingEpoch=e, binding Epoch=e และ DetachedAt=null ไม่มี orphan ฝ่ายแพ้ไม่เพิ่ม success audit/result ทดสอบ A ซ้ำบน fixture ที่ A ชนะ: 200 ไม่เพิ่มแถว/ไม่เปลี่ยน License; validate ก่อน activate→`403 DEVICE_NOT_ACTIVATED` หลัง activate→200 ไม่เพิ่มแถว เปลี่ยน binding ได้เพียง LastCheckedAt/LastEntitlementExpiresAt/UpdateDate; signed lease อ้าง binding/epoch/jkt และเวลาเท่าที่ commit ยืนยัน โดย exp=min(checked_at+259200,License.ExpiresAt)

