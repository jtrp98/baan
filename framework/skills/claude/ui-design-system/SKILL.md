---
name: ui-design-system
description: Use when designing screens, building or editing UI components, creating interactive prototypes, checking accessibility (WCAG AA), or verifying a real page in a browser against <project>/ui-design-system.md, BAAN ux-knowledge, and the pinned Web Interface Guidelines.
argument-hint: "<project> [screen-or-component]"
metadata:
  author: baan
  version: "1.0.0"
---

# 🎨 `ui-design-system` — ออกแบบ สร้าง และตรวจรับหน้าจอตาม Design System

สกิลเดียวครบวงจรฝั่ง Claude Code สำหรับงาน UX/UI: อ่าน Design System → prototype ครบ 5 states → ตรวจโค้ดตาม [`references/web-rules.md`](references/web-rules.md) → ตรวจหน้าจอจริงใน browser
(บน Claude Code สกิลนี้ทำหน้าที่แทน `web-design-guidelines` ที่ role contract อ้างถึง — ใช้กฎชุดเดียวกัน)

## ขั้นตอนปฏิบัติ (Claude Code Native)

1. **โหลดบริบทเท่าที่จำเป็น**:
   - `<project>/ui-design-system.md` (fallback: `<project>/design/INDEX.md` + `<project>/design/system/` ในโครงสร้างเดิม)
   - กฎ UX ของ BAAN ใน `ux-knowledge/` ตาม platform/os ของโปรเจกต์ (`common/` + `web/` หรือ `mobile/`)
   - **ภาษาไทยและแบรนด์**: ยึด `<project>/shared/brand/voice.md` (ถ้ามี) และกฎ UI24 ใน `ux-knowledge/common/ui-design-58-rules.md` แทนกฎ English-only (Title Case, Chicago style)
2. **Prototype ก่อนเขียนโค้ด (Interactive Sign-off)**:
   - หน้าจอใหม่หรือ flow สำคัญ ทำ prototype HTML ที่สลับดูได้ครบ **5 UI states**: `loading` · `empty` · `error` · `disabled` · `success`
   - บน Claude Desktop ที่มีเครื่องมือ `Artifact` ให้เผยแพร่เป็น artifact ส่วนตัวเพื่อให้ผู้ใช้เปิดดู ถ้าไม่มี ให้เขียนไฟล์ HTML เดี่ยวแล้วบอก path
   - ให้ผู้ใช้อนุมัติ UX ก่อนเขียนโค้ดจริง (ใช้ `AskUserQuestion` เมื่อมีทางเลือก) — ห้ามสมมติว่าอนุมัติเอง
3. **ตรวจโค้ด UI (Read-Only Audit)**:
   - เทียบโค้ด/HTML กับ [`references/web-rules.md`](references/web-rules.md) (สำเนา pinned ดู `references/SOURCE.txt` — ห้ามดึงกฎจาก network ตอนรีวิว) และรายงานแบบ `file:line`
   - ข้ามกฎที่ไม่เกี่ยว: Hydration Safety, Performance ของ framework/list, `Intl.*` เมื่อหน้า static และกฎภาษาอังกฤษล้วนสำหรับข้อความไทย
   - หลายหน้าจอให้ส่ง `Agent` ชนิด `auditor` แยกหน้าละตัวขนานกันใน message เดียว
4. **ตรวจหน้าจอจริงหลังแก้โค้ด (Visual & A11y)** เมื่อมี dev/preview server:
   - ใช้ built-in `/verify` หรือ browser ที่มี: Claude in Chrome (`claude --chrome`), browser pane ของ Desktop app หรือ Playwright MCP
   - ตรวจ layout/overflow และ responsive (desktop/mobile), console/runtime error = 0, keyboard navigation, focus-visible, contrast (WCAG AA), touch target และครบ 5 states
   - ถ้าไม่มี browser ให้รายงานชัดว่า "ยังไม่ได้ตรวจบนหน้าจอจริง"
5. **ความขัดแย้งของกฎ**: ถ้ากฎภายนอกขัดกับแบรนด์หรือ Design System ของโปรเจกต์ ให้รายงานให้คนตัดสิน ไม่เลือกเงียบๆ
