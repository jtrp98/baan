# FE-016 — Dedicated 403 copy + page-level 403 (UX-004, DES-018)

> module: schoolbright-web/timetableai

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

แทนทางแสดงข้อผิดพลาดเดิมที่ FE-001 ใช้ ด้วย copy/หน้าจอตาม UX-004 ที่เซ็น: 403 จาก API ใน action (toast/Alert) · 403 ระดับหน้า (เข้าด้วย URL ตรงโดยไม่มีสิทธิ์) พร้อมลิงก์ "กลับหน้าหลัก" · 401 ยังพาไปหน้า SessionExpired เดิม · สอดคล้องกับเมนูปิดของ UX-006 — AC-063 — "403 แสดงเป็นความล้มเหลวที่ผู้ใช้เห็น (ข้อความให้ `uxui-designer`)" · FE-001 ใช้ทางแสดงผลเดิมในรอบก่อน UX-004 เซ็น; task นี้ใช้ฉบับเซ็นแล้ว

## References

REQ-021, AC-063, DES-018, DEC-018

## Scope

ใช้ `../../modules/timetableai/build/uxui/UX-004-auth-messages.md` ฉบับเซ็น as-is 2026-10-04 ครอบ copy/ช่องทาง 401/403 และลิงก์กลับหน้าหลักเท่านั้น (DES-018 §43.2b4e) · คง security/breaking-contract gates ของ DES-018; ห้ามตีความ 401/403 เป็น body status ปกติ/เพิ่มทางเลี่ยง token · คง AC-063 ของ FE-001; ไม่แตะ Sidebar (FE-011) · UX-005 ไม่อยู่ใน task · **ไม่เพิ่ม retry control:** signed UX-004 ไม่ครอบ retry; FE-019 คง reload/no auto retry; ข้อเสนอ retry อยู่ BL-018 รอ UX/คำตัดสิน scope ใหม่

- Security-sensitive: yes

## Out of Scope

การส่ง Bearer และการส่งต่อ 401/403 ของชั้น proxy (FE-001 — 2026-10-09: `src/server/upstream` `proxyToBackend`/`src/lib/auth-headers.ts`, `backendProxy.ts` ไม่มีแล้ว) · `src/components/layout/sidebar.tsx` (FE-011) · backend

## Expected Output

none

## Acceptance

AC-063: ทุก action ที่ได้ 403 แสดง copy ของ UX-004 ที่เซ็น · เข้าหน้าด้วย URL ตรงโดยไม่มีสิทธิ์ → หน้า 403 พร้อมลิงก์กลับหน้าหลัก · 401 → SessionExpired · ไม่มีจุดใดแสดงสำเร็จหรือเงียบ

## Dependencies

FE-001

## Handoff

ตรวจ AC-063 ด้วยผู้ใช้ไม่มีสิทธิ์เมนูทดสอบ action อ่าน/เขียนตัวแทนทั้ง 5 หน้า (403 → copy ของ UX-004) + เข้า URL ตรงทั้ง 5 หน้า (หน้า 403 + ลิงก์กลับหน้าหลัก) + token หมดอายุ (→ SessionExpired) — ภาพเทียบ UX-004 ที่เซ็น + รายการ call ของ FE-001 ยังผ่าน · typecheck/lint/build ผ่าน — เก็บภาพและรายการ call เป็นหลักฐาน
revert คืนทางแสดงข้อผิดพลาดเดิมของ FE-001 (ยังผ่าน AC-063) · ไม่มีสัญญาเปลี่ยน
ส่งต่อ reviewer

Back-links: `INDEX.md`
