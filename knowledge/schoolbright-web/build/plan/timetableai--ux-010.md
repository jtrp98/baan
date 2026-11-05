# UX-010 — UX artifact: room mapping + read-only per-unit room capacity/caretaker on subject-settings (DES-013, REQ-016 AC-038..AC-040)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

UX artifact: room mapping + read-only per-unit room capacity/caretaker on subject-settings (DES-013, REQ-016 AC-038..AC-040)

## References

REQ-016, AC-038, AC-038a, AC-039, AC-040, DES-013, DEC-013

## Scope

ร่าง UX artifact ของส่วนห้องบน `/timetable/subject-settings` (ตำแหน่งตาม OQ-15 (จ)/OQ-31 (ค) — design §38.3): mapping **1 วิชา : 1 ห้อง** เลือกจากทะเบียน `TClass` ของ school DB (BR-33/34 — ไม่มี pool, ห้ามแก้รายเซลล์ — BR-35) · แสดงความจุ/ครูผู้ดูแลต่อหน่วย(ปี,เทอม)จาก School DB อ่านอย่างเดียวตาม C1′; ไม่มีช่องแก้/ปุ่มบันทึก capacity/ผู้ดูแลในโมดูล · คำเตือน `RoomSettingMissing` (K=1/ไม่มีผู้ดูแล), CaretakerNotTeachingMappedSubject (เมื่ออ่านค่าภายนอกพบไม่ตรงสิทธิ์), ข้อความปฏิเสธ `roomCapacityExceeded` (ระบุผู้ใช้ห้องในช่วงนั้น — ต้นเหตุอาจอยู่นอกโมดูล), `roomCaretakerMismatch`, `academicRoomUsageUnavailable` · ค่าเป็นรายเทอม — ตั้งเทอมหนึ่งไม่มีผลเทอมอื่น

C1′chosen/read-only จริงโดย jtrp98 2026-10-11 ตามคำตอบใน DES-013/data-model. UX owneramenddraftUX-010 ให้ไม่มี editor/save/proxy/copy ค่าห้อง; mapping วิชา→ห้องยังตั้งได้. คง draft/Sign-off ว่าง; รูปTClassSetting(#8)/SA-Q5/SA-Q25/SA-Q10 และ UXsign-off ยังเปิด (read states/K=1 ยืนยันแล้ว). SQLdraftBE-012 ไม่ใช่ livetable หรือ UXapproval. DraftUX-008/012 ที่เกี่ยว copy/precheck ต้อง UX owneralign ตาม C1′ด้วยไม่ใช่ PM เขียน artifact.

- Write paths: C:/src/schoolbright/knowledge/timetableai/uxui/UX-010-subject-rooms.md, C:/src/schoolbright/knowledge/timetableai/uxui/README.md
- Security-sensitive: yes

## Out of Scope

ไม่แตะโค้ด · สัญญา DES-013 · `classroom-list` proxy เดิม (ชี้ endpoint ไม่มีจริง — D42, ห้ามต่อยอด)

## Expected Output

uxui/UX-010-subject-rooms.md (amend draft เดิม) + ทะเบียน uxui/README.md; ยังไม่มี human sign-off.

## Acceptance

AC-038/AC-038a/AC-039/AC-040 แสดงเป็น UX ครบ (mapping 1:1, ความจุต่อหน่วย, ผู้ดูแล, วิชาไม่มี mapping ไม่ถูกบังคับ)

## Dependencies

UX-007

## Handoff

artifact + ตาราง Sign-off + ทะเบียน `../../modules/timetableai/build/uxui/README.md` · หลังคนเซ็น → PM ตรวจ → frontend-engineer; QA ตั้ง Status หลังมีผลตรวจจริง
ร่างเอกสาร — ไม่กระทบโค้ด/สัญญา
ส่งต่อ reviewer

## Change Log

- 2026-10-11 — ถ้อยคำ TRoom→TClass + gates #8/SA-Q25 ตาม DES-013 เท่านั้น; Status QA-owned/sign-off คงเดิม; artifact align เป็นงาน UX owner.

- 2026-10-11 — amendtask ตาม C1′read-only/storage จริง; ส่ง UX owner แก้ draft010/008/012 ไม่เขียน artifact หรือเซ็นเอง; Status ของ draft คง QA-owned.

- 2026-10-09 — ชื่อ output/Write paths ตรง draft ใน working tree; รักษา sign-off gate ไม่เซ็นแทนคน.

Back-links: `INDEX.md`
