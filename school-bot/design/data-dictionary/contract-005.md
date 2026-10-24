# สัญญาอ้างอิง — กฎข้อมูลและ HTTP contract ร่วม — Rev1

[กลับคู่มือ](../data-model.md) · [สารบัญสัญญา](contract-index.md)

ข้อความจาก data-model Rev5 คงชื่อฟิลด์ ชนิด และกฎเดิม ใช้คู่กับคำอธิบายรายตาราง

## กฎข้อมูลและ HTTP contract ร่วม

อ่าน [data-contract-rules.md](../data-contract-rules.md) ประกอบเสมอ: มี relations, uniqueness, invariants, error envelope, headers, pagination และขนาด payload ของ DES ทั้งชุด โดย HTTP เป็นฝั่ง client→G; G→B เป็น gRPC ที่ยังรอ mapping. HttpStatus ของ idempotency ยังคงความหมาย HTTP replay เดิม ไม่เปลี่ยนเป็น gRPC status และไม่เปลี่ยน dictionary/DBML/SQL


## Change Log
- 2026-10-24 — Rev1: ชี้ HTTP semantics ตาม049; คง data contract

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
