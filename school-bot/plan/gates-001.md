# SchoolBot — เงื่อนไขอนุมัติและสิ่งที่รอผู้ใช้

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)


## วิธีใช้

รายงาน Waiting on Human ก่อนงาน agent เสมอ รายการนี้ระบุสิ่งที่ต้องได้ ไม่ใช่บันทึกว่าอนุมัติแล้ว ผู้เตรียมเป็น role ผู้ตัดสินต้องเป็นมนุษย์จริงที่มีอำนาจ ชื่อ/วันที่/revision/ขอบเขตคำอนุญาตบันทึกจากคำตอบจริงเท่านั้น [BA-004 (กำหนดเกณฑ์ส่งมอบ)](index-foundation.md) เตรียมรายชื่อเจ้าของการตัดสินที่ยังขาดให้ผลิตภัณฑ์ระบุ

คง 17 gate IDs นิยาม description/refs/close_evidence ฉบับเต็มอยู่ใน JSON ที่ระบุในหลักฐานท้ายไฟล์ ใช้ร่วมกับตารางนี้ ก่อนเริ่มส่วนที่พึ่ง gate ต้องมี artifact และหลักฐานการตัดสิน/ผลตรวจครบ การรับแผนไม่ปิด gate และแต่ละระยะไม่ต้องรอพร้อมกันทั้งหมด

## Waiting on Human

- [ฐานระบบและ UX เริ่มต้น](gates-001-core.md): 9 เงื่อนไข ตั้งแต่ฐานข้อมูลหลักถึง UX ห้องทดลอง
- [การเรียน ฐานข้อมูล และเผยแพร่](gates-001-release.md): 8 เงื่อนไข ตั้งแต่ UX การเรียนถึงอนุมัติเผยแพร่

## ประเด็น update ที่ต้องปิดก่อน contract

[SA-001](index-foundation.md) (ทบทวนสัญญาระบบและการอัปเดต) อ้าง [DES-007 (Release และ trusted update)](../design/des-007.md) และ [REQ-030 (ตรวจข้อมูลอัปเดตจาก Desktop)](../requirement/req-030.md): แบบมี PrepareUpdate/InstallPreparedUpdate แต่ [BE-019 (ทำการตรวจอัปเดตและ Prepare/Install)](index-delivery.md) มี coverage check-only ให้ SA เสนอตาราง requirement/design/decision coverage และ disposition ไม่ตั้งข้อสรุปว่าต้องเพิ่มหรือตัด workflow เอง

ถ้าเป็น technical/design clarification ให้ SA เตรียมแก้ในเขตตนผ่านผู้คุม ถ้าต้องเปลี่ยน requirement หรือเป็นทางเลือกธุรกิจให้ BA/ผู้ใช้ตัดสิน ถ้าเปลี่ยน frozen release scope ต้องมีคำสั่งผู้ใช้ PM amend แผนหลังคำตัดสินจริง ไม่ใช้ gate เป็นสิทธิ์เพิ่ม scope

## กฎหลักฐาน

vault (ผู้ดูแลแบบและหลักฐานฐานข้อมูล) ไม่รัน SQL ตรวจเฉพาะ scripts และ human-provided execution/catalog evidence การอนุมัติ SQL ไม่เท่ากับรัน SQL; test DB ไม่เท่ากับ shared environment ต้องมี revision/hash/environment/ผู้รันจริง และ expected/actual ของ constraints/rollback ที่เกี่ยวข้อง

Hardware gate ต้องมีคำสั่งอนุญาตกรณีจริงก่อน motion/upload/torque ไม่ใช้ dry-run หรือ OS write success ยืนยันตำแหน่ง/การหยุด การทดสอบจาก source build และจาก signed installer เป็นคนละหลักฐาน

Critical/Important security ต้องส่งคนทุกข้อ Critical QA หรือ fail ครั้งสามต้องหยุดส่งคนตัดสิน แก้ซ้ำสูงสุดสองรอบต่อ task แล้วให้คนเลือกยอมรับ/re-scope/drop ไม่มี agent ลงนามหรือเปลี่ยน scope แทน

แยกมติที่ยืนยันแล้วจากหลักฐานค้างตามหลักฐานท้ายไฟล์; export G-PARITY/COEXIST/TARGET/AUTHZ/DB เป็น preconditions ย่อยใต้ G-LEARN-DB เฉพาะงานเขียนเกรด คง 17 gate IDs

## เงื่อนไข transport

G-AUTH (รับรองบัญชีและการเชื่อมต่อระบบเดิม) และ H5 (เงื่อนไข route/env/network/trust) ไม่ถาม gRPC/035/cType ซ้ำ ยังรอ contract/RPC กับ HTTP mapping, auth/tenant trust และ Light implementation review ไม่เพิ่มเงื่อนไขอนุมัติหรือคำถามธุรกิจ

## หลักฐาน

- evidence-002 (memory) Rev2 และฉบับ 051; Gateway integration Rev3; ผล local tests 4032 ไม่ปิดเงื่อนไข Gateway/gRPC/DB
- การย้ายผู้รับผิดชอบเงื่อนไขไปงานเชื่อมของจริง 2026-10-29 คงสิทธิ์ให้งานอื่นทำบน stub; UX ปิดตามคำยืนยันผู้ใช้ในวันเดียวกัน


- ประเด็น update: planning/review-001 (memory)

- นิยาม description/refs/close_evidence: plan/tasks-001.json (memory)

- ข้อที่ตอบแล้ว: [OQ-014 (สูตรคะแนนรวมและการแปลงคะแนน)](../open-questions/oq-014.md) และ [OQ-016 (สิทธิ์และขอบเขต mapping คะแนน)](../open-questions/oq-016.md) ซึ่งต้นฉบับเขียน OQ014/016 และ Learner แบบ A ตามข้อความเดิม ไม่ถามซ้ำ
