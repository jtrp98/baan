# สารบัญ Transport, Login และสิทธิ์

> แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจ implementation และหลักฐาน Git)

[กลับสารบัญ design](index.md) · เอกสารย่อยใช้ Rev ของสัญญาหลักและไม่เพิ่มสัญญาใหม่

| เอกสาร | Rev | สัญญา/เนื้อหา | สถานะปัจจุบัน |
|---|---|---|---|
| [gateway-integration-001.md](gateway-integration-001.md) | 6 | Topology HTTP→Gateway→gRPC และ controller/service entry | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-integration-trust.md](gateway-integration-trust.md) | 6 | Trust boundary, header/credential isolation และ failure | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-integration-admin.md](gateway-integration-admin.md) | 5 | คำนวณ admin จากกลุ่มฝั่ง server และ super admin เดิม | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-integration-evidence.md](gateway-integration-evidence.md) | 6 | แยก source baseline กับหลักฐาน local logout | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001.md](gateway-grpc-contract-001.md) | 4 | RPC/Data Transfer Object (DTO), HTTP/error mapping และ opaque-session boundary | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-dto.md](gateway-grpc-contract-001-dto.md) | 4 | DTO และ presence ของข้อมูล | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-identity.md](gateway-grpc-contract-001-identity.md) | 4 | Identity และ tenant boundary | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-login.md](gateway-grpc-contract-001-login.md) | 4 | Login routing และ admission | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-errors.md](gateway-grpc-contract-001-errors.md) | 4 | Error mapping | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-limits.md](gateway-grpc-contract-001-limits.md) | 4 | Deadline, limits และ private exposure | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-grpc-contract-001-review.md](gateway-grpc-contract-001-review.md) | 3 | รายการรับรองและทางเลือก | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-grpc-contract-001-evidence.md](gateway-grpc-contract-001-evidence.md) | 3 | หลักฐาน source และ local logout | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-controller-entry-001.md](gateway-controller-entry-001.md) | 3 | Controller/service และ module-owned channel | implementationปัจจุบัน; production/H5/G-AUTHยังไม่ผ่าน |
| [gateway-controller-entry-001-tests.md](gateway-controller-entry-001-tests.md) | 2 | การเชื่อมชุดทดสอบและ assertion | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-controller-entry-001-evidence.md](gateway-controller-entry-001-evidence.md) | 2 | หลักฐานและข้อที่ยังไม่ยืนยัน | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-logout-slice-001.md](gateway-logout-slice-001.md) | 1 | สัญญา typed gRPC local logout | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-logout-slice-001-acceptance.md](gateway-logout-slice-001-acceptance.md) | 1 | Replies, acceptance และหลักฐาน | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-logout-negative-boundary-001.md](gateway-logout-negative-boundary-001.md) | 2 | Error pairs, metadata accounting, correlation และ trace/lang | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-logout-negative-boundary-001-validation.md](gateway-logout-negative-boundary-001-validation.md) | 2 | Validator และข้อจำกัด | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-login-reuse-001.md](gateway-login-reuse-001.md) | 4 | Reuse Login HTTP เดิมของ Gateway และแยก session responsibility | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [desktop-login-adapter-001.md](desktop-login-adapter-001.md) | 5 | Admission, cType และ pre-auth routing ของ Desktop | รอ routing/profile linkage; Login ครบระบบยังไม่พร้อม |
| [desktop-login-adapter-requests.md](desktop-login-adapter-requests.md) | 5 | Internal operations และ effective request bounds | สัญญาเดิม; public continuation ยังไม่เปิด |
| [desktop-login-adapter-outcomes.md](desktop-login-adapter-outcomes.md) | 5 | Outcome branches และ trusted completion boundary | ใช้ร่วม decoder; ไม่ยืนยัน session admission |
| [desktop-login-adapter-failures.md](desktop-login-adapter-failures.md) | 5 | Public mapper, timeout, retry และ unknown outcome | Public mapper ยังไม่ implement |
| [gateway-outcome-component-001.md](gateway-outcome-component-001.md) | 1 | Callable internal web decoder/parser/normalized outcomes | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-outcome-component-001-validation.md](gateway-outcome-component-001-validation.md) | 1 | Validation และ bounds | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-outcome-component-001-outcomes.md](gateway-outcome-component-001-outcomes.md) | 1 | Outcome และ HTTP errors | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [gateway-outcome-component-001-acceptance.md](gateway-outcome-component-001-acceptance.md) | 1 | Acceptance และหลักฐาน | สัญญา/หลักฐานรุ่นก่อน; อ่าน contractปัจจุบันก่อนใช้ |
| [des-004-session.md](des-004-session.md) | 13 | Token, SessionView และ HTTP API รวม conditional TeacherGrant | สัญญา DES-004; TeacherGrant ยังไม่เปิดใช้ |
| [des-004-lifecycle.md](des-004-lifecycle.md) | 13 | Profile binding, อายุ, logout และ errors | สัญญา DES-004; integration ยังรอ |
| [des-004-permissions.md](des-004-permissions.md) | 13 | สิทธิ์ Guest/นักเรียน/ครู/admin และ License | สัญญา DES-004; identity/scope proof ยังรอ |
| [des-004-persistence.md](des-004-persistence.md) | 13 | Cross-DB re-check และ store/cache commit boundary | มติหน่วย commit ยืนยันแล้ว; runtime proof ตามงาน DB |
| [des-012-exchange.md](des-012-exchange.md) | 9 | Private web-principal และขั้นแลก token เว็บ | สัญญา DES-012; introspection/identity proof ยังรอ |
| [des-012-authorization.md](des-012-authorization.md) | 9 | สิทธิ์ admin/ครู/staff, admin API และ browser session | นโยบายยืนยันแล้ว; อายุ Desktop 8 ชั่วโมงนับจาก bind สำเร็จตามมติ 052 |
| [teacher-authority-001.md](teacher-authority-001.md) | 1 | ครูรายวิชา ∩ roster ∩ term เป็น authority ของรายชื่อ | เป็นข้อเสนอ; roster/status/time resolver ยังขาดหลักฐาน |
| [source-review-002.md](source-review-002.md) | 2 | หลักฐานบัญชี/profile และ Entity Framework context ใน academic | EVIDENCE — ไม่ใช่ credential compatibility/runtime proof |
| [auth-references-001.md](auth-references-001.md) | 1 | ขอบเขต requirement/มติของ DES-004 และ DES-012 | สารบัญอ้างอิงเดิม; OQ-009 ยังยืนยันหัวข้อไม่ได้ |
