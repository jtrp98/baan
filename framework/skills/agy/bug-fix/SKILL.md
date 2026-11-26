---
name: bug-fix
description: วินิจฉัย ประเมินสังกัดโมดูล และแก้ไขข้อบกพร่อง (Defect Remediation & Bug Fixing) อย่างเป็นระบบตามหลัก Systematic Root Cause Analysis, Plan-First, Red-Green Test Proof และบันทึกประวัติลง defects ของโปรเจกต์
metadata:
  author: baan
  version: "1.1.0"
  argument-hint: "[คำอธิบายบั๊ก / ไฟล์ที่พบปัญหา]"
---

# 🛠️ `bug-fix` — วินิจฉัยและแก้บั๊กอย่างเป็นระบบ (Systematic Debugging + Red-Green Proof)

ใช้เมื่อผู้ใช้แจ้งบั๊กในแชท เช่น **"ตรงนี้บั๊ก"**, **"ช่วยแก้บั๊กนี้หน่อย"**, **"401 / 500 / test พัง"**, หรือ **"fix bug"**

กฎเหล็ก: **หา Root Cause ก่อนแก้ · Red Test First (fail ก่อนแก้) · Minimal Blast Radius · บันทึกประวัติบั๊กเสมอ**

---

## ขั้นที่ 1 — สำรวจบริบท, หา Root Cause และประเมินสังกัดโมดูล

1. **Reproduce & Trace**: อ่าน Error Stack Trace, logs, และไฟล์ต้นเหตุ (บน Antigravity ส่ง `invoke_subagent` `research` ไล่ call path ขนานกันได้)
2. **Root Cause Investigation (Five Whys)**: ห้ามแก้แค่อาการปลายเหตุ ตรวจ data flow ตั้งแต่ input → business logic → DB/API response เพื่อระบุต้นตอจริง (ถ้ามี `<project>/coding-pattern.md` ให้เทียบกับ pattern ที่ควรจะเป็นด้วย)
3. **ประเมินสังกัดโมดูลผ่าน BAAN Core**:
   ```bash
   baan survey [--target <targetName>] --eval <filePath> --json
   ```
   - 📦 **In-Module**: ผูกใบงานกับโมดูลนั้นและอ่าน contract/pattern ที่เกี่ยวข้อง
   - 🌐 **Cross-Cutting (`_cross`)**: งานส่วนกลาง/infra เช่น `src/utils/`, `gateway/`, `migrations/` ไม่ต้องฝืนยัดเข้าโมดูลฟีเจอร์
   - ⚠️ **Unmapped Code**: แจ้งผู้ใช้ว่ามีโค้ดที่ยังไม่มีโมดูลใน Knowledge (เลือกแก้แบบ `_cross` หรือทำ `repo-map` / `--scaffold-module` เพิ่ม)

---

## ขั้นที่ 2 — วางแผนก่อนแตะโค้ด (`/plan` First)

นำเสนอแผนแก้บั๊กให้ผู้ใช้เห็นชอบก่อนแก้ไขไฟล์จริง:
1. **Root Cause Hypothesis**: ต้นตอที่แท้จริงและเหตุผลที่เกิด (อ้างอิง `file:line`)
2. **AC-BUG**: เงื่อนไขตรวจรับที่วัดผลได้ เช่น `AC-BUG-01: ...`
3. **Red-Green Test Strategy**: คำสั่ง `test_targeted` ที่จะใช้พิสูจน์ Red Test และ `test_full` สำหรับ Regression
4. **Minimal `owns`**: เฉพาะไฟล์ที่จำเป็นต้องแก้ (ห้ามทำ unrelated refactor)

---

## ขั้นที่ 3 — Red → Green → Verify → Record

1. **เขียน Red Test ก่อนแก้โค้ด (บังคับ)**:
   - เขียน automated test ที่จำลองบั๊กและรันให้เห็นว่า **ล้มเหลว (Red)** ตรงอาการจริง
   - *ห้ามแก้โค้ด production หากยังพิสูจน์ Red Test ไม่ได้* (กรณีแก้บั๊ก UI หรือ environment พิเศษ ให้ระบุเหตุผลและหลักฐานการจำลองอาการชัดเจน)
2. **แก้ไขโค้ดเฉพาะใน `owns` ให้ผ่าน (Green)**: แก้ที่จุดต้นตอจน Red Test ผ่าน
3. **ตรวจ Regression & Fresh-Eyes Audit**: รัน `test_full` จริงทั้งหมด (และผ่าน `verify-before-done` / `code-review` หากมีความเสี่ยงสูง)
4. **บันทึกประวัติข้อบกพร่องลง Knowledge Project**:
   - หากโปรเจกต์ใช้ Neutral Knowledge v2 ให้บันทึกที่ `<project>/defects/BUG-xxx.md` (และ `<project>/defects/INDEX.md`)
   - หากโปรเจกต์ใช้โครงสร้าง 3-slot เดิม ให้บันทึกที่ `<project>/shared/defects/BUG-xxx.md` (และ `<project>/shared/defects/INDEX.md`) ใน knowledge root — ไม่ใช่ `shared/` ที่ราก workspace ซึ่งไม่ได้อยู่ใน git

---

## รูปแบบไฟล์บันทึกบั๊ก (`BUG-xxx.md`)

```markdown
# BUG-xxx: [ชื่ออาการของบั๊กสั้นๆ]

- **วันที่แก้ไข:** YYYY-MM-DD
- **โมดูลที่เกี่ยวข้อง:** [ชื่อโมดูล หรือ _cross]
- **ระดับความรุนแรง:** [high / medium / low]
- **ไฟล์ที่แก้ไข (owns):** `[path/to/file]`, `[path/to/test]`

## 1. อาการที่พบ (Symptom)
## 2. สาเหตุที่แท้จริง (Root Cause)
## 3. วิธีการแก้ไข (Resolution)
## 4. ชุดทดสอบที่ใช้พิสูจน์ (Verification Proof)
- **Red Test:** `[คำสั่งและชื่อ test ที่ fail ก่อนแก้]`
- **Green Proof:** `[คำสั่งและชื่อ test ที่ผ่านหลังแก้]`
- **Regression:** `[คำสั่ง test_full ที่ผ่านทั้งหมด]`
```
