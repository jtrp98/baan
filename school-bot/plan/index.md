# SchoolBot — แผนงานปัจจุบัน

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## Release Scope

ขอบเขตถูกตรึงไว้ที่ระบบเต็ม 44 REQ (ข้อกำหนด) / 187 AC (เกณฑ์ตรวจรับ) / 82 กรณีทดสอบ TP001-082 รวม [AC-036-06 (logout และความล้มเหลวอย่างปลอดภัย)](../requirement/req-036.md) ตาม [กรณีทดสอบ logout](../test-plan/tp-001-amendment-005.md) เป็นพฤติกรรมเดิมตามคำสั่งผู้ใช้ 2026-10-28

แผนมี 110 งาน ได้แก่ 74 งานด้านล่างและ [36 งานส่วนต่อ](extension/index.md) รวม 8 ระยะ/17 เงื่อนไขอนุมัติ การเพิ่มหรือลดขอบเขตต้องเป็นคำสั่งผู้ใช้ ดู [ขอบเขตแผน](scope-001.md) และ [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../requirement/decisions-042.md)

## Waiting on Human

- ผู้ใช้ส่ง [ชุดส่งต่อเจ้าของระบบ](owner-packet-001.md) ให้เจ้าของ HTTP API Gateway (`sb-api-gateway`), Light, infrastructure, SchoolBot gRPC service และ Backend for Frontend (BFF) เพื่อคืนผล review implementation และ H5 (เงื่อนไข route/env/network/trust) การพัฒนา Gateway ได้รับอนุญาตตาม [มติ 046 (Gateway dev และระยะเวลา replay ของ License)](../requirement/decisions-046.md) แล้ว ไม่ขออนุญาตซ้ำ
- เจ้าของ Gateway/infrastructure ตอบ H1; เจ้าของ DB/infrastructure ตอบ H2 เรื่อง privileges และ `license_admin`; ผู้ถือ certificate ตอบ H4 เรื่อง pins/custody; เจ้าหน้าที่คุ้มครองข้อมูล (DPO) ตอบ H5
- ผู้ดูแล Master DB ส่ง TR-AUTH-03/04 (หลักฐานบัญชีเดิม); เจ้าของ legacy ตอบ TR-AUTH-06 (หลักฐานระบบเดิม); เจ้าของรายชื่อผู้เรียนยืนยัน GAP-AUTH-006 (ช่องว่าง roster) ข้อรอนี้ผูกกับ QA ของจริง ไม่ขวางงานบน stub
- ผู้ใช้ส่ง DB cover ให้เจ้าของ DB แล้วให้เจ้าของคืน EV-01..03 (schema metadata), EV-04/05 (linkage และ hash-format counts) ตามลำดับ ส่วน EV-06 (student aggregate) เป็นทางเลือก ยังไม่มีหลักฐานว่าส่งหรือได้รับแล้ว
- ผู้ใช้หรือทีมอุปกรณ์ตอบ spec Q3 เรื่องรุ่นหุ่น firmware, calibration และ stop/unplug/emergency พร้อมคำสั่งอนุญาตทดสอบหุ่นจริง ซึ่งยังไม่ได้รับอนุญาตตาม [มติ 038 (ผู้อนุมัติและเกณฑ์ตรวจรับ)](../requirement/decisions-038.md)
- ผู้ใช้ระบุผู้ถือ certificate และช่องทางแจกจ่าย พร้อมหลักฐาน security/SQL/runtime ตาม [เงื่อนไขอนุมัติ](gates-001.md)

[UX-005 (เตรียม UX admin หลักสูตร/คลังข้อสอบ)](extension/index.md)/007 (UX ผู้ดูแลหลักสูตร/ข้อสอบและการสอบ/เลื่อน Level) รวมข้อความหมดเวลา Q39–Q46 ได้รับอนุมัติตาม [มติ 043 (อนุมัติ UX และยืนยัน runner)](../requirement/decisions-043.md) วันที่ 2026-10-26 แล้ว

Guest, Level, ข้อสอบ, สูตร, mapping, Learner แบบ A, แบบ H4 และพาธ legacy ตอบแล้ว เช่นเดียวกับ SchoolBot เป็นหนึ่ง service ผ่าน Gateway, gRPC/035/cType และ expired attempt แบบ A ตามมติ 042 จึงไม่ถามซ้ำ

## Phases

| Phase | ขอบเขต | Tasks | Effort* |
|---|---|---:|---:|
| P0 | ฐานและเตรียม gates | 15 | 27 |
| P1 | DB integration | 5 | 8 |
| P2 | License | 5 | 9 |
| P3 | Login/Projects | 16 | 30 |
| P4 | Labs/native | 14 | 27 |
| P5 | Learning | 42 | 83 |
| P6 | Packages/acceptance | 11 | 21 |
| P7 | ส่งมอบ | 2 | 2 |

ระยะไม่ใช่เงื่อนไขที่ต้องเสร็จพร้อมกันทั้งหมด งานเปิดตาม dependency ของตน Effort รวม 207 person-days ไม่ใช่กำหนดส่ง ดูข้อที่ยังไม่ยืนยัน

## Tasks

ตาราง Task | Name | Owner | Phase | Depends | Status ทั้ง 74 งานแยกเพื่อให้อ่านจบในแต่ละไฟล์:

- [งานฐานระบบและหน้าจอเริ่มต้น](index-foundation.md): 38 งาน ตั้งแต่ [SA-001](index-foundation.md) (ทบทวนสัญญาระบบและการอัปเดต) ถึง [FE-007](index-foundation.md) (ทำ Block Lab)
- [งานการเรียนและส่งมอบ](index-delivery.md): 36 งาน ตั้งแต่ [FE-008](index-delivery.md) (เชื่อมต่อและ profile หุ่น) ถึง [PM-002](index-delivery.md) (รวบรวมหลักฐานส่งมอบ)
- [งานส่วนต่อ](extension/index.md): อีก 36 งานของขอบเขตเดิม

Owner ใช้ role เดิม: sa = arch, ba = spec, be = sys, fe = front, dba = vault, tp = inspect, qa = check, sec = jpo, ux = int, pm = gm ค่า Depends คงเดิม แสดง dependency แบบย่อ เงื่อนไขอนุมัติเต็มอยู่ในข้อมูลแต่ละงาน

`pending` คือรอทำ; `done-local` คือโค้ดและ automated tests ผ่านในเครื่องหลังนายช่างทดสอบซ้ำ ยังไม่ปิดเงื่อนไขอนุมัติ; `verified` และ `blocked` มาจาก check ผ่านนายช่างเท่านั้น

งานความเสี่ยงสูงตรวจทันที ก่อนงานต่อยอด งานความเสี่ยงต่ำตรวจรับเป็นกลุ่มตาม dependency รายละเอียดบริหารงานอยู่ใน memory

## ยังไม่ยืนยัน

ประมาณการ 207 person-days เป็นสมมติฐาน ยังไม่ได้ยืนยันเป็นกำหนดส่ง

## หลักฐาน

- [หลักฐานสถานะงาน](index-evidence.md) แยกจากตาราง โดยคงผลเดิม
- plan/tasks-001.json (memory) กำหนด risk/wave ของ DB, License, Login และ Projects เป็น 5 กลุ่ม และการตรวจแผนโดยเครื่องมือผู้คุม; plan/dispatch-001.md (memory) เก็บลำดับ dependency
- plan/queue-007.md (memory): ตรวจ 63 งาน พบพร้อมในเครื่อง 21 งาน พร้อมบางส่วน 5 งาน และรอ 37 งาน; planning/task-091.md (memory) ต่อจาก 090
- Logout ผ่านเฉพาะ local ตาม SchoolBot gRPC และ Gateway controller ตาม [มติ 050 (ใช้ controller convention ของ Gateway)](../requirement/decisions-050.md); planning/check-092-grpc-r3-001.md (memory) 2234 ผ่าน/0 ตก และ planning/jpo-092-logout-r4-001.md (memory) ปิด SEC001-016 เฉพาะ local; full Login/H5/production ยังไม่พร้อม [BE-006 (ทำ Login และ session)](index-foundation.md)/[BE-039 (ทำ web-principal/BFF/session และ staff bootstrap)](extension/index.md) ลงส่วน local ใน JSON แล้ว รอ full integration ก่อน verified
- การตรวจนำร่อง SB-W1 จบแล้ว 4 งาน verified; planning/pilot-093-metrics-001.md (memory) เก็บผลวัด; SB-W2 ทำบน stub ได้
- DB cover: db/db-safe-evidence-cover-001.md (memory)
- Legacy clone 2026-10-26 branch release/beta: `C:/src/schoolbright/target/sb-web-academic`; 13 ไฟล์ใน legacy-source-check-001 (memory) hash ตรงกับ `C:/src/sb-web-academic-dev-1` จึงยังใช้หลักฐานเก่าได้
