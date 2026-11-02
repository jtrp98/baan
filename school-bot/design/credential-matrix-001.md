# SA-004 — Credential matrix

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [Matrix process และสิทธิ์](credential-matrix-001-matrix.md)

## เอกสารอ้างอิง

[SEC001-002 (การแยก credential ของ PGGradeDB ออกจาก API)](credential-matrix-001.md)

ร่างเพื่อ SEC001-002 และ [export proof pack](export-proof-pack-001.md); สถานะที่ [index](index.md). ไม่เก็บค่า secret/connection string และไม่สร้างบัญชี/GRANT. Topology ยังคง client→HTTP API Gateway→SchoolBot gRPC service; worker/adapter เป็น process ภายในของบริการ SchoolBot ไม่ใช่ public API อีกตัว

## เงื่อนไขตรวจรับ matrix

เจ้าของ DB/infra เติมต่อแถว: ชื่อ LOGIN จริง (ไม่ใช่ค่า secret), database/schema, secret-key name/mount, OS/service identity, deploy unit และเจ้าของอนุมัติ. **แยกแถวเมื่อ deploy unit หรือบัญชีต่างกัน** แม้ใช้ชื่อ process/หน้าที่เดียวกัน; แถวรวม Gateway/web-system/admin หรือ worker ข้างต้นเป็นโครงรอแจกแจง ไม่ใช่หลักฐานว่าใช้ identity เดียวกัน

คอลัมน์สิทธิ์ที่มีผลจริงต้องระบุ SELECT/INSERT/UPDATE/DELETE/DDL แยก schema/table พร้อมที่มาจาก direct grants, inherited roles ทุกทอด, PUBLIC และ role ที่สวมผ่าน SET ROLE ได้; ตรวจ ownership ของ database/schema/table/function, superuser/BYPASSRLS และผลต่อขอบเขตที่อ้างด้วย. รวม EXECUTE ของ functions ที่เกี่ยวข้อง (ระบุ schema/name/signature, ผู้เป็น owner, SECURITY INVOKER/DEFINER และสิทธิ์อ่าน/เขียนที่เรียกผ่านได้). แนบหลักฐาน effective privileges ผูกบัญชี/ฐาน/environment/เวลาตรวจและ evidence_ref; ช่องที่ยังไม่ตรวจให้ระบุว่าไม่ทราบ ห้ามสรุปจาก grants ตรงเพียงอย่างเดียว. ถ้าใช้บัญชีกว้างให้ระบุส่วนเกินจริง ไม่เขียนคำว่า read-only จากความตั้งใจของ query. `db/schoolbot_db.sql` ไม่มีการสร้าง role หรือกำหนดสิทธิ์ฐานข้อมูลตามคำสั่งผู้ใช้ 2026-10-26; ต้องระบุสิทธิ์จริงจากบัญชีที่ deploy แทนการอนุมานจาก DDL

PG preview/confirm และ write ต้องผ่าน worker/adapter ภายในทั้งคู่เพื่อให้ SchoolBot gRPC service API ไม่มี PG credential จริง ตาม security-mitigation-001 MUST-1..5. ช่องภายในต้องมี peer authentication/private exposure, ไม่รับ arbitrary SQL/URL/ปลายทาง/SchoolId จาก client; tenant/actor มาจาก session ที่ SchoolBot gRPC service ตรวจและ adapter ตรวจ context ซ้ำ. วิธี peer auth/host/TLS รอเจ้าของตาม H5 (เงื่อนไข listener/TLS/peer/private ingress และ trust ระหว่างระบบ) ไม่เลือกแทน. แยก process อย่างเดียวแต่ใช้ secret mount ร่วมไม่ถือว่าผ่าน

หลักฐานต้องมี config **ชื่อ key เท่านั้น**, composition-root registration ของสอง process, negative DI test, cross-tenant tests, receipt/reconcile และตัวอย่าง log ที่ไม่มี password/hash/token. การพิสูจน์บัญชีจริง/ฐานทดสอบให้เจ้าของดำเนินการภายใต้ gate เดิม; เอกสารนี้ไม่อนุญาต connection หรือ SQL

## ทางเลือกและสิ่งที่ส่งคน

เลือกแยก process/config โดย reuse adapter/outbox เดิม; ปัดตกการซ่อน SchoolBot gRPC service หลัง HTTP API Gateway หรือ query filter เป็นเหตุอ้างว่า credential แคบลง. บัญชี read-only ที่มีอยู่แล้วเป็นทางเลือกถ้าเจ้าของยืนยันว่ามี; ไม่สร้าง role/GRANT ใน School/PGGradeDB สวน [มติ 029 (ไม่เพิ่ม GRANT ใน School DB/PGGradeDB)](../requirement/decisions-029.md). ถ้าแยก secret/process ไม่ได้หรือบัญชียังกว้าง ให้เจ้าของ DB/infra ระบุข้อจำกัดให้ jpo ประเมินก่อนส่งผู้มีอำนาจรับ residual เป็นลายลักษณ์อักษร; ไม่รับความเสี่ยงแทนคน

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.
