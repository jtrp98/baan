-- Migration 002: เพิ่มที่มาและการอนุมัติจากต้นทางราย Lesson
-- Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย vault · ขอโดย ผู้ใช้ (มติ 2026-11-03 — เพิ่มเฉพาะคอลัมน์)
-- แทนข้อเสนอ Rev1; ไม่เพิ่ม CHECK/index/trigger/comment หรือวัตถุอื่น
-- มนุษย์รันเองหลังตรวจ preconditions ใน migration-002-lesson-import-source.md
-- ต้องยังไม่มีคอลัมน์นี้; รันซ้ำจะ error เพื่อไม่ยอมรับ schema drift โดยเงียบ
ALTER TABLE public."SchoolBotLesson" ADD COLUMN "ImportSource" jsonb NULL;
