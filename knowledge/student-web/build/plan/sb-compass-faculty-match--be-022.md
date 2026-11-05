# BE-022 — First-filter endpoint (Module K results)

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

endpoint ตัวกรองชั้นแรก — แก้ไข (2026-09-02): อ่านผล cluster ที่ผ่านการจัดอันดับแล้วจาก Module K (BE-052) แล้วไล่เก็บสาขา approved ทีละ cluster ตาม Fit% (dedup ด้วย `program_id`) จนครบ 10 หรือหมด cluster ที่มีผล — แทนการเรียก `CompassPathCatalog.RankPaths(avg)` (กลไก 8-path เดิม) ตามหมวด Program Matching §2 · `CompassPathCatalog.RankPaths` เดิมไม่ถูกลบ (ยังใช้อยู่ที่อื่นหรือเป็น fallback ก่อน RIASEC เสร็จ) — ยืนยันขอบเขตที่แน่นอนกับ `system-analyst` ก่อน implement เพราะ design เขียนกฎ 8-path ไว้เป็น contract เดิมและไม่ได้พูดชัดว่าเลิกใช้ทั้งหมด — Module H ต้องจัดอันดับบนผล cluster จริงของ Module K — ถ้ายังผูกกับกลไก 8-path เดิม ผลแรกของ flow ทั้งสายผิดตั้งแต่ขั้นตัวกรอง

## References

REQ-005, AC-005.1, REQ-011, AC-011.1, DES-020, DEC-020

## Scope

เรียงผู้สมัครตามลำดับ cluster จาก BE-052 — เป็นการ "จัดลำดับความสำคัญ" ไม่ใช่ตัดทิ้ง · นับเฉพาะสาขา status='approved' · นักเรียนยังไม่ทำ RIASEC → ใช้ academic_fit เป็นลำดับชั่วคราวพร้อมข้อความชวนทำ RIASEC ไม่ error ไม่บล็อก · สาขาผูกหลาย cluster นับครั้งเดียว

- Security-sensitive: yes

## Out of Scope

`CompassPathCatalog` เดิม (ไม่ลบ ไม่แก้ — ขอบเขตยังรอยืนยันจาก system-analyst) · payload ของ BE-052 (อ่าน) · สคีมา

## Expected Output

none

## Acceptance

AC-005.1: การจับคู่กรองชั้นแรกด้วยผล 11 cluster ของ Module K ก่อน แล้วจึงจัดอันดับสาขาภายในกลุ่มนั้นจากคลัง — ไม่ใช้กลไก 8 สายเดิมเป็นตัวกรองชั้นแรก
AC-011.1: ตัวกรองชั้นแรกเป็น 11 กลุ่มความสนใจจริง — ลำดับผู้สมัครมาจากผล cluster ที่ Module K คำนวณ

## Dependencies

BE-001, BE-052

## Handoff

ตรวจ AC-005.1/AC-011.1 ด้วยชุดทดสอบ: ผล cluster จำลอง + คลังสาขา approved/pending_review/ผูกหลาย cluster — ตรวจลำดับผู้สมัคร การ dedup และการหยุดที่ 10/หมด cluster — เก็บผลเป็นหลักฐาน
endpoint ใหม่ additive — กลไกเดิมยังอยู่ครบ (ไม่ลบ) จึง revert ได้โดยไม่พังทางอื่น · รอการยืนยันขอบเขตกลไกเดิมก่อนปิดงาน
ส่งต่อ reviewer

Back-links: `INDEX.md`
