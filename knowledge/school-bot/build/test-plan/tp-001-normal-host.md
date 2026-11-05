# TP-001 — ทางหลักสิทธิ์ในเครื่อง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — ทางหลักบน stub)

ใช้ H-LIC: server หนึ่ง host/process สอง service/adapters ใช้ memory store object เดียว หรือ file store สอง object directory เดียวแยกรอบ; Desktop A component หนึ่ง instance ในอีก process ผ่าน network double มี secure-storage double namespace A ที่คงข้อมูลข้ามการสร้าง instance ใหม่ ใช้ P-256 key ของ A, fake wall/monotonic clocks และ test ES256 signer ที่ตรวจจริง อ่าน server ผ่าน adapter ที่สาม/file reopen ไม่มี injected exception/barrier ใช้ T=2026-11-03T00:00:00Z, License.ExpiresAt=T+10 วัน, E=T+259200s ทุกผลจริง NOT_RUN

<a id="tp001-099"></a>
## TP001-099 — ครั้งแรก offline ยังเข้าโหมดหลักไม่ได้

ระดับ: normal

อ้าง AC-034-01 (ต้องตรวจออนไลน์ครั้งแรก) · BE-007 · DES-002 Rev4

Setup: A มี device key แต่ไม่มี entitlement/anchor/binding ปิด network switch ก่อนกรอก Key ถูกต้อง ไม่จำลอง server ล่ม

ขั้นตอน: กรอก Key แล้วขอเข้า Block/Arm/Code ทั้ง Guest และ Login บน host component; สร้าง A ใหม่ด้วย storage namespace เดิม

Response: host locked แจ้งต่ออินเทอร์เน็ต; server calls=0 จึงไม่มี HTTP response; หลังสร้าง instance ใหม่ยัง locked

Persisted state: server License/binding/lease/audit/result คงเดิม; local ไม่มี accepted token/checked_at/exp/anchor generation ไม่มี ready state หรือ engine start

ระดับ: full — TP001-002 ตรวจ Key ผิดและ credential-store write fail ตาม AC-034-01/02

<a id="tp001-100"></a>
## TP001-100 — เปิดซ้ำ offline ไม่ต่อสิทธิ์และหมดแล้วต้อง online

ระดับ: normal

อ้าง AC-034-03 (ภายในสามวันและเปิดซ้ำไม่ต่อ) และ AC-034-04 (หมดสิทธิ์แล้ว offline ใช้ไม่ได้) · BE-007 · DES-002 Rev4

Setup: A activate ออนไลน์ที่ T ได้ 200 และ publish token/key/anchor สำเร็จ จากนั้นปิด network ใช้ storage เดิมตลอด หุ่น idle ไม่มี fault

ขั้นตอน: เปิด A ที่ T+1 วัน ปิดแล้วสร้าง A ใหม่ที่ T+2 วัน; จากนั้นสร้างใหม่ที่ T+4 วัน ไม่ใช้ E−1/E/E+1

Response: ก่อนหมด valid เข้าโหมดหลักสามโหมดได้; T+4 วัน locked แจ้งต่ออินเทอร์เน็ต ไม่มี server call ขณะ offline

Persisted state: server LastCheckedAt=T/LastEntitlementExpiresAt=E และ binding/pointer/audit/result เดิม; local checked_at=T/exp=E ทุก restart, anchor high-water เดินตามเวลาได้แต่ไม่เริ่ม lease ใหม่; หลัง E ไม่เกิด engine start ใหม่

ระดับ: full — TP001-003 ตรวจขอบ E, expiry สั้น, clock rollback และหุ่น busy ตาม AC-034-03/04

<a id="tp001-101"></a>
## TP001-101 — ผล inactive ออนไลน์มีผลเหนือ lease เดิม

ระดับ: normal

อ้าง AC-034-06 (ไม่ใช้ cache ข้ามผลปฏิเสธ) · BE-007 · DES-002 Rev4

Setup: A valid lease T/E; T+1 วัน P1 staff_admin+license_admin revoke บน server สำเร็จ เก็บ baseline หลัง revoke ไม่มี request ค้างหรือ fault

ขั้นตอน: A online ตรวจ Key เดิมด้วย proof ถูกต้อง จากนั้นปิด network และสร้าง A ใหม่บน storage เดิม

Response: server 403 LICENSE_INACTIVE ไม่มี token; host denied/locked ทันทีและหลัง restart เข้า Block/Arm/Code ไม่ได้แม้ยังไม่ถึง E

Persisted state: server lease/domain/success audit/result เท่า baseline หลัง revoke; local persist denied/invalidate accepted cache ไม่เลื่อน checked_at/exp ไม่ publish valid generation ใหม่

ระดับ: full — TP001-004 ส่วน unknown 403/malformed/signature/network/write fault และ TP001-088 tamper/copy ตาม AC-034-02/06

## หลักฐาน

- [REQ-034 (ตรวจออนไลน์และสิทธิ์สามวัน)](../../modules/app-shell/shared/requirements/req-034.md)
- [H-LIC/H-OBS/H-GATE](traceability-001-license-host-setup.md), [DES-002 Rev4](../design/des-002.md)
