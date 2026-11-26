---
name: ui-design-system
description: Use when designing screens, building or editing UI components, creating interactive prototypes, checking accessibility (WCAG AA), or running visual browser verification against <project>/ui-design-system.md and BAAN UX guidelines.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project> [screen-or-component]"
---

# 🎨 `ui-design-system` — ออกแบบ สร้าง และตรวจรับหน้าจอตาม Design System

ทักษะเดียวครบวงจรฝั่ง Antigravity สำหรับงาน UX/UI: อ่าน Design System → ทำ interactive prototype บน `generative_ui` → ตรวจด้วย `browser` subagent และกฎใน [`references/web-rules.md`](references/web-rules.md)

## ขั้นตอนปฏิบัติ (Antigravity-Native)

1. **โหลดบริบท Design System (อ่านเฉพาะที่จำเป็น)**:
   - อ่าน `<project>/ui-design-system.md` (หรือ fallback `<project>/design/INDEX.md` + `<project>/design/system/` ในโปรเจกต์เดิม)
   - อ่านกฎ UX ของ BAAN ใน `framework/ux-knowledge/` ตาม `platform` / `os` ของโปรเจกต์ และเช็ก [`references/web-rules.md`](references/web-rules.md)
   - **Thai Typography & Brand**: ยึดกฎภาษาไทยของโปรเจกต์ (`<project>/shared/brand/voice.md` ถ้ามี) แทนกฎ English-only (เช่น Title Case / Chicago style)
2. **Prototype ก่อนเขียนโค้ด (Interactive Sign-off)**:
   - สำหรับหน้าจอใหม่หรือ flow สำคัญ ใช้ `generative_ui` สร้าง interactive preview ที่สลับดูได้ครบ **5 UI states**:
     `loading` · `empty` · `error` · `disabled` · `success`
   - ใช้ `image-generator` เฉพาะเมื่อต้องสร้างภาพ/ไอคอนประกอบ
   - ให้ผู้ใช้ตรวจและอนุมัติ UX ก่อนลงมือเขียนโค้ดจริง (ห้ามสมมติว่าอนุมัติเอง)
3. **ตรวจความถูกต้องหลังแก้โค้ด (Visual & A11y Verification)**:
   - ใช้ `browser` subagent (`Model: "flash"`) เปิดหน้าจอจริง (เมื่อมี dev/preview server) ตรวจ:
     - Layout, overflow และ responsive viewports (desktop / mobile)
     - Console/runtime errors ต้องเป็น 0
     - Keyboard navigation, focus-visible, contrast (WCAG AA), touch target, และครบ 5 UI states
   - ตรวจโค้ด UI เทียบ [`references/web-rules.md`](references/web-rules.md) และรายงานจุดที่ขัดแย้งแบบ `file:line`
   - หากกฎภายนอกขัดกับ Brand/Design System ของโปรเจกต์ ให้รายงานความขัดแย้งให้คนตัดสิน ไม่เลือกเงียบๆ
