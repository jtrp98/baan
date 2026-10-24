# Security — วิธีแก้เทียบสัญญาเดิม

## ประกาศการอ่านปัจจุบัน — 2026-10-24

เอกสารนี้เก็บข้อเสนอ/คำถามของ arch วันที่2026-10-23. อ่าน [คำตอบ mitigation](security-mitigation-001.md) สำหรับข้อพิจารณาที่ตอบภายหลัง และประกาศปัจจุบันใน [security.md](../security.md) กับ [Gateway Rev3](../design/gateway-integration-001.md) ก่อนข้อความที่ขัดกัน. ปัจจุบัน client→HTTP G→gRPC B ไม่มี HTTP relay/direct public B; HTTP Login เดิมของ G เป็นคนละขอบเขตกับ service RPC.

คำถามแหล่ง is_admin ในตารางเดิมไม่ใช่คำถามธุรกิจที่ยังเปิด: ใช้ override decisions-035 ใน Gateway Rev3 ตรวจกลุ่มฝั่ง serverและคง superadminเดิม. mapping/implementation และ JWT tenant/opaque session/metadata/private exposure/TLS/Light/H5 ยังต้องพิสูจน์ ไม่ปิดด้วยการยืนยันมาตรฐาน gRPC. คง C/cType/License/device เดิม.

ไม่แปลงข้อเสนอ worker/process/credential ให้เป็น implementation ที่มีแล้วหรือมติใหม่. ผล HTTP logout/4032 tests และ SEC040-001 อ่านตาม [auth-flow](auth-flow-handoff-001.md) เฉพาะ local per-process ไม่ครอบคลุม distributed/Gateway/gRPC/DB integration. ข้อความ/ผลส่งต่อเดิมคงเป็นหลักฐาน ไม่เปลี่ยน findings/verdict/gates และไม่ขออนุมัติใหม่จากประกาศนี้.

วันที่2026-10-23 · arch / Claude Opus t1 · NEEDS_HUMAN

[ใบงาน021](task-021.md) · [ผลต้นฉบับ](security-disposition-response-001.json) · [รายงานจป.](../security.md)

จัดกลุ่ม control ของ SEC001-001..006/009/010 เทียบกับสัญญาเดิมแล้ว control ส่วนใหญ่มีอยู่ใน DES-001/002/004/007/009/012 อยู่แล้ว เหลือเพียงงาน implement ใน task เดิม ข้อเสนอที่เกินสัญญามี 3 เรื่อง คือแยก credential ของ worker, four-eyes สำหรับ release และ HSM/dual control กับ key ชุดที่สาม ทั้งสามเรื่องยังไม่ใช่ baseline และได้เสนอทางที่ง่ายกว่าไว้แล้ว SEC001-009 ต้องเปลี่ยนสัญญา DES-002 แบบ breaking จึงต้องให้คนตัดสิน ได้แก้ auth-evidence-001 §6 แล้ว (ระบุ gate ที่ถูกต้อง แยก env/MenuPermission ที่เป็นข้อเสนอ) ไม่แตะผลพิสูจน์ ไม่เพิ่ม task/schema/GRANT ทุก task ยัง pending และ Important ทุกข้อยัง OPEN

ผู้คุมapply5editsในauth-evidence-001และเก็บฉบับเดิมแล้ว. Importantทั้ง6ยังOPEN; ข้อเสนอไม่ใช่baselineหรือrisk acceptance. jpoรับคำถามต่อในใบงาน025. ข้อมูลtopology/sourceจากผู้ใช้ที่มาตามหลังอยู่ที่[user-context-001](user-context-001.md); archรับต่อใบงาน023

## SEC001-001

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| ปฏิเสธ purpose/aud, rate limit ตาม (school,user), no-store, ไม่ log token/claims | already-contracted | DES-012 §2 | BE-039 | jpo re-audit endpoint G: ส่ง token ที่มี purpose/aud ต้องได้ 401 |
| ใช้ค่าจาก introspection เท่านั้น, session 30น./8ชม. ไม่เกิน SourceTokenExpiresAt, audit อยู่ใน tx เดียวกัน, revoke | already-contracted | DES-012 §3 ข้อ2,8; §5; §6<br>decisions-025 | BE-039, BE-006 | test session cap/audit/revoke; SourceTokenExpiresAt=null เป็นตัวระบุ token ที่ไม่มี exp |
| ไม่มี school_id หรือไม่มีทั้ง user_id และ admin_id → 401 | implementation-needed | DES-012 §2 (school_id:I ไม่เป็น null)<br>auth-evidence-001 §4 | BE-039 | negative test |
| LegacyWebJwt:Secret แยกจาก Jwt:Secret / แหล่งของ IsAdmin=1 | external-evidence | SEC001-011<br>auth-evidence-001 C11/TR-AUTH-02 | BE-039 (เจ้าของ G) | คนตอบเป็นสถานะ ไม่ส่งค่า |

## SEC001-002

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| เขียน PGGradeDB ได้เฉพาะ worker; preview ไม่เขียน | already-contracted | DES-009 §HTTP (:71), §Atomicity ข้อ2-4 | BE-037, BE-038 | source แสดงว่า write adapter ถูก register เฉพาะ worker entrypoint |
| แยก worker process/credential PGGradeDB | design-proposal-needs-decision | DES-009:31 (API+worker อยู่ใน school-bot/web ไม่บังคับ process เดียว)<br>DES-009:58,131 (preview/confirm ต้องอ่าน PGGradeDB)<br>decisions-029 | BE-023 (deploy pack) | การแยก process ทำได้โดยไม่เปลี่ยนสัญญา แต่การแยก credential เป็นไปได้ก็ต่อเมื่อเจ้าของ DB มีบัญชีอ่านอย่างเดียวที่มีอยู่แล้ว |
| บัญชี School DB ที่แคบกว่าเดิม | external-evidence | decisions-029<br>DES-009 G-DB | G-DB/SA-004 | เจ้าของ DB ตอบชื่อบัญชีและขอบเขตสิทธิ์ |
| ใส่ SchoolId ทุก query, ไม่ใช้ raw SQL จาก input, มี cross-tenant test | already-contracted | data-contract-rules<br>DES-004 §State (:82)<br>DES-012 §1 | BE-002, BE-006 | cross-tenant test ทุก endpoint |
| credential อยู่ใน config/secret store | already-contracted | decisions-029:13 | BE-002, BE-023 | ไม่มีค่า credential ใน repo/knowledge |
| จำกัด egress / audit ฝั่ง DB บน PGGradeDB | design-proposal-needs-decision | decisions-029 (ผู้ใช้ไม่อยากแตะ DB นี้)<br>DES-009:134 (receipt ใน PgtgradeAuditLog ทำหน้าที่ audit ระดับแอป) | BE-023 + infra | คำตัดสินจาก infra/เจ้าของ DB |
| ไม่เก็บ/แคช/log password หรือ hash และ rate limit login | already-contracted | DES-004:24,76,80 | BE-006 | ตัวอย่าง log |

## SEC001-003

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| manifest JWS, hash หลัง signing, verify ซ้ำจาก staging ที่ป้องกัน, origin allowlist, ไม่ตาม cross-origin redirect, กัน downgrade/expiry, withdraw | already-contracted | DES-007 §manifest, §Host workflow (:44-48), §Errors (:54,58) | BE-018 (+ install workflow รอ SA-001/G-RELEASE-DB) | negative tests ตามที่ jpo ระบุ |
| Authenticode / Developer ID + notarization | external-evidence | DES-007:48<br>OQ-011 | BE-022 | คนให้สิทธิ์ signing; ตรวจ chain ของ RC |
| publish ด้วยบัญชีรายบุคคล + audit | already-contracted | DES-004:59 release_publisher<br>DES-012 §4<br>DES-007:31 | BE-018, BE-003 | AuditEvent ผูก sEmp |
| four-eyes สำหรับ release | design-proposal-needs-decision | decisions-025 H6 ครอบคลุมเฉพาะหลักสูตร/คลังข้อสอบ | SA-001 | คำตัดสินคน (ขยายขอบเขต H6) |

## SEC001-004

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| host gate ก่อน dispatch/Save/Load, ไม่มี path ที่ไม่ผ่าน gate, ไม่เชื่อ UI | already-contracted | DES-001:15,28,34 | BE-007, FE-001 | เรียก bridge ตรงโดยไม่มี lease แล้วต้องถูกปฏิเสธ |
| lease ES256 ผูก cnf.jkt, exp=min(+3วัน,license), OS store fail closed, ตรวจ clock rollback | already-contracted | DES-002 §Signed entitlement, §Local state<br>AC-034 | BE-004, BE-007 | AC-034 / BE-007 tests |

## SEC001-005

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| P-256 device key + challenge/proof, unbind + BindingEpoch + If-Match | already-contracted | DES-002:14,24-35,45-49<br>AC-035 | BE-004, BE-005 | race/copy/unbind tests |
| rate limit ต่อ license/IP และล็อกเมื่อ activate ล้มเหลวซ้ำ | implementation-needed | DES-002 (429), index กติกา5: ตัวเลขเป็นข้อเสนอ | BE-004 | ค่า limit ที่ใช้จริง + test |
| custody บน shared-user/cloned VM | external-evidence | DES-002:16 (ข้อจำกัดที่บันทึกไว้ ยังไม่ใช่ risk acceptance) | BE-004 | คำยืนยันวิธี custody ก่อน implement |

## SEC001-006

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| แยก key license กับ release และไม่มี private key ใน payload | already-contracted | DES-002:61<br>DES-007:35,48 | BE-004, BE-018, BE-022 | สแกน payload/CI |
| key content | already-contracted | DES-002:61; DES-005:130 (signed bundle ยังเป็นข้อเสนอ) | - | ต้องใช้เมื่อ implement signed content bundle เท่านั้น |
| custody/KMS/HSM/dual control/rotation/backup | design-proposal-needs-decision | DES-002:61 (KMS/HSM เป็นแค่ข้อเสนอ)<br>gates-001 G-RELEASE-DB | DBA-006/G-RELEASE-DB | runbook custody จากเจ้าของ release/infra |

## SEC001-009

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| ไม่เก็บ license key ที่ถอดรหัสได้ไว้ในตาราง idempotency | design-proposal-needs-decision | DES-002:51 | SA-001, BE-003, DBA-002 | คนอนุมัติการเปลี่ยนสัญญา และ vault ยืนยันผลต่อ DDL |

## SEC001-010

| Control | ประเภท | ฐาน | Owner/task | หลักฐานต่อไป |
| --- | --- | --- | --- | --- |
| ไม่ log password/token/key | already-contracted | DES-004:76<br>DES-012 §2 | BE-006 | ตัวอย่าง log |
| mask header/claims และเนื้อหา submission ใน log | implementation-needed | SEC001-013<br>DES-012 §2 | BE-006, BE-039, BE-024 | ตัวอย่าง log |
| ระบุ PII รายคอลัมน์ใน dictionary (เป็นเอกสาร ไม่ใช่ schema) | implementation-needed | data-model.md/data-dictionary<br>CONVENTIONS §12 | DBA-002/DBA-005 review + arch ตามใบงานผู้คุม | coverage 32 ตาราง |
| retention/ลบ/ส่งออก, ฐานกฎหมายสำหรับผู้เยาว์, hosting/ข้ามประเทศ | external-evidence | decisions-015 (เฉพาะถังขยะ 30 วัน)<br>DES-007:60 | DPO | คำตัดสิน DPO; arch ไม่ตัดสินกฎหมายจากความจำ |

## คำถามทางเทคนิคถึง jpo

- SEC001-002: ถ้าไม่มีบัญชี DB ที่แคบกว่า jpo รับหลักฐานชุดนี้ได้ไหม: (a) write adapter มีเฉพาะใน worker entrypoint (b) worker แยก process/config (c) receipt ทุก write + reconcile (d) cross-tenant tests — ถือเป็นหลักฐานของการแก้ ไม่ใช่ risk acceptance
- SEC001-003: host ตรวจ JWS + hash + OS publisher signature อย่างอิสระอยู่แล้ว (DES-007:44-48) ดังนั้น release_publisher รายบุคคล + audit + evidence_ref จาก pipeline เพียงพอไหม หรือต้องมี four-eyes ด้วย
- SEC001-006: entitlement signer ต้องออนไลน์ KMS กันการขโมย key ได้ แต่ไม่กันการสั่ง sign ระหว่างที่ API ถูกยึด jpo รับหลักฐาน 'KMS/signer แยก process + audit + lease ≤3 วัน + revoke kid' ได้ไหม และ release key ใน CI protected environment หรือ hardware token โดยไม่มี dual control เพียงพอไหม
- SEC001-009: ถ้าเลือก 'replay ไม่คืน key ให้ admin revoke แล้ว create ใหม่' จะปิด finding ได้ไหม
- SEC001-001: การใช้ policy authenticated scheme แทน [MenuPermission] ขัดกับ fix ของ jpo หรือไม่

## ประเด็นที่ arch ยังเสนอให้ตัดสิน

| เรื่อง | ทางเลือก | คำแนะนำarch | ผู้ตัดสิน |
| --- | --- | --- | --- |
| SEC001-009 replay ของ create key (DES-002:51) — เป็นการเปลี่ยนสัญญาแบบ breaking | A: replay คืน LicenseView + key:null แล้ว admin revoke/create ใหม่ (ใช้ endpoint เดิม)<br>B: คง replay ไว้แต่ใช้ KMS envelope + TTL สั้น + ลบหลังอ่านครั้งแรก | A (ง่ายกว่าและไม่ต้องเก็บ secret; license ออกไม่บ่อย) | เจ้าของ schema/API (human gate 2) ผ่าน SA-001 และ vault ตรวจผลต่อ DDL |
| four-eyes สำหรับ release publish | คงสัญญาเดิม: release_publisher คนเดียว + signed pipeline + host ตรวจ OS signature<br>ขยาย H6 ให้ครอบ release (ใช้ AuditEvent บันทึกผู้อนุมัติ ไม่ต้องเพิ่ม schema) | คงสัญญาเดิม เว้นแต่ jpo ตอบว่าหลักฐานไม่พอ | ผู้ใช้/เจ้าของผลิตภัณฑ์ (gate 1) |
| custody ของ key | entitlement: KMS หรือ signer แยก process (ไม่รับแบบไฟล์บน host ของ API)<br>release: hardware token/HSM+dual control หรือ CI protected env + required reviewer<br>content: ต้องใช้เมื่อมี DES-005 signed bundle เท่านั้น | KMS/signer แยก process + release ใช้ hardware token; dual control รอคำตัดสิน | เจ้าของ release/infra ที่ G-RELEASE-DB |
| แยก worker process/credential | process เดียว<br>แยก process แต่ใช้ credential เดิม<br>แยก process + ให้ API ใช้บัญชีอ่านอย่างเดียวที่มีอยู่แล้ว | อย่างน้อยแยก process; แยก credential ถ้ามีบัญชีอยู่แล้ว (ไม่ GRANT) | เจ้าของ DB (G-DB) + infra |
| retention/ฐานกฎหมาย PDPA สำหรับผู้เยาว์ | DPO กำหนด | รอคำตัดสิน DPO; ห้ามเขียน DDL retention ก่อน | DPO/เจ้าของกฎหมาย |

ให้รับผลjpoก่อนส่งข้อที่จำเป็นจริงให้คน ไม่ได้ขออนุมัติข้อเสนอเหล่านี้จากการบันทึกเอกสาร

## ส่งต่อ

- ผู้คุม: apply edits 5 จุด, archive §6 และหัวเรื่องเดิมแบบ verbatim ลง archive.md, ปรับแถว auth-evidence-001 ใน design/index.md เป็น Rev2 แล้วบันทึก security-disposition-001
- backlog ให้ gm พิจารณา (เจ้าของ G/A ไม่ใช่งาน SchoolBot): M6 status ของนักเรียนบน mobile ไม่ผูก SId/SchoolId และข้ามการตรวจเมื่อเป็น null; web inactive-employee ไม่กรอง SchoolId + FirstOrDefault ไม่เรียง; mobile ไม่ตรวจ TCompany/WorkStatus; M9 validator ไม่บังคับ exp/iss/aud จึงรับ handoff token; A PlanCourseRepository.cs:194-215 ไม่กรอง SchoolId ของ ptsl2/tsl2; SEC001-013 handler log ชื่อ header
- ข้อเสนอใน §4 เรื่อง JabjaiWebKey-* มากกว่า 1 header → 401 ยังรอ jpo ยืนยัน
- ไม่เพิ่ม task/schema/GRANT; ทุก task ยัง pending; Important ยัง OPEN จนแก้และ jpo re-audit; ไม่อ้างผล task018/inspect
- ส่งต่อ: jpo (คำถามด้านบน) → คนตัดสิน unresolved → SA-001 freeze

## Change Log

- 2026-10-23 — นายช่างบันทึกผล role ผ่าน Claude; ไม่เปลี่ยน task verdict/gate และไม่รันระบบ
- 2026-10-24 — ใบงาน054: เพิ่มประกาศลำดับอ่าน mitigation/Gateway Rev3/decisions-035; คงข้อเสนอและ verdict เดิม ไม่มี implementation หรือ re-audit
