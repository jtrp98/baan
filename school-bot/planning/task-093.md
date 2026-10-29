# ใบงาน093 — pilot ตรวจตามความเสี่ยง (BAAN ข้อ 13) บน SB-W1: SA-001 · BE-001 · SEC-001 · TP-002

วันที่2026-10-29 · นายช่าง · ผู้ใช้สั่ง "Start SB-W1 pilot" หลัง re-gate (tasks-001.json changelog 2026-10-29) · แผนงาน: wave 1 ของ slice DB→License→Login→Projects

## ขอบเขต

| Task | role / runner | risk | การตรวจ |
|---|---|---|---|
| SA-001 | arch Codex T1 --no-fallback --write cwd workspace | high | check ทันทีหลัง DONE ก่อนเปิดงานต่อยอด |
| BE-001 | sys AGY T3 --no-fallback --write cwd workspace (อ่าน source เดิม ไม่แก้ target) | high | check ทันทีหลัง DONE |
| SEC-001 | jpo Codex T2 --no-fallback --write cwd workspace | high | check ทันทีหลัง DONE |
| TP-002 | inspect Codex T2 --no-fallback --write cwd workspace | low | wave gate: check ใบเดียวท้าย wave + ความสอดคล้องข้าม task |

- writer ขนานไม่เกิน 3 (เขียนคนละไฟล์ใน knowledge) · check ไม่กิน slot เกินครึ่ง
- ใบงาน role อยู่ workspace `reports/school-bot/normal-093/` (`_common.txt` + `<role>-<task>-task.txt`)

## Oracle ตรึง (กติกาข้อ 12/13)

oracle pack ในหัวข้อ Acceptance ของ [SA-001](../plan/SA-001.md) · [BE-001](../plan/BE-001.md) · [SEC-001](../plan/SEC-001.md) · [TP-002](../plan/TP-002.md) (ตรึง 2026-10-29) — writer/check อ่าน pack ไม่อ่าน docs เต็ม · เคสเพิ่มนอก pack ≤ 20 ต่อ task · rework ≤ 2 รอบแล้วถามผู้ใช้ทันที

## วัดผล pilot (TASK-010)

เก็บต่อ run: นาที writer/check · verdict · จำนวนเคสต่อ check · จำนวนครั้งที่อ่าน docs เต็ม — เทียบ baseline ([วิเคราะห์ workflow](../../../../AICode/baan/docs/workflow-verification-analysis.md) ข้อ 3.3: ตรวจ 28% ≈ เขียนโค้ด 28% · FAIL 58%)

## Change Log

- 2026-10-29 — เปิด093 · ไม่มี role ค้างรัน · lint แผน ✓ (ติดประตู 20/63)
- 2026-10-29 — ปิด SB-W1: SA-001/SEC-001 L1 PASS รอบเดียว · BE-001 L1 FAIL→rework 2 รอบ→PASS · TP-002 wave gate PASS · 4 task verified พร้อม oracle+ref · [ผลวัด pilot](pilot-093-metrics-001.md) ผ่านเกณฑ์ 4/4 · ข้อรอคน H1/H2/H4/H5 + TR-AUTH-03/04/06 + GAP-AUTH-006
