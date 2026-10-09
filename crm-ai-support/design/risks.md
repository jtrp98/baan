# crm-ai-support — Risks & Dependencies

## Risks & Dependencies

- **DB นี้ไม่มี FK constraint** — ทุก logical ref ต้อง join/validate เองที่ app layer (`.repository.ts`) ไม่มีฐานข้อมูลช่วยกันพลาด ต้องระวังเป็นพิเศษตอนเขียน service สำหรับ `IssueId`/`MenuId`/`SourceCrmSupportId`
- **แถวเก่าใน `TCrmSupport`**: `MenuId`/`AiCategory`/`Severity` เป็น NULL ทั้งหมดจนกว่าจะรัน backfill classification — ต้องเขียน query ทุกจุดให้ถือว่า `NULL` = "ยังไม่จำแนก" ไม่ใช่ "ไม่มีหมวด"
- **Legacy cleanup ~500 รายการ** (จาก `requirement.md`) เป็น operational gate ก่อน launch จริง — ไม่ใช่ schema blocker แต่ต้องเป็น task แยกใน `plan.md` ที่ปิดก่อน Phase 1 จะถือว่า "เสร็จพร้อม deploy"
- **Gemini rate limit/cost**: ไม่มีข้อมูลปริมาณเคส/วันที่ยืนยันจาก requirement — ถ้าปริมาณสูงอาจต้อง throttle/batch คิวการเรียก AI แต่ยังไม่ยืนยันว่าจำเป็นจริง
- **บทบาทใหม่ (UX/UI, Dev, Sales) ยังไม่มี `PERMISSIONS.CRM_AI_*` constant** — ต้องเพิ่ม `CRM_AI_UX_UI`/`CRM_AI_DEV`/`CRM_AI_SALES` ใน `permission.constant.ts` ก่อนเปิดหน้าใหม่ให้บทบาทเหล่านี้ใช้งาน (เหมือนที่ Phase 1 ทำกับ CS/SA/PM)

**ปิดแล้ว, ย้ายไป `## Change Log`**: SLA priority formula ไม่มีตัวเลขจริง (ปิด 2026-08-18 — กติกาที่ใช้จริงอยู่ที่ § SLA & Priority Score Rules), 8 ตารางเคยไม่มีอยู่จริงในฐานข้อมูล (ปิด 2026-08-17), ค่า enum ของ `TCrmAiDecisionLog` ที่หายไป 3 ค่า (ปิด 2026-08-17 รอบที่ 4 — ดู § AI Suggestion & Learning Loop Rules ข้อ 4)


Back-links: `design\index.md`
