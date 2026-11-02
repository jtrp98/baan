# ใบงาน094 — SB-W2 ตรวจตามความเสี่ยง: DBA-002 · DBA-004 · BE-039 · BE-002

วันที่2026-10-29 · นายช่าง · ผู้ใช้สั่ง "Start SB-W2" หลังอ่าน [ผลวัด pilot 093](pilot-093-metrics-001.md) = ตัดสินขยายผลตรวจตามความเสี่ยงไป wave ถัดไป

## ขอบเขต

| Task | role / runner | risk | การตรวจ |
|---|---|---|---|
| DBA-002 + DBA-004 | vault Codex T2 --no-fallback --write cwd workspace — **รันเดียว** เพราะแก้ `db/schoolbot_db.sql` ไฟล์เดียวกัน · handoff/verdict แยกราย task | high ทั้งคู่ | check ทันทีหลัง DONE (verdict ราย task) |
| BE-039 | sys AGY T3 --no-fallback --write cwd target\school-bot (B) — slice ถัดไปของ AC-043-01 บน stub · ไม่รอ H5 | high | check + jpo ทันที (auth) |
| BE-002 | sys T3 --write cwd target\school-bot — **รอ DBA-002 ผ่าน L1** (pipelining) และรอ BE-039 writer จบ (repo B เดียวกัน = serialize) | low | contract test ของ DB adapter + wave gate |

## Oracle ตรึง

oracle pack ในหัวข้อ Acceptance ของ [DBA-002](../plan/DBA-002.md) · [DBA-004](../plan/DBA-004.md) · [BE-039](../plan/BE-039.md) · [BE-002](../plan/BE-002.md) (ตรึง 2026-10-29) · เคสเพิ่ม ≤ 20/task · rework ≤ 2 แล้วถามผู้ใช้ทันที

## Change Log

- 2026-10-29 — เปิด094 · ไม่มี role ค้างรัน · lint แผน ✓
- 2026-10-29 — DBA-002/DBA-004 verified (check PASS static; รัน SQL = คน/DBA-003) · BE-039 S2 verified (check PASS + jpo ไม่มี Critical/Important) · BE-002: wave gate FAIL F1/F2 → rework1 → F2 ยังตก → rework 2/2 ล้มกลางทาง (DNS ของเครื่อง resolve agy/codex ไม่ได้) → slice blocked · worktree B test ตก 1 จากการแก้ค้าง · รอเครือข่ายแล้วรัน rework 2/2 ซ้ำ
- 2026-11-02 — ผู้ใช้สั่งรัน rework ต่อด้วยลำดับ runner agy > codex > claude · sys AGY T3 จบ DONE (B 4180/0) · check Codex T2 ครั้งที่ 3 (สองครั้งแรก BLOCKED จาก sandbox) **FAIL** — F2 ยังเหลือ half-project เมื่อมี Project เดิม ([check-094-wave2-gate-003](check-094-wave2-gate-003.md)) · ครบเพดาน rework 2/2 → หยุดเปิดงานใหม่ ถามผู้ใช้ตามกติกาข้อ 12
- 2026-11-02 — ผู้ใช้สั่งให้ arch หาจุดปรับปรุง · arch Codex T1 → NEEDS_HUMAN: [project-commit-proposal-001](../design/project-commit-proposal-001.md) แนะนำทาง A (commit Project+Revision เป็นหน่วยเดียวที่ backing store) · รอผู้ใช้อนุมัติทาง A + วิธีจัดการข้อมูล file เดิม ก่อนส่ง arch ออก delta → sys → check
