# Desktop auth — packet หลักฐานก่อนต่อ production path — Rev6

> Override Rev5 (2026-10-24): [Gateway integration Rev3](gateway-integration-001.md) มี precedence เรื่อง transport เหนือ packet เดิม: client→HTTP G→gRPC B เป็นมาตรฐานที่เลือกแล้ว ไม่รอเลือก HTTP relay/gRPC ใหม่. G/Light review ยังครอบคลุม implementation/trust/tenant/private exposure และ protected paths; ไม่ใช่อนุมัติ HTTP exception. คง cType/identity/device/session/H5; decoder037 ไม่ขึ้นกับการต่อ transport.

สถานะอยู่ที่ [index](index.md); อ่านคู่ [adapter](desktop-login-adapter-001.md). เป็น technical handoff ไม่ใช่ Light approval หรือคำถามนโยบาย035.

## Token trust และ admission

G ทำ signature/key/algorithm/lifetime validation ผ่าน boundary ที่รับรองตัว service ได้; B ไม่แชร์ signing secret และไม่สร้าง verifier ใหม่. TLS/ปลายทาง/peer authentication ต้องเป็น config ที่ review แล้ว ไม่รับ URL/key/claims จาก client. การได้ response200จาก endpoint public ไม่ยืนยัน peer หรือ identity.

Mobile: full token ต้อง AccessLevel='1', exp/nbf/issuer/audience ถูกตรวจโดย G ด้วยค่าจริงที่กำหนดไว้; Sid/PostalCode เป็น source account/tenant เท่านั้น. Temporary AccessLevel0 ห้ามแลก. อ้าง G JwtTokenService.cs:54–118; AuthService.cs:199–204 ตาม033.

Employee Desktop: รับ terminal web session จาก flow เดิม ต้องตรวจ signature/lifetime และมี exp; ปฏิเสธ purpose หรือ aud รวม legacy-handoff. G LegacyWebTokenFactory.cs:49–72 แยก session12ชั่วโมงกับ handoff90วินาที; GetWebSessionPrincipal ที่ JwtTokenService.cs:184 ยังไม่ตรวจครบ จึงใช้เป็น admission สำเร็จไม่ได้. trustedDeviceToken ใช้ช่วย G หลังตรวจ password เท่านั้น ไม่เป็น source session. ข้อยกเว้นไม่มีexpของ025ยังคงเฉพาะ C web exchange เดิม ไม่ขยายไป Desktop.

ผลตรวจ token ต้องผูกกับ token/operation/attempt ที่กำลังประมวลผล ไม่รับ client boolean หรือ claims ที่เพียง decode. fully_authenticated ต้องมี canonical account/profile resolution และตรวจ License/device/tenant สดครบใน request เดียวกัน ก่อน session/audit commit; tokenถูกต้องแต่ mappingไม่พร้อมยังออก session ไม่ได้.

## Identity contract ที่ห้ามเดา

ข้อมูล trusted resolution ภายในต้องแยก gateway_master_sid, canonical_account_id, school_id และ profiles[{kind:student|employee,id:positive int32}]. IDs เป็นคนละ namespace; canonical_account_id คือ TMasterDBUser.sID ตาม [dictionary](data-dictionary/legacy-001.md). profiles ต้องไม่ซ้ำและอยู่โรงเรียนเดียวกัน. ค่าจาก response user/UserType/IsAdmin ไม่ใช่ proof.

G Master.TUser map ที่ JabjaiMasterSingleDBPostgreSQLDbContext.cs:2816 ไม่ได้พิสูจน์ว่าเป็น TMasterDBUser ของ B. G student lookup TusersRepository.cs:36 ใช้ equality SId+SchoolId แต่ไม่พิสูจน์ cross-DB relation หรือ active history. ห้ามนำ equality นี้ไปประกาศเป็น FK/mapping ที่รับรองแล้ว.

ครูมีสามสูตรต่างกัน: WorkStatusใช้SId (WebLoginService.cs:206), challengeใช้NSystemId>1 มิฉะนั้นSId (WebTwoFactorService.cs:330), terminal user_idใช้NSystemId??SId (WebLoginService.cs:272). ห้าม coalesce ใหม่ใน B. ต้องพิสูจน์ inverse relation แยก null/0/1/>1 และกรณี SIdต่างจากNSystemId พร้อม tenant. ไม่พบ/พบหลายแถวไม่ให้เลือกเอง.

Directory outcome แยก resolved_active, resolved_inactive, unresolved_mapping, unavailable. inactiveที่พิสูจน์แล้ว→401; unresolved/ambiguous→503 AUTH_NOT_CONFIGURED; dependencyล่ม→503 AUTH_UNAVAILABLE. ห้าม missing employee/salary/history กลายเป็น active โดยปริยาย. Current salary ต้องมี owner-confirmed selection rule ที่ tenant-qualified และ deterministic; student history ต้องผูก student+school+year/term จริง. ไม่เพิ่ม predicateสถานะที่ sourceยังไม่ยืนยัน.

License admission: active SchoolBotLicense ของ school เดียวกัน, CurrentBindingIdชี้ bindingของLicenseนั้น, bindingไม่ลบ/ไม่Detached, Epochปัจจุบัน และตรวจ possession proof ของ PublicJwk/DeviceJkt ตามสัญญาเดิม. ห้ามรับ device_jkt string เป็น proof. Session/audit ต้อง durable transaction เดียวกัน; InMemoryManagementStoreไม่ใช่ทางสำรอง.

035คงเดิมสำหรับ school_web: กลุ่มแอดมิน/ผู้บริหารฝั่งserverและsuperadminเดิม; ไม่ให้สิทธิ์จากJWTอย่างเดียว ไม่ยกระดับเป็นstaff_admin. ตรวจสิทธิ์สดทุกrequestและก่อนcommit. Desktopemployeeไม่กลายเป็นช่องทางตรวจงาน/ส่งคะแนน.

## งานเจาะจงที่ส่งเจ้าของ

| เจ้าของ | หลักฐาน/contract ที่ต้องคืน | สิ่งที่ยังเปิดไม่ได้ |
|---|---|---|
| G/sys + เจ้าของ mobile auth | active device verify/reset/approval route และ DTO, ownership/tenant binding, วิธีที่ Desktopได้รับ device identifier ที่รองรับจริง; ไม่ใช้ controllerที่commentทั้งไฟล์ | student completion |
| legacy/vault + G/sys | physical mapping Master.TUser↔TMasterDBUser↔School profile; fixturesกรณีkeyต่างกัน/ซ้ำ/missing; current salary/student history rule | canonical AccountId/active admission |
| B/sys | production LicenseBinding/device-proof และ session/audit persistence ตามแบบเดิม พร้อม callerจริง; inventory prerequisiteที่ทำได้โดยไม่แก้schema | ทั้ง student/teacher session issuance |
| G/sys | fixtures wireของ WebAuthController.cs:265–348 รวม channels/missing/code/error และตัวตรวจ trusted terminal; ไม่ส่ง secretจริง | public teacher continuation contract |
| B/sys + arch | attempt custody/binding/replay/cancel ที่ต่อกับ infrastructureจริง แล้ว amend publicDTOแบบเจาะจง | continuationที่ออกจาก B ไป host |

## Packet สำหรับ G/Light และ infra

ยังไม่ขอแก้ G. รับผล033ว่ามี local DI services ไม่ใช่ remote RPC. ตรวจ private trusted-principal/completion interface แยกจาก public routing; DES-012 web-principalเดิมไม่มี canonicalAccountId จึงไม่พอสำหรับ Desktop โดยตัวมันเอง.

Review ต้องระบุ route/protocol/controller และ serviceผู้ถือ contract, peer authentication/TLS/exposure, token-family/purpose/expiry checks, tenantจากvalidatedtoken, rate-limit และ timeout. school_idในloginเป็น lookup selectorก่อนauthentication ไม่ใช่ trusted tenant; ต้องตรวจเทียบ tenantจากtrusted outcome ห้ามตัดสินข้อยกเว้น G/AGENTS tenant rule เอง.

G/AGENTS.mdกำหนด REST→gRPC ซึ่งเป็น transport ที่เลือกแล้ว; RPC/HTTP mapping, trusted JWT tenant กับ opaque bearer, peer authentication และ private ingress ยัง design pending. ต้องมี precise diff/Light review สำหรับ protected hosting/auth paths ก่อนลง G; ไม่อนุมัติ HTTP relay และไม่ rewrite Login HTTP เดิม. H5/deployed configuration/runtime proofเป็น enable gates แยกจากการเขียน unit-tested logic.

## เหตุที่ยังไม่มี complete slice รอบนี้

B Program.cs:43–44,84–118 ไม่มีauth use case/caller; ManagementService.cs:45–65 รับLicense key/device ID; storeมีเพียงLicense/Release dictionaries. การเพิ่มdecoder/reducerเดี่ยวจึงยังunused; การฝืนต่อv1 Licenseหรือstatic adminจะเปลี่ยนcontractคนละส่วน. ไม่เลือกสร้าง503-onlyrouteหรือsuccess stub.

Internal decoder/state reducer/error mappingทำและทดสอบได้เมื่อมี production callerในsliceเดียวกัน ไม่ต้องรอ H5deployment แต่ตอนนี้ callerดังกล่าวติด prerequisiteข้างบนที่เกินbackend-auth-adapterอย่างเดียว. ส่งให้sysจัดหลักฐานและขอบเขตprerequisiteก่อน ไม่ส่งคำถามhash/035กลับผู้ใช้.

## Override Rev2 — แยก component ออกจาก production path

ใบงาน037แทนเงื่อนไข Rev1 ที่ว่า internal decoder ต้องมี production caller ใน slice เดียวกัน: อนุญาต implement/test [web outcome decoder](gateway-outcome-component-001.md) ได้ทันที. ข้อสังเกตว่า B ยังไม่มี auth caller เป็นหลักฐานเดิม ไม่ใช่เหตุปิด component นี้. ไม่สร้าง caller ปลอม, 503-only route หรือ success stub.

ข้อค้าง identity/device/session/transport ข้างบนยังบล็อก full production path ตาม034 แต่ไม่บล็อก decoder ที่ไม่มี admission หรือ side effects. ไม่ขอ human approval เพิ่มจากการแยกขอบเขตนี้.

## Override Rev3 — ใบงาน047

[adapter Rev3](desktop-login-adapter-001.md) มี precedence เฉพาะ request bounds/wire facts/public error mapping เหนือข้อความเดิมใน packet. รับ contract_deltas/wire_fixtures จาก [035](../planning/desktop-login-wire-evidence-001.json) แล้ว จึงไม่ขอ fixtures ชุดเดิมหรือ reason แยก inactive/lockedจาก G ซ้ำ; trusted terminal validation ยังเป็นข้อค้างเดิม.

Public mapper ในอนาคตแปลง internal403จาก G web authentication เป็น401 UNAUTHORIZEDแบบรวม โดยไม่เดาสาเหตุ; ไม่เปลี่ยน decoder037 หรือสร้าง component test failure จาก contractคนละlayer. Request validation/public mapper ยังไม่ implementจากการแก้เอกสารนี้.

[คำถามเจ้าของ](../planning/desktop-login-owner-question-001.md) บันทึกว่าผู้ใช้ไม่เข้าใจและทีมรับ technical mappingกลับแล้ว ไม่ใช่ confirmation/approval และไม่ถาม columnซ้ำ. canonical_account_id ยังคือ TMasterDBUser.sID; คงข้อค้าง identity/device/session/H5เดิม ไม่เปิดมติ035หรือสร้าง human gateใหม่.

## Override Rev4 — ใบงาน048

[adapter Rev4](desktop-login-adapter-001.md) มี precedence เรื่อง cType/route. แทนข้อความ Rev3 ที่อาจอ่านว่าผู้ใช้ยังไม่ตอบ: ผู้ใช้ยืนยัน category แล้ว; ทีมตรวจ exact profile linkage ต่อให้ผู้ใช้ ไม่ถาม column/migration ซ้ำและไม่สร้าง human gate ใหม่.

คง canonical_account_id=TMasterDBUser.sID; [036](../planning/desktop-login-mapping-evidence-001.json) ยังไม่พิสูจน์ Master.TUser↔TMasterDBUser↔profile. cType เลือกประเภท ไม่เลือก profile row หรือแก้สูตร NSystemId. G/sys รับตรวจ pre-auth lookup ตาม adapter; legacy/vault รวบรวม lineage/fixtures ที่มีอยู่ แยก tenant, keyต่างกัน, null/0/1/>1 และ cardinality พร้อม current salary/student history rule. ไม่อนุมาน equality/coalesce/FK จากเลขหรือชื่อเหมือนกัน. ข้อค้างนี้เป็น technical evidence เดิม ไม่ใช่คำถาม category ที่ยังไม่ได้คำตอบ; device/session/trusted terminal/H5คงเดิม.

## Change Log
- 2026-10-24 — Rev6: แก้ operative review ให้ตรวจ gRPC/trust ไม่เลือก transport ใหม่
- 2026-10-24 — Rev5: ใบงาน049 แยกมาตรฐาน gRPC ที่ทราบแล้วจาก implementation/trust review ที่ยังค้าง
- 2026-10-24 — Rev4: category ตอบแล้ว; ส่งทีมตรวจ routing/linkage ต่อ คง canonical AccountId และ admission เดิม
- 2026-10-24 — Rev3: ใบงาน047แยกขอบเขต035/037/public mapper และรับคำชี้แจง mapping; production prerequisites เดิม
- 2026-10-23 — Rev2: ใบงาน037แทนข้อจำกัด component-with-caller ของ034โดยคงข้อความเดิมเป็นประวัติ; production prerequisites ไม่เปลี่ยน
- 2026-10-23 — Rev1: ใบงาน034 แยก trust/mapping/device/persistence/transport gaps ตาม033และ B sourceจริง; ไม่มีschema deltaหรือการอนุมัติแก้ G
