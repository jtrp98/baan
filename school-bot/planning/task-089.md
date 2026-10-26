# ใบงาน089 — CONTINUE-NORMAL: เดินงานขนานต่อจาก handoff004

วันที่ 2026-10-26 · นายช่าง · ผู้ใช้เลือก school-bot และสั่ง parallel

## ขอบเขต

ต่อจาก index → plan/index → handoff004/queue005; ใช้ baan-role ทุก role ไม่ implement เอง. เปิดไม่เกิน 3 งานอิสระพร้อมกัน และ serialize writer ของ repository เดียวกัน. T0–T2 Codex / T3–T5 AGY --no-fallback (ช่วง T3 ในคำสั่งทับกัน: ใช้ AGY ตามช่วงหลังและกติกาโมดูลเดิม เป็นสมมติฐานย้อนกลับได้).

คำสั่งเริ่มรอบนี้ให้ทำงานต่อ ยกเลิกการหยุดรอบ088ตาม048เฉพาะการทำงานต่อ ไม่เปลี่ยนประตู production/DB/hardware/signer. Canonical 110 tasks: 15 verified/95 pending; lint exit1 implement63/gated62/readyBE001. งาน subset ไม่ปิด canonical task ทั้งงาน.

## คิวเริ่ม

1. check Codex T2: ตรวจ auth compatibility รอบ1โดยอิสระจาก spec และ artifact ไม่ส่งคำอ้างผู้เขียนเป็นหลักฐาน.
2. sys AGY T3 write school-bot: แก้ gRPC รอบ1ตาม check088 ทั้ง7กลุ่ม คง production registration ปิด.
3. gm Codex T2 read-only: ทบทวน local/live proposal เมื่อ lint failและคิวที่พร้อม ไม่ apply canonical DAG เอง; รวบรวมคำถามท้ายรอบ.

หลังจากนั้นซ่อม/ตรวจ Gateway dependency/helper และเดิน local slices ตาม queue005 โดยไม่ข้ามสัญญาหรือประตูมนุษย์. ผลดิบอยู่ reports; สกัดผลลง knowledge แล้ว baan --commit ทุก slice. ผู้คุมรัน tests ซ้ำ; verified ใช้ check เท่านั้น.

## รอคำตัดสิน

เก็บคำถามธุรกิจ/สัญญา/schema/SQL/shared environment/security risk/hardware ไว้ถามพร้อมกันเมื่อไม่มีงานพร้อม. ไม่ถาม dev Gateway/replay900/UX7ชุดซ้ำ; signer/custodyยังพักตาม047. ไม่ commit/push/switch source Git ไม่รัน SQLจริง/deploy/hardware.

## Change Log

- 2026-10-26 — รับ CONTINUE-NORMAL และโมดูลที่ผู้ใช้เลือก พร้อม lint ก่อน dispatch.
