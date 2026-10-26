# ผลตรวจ check รอบใบงาน061 (verify 1–3) — UX-002 / TP-003 / DBA-007

วันที่ 2026-10-24 · รันโดย runner ภายนอก (codex t2 ผ่าน baan-role — ตรวจข้ามโมเดล) · read-only · ต้นฉบับ: reports/2026-10-26-01-43-14 (รอบ 1) · 2026-10-26-01-59-52 (รอบ 2) · 2026-10-26-02-03-32 (spot รอบ 3)

## สรุปวงจร

| Task | รอบ 1 | แก้ (โดยนายช่างสวมบทเจ้าของไฟล์) | รอบ 2 | รอบ 3 | ผลสุดท้าย |
|---|---|---|---|---|---|
| UX-002 | FAIL — Cloud-save copy สัญญาเก็บเครื่องเกิน DES-003; ขาด state 428/ไม่ทราบผล/แก้ต่อระหว่าง saving; หัว §8 | แก้ copy + เพิ่ม 3 state + แก้หัว §8 | FAIL — เหลือแถว saving ซ้ำ 1 แถว (ต่างกันตัวพิมพ์ บันทึบ/บันทึก) | ลบแถวพิมพ์ผิด | **PASS** (รอบ 3) |
| TP-003 | FAIL — ขาด lease boundary (LeaseUntil −1s/ตรง/+1s + worker เก่ากลับมา); GF-03b ไม่มีเส้นทางสำเร็จแยก | เพิ่ม GF-03d2 + แยก GF-03b (สำเร็จล้วน) / GF-03b2 (ชนซ้ำ) + อัปเดต coverage | **PASS** (28 fixture IDs ไม่ซ้ำ ไม่มี reference ลอย) | — | **PASS** (รอบ 2) |
| DBA-007 | FAIL — EV-RC-02 เปิดทาง "จำลอง reconcile" กำหนดผลเอง; EV-CX-01 ไม่ใช้ PK จริง (nGradeDetailId) ตาม legacy-022/DBContext:531 | reconcile โดย worker จริง + unknown คง reconciling; CAS ใช้ PK+SchoolId+xmin+before_document_hash + fixture แถวบริบทซ้ำ + รอ EV-GR-01 ยืนยันชื่อ | **PASS** | — | **PASS** (รอบ 2) |

ผล: **flip UX-002 / TP-003 / DBA-007 → verified** (รวม 12 verified / 98 pending) · static เท่านั้น ไม่ใช่ runtime/QA acceptance; ทุก gate ยังไม่ปิด

## Change Log

- 2026-10-24 — นายช่างบันทึก verdicts รอบ 1–3 และ flip ตามกติกา (verdict ของ check เป็นต้นทางเดียวของคอลัมน์ Status)
- 2026-10-24 — เพิ่มเติมรอบ 4–7 (UX-004/SA-002): SA-002 **PASS** รอบเดียว (flip → 13 verified) + DBML PlanCourseIds jsonb→integer[] แก้ตามข้อเสนอ (parser ผ่าน evidence-003) · UX-004 FAIL 4 จุด (ครู disabled บน Quiz/Test, state สิทธิ์ข้อสอบ, รายการวิชา, state หน้าความคืบหน้า) → แก้ครบ → ผิดโครงสร้างคอลัมน์ 4 แถว → แก้ครบ → **PASS รอบ 7** (flip → 14 verified/96 pending)
- 2026-10-24 — รอบ 8–10 (UX-006): FAIL 4 จุด (หัวตารางพรีวิว, ตัวอย่างปัดต้องเป็น decimal จริง 7.499→7/7.5→8, audit ขาด loading/empty/error, ขาด kind/id/update_date ของผลต้นทาง) → แก้ครบ → จุดสอดคล้อง raw_target 1 บรรทัด → แก้ → **PASS รอบ 10** (flip → 15 verified/95 pending)
