# กฎสิทธิ์ ตัวตน และโครงงาน

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](data-contract-rules.md)

กฎในตารางเป็น invariants ที่ application ต้องรักษา ร่าง SQL คงเฉพาะ PRIMARY KEY และไม่มี UNIQUE/FK/CHECK การบังคับด้วย repository locks ยังไม่มี runtime evidence อ่าน [กฎการล็อกและ commit](data-contract-rules-transactions.md) ร่วมด้วย

| กลุ่ม | กฎ |
|---|---|
| License | `KeyHash` unique ทั้งระบบ (`RULE_UNIQUE_SchoolBotLicense_KeyHash`); `CurrentBindingId` ต้องเป็น binding ของ License/School เดียวกันและ `DetachedAt=null` (`LOGICAL_SchoolBotLicense_CurrentBinding` ในเชิงตรรกะ (ไม่มี FK ใน SQL)); มี current ได้หนึ่งเดียว; **ทั้งช่อง `desktop` และช่อง `school_web` ต้องตรวจว่าโรงเรียนมี `SchoolBotLicense` ที่ active (ไม่หมดอายุและ `RevokedAt=null`)** โดยช่อง `school_web` ไม่ต้องมี device binding (decisions-025/026) |
| Binding | unique `(LicenseId,Epoch)` (`RULE_UNIQUE_SchoolBotLicenseBinding_LicenseId_Epoch`); active binding (`DetachedAt=null, IsDelete=false`) มีได้ไม่เกินหนึ่งต่อ License (กฎ active binding ผ่าน transaction lock บน `LicenseId`); epoch เพิ่มเมื่อเปลี่ยน binding; `LastEntitlementExpiresAt` ≤ `License.ExpiresAt` และ ≤ `LastCheckedAt+259200` วินาที |
| Identity/Session | `TokenHash` unique (`RULE_UNIQUE_SchoolBotSession_TokenHash`); `Channel` ∈ `desktop\|school_web\|staff_admin` (ค่าเริ่ม `'desktop'`); `Channel=desktop` ⇔ `DeviceJkt` not null และ `AccountId` not null; `Channel IN ('school_web','staff_admin')` ⇒ `DeviceJkt=null`; `ProfileKind/ProfileId` null พร้อมกันก่อน bind (หรือกรณี legacy admin ที่ไม่มี employee row); **Desktop (`Channel=desktop`) bind ได้ทั้ง `student` และ `employee` (ใช้เรียน/ลองเท่านั้น ไม่มีเมนูครู/ส่งคะแนนใน Desktop ตาม decisions-025/026)**; expiry/revocation ตาม DES-004 และ DES-012 |
| StaffRole | live unique `(SchoolId,EmployeeId,Role)` เมื่อ `IsDelete=false` (กฎ live role ผ่าน transaction lock บน `(SchoolId,EmployeeId,Role)`); `ValidUntil>ValidFrom` เมื่อมีค่า; `SchoolId` คือโรงเรียนต้นสังกัดของบัญชีพนักงาน |
| TeacherGrant | (ทางสำรองตาม DES-004 — ยังไม่ได้ตัดสินให้สร้างใน `db/schoolbot_db.sql` ตาม decisions-026 และ db/review-005) หากเปิดใช้ในอนาคต: live unique `(SchoolId,TeacherId,LearnerId,Mode)` เมื่อ `IsDelete=false`; `CanAssess` ต้อง `CanView`; ผู้ให้/ผู้รับอยู่โรงเรียนเดียวกัน; `ValidUntil>ValidFrom` |
| Project | เจ้าของ (`student` หรือ `employee`)/`Mode` เปลี่ยนไม่ได้; unique `(ProjectId,Revision)` (`RULE_UNIQUE_SchoolBotProjectRevision_ProjectId_Revision`); `CurrentRevision` ชี้ `(ProjectId,Revision)` จริงใน `SchoolId` เดียวกัน (`LOGICAL_SchoolBotProject_CurrentRevision` ในเชิงตรรกะ (ไม่มี FK ใน SQL)); revision immutable; การสร้างหรือบันทึกงาน (`CommitProjectAsync` ตาม [decisions-051](../requirement/decisions-051.md)) ต้อง commit `SchoolBotProject` และ `SchoolBotProjectRevision` เป็นหน่วยเดียวกัน ห้ามเผยแพร่ Project หรือเลื่อน `CurrentRevision` ก่อน Revision commit สำเร็จ และห้ามใช้ compensation write แทนการ commit ร่วม |
| Level / PromotionPolicy | global (`SchoolId=null`); `LevelKey`, `Code`, `Ordinal` unique (`RULE_UNIQUE_SchoolBotLevel_*`); `LevelPromotionPolicy` unique `(LevelId,Revision)` (`RULE_UNIQUE_SchoolBotLevelPromotionPolicy_Level_Revision`), `Threshold` ช่วง `0..100`, Level ใหม่ต้องมี revision 1 = `70`; immutable ต่อ revision |
