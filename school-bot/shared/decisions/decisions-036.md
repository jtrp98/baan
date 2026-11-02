---
owner: spec
---
# มติที่ 036 — GAP-07: คง workflow PrepareUpdate/InstallPreparedUpdate

วันที่ 2026-10-24 · ผู้ตอบ: ผู้ใช้ (ตอบผ่านแบบฟอร์มคำถามใน session นายช่าง หลังรอบใบงาน060) · โดยนายช่างบันทึก

## คำถาม

Disposition ของ workflow อัปเดต Desktop (GAP-07 · REQ-030/BE-019 · ตาม [update-disposition-001](../../build/design/update-disposition-001.md)): คง PrepareUpdate/InstallPreparedUpdate หรือเปลี่ยนเป็น check-only?

## มติ

**คง workflow PrepareUpdate/InstallPreparedUpdate** เป็น operation แยกจากการตรวจ (explicit intent) โดย:

1. spec ร่าง AC เพิ่มใน REQ-030 ครอบ download/verify/install/recovery ตามหัวข้อที่ disposition กำหนด (explicit intent, trust/hash/publisher pin/registry, staging TOCTOU, stop/close guard, expiry/withdraw/downgrade, installer fail/repair) — **AC ใหม่ที่ร่างแล้วยังต้องผู้ใช้ตรวจรับอีกครั้งตามเงื่อนไขของ disposition** ก่อน implement
2. inspect เพิ่ม coverage ใน TP ภายใต้ gate เดิม (G-RELEASE-DB ยังไม่ปิด)
3. `install_supported=false` ของ as-built คงอยู่จนกว่า BE-019 จะ implement ตาม AC ที่อนุมัติ
4. ไม่เปลี่ยน task/dependency/gate IDs; BE-019 ยัง pending

## ผูกกับ

- GAP-07 ปิดในระดับ disposition; coverage ต่อยอดได้ (TP001-048 แก้ + case ใหม่)
- มติเดียวกันตอบพร้อมคำถาม EV-01..06 (สรุปข้อความให้ผู้ใช้ forward), UX Q1 (ยืนยัน License Gate ด่านแรก), UX Q4 (หมดสิทธิ์ระหว่างใช้งาน = ให้บันทึก+ขอหยุดหุ่นแล้วล็อก) — บันทึก sign-off ฝั่ง UX ที่ [uxui/int-001-entry.md](../../modules/app-shell/build/legacy-ux/int-001-entry.md)

## Change Log

- 2026-10-24 — บันทึกมติผู้ใช้จากแบบฟอร์มคำถามหลังปิดรอบใบงาน060; ส่งต่อ spec (ร่าง AC) / inspect (coverage) / gm (Waiting on Human)
