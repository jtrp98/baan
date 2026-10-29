# Review 008 — ผล parity และข้อแก้เอกสารส่ง arch

วันที่ของงาน: 2026-10-29 · [runbook](review-008.md) · [AC](review-008-ac.md) · [Project fields](review-008-project.md)

## Verdict เชิงไฟล์

ผ่านด้านชื่อ/ชนิด/NULL/default/PK/identityของDDLตามมติ044 โดยมีคำเตือนด้านintegrity: DBไม่บังคับความสัมพันธ์/ไม่ซ้ำ/validation และยังไม่มีruntime evidenceของapplication locks ไม่เสนอคืนUNIQUE/FK/CHECKสวนมติ และไม่รับรองAPIพร้อมเชื่อมจริง

## หลักฐานที่ตรวจ

อ่านOracle packs DBA-002/004, DES-002 Rev3/DES-003 Rev4, REQ-011/033/036, decisions027/029/044/045, DDL/rollback, review005–007, PII inventory, data-model Rev8/fields/legacy/contract-001..004เฉพาะscope, dictionary32หน้าที่indexเชื่อม, DBMLเต็มและintegration, project-apiและกฎข้อมูลร่วม ต้นทางlegacyอิงdictionary legacy001/003/004/005; ไม่อ่าน.env/credential ไม่ตรวจsourceที่ไม่อยู่ในbriefและไม่อ้างว่าพิสูจน์deployed legacy schema

`node reports/school-bot/normal-094/vault-static-check.cjs` exit0 ตรวจไฟล์ด้วยassert ไม่ใช่SQL execution/DBML parser ผลraw: `reports/school-bot/normal-094/vault-static-result.json`

| SQL Section | ตาราง | ฟิลด์ |
|---|---:|---:|
| 001 License/Release/Idempotency/Audit | 5 | 76 |
| 002 Session/StaffRole/Projects | 4 | 52 |
| 003 เนื้อหากลาง | 8 | 106 |
| 004 การเรียน/ผลประเมิน | 8 | 116 |
| 005 ส่งคะแนน | 6 | 84 |
| 006 LevelProposal | 1 | 16 |
| รวม | 32 | 450 |

ทุกตารางมี6ฟิลด์ร่วม, PK32เป็นinteger/int4 identity ALWAYS, audit4ตัวnullable DEFAULT NULL; ไม่มีVersion/UQ/FK/CHECK/standalone indexes นับจากSQLปัจจุบัน ไม่ใช้ยอดreviewรุ่นเก่า PK backing indexes32เป็นexpectedของPostgreSQL ยังไม่มีcatalogรับรอง

Structural signatureจากชื่อ/ลำดับ/ชนิด/NULL/default/identity/PKก่อนและหลังแก้ตรงกัน: SHA256 `dd6587c171b4b59d323644241d7cb7feb12e075bdff6c00086834efa9d7bc0ed` (JSON.stringify schemaในstatic check; ไม่ใช่file hash) จึงไม่มีphysical field delta

## DBML และdictionary parity

- Dictionary32หน้า: ครบ450ชื่อ/ลำดับ/ชนิด/NULLตรงDDL; defaultที่DDLกำหนดมีในคำอธิบาย PKและidentityอธิบายไว้ ไม่มีfieldเพิ่ม/หายเทียบDDL
- DBMLเต็ม: 32ตาราง/450ฟิลด์ตรงชื่อ/ชนิด/NULL/default/PKและincrement; ไม่มีRef/index blocks/unique markers ความสัมพันธ์physicalเป็นเซตว่าง จึงไม่มีFK endpoint/actionที่ต้องสร้างเพิ่มเติม
- ข้อจำกัดrepresentationที่ตั้งใจ: DBML `increment`ไม่แสดงALWAYS/ช่วงsequenceครบในattribute; DDLเป็นตัวตัดสินint4/identity และไม่มีenum/check allowed valuesในNoteเป็นกฎแอป ปัจจุบันPlanCourseIdsเป็นinteger[]ตรงกันทั้งSQLและDBML ไม่มีtype mismatchจุดนี้
- Integrationระบุsubset24ตาราง/112ฟิลด์ ชุดSchoolBot10ตาราง+legacy14; ทุก16เส้นเป็นLOGICALและinactive รวม4เส้นภายใน/12ข้ามDB ไม่ใช่FK; namespaceเป็นชื่อแบ่งภาพ ไม่ใช่schemaให้deploy JSON/array/profileชนิดemployeeอธิบายในNotesไม่ลากFKเทียม ห้ามคัดภาพนี้เป็นmigration
- ไม่รันparserใหม่: `node -e` ตรวจrequire.resolve('@dbml/core') ไม่พบpackageในworkspace ไม่ติดตั้งเพิ่มเพื่อแก้Notesที่ไม่ได้เป็นเจ้าของ ผลนี้เป็นstructural comparisonด้วยassert ไม่แทนparser10.3.1/dbmlv2หรือหลักฐานdeployed catalog ให้archแนบparserreceiptที่ผูกhashปัจจุบันหากผู้ตรวจต้องใช้

## ข้อแก้เอกสาร/คำเตือนส่ง arch และเจ้าของเอกสาร

| หลักฐานที่ขัดหรือคลุมเครือ | Deltaที่ควรแก้โดยเจ้าของ |
|---|---|
| `design/project-api-001.md` ส่วนความหมายของtoken อ้าง composite current-pointer FKเดิม | ระบุlogical(ProjectId,Revision) ไม่มีFK/DEFERRABLEตาม044; ไม่เปลี่ยนETag/Revision semantics |
| `design/data-dictionary/table-009.md` แถวProjectId และ `table-002.md` แถวLicenseId ยังใช้คำว่าFK แม้มีหัวข้อไม่มีSQL FK | เปลี่ยนคำในfieldให้เป็นlogical referenceให้ตรงfootnote/DDL |
| `design/schoolbot-integration.dbml` Noteท้ายLegend ยังกล่าวว่าfull DBMLใช้jsonbแทนPlanCourseIds และProject Noteอ้างFK DEFERRABLEเดิม | ระบุinteger[]ปัจจุบัน/ความสัมพันธ์logical; ไม่มีphysicalFK ไม่เพิ่มเส้นจริง |
| `db/review-005.md` คำชี้แจงยอดปัจจุบัน, `review-006.md`, `review-007.md` อ้าง40FK/24UQ/80CHECK/13indexes หรือGRANT/CK_CipherKeyPair | เป็นหลักฐานรุ่นก่อน044 ใช้review008นี้สำหรับยอดปัจจุบัน; ไม่ใช้review007รับรองCHECK/สิทธิ์DBที่ไม่มีแล้ว ResultCipher/ResultKeyIdต้องถูกคุมเป็นคู่ในแอป |
| `design/data-model.md` /DBML Project Note/schema-notesยังมีข้อความไม่ได้รันฐานจริง | แยกคำยืนยันสร้างตารางโดยผู้ใช้045จากrevision/catalog/runtimeที่ยังไม่ทราบ |
| `design/schoolbot.dbml` ReplayUntil Noteกล่าว24ชม.ทั่วไป | หากปรับNote ให้แยกcreate-license15นาทีตามDES-002 Rev3/046; ไม่มีphysical delta (นอกACชุดนี้ ไม่ขยายงาน) |
| `plan/evidence-002.md` มีsingleFKและรอUXเดิมในsnapshot | ใช้gates-001/current indexesกับ044; เจ้าของplanเป็นผู้ปรับ ไม่แก้planในงานvault |

ข้อเสนอbacklogนอกAC: ให้เจ้าของเอกสารล้างข้อความhistoricalที่สวมคำว่า“ปัจจุบัน”และแนบparserreceiptตามhash หากต้องใช้ในรอบdiagramต่อไป ไม่เปิดงานหรือแก้สัญญาข้ามหมวดเอง

## Change Log

- 2026-10-29 — ใบงาน094: เทียบDDL/32dictionary/full DBML/integration statically ส่งdeltaให้arch; ไม่มีการรันฐานหรือเปลี่ยนความหมายธุรกิจ
