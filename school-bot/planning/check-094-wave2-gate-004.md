# ผลตรวจ 094 — SB-W2 BE-002 หลัง rework 3 (มติ051 ทาง A)

วันที่ของงาน 2026-11-02 · ผู้ตรวจ: check (Claude T2 — Codex ติดโควตา, writer เป็น AGY จึงใช้ตัวรันต่างจากผู้เขียน) · **BE-002 S1-db-adapters: PASS**

Oracle ตรึง: [BE-002](../plan/BE-002.md) Oracle pack (2026-10-29) — AC-027-04, AC-036-02, AC-036-03, AC-033-05 · DES-004 Rev11 · TP001-008/022/023/052/053 + Amendment002 · + invariant 1–6 ของ [project-commit-proposal-001](../design/project-commit-proposal-001.md) ตาม[มติ051](../requirement/decisions-051.md) · สัญญาโครงสร้าง: ทาง A + project-api-001 Rev2 · นอก oracle: lost-update หลาย instance, kill/power-loss จริง, PostgreSQL จริง, full Login

## ที่มารอบนี้

- writer: sys AGY T3 run `2026-11-02-03-03-24-sys-tier-t3-1agents-fBDa5w` · ใบงาน `reports/school-bot/normal-094/sys-BE-002-r3-task.txt` — เพิ่ม `CommitProjectAsync` (adapter + backing store) · file store snapshot เดียว `projects_snapshot.json` · memory สลับทั้งชุดใต้ lock · ลบ `SaveProjectAsync`/`SaveProjectRevisionAsync`
- นายช่างรันซ้ำ: `dotnet test web\SchoolBot.slnx --disable-build-servers -m:1 -p:NuGetAudit=false` → 4,186 ผ่าน / 0 ตก / 0 ข้าม · grep ไม่พบเมธอดเขียนแยกเดิมใน `web/src`
- checker: run `2026-11-02-03-16-24-check-tier-t2-1agents-yneac0` · หลักฐานดิบ `reports/school-bot/normal-094/check-wave2-r3-{gate,runner}/` (handoff.md, source-sha256.txt, results.json, xunit-results.json)

## ผลรันของ check

| ชุด | ผ่าน | ตก | ข้าม |
|---|---:|---:|---:|
| xUnit ทั้งชุด ไม่ filter | 4,186 | 0 | 0 |
| contract (ใน xUnit) | 17 | 0 | 0 |
| scoped เดิม | 8 | 0 | 0 |
| F2 เดิม | 3 | 0 | 0 |
| เคสเพิ่มรอบ 3 (ของ check เอง) | 11 | 0 | 0 |
| extra backlog เดิม (ไม่ใช้ตัดสิน) | — | 2 | — |

เคสเพิ่มรวมทั้ง task 17 (≤ 20)

## F1/F2 และ invariant

| ประเด็น | เคส | ผล |
|---|---|---|
| F1 | FailedLicenseWrite… · FailedProjectUpdate… | ผ่าน |
| F2 (เคสที่ตกรอบก่อน) | SecondProjectRevisionAndRollbackWriteFailureLeavesNoHalfProjectAfterRestart | **ผ่าน** — หลัง restart disk มี Project 1 / Revision 1 · Project 2 ไม่อยู่ทั้ง disk และ cache |
| F2 disk จริง | Inv3_RealFileReplaceFailure (ล็อกไฟล์ snapshot จริงจน replace ล้ม) | ผ่าน — sha256 ไม่เปลี่ยน ไม่เหลือ `.tmp` ID ไม่เลื่อน |
| Inv 1 | อ่าน JSON บน disk ตรง ทุกเคส F2 | ผ่าน |
| Inv 2 | ผล commit = store หลัง instance ใหม่ (file + memory) | ผ่าน |
| Inv 3 | fault ก่อน commit / update ล้มไม่เลื่อน ETag/Revision | ผ่าน |
| Inv 4 | lost response หลัง commit · cancel ที่ commit | ผ่าน (kill process จริงนอก oracle) |
| Inv 5 | stale ETag + immutable fields (412, 400×4, 428) · Revision เก่าคงเดิม | ผ่าน |
| Inv 6 | init revision load ล้ม · commit fault + reload ล้ม · session write ล้ม | ผ่าน |
| ไม่มีทางเขียน Project โดยไม่มี Revision | reflection + grep ทั้ง web | ผ่าน |

อ่านโค้ด: publish cache/ID หลัง commit เท่านั้น (`SchoolBotDbAdapter.cs:336-348`) · catch = reload จาก store แล้ว throw ไม่มี compensation (`:317-334`) · file store temp + replace ครั้งเดียว (`FileSchoolBotBackingStore.cs:89-121`) · memory สลับใต้ lock เดียว (`MemorySchoolBotBackingStore.cs:43-56`)

## AC (slice S1)

| AC | ผล | ข้อจำกัด |
|---|---|---|
| AC-027-04 | ครบ | ไม่รับรองผู้เรียก v2/DB จริง |
| AC-036-02 | ครบ (F2 ปิด) | ไม่รับรอง Login/UI จริง |
| AC-036-03 | ครบ | restart = instance ใหม่ ไม่ kill process |
| AC-033-05 | ครบ mapping 6 records/82 fields | catalog จริงรอ DBA-003/G-CORE |

## ข้อเสนอ backlog (นอก oracle) → [BL-006](../backlog.md)

1. file store รูปแบบสองไฟล์เดิมถูกละเลยเงียบ — ปัจจุบันไม่มีข้อมูลเดิม ([มติ051](../requirement/decisions-051.md): Program.cs ใช้ Memory store) แต่ต้องกันไว้ก่อนเปิดใช้ File store ที่ใดก็ตาม
2. Project/Revision โหลดจาก snapshot สองครั้ง — หลาย instance อาจได้คนละรุ่น (กลุ่ม lost-update หลาย instance เดิม)
3. ไม่มี flush ลง disk ก่อน replace — ยังไม่พิสูจน์ kill/ไฟดับ
4. ETag อิง ticks ของ UpdateDate — สอง update ใน tick เดียวได้ ETag ซ้ำ
5. extra เดิมยังตก: TwoInstancesDoNotLoseAcknowledgedLicense · SessionProfileCannotAuthorizeAnotherProfile
6. memory store ส่วน License/Session ยังใช้ `Clear()` แล้วเติมทีละรายการ

## Change Log

- 2026-11-02 — สร้างจาก handoff ของ check run yneac0 (นายช่าง สกัดเนื้อหา)
