# BE-014 — Batch recompute: weighted scores + StddevScore + PascalCase rename

> module: student-web/sb-compass

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

`CompassRankingService.RecomputeAsync` (batch, `:362`): เปลี่ยนการคำนวณคะแนนกลุ่มสาระต่อนักเรียนจาก `AggregateByCanonicalSubject` เป็น `AggregateByCanonicalSubjectWeighted` — **รวมงาน REQ-017** (คอลัมน์ `"StddevScore"` ใหม่บน `TCompassLevelSubjectStat` ต้องอยู่ใน `CREATE TABLE IF NOT EXISTS` ของ `EnsureTables` ตั้งแต่แรก, population stddev หาร `n` (ใน C# หารด้วย `n` ไม่ใช่ `n−1` — ห้าม sample stddev), `MIN_N_FOR_STDDEV = 30` เก็บเป็นค่าคงที่มีชื่อ, `n < 30` → `"StddevScore"` เป็น `NULL` ไม่ใช่ 0, `n ≥ 30` ทุกคนเท่ากันจริง → `0`, ประชากร/ค่าที่ใช้ต้องเป็นชุดถ่วงน้ำหนักเดียวกับ `"MeanScore"` ของแถวเดียวกัน, ห้าม backfill แยก ห้าม incremental) **และงาน rename PascalCase** (เปลี่ยนชื่อตาราง/คอลัมน์เป็น `public."TCompassXxx"`/`"PascalCase"` พร้อม quote ครบ ทั้ง `CompassRankingService.cs` 19 จุด และ `CompassMbtiStore.cs` 3 จุด — ทำ rename ก่อนหรือพร้อมกับงาน weighted ในรอบเดียว **ห้ามเขียน snake_case ไปก่อนแล้วค่อยแก้**; ห้ามคง `CREATE TABLE IF NOT EXISTS` ของชื่อเดิมไว้ในโค้ดคู่กับของใหม่) ตามที่ Module C รวมไว้ — batch ต้องใช้สูตรเดียวกับ request-time มิฉะนั้นอันดับเพี้ยนแบบเป็นระบบ (ผู้ใช้ยืนยัน 2026-08-25) — `"StddevScore"` เป็นตัวหาร T-Score ของ `sb-compass-faculty-match` ที่อ่านอย่างเดียว และ rename พังแบบเงียบได้ 2 ทาง (ลืม quote / แก้ไม่ครบทุกจุด — RISK-10) (DES-021)

## References

REQ-004, REQ-010, REQ-017, AC-004.2, AC-017.1, AC-017.2, AC-017.3, DES-021

## Scope

ทั้งสามงาน (weighted / `"StddevScore"` / rename) ลงในรอบ implement เดียวของ `RecomputeAsync` — สูตร ตรรกะ และค่าคงที่ทุกตัว
ของ REQ-010 เดิมไม่เปลี่ยน (สถานะ idle/running/done/failed, กันสั่งซ้อน, failed แล้วไปต่อ, ตารางว่าง → คืนค่าว่าง/0 ไม่ล้ม);
rename เป็นการเปลี่ยนชื่อล้วน ห้ามถือเป็นโอกาสแก้พฤติกรรม

- Security-sensitive: no

## Out of Scope

ห้ามเขียนชื่อ snake_case ใดค้างไว้ในโค้ดหรือคง DDL ชื่อเดิมคู่กับของใหม่; ห้าม sample stddev (หาร `n−1`) ห้ามแก้ `MIN_N_FOR_STDDEV`
โดยไม่ amend; ห้ามทำ `"StddevScore"` เป็น backfill/incremental; ห้ามแตะพฤติกรรม REQ-010 เดิม; ตารางของโมดูลอื่น
(`sb-compass-faculty-match` Module K) อ่านอย่างเดียว ห้ามนิยาม DDL แทนโมดูลนั้น

## Expected Output

Contract:NationalStatsBatch.v1

## Acceptance

AC-004.2: batch คำนวณล่วงหน้าเก็บลงตารางสถิติ (`public."TCompassLevelSubjectStat"`, `public."TCompassStudentLevelScore"`)
แล้ว request อ่านจากตารางนั้น — ค่ากลุ่มสาระต่อนักเรียนเป็นค่าถ่วงน้ำหนักแล้ว
AC-017.1: คอลัมน์ stddev เพิ่มแบบ additive เท่านั้น — คอลัมน์เดิมทุกคอลัมน์คงเดิม และ consumer เดิมที่อ่าน mean ทำงานเหมือนเดิม
AC-017.2: stddev ถูกคำนวณและเขียนพร้อม mean ในรอบ batch เดียวกัน (ล้างตารางแล้วเขียนใหม่ทุกครั้ง) — ไม่ใช่ backfill ไม่ใช่ incremental
AC-017.3: การเพิ่ม stddev ไม่กระทบพฤติกรรมเดิมของ REQ-010 (สถานะ batch, กันสั่งซ้อน, โรงเรียนพลาดไม่ล้มทั้ง batch)

## Dependencies

BE-001

## Handoff

ตรวจ AC-004.2, AC-017.1, AC-017.2, AC-017.3 หลังรัน batch: ตารางใหม่มีแถวจริง, ค่ากลุ่มสาระเป็นค่าถ่วงน้ำหนัก, แถวที่ `n < 30`
มี stddev เป็น NULL (ไม่ใช่ 0) และแถวทุกคนเท่ากันจริงมี 0; **นับจำนวนจุด rename ครบ 22 จุดใน 2 ไฟล์** (ตรวจแบบนับจำนวน ไม่สุ่ม —
RISK-10) และตรวจว่า quote identifier ครบทุกจุด; บันทึก DDL ที่ `EnsureTables` สร้างจริง
ตารางทั้งสามยังไม่เคยถูกสร้างในฐานข้อมูลใด — ไม่มี migration/rename script; ถอดโค้ดกลับได้โดย `EnsureTables`/`EnsureTable`
ที่เหลืออยู่สร้างตารางชื่อใดชื่อหนึ่งได้เอง แต่ห้ามสลับข้ามรอบกับข้อมูลที่ recompute แล้ว — หลัง deploy ต้อง recompute ใหม่ทั้งเครือข่าย
(ดู Sequencing Notes) ก่อนเปิดใช้
ส่งต่อ reviewer

Back-links: `INDEX.md`
