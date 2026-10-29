# หลักฐานข้อบกพร่อง BE-002 S1 — wave gate รอบ 1

วันที่ของงาน: 2026-10-29 · Oracle: AC-027-04/AC-036-02/03; DES-004 Rev11; TP001-008/022

[ผลตรวจหลัก](check-094-wave2-gate-001.md) · raw evidence: reports/school-bot/normal-094/check-wave2-gate

## ข้อบกพร่องที่ทำให้ FAIL — ส่ง sys

**F1 · Important · TP001-008/022 (AC-027-04, AC-036-02): การเขียนที่แจ้งล้มเหลวกลับถูก commit ภายหลัง**

ทำซ้ำ: ให้ backing store โยน IOException ก่อนเขียน License; เรียก create แล้วรับ exception; อ่าน cache; คืน store ให้ปกติแล้วสร้าง License อีกใบ; เปิด instance ใหม่อ่าน disk. expected: ไม่มีใบแรกทั้ง cache/disk. actual: cache=1 และ disk มี `failed,successful` สองใบ. เคส Project update แบบเดียวกัน: ชื่อที่เขียนล้มเหลวกลับติด disk หลังสร้าง Project อีกงาน. เป็น failure path ที่ pack ระบุและทำซ้ำได้บน persistent stub โดยไม่ต้อง DB จริง.

ต้นเหตุ: [SchoolBotDbAdapter.cs:115](../../../target/school-bot/web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:115) เพิ่ม list ก่อน Save; update ใช้ [บรรทัด 207](../../../target/school-bot/web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:207) โดยไม่มี rollback cache เมื่อ store fail. ทดสอบ `FailedLicenseWriteDoesNotLeakIntoLaterCommit` / `FailedProjectUpdateDoesNotLeakIntoLaterCommit` ใน `check-wave2-gate/Program.cs:49,61`; fixture paths ระบุใน results.json.

**F2 · Important · TP001-008/022 (AC-036-02/03): Project และ revision ไม่ atomic**

ทำซ้ำ: SaveProjectAsync(CurrentRevision=1) สำเร็จ; ให้ SaveProjectRevisionAsync โยน IOException; restart ด้วย store ใหม่. expected: ไม่เหลือ Project ที่ชี้เนื้อหาที่ไม่มี. actual: Project ยังอยู่ CurrentRevision=1 แต่ GetProjectRevisionAsync คืน null; เปิดงานเดิมไม่ได้ครบ. เส้นทาง save ประกอบสองคำสั่งนี้เป็นเส้นทางเดียวกับ contract เดิม `SchoolBotDbAdapterContractTests.cs:178` และ interface ไม่มี unit-of-work/atomic save ให้ผู้เรียกใช้.

หลักฐาน: [SchoolBotDbAdapter.cs:194](../../../target/school-bot/web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:194) commit metadata และ [บรรทัด 231](../../../target/school-bot/web/src/SchoolBot.Infrastructure/Persistence/SchoolBotDbAdapter.cs:231) commit revision แยกกัน; `check-wave2-gate/Program.cs:74` เคส `RevisionCommitFailureLeavesNoHalfProjectAfterRestart`. ต้องแก้ contract/implementation ให้ caller บันทึกครบหรือ rollback ได้ แล้วตรวจ failing cases ทั้งสามพร้อม scoped suite ซ้ำ.

## Change Log

- 2026-10-29 — check แยกรายละเอียดทำซ้ำ F1/F2 จากรายงานหลักเพื่อคุมขนาดเอกสาร.

