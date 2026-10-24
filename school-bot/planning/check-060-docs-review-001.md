# ผลตรวจ check ใบงาน060f (รอบ 1) — ตรวจข้ามโมเดลเอกสารรอบ060

วันที่ 2026-10-24 · รันโดย runner ภายนอก (codex t2 ผ่าน baan-role) · read-only · ต้นฉบับ: `C:/src/AICode/baan/baan/reports/2026-10-24-05-53-44-check-tier-t2-1agents-lJjwus/codex.answer.txt` · output state: FAIL (ทั้ง 4 กลุ่ม — จุดเฉพาะ มีข้อเสนอแก้ชัด)

## Verdict รอบ 1

| กลุ่ม | Verdict | จุดที่พบ | สถานะการแก้ (โดยนายช่างสวมบทเจ้าของไฟล์) |
|---|---|---|---|
| 1. Requirement packs | FAIL | pack-content-inventory:44 — 70.0 ถือว่าเข้าเกณฑ์ แต่ decisions-024:21 ยืนยัน "สูงกว่าเกณฑ์" ตาม decisions-020 | แก้แล้ว: 70.1 เข้า/70.0 ไม่เข้า + ระบุค่าเฉลี่ยห้อง · โบนัส: pack-guest แยก recovery ออกจากมติถังขยะ |
| 2. DB documents | FAIL | Outcome/EarnedScore/MaxScore จริงเป็น varchar/numeric (SQL:747) ไม่ใช่ "ผ่าน jsonb"; รายการ "ไม่มี PII เฉพาะตัว" ยังมี LevelPromotionPolicy/GradeSlot ขัดกับ Reason/OwnershipReason; LevelSnapshot อ้าง contract-003:46 จริงอยู่ :49 | แก้แล้วทั้ง 3 จุด + EV-05 เพิ่มตรวจรูปแบบ hex 40 ตัว (length=40 อย่างเดียวไม่พอ) |
| 3. Test plans | FAIL | replay +899s คาดสำเร็จ แต่สัญญา (license-admin-security:11) กำหนดเพียง ReplayUntil≤CompletedAt+900s; คำว่า arch "ปิด" ชวนตีความว่าปิด security finding | แก้แล้ว: fixture TTL=900s (สมมติฐาน) + ทดสอบ ReplayUntil−1s/ReplayUntil/ReplayUntil+1s ทั้ง TP001-007 และ FX-01b; เปลี่ยนคำเป็น "sync สัญญาแล้ว ยังรอ runtime/re-audit" |
| 4. UX drafts | FAIL | unknown 403 อนุญาต offline ต่อ ขัด DES-002:79 (locked รอ online); §2.11 ใช้ "ชื่อท่าห้ามซ้ำ" ขณะที่ AC-017-02 ตรวจ ID ซ้ำ; a11y ขาด visible focus/dialog focus/การจัดบล็อกด้วยคีย์บอร์ด | แก้แล้วทั้ง 3 จุดใน int-001/int-002 |

## ส่วนที่ผ่านตั้งแต่รอบ 1 (static)

- Course Plan: 105 แถว/D=TRUE 21/หน่วยต่อชั้นตรง source-review-003; AC/decisions ที่ packs อ้างมีจริงทั้งหมด
- SQL: 32 ตาราง/450 คอลัมน์/40 FK/24 UQ/80 CHECK/13 unique/0 non-unique ตรง review-006 และคำชี้แจง BL-001; เลขบรรทัด SQL ที่อ้างตรงทั้งหมด
- TP: 79 case IDs ไม่ซ้ำ ครอบ 180 AC ไม่ขาดไม่เกิน; actual ทั้ง 79 ยัง NOT_RUN; AC ของ TP001-078/079 มีจริง
- UX: ตารางรอเซ็นครบ 8+10 แถว ช่องอนุมัติว่าง ไม่มีข้อความอนุมัติแอบซุก

## Change Log

- 2026-10-24 — นายช่างบันทึกผล check รอบ 1 (FAIL 4 กลุ่ม) พร้อมสถานะการแก้ตามข้อเสนอของ check เอง; เปิด check รอบ 2 ยืนยัน (ผลจะบันทึกที่ planning/check-060-docs-review-002.md)
