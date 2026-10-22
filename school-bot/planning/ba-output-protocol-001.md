# SchoolBot — BA output protocol

## Output protocol

ไม่เขียนไฟล์ ตอบ JSON object เดียวใน fenced json และ handoffสั้น:

```
{"files":[{"path":"requirement/req-040.md","content":"complete exact new markdown"}],"patch":"unified diff เฉพาะ amend ไฟล์เดิมใน requirement/** และ open-questions/**", "counts":{"requirements":0,"acceptance_criteria":0,"oq_partial":0,"oq_closed":0},"delta_mapping":[{"decision":"decisions-014","requirements":["REQ-..."],"ac_ids":["AC-..."],"handoff_to":["SA-001"]}],"questions":[],"handoff":"ผล หลักฐาน ข้อจำกัด งานรับต่อ", "state":"DONE หรือ NEEDS_HUMAN ตามสิ่งที่ยังบล็อกจริง"}
```

- files เฉพาะไฟล์ใหม่ (ถ้าไม่มีให้[]); patchเฉพาะไฟล์เดิม ห้าม regenerateindex/scopeหรือเขียนทับทั้งหมวด รักษาเนื้อหาไม่เกี่ยวและIDs
- ทุกไฟล์มี Change Log 2026-10-22; เก็บวันที่คำตอบผู้ใช้เดิม2026-10-21 ไม่เปลี่ยนเป็นวันที่วันนี้
- req/oq <=4096 bytes, scope<=12288, index/เอกสารสนับสนุน<=10240 ถ้าประวัติยาวให้ archive/splitและเก็บครบโดยไม่ตัดหลักฐาน; machineJSONแยกจากงบMarkdown
- outputไม่ต้องคัดลอกdesign/plan/code ไม่เพิ่ม featureนอกคำตอบผู้ใช้ ระบุข้อเสนอ/สมมติฐานที่ยังไม่ยืนยันให้ชัด ไม่ถือ logicalDBMLapprovalเป็นphysicalDDL/SQLexecution

## Change Log

- 2026-10-22 — แยก protocol จาก task-008 หลัง dispatch โดยรักษาข้อความที่ใช้เรียก BA
