# SA-004 — Credential matrix

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ร่างเพื่อ SEC001-002 และ [export proof pack](export-proof-pack-001.md); สถานะที่ [index](index.md). ไม่เก็บค่า secret/connection string และไม่สร้างบัญชี/GRANT. Topology ยังคง client→HTTP HTTP API Gateway→SchoolBot gRPC service; worker/adapter เป็น process ภายในของบริการ SchoolBot ไม่ใช่ public API อีกตัว

## วิธีอ่าน

อ่านส่วนต่อด้านล่างตามลำดับ สัญญาและหลักฐานคง Rev เดียวกัน ทุกตารางและเงื่อนไขเดิมอยู่ในส่วนต่อ.

1. [เงื่อนไขตรวจรับ matrix](credential-matrix-001-contract.md)
2. [เงื่อนไขตรวจรับ matrix](credential-matrix-001-validation.md)
