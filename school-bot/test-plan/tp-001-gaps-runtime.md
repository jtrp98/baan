# TP-001 — ช่องว่างระบบจริงและข้อจำกัดร่วม

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [แผน TP-001](tp-001.md) GAP คือช่องว่างที่มีผลต่อการเตรียมตรวจ ตารางนี้เก็บสิ่งที่ยังต้องพิสูจน์โดยไม่ถือว่าการมีสัญญาหรือ fixture ทำให้ runtime ผ่าน

| ช่องว่างและความหมาย | AC ที่เกี่ยวข้อง | ผู้รับต่อ | เกณฑ์ปัจจุบันและสิ่งที่ยังต้องมี |
|---|---|---|---|
| GAP-06 | [AC-038-05 (ครูตรวจ Arm ของนักเรียนนอกรายชื่อที่ได้รับมอบหมายหรือข้ามโรงเรียนไม่ได้…)](../requirement/req-038.md), [AC-039-02 (ครูที่มีสิทธิ์เห็นสถานะและผลตรงกับประวัติจริงของผู้เรียนที่รับผิดชอบ)](../requirement/req-039.md), [AC-039-05 (ครูขอดูรายชื่อหรือผลนักเรียนนอกที่ได้รับมอบหมาย…)](../requirement/req-039.md) | arch | TP001-058 sync + เพิ่ม TP001-079; fixture synthetic ติดป้าย test-only จนมี resolver roster/status/move/term + tenant alias proof จาก legacy/sys |
| GAP-07 | [AC-030-02 (เมื่อมี release ที่เข้าเงื่อนไข ผู้ใช้เห็น metadata…)](../requirement/req-030.md), [AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ)](../requirement/req-030.md)..08 | arch/spec | ผู้ใช้ยืนยันคง PrepareUpdate/InstallPreparedUpdate ตามมติ 036 และตรวจรับ AC ใหม่ทั้งห้าตามมติ 037 แล้ว TP001-048 ตรวจ check ที่ไม่เริ่ม prepare/install อัตโนมัติ; TP001-080 ตรวจ trust/stop/restart/rollback/cancel; เงื่อนไข G-RELEASE-DB เดิมยังต้องมีหลักฐาน |
| GAP-08 | AC-024-01 | arch | poll 3000ms/debounce 0 + drain-stop/payload bounds เข้า TP001-033/035/037/040; ค่า cadence เป็นสมมติฐาน ไม่ใช่ hardware SLA |
| GAP-09 | [AC-037-05 (เมื่อยังไม่มีหลักฐานอนุมัติเนื้อหาและเกณฑ์…)](../requirement/req-037.md), [AC-037-06 (กิจกรรมภารกิจจริงทุกโหมดอ้างกลับไปยังเนื้อหา ภารกิจ เกณฑ์…)](../requirement/req-037.md), [AC-038-01 (Code/Block ที่มีเกณฑ์ภารกิจกำหนดแล้วได้รับผลอัตโนมัติตรงกับตัวอย่างผ่านแ…)](../requirement/req-038.md), [AC-044-03 (revision ที่ไม่มีหลักฐานอนุมัติเผยแพร่ไม่ได้)](../requirement/req-044.md) | spec | ยังไม่มี signed content inventory/criteria/pass-fail pairs/ผู้อนุมัติ revision (G-LEARN, [BA-002 (Learning criteria)](../plan/index.md)/005/006) cases ใช้ synthetic fixture ติดป้าย test-only ตรวจกลไกได้ แต่ไม่ใช่การรับรองเนื้อหา; spec artifact + ผู้ใช้/ผู้ที่ระบุพิจารณา |

## การเลือกขอบเขตหลักฐาน

TP001-025–030/078 ต้องพิสูจน์ runtime ตามสัญญา Guest; TP001-058/079 ใช้ synthetic fixture จนมี resolver/roster/status/move/term และ tenant alias proof จาก legacy/sys; TP001-007 ต้องมี staff_admin/license_admin seed; hardware และ signed installer ต้องมีผู้อนุญาตและ artifact จริง; เนื้อหาเรียนจริงของ AC-037-05/06, AC-038-01 และ AC-044-03 รอ signed inventory/criteria/pass-fail pairs

ส่ง check สร้าง tests ตามระดับและ profile ที่กำหนด เลือก unit ก่อน integration เมื่อ prerequisite ยังไม่มีให้รายงานว่าติดเงื่อนไข โดยไม่แก้ expected เอง แยกหลักฐาน native/Cloud/hardware/installer และ SQL catalog runtime ออกจาก mock/static

## ยังไม่ยืนยัน

poll 3000 ms/debounce 0 และ trash sweep timer 60 วินาทียังเป็นสมมติฐาน ต้องให้ arch/เจ้าของสัญญายืนยันก่อน runtime ไม่ใช่เกณฑ์ความปลอดภัยเชิงกายภาพ ข้อขัดแย้งจำนวน constraint ของ TP001-052 เก็บทั้งสองข้อความใน [case แบบข้อมูล](tp-001-cases-release-model-2.md#tp001-052) ให้ arch/vault ตัดสินเกณฑ์ revision ที่ใช้

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · SLA = Service Level Agreement · OS = Operating System


## หลักฐาน

gap-sync-review-001.md (memory: design/gap-sync-review-001.md) เป็นที่มาของการปรับสัญญา GAP-01/02/03/04/06/08 และ SEC001-003/009; ไม่ใช่ผลปิด security finding หรือ runtime เดิมอ้าง desktopstorage.go:103 ว่ายังเป็น single-slot ข้อความนี้เป็นหลักฐานเดิมที่งานจัดรูปแบบนี้ไม่ได้ตรวจ code ซ้ำ จึงใช้เป็นผลรับรอง implementation ปัจจุบันไม่ได้
