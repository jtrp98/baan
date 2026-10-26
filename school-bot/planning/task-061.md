# ใบงาน061 — solo ต่อเนื่อง: ปิด status งานที่ครบ + ร่าง UX-002/UX-004

วันที่2026-10-24 · นายช่าง solo · ต่อจากใบงาน060 + มติ decisions-036..038 · docs-only ไม่มี code/SQL/runtime

## งาน

1. **ปิด status 7 งาน → verified** ตาม verdict ของ check-060 (PASS ครบหลังแก้รอบ 3 ผ่านนายช่าง — ต้นทางเดียวของคอลัมน์ Status): BA-001..004 (packs ครบ+เติมมติ Q1/Q2/Q4 แล้ว), UX-001/UX-003 (signed int artifact โดยผู้ใช้ + check PASS), TP-001 (79+1 cases ครอบ 185 AC, check PASS บน Amendment002/003) — 110 → 103 pending
2. **int ร่าง UX-002 (Projects/Guest UX)** และ **UX-004 (Learning UX)** — dependency BA-001/BA-002 ผ่อนปลดหลัง flip status (subagent role int; นายช่างบันทึก; จบด้วยรอเซ็นตามแบบ)

ไม่ flip: SA-001 (transport contract ยัง PROPOSED รอ G/Light), BE-001 (รอ runtime/DB proof ตาม EV), SA-004/DBA-001 (ขอดู verdict เฉพาะ task ก่อน), TP-002 (ยังมีแค่แผน ไม่มี harness)

## Change Log
- 2026-10-24 — เปิดใบงาน061; ผลจะ append เมื่อรับ
