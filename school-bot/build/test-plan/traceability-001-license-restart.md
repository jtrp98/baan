# รายละเอียด restart และ commit failure ของ TP001-008

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — แยกขั้นตอน restart และผล persisted state)

ส่วนบังคับของ [TP001-008 — restart API](tp-001-cases-license-2.md#tp001-008) สำหรับ AC-027-04 (restart แล้วยังพบ License และสถานะเดิม) ของ BE-003 (Admin License); AC-036-03 (โครงงานเดิมหลัง restart) คงขอบเขตเดิมแยกจากใบงานนี้ ใช้ [S-LIC/S-OBS/S-GATE](traceability-001-license-setup.md)
ขั้นตอน: restart ทุก instance ตาม setup; ชุด fault แยก directory สะอาด inject write throw ก่อน publish และ file publish throw ก่อนสลับ generation ระหว่าง create แล้ว dispose/reopen; อีกชุดให้ commit สำเร็จแต่ตัด response ก่อนส่ง แล้ว reopen/retry RequestKey เดิมภายใน replay window ชุด kill process/DB commit fail ระหว่าง transaction รอประตูของจริง ไม่แทนด้วย exception หลัง commit

ผลที่คาด: หลัง file reopen P1 list→200 พบ ID/metadata/status เดิม, live=0, pointer=null, epoch เดิม และ audit/idempotency ครบไม่ซ้ำ; failure ก่อน publish ไม่ตอบ 201 และ state เท่าก่อน create ทั้งชุด; commit แล้ว response สูญหายอาจไม่ได้ response แต่ reopen เห็นชุดใหม่ครบ และ retry คืนผลเดิมไม่สร้าง License/audit ซ้ำ ไม่ยอมรับภาพครึ่งหน่วย ส่วน Login/โครงงานเดิมยังคง expected ของ AC-036-03 โดยไม่ใช้เป็นเกณฑ์ BE-003

ส่วน stub ใน slice นี้: file reopen และ fault ก่อน publish ตาม setup; memory ตรวจความเป็นหน่วยเดียวได้ แต่ปิด process แล้ว memory หายเป็นข้อจำกัด backend ไม่ใช่หลักฐาน AC-027-04

ส่วนรอของจริง: สอง process/host ต่อ PostgreSQL เดียวกัน ตรวจ restart/kill ก่อนและหลัง commit ด้วย reader ที่สาม รอ DBA-003/G-CORE และ QA-001; Cloud Login/project และ Gateway integration คงรอ QA-001 ไม่ขยาย scope ใบงานนี้

