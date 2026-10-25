# ใบงาน060 — โหมด solo: ปิด GAP design + เตรียม artifact packs รอบมนุษย์ (docs-only)

วันที่2026-10-24 · นายช่าง solo (ZCode session เป็นทีมทั้งทีมตาม charter "โหมด solo") · ต่อจากคิว [queue-003](queue-003.md) §3 ฐาน (override ใบงาน051 สำหรับ transport docs ปิดแล้วรอบ055–059) · ไม่เขียน code/SQL/runtime · คง 110 tasks pending / 44 REQ / 180 AC / 17 gates · ประตูมนุษย์ทุกประตูไม่ปิดเพิ่ม

## เหตุผล

คิว §3 ระบุงานเตรียมเอกสารราย owner ที่ไม่ติด dependency/ประตูมนุษย์ แต่ยังไม่มีใครทำ: GAP-01..04/06/07/08 ของ arch ยังไม่ถูก sync (DES-002 ยัง `/admin/licenses`, DES-003 ยังระบุ UTF-8 bytes เฉยๆ, ETag ยังไม่ sync, Change Log ค้าง Rev 2026-10-21), BA-001..004 packs ไม่มีไฟล์, งานเอกสาร vault §3.2 ไม่มีหลักฐาน, UX-001/003 ยังว่าง, TP-002 ยังไม่เตรียม — ทั้งหมดเป็นเงื่อนไข "ต้องรอ artifact ครบก่อนถามมนุษย์" ตาม §4

## แผนงาน (max 3 ขนาน)

| # | Role | งาน | ผู้รันจริง |
|---|---|---|---|
| 060a | arch | GAP-01..04/06/07/08 + SEC001-003/009 เข้าสัญญา + BL-001 (schema-notes) + ร่าง SA-004 credential/custody matrix | runner ภายนอกผ่าน baan-role (codex t1 --write แก้เฉพาะ design\, snapshot ก่อนแก้) |
| 060b | spec | BA-001 Guest summary / BA-002 content inventory (GAP-09) / BA-003 hardware pack (GAP-05) / BA-004 delivery pack | นายช่าง solo (subagent role spec) — นายช่างบันทึกไฟล์ |
| 060c | vault | ยืนยัน ReplayUntil TTL ไม่แก้ DDL / PII inventory 32 ตาราง (SEC001-010) / DB safe-evidence set / BL-001 ส่วน vault | นายช่าง solo (subagent role vault) — นายช่างบันทึกไฟล์ |
| 060d | int | ร่าง UX-001 (Entry/License/Login) + UX-003 (Labs) รอเซ็น | นายช่าง solo (subagent role int) — นายช่างบันทึกไฟล์ |
| 060e | inspect | sync TP-001 ตาม GAP ที่ arch ปิด + เตรียม TP-002 failure/race fixtures | นายช่าง solo (subagent role inspect) — นายช่างบันทึกไฟล์ |
| 060f | check/jpo | ตรวจข้ามโมเดลงานที่ solo/subagent เขียน (packs, PII, TP, UX) + ผล arch | runner ภายนอกผ่าน baan-role |

ห้ามทั้งรอบ: ถามธุรกิจซ้ำ (transport/cType/มติ035/Guest policy/พาธ legacy/OS), เปลี่ยน scope/dependency/gate/status, ปิด gate, รัน SQL/DB/runtime, เขียน code

## Change Log
- 2026-10-24 — เปิดใบงาน060 (solo round): แตก 060a ผ่าน baan-role (codex t1), 060b/060c เป็น subagent พื้นหลัง; ผลจะ append ด้านล่างเมื่อรับแล้ว
- 2026-10-24 — รับ 060b (subagent role spec): NEEDS_HUMAN ตามออกแบบ — packs 4 ชุดครบ (pack-guest/content-inventory/hardware/delivery ครอบ GAP-05/09) บันทึกใน requirement\ + index; คำถามรอคน Q1–Q6 (ผู้อนุมัติเนื้อหา/รุ่นหุ่น/สิทธิ์สั่งหุ่น/ผู้ถือ cert/เกณฑ์ performance)
- 2026-10-24 — รับ 060c (subagent role vault): DONE — review-007 (SEC001-009 ไม่แก้ DDL, PASS static), pii-inventory-001 (SEC001-010 + flag F1–F7 ส่ง jpo), db-safe-evidence-001 (EV-01..06), BL-001 ส่วน vault แนบท้าย review-005; บันทึกใน db\ + index
- 2026-10-24 — รับ 060a (runner ภายนอก codex t1 ผ่าน baan-role): NEEDS_HUMAN เฉพาะ GAP-07 — งานครบ 11/11: DES-002 Rev3/003 Rev4/004 Rev11/005 Rev7/006 Rev2/007 Rev3, rules Rev8, schema-notes Rev5 + ไฟล์ใหม่ license-admin-security/project-api/guest-workspace/teacher-authority/robot-boundary/release-trust/update-disposition/credential-matrix/signing-custody/export-proof-pack + gap-sync-review/evidence/validation + archive 10 ไฟล์พร้อม SHA256; คง 110 pending/SQL/DBML เดิม; คำถามคน: GAP-07 คง Prepare/Install พร้อม spec ร่าง AC หรือเลือก check-only ([update-disposition-001](../design/update-disposition-001.md))
- 2026-10-24 — รับ 060d (subagent role int): NEEDS_HUMAN ตามออกแบบ (รอเซ็น) — สร้างหมวด uxui: int-001-entry (UX-001) + int-002-labs (UX-003) + index; จุดรอเซ็น Q1–Q13 รวบไว้ที่ uxui/index
- 2026-10-24 — รับ 060e (subagent role inspect): DONE — Amendment002 sync TP-001 ตามสัญญา060a (แก้ 19 cases + TP001-078/079 = 79 cases ครอบ 180 AC ทุก actual NOT_RUN) + สร้าง [tp-002-fixture-plan-001](../test-plan/tp-002-fixture-plan-001.md) (FX-01..05); ไม่แตะ GAP-07; อัปเดต test-plan/index แล้ว
- 2026-10-24 — รับ 060f-jpo (runner ภายนอก codex t2): NEEDS_HUMAN (หยุดที่ human gates เดิม) — ผลเต็มที่ [security-gap-sync-review-001](security-gap-sync-review-001.md) + สรุปใน security.md; findings: pii-inventory ตกหล่น (แก้แล้วโดยนายช่างสวมบท vault: เด็ก 9→13 ตาราง, free-text +3, jsonb ผลประเมิน, DeviceJkt/ResultCipher จำแนกใหม่, Session.ExpiresAt), EV-05 ห้ามส่ง raw hash prefix (แก้แล้ว: ป้ายประเภทคงที่ใน DB + complementary suppression + ถอน "ปลอด PII 100%"), review-007 แก้เงื่อนไข now()>=ReplayUntil + ข้อจำกัด MVCC/WAL/backup (แก้แล้ว); SEC001-003/009 รับระดับแบบ, SEC001-010 ยังไม่ปิด; ส่ง arch เติมเกณฑ์ evidence 3 ไฟล์ (เปิดใบงาน060g แล้ว)
- 2026-10-24 — เปิด 060g (arch codex t1 --write): เติมเกณฑ์ effective privileges/rate-limit+key-scan+registry-writers/synthetic fixtures ใน credential-matrix, signing-custody, export-proof-pack ตาม jpo · เปิด 060f-check (check codex t2 read-only): ตรวจข้ามโมเดล 4 กลุ่มเอกสาร (spec packs / vault docs / TP Amendment002+TP-002 / UX drafts) — ผลจะ append เมื่อรับ
- 2026-10-24 — รับ 060g (arch codex t1): DONE — 3 ไฟล์ SA-004 เป็น Rev2 ตามข้อเสนอ jpo; ไม่มี schema proposal/blocker ใหม่
- 2026-10-24 — รับ 060f-check รอบ 1 (check codex t2): **FAIL 4 กลุ่ม** — 70.0 ควรไม่เข้าเกณฑ์ (สูงกว่าเกณฑ์), Outcome/EarnedScore/MaxScore เป็น varchar/numeric (SQL:747) ไม่ใช่ jsonb + ยกเว้น GradeSlot ผิด, replay ต้องทดสอบรอบ ReplayUntil ไม่ใช่ CompletedAt+899s + คำ "ปิด" เกินจริง, unknown 403 ต้อง locked เท่านั้น (DES-002:79) + ID ท่าซ้ำไม่ใช่ชื่อซ้ำ (AC-017-02) + a11y ขาดจุด — นายช่างสวมบทเจ้าของไฟล์ (spec/vault/inspect/int) แก้ครบทุกจุด ([receipt 001](check-060-docs-review-001.md))
- 2026-10-24 — รับ 060f-check รอบ 2: PASS 3/4 — เหลือ SchoolBotGradeSlot ค้างในรายการยกเว้น (ความผิดนายช่างตอนทำรอบแรก) → แก้ + รอบ 3 spot-check: **PASS 3/3** ([receipt 002](check-060-docs-review-002.md)/[003](check-060-docs-review-003.md)) — เอกสารรอบ060 ผ่านตรวจข้ามโมเดลครบทุกกลุ่มในระดับเอกสาร
- 2026-10-24 — ปิดรอบ: related-impact sweep แล้ว (module index: design/test-plan/security/uxui rows + rules Rev8 + pointer; plan/index Waiting on Human + gm change log; requirement/db/test-plan/uxui index ครบ) · คง 110 tasks pending/44 REQ/180 AC/17 gates ไม่มี code/SQL/runtime · ประตูมนุษย์ที่พร้อมถาม: GAP-07 disposition, spec Q1–Q6, UX Q1–Q13, EV-01..06 (ส่งเจ้าของ Master DB) — สรุปส่งผู้ใช้ใน chat แล้ว final knowledge commit
- 2026-10-24 — มติผู้ใช้ผ่านแบบฟอร์มคำถาม (บันทึก [decisions-036](../requirement/decisions-036.md)): GAP-07 = คง Prepare/Install (spec สวมบทเพิ่ม BR-030-04..06 + AC-030-04..08 รอตรวจรับ → 185 AC; inspect เพิ่ม Amendment003 TP001-080 → 80 cases) · EV = สรุปข้อความให้ผู้ใช้ forward ([cover-001](../db/db-safe-evidence-cover-001.md)) · UX Q1 ยืนยัน License Gate ด่านแรก + Q4 ให้บันทึก+ขอหยุดหุ่นแล้วล็อก (sign-off ลง uxui/int-001) — คง 110 pending/gates; final commit ตามรอบนี้
