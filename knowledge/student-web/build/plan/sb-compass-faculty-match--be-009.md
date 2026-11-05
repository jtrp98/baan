# BE-009 — Exact-match validation of AI output

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

validate ผล AI แบบ exact-match ตามตารางเกณฑ์ปัจจุบันของ DES-019 §5: กลุ่มสาระตรง 8 ชื่อ canonical เป๊ะ ๆ, น้ำหนัก (1/2/3 หรือคำไทย แปลงเป็น 1/2/3), `dimension_code` ตรงคอลัมน์ `"DimensionCode"` 6 มิติใน `public."TCompassRiasecDimension"` (แถวเดิมเขียน `trait_code`/8 แกน — ถูกแทนที่ด้วย RIASEC แล้ว), `desired_level` 1-5, `cluster_code` ตรงคอลัมน์ `"ClusterCode"` 1 ใน 11 code, **`faculty_group_code` ตรงคอลัมน์ `"FacultyGroupCode"` 1 ใน 26 code (v9: ฟิลด์นี้เดิมชื่อ `faculty_group_id` ในสัญญากับ AI — เปลี่ยนชื่อเพราะ `"FacultyGroupID"` เป็น int identity ของฐานข้อมูลไปแล้ว)** — **ทั้งสามฟิลด์เป็น text code เสมอในสัญญากับ AI · service เป็นผู้ resolve เป็น `"DimensionID"`/`"ClusterID"`/`"FacultyGroupID"` (integer) ก่อนเขียนลงตาราง · ห้ามส่งเลข Id เข้า prompt และห้ามให้ AI คืน Id** — แถวไม่ผ่านทิ้งจากชุดข้อมูลแต่ `ai_raw_response` ต้องเก็บเสมอ และตั้ง `analysis_status='ai_incomplete'` เมื่อมีแถวไม่ผ่าน — 8 ชื่อกลุ่มสาระ canonical เป็นคีย์เชื่อมเดียวระหว่างผล AI กับคะแนนเด็ก — ชื่อที่เพี้ยนแม้ตัวเดียวหายไปเงียบ ๆ และ % ที่เด็กเห็นเพี้ยนโดยไม่มี error (RISK-F08)

## References

REQ-002, AC-002.1, AC-002.2, DES-019, DEC-019, DES-018, DEC-018

## Scope

validate แบบ exact match — ห้าม fuzzy match ห้าม normalize อื่นนอกจาก trim ช่องว่างหัวท้าย · เก็บบางส่วนได้ (แถวผ่านเก็บ แถวไม่ผ่านทิ้งพร้อมตั้ง ai_incomplete) · `faculty_group_code` ไม่ผ่าน (หรือ resolve เป็น Id ไม่ได้) ให้ปล่อย `public."TCompassProgram"."FacultyGroupID"` เป็น NULL ให้คนกรอก ไม่ปฏิเสธทั้งก้อน · **code ตัวใดที่ resolve เป็น Id ไม่ได้ = validate ไม่ผ่าน — ห้ามสร้างแถว master ใหม่ให้อัตโนมัติ (11 cluster / 6 มิติ / 26 กลุ่มคณะ เป็นชุดปิด) และห้ามเขียน Id ที่เดาเอง**

- Security-sensitive: yes

## Out of Scope

ชุด 8 ชื่อกลุ่มสาระ/11 cluster code/6 มิติ/26 กลุ่มคณะ (อ่านจาก seed ไม่เขียนใหม่) · ขั้นเรียก AI · สคีมา · **ชื่อฟิลด์ในสัญญากับ AI (`dimension_code`/`cluster_code`/`faculty_group_code` — ห้ามเปลี่ยนกลับเป็น `faculty_group_id` และห้ามเปลี่ยนเป็น Id)**

## Expected Output

none

## Acceptance

AC-002.1: ผลที่ผ่าน validate ต่อหนึ่งสาขามีอย่างน้อย 2 ก้อน — กลุ่มสาระพร้อมน้ำหนัก และโปรไฟล์พฤติกรรม/ระดับมิติ RIASEC แบบที่จับคู่ได้ (ไม่ใช่ตัวอักษร MBTI ไม่ใช่คะแนนความประพฤติ)
AC-002.2: กลุ่มสาระที่ผ่าน validate ใช้ 8 ชื่อ canonical ชุดเดียวกับ `sb-compass` REQ-001 เสมอ — ชื่อนอกชุดไม่มีทางถูกเก็บ

## Dependencies

BE-008

## Handoff

ตรวจ AC-002.1/AC-002.2 ด้วยชุดผล AI จำลอง: ชื่อถูกต้อง/เพี้ยนหนึ่งตัวอักษร/น้ำหนักคำไทย/level เกินช่วง/`cluster_code`-`dimension_code` ที่ไม่มีในคลัง/`faculty_group_code` ที่ไม่มีในคลัง (ต้องได้ `"FacultyGroupID"` เป็น NULL ไม่ใช่ปฏิเสธทั้งก้อน) — ตรวจว่าแถวไม่ผ่านถูกทิ้งแต่ `ai_raw_response` ยังอยู่ครบและ `analysis_status='ai_incomplete'` ถูกตั้ง + ตรวจว่าค่าที่เขียนลงตารางเป็น Id ที่ resolve มาจาก code จริง + grep prompt/payload ยืนยันว่าไม่มีเลข Id ถูกส่งออกไปหา AI — เก็บผล validate/ผล grep เป็นหลักฐาน
validator เป็นขั้นแยก — tighten/loosen ภายหลังต้อง amend เอกสารก่อน (เกณฑ์เป็นสัญญา) · revert ไม่กระทบข้อมูลที่เก็บแล้ว
ส่งต่อ reviewer

Back-links: `INDEX.md`
