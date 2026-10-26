# school-bot — UX/UI Index

> หน่วยอ่าน = ไฟล์ · สารบัญล้วน · เจ้าของหมวด: int (ร่าง) — การเซ็นเป็นพระราชกิจของมนุษย์เสมอ · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะไฟล์ที่ task/brief ระบุ — ห้าม ls ห้ามอ่านข้ามหมวด · front implement ได้เฉพาะจากส่วนที่ "เซ็นแล้ว"

## ไฟล์ปัจจุบัน

ผลตรวจเอกสารล่าสุด: [check073](../planning/check-073-ux-final-001.md) ผ่านฐานร่าง; [check080](../planning/check-080-expired-delta-001.md) ผ่าน7กลุ่มและพบ3ข้อเอกสารที่แก้ครบตาม [check082 PASS](../planning/check-082-expired-spot-001.md). มติ042เป็นbusinessที่ตอบแล้ว; Q39–Q46รวมcopy/interaction delta042ยังรอผู้ใช้เซ็น ไม่ใช่runtime acceptance

| ไฟล์ | ขอบเขต | สถานะ |
|---|---|---|
| [int-001-entry.md](int-001-entry.md) | UX-001 Entry/License/Guest-Login/Shell/Close — ครบทุก state + error→copy mapping + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-036/037/038) — signed int artifact |
| [int-002-labs.md](int-002-labs.md) | UX-003 Labs สามโหมด Arm/Block/Code — ค้นหา/เชื่อมต่อ/โปรไฟล์/ส่งท่า/เล่น/อัปโหลด/หยุด/ขาดการเชื่อมต่อ/Code+Block ทุก state + a11y | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-037/038) — signed int artifact |
| [int-003-projects.md](int-003-projects.md) | UX-002 โครงงาน/พื้นที่ร่วม Guest/ถังขยะ 30 วัน/export/import หลัง Login/ประวัติเรียน Guest — ครบทุก state | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-039) — signed int artifact; G-UX-PROJECT มีหลักฐาน sign-off |
| [int-004-learning.md](int-004-learning.md) | UX-004 บทเรียน/ภารกิจสามโหมด/ผลประเมิน/ดาว/ความคืบหน้า/Quiz-Test/เลื่อน Level — ครบทุก state | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-039/040) — G-UX-LEARN มีหลักฐาน sign-off |
| [int-005-mapping.md](int-005-mapping.md) | UX-006 GradeSlot mapping/Preview ยืนยัน/คะแนนชน/Export status (เว็บ admin โรงเรียน + ครู — web-system) | **อนุมัติครบทุกส่วน** (ผู้ใช้ 2026-10-24 · decisions-041) — signed int artifact |
| [int-006-admin-curriculum.md](int-006-admin-curriculum.md) | UX-005 admin หลักสูตร/import/bank · [states/a11y](int-006-admin-states.md) · [trace/ข้อจำกัด/Sign-off](int-006-admin-trace.md) | ผ่าน check-066 เฉพาะ draft completeness 12/12 AC; Q39–Q42 ยังรอเซ็น |
| [int-007-attempt-policy.md](int-007-attempt-policy.md) | UX-007 Attempt/policy/Level · [เว็บครู/คะแนน](int-007-teacher-score.md) · [states/a11y](int-007-states.md) · [trace/ข้อจำกัด](int-007-trace.md) | ผ่าน check-066 เฉพาะ draft completeness 15/15 AC; Q43–Q46 ยังรอเซ็น |



## จุดที่รอมนุษย์เซ็น

**ผ่านแล้ว:** UX-001 (int-001) และ UX-003 (int-002) อนุมัติครบทุกส่วน (ผู้ใช้ 2026-10-24 · decisions-036/037/038)

**ผ่านแล้ว:** UX-001 (int-001) · UX-003 (int-002) · UX-002 (int-003) ครบทุกส่วน (decisions-039) · **UX-004 (int-004) ครบทุกส่วน (Q22–Q29 · decisions-039/040)**

**UX-006 (int-005) อนุมัติครบทุกส่วนแล้ว (decisions-041)** — UX ที่ผ่านการเซ็นรวม 5/7 ชุด; UX-005 และ UX-007 มีร่างครบและผ่าน [check-066](../planning/check-066-ux-review-001.md) เฉพาะ draft completeness แล้ว ทุกข้อ Q39–Q46 ยังรอ human sign-off เฉพาะ UX ไม่รวม owner approval/runtime



ปัจจุบัน042เลือก A: ตรวจ saved answers ทันเวลา ข้อว่าง 0 เต็มทั้งชุด นับสิทธิ์เดิม ไม่รับย้อนหลัง; UX-004 Q22–Q29 เซ็นฐานเดิม ส่วน delta หมดเวลารอ Q43 รวมชุด007 (trace 16 AC); 042ไม่ใช่ UX sign-off ใหม่ UX-005 consistent ไม่แก้ business ตอบแล้ว แต่ technical LUX-05 รอ arch/sys

หมายเหตุข้อจำกัด: UX-005/007 แยก source evidence และช่องว่างสัญญาไว้ใน companion trace ของแต่ละชุด trace ระบุหลักฐานจาก App.tsx แต่ยังไม่ได้อ่าน component ที่แสดง UX เหล่านี้หรือยืนยัน UI/runtime; check-066 ไม่ใช่ human sign-off หรือ AC runtime acceptance · Login flow ยังคง target contract และ gates เดิม (fullLogin ยัง NOT_READY) · กฎ web-system ยึด repo/ DESIGN/shared props ตามที่ระบุในร่าง ไม่ใช้แทนกติกา Desktop/admin ส่วนกลาง

## Change Log



- 2026-10-26 — 077: delta042 รอ Q43



- 2026-10-26 — ใบงาน070: เพิ่ม UX-005/007 และ companion ปัจจุบัน แก้ข้อความกำลังร่างตาม check-066; signed รวม 5/7 เท่าเดิม ทุกข้อ Q39–Q46 รอเซ็น

- 2026-10-24 — decisions-041: UX-006 (int-005) อนุมัติครบทุกส่วน (Q30–Q38)
- 2026-10-24 — decisions-040: UX-004 อนุมัติครบ (Q26–Q29) — G-UX-LEARN ครบหลักฐาน
- 2026-10-24 — ใบงาน061: เพิ่ม int-003 (UX-002 อนุมัติครบ Q14–Q21) / int-004 (UX-004 อนุมัติ Q22–Q25 เหลือ Q26–Q29) / int-005 (UX-006 ร่าง รอเซ็น Q30–Q38) — decisions-039
- 2026-10-24 — ใบงาน060d: สร้างหมวด uxui พร้อมร่างแรก int-001/int-002 (UX-001/UX-003 ตามคิว queue-003 §3.4) — รันโดย นายช่าง solo (subagent role int); ทุกส่วนรอเซ็น ไม่มีการอนุมัติใดเกิดขึ้น
- 2026-10-26 — ผู้คุมลงผลcheck073/080/082จากหลักฐานจริง; ไม่ลงลายเซ็นแทนผู้ใช้
- 2026-10-26 — ผู้คุมต่อแถวตารางสารบัญที่ถูกบรรทัดว่างคั่น ไม่เปลี่ยนเนื้อหา สถานะ หรือมติ
