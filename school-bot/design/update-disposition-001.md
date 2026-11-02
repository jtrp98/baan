# Disposition workflow อัปเดต

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## เอกสารอ้างอิง

[GAP-07 (ช่องว่าง coverage ของ workflow อัปเดต)](update-disposition-001.md) · [REQ-030 (ตรวจข้อมูลอัปเดตจาก Desktop)](../requirement/req-030.md) · [BE-019 (งานตรวจและติดตั้งอัปเดต Desktop)](../requirement/req-030.md) · [AC-030-01 (เมื่อไม่มี published release ใหม่กว่า ผลตรวจมี available=false, release=null และ install_supported=false)](../requirement/req-030.md) · [REQ-031 (ติดตั้งและดูแลแอปบน Windows)](../requirement/req-031.md) · [REQ-032 (ติดตั้งแอปบน macOS)](../requirement/req-032.md) · [SA-001 (งานทบทวนสัญญาและ coverage)](update-disposition-001.md) · [DES-007 (Release และ trusted update)](des-007.md) · [AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ (hash ตรง manifest จาก registry + publisher pin ตาม DES-007) ก่อน…)](../requirement/req-030.md) · [TP001-080 (กรณีตรวจ workflow เตรียมและติดตั้งอัปเดต)](../requirement/decisions-036.md)

ผู้ใช้เลือกคง PrepareUpdate/InstallPreparedUpdate ตาม [มติ 036 (คง workflow อัปเดตแบบ explicit)](../requirement/decisions-036.md) ตารางนี้เก็บเหตุผลของทางเลือกเดิม ไม่ใช่คำถามให้เลือกใหม่ `install_supported=false` คงอยู่จน implement ตามเกณฑ์ที่รับรอง สถานะอยู่ที่ [index](index.md).

## ทางเลือกเดิมของ GAP-07

| ทางเลือก | ผลต่อสัญญา/หลักฐาน | ข้อเสนอ arch |
|---|---|---|
| คง PrepareUpdate/InstallPreparedUpdate | เป็น operation แยกจาก check; REQ-030/BE-019 ครอบเฉพาะ check จึงต้องให้ spec เสนอ AC สำหรับ download/verify/install/recovery แล้วผู้ใช้อนุมัติ; gm จัด coverage/dependencies ภายใต้ gate เดิม | แนะนำเสนอให้คงแบบ explicit เพราะรักษา trusted update ที่ DES เสนอ โดยไม่แอบตีความว่า AC-030 รับรองแล้ว |
| check-only | BE-019 ทำ check ตาม AC-030-01..03; installer ภายนอกยังตาม REQ-031/REQ-032 แต่ workflow Prepare/Install ที่ DES เสนอจะไม่อยู่ในสิ่งที่ส่งมอบ | ถ้าเลือกต้องให้ผู้มีอำนาจยืนยัน disposition/ผลต่อ frozen scope ก่อน gm/spec amend; arch ไม่ตัดเอง |

Task SA-001/BE-019 อ้าง GAP-07, DES-007, REQ-030: ผู้ใช้เลือกคง workflow ตามมติ 036 แล้ว เกณฑ์ AC-030-04..08 ที่ร่างตามมตินี้ได้รับการตรวจรับตาม [มติ 037 (รับรองเกณฑ์อัปเดตแอป)](../requirement/decisions-037.md). Gate และ `install_supported=false` คงเดิมจน implement; ไม่มีการเพิ่ม AC หรือเปลี่ยน task/dependency ในงานเรียบเรียงนี้.

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

`app/desktopservice.go:109–115` เรียก GET /v1/updates/check; `web/src/SchoolBot.Api/Program.cs:96–99` คืน install_supported=false. [REQ-030](../requirement/req-030.md) กำหนด metadata-only; BE-019 (memory) ใช้ disposition ที่ผู้ใช้เลือกแล้วก่อนเปลี่ยน coverage. Source นี้ไม่ใช่ Prepare/Install proof

หัวข้อที่ส่ง spec เพื่อร่างเกณฑ์ของ workflow ที่เลือกแล้ว ได้แก่ explicit intent, trust/hash/publisher pin/registry, staging TOCTOU, stop/close guard, expiry/withdraw/downgrade และ installer fail/repair ให้คนตรวจ. หัวข้อเหล่านี้เป็นที่มาของ AC ที่รับรองแล้วตามมติ 037 ไม่ใช่ AC ใหม่ในเอกสารนี้ ทาง check-only เป็นทางเลือกที่ไม่ได้เลือก

มติ 036 บันทึกการเลือก workflow; spec ร่าง AC-030-04..08 และ inspect เพิ่ม TP001-080 ตามบันทึกเดิม มติ 037 ยืนยันการตรวจรับเกณฑ์ทั้งห้าข้อ. ไม่อ้างว่า source ของ Prepare/Install พร้อมแล้ว.
