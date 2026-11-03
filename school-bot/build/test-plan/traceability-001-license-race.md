# ลำดับและผลตรวจ TP001-083 — ป้องกัน validate ย้อน unbind

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — regression ของ BE-003/BE-004)

ส่วนบังคับของ [TP001-083 — validate/activate ที่ค้างต้องไม่ย้อน unbind](tp-001-cases-license-3.md#tp001-083) ผูก AC-028-01 (activate ซ้ำ/จำกัดหนึ่งเครื่อง), AC-028-02 (validate หลัง activate) และขอบเขต BE-003 (unbind สำเร็จคงประวัติ detached) ใช้ [S-LIC/S-OBS/S-GATE](traceability-001-license-setup.md) และ DES-002 (License/device binding) Rev4 ทั้งสามฉบับกับ transaction Rev12 ที่ระบุใน case
ขั้นตอนและผลที่คาด:

| ชุดตรวจ | จุดพักและลำดับ | Response และ persisted state |
|---|---|---|
| validate commit หลัง unbind | พัก A validate หลังอ่าน/proof ก่อนเข้า store lock; อีก service ให้ P1 unbind ด้วย If-Match ล่าสุด ไม่ระบุ next_device_jkt ได้ 200; อ่าน snapshot หลัง unbind แล้วปล่อย validate | validate→403 BINDING_REVOKED ไม่ออก entitlement; live=0, pointer=null, epoch=e+1, DetachedAt เท่าหลัง unbind ไม่ย้อน null; LastCheckedAt/LastEntitlementExpiresAt/audit/idempotency เท่าหลัง unbind ไม่มี success ของ validate |
| activate เครื่องเดิม commit หลัง unbind | fresh fixture พัก A activate เส้นทางต่อ lease หลังอ่าน/proof ก่อน lock; unbind 200 แล้วปล่อย; จากนั้น A ขอ challenge ใหม่ activate อีกครั้ง; B activate ด้วย challenge ของ B | activate ที่ค้าง→403 BINDING_REVOKED; A คำขอใหม่→409 DEVICE_LIMIT ไม่มีแถวใหม่/audit success/token; B→200 ทันที live=1 pointer=B-binding epoch=e+1; A-binding ยัง detached และ lease เก่าไม่เปลี่ยน |
| ให้ lease ชนะก่อน unbind | fresh fixture ให้ validate commit 200 ก่อน P1 อ่าน ETag ล่าสุดแล้ว unbind 200; จากนั้น A ขอ challenge ใหม่ activate | lease ที่ commit แล้วมี exp เดิมจาก commit; unbind คง lease นั้นและ detach A, live=0/pointer=null/epoch=e+1; A กลับเอง→409 DEVICE_LIMIT ไม่ต่อสิทธิ์ |
| admin อนุญาตเครื่องเดิมกลับ | ต่อจากชุดที่ B สำเร็จ ให้ P1 unbind B ด้วย ETag ล่าสุด ระบุ next_device_jkt=A แล้ว A activate ด้วย challenge ใหม่ | unbind→200, epoch=e+2; A→200 binding ID ใหม่ Epoch=e+2, live=1/pointer ชี้แถวใหม่; ประวัติ A เก่าและ B ยัง detached, AllowedNextJkt ถูกล้าง; audit/result ของแต่ละ success ครบ |

