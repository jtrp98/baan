# ตารางส่งต่อ BE-005 และ BE-007 — setup/response/state

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — เตรียม pack โดยคง AC เดิม)

ทุกแถวใช้ [H-LIC/H-OBS — topology และตัวอ่าน state](traceability-001-license-host-setup.md) ครบทั้ง memory/file พร้อม [S-LIC/S-OBS/S-GATE](traceability-001-license-setup.md) ไม่ถือว่าใช้ service เดียว/store แยกแล้วครบ แถวทั้งหมด Actual=NOT_RUN ตารางนี้ระบุ expected สำหรับคัดลอกลง pack และส่ง check; ไม่ใช่ผลตรวจ implementation

## BE-005

BE-005 คือ admin ย้าย Key ครบ 3/3 AC; expiry เดิมเป็น criterion ของ task ตรวจทั้ง server และ local โดยไม่เปลี่ยน AC association

| Case → AC | Setup และจุดพัก/inject | Response + persisted state ที่คาด |
|---|---|---|
| [TP001-009](tp-001-cases-license-3.md#tp001-009) → AC-035-01 ผู้ไม่มีสิทธิ์ปลดแล้วผูกเดิม | Fixture A valid T/E; P2 ไม่มี role และ P3 ผิด channel แยก subcase; P4 ไม่มี session; เรียก unbind ด้วย ETag ล่าสุด ไม่มี fault | P2 403 STAFF_ROLE_REQUIRED, P3 403 CHANNEL_NOT_ALLOWED, P4 401; ไม่คืน entitlement; server License/Binding/pointer/epoch/lease/success audit/result คงเดิม; local A valid T/E, B ไม่มีสิทธิ์ |
| TP001-009 → AC-035-02 ย้าย Key เดิมทันที | A offline หลัง activate ที่ T; P1 unbind ที่ T+3600s แล้ว B activate ทันทีด้วย proof B; ไม่เลื่อน clock รอ E | unbind 200: A DetachedAt=เวลา commit, pointer=null, epoch=e+1, lease A คง T/E; activate B 200: live=1 pointer=B, binding B epoch=e+1, LastCheckedAt=T+3600s/expiry=min(checked_at+259200,License.ExpiresAt), audit/result atomic; License ID/key/ExpiresAt เดิม จำนวน License=1; local B publish valid, A ยังคง T/E |
| TP001-009 → AC-035-04 A ออนไลน์หลัง B ผูกแล้วไม่ต่อ | หลังแถวก่อน เปิด network A และ validate ด้วย binding/proof A ที่ T+3601s; พักก่อนส่งเพื่อตรวจ baseline หลัง B สำเร็จ | 403 BINDING_REVOKED ไม่มี token; server A LastCheckedAt=T/expiry=E, DetachedAt ไม่ย้อน, B/pointer/epoch/lease ไม่เปลี่ยน ไม่เพิ่ม success audit/result; local A denied/invalidate cache ไม่ renew และ restart offline ยัง locked |

ส่วน race ที่ BE-003/BE-004 ใช้อยู่ยังอิง TP001-083 เดิม ไม่เพิ่ม race ใหม่ใน BE-005

## BE-007

BE-007 คือ host entitlement/secure storage ครบ 8/8 AC; restart และ tamper/copy เป็น criterion ที่มีอยู่แล้ว ไม่เพิ่ม AC ใหม่

| Case → AC | Setup และจุดพัก/inject | Response + persisted state ที่คาด |
|---|---|---|
| [TP001-002](tp-001-cases-license.md#tp001-002) → AC-034-01 ครั้งแรก offline | A ไม่มี token/anchor/binding; ปิด network ก่อนส่ง กรอก Key ถูก/ผิด/revoked/expired แยก fixture | host locked แจ้งต่ออินเทอร์เน็ต ไม่ได้ HTTP response เพราะ calls=0; server คงเดิม; local ไม่มี accepted lease/checked_at/exp และ restart ยัง locked |
| TP001-002 → AC-034-01; AC-028-04 เดิม | เปิด network: Key ไม่มี/ผิด → LICENSE_INVALID; revoked/expired → LICENSE_INACTIVE; อีก fixture Active แล้ว inject local write fail ก่อน publish | denial 403 ไม่เปลี่ยน server lease/domain/success audit/result, local ไม่ ready; write fail → CREDENTIAL_STORE_FAILED, local คง generation ก่อนหน้า/ไม่มี accepted lease แม้ server activate 200 และ commit binding/lease/audit/result ไปแล้ว ต้องแสดง server commit แยกจาก host failure |
| [TP001-004](tp-001-cases-license.md#tp001-004) → AC-034-02 Active แล้วมีสิทธิ์ | A สะอาด online activate ที่ T; ไม่มี fault; ตรวจ storage ก่อน unlock และ restart offline | 200 valid พร้อม signed entitlement; server pointer=A, live=1, LastCheckedAt=T/LastEntitlementExpiresAt=E; local token/key/anchor generation เดียว checked_at=T/exp=E แล้ว valid ทั้งสามโหมด; restart คง T/E |
| [TP001-003](tp-001-cases-license.md#tp001-003) → AC-034-03 ก่อน 3 วัน/เปิดซ้ำไม่ต่อ; AC-034-04 ครบแล้วต้อง online | Fixture A valid; network ปิด; restart ที่ T+3d-1s/E-1s/E/E+1s แยก fixture ทั้ง expiry ไกล/expiry T+1d; session ค้างข้าม E ใช้ fake robot busy | ก่อน E valid; now≥E locked แจ้งต่ออินเทอร์เน็ต; server T/E ไม่เปลี่ยน; local checked_at/exp คง T/E ทุก restart, anchor high-water เดินหน้าได้ ไม่มี lease ใหม่; timer ไม่ส่งงานหลังหมด, drain/stop fake ก่อน lock |
| TP001-004 → AC-034-05 ต่อจากตรวจใหม่ | A เคย valid T/E; online validate Key เดิมที่ T1=T+3600s และอีก fixture E+1s; License ยัง active/expiry ไกล | 200, server LastCheckedAt=เวลาตรวจครั้งนี้ (T1 หรือ E+1s ตาม subcase), expiry=min(เวลาตรวจครั้งนี้+259200,License.ExpiresAt); local publish lease/anchor ใหม่ atomic ก่อน valid; replay activation request เดิมขณะ binding ยังปัจจุบันคืน checked_at/exp เดิม ไม่ถือเป็น check ใหม่ ไม่เพิ่ม binding/lease/audit ซ้ำ |
| TP001-004 → AC-034-06 denial ชนะ cache | A มี leaseก่อน E; revoke หรือ unbind ด้วย P1 แล้ว A validate; อีก subcase wrong binding/proof และ injected unknown 403; หลังตอบ restart offline | LICENSE_INVALID/INACTIVE/BINDING_REVOKED → denied/invalidate cache persist ไม่ใช้ค่าเดิมปลดล็อก; DEVICE_NOT_ACTIVATED/DEVICE_PROOF_INVALID ไม่ unlock/renew; unknown 403 locked; server device request ไม่เปลี่ยน lease/domain/success audit/result จาก baseline หลัง admin action |
| [TP001-009](tp-001-cases-license-3.md#tp001-009), [TP001-088](tp-001-cases-license-3.md#tp001-088) → AC-035-03 B ต้อง online ครั้งแรก | หลังย้าย A แล้ว B สะอาด offline ใส่ Key เดิม/คัดลอก token A โดยไม่มี private key A; จากนั้น reset B และเปิด online activate | offline B locked ไม่มี accepted lease ไม่เปลี่ยน server; online activate 200 จึงมี lease B/valid, cnf.jkt=B และ binding B; local A ไม่ถูกต่ออายุ |
| [TP001-010](tp-001-cases-license-3.md#tp001-010) → AC-035-05 A ใช้ถึงกำหนดเดิม | ย้ายตอน T+3600s ขณะ A offline; restart A ที่ E-1s/E/E+1s แยก fixture; อีกชุด A onlineหลังย้ายก่อน E | ก่อน E valid, ที่ E/หลัง E locked; server A detached คง T/E, B live ไม่เปลี่ยน; local A T/E ไม่เลื่อนเพราะย้าย/restart; online 403 BINDING_REVOKED แล้ว denied persist หยุดใช้ cache ทันที |
| TP001-088 → AC-034-02/AC-035-03 และ criterion tamper/copy | token payload แก้แต่ไม่เซ็นใหม่, copy A→B, copied protected blob เปิดไม่ได้, storage read/sign fail, anchor เสีย; ทุกชุด offline reset แยก; control A token เดิม | invalid token → INVALID_ENTITLEMENT; key/anchor ใช้ไม่ได้ → locked/recovery ไม่ fallback; B ไม่มี accepted leaseใหม่, local checked_at/exp ไม่เลื่อน; server snapshot เดิมทั้งหมด calls=0; control A valid ก่อน E |

ข้อบังคับเพิ่มเติมของ TP001-003/004/088: [negative/fault และ rollback](traceability-001-license-host-negative.md) ต้องคัดลอกไปพร้อมตารางนี้

## ช่องว่างและประตู

H-GATE แยก PostgreSQL/transport, installer/OS secure storage และ signer จริงไว้อย่างชัดเจน; test signer ไม่ปิดมติ 047 ไม่มีการยอมรับความเสี่ยงแทนคน ไม่พบ AC ที่ไม่มี case ใน 11 AC ของใบงาน; จุดที่ยังรอคือหลักฐาน runtime ของจริง ไม่ใช่เปลี่ยน requirement/design

## หลักฐาน

- ต้นฉบับ [REQ-034 — สิทธิ์ออนไลน์/ออฟไลน์](../../modules/app-shell/shared/requirements/req-034.md) และ [REQ-035 — ย้าย Key เดิม](../../modules/app-shell/shared/requirements/req-035.md)
- Revision สัญญาและมติทั้งหมดตรึงไว้ใน [H-LIC/H-GATE](traceability-001-license-host-setup.md); ไม่มีผลรัน tests หรือ DB จากใบงานนี้

- ตรวจเอกสารด้วย node - วันที่ 2026-11-03: header/encoding/ลิงก์และ anchor/coverage/ช่วง ID รวม 209 PASS, 0 FAIL; AC ครบ 11/11 ผล runtime คง NOT_RUN การตรวจนี้ไม่ใช่ verdict ของ check
