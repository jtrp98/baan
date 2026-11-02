# SchoolBot — โครง release runbook

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้เป็นโครงเตรียมหลักฐานของ [PM-001](index-delivery.md) (ตรวจความพร้อมเผยแพร่) ยังไม่พร้อมใช้รันจริง และไม่มีการอนุมัติ SQL/deploy จากการจัดทำเอกสาร

| ลำดับ | สิ่งที่ต้องพร้อมและผู้เตรียม | จุดหยุดและ rollback |
|---|---|---|
| 1 | check/jpo ส่ง AC และผลตัดสิน, Release Candidate (RC) hashes, security retest/การรับความเสี่ยง; gm ตรวจ G-QA (เงื่อนไขตรวจรับ) และ G-SEC (เงื่อนไขความปลอดภัย) | ขาดหลักฐานให้หยุด ไม่ประกาศความพร้อม |
| 2 | vault รวม revision/hash ของ SQL และ rollback จาก [DBA-002 (เตรียม DDL ฐานข้อมูลหลัก)](index-foundation.md)/004/005/006/007 (งานฐานข้อมูลหลัก/โครงงาน/การเรียน/เผยแพร่/ข้ามฐาน), ผล test/catalog/restore และ backup target; sys ระบุ compatibility และการหยุด worker | ยังไม่มี human execution receipts ห้ามกรอกผลสมมติ |
| 3 | sys จาก [BE-023](index-delivery.md) (ชุด deploy API)/[BE-039](extension/index.md) (web-principal/BFF/session และ staff bootstrap) กับเจ้าของ infrastructure เตรียม route/env/network/web-principal/secret refs, รายชื่อ staff_admin จากคน และคำสั่ง rollout/health/rollback จริง รวม SchoolBot gRPC service กับ HTTP→RPC mapping ของ HTTP API Gateway (`sb-api-gateway`) | H5 (เงื่อนไข route/env/network/trust)/identity ไม่พร้อมให้หยุด ไม่เปิด admin หรือ export |
| 4 | gm รวมคำสั่งจริงจาก vault/sys พร้อมผู้รัน environment, backup และ rollback points ให้คนอนุมัติ G-RELEASE (เงื่อนไขเผยแพร่) เฉพาะ RC | ยังไม่มี artifact ครบ ห้ามขออนุญาตรวม คนต้องเห็น runbook ก่อน |
| 5 | มนุษย์ backup และหยุด writer/worker ตามแผนที่อนุมัติ จากนั้นรัน SchoolBot DB SQL ตาม vault | catalog/constraints ไม่ตรงให้หยุด ใช้ rollback/restore ที่ vault ตรวจพร้อมผลกระทบข้อมูล ห้ามเดาคำสั่ง drop กับข้อมูลจริง |
| 6 | มนุษย์ rollout API/worker, Gateway introspection/BFF/Next.js admin/web-system และ SchoolBot gRPC service ตาม compatibility order ที่ sys ระบุ พร้อม health/rollback ของ Gateway และ service | health/auth/license/four-eyes/การปิด v1 ไม่ผ่านให้ rollback app/config ตาม sys คนตัดสิน DB restore |
| 7 | คนยืนยันเงื่อนไขย่อยของ export ครบก่อนเปิด grade write ไม่ GRANT หรือเปลี่ยน schema School/PGGradeDB | export มีปัญหาให้หยุด worker/กัน write ตรวจ durable receipts และ reconcile owned cells ไม่ล้างคะแนนครู |
| 8 | คนเผยแพร่ signed Desktop/assets ตาม RC/hash และ approved delivery; smoke OS/hardware ตามสิทธิ์จริง | ถอนการแจก/ย้อน app ตาม signed plan คง Guest/Cloud data ไม่ลบประวัติ |
| 9 | [PM-002](index-delivery.md) (รวบรวมหลักฐานส่งมอบ) เก็บ deployment/publication/SQL/smoke และ receipts ผู้ตรวจรับที่เกิดจริง | ขาด receipt หรือผู้ใช้ไม่ยอมรับ ยังไม่ released |

คำสั่ง deploy ย่อยและ rollback ที่รันได้ต้องมาจาก engineers ก่อนปิด PM-001 ไม่แต่งคำสั่ง ผู้รัน หรือวันอนุมัติแทนคน ฐาน SchoolBot แยกจากสี่ฐาน legacy และใช้บัญชี School/PGGradeDB เดิม การประกอบ runbook ไม่อนุญาตให้ execute

sys ต้องเตรียมลำดับ rollout จริงก่อนคนอนุมัติ ไม่เดาลำดับหรือใช้ direct public SchoolBot service/HTTP relay fallback ส่วน HTTP Login เดิมของ Gateway แยกขอบเขต H5/Light/trust/tenant และ Gateway/gRPC/DB runtime ยังต้องมีหลักฐาน

## หลักฐาน

- โครงเดิมจัดทำ 2026-10-23; SQL: db/schoolbot_db.sql และ db/schoolbot_db_rollback.sql (memory)
- แหล่งสัญญาเดิม evidence-002.md (memory), มติ 025..034 ใน [ทะเบียนมติ](../requirement/decisions.md) และ [Gateway integration](../design/gateway-integration-001.md) Rev3; ผล local tests 4032 ไม่แทน integration
- งานนี้จัดรูปแบบ ไม่ execute

- ต้นฉบับขั้นตอน 1 อ้างฐาน 180 AC จำนวนปัจจุบันใช้ [แผนหลัก](index.md) และเกณฑ์ที่ตรึงไว้ของงานนั้น ไม่เปลี่ยนเกณฑ์ตรวจรับด้วยการจัดรูปแบบ
