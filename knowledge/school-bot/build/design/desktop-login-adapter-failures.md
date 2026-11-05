# Desktop login adapter — Error mapper, timeout และ retry

> Rev 5 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [Desktop adapter](desktop-login-adapter-001.md) ใช้ v2 envelope จาก [กฎข้อมูลและ HTTP](data-contract-rules.md): `error.code/message/request_id/details` SchoolBot สร้าง/ตรวจ request_id เอง ไม่คัดลอก error upstream ทั้งก้อน และใช้ no-store ทุก auth response

## Error mapping

| เหตุ | Public error |
|---|---|
| Input/wrong-stage/wrong-code | 400 INVALID_INPUT |
| Credential ผิด, บัญชี inactive, challenge invalid/expired/consumed | 401 UNAUTHORIZED |
| License/device/tenant/channel ไม่ผ่าน | 403 ตาม [DES-004 (ตัวตนและสิทธิ์)](des-004.md) |
| Configuration หรือ proven mapping ขาด | 503 AUTH_NOT_CONFIGURED |
| Timeout/DB/network/delivery failure/upstream 5xx/malformed หรือ contradictory response | 503 AUTH_UNAVAILABLE |
| Upstream 429 | 429 RATE_LIMITED พร้อม Retry-After |

Retry-After ใช้ header ที่ตรวจแล้วหรือ results.retryAfterSeconds หากไม่มีใช้ 60 วินาทีเป็น client cooldown ของ SchoolBot ไม่อ้างว่า Gateway reset แล้ว ไม่เผย attemptsLeft, ข้อมูลส่วนบุคคล (PII) หรือ raw errors อัตโนมัติ

## แยก public mapper จาก decoder

เมื่อ caller ยืนยันว่าเป็น Gateway web authentication operation และ decoder คืน `Rejected(403,FORBIDDEN)` ให้ future public mapper คืน `401 UNAUTHORIZED` แบบรวมโดยไม่ระบุ inactive/locked Gateway ใช้ 403 ร่วมกันและไม่มี structured discriminator พอแยกสาเหตุ ห้ามอ่าน message/messageTh เดา นี่เป็น authentication failure แบบรวม ไม่พิสูจน์ว่าบัญชี inactive

License/device/tenant/channel authorization ของ SchoolBot ยังคง 403 ห้าม remap 403 ทุกแหล่งแบบ global decoder ยังคืน Rejected(403,FORBIDDEN) ภายในตามเดิม public mapper เป็น layer ถัดไปที่ยังไม่ implement; ไม่เปลี่ยน expected outcome/tests ของ component Error อื่นคงเดิมรวม malformed/contradictory → 503 AUTH_UNAVAILABLE

เลือก generic failure เพราะข้อมูลไม่พอแยก inactive/locked และไม่ต้องขอ Gateway เพิ่ม reason เพื่อคืน error แบบรวม ข้อนี้เป็นสัญญาสำหรับ public completion ในอนาคต ไม่เปิด endpoint หรือ actor field จาก Data Transfer Object (DTO) ภายใน

## Timeout, cancellation และ retry

propagate cancellation, ไม่ follow redirect, ไม่ retry mutation อัตโนมัติแม้ timeout เพราะ Gateway อาจเพิ่ม attempts/ส่ง One-Time Password (OTP)/consume token แล้ว ผลไม่แน่นอนห้ามอ้าง rollback หรือ success เริ่มใหม่ได้หลัง action ผู้ใช้ ค่า Time to Live (TTL) และ limits ในหลักฐาน Gateway เป็น defaults ไม่ใช่ deployed configuration

## ยังไม่ยืนยัน

Deadline credential/continuation call 10 วินาทีเป็นค่าที่เสนอ ไม่ใช่ deployed configuration ของ Gateway ส่วน private introspection 3 วินาทีคงตาม [DES-012 (exchange)](des-012-exchange.md)

## หลักฐาน

- desktop-login-wire-evidence-001 (memory): `WebAuthController.cs:234–344` ใช้ 403 ร่วมหลายกรณี; fixture ที่เคยตีความ inactive ใช้การตัดสินข้างบนเฉพาะ public layer
- [Gateway outcome component](gateway-outcome-component-001.md) คง callable decoder และ internal outcomes เดิม ไม่มี request validator หรือ UUID generator เพิ่ม
