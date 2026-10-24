# รับผลตรวจ Gateway Login และแบบ reuse — 001

> สถานะเอกสารปัจจุบัน 2026-10-24: [ผลตรวจเอกสาร](transport-docs-review-001.md) / [Gateway Rev3](../design/gateway-integration-001.md) มี precedence เรื่อง service transport: HTTP G→gRPC B. ผลรับและ revision วันที่2026-10-23 ด้านล่างเก็บตามประวัติ; ไม่ใช่ revision ปัจจุบันหรือหลักฐาน integration.

วันที่ 2026-10-23 · ผู้คุมบันทึกผล sys/Codex t3 และ arch/Codex t1 ตามคำสั่งล่าสุด ใช้ Codex โดยตรง ไม่ fallback

[sys task031](task-031.md) · [ผลตรวจ Login](gateway-login-review-001.md) · [arch task032](task-032.md) · [ผล arch ต้นฉบับ](gateway-login-architecture-response-001.json)

## ผลที่รับและบันทึกแล้ว

sys พบ POST /api/auth/login และ POST /api/auth/web/login ที่มี implementation จริง พร้อมเส้น first-password/2FA/contact. ข้อจำกัด Git metadata ในผล sys ถูกผู้คุมตรวจให้แล้วตาม [หลักฐานก่อน](gateway-login-source-check-001.json) และ [หลัง](gateway-login-source-check-002.json); ไม่ใช่ blocker ที่ต้องถามผู้ใช้

arch ส่ง NEEDS_DESIGN_CHANGE พร้อม patch proposal: ผู้คุม apply 10 edits ใน DES-004 Rev8, DES-012 Rev6, Gateway integration Rev2 และ design index พร้อมเพิ่ม [Login reuse Rev1](../design/gateway-login-reuse-001.md). เก็บต้นฉบับ 4 ไฟล์แบบ byte-for-byte พร้อม SHA256 ที่ [manifest](../design/archive/2026-10-23-before-gateway-login-reuse-001/manifest.json)

แบบใหม่เลิกบังคับ SchoolBot อ่าน password/hash จาก Master DB เพื่อทำ verifier ซ้ำ ใช้ Gateway pipeline ผ่าน adapter ตาม actor; ยังไม่ถือว่า adapter หรือ service-route พร้อมใช้งาน. school_web ใช้ Login/BFF เดิมแล้วคง C exchange; Desktop student และ teacher เป็น candidate ตามเงื่อนไข device/challenge/identity. คงมติ035, License, Channel, DeviceJkt และ opaque SchoolBot session. ไม่เปลี่ยน requirement/AC/schema/SQL

## เจ้าของงานถัดไปตามผล arch

| เจ้าของ | หลักฐาน/งานที่ต้องรับ | ส่วนที่ยังเปิดไม่ได้ |
| --- | --- | --- |
| G/sys และ B | Desktop completion/continuation, IMEI lifecycle, input bounds และ trusted identity adapter contract | DES-004: การเปิด Desktop login; ห้ามเริ่ม verifier ใหม่ระหว่างรอ |
| legacy/vault | TR-AUTH-02-rest/03..06: TAdmin, AccountId/SId/NSystemId/sEmp, tenant/WorkStatus และ compatibility | เฉพาะ actor/identity mapping ที่ยังพิสูจน์ไม่ได้; ไม่เปิด policy035 |
| G/Light, B และ infra | ตรวจ gRPC service contract/HTTP mapping และ trusted tenant/opaque-session boundary พร้อม H5, exposure, TLS, secret owners และ isolation ตาม Gateway Rev3 | gateway-integration-001/DES-012: SchoolBot service-route และ private introspection |
| admin BFF/B | staff identity/bootstrap, HttpOnly cookie, Origin/CSRF และ C exchange | staff_admin; school superadmin ไม่ใช่ทางทดแทน |

รายการนี้เป็นการส่งต่อใน knowledge ไม่ได้ส่งข้อความหาเจ้าของระบบภายนอก. ต้องรับ contract/evidence ที่ระบุข้างต้นก่อน implement ส่วนที่พึ่งพา; ไม่ถามมติ035 หรือให้ผู้ใช้เลือก password algorithm ซ้ำ

## การตรวจและขอบเขต

[ผลตรวจเอกสาร](gateway-login-validation-001.json) ตรวจ anchor/revision, archive hash, ลิงก์, 44REQ/180AC/110tasks pending/77cases NOT_RUN และ SQL hash. ไม่รัน Login/DB/network/SQL/tests/runtime หรือ deploy; Important6 OPEN และ G-AUTH/H5 ไม่ถูกปิด

## Runner evidence

- sys Codex t3: reports/2026-10-23-15-20-23-sys-tier-t3-1agents-wKXDbs, 455.2s, source review พร้อมข้อจำกัด Git ที่ผู้คุมแก้หลักฐานแล้ว
- arch Codex t1: reports/2026-10-23-15-31-03-arch-tier-t1-1agents-piUklo, 334.9s, NEEDS_DESIGN_CHANGE; รับ patch แล้ว คง technical gaps ตามต้นฉบับ

## Change Log

- 2026-10-23 — ผู้คุมรับผลตรวจของเดิมและ amend แบบจาก arch ก่อน final knowledge commit; ไม่มี check verdict ใหม่

- 2026-10-24 — Change Log: ผู้คุม sync จุดอ่านและงานส่งต่อปัจจุบันจากผล arch050; คงผลรับเก่าและไม่เริ่ม implementation
