# ใบงาน056 — sys ตรวจ pre-auth routing/profile linkage ฝั่ง Gateway source (docs-only)

วันที่2026-10-24 · sys/Codex t3 read-only · ต่อใบงาน055 ที่ BLOCKED เพราะ `WebLoginService`/`FindAuthUserDetail` ไม่อยู่ใน legacy แต่ยืนยันแล้วว่าอยู่ใน G source (นายช่างค้นพบที่ `src/ApiGateway.Infrastructure/Authentication/WebLoginService.cs`, `Repositories/Databases/TusersRepository.cs` ฯลฯ)

หลักฐานรอบ055: [routing-linkage-evidence-001.json](routing-linkage-evidence-001.json) — legacy เป็น employee-only (cType="1", cDel==null, OrderByDescending(sID).FirstOrDefault ไม่ reject ซ้ำ, nSystemID ใช้โปรไฟล์/สิทธิ์ ส่วน sID ใช้ WorkStatus), B ยังไม่มี login route; failure เดิม: 501 Login Fail / 401 No Permission / 405 SCHOOL IS NOT ACTIVE / catch 502+StackTrace

K=C:/src/schoolbright/knowledge/school-bot. อ่านก่อน: planning/routing-linkage-evidence-001.json → planning/auth-flow-handoff-001 (ส่วน cType + ขั้นเทคนิคถัดไป) → design/desktop-login-adapter-001.md Rev4 → design/gateway-login-reuse-001.md Rev4

Scope ตรวจ G = C:/src/schoolbright/target/sb-api-gateway (อ่าน AGENTS.md ก่อน; read-only; ไม่อ่าน config/env/secret ไม่รัน network/DB):
- src/ApiGateway.Infrastructure/Authentication/WebLoginService.cs · WebTwoFactorService.cs
- src/ApiGateway.API/Controllers/WebAuthController.cs · WebAuthAutomationController.cs
- src/ApiGateway.Application/Services/Implementations/AuthService.cs · Application/Auth/WebLogin.cs
- src/ApiGateway.Application/Interfaces/Repositories/Databases/ITusersRepository.cs · Infrastructure/Repositories/Databases/TusersRepository.cs (FindAuthUserDetail)
- จุดเรียกต่อที่เกี่ยวกับ login/routing เท่านั้น (ไม่ขยายไปทั้ง repo)

ตอบ 5 คำถามเดิมด้วย source:line ของ G เท่านั้น:
1. routing seam: จุดเลือก route ตาม cType (0=student/1=employee) เกิดที่ไหน ก่อน/หลังตรวจ password เป็น single route ไม่กำกวมหรือลอย/ลองหลาย route; คั่น pre-auth routing hint ออกจาก post-auth admission
2. linkage: จุดผูก authenticated account→profile เดียว (AccountId→ProfileId) — FindAuthUserDetail คืนอะไร ใช้ตาราง/คอลัมน์อะไรที่ source ยืนยัน มี SchoolId/tenant filter ไหม
3. cType provenance: อ่านจากคอลัมน์ไหนจริง กรณีค่าเดียวไม่พอ (หลายแถว/null/cDel/ค่าอื่น) ระบบจัดการอย่างไร — reject หรือเลือกแถวแรกเงียบๆ
4. failure modes: routing/linkage ล้มที่ G ตอบ status/code/message อย่างไร (แยก user error จาก internal/StackTrace) และ 2FA/password-change/contact stages ที่ตัดออกก่อน session
5. verdict: seam พร้อมต่อ caller / มีเงื่อนไข (ระบุ) / ไม่มี — โดยไม่สมมติ AccountId=ProfileId และไม่ใช้ cType เป็นสิทธิ์ admin

ห้าม: ถามผู้ใช้ซ้ำ (cType/transport/มติ035 ตอบแล้ว), เขียน/แก้ไฟล์, รัน Login/tests/build, เปิด implementation, อ้าง fullLogin พร้อม (คง NOT_READY)

คืน fenced JSON <=4000 tokens โครงเดียวกับ055: {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","findings":[{"question":1..5,"verdict":"...","evidence":[{"repo":"G","path":"...","lines":"...","note":"..."}]}],"constraints":["..."],"handoff":"สิ่งที่ arch ต้องใช้ต่อออกแบบ gRPC login/session contract"} · นายช่างบันทึกเข้า knowledge เอง

## Change Log
- 2026-10-24 — เปิดใบงาน sys ตรวจ seam ฝั่ง G ต่อจาก055 ที่ BLOCKED (symbol อยู่ใน G ไม่ใช่ legacy)
- 2026-10-24 — รับผล: state=DONE — ไม่มี pre-auth cType selector (web=employee-only CType='1'/CDel null ก่อน password, เลือก SId มากสุดเงียบๆ; mobile แยก student/employee หลังสร้าง token), FindAuthUserDetail คืน master projection ไม่มี profile join/cardinality check, identity key ต่างกันระหว่าง WorkStatus/token/2FA (SId vs NSystemId??SId), error contract ฝั่ง G: 401/403/429/400/503-not-configured + HTTP200=password-change/2FA/contact ก่อน session; verdict มีเงื่อนไข ยังไม่พร้อมต่อ caller; หลักฐานเก็บที่ [routing-linkage-evidence-002.json](routing-linkage-evidence-002.json) → ส่งต่อ arch ใบงาน057
