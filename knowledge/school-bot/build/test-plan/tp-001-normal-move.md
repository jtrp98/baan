# TP-001 — ทางหลักย้าย Key เดิม

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — ทางหลักบน stub)

<a id="tp001-102"></a>
## TP001-102 — ผู้ดูแลย้าย A ไป B และคงกำหนดสิทธิ์ A

ระดับ: normal

ชนิดการตรวจ: host component/integration บน doubles · BE-005/BE-007 · อ้าง AC-035-01 (ผู้ไม่มีสิทธิ์ปลดไม่ได้), AC-035-02 (B ใช้ Key เดิมทันที), AC-035-03 (B ต้องออนไลน์ครั้งแรก), AC-035-04 (A ออนไลน์ไม่ต่อสิทธิ์), AC-035-05 (A offline ใช้ถึงกำหนดเดิม) · DES-002 Rev4

Setup: server หนึ่ง host/process สอง service/adapter instances; แยกรอบ memory object เดียวกับ file store สอง object directory เดียว reader ที่สาม/file reopen; Desktop A/B สอง component instances ในอีก process คนละ secure-storage namespace/P-256 key/network switch; clocks/signer ทดสอบตาม H-LIC T=2026-11-03T00:00:00Z, License active S1 หนึ่งใบ ExpiresAt=T+10 วัน; A activate สำเร็จที่ T มี checked_at=T/exp=E=T+259200s แล้ว offline, B สะอาด; P1 staff_admin+license_admin active, P2 staff_admin ไม่มี license_admin ทุก unbind ใช้ If-Match สดและ reason=fixture:move ไม่มี race/barrier/fault

| ลำดับ / AC | ขั้นตอนและ response + persisted state ที่คาด |
|---|---|
| 1 / AC-035-01 | T+3600s P2 unbind →403 STAFF_ROLE_REQUIRED; License/binding/pointer/epoch/lease/success audit/result และ local A/B คงเดิม |
| 2 / AC-035-02 | P1 unbind A →200; A.DetachedAt=เวลา commit, pointer=null, epoch=e+1, live=0 เก็บประวัติและ lease A=T/E เดิม พร้อม audit actor/reason/result atomic ไม่เพิ่ม License |
| 3 / AC-035-03 | B offline ใส่ Key เดิม →locked แจ้งต่ออินเทอร์เน็ต server calls=0, local B ไม่มี accepted lease; B online activate ทันทีเวลาเดียวกัน →200, live=1/pointer=B, binding epoch=e+1, entitlement jkt=B, checked_at=T+3600s/exp=min(checked_at+259200,License.ExpiresAt); local B publish token/key/anchor atomic ก่อน valid |
| 4 / AC-035-05 | A offline เปิดใหม่ T+1 วันและ T+4 วันบน storage เดิม →ก่อนหมด valid หลังหมด locked แจ้งต่ออินเทอร์เน็ต; local A checked_at/exp=T/E ไม่เลื่อนเพราะย้าย/restart; server A detached คง T/E, B live เดิม |
| 5 / AC-035-04 | ใช้ fixture ย้ายใหม่ตามลำดับ 1–3 เพื่อให้ A ยังไม่หมด E; T+7200s เปิด network A แล้ว validate →403 BINDING_REVOKED ไม่มี token; server เท่า baseline หลัง B ผูก (ยกเว้น nonce) ไม่เปลี่ยน lease A/B; local A persist denied/invalidate cache แล้ว restart offline ยัง locked |

ทุกขั้นยืนยัน LicenseId/Key/ExpiresAt เดิม มี License หนึ่งใบ ไม่เพิ่มอายุ A ไม่ต้องรอ E ก่อน B activate ไม่เก็บ Key/token/private key เต็มในหลักฐาน ผลจริง NOT_RUN

ระดับ: full — TP001-009 stale/missing If-Match/unbind race ตาม AC-035-01/02/04; TP001-010 ขอบ E ตาม AC-035-05; TP001-088 copy ตาม AC-035-03

## หลักฐาน

- [REQ-035 (ปลดเครื่องและย้าย Key เดิม)](../../modules/app-shell/shared/requirements/req-035.md), [DES-002 Rev4](../design/des-002.md)
- [H-LIC/H-OBS/H-GATE](traceability-001-license-host-setup.md), [pack BE-005/BE-007](traceability-001-license-host-pack.md)
