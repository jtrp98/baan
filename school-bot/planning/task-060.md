# ใบงาน060 — โหมด solo: ปิด GAP design + เตรียม artifact packs รอบมนุษย์ (docs-only)

วันที่2026-10-24 · นายช่าง solo (ZCode session เป็นทีมทั้งทีมตาม charter "โหมด solo") · ต่อจากคิว [queue-003](queue-003.md) §3 ฐาน (override ใบงาน051 สำหรับ transport docs ปิดแล้วรอบ055–059) · ไม่เขียน code/SQL/runtime · คง 110 tasks pending / 44 REQ / 180 AC / 17 gates · ประตูมนุษย์ทุกประตูไม่ปิดเพิ่ม

## เหตุผล

คิว §3 ระบุงานเตรียมเอกสารราย owner ที่ไม่ติด dependency/ประตูมนุษย์ แต่ยังไม่มีใครทำ: GAP-01..04/06/07/08 ของ arch ยังไม่ถูก sync (DES-002 ยัง `/admin/licenses`, DES-003 ยังระบุ UTF-8 bytes เฉยๆ, ETag ยังไม่ sync, Change Log ค้าง Rev 2026-10-21), BA-001..004 packs ไม่มีไฟล์, งานเอกสาร vault §3.2 ไม่มีหลักฐาน, UX-001/003 ยังว่าง, TP-002 ยังไม่เตรียม — ทั้งหมดเป็นเงื่อนไข "ต้องรอ artifact ครบก่อนถามมนุษย์" ตาม §4

## แผนงาน (max 3 ขนาน)

| # | Role | งาน | ผู้รันจริง |
|---|---|---|---|
| 060a | arch | GAP-01..04/06/07/08 + SEC001-003/009 เข้าสัญญา + BL-001 (schema-notes) + ร่าง SA-004 credential/custody matrix | runner ภายนอกผ่าน baan-role (codex t1 --write แก้เฉพาะ design\, snapshot ก่อนแก้) |
| 060b | spec | BA-001 Guest summary / BA-002 content inventory (GAP-09) / BA-003 hardware pack (GAP-05) / BA-004 delivery pack | นายช่าง solo (subagent role spec) — นายช่างบันทึกไฟล์ |
| 060c | vault | ยืนยัน ReplayUntil TTL ไม่แก้ DDL / PII inventory 32 ตาราง (SEC001-010) / DB safe-evidence set / BL-001 ส่วน vault | นายช่าง solo (subagent role vault) — นายช่างบันทึกไฟล์ |
| 060d | int | ร่าง UX-001 (Entry/License/Login) + UX-003 (Labs) รอเซ็น | นายช่าง solo (subagent role int) — นายช่างบันทึกไฟล์ |
| 060e | inspect | sync TP-001 ตาม GAP ที่ arch ปิด + เตรียม TP-002 failure/race fixtures | นายช่าง solo (subagent role inspect) — นายช่างบันทึกไฟล์ |
| 060f | check/jpo | ตรวจข้ามโมเดลงานที่ solo/subagent เขียน (packs, PII, TP, UX) + ผล arch | runner ภายนอกผ่าน baan-role |

ห้ามทั้งรอบ: ถามธุรกิจซ้ำ (transport/cType/มติ035/Guest policy/พาธ legacy/OS), เปลี่ยน scope/dependency/gate/status, ปิด gate, รัน SQL/DB/runtime, เขียน code

## Change Log
- 2026-10-24 — เปิดใบงาน060 (solo round): แตก 060a ผ่าน baan-role (codex t1), 060b/060c เป็น subagent พื้นหลัง; ผลจะ append ด้านล่างเมื่อรับแล้ว
