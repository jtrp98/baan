# Auth flow — ผลลงโค้ดและตรวจรับ 001

วันที่2026-10-24 · ผู้ใช้สั่ง “ทำตาม flow เลย” และใช้Codex · นายช่างรับผลทุกroleตามหน้าที่

## ผลที่ได้

รอบนี้ได้โค้ดออกจากระบบ (logout) และตัวอ่านคำตอบจาก Login ของ Gateway ซึ่งแยกขั้นตอนเปลี่ยนรหัสผ่าน, 2FA และเพิ่มช่องทางติดต่อออกจากคำตอบที่ต้องตรวจยืนยันต่อก่อนสร้าง session ผลตรวจครอบคลุมการทำงานในเครื่อง ส่วน Login เต็มระบบยังต้องต่อการระบุตัวตนนักเรียน/ครู การผูกเครื่อง และทดสอบ DB จริง

เพิ่ม POST /v2/auth/logout ในSchoolBot: canonical opaqueBearer→SHA256hash→productionPostgreSQLrevoke/audittransaction. ไม่ต้องLicense/authenticationและไม่ใช้memoryเป็นproductionstore; failureคืนv2error/no-store/UUID. เพิ่มlocaltrusted-peerwindow/concurrencyเพื่อแก้SEC040-001. เพิ่มinternalwebGatewayoutcomedecoderที่แยกpassword-change/2FA/contact/sent/terminalcandidate/rejectedอย่างboundedและไม่ออกsession

[QA round001](../qa/round-001.md): 4032 passed / 0 failed / 0 skipped; [verdictต้นฉบับ](auth-flow-check-response-002.json) · [actualtestproof](auth-flow-test-check-002.json). ผลนี้ตรวจlocalAPI/component ไม่ใช่LoginครบวงจรหรือDBruntimeacceptance

| Scope | Verdict | หลักฐาน |
| --- | --- | --- |
| Gateway outcome decoder local | PASS | TRX มี GatewayOutcome*/GatewaySecretTests ผ่าน 3874 cases; ตรวจ source/tests เทียบ acceptance ทั้ง 8 หมวด ครอบคลุม operation/stage/outcome, malformed input, bounds และ secret lifecycle |
| Logout API/usecase และ limiting local | PASS | Logout tests ผ่าน 88 cases ใช้ production Program/pipeline/endpoint/LogoutService/limiter โดยแทนเฉพาะ ISessionLogoutStore พร้อม middleware กำหนด peer สำหรับทดสอบ; ครบ security criteria 1–8 |
| Repository Actor/DDL static | PASS | PostgresSessionLogoutStore.cs:44–63 ตรง canonical A และตัวอย่าง sys044 ครบ 6 กรณี; ตรวจ Session 17 fields, AuditEvent 13 fields และ INSERT 12 fields กับ DDL; token_hash:Varchar และ request_id:Uuid ตรงชนิด |
| PostgreSQL integration/atomic rollback | NOT_RUN | ไม่มี PostgreSQL execution; transaction/revoke/audit/invalid-row rollback ตรวจได้เฉพาะ source ไม่ยืนยันสถานะข้อมูลจริง |

## Sourceและแบบที่ส่งต่อ

- โค้ดเฉพาะ target/school-bot/web; [logout038](logout-implementation-response-001.json), [component039](gateway-outcome-implementation-response-001.json), [limiting042](logout-limiting-response-001.json)
- [Desktopadapter](../design/desktop-login-adapter-001.md), [reviewpacket](../design/desktop-auth-review-packet-001.md), [componentcontract](../design/gateway-outcome-component-001.md) ตามarch034/037 และ [wire clarification047](desktop-login-wire-contract-response-001.json); เก็บต้นฉบับตามmanifestก่อนamendทุกครั้ง
- [sys033](desktop-login-evidence-001.json), [wire035](desktop-login-wire-evidence-001.json), [vault036](desktop-login-mapping-evidence-001.json); wirefixturesเป็นsourceillustration ไม่มีLoginจริง
- [jpo040](logout-security-response-001.json), [jpo043](logout-security-response-002.json); SEC040-001 ปิดเฉพาะlocalscopeตามconditionalcriteria+check; Important6เดิมยังOPEN

## ขอบเขตที่ยังค้าง

Loginเต็มยังไม่พร้อม: ต้องจับคู่ผู้Loginให้ถูกนักเรียน/ครูเดิม, พิสูจน์Desktopdevice/Licenseและsessionissuance/binding, ต่อtrustedGatewaycompletion/teachercontinuationและH5. เรื่องmappingเป็นงานเทคนิคที่ทีมรับกลับไปตรวจ ไม่ให้ผู้ใช้เดาตาราง/คอลัมน์ [คำชี้แจง](desktop-login-owner-question-001.md). ครูใช้webflowเดิม; studentmobileยังไม่เปิดdevicecompletionที่ไม่พิสูจน์

ไม่รันSQL/DB/productionLogin/hardware/installer/deploy ไม่แก้Gateway/A/Websystem/legacyหรือsourceGit. PostgreSQLatomicity/concurrentrowrevoke/auditrollbackต้องตรวจruntimeภายหลังตามgateเดิม. ไม่ปิดBE002/BE006/BE039หรือ110canonicaltasks; TP001 77casesยังNOT_RUN คง44REQ/180AC/8phases/17gatesและDDLเดิม

## ตรวจปิดรอบ

[Ownership/document validation](auth-flow-validation-001.json) · [sourceหลังงาน](auth-flow-source-after-001.json). NuGetfeed/testhostขวางchildsandboxถูกผู้คุมrerunoutsideให้แล้วตามactualproof ไม่ปิดaudit/เปลี่ยนSDKหรือขอสิทธิ์DBจากผู้ใช้

## Change Log

- 2026-10-24 — บันทึกflow sys→arch→sys→checkและjpoเฉพาะscope พร้อมข้อจำกัดจริง; final knowledgecommitหลังบันทึกครบ
- 2026-10-24 — ตรวจลิงก์ QA/security เพิ่ม11จุดที่ [validation002](auth-flow-validation-002.json); ตรวจ ownership/source/SQL/archive ตาม validation001 ครบแล้ว

## คำชี้แจง cType — 2026-10-24

ผู้ใช้ยืนยันใช้ cType แยกนักเรียน/ครูแล้ว; ค่า 0=student / 1=employee อ้าง source033. รับ [arch048](desktop-login-ctype-contract-response-001.json) เป็น adapter/packet Rev4 โดยเก็บต้นฉบับพร้อม [manifest](../design/archive/2026-10-24-before-ctype-clarification-001/manifest.json). ทีมตรวจการเลือก route ก่อนส่ง password และรหัสบัญชีที่เชื่อมโปรไฟล์ต่อ ไม่ถามผู้ใช้เรื่องประเภทซ้ำ. cType ต้องมาจาก trusted server และไม่เป็นสิทธิ์ admin หรือหลักฐานว่า AccountId=ProfileId.

ขั้นเทคนิคถัดไป: sys ตรวจ FindAuthUserDetail/WebLoginService ว่ามี server routing seam ที่เลือกบัญชีไม่กำกวมและผูกกับ authenticated account ได้หรือไม่ ก่อนต่อ caller; ไม่ลอง credential หลาย route. ไม่มี code/SQL/runtime เพิ่มรอบนี้ คงผล4032testsเดิมและ fullLogin NOT_READY.

- 2026-10-24 — Change Log: รับคำชี้แจง cType และสัญญา Rev4; ไม่เปลี่ยน REQ/AC/plan หรือปิด gate
