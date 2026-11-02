# timetableai — UX/UI Index

> หน่วยอ่าน = ไฟล์ · **สถานะอยู่ในตารางนี้เท่านั้น** · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `UX-*.md` / `README.md` ที่ brief/task ระบุชื่อไฟล์ตรง — ห้าม `ls` ห้ามอ่านข้ามหมวด

| ID | ชื่อ/เรื่อง | สถานะ sign-off | ไฟล์ |
|---|---|---|---|
| UX-001 | ผลลัพธ์หลัง Generate/Regenerate + สรุปความเข้มข้น (แสดงร่วม) | เซ็นแล้ว — ผู้ใช้อนุมัติ 2026-10-04 (อนุมัติ as-is ไม่มีแก้ไข · ครอบ UX-001..UX-004, UX-006 · บันทึกโดย orchestrator) | `UX-001-post-generate-results.md` |
| UX-002 | ตัวเลือก `nCourseIntensity` ใน modal สร้าง/แก้ตาราง + แก้ป้ายใน `/timetable/settings` (D51) | เซ็นแล้ว — ผู้ใช้อนุมัติ 2026-10-04 (อนุมัติ as-is ไม่มีแก้ไข · ครอบ UX-001..UX-004, UX-006 · บันทึกโดย orchestrator) | `UX-002-intensity-selector.md` |
| UX-003 | คำเตือนแบบไม่บล็อกตอนวางมือที่ขัดเป้าหมายความเข้มข้น (BR-80) | เซ็นแล้ว — ผู้ใช้อนุมัติ 2026-10-04 (อนุมัติ as-is ไม่มีแก้ไข · ครอบ UX-001..UX-004, UX-006 · บันทึกโดย orchestrator · BR-81a ยืนยันแล้ว 2026-09-30) | `UX-003-nonblocking-warning.md` |
| UX-004 | ข้อความ 401/403 ของ DES-018 (auth ของ API) | เซ็นแล้ว — ผู้ใช้อนุมัติ 2026-10-04 (อนุมัติ as-is ไม่มีแก้ไข · ครอบ UX-001..UX-004, UX-006 · บันทึกโดย orchestrator) | `UX-004-auth-messages.md` |
| UX-005 | กติกาการแสดงผลของ action: สำเร็จ/ล้มเหลว (แก้ as-built จาก UI review 2026-09-29) | ร่าง — ยังไม่มีผู้เซ็น | `UX-005-failure-surface-rules.md` |
| UX-006 | เมนู Teaching Schedule ใน Sidebar: สถานะปิดใช้งานตามสิทธิ์ (D53 / DES-022) | เซ็นแล้ว — ผู้ใช้อนุมัติ 2026-10-04 (อนุมัติ as-is ไม่มีแก้ไข · ครอบ UX-001..UX-004, UX-006 · บันทึกโดย orchestrator) | `UX-006-sidebar-menu-disabled-state.md` |
| UX-007 | มิติภาคเรียน: ตัวเลือก/บริบทเทอมบนทั้ง 7 routes | draft (Signed by: — · Signed on: — · บันทึกคำอนุมัติบางส่วนโดย jtrp98 วันที่ 09/10/2026 เฉพาะ layout/flow, URL query และ preselect ตามเงื่อนไข; ไม่ใช่การเซ็นทั้งฉบับ as-is) | `UX-007-term-context.md` |
| UX-008 | การคัดลอกกติกาและตารางสอนข้ามเทอม-ปี (5 จุดเข้า + Flow Preview/Apply) | signed — Signed by: jtrp98 · Signed on: 2026-10-11 (ขอบเขต = ร่างปัจจุบันของไฟล์นี้) | `UX-008-copy-across-term-year.md` |
| UX-009 | คาบต่อเนื่องเป็น Hard Constraint และกลุ่มวิชาห้ามชนกันเอง (UX-009) | signed — Signed by: jtrp98 · Signed on: 2026-10-11 | `UX-009-continuity-and-subject-groups.md` |
| UX-010 | ห้องเรียนประจำวิชา ความจุห้อง และการใช้ห้องข้ามระบบ (UX-010) | signed (ร่างเดิม + ส่วน fold จาก UX-014 ตามลำดับ sign-off) — Signed by: jtrp98 · Signed on: 2026-10-11 | `UX-010-subject-rooms.md` |
| UX-011 | เพดานชั่วโมงสอนครูจริง และครูประจำชั้นสอนเฉพาะห้องที่รับผิดชอบ (UX-011) | signed — Signed by: jtrp98 · Signed on: 2026-10-11 | `UX-011-teaching-caps-and-homeroom.md` |
| UX-012 | แผงตรวจความพร้อมก่อนจัดตารางสอน (Generate Precheck) (UX-012) | signed (ร่างเดิม + ส่วน fold จาก UX-014 ตามลำดับ sign-off) — Signed by: jtrp98 · Signed on: 2026-10-11 | `UX-012-generate-precheck.md` |
| UX-013 | ส่งตารางสอนเข้าระบบตารางสอนหลัก (ปุ่ม "ใช้งานตารางสอน") (UX-013) | signed — Signed by: jtrp98 · Signed on: 2026-10-11 (ขอบเขต = ร่างปัจจุบัน; ไม่ใช่ owner/schema approval) | `UX-013-academic-push.md` |
| UX-014 | ส่วนเพิ่ม: ผู้ดูแลห้องหลายคน (`lstCaretakers`) และคำเตือน/เหตุปฏิเสธที่เกี่ยวข้อง | signed — Signed by: jtrp98 · Signed on: 2026-10-11 (ขอบเขต = ร่างปัจจุบันของ UX-014 ตามรายการ (1)–(3) ใน Sign-off) | `UX-014-multi-caretaker-delta.md` |
| README.md | ภาพรวมหมวด UX Drafts (`uxui/`) เดิม + สรุปสิ่งที่เปิดอยู่/ตัดสินแล้ว + ขั้นตอนหลังเซ็น | เอกสารภาพรวมเดิม (แก้ล่าสุด 2026-10-11 ตามหัวไฟล์; ไม่ใช่ artifact รายข้อที่เซ็นแยก) | `README.md` |

## Change Log

- 2026-10-22 — สร้างสารบัญหมวด uxui (`index.md`) รวมตาราง `UX-001`..`UX-014` และ `README.md` ตามสถานะจริงจากหัวไฟล์แต่ละฉบับ

Back-links: `../../INDEX.md`
