---
owner: spec
---
# คำถามข้าม module

## OQ1 ขอบเขต Quiz MVP กับการส่งคะแนน

สถานะ: open · เจ้าของคำตอบ: ผู้ใช้/เจ้าของผลิตภัณฑ์ · ที่มา: migration 2026-11-02

Quiz R5/R16 ของทีมออกแบบระบุว่า MVP ไม่ส่ง/ดึงคะแนน SchoolBright ขณะที่ REQ-049–052 ในแผน build มี mapping/ส่งคะแนนอยู่ การย้ายไม่เลือกฝ่ายชนะและไม่เปลี่ยน release scope ก่อนเปิด run ส่งคะแนนใน MVP ต้องยืนยันว่าจะเป็นระยะถัดไปหรือแก้ scope ใด

[Quiz](../modules/quiz/shared/requirements.md) · [ส่งคะแนน](../../schoolbright-web/modules/school-bot/shared/requirements.md)
