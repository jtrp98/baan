# DES-004 — Persistence และ cache authority

> Rev 13 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (มติ 052 — อายุ Desktop session นับจากเวลา bind)

ส่วนต่อของ [DES-004 (ตัวตนและสิทธิ์)](des-004.md) กำหนดจุดตรวจสิทธิ์ก่อน commit และแหล่งความจริงของ backing store

## ตรวจข้ามฐานข้อมูลก่อน commit

เนื่องจาก `SchoolBotSession` อยู่บน SchoolBot DB ส่วนข้อมูลโปรไฟล์และสิทธิ์วิชาอยู่บน School DB จึงไม่มี transaction เดียวครอบข้าม DB; ทุก mutation ต้อง re-check สถานะโปรไฟล์/สิทธิ์ครูหรือผู้ดูแลจาก School DB และตรวจสถานะ session/License ใน SchoolBot DB ณ จุดก่อน commit เพื่อไม่ปล่อย in-flight commit ที่หมดสิทธิ์แล้ว

**ขอบเขต Persistence Boundary ร่วมและ Cache Authority ของ Adapter ([มติ 051 (บันทึก Project และ Revision ในหน่วย commit เดียว)](../../shared/decisions/decisions-051.md) / project-commit-proposal-001 (memory)):** คงการตรวจซ้ำสิทธิ์/tenant ข้าม DB ณ จุดก่อน commit และการบันทึก `SchoolBotSession` + `SchoolBotIdempotency` + `SchoolBotAuditEvent` ใน SchoolBot DB transaction เดียวตามเดิม สำหรับ persistence adapter และ backing store (`ISchoolBotDbAdapter` / `ISchoolBotBackingStore` ทั้ง memory, file snapshot และ PostgreSQL) สถานะที่ผ่านจุด commit ใน backing store เท่านั้นเป็นแหล่งความจริง (authoritative) ส่วน in-memory cache และตัวนับลำดับ ID ใน adapter เป็นเพียงสำเนาหลัง commit:

1. ทุกการเขียน (ทั้ง single-write ของ `License`/`Session` และการบันทึกคู่ `Project` + `ProjectRevision` ผ่านหน่วย commit เดียว `CommitProjectAsync` ตาม [Project API และ concurrency](project-api-001.md) Rev2) ต้องอ่านสถานะ authoritative ภายใต้ lock → ตรวจบริบทสิทธิ์/tenant/`ExpectedETag` (`UpdateDate`) → สร้างชุด candidate ที่มีค่าตรงกับสิ่งที่จะเขียนจริงทุกฟิลด์ → สั่ง commit ลง backing store ให้สำเร็จก่อน → จึงค่อย publish ค่า candidate ชุดเดียวกันเข้า cache และเลื่อนลำดับ ID/คืนผล (ห้ามแก้ cache หรือเลื่อน ID ก่อน commit และห้ามคืนค่าใน cache/response ต่างจากค่าที่เขียนลง store)
2. หากล้มเหลวก่อนจุด commit ต้องคงสถานะเดิมทั้งใน store และ cache โดยไม่ทิ้งข้อมูลค้างไปติดกับการ commit ถัดไป; หากเกิดความล้มเหลวที่ไม่อาจทราบผลของจุด commit (unknown commit outcome) ต้องไม่รายงานว่าสำเร็จ, ต้อง invalidate/reload cache จากสถานะ authoritative ของ store แทนการเดาว่า rollback แล้วหรือการเขียนชดเชยทีละส่วน (ห้ามใช้ compensation write เป็นหลักประกัน atomicity)
3. การโหลดสถานะเริ่มต้นเข้า cache (`EnsureLoadedAsync`) ต้องอ่านทุกชุดให้ครบในตัวแปรพัก (staging) ก่อนสลับเข้า cache และตั้งค่าเริ่มต้นครั้งเดียว เพื่อไม่ให้การโหลดที่ล้มกลางคันทิ้งข้อมูลครึ่งชุดหรือเกิดรายการซ้ำเมื่อเรียกซ้ำ

## หลักฐาน

- [มติ 027 (แยก SchoolBot DB จากฐานเดิม)](../../shared/decisions/decisions-027.md) และ [มติ 051 (บันทึก Project + Revision เป็นหน่วยเดียว)](../../shared/decisions/decisions-051.md)
- [Project API Rev2](project-api-001.md) และ project-commit-proposal-001 (memory) เป็นข้อกำหนดหน่วย commit ร่วม ไม่เปลี่ยน schema หรืออายุ session
