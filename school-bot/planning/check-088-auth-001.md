# Check088 — BE-001 compatibility subset FAIL

วันที่2026-10-26 · ผู้ตรวจอิสระ: check CodexT2 · run `2026-10-26-08-57-46-check-tier-t2-1agents-jexqgG`

Verdict FAIL เฉพาะartifactใหม่ LegacyAuthCompatibility.cs/LegacyAuthFixtures.cs/docs/AUTH-COMPATIBILITY-MATRIX.md. รัน45adversarialcasesในหน่วยความจำผ่านAdd-TypeกับcompiledInfrastructureassembly: ผ่าน32/ตก13/exit1. ตรวจDLL↔PDB GUIDและPDBchecksumสองsourcefilesตรงกัน ไม่ใช้4032regressionเดิมแทนnewcodetests

| Finding | Expected/actual และงานแก้ |
|---|---|
| สูง: cardinality/eligibility | ResolveDuplicateAccountเลือกIDสูงสุดจากบัญชีซ้ำ/mixedcategory/deleted/unknownแทนfailclosed รวม6เคส ขัดgRPCcontract§4; ต้องไม่ใช้portFirstOrDefaultเป็นadmissionpolicy |
| สูง: unprovenlinkage | ValidateBindingคืนvalidสำหรับsame-school/categoryแต่ไม่มีverifiedlink รวมemployee/student/SystemIdnull/0 รวม4เคส; ห้ามเดาจากIDหรือรับadminflagเป็นauthority |
| กลาง: inputbounds | VerifySha1รับemptyและ1025chars, VerifyDateCandidateรับ1025chars รวม3เคส; matrixอ้างboundsแต่ไม่มีการบังคับ |
| สูง: matrixเลือกpolicyเอง | รองรับSHA1/PBKDF/dateและhighestSIDเป็นtargetโดยไม่แยกC1–C10/TR-AUTHpending; ขาดnormalizationและอ้างdecisions048ที่ไม่มีในspecที่มอบหมาย |
| กลาง: fixtures/dateevidence | PBKDFfixturehash16bytesแต่reference32bytes; differentialbirthdateสองเคสlegacytrue/artifactfalse ไม่ใช่อำนาจเลือกtargetculture |

Passedcasesครอบcross-tenant, invalidtenant, deleted1, inactiveprofile, lockout, WorkStatus2/3, categorymismatch/null/unknown และSHA1publicvector/case/whitespace. Nullaccount/profile/candidateelementที่ตรวจพบNullReferenceException; ต้องมีcontrolledvalidation. ไม่พบcallerของสองไฟล์ในweb จึงไม่อ้างว่ามีruntimeexploit/sessionจริง

ส่งsysแก้รอบ1หลังwriterBที่กำลังทำจบตามกติกาserialize; แยกlegacyobservedbehaviorออกจากSchoolBotadmission. คงC1–C10/TR-AUTHที่ขาดเป็นpending; ไม่มีคำอนุญาตให้เลือกbusinesspolicyใหม่. เตรียมpersistentregressionตามcasesของcheckโดยอ้างผู้เขียนtestอิสระ ห้ามให้engineerเลือกexpectedตามimplementation

canonicalBE001ยังpending (verdictนี้เป็นsubset) ไม่ปิดfullLogin/G-AUTH/H5. หากแก้เกินสองรอบต้องรวมถามผู้ใช้ตามCONTINUE-NORMAL ไม่รับความเสี่ยงแทนคน

## Change Log

- 2026-10-26 — บันทึกผลcheckจริง45cases/13fail และส่งกลับengineer ไม่ยกระดับregressionpassเป็นacceptancepass
