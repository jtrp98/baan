# H5 questionnaire — BE-039

วันที่ 2026-10-24 · ใบงาน058 · เอกสารรวบรวมคำตอบ ไม่ใช่ใบอนุมัติเปิดใช้

## วิธีตอบและหลักฐานอ้างอิง

ตอบแต่ละข้อพร้อมชื่อผู้รับผิดชอบ วันที่ตอบ สถานะ และ reference หลักฐานที่ไม่มีข้อมูลลับ หากยังตอบไม่ได้ให้ระบุผู้ที่รอและสิ่งที่ต้องส่งต่อ ห้ามส่งค่า secret, connection string, token, certificate/private key หรือค่า host/origin/listener จริงในเอกสารนี้ ขอเฉพาะชื่อ config/env key เจ้าของ และสถานะของการตั้งค่า ส่วนค่าจริงให้เจ้าของจัดการผ่านช่องทางที่องค์กรกำหนด

สถานะการตั้งค่าใช้ `ยังไม่ตั้ง|ตั้งแล้ว|ยังไม่ยืนยัน`; ข้อที่ไม่ใช้ต้องระบุเหตุผลและผู้รับรอง การตอบว่า `ตั้งแล้ว` ไม่แทนผลทดสอบหรือการรับรองของเจ้าของ

อ้างอิง: [arch057 open_items](gateway-grpc-contract-response-001.json), [gRPC contract Rev1](../design/gateway-grpc-contract-001.md) §3/§5/§6/§7, [Gateway integration Rev4](../design/gateway-integration-001.md) ตารางเจ้าของและหลักฐานก่อนเปิดใช้, [DES-012 Rev9](../design/des-012.md) §2–§6 และ [H5 checklist เดิม](../design/auth-evidence-001.md) §6 ที่ DES-012 เชื่อมไว้

หมายเหตุชุดหลักฐาน (นายช่างแก้พาธจากรอบส่งต้นฉบับ): แถว G-AUTH ของ [plan/evidence-002.md](../plan/evidence-002.md) ระบุสิ่งที่ BE-039 ต้องเตรียมให้คนระบุจาก artifact ครบ — route/BFF/web-principal/env/network/เจ้าของ repo และ staff_admin ตั้งต้น ซึ่งหัวข้อ 1–7 ด้านล่างครอบครบทุกรายการแล้ว

## 1. Host/origin/listener และการแยกเครือข่าย

**คำถาม:** infra/G owner/B owner ระบุชื่อ config/env key เจ้าของ และสถานะ แยกสำหรับ (ก) G public origin (ข) private G web-principal listener/origin (ค) B gRPC upstream/listener และ (ง) Origin allowlist ของ web-system/admin web ได้หรือไม่? ใครรับผิดชอบหลักฐานว่า private listener รับเฉพาะ B workload, public ingress/BFF เข้าไม่ถึง, B upstream ไม่ชี้กลับ service-route และ private lookup ไม่เรียก B exchange วนกลับ?

**เหตุผล:** contract §3/§6/§7.6 และ Gateway ตารางเจ้าของ ระบุ host/env/private exposure/no-loop ว่ายังรอ H5; topology ที่ยืนยันคือ browser→BFF→HTTP G→gRPC B และ B→private G

**ผู้ต้องตอบ:** infra ร่วม G owner, B owner และ BFF owner สำหรับ Origin allowlist

**รูปแบบคำตอบ:** ตาราง `วัตถุประสงค์ | process | ชื่อ key | owner | สถานะ | ผู้ตรวจ/หลักฐาน reachability หรือ no-loop` ไม่ใส่ค่าจริง; ใช้พาธ private เดิม `GET /api/school-bot/auth/web-principal` โดยไม่ขอเลือกพาธใหม่

**เมื่อไม่มีคำตอบ:** ยังเปิดเส้นทางเชื่อม G→B และ web exchange ไม่ได้; private endpoint ต้องไม่ถูกเปิดผ่าน public ingress/BFF ไม่มี direct public B fallback

## 2. TLS และ service-peer authentication

**คำถาม:** แต่ละเส้น G→B และ B→private G ใช้ TLS termination ที่ชั้นใด ใครเป็นผู้ตรวจ certificate/server identity และผู้รับพิสูจน์ caller workload อย่างไร? ระบุ service identity ที่ใช้ในรูปชื่อ key/ชนิด identity และ owner โดยไม่ส่งค่าจริง พร้อมวิธีปฏิเสธ peer ที่ไม่ถูกต้อง การหมดอายุ/เปลี่ยน credential และผู้รับผิดชอบหลักฐาน negative test

**เหตุผล:** contract §3 แยก service identity จาก user credential; `x-caller` อย่างเดียวพิสูจน์ peer ไม่ได้ §6 จำกัด private route ให้ B workload; HTTP/dns default ใน source ไม่พิสูจน์ TLS ที่ deploy

**ผู้ต้องตอบ:** infra, G owner และ B owner

**รูปแบบคำตอบ:** แยกสองเส้น `ผู้เรียก→ผู้รับ | TLS/termination | วิธีตรวจ server | วิธีพิสูจน์ caller | identity config key/ชนิด | owner | สถานะ | หลักฐาน wrong-peer/invalid-certificate rejection` หากยังไม่เลือกวิธีให้ระบุรอผู้ตัดสิน ไม่ถือว่า mTLS หรือวิธีใดถูกเลือกแล้ว

**เมื่อไม่มีคำตอบ:** ยังเปิด trusted G↔B integration หรือ private introspection ไม่ได้; ไม่ยอมรับ identity headers/user credential แทน peer proof

## 3. Secret/env matrix ราย process

**คำถาม:** เจ้าของ G/B/BFF คืน matrix ครบทุก process และ deployment environment โดยระบุ key ที่ต้องใช้ เจ้าของการจัดเตรียม/rotation และสถานะได้หรือไม่? ยืนยันว่า B ไม่รับ shared legacy signing secret เพื่อใช้แทนทาง C และไม่มี fallback ที่ทำให้ authentication เปิดได้เมื่อ config ขาด

**เหตุผล:** Gateway ตารางเจ้าของและ auth-evidence §6 ให้เจ้าของกำหนดชื่อใหม่เอง; contract §3/§7.6 ยังขาด secret/env ownership

**ผู้ต้องตอบ:** G owner, B owner, BFF owner และ infra

**รูปแบบคำตอบ:** `process/repo | วัตถุประสงค์ | ชื่อ key | secret หรือ non-secret | owner | ยังไม่ตั้ง/ตั้งแล้ว/ยังไม่ยืนยัน | fallback ที่มีหรือไม่มี | หลักฐานตรวจโดยไม่เผยค่า` ครอบรายการตั้งต้นต่อไปนี้:
- G: `LegacyWebJwt:Secret`/`Jwt:Secret`, `LegacyWeb:HostUrl` ตามหลักฐานเดิม ให้เจ้าของยืนยันการใช้จริงและ fallback; เพิ่มชื่อ key สำหรับ B gRPC upstream, private listener, TLS/peer และ rate-limit propagation ตามที่เจ้าของกำหนด
- B: `urls`/`HTTP_PORTS`/`HTTPS_PORTS` ตามหลักฐานเดิม; ให้เจ้าของระบุชื่อ key สำหรับ private G origin, allowed origins, connection ของ SchoolBot/Master/School และ TLS/service-peer configuration โดยไม่ส่ง connection string
- web-system BFF: คง `GATEWAY_API_URL`; admin BFF ให้เจ้าของยืนยันชื่อ key ที่ใช้จริง ไม่สมมติชื่อใหม่
- ระบุเจ้าของและสถานะการเลิกใช้ `SCHOOL_BOT_ADMIN_KEY`/`ARM_ADMIN_KEY` และ `/v1/admin` หลังมี staff_admin ตาม checklist; ไม่ขอค่า static key

**เมื่อไม่มีคำตอบ:** process/เส้นทางที่ขาด config ต้องยังไม่เปิด; auth mapping/config ไม่พร้อมใช้ `503 AUTH_NOT_CONFIGURED` ตามสัญญา ไม่สร้างค่า default หรือแชร์ secret ชดเชย

## 4. Tenant, rate-limit propagation และการรับรอง G/Light

### 4.1 คำถามต่อ G owner

**คำถาม:** G owner รับรอง pipeline เฉพาะ opaque SchoolBot session ตาม contract §3 ได้หรือไม่ โดยไม่ส่ง opaque Bearer เข้า SmartScheme/JWT validator ไม่ mint JWT จำลอง และให้ B เป็น authority ของ session/tenant/Channel/License/membership/revocation? ระบุการสร้าง metadata ใหม่จาก allowlist การ strip identity headers การ reject duplicate authority headers และการตรวจ tenant เมื่อมี trusted JWT context คู่กัน

**เหตุผล:** เป็นข้อยกเว้นที่ยังไม่รับรองต่อกฎ tenant จาก JWT ของ G; AllowAnonymous อย่างเดียวไม่เพียงพอ

**ผู้ต้องตอบ:** G owner ร่วม B owner

**รูปแบบคำตอบ:** `รับรอง/ไม่รับรอง/รอแก้ | owner | pipeline/route manifest reference | หลักฐาน spoofed headers, JWT/opaque สลับกัน, cross-school และ anonymous logout` หากไม่รับรองระบุข้อขัดแย้งส่ง arch ไม่เปลี่ยนสัญญาเอง

**เมื่อไม่มีคำตอบ:** service-route ยังเปิดไม่ได้; ห้ามสร้าง B principal จาก Sid/x-user-id/x-is-admin หรือ school_id ใน body

### 4.2 คำถามต่อ infra/G/B เรื่อง rate limit

**คำถาม:** ใครสร้าง source-rate-limit key จาก trusted ingress peer ส่งต่อด้วย metadata ชื่อใด ตรวจความถูกต้องที่ B อย่างไร และป้องกัน client ปลอม key/X-Forwarded-For อย่างไร? private web-principal ใช้ partition ก่อนยืนยัน identity และ `(school,user)` หลังยืนยันตาม checklist อย่างไร?

**เหตุผล:** contract §3/§6 ยังไม่ตรึง propagation; หากไม่ส่ง source อย่างเชื่อถือได้ ผู้ใช้ทั้งหมดอาจถูกรวมเป็น G peer

**ผู้ต้องตอบ:** infra, G owner และ B owner

**รูปแบบคำตอบ:** `trusted ingress owner | วิธี derive/validate | metadata contract | duplicate/spoof rejection | partition ก่อน/หลัง auth | สถานะ | หลักฐานทดสอบ` ไม่ส่งค่า key ของผู้ใช้จริง

**เมื่อไม่มีคำตอบ:** ยังเปิด traffic ที่พึ่ง source partition นี้ไม่ได้; ห้ามเชื่อ forwarding headers จาก client หรืออ้างว่า rate limit แยกผู้ใช้ถูกต้องแล้ว

### 4.3 คำถามต่อ Light โดยเฉพาะ

**คำถาม:** Light รับรองข้อยกเว้น opaque-session และ protected-path changes ใดแล้วบ้าง? ใครเป็น CODEOWNERS ของ Program/hosting/middleware/Common/Grpc? review ครอบ exact routes, policy/SbRateLimit/Swagger, maintenance/revocation, private exposure, BFF CSRF และ mapper/deadline/retry/limits ตาม contract §7 หรือยัง?

**เหตุผล:** arch057 open_items และ contract §7.1–3 ต้องรับรองก่อน implementation; G เดิมยังคืน Unavailable→503 และ timeout→408 ต่างจาก mapper ที่เสนอ

**ผู้ต้องตอบ:** ผู้รับผิดชอบ Light review และ G owner; B/BFF owner ส่งหลักฐานของตน

**รูปแบบคำตอบ:** `ประเด็น | ผู้ review | รับรอง/ไม่รับรอง/รอหลักฐาน | วันที่ตามที่ผู้ review แจ้ง | review reference | เงื่อนไขค้าง` พร้อม fixtures 204/401/403/412/428/B503/G502/504/503 และ malformed trailers; ร่างเอกสารไม่ใช่ approval

**เมื่อไม่มีคำตอบ:** ห้ามเปิด service-route หรือถือว่าการแก้ protected paths/mapper ได้รับรองแล้ว

## 5. staff_admin bootstrap ตั้งต้น

**คำถาม:** ผู้ใช้ธุรกิจแต่งตั้งใครเป็น staff_admin คนแรก และใครถือข้อมูล NCompany/บัญชีจริงผ่านช่องทางที่ปลอดภัย? B owner ยืนยัน login path และ mapping `(school_id,user_id)` ที่ผ่าน TR-AUTH-03 แล้วหรือยัง? ใครเตรียมขั้นตอนสร้าง SchoolBotStaffRole แถวแรก ใครตรวจ SQL หากต้องใช้ ใครรัน และใครเป็นผู้ตรวจซ้ำคนที่สอง?

**เหตุผล:** DES-012 §3/§4/§5 และ auth-evidence §6: POST staff-roles ต้องมี staff_admin อยู่ก่อน จึงใช้ endpoint นี้ bootstrap ตัวเองไม่ได้; school_admin ตาม035ไม่เท่ากับ staff_admin

**ผู้ต้องตอบ:** ผู้ใช้ธุรกิจ, B owner/sys; vault ตรวจ SQL หากมี; มนุษย์ผู้รันและผู้ตรวจซ้ำ

**รูปแบบคำตอบ:** `ผู้แต่งตั้ง/ผู้ถือบัญชีจริง | login/mapping evidence | วิธี bootstrap reference | role/validity/reason ที่เจ้าของยืนยัน | ผู้เตรียม/ผู้ตรวจ/ผู้รัน | AuditEvent evidence | ผู้ตรวจซ้ำผ่าน GET /v2/admin/staff-roles | สถานะ` ไม่บันทึกบัญชีจริงใน knowledge; ระบุ receipt test DB สำหรับ G-CORE และการรัน shared/production โดยมนุษย์ภายใต้ G-RELEASE แยกกัน

**เมื่อไม่มีคำตอบ:** staff_admin exchange และงาน admin ที่ต้องใช้ role ยังเปิดไม่ได้; ห้ามให้ role จาก cType/IsAdmin/static bearer แทน ห้าม agent สร้าง DDL หรือรัน bootstrap บน shared environment

## 6. web-system BFF และ admin BFF

**คำถาม:** ใครเป็นเจ้าของ repo และ route mapping ของ BFF ทั้งสอง? web-system ยืนยันใช้ `GATEWAY_API_URL` เดิมแล้วหรือยัง และ admin BFF ใช้ env key ชื่อใด? exact method/path allowlist, credential filtering, Origin/CSRF และการเก็บ session ถูกกำหนด/ตรวจโดยใคร?

**เหตุผล:** Gateway ตารางเจ้าของ, DES-012 §6 และ contract §2/§3/§7.2; browser ต้องผ่าน same-origin BFF ไป G ไม่ใช่ B โดยตรง

**ผู้ต้องตอบ:** BFF owner ของ web-system และ admin BFF ร่วม G owner/B owner

**รูปแบบคำตอบ:** แยกสอง BFF `repo | owner/reviewer | upstream key | สถานะ | route manifest reference | credential/CSRF/Origin evidence` คง web-system token ใน memory และ admin `__Host-sb-admin` HttpOnly cookie ตาม DES-012; cookie แปลงเป็น Bearer ฝั่ง server ไม่ส่ง Cookie ไป G/B; mapping ต้องไม่เปิด private web-principal, /v1/admin หรือ health/control และไม่เป็น catch-all

**เมื่อไม่มีคำตอบ:** BFF ฝั่งที่ยังไม่พร้อมยังเปิด browser flow ไม่ได้; ห้ามตั้ง upstream ไป B ตรงหรือเพิ่ม public private-route alias

## 7. ลำดับเปิดใช้และหลักฐานที่ต้องส่งต่อ

**คำถาม:** เจ้าของแต่ละขั้นยืนยันผู้รับผิดชอบและเงื่อนไขผ่านก่อนเริ่มขั้นถัดไปได้หรือไม่?

**เหตุผล:** contract §7 และ arch057 open_items กำหนดลำดับรับรองก่อน implementation/codegen และก่อนอ้างพร้อมใช้งาน

**ผู้ต้องตอบ:** G owner/Light, B owner, BFF owner และ infra; ผู้ใช้ธุรกิจตอบส่วน bootstrap; ผู้ตรวจรับตอบตามขอบเขตตน

**รูปแบบคำตอบ:** ตาราง `ขั้น | owner | รออะไร | รับรอง/ยังไม่รับรอง | หลักฐาน | ผู้อนุญาตเปิดใช้` ตามลำดับ:
1. รับคำตอบ env/network/TLS/peer และการรับรอง opaque-session/tenant/mapper/route ของ G/Light; ระหว่างรอ service-route ปิด
2. Owner ตรึง contract ที่เกี่ยวข้อง รวม DTO/trailer compatibility; Login/Bind ต้องมี continuation/attempt/device-proof และ signed method/path/header manifest ที่ครบ; selector/cardinality และ employee linkage ต้องมีหลักฐานจาก G/sys/legacy/vault ไม่ใช้ fallback ที่เดา
3. หลัง owner รับรอง ให้ B เป็นเจ้าของ .proto แล้ว sync ไป G ตาม contract §7.7; ส่ง parser/codegen/hash evidence ไม่สร้าง .proto จากร่างก่อนตรึง contract
4. ทำ implementation ตามขอบเขตที่รับรอง และพิสูจน์ HTTP fixtures/integration จริง รวม reachability denial/no-loop/peer rejection, deadlines/cancellation/retry/limits และ BFF security
5. ทำ staff bootstrap ตามข้อ5 โดยมนุษย์ที่รับผิดชอบและตรวจซ้ำ; เปิดเฉพาะ operation ที่ prerequisite ครบ หลัง G/Light รับรองแล้วเท่านั้น ส่วน Login end-to-end ยังคงปิดหาก continuation/linkage/device proof ไม่ครบ

**เมื่อไม่มีคำตอบ:** ยังเดินข้ามขั้นหรือเปิด service-route ไม่ได้; local logout tests ไม่แทน Gateway/gRPC/DB integration และ questionnaire ไม่แทนการปิด H5/G-AUTH/QA/release

## Change Log

- 2026-10-24 — จัดทำ questionnaire H5 ครบ 7 หัวข้อจาก arch057 และสัญญาที่อ่านได้; ระบุหลักฐาน G-AUTH ที่ยังอ่านไม่ได้ ไม่เปลี่ยน contract หรือ gate
- 2026-10-24 — นายช่างบันทึกไฟล์และแก้พาธอ้างอิง evidence-002 จาก `planning/` เป็น `plan/` (พาธผิดมาจากใบงาน058 ของนายช่างเอง ไม่ใช่ข้อผิดพลาดของ sys) พร้อมยืนยันว่าหัวข้อ 1–7 ครอบรายการ artifact ที่แถว G-AUTH ของ evidence-002 ระบุครบ; ต้นฉบับคำตอบเก็บที่ [h5-questionnaire-response-001.json](h5-questionnaire-response-001.json)
