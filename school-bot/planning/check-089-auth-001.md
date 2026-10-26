# Check089 — auth compatibility รอบ1 FAIL

วันที่ 2026-10-26 · check Codex T2 · run `2026-10-26-09-50-22-check-tier-t2-1agents-tdkCsD`

ตรวจ source ปัจจุบันอย่างอิสระ 45 cases: ผ่าน42/ตก3/exit1. Compileใน memory ผ่าน PowerShell7.6.5/.NET10.0.11 และเรียก standalone checks กับ xUnit assertions ของ patch ได้ผลตรงกัน; ไม่ rebuild solution/ไม่ใช้4032 regressionแทนnewcode. Sourcehash Compatibility `1A870BEA436C6A118EFC7E522082EDCE3BDB0CE7C1FF39353603E6F618B74F4D`, Fixtures `1A4C0BA6C8F0C550D186883D1472D0B7BCA03BC164D44D14408016F44F336908` คงเดิมก่อน/หลัง.

## ส่ง sys แก้รอบ2

| Cases | ปัญหา/expected | Source |
|---|---|---|
| 24,28 | active candidate ปน CType9/null ต้อง failclosed; actualกรองค่าผิดก่อนนับแล้วเลือกบัญชีปกติได้ | LegacyAuthCompatibility.cs:175; gRPCcontract singleactiveaccount |
| 40 | employee WorkStatusnullต้องปฏิเสธสถานะไม่ครบ; actualIsValidtrue | LegacyAuthCompatibility.cs:85/232; auth-evidencefailclosed |

สองกลุ่มเป็น logic สูง ต้องแก้ก่อนรับsubset. Matrixควรลดคำอ้างusernamecase-sensitiveเป็นunprovenDBcollationและแก้TeacherRepositoryพาธจริง; เป็นdoccorrectionไม่เพิ่มเหตุFAIL. ถอนข้อสงสัยAccount/ProfileID0ออกจากFAILเพราะcanonicalIคือsignedint32ไม่บังคับpositive; ไม่เพิ่มpolicyเอง.

Persistent xUnit patchครบ exact45casesอยู่ rawanswer ของrun ให้sysนำไปเก็บและรันโดยไม่เปลี่ยนexpected; cases24/28/40ต้องแดงก่อนแก้. คงC1–C10/TR-AUTHpending; fixturessyntheticไม่ใช่compatibilitysignoff. นี่คือFAILหลังrework1; ส่งrework2ได้หนึ่งครั้งหลังwritergRPCว่าง. หากยังFAILหลังรอบ2รวมถามผู้ใช้ ไม่เปิดรอบ3เอง.

ข้อจำกัด: warningCS1701เมื่อใช้xUnitผ่านAdd-Typehost.NET10; ไม่รันdotnettestในroleนี้ ไม่ตรวจDB/network/UI/hardware/fullLogin/H5. canonicalBE001ยังpending.

## Change Log

- 2026-10-26 — บันทึกindependent42/45และexactrework2scope; ไม่รับwriterclaimsเป็นverdict.
