# BE-045 — Cluster run/score tables migration

> module: student-web/sb-compass-faculty-match

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

## Goal

migration: `public."TCompassStudentClusterRun"` (หัวรอบ: `RunID`, `SchoolID`, `SID`, `CreatedAt`, `"ClusterCount"`/`"MeanOwn"`/`"SdOwn"`/`"GapTop"`/`"ClarityIndex"`/`"ClarityBand"`) + `public."TCompassStudentClusterScore"` (ต่อ cluster: `RunID` FK, `SchoolID`, `SID`, **`"ClusterID" integer` FK ชี้ `public."TCompassInterestCluster"("ClusterID")` — v9: เดิมเป็น `"ClusterCode" text` FK**, `"AcademicFit"`, `"InterestFit"`, `"CombinedScore"`, `"DisplayScore"`) ตาม `## Data Model` DDL (สถานะ v9, 2026-09-15) — index `("SchoolID","SID","CreatedAt" DESC)` ทั้งสองตาราง + index `RunID` บนตารางลูก — ผล cluster เป็นผลของ "รอบ" (run) ไม่ใช่ของคลัสเตอร์เดียว — โครงสองตารางนี้คือเงื่อนไขที่ทำให้ค่าสถิติรอบ (เช่น ClarityIndex) เก็บได้ถูกตารางและตามประวัติได้

## References

REQ-011, AC-011.1, DES-022, DEC-022, DES-018, DEC-018

## Scope

DDL ตาม `## Data Model` เป๊ะ (รวมคอลัมน์ `"DisplayScore"` ที่ยังเขียน NULL จนกว่า OQ-F16 จะปิด) · quote identifier ครบ · ค่าสถิติระดับรอบเก็บที่ตารางหัวรอบเดียว ห้ามซ้ำ 11 แถว · **FK ของตารางลูกเป็น `"ClusterID" integer` — ห้ามเขียน text code ลงคอลัมน์นี้ ห้าม hardcode เลข Id ในโค้ด: resolve ผ่าน `"ClusterCode"` เสมอ (RISK-F21)**

- Security-sensitive: yes

## Out of Scope

ตารางอื่น · ตาราง `public."TCompassLevelSubjectStat"` ของ sb-compass (read-only) · ตรรกะ constraint ที่เอกสารกำหนด

## Expected Output

none

## Acceptance

AC-011.1 (ฐานสถานะ): ตารางรอบ/คะแนน cluster พร้อมใช้ตาม DDL ปัจจุบัน (สถานะ v9 ของ `## Data Model`) — คะแนนต่อ cluster ผูกด้วย `"ClusterID" integer` FK ที่ resolve ได้จริง — เก็บผลต่อรอบ/ต่อ cluster ได้จริง รวมค่า NULL ของ `"DisplayScore"` ที่ยังไม่เปิดใช้

## Dependencies

BE-003

## Handoff

ตรวจ AC-011.1 (ฐานสถานะ) ด้วยการรัน migration แล้วเทียบโครง/ชนิดคอลัมน์ FK/index กับ `## Data Model` + ทดสอบ INSERT/SELECT พื้นฐาน (รวม NULL ได้ + INSERT ที่ใส่ text code ลง `"ClusterID"` ต้องถูกฐานปฏิเสธ) — เก็บผลเป็นหลักฐาน
migration ใหม่บนตารางที่ยังไม่เคยมี — drop คืนสภาพได้ (ยังไม่มีข้อมูลจริง)
ส่งต่อ reviewer

Back-links: `INDEX.md`
