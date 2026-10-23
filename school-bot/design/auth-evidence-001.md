# Auth evidence 001 — รับหลักฐาน BE-001 — Rev1

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
| Desktop/browser → B | ไม่เชื่อ header suffix/body ทุกค่า |
| W BFF → B | เป็นทางส่งเท่านั้น ไม่ใช่แหล่งตัวตน |
| B → G web-principal | claims ของ token ที่ G ตรวจแล้ว ผ่านช่องทางที่คนระบุ |
| B → Master/School DB | บัญชี DB เดิม อ่านอย่างเดียว (decisions-029) |

Fail closed: introspection timeout/5xx → `503 AUTH_UNAVAILABLE`; response ขาด `is_admin` หรือชนิดไม่ตรง → ห้ามให้สิทธิ์ admin; token ที่มี `purpose`/`aud` → 401; ทุก join ต้องกรอง SchoolId (ไม่ลอกช่องโหว่ของ port ใน §1); หา profile/สถานะไม่ได้ → ปฏิเสธ ไม่ข้ามการตรวจ · ข้อเสนอ arch (รอ SEC-001): มี `JabjaiWebKey-*` มากกว่า 1 header → 401

## 5. Implementation gaps กับข้อเท็จจริงภายนอกที่ยังขาด

Implementation gaps (ทีมแก้ได้): IG1 ไม่มี web-principal ใน G · IG2 ไม่มี BFF/registry ของ SchoolBot ใน W · IG3 B ยังเป็น PoC (memory, static key, bind loopback) · IG4 web-principal ต้องปฏิเสธ handoff token เอง · IG5 ช่องโหว่ใน port (§1 M6, ห้องของวิชา) = backlog ของเจ้าของ G/A ไม่ใช่งาน SchoolBot
ข้อเท็จจริงภายนอก (เจ้าของระบบต้องให้): TR-AUTH-01..07 (ดูคำขอที่นายช่างส่งต่อ)

## 6. H5 checklist

- **W BFF route**: เพิ่ม upstream ใน `src/server/upstream/registry.ts` (env ที่เสนอ `SCHOOL_BOT_API_URL`, origin เท่านั้นตาม P3 — สมมติฐาน รอเจ้าของ W) และ route kebab-case ใต้ `src/app/api/` ที่ส่ง `JabjaiWebKey-*` ต่อเพียง 1 header; token ฝั่ง client เก็บใน memory ตาม DES-012 §6
- **G web-principal**: `GET /api/school-bot/auth/web-principal` ใช้ scheme `JabjaiWebLegacy` อย่างเดียว ปฏิเสธ `purpose`/`aud` คืนค่า `user_id`/`admin_id` ดิบ (ไม่ใช้ `ClaimTypes.Sid`) และ `is_admin` จาก claim `IsAdmin`; ต้องมี `[MenuPermission]`/policy, `[SbRateLimit]`, Swagger tag, no-store และห้าม log token; Light review ตาม CODEOWNERS ถ้าแตะส่วนที่ล็อก · คนต้องระบุว่าการคืน is_admin ถูกต้องหรือไม่ (TR-AUTH-02)
- **B session/bootstrap**: `/v2/auth/web-sessions`, `/v2/auth/login` ตาม DES-004/012; ยกเลิก `/v1/admin` และ `SCHOOL_BOT_ADMIN_KEY`/`ARM_ADMIN_KEY` หลังมี staff_admin
- **ชื่อ env/config**: มีอยู่แล้ว: `GATEWAY_API_URL` (W), `LegacyWebJwt:Secret`/`Jwt:Secret`, `LegacyWeb:HostUrl` (G), `urls`/`HTTP_PORTS`/`HTTPS_PORTS` (B) · ชื่อใหม่ของ B (gateway origin, allowed origins, connection ของ SchoolBot/Master/School) ให้เจ้าของ B ตั้งชื่อ (สมมติฐาน)
- **คนต้องระบุ**: host/TLS ของ B, เส้นทางเครือข่าย W→B และ B→G (internal หรือ public), allow-list ของ Origin (W, admin web), เจ้าของ repo/ผู้ review แต่ละฝั่ง; agent ไม่ใส่ค่า host/secret แทน
- **staff bootstrap**: คนระบุ NCompany/บัญชีที่ใช้เป็น staff_admin คนแรก (ไม่ต้องส่งให้ agent) และเส้นทาง login ที่ออก token ให้บัญชีนั้น; ต้องได้คำตอบ TR-AUTH-03 ก่อน (key คือ `(school_id,user_id)`); insert ผ่าน vault/DBA ภายใต้ gate 6 พร้อม `reason`/`valid_until`/AuditEvent; re-audit โดยคนที่สองผ่าน `GET /v2/admin/staff-roles` และบันทึกว่าใครทำเมื่อไรตามที่คนแจ้ง

## 7. ข้อความเดิมก่อนแก้ (verbatim)

DES-012 Rev3: `user_id` = `TUser.NSystemId ?? SId` (คือ `TEmployees.sEmp`), `admin_id` = `TAdmins.id` (`WebLoginService.cs:206–217,272`) · ครูรายวิชา: `TplanCourseTeacher (SchoolId, PlanCourseId, SEmp)` `IsActive & !CDel` + `TEmployees` ไม่ถูกลบ (`A/.../TeacherRepository.cs:24–32,111–122`) + `TplanTermSubLevel2` (`PlanCourseRepository.cs:194–215`)

## Change Log

- 2026-10-23 — Rev1: arch รับ/ตรวจหลักฐาน BE-001 จาก sys (ใบงาน 020); ไม่มี verdict/SQL/runtime
