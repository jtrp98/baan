# ผลตรวจ 094 — SB-W2 re-check หลัง rework รอบ 2/2 (สุดท้าย)

วันที่ของงาน 2026-11-02 · ผู้ตรวจ: check (Codex T2) · **BE-002 S1-db-adapters: FAIL** — ครบเพดาน rework 2/2 แล้ว → รอผู้ใช้ตัดสิน

Oracle ตรึงเดิม (2026-10-29) จาก [BE-002](../plan/BE-002.md) Oracle pack: AC-027-04, AC-036-02, AC-036-03, AC-033-05 · DES-004 Rev11 · TP001-008/022/023/052/053 + Amendment002 — ไม่เพิ่มเกณฑ์ ไม่ตัดสิน BE-002 ทั้ง task

## ที่มารอบนี้

- writer: sys รันโดย AGY T3 (`--no-fallback`; ลำดับที่ผู้ใช้สั่งรอบนี้ agy > codex > claude — agy จบ DONE จึงไม่สลับ) · run `2026-11-02-02-06-37-sys-tier-t3-1agents-sxqROZ` · ใบงาน `reports/school-bot/normal-094/sys-BE-002-r2b-task.txt` (รันซ้ำ rework 2/2 ที่ล้มเพราะ DNS 2026-10-29 — ไม่นับเป็นรอบใหม่)
- ผู้แก้รายงาน: commit project+revision ร่วมกัน · เพิ่มเคส `CommitFailure_RevisionAndRollbackWriteFailure_LeavesNoHalfProjectAfterRestart` · ใช้การแก้ค้างใน `FileSchoolBotBackingStore.cs` (temp + replace)
- checker: Codex T2 สองครั้งแรก BLOCKED จากสิทธิ์ sandbox (read-only / cwd ไม่ครอบ reports — ปัญหาการตั้ง runner ไม่ใช่ผลโค้ด) · ครั้งที่ 3 cwd = ราก workspace → run `2026-11-02-02-32-12-check-tier-t2-1agents-5iXVOL` · หลักฐานดิบ `reports/school-bot/normal-094/check-wave2-r2b-{fix,gate,runner}/` (handoff.md, disk-evidence.json)

## ผลรันเอง

| ชุด | ผ่าน | ตก | ข้าม |
|---|---:|---:|---:|
| xUnit ทั้งชุด B ไม่ filter | 4,180 | 0 | 0 |
| contract (ใน xUnit) | 11 | 0 | 0 |
| scoped เดิม | 8 | 0 | 0 |
| fix F2 เดิม | 2 | 0 | 0 |
| เคสเพิ่ม F2 (มี Project เดิม) | 0 | 1 | 0 |
| extra backlog เดิม (ไม่ใช้ตัดสิน) | 1 | 2 | 0 |

เคสเพิ่มรวมทั้ง task 6 (≤ 20)

## F1/F2

| ประเด็น | เคส | ผล |
|---|---|---|
| F1 | FailedLicenseWriteDoesNotLeakIntoLaterCommit · FailedProjectUpdateDoesNotLeakIntoLaterCommit | ผ่าน |
| F2 | RevisionCommitFailureLeavesNoHalfProjectAfterRestart · ExistingProjectRevisionFailureRestoresReadableRevision · RevisionAndRollbackWriteFailureLeavesNoHalfProjectAfterRestart | ผ่าน |
| F2 | **SecondProjectRevisionAndRollbackWriteFailureLeavesNoHalfProjectAfterRestart** | **ตก** |

**F2 คงค้าง (Important)** — บันทึก Project 1 + revision 1 สำเร็จ → สร้าง Project 2 → revision write และ project write ล้ม → restart: `projects.json` มี Project 2 (CurrentRevision=1) แต่ `project_revisions.json` ไม่มี revision ของมัน

ต้นเหตุ: `SchoolBotDbAdapter.cs:199` (`shouldCommit = projects.Count > 0`) และบรรทัด 204 เขียน Project ใหม่ลง disk ก่อน revision เมื่อมีงานเดิม · catch บรรทัด 272–289 ลบเฉพาะ cache · backing store แยก `projects.json`/`project_revisions.json` และ atomic ทีละไฟล์ ไม่ใช่คู่ Project+revision — การเลื่อน persist เฉพาะ Project แรกทำให้เคสเดิมผ่านแต่ไม่แก้ต้นเหตุ

## AC

| AC | ผลเฉพาะ slice S1 |
|---|---|
| AC-027-04 | ผ่าน |
| AC-036-02 | บางส่วน — F2 ตก |
| AC-036-03 | บางส่วน — งานเดิมผ่าน แต่ Project ใหม่ชี้ revision ที่ไม่มี |
| AC-033-05 | ผ่าน mapping 6 records/82 fields · catalog จริงรอ DBA-003/G-CORE |

## Change Log

- 2026-11-02 — สร้างจาก handoff ของ check run 5iXVOL (นายช่าง สกัดเนื้อหา)
