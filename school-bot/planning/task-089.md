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

## Checkpoint และ related-impact sweep

- เปิด check Codex T2 และ gm Codex T2 แล้ว. AGY T3 ครั้งแรก failed เพราะ headless read_file permission ไม่มี output/code verdict (run `2026-10-26-09-50-05-sys-tier-t3-1agents-jAWwt2`); ใช้ setup/agy/grant-read.mjs เพิ่ม read-only เฉพาะ knowledge/school-bot แล้วลองใหม่ ไม่เปิด write/add-dir/skip-permissions.
- Gateway fetch-sb-packages.ps1 exit1: ไม่มี SB_NUGET_TOKEN/GITHUB_TOKEN และ gh ไม่อยู่ใน PATH; package availability ยัง blocked ไม่ใช่ assertion failure.
- gm NEEDS_HUMAN เฉพาะ canonical staged proposal; คิวและ traceability181/186 ส่งต่อใน queue006. เปิด checkGhelper CodexT2 เมื่อ gm จบ เพื่อให้สายGเดินต่อแบบcachedreferencesโดยไม่รอprivatepackages.
- กวาด Queue005/queue-005 ก่อนเปลี่ยน pointerปัจจุบันใน module/plan index เป็น006 (แก้ตาม sweep); เก็บ task088 เป็นประวัติ.
- Authcheck089 FAIL42/45จาก2บั๊ก; สกัดcheck-089-auth-001และเก็บexacttestpatchในreportsเพื่อส่งsysรอบ2. เปิดinspecttraceabilityเมื่อcheckauthจบ. กวาด “รอตรวจซ้ำ/กำลังตรวจอิสระซ้ำ” แล้วแก้module/QAindexตามverdict (แก้ตามsweep); receipt088คงเป็นประวัติ.
- กวาดด้วย baan --sweep “หยุดตาม”, “หยุดหลังปิดงาน”, “หยุดก่อนเปิดรอบแก้”: แก้สถานะปัจจุบันใน module/plan/design/QA index ตามคำสั่งเริ่มต่อของผู้ใช้ (แก้ตาม sweep). เก็บ handoff004/decisions048 เป็นประวัติและไม่แก้ผลค้นใน timetableai เพราะคนละงาน. ไม่เปลี่ยนสัญญา/AC/DAG/gates.

## Change Log

- 2026-10-26 — รับ CONTINUE-NORMAL และโมดูลที่ผู้ใช้เลือก พร้อม lint ก่อน dispatch.
