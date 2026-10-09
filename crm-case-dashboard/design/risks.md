# crm-case-dashboard — Risks & Dependencies

## Risks & Dependencies

1. **Dependency บน deploy/backfill ของ crm-ai-support**: dashboard/groups อ่าน `AiCategory`/`ComputedPriorityScore` — ยังไม่ deploy = แสดง empty-state ("ยังไม่มีข้อมูลจำแนก") ห้าม crash/ห้ามแสดง 0 หลอกตา (settings/insights ไม่ block — ทำก่อนได้)
2. **Noise ของ MTTR**: `UpdateDate` เขียนทุกครั้งที่แก้เคส — MTTR อาจสูงเกินจริง (ยอมรับตามมติ #2) แก้ภายหลังต้องเพิ่มคอลัมน์ `ClosedAt` = ต้องมี DDL + DBA
3. **68k+ เคสเก่า `AiCategory IS NULL`**: bucket "ยังไม่จำแนก" ต้องชัดเจน อย่าให้ภาพรวมดูครบเมื่อยังไม่ backfill
4. **`TCrmFeedback` ไม่มี unique constraint**: aggregation ต้อง dedupe ต่อเคสที่ app layer ทุกจุด — ลืม = CSAT เพี้ยนเงียบ
5. **Knowledge pollution (ใหม่ — จาก Rev 2)**: insight entry `APPROVED` ต้องไม่โดน QA retrieval ของ crm-ai-support ดึงไปตอบคำถาม — filter `Category NOT LIKE 'INSIGHT_%'` เป็น pre-launch gate
6. **Settings เป็น constant**: เปลี่ยน target = deploy — ความเสี่ยงคือ doc/UI บอกไม่ชัดว่าแก้ที่ไหน (mitigate ด้วย hint ในหน้า + comment หัวไฟล์ constant)
7. **Performance**: aggregate ~10 metric บน 68k+ แถว — ใช้ index ที่มี (`idx_tcrmsupport_issue`, `IX_TCrmSupport_AiCategory_Severity`, partial indexes), รวม query เป็น `$transaction` read-only, ช้าค่อยแตก endpoint (ห้าม cache table ใน MVP)


Back-links: `design\index.md`
