# สารบัญ Transport, Login และสิทธิ์

[กลับสารบัญ design](index.md) · เอกสารย่อยใช้ Rev ของสัญญาหลักและไม่เพิ่มสัญญาใหม่

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [gateway-integration-001.md](gateway-integration-001.md) | 5 | Topology HTTP→Gateway→gRPC และ controller/service entry | แบบปัจจุบัน; local logout มี implementation |
| [gateway-integration-trust.md](gateway-integration-trust.md) | 5 | Trust boundary, header/credential isolation และ failure | สัญญาเดิม; H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ)/Light/integration ยังรอ |
| [gateway-integration-admin.md](gateway-integration-admin.md) | 5 | คำนวณ admin จากกลุ่มฝั่ง server และ super admin เดิม | นโยบายยืนยันแล้ว; mapping/implementation ยังรอ |
| [gateway-integration-evidence.md](gateway-integration-evidence.md) | 5 | แยก source baseline กับหลักฐาน local logout | EVIDENCE — ไม่ใช่ production acceptance |
| [gateway-grpc-contract-001.md](gateway-grpc-contract-001.md) | 2 | RPC/Data Transfer Object (DTO), HTTP/error mapping และ opaque-session boundary | local logout ใช้แล้ว; RPC อื่นเป็นข้อเสนอ |
| [gateway-controller-entry-001.md](gateway-controller-entry-001.md) | 2 | Controller/service และ module-owned channel | ตรงหลักฐาน local; production registration ยังไม่ยืนยัน |
| [gateway-logout-slice-001.md](gateway-logout-slice-001.md) | 1 | สัญญา typed gRPC local logout | ผลตรวจ local ผ่าน; production/trust integration ยังรอ |
| [gateway-logout-negative-boundary-001.md](gateway-logout-negative-boundary-001.md) | 2 | Error pairs, metadata accounting, correlation และ trace/lang | คง negative boundary; แยก direct invocation กับ Gateway entry |
| [gateway-login-reuse-001.md](gateway-login-reuse-001.md) | 4 | Reuse Login HTTP เดิมของ Gateway และแยก session responsibility | PROPOSED — Desktop identity/device และ H5 ยังรอ |
| [desktop-login-adapter-001.md](desktop-login-adapter-001.md) | 4 | Admission, cType และ pre-auth routing ของ Desktop | รอ routing/profile linkage; Login ครบระบบยังไม่พร้อม |
| [desktop-login-adapter-requests.md](desktop-login-adapter-requests.md) | 4 | Internal operations และ effective request bounds | สัญญาเดิม; public continuation ยังไม่เปิด |
| [desktop-login-adapter-outcomes.md](desktop-login-adapter-outcomes.md) | 4 | Outcome branches และ trusted completion boundary | ใช้ร่วม decoder; ไม่ยืนยัน session admission |
| [desktop-login-adapter-failures.md](desktop-login-adapter-failures.md) | 4 | Public mapper, timeout, retry และ unknown outcome | Public mapper ยังไม่ implement |
| [gateway-outcome-component-001.md](gateway-outcome-component-001.md) | 1 | Callable internal web decoder/parser/normalized outcomes | มี implementation/ผลตรวจ local; ไม่ยืนยัน Login/integration |
| [des-004-session.md](des-004-session.md) | 12 | Token, SessionView และ HTTP API รวม conditional TeacherGrant | สัญญา DES-004; TeacherGrant ยังไม่เปิดใช้ |
| [des-004-lifecycle.md](des-004-lifecycle.md) | 12 | Profile binding, อายุ, logout และ errors | สัญญา DES-004; integration ยังรอ |
| [des-004-permissions.md](des-004-permissions.md) | 12 | สิทธิ์ Guest/นักเรียน/ครู/admin และ License | สัญญา DES-004; identity/scope proof ยังรอ |
| [des-004-persistence.md](des-004-persistence.md) | 12 | Cross-DB re-check และ store/cache commit boundary | มติหน่วย commit ยืนยันแล้ว; runtime proof ตามงาน DB |
| [des-012-exchange.md](des-012-exchange.md) | 9 | Private web-principal และขั้นแลก token เว็บ | สัญญา DES-012; introspection/identity proof ยังรอ |
| [des-012-authorization.md](des-012-authorization.md) | 9 | สิทธิ์ admin/ครู/staff, admin API และ browser session | นโยบายยืนยันแล้ว; จุดเริ่มนับ Desktop expiry ยังไม่ยืนยัน |
| [teacher-authority-001.md](teacher-authority-001.md) | 1 | ครูรายวิชา ∩ roster ∩ term เป็น authority ของรายชื่อ | PROPOSED — roster/status/time resolver ยังขาดหลักฐาน |
| [source-review-002.md](source-review-002.md) | 2 | หลักฐานบัญชี/profile และ Entity Framework context ใน academic | EVIDENCE — ไม่ใช่ credential compatibility/runtime proof |
| [auth-references-001.md](auth-references-001.md) | 1 | ขอบเขต requirement/มติของ DES-004 และ DES-012 | สารบัญอ้างอิงเดิม; OQ-009 ยังยืนยันหัวข้อไม่ได้ |
