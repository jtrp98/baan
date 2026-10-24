# Auth evidence 001 — รับหลักฐาน BE-001 — Rev4

สถานะ: EVIDENCE ไม่ใช่ verdict ของ BE-001/SA-001/G-AUTH และไม่ใช่ผล SEC-001 · ที่มา: [legacy-auth-response-001.json](../planning/legacy-auth-response-001.json) (sys) + arch ตรวจ source:line ซ้ำ · ไม่อ่าน secrets/env ไม่เชื่อม DB ไม่รัน · พาธย่อ `G`=sb-api-gateway `A`=sb-tech-upgrade-academic `W`=sb-tech-upgrade-web-system `B`=school-bot

หลักการ: **port ใน G ไม่เท่ากับ legacy ต้นฉบับ** และชื่อ/ที่มาที่อ้างจาก comment เป็น candidate · ค้น `bypassgarde*`/`Default.aspx*`/`ComFunction*` เฉพาะ `C:/src/schoolbright/target` แล้วไม่พบ ไม่ได้แปลว่าไม่มีที่อื่น

## 1. ผลรับ/หักล้าง

| ข้อ | ผล arch | หลักฐาน |
|---|---|---|
| M1 web lookup | รับ (as-built port): Trim ทั้ง 2 ฝั่ง, `CType='1'`, `CDel null`, sID มากสุด | `G/.../WebLoginService.cs:58-67` |
| M2 mobile lookup | รับ: เทียบตรงตัว, `CDel!='1'` (`CDel` เป็น `char?`), ทุก cType | `TusersRepository.cs:103-134`, `Tuser.cs:60-62` |
| M3 case/collation | รับว่ายัง unproven; index ไม่ unique | `JabjaiMasterSingleDBPostgreSQLDbContext.cs:2816-2830` |
| M4 web verify | รับ: SHA-1 hex ตัวใหญ่ เทียบ Ordinal / plaintext+ddMMyyyy | `WebLoginService.cs:219-232`, `UserPasswordRepository.cs:48-49` |
| M5 mobile verify | รับ+เพิ่ม: birthdate `ToString` ไม่ระบุ culture จึงขึ้นกับ culture ของ server; `G/AGENTS.md:88` ระบุว่า image ต้องเป็น th-TH (candidate ไม่ใช่หลักฐาน deploy) | `AuthService.cs:102-107,135-146`, `PasswordHasherService.cs:27-87` |
| M6 flags | **หักล้างบางส่วน**: สถานะนักเรียนของ mobile query ด้วย `NTerm`+`CDel` อย่างเดียว ไม่ผูก SId/SchoolId และข้ามการตรวจเมื่อเป็น null; web inactive-employee ไม่กรอง SchoolId และใช้ `FirstOrDefault` โดยไม่เรียง; mobile ไม่ตรวจ TCompany/WorkStatus | `TstudentClassroomHistoriesRepository.cs:35-43`, `AuthService.cs:210-238`, `WebLoginService.cs:206-217` |
| M7 student mapping | **ลดระดับเป็น candidate**: port mobile ใช้ Master.sID=School TUser.SId+SchoolId (ไม่กรอง CDel); คงข้อห้ามใน source-review-002 | `AuthService.cs:210-212`, `TusersRepository.cs:36-41` |
| M8 employee mapping | รับว่าขัดกัน (unproven): token ใช้ `NSystemId??SId`; comment ว่า `user_id=TEmployees.sEmp`; เช็คพ้นสภาพใช้ `sEmp==sID`; CDel: mobile `'0'` / Academic `null\|'0'` | `WebLoginService.cs:209,272`, `GatewayCallMetadataInterceptor.cs:73`, `EmployeesRepository.cs:20-28`, `A/.../TeacherRepository.cs:30` |
| M9 token | รับ+เพิ่ม: ไม่บังคับ exp/iss/aud จึง**รับ handoff token ได้ด้วย**; `ClaimTypes.Sid = admin_id ?? user_id` | `JwtTokenService.cs:184-213`, `LegacyWebTokenFactory.cs:48-72` |
| M10 IsAdmin | รับ+เพิ่ม: gateway ออก `IsAdmin=0` แต่ส่งต่อ IsAdmin ของ token ขาเข้าใน handoff และปฏิเสธ token ที่มี admin_id; ผู้ผลิต IsAdmin=1 อยู่นอก G | `WebLoginService.cs:280-281,302-305`, `MenuPermission.cs:682` |
| GAP-006 ครูรายวิชา | ปิดส่วนที่อ่านได้: ดู as-built ใน DES-012 Rev4; ห้องของวิชาไม่กรอง SchoolId ของ ptsl2/tsl2 | `A/.../TeacherRepository.cs:24-32,111-122`, `PlanCourseRepository.cs:194-215` |

ข้อ sys ที่ arch ไม่ได้ตรวจซ้ำ (ห้ามอ้างต่อเป็นข้อยืนยันของ arch): Academic ไม่มี verifier, ไม่มี caller ของ Tadmins/HashPassword

## 2. Fixtures

AUTH-F001..F005, F008 = derived-from-port (synthetic) ใช้ทดสอบ adapter ได้หลังเจ้าของเลือก reference · F006 = candidate · F007, F009 = รอเจ้าของ · กติกา: ใช้ synthetic/test vector สาธารณะเท่านั้น; expected ของ legacy ต้องมาจาก fixture ที่เจ้าของเตรียม ไม่ใช่ผลของ port; ห้ามใช้ข้อมูลจริง/PII

## 3. Compatibility policy ที่ยังไม่ยืนยัน (arch ไม่เลือกแทน)

C1 verifier อ้างอิงของ Desktop (web/mobile/superset) · C2 ตัวพิมพ์ของ hex · C3 รับ `v2:` · C4 รูปแบบวันเกิดและ culture · C5 การ trim/case ของ username · C6 ความหมาย CDel (`null` กับ `!='1'`) · C7 Desktop login เขียนตัวนับ lock/log ของ Master หรือไม่ · C8 first-login/`UseEncryptPassword=false` · C9 กฎ active ของนักเรียน · C10 employee mapping · C11 แหล่ง IsAdmin=1 · ระหว่างที่ยังไม่ยืนยัน: Desktop login และ school_web ที่ต้องใช้ P=employee หรือ is_admin คืน `503 AUTH_NOT_CONFIGURED` (DES-004)

## 4. Trust boundary และ fail-closed

| ขอบเขต | เชื่อได้แค่ |
|---|---|
| Desktop/browser → HTTP G → gRPC B | ไม่เชื่อ header suffix/body ทุกค่า |
| W BFF → HTTP G → gRPC B | เป็นทางส่งเท่านั้น ไม่ใช่แหล่งตัวตน |
| B → G web-principal | claims ของ token ที่ G ตรวจแล้ว ผ่านช่องทางที่คนระบุ |
| B → Master/School DB | บัญชี DB เดิม อ่านอย่างเดียว (decisions-029) |

Fail closed: introspection timeout/5xx → `503 AUTH_UNAVAILABLE`; response ขาด `is_admin` หรือชนิดไม่ตรง → ห้ามให้สิทธิ์ admin; token ที่มี `purpose`/`aud` → 401; ทุก join ต้องกรอง SchoolId (ไม่ลอกช่องโหว่ของ port ใน §1); หา profile/สถานะไม่ได้ → ปฏิเสธ ไม่ข้ามการตรวจ · ข้อเสนอ arch (รอ SEC-001): มี `JabjaiWebKey-*` มากกว่า 1 header → 401

## 5. Implementation gaps กับข้อเท็จจริงภายนอกที่ยังขาด

Implementation gaps (ทีมแก้ได้): IG1 ไม่มี web-principal ใน G · IG2 ไม่มี BFF/registry ของ SchoolBot ใน W · IG3 B ยังเป็น PoC (memory, static key, bind loopback) · IG4 web-principal ต้องปฏิเสธ handoff token เอง · IG5 ช่องโหว่ใน port (§1 M6, ห้องของวิชา) = backlog ของเจ้าของ G/A ไม่ใช่งาน SchoolBot
ข้อเท็จจริงภายนอก (เจ้าของระบบต้องให้): TR-AUTH-01..07 (ดูคำขอที่นายช่างส่งต่อ)

## 6. H5 checklist

- **W BFF route**: ใช้ gateway upstream เดิม (`GATEWAY_API_URL`) พร้อม SchoolBot route mapping; ห้ามชี้ B ตรง. HTTP G→gRPC B ยังรอ RPC mapping/trusted tenant/opaque-session boundary ตาม Gateway Rev3. คง credential filtering, memory token และ Origin/CSRF ตาม DES-012.
- **G web-principal**: `GET /api/school-bot/auth/web-principal` ใช้ scheme `JabjaiWebLegacy` อย่างเดียว ปฏิเสธ `purpose`/`aud` คืนค่า `user_id`/`admin_id` ดิบ (ไม่ใช้ `ClaimTypes.Sid`) และ `is_admin` จากกลุ่มฝั่ง server/superadmin ตาม035; ไม่ใช้ claim เพียงอย่างเดียว; สัญญา (DES-012 §2) กำหนดเพียง: scheme นี้อย่างเดียว, ปฏิเสธ purpose/aud, rate limit (school,user), no-store และห้าม log token/claims · กติกา repo G (`G/AGENTS.md` §1 ข้อ6) ให้ใช้ **authorization policy ที่ต้อง authenticated ผ่าน scheme นี้** + `[SbRateLimit]` + Swagger tag — **ไม่อนุมัติ** `[MenuPermission(<เมนูเฉพาะ>)]` เพราะ handler จะ query สิทธิ์ราย MenuId (`TGroupPermissionUser→TGroupPermissionMenu`), fail closed เมื่อไม่ได้ตั้ง MenuId และใช้ `ClaimTypes.Sid` (=`admin_id ?? user_id`) เป็น userId (`G/src/ApiGateway.API/Authorization/MenuPermission.cs:14-19,675-715`) ซึ่งจะจำกัดผู้แลก session ให้เหลือเฉพาะผู้ถือเมนูนั้น และต้องเพิ่มเมนูใน Master DB ซึ่งเกินสัญญา (สิทธิ์จริงตรวจที่ B ตาม DES-012 §4) ถ้าเจ้าของ G ยืนยันว่าต้องใช้เมนู ให้ถือเป็น NEEDS_DESIGN_CHANGE DES-012 แล้วส่งคนตัดสิน; Light review ตาม CODEOWNERS ถ้าแตะส่วนที่ล็อก · นโยบาย is_admin ยุติตาม035; ค้าง TR-AUTH-02-rest/03 และ implementation proof
- **B session/bootstrap**: `/v2/auth/web-sessions`, `/v2/auth/login` ตาม DES-004/012; ยกเลิก `/v1/admin` และ `SCHOOL_BOT_ADMIN_KEY`/`ARM_ADMIN_KEY` หลังมี staff_admin
- **ชื่อ env/config**: มีอยู่แล้ว: `GATEWAY_API_URL` (W), `LegacyWebJwt:Secret`/`Jwt:Secret`, `LegacyWeb:HostUrl` (G), `urls`/`HTTP_PORTS`/`HTTPS_PORTS` (B) · ชื่อใหม่ของ B (gateway origin, allowed origins, connection ของ SchoolBot/Master/School) ให้เจ้าของ B ตั้งชื่อ (สมมติฐาน)
- **คนต้องระบุ**: host/TLS ของ B, เส้นทาง W/BFF→HTTP G→gRPC B และ B→private G (ห้ามเปิด introspection ผ่าน public service-route), allow-list ของ Origin (W, admin web), เจ้าของ repo/ผู้ review แต่ละฝั่ง; agent ไม่ใส่ค่า host/secret แทน
- **staff bootstrap**: คนระบุ NCompany/บัญชีที่ใช้เป็น staff_admin คนแรก (ไม่ต้องส่งให้ agent) และเส้นทาง login ที่ออก token ให้บัญชีนั้น; ต้องได้คำตอบ TR-AUTH-03 ก่อน (key คือ `(school_id,user_id)`); แถวแรกของ `SchoolBotStaffRole` (ต้องใช้วิธีนี้เพราะ `POST /v2/admin/staff-roles` ต้องมี staff_admin อยู่ก่อน) ให้ sys เตรียมขั้นตอนใน BE-039/BE-023 โดยใช้ค่าจริงจากคนและไม่บันทึกค่าใน knowledge ถ้าเป็นคำสั่ง SQL ให้ vault ตรวจ ใส่ `reason`/`valid_until`/AuditEvent; การรันบน test DB เป็นหลักฐานของ G-CORE (คนรัน, DBA-003 ตรวจ receipt) ส่วนบน shared/production ต้องให้คนรันภายใต้ G-RELEASE ตาม [release-runbook-001](../plan/release-runbook-001.md) ข้อ 3-6 (CONVENTIONS §9 ข้อ6); re-audit โดยคนที่สองผ่าน `GET /v2/admin/staff-roles` และบันทึกว่าใครทำเมื่อไรตามที่คนแจ้ง

## หลักฐานเพิ่มเติม Rev3 — มีลำดับเหนือข้อความเดิมที่ขัดกัน

รับ [legacy-auth-review-002](../planning/legacy-auth-review-002.md) และ [legacy-source-check-001](../planning/legacy-source-check-001.json) เป็น upstream evidence: ผู้คุมตรวจ HEAD/hash/status ครบ13ไฟล์แล้ว ไม่ต้องขอ WORKTREE-STATUS ซ้ำ; arch ไม่ได้อ่าน legacy นอก workspace ซ้ำ

- M1/C5: legacy trim เฉพาะคอลัมน์ ไม่ trim input ต่างจาก port
- M4/M5/C1–C4: legacy format วันเกิดด้วย culture ของ thread จึงห้ามสรุปว่า pattern เดิมให้สตริงเดิมเสมอ; v2/OrdinalIgnoreCase/mobile yyyyMMdd ไม่ปรากฏใน login ต้นฉบับนี้
- C7/C8: lock counter/IsFirstLogin เป็นส่วนเพิ่มของ port ไม่ใช่พฤติกรรมที่ต้นฉบับยืนยัน
- M8/C10: legacy ใช้ nSystemID เป็นตัวตนสิทธิ์ แต่ WorkStatus ใช้ sID; ไม่มี fallback nSystemID??sID แบบ port ความสัมพันธ์ข้อมูลจริงยังไม่พิสูจน์
- M10/C11: Default.aspx.cs:193–240 สร้าง IsAdmin จากกลุ่มแอดมิน/ผู้บริหารใน server session; bypassgarde.aspx.cs:55–75 ไม่ส่งค่านั้น แต่ให้ IsAdmin=1 เฉพาะ user_id=0 และ admin_id!=null จึงใช้แทนกันไม่ได้
- TR-AUTH-01 และ WORKTREE-STATUS ได้หลักฐาน source แล้ว; TR-AUTH-02 ได้ผู้ผลิต session/JWT แต่ยังขาดตัวตรวจ login TAdmin และข้อยุติแหล่งสิทธิ์; TR-AUTH-03/04/05 ยังขาดข้อมูลจริง; TR-AUTH-06 ไม่มีเส้น login นักเรียนใน source ชุดนี้ ไม่มีผล runtime

[gateway-integration-001](gateway-integration-001.md) override routing/trust-boundary/H5 ใน §4–6: W/BFF→G→B และ B→private G; ไม่ตั้ง upstream ของ BFF ไป B โดยตรง ส่วน is_admin ใช้มติ035 ตรวจกลุ่มฝั่ง server และคง superadmin เดิม; ค้าง mapping/implementation ไม่รอเลือกนโยบายซ้ำ

**Override ตาม [decisions-035](../requirement/decisions-035.md) (มีลำดับเหนือ C11/§6/ข้อความรอคำตอบแหล่ง `is_admin` ด้านบน)**: ผู้ใช้ยืนยันทาง A ให้ตรวจสมาชิกกลุ่ม `แอดมิน/ผู้บริหาร` ฝั่ง server ตามเกณฑ์ `Default.aspx.cs:193–240` ผูกตัวตน/โรงเรียนที่ตรวจแล้ว และคง super admin เดิม (`bypassgarde.aspx.cs:55–75`); JWT ที่ส่ง `IsAdmin=0` ไม่ใช่เหตุตัดสิทธิ์กลุ่ม แต่ห้ามเชื่อ body/header assertion และต้อง fail closed (`503 AUTH_NOT_CONFIGURED`) ตราบที่ข้อมูลกลุ่ม/mapping (`TR-AUTH-03`) ยังไม่พร้อม ทั้งนี้มตินี้ปิดเฉพาะ policy choice `C11` (และส่วนนโยบายของ `TR-AUTH-02`) ส่วน `TR-AUTH-02-rest` (ตัวตรวจ login `TAdmin`), `TR-AUTH-03..06`, `C1–C10`, H5 และ implementation ยังคงค้าง รายละเอียดและ test scenarios S1–S6 อยู่ที่ [gateway-integration-001](gateway-integration-001.md)

## 7. ข้อความเดิมก่อนแก้ (verbatim)

DES-012 Rev3: `user_id` = `TUser.NSystemId ?? SId` (คือ `TEmployees.sEmp`), `admin_id` = `TAdmins.id` (`WebLoginService.cs:206–217,272`) · ครูรายวิชา: `TplanCourseTeacher (SchoolId, PlanCourseId, SEmp)` `IsActive & !CDel` + `TEmployees` ไม่ถูกลบ (`A/.../TeacherRepository.cs:24–32,111–122`) + `TplanTermSubLevel2` (`PlanCourseRepository.cs:194–215`)

## Change Log
- 2026-10-24 — Rev4: แก้ checklist/routing ปัจจุบัน; คงหลักฐาน source และมติ035
- 2026-10-23 — ใบงาน030: บันทึก override ตาม [decisions-035](../requirement/decisions-035.md) ปิดเฉพาะนโยบาย C11/แหล่ง is_admin; คง C1–C10, TR-AUTH-02-rest..06 และ H5 เดิม
- 2026-10-23 — Rev3: รับ legacy รอบ002/ผลตรวจ13ไฟล์ แยก session IsAdmin จาก JWT และชี้ routing addendum; ไม่เลือก compatibility policy หรือรับความเสี่ยง

- 2026-10-23 — Rev2: (ใบงาน 021) §6 แทน 'gate 6' ด้วย G-CORE/G-RELEASE และ owner BE-039/BE-023; ระบุว่าชื่อ env ของ W เป็นข้อเสนอ; web-principal ใช้ policy ไม่ใช้ MenuPermission เฉพาะ; ผลพิสูจน์ §1-§5 ไม่เปลี่ยน
- 2026-10-23 — Rev1: arch รับ/ตรวจหลักฐาน BE-001 จาก sys (ใบงาน 020); ไม่มี verdict/SQL/runtime
