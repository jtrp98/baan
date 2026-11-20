---
name: wave-plan
description: ทักษะแตกแผนงานเป็น Waves (build/waves/) สำหรับ PM และแผนทดสอบระบบ (build/test-plan/) สำหรับ Test Planner แบบ Folder-First พร้อมกฎ Immutable History ห้ามแก้ไขรายการที่ done แล้ว
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "[wave | testplan] <project>/<module>"
---

# 📋 คู่มือปฏิบัติการ: `wave-plan` (Folder-First & Immutable History)

ทักษะนี้ใช้ร่วมกันโดย **`pm` (นายงาน)** สำหรับ `build/waves/` และ **`testplan` (คนวางแผนทดสอบ)** สำหรับ `build/test-plan/`

## 1. กฎเหล็ก Immutable History (ห้ามแก้ของเก่าที่ทำไปแล้ว)

1. **ไฟล์ที่มี `status: done`, `superseded`, หรือ `cancelled` ห้ามแก้ไขเนื้อหาหรือลบเด็ดขาด** (ระบบ `flow-lock` ตรวจสอบด้วย SHA-256 และปฏิเสธทันทีเมื่อพบการแก้ไข)
2. **เมื่อโจทย์ใหม่กระทบแผนเดิม**:
   - ถ้า Wave / Test Plan เดิม **เสร็จ (`done`) ไปแล้ว**: ห้ามแก้ไฟล์นั้น ให้สร้าง Wave / Test Plan ใหม่ต่อท้าย (เช่น `wave-004.md`, `TP-004.md`) เพื่อปรับ/ต่อยอดจากของเดิม
   - ถ้า Wave / Test Plan เดิม **ยังไม่เสร็จ (`pending`/`running`) แต่แผนเปลี่ยนจนใช้ไม่ได้**: ให้เปลี่ยน `status` ใน frontmatter เป็น `superseded` พร้อม `superseded_by: <รหัสใหม่>` คงเนื้อหาเดิมไว้เป็นประวัติ แล้วสร้างไฟล์ใหม่ต่อท้าย

---

## 2. รูปแบบไฟล์ Wave (`modules/<module>/build/waves/wave-xxx.md`)

```markdown
---
id: wave-001
title: สร้าง API และ Service หลัก
status: pending
round: 1
kind: code
target: school-bot
owns: [src/services/notify.ts, tests/notify.test.ts]
depends_on: []
build: npm run build
test_targeted: npm test -- notify
test_full: npm test
---

# wave-001: สร้าง API และ Service หลัก

## เป้าหมายและขอบเขต
- เงื่อนไข AC ที่ครอบคลุม: AC-01, AC-02

```json baan-wave
{
  "tasks": [
    {
      "id": "W1-T1",
      "title": "Service layer + unit tests",
      "owns": ["src/services/notify.ts", "tests/notify.test.ts"]
    },
    {
      "id": "W1-T2",
      "title": "Controller + validation",
      "owns": ["src/routes/notify.ts", "tests/notify.route.test.ts"]
    }
  ]
}
```
```

- **การแยกงานขนานใน Wave (สูงสุด 4 หน้าต่าง)**: แยก `tasks` ภายใน Wave เดียวกันเฉพาะเมื่อแต่ละ task มี `owns` ไม่ทับกัน เพื่อให้ `baan flow` เปิดหน้าต่าง Grid ทำขนานได้สูงสุด 4 หน้าต่างพร้อมกัน

---

## 3. รูปแบบไฟล์ Test Plan (`modules/<module>/build/test-plan/TP-xxx.md`)

```markdown
---
id: TP-001
title: ทดสอบระบบแจ้งเตือนขาดเรียน End-to-End
status: pending
round: 1
target: school-bot
owns: [tests/e2e/notify.spec.ts]
test_targeted: npm run test:e2e -- notify
---

# TP-001: ทดสอบระบบแจ้งเตือนขาดเรียน End-to-End

## Traceability
- ครอบคลุม: F1 / R1.1 / AC-01, AC-02

## กรณีทดสอบ (Test Cases)
1. **TC-001 (Happy Path)**: ส่งแจ้งเตือนสำเร็จและไม่ส่งซ้ำเมื่อ retry ด้วย idempotency key เดิม
2. **TC-002 (Edge / Error)**: ปฏิเสธเมื่อไม่มีสิทธิ์ (403) หรือ payload ไม่ครบ (400)
```

---

## 4. อัปเดตสารบัญ (`INDEX.md`) เสมอ
ทุกครั้งที่เพิ่มไฟล์ `wave-xxx.md` หรือ `TP-xxx.md` ใหม่ ต้องอัปเดตตารางสารบัญใน `INDEX.md` ของโฟลเดอร์นั้นให้ตรงกัน (`baan flow` จะ refresh ให้อัตโนมัติเมื่อจบขั้นด้วย)
