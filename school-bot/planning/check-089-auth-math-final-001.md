# Check089 — Auth45 PASS, Weighted37 PASS, Conversion FAIL

วันที่2026-10-26 · check CodexT2 · run `2026-10-26-11-02-42-check-tier-t2-1agents-FTFIQP`

Canonicalreviewครบแล้วพร้อมcurrentSourceRoslyn/memoryxUnit/sourcebinding: Auth45pass/0fail, weighted37pass/0fail, conversion31pass/2fail รวม113pass/2fail/115cases/exit1. ไม่ใช้106checksที่ขาดspecจากLb0BL0แทนผลนี้. Exact45Authtestsตรงdisk/patchรวมcase42SystemId0; trustedlinkfixtureต้อง90001จึงไม่มีlinkสำหรับ0 ไม่ปนAccount/ProfileID0policy.

## Findings

High precisionbugที่ScoreConversionCalculator.cs:21หารdecimalก่อนคูณทำexactmidpointต่ำกว่า. Canonicalnumeric18,6รองรับสองตัวอย่างนี้:

| earned / max → target | expectedrounded | actualraw → rounded |
|---|---|---|
| 0.5 / 6 → 6 | 1 | 0.4999999999999999999999999998 → 0 |
| 368276.5 / 366218635856 → 366218635856 | 368277 | 368276.49999999999999986888 → 368276 |

ขัดBR05003/05/AC05003และgrade-rules formula ไม่ใช่inputเกินขอบเขต. ส่งsysCodexT2rework1แก้exacthalf-upโดยไม่epsilon/double/แก้expected; Weighted/Authที่ผ่านคงเดิม.

Weightedใช้canonical79/81และส่วน16+18+45จริง ตรวจquiz/weights/IDs/validation/errors/no-round/no-renormalize. OracleActivityIdlongMaxถอนแล้วใช้canonicalK=intMax; ไม่รับรองAPI/DBlongจากinternalhelper. ไม่พบproductioncalculatorcallers. Authแก้2bugsผ่าน, matrixcollationยังunprovenตามจริง; C1–C10/TR-AUTH/fullLogin/BE001/G-AUTH/H5คงpending. ข้อแนะนำdocSystemIdบริบทemployee/linkageไม่บล็อกsubset.

## Test handoff

ผู้ตรวจส่งgenerator/runnerเต็มในrawanswer. ผู้คุมexecuteเฉพาะgeneratorprefixเพื่อสกัดindependentMathpatch70cases/208sourcelinesเข้าreports/school-bot/normal-089/math-tests-final.patch ไม่เปลี่ยนexpected. Patchhash `30C481D6CA5885525A9BF3437193CC80EBBD1280A0901CB5F2338C949A494C93`, sourceLF-no-final-newlinehash `71021EC1CDAB95331B55ADB9785FE322DD064A81D809C1ABC5C19BBF74D551E2` ตรงผู้ตรวจ. ให้sysติดตั้งpersistenttestsแล้วredก่อน/greenหลัง; parentจะรันfullsuiteซ้ำ.

Sourceก่อน/หลังคงเดิม: CompatibilityE344...553A, Weighted13C5...2EDC, ConversionDC6E...AB4D, Tests3F6F...E9B4. CompilewarningCS1701/hidden8019/8933จากinmemoryhostrefs. NOT_RUNfullLogin/Gateway/gRPC/DB/network/UI/hardware/policyfreeze/roster/preview/exportPG/installer; ไม่ปิดcanonicaltasks/gatesจากsubset.

## Change Log

- 2026-10-26 — รับverdictแยกsubsetและส่งconversionrework1พร้อมindependent70tests.
