# Gateway–SchoolBot gRPC contract — รายการรับรองและทางเลือก

> Rev 3 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

เอกสารนี้เก็บสัญญา/หลักฐานของ opaque session และ local logout รุ่นก่อน โดยคงผลตรวจเดิม ไม่ใช่สัญญา implementation ณ HEAD ปัจจุบัน ซึ่งใช้ JWT และห้า resource services อ่าน [สัญญาปัจจุบัน](gateway-grpc-contract-001.md) และ [หลักฐานกับข้อแตกต่าง](gateway-integration-evidence.md) ก่อนใช้อ้างอิง; ข้อกำหนด DES ที่ยังต้อง reconcile ไม่ถือว่าผ่านจากผลเก่านี้

ส่วนต่อของ [Gateway–SchoolBot gRPC contract](gateway-grpc-contract-001.md) อธิบายรายการรับรองและทางเลือก.

## 7. Review packet และการตัดสินใจ

รายการรับรอง Gateway/Light (ผู้ทบทวน implementation ของ Gateway) สำหรับการเชื่อมระบบจริงและ RPC ที่ยังเป็นข้อเสนอ (ไม่ย้อนผล local logout):
1. รับรองข้อยกเว้น opaque-session tenant/pipeline พร้อม negative tests ของ spoofed headers, JWT/opaque สลับกัน, cross-school, anonymous logout; อ้าง AGENTS:35 และ metadata source ข้างต้น.
2. ตรวจ exact route manifest, policy/SbRateLimit/Swagger, control-plane maintenance/revocation และ Backend for Frontend (BFF) CSRF; ห้าม catch-all/private exposure. ระบุ CODEOWNERS สำหรับ Program/hosting/middleware/Common/Grpc.
3. ตรวจ named gRPC client, deadlines/retry/circuit/limits และ error mapper เฉพาะ Q; fixtures ต้องครอบ 204,401,403,412,428,B503,Gateway HTTP 502/504/503 และ malformed trailers. อ้าง source ในหลักฐาน ผล local logout แยกไว้ใน [หลักฐาน integration](gateway-integration-evidence.md); ไม่รับรอง RPC อื่นตามไปด้วย.
4. sb-api-gateway/sys/legacy/vault คืน selector/account-profile cardinality และ status/token/2FA key ที่ตรงกัน; ทำ evidence เรื่อง deleted/null/sentinel/duplicate/cross-school. ไม่ใช้ cType อนุมัติ admin.
5. Owner ตรึง continuation/attempt/device-proof contract ก่อนเปิด Login; รับรอง internal diagnostic codes และ public codes หากต้องเพิ่ม.
6. Infra/sb-api-gateway/SchoolBot gRPC service ระบุ host/env-key owner/private exposure/TLS/peer authentication โดยไม่ส่งค่าลับ; ยืนยัน no-loop และ public reachability denial. H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ) ยังเปิด.
7. หลังรับรอง ให้ SchoolBot gRPC service เป็นเจ้าของ .proto แล้ว sync ไป HTTP API Gateway ตาม AGENTS:32; ตรวจ parser/codegen/hash, HTTP fixtures และ integration จริงก่อนอ้างพร้อม. Login/exchange/session/me/revoke ยังไม่ถือว่า implement หรือรับรองจากผล local logout.

ADR: ใช้ application logout เดิมแทนเขียน persistence ที่ HTTP API Gateway; ใช้ typed RPC แทน generic tunnel; ใช้ C exchange/opaque session แทนแชร์ signing secret หรือบังคับ JWT คู่; companion trailer เฉพาะ SchoolBot gRPC service แทนเปลี่ยน global HTTP API Gateway envelope; ไม่ retry mutation เพื่อเลี่ยง OTP/consume/commit ซ้ำ. ข้อยกเว้น tenant และ mapper ยังต้อง owner รับรอง ไม่ถือว่าร่างคือ approval.
