# crm-ai-support — Plan Index

> หน่วยอ่าน = ไฟล์ · Budget(index) = (median ขนาดไฟล์ย่อยที่ระบุ × 0.75) × จำนวนไฟล์ + 2 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` — **ผู้เขียนคอลัมน์ Status ตามโหมด:** PM = แถวใหม่ `pending` · orchestrated = orchestrator คัดลอกจาก verdict ของ `qa-engineer` · solo = `qa-engineer` เขียนเอง · ค่า `pending`/`verified`/`blocked` เท่านั้น · Depends อยู่ที่ตารางนี้แหล่งเดียว · 1 แถว = 1 บรรทัด
> วิธีอ่าน: อ่านไฟล์นี้ก่อน แล้วเปิดเฉพาะ `<task-id>.md` ที่ packet/brief ระบุ — ตาราง Tasks ด้านล่างคือแหล่งสถานะเดียว

## Release Scope

**Release:** R1
**อยู่ใน release:** BE-101, BE-102, BE-103, BE-104, BE-105, BE-106, BE-107, BE-108, BE-109, BE-110, BE-111, BE-112, BE-113, BE-114, FE-115, FE-116, FE-117, FE-118, FE-119, FE-120, FE-121, FE-122, FE-123, FE-124, FE-125, FE-126, BE-127, BE-128, BE-129, BE-130, BE-131, BE-132, BE-133, BE-134, BE-135, BE-136, FE-137, FE-138, FE-139, BE-140, BE-141, BE-142, BE-143, FE-144, BE-145, BE-146, BE-147, BE-148, BE-149, BE-150, BE-201, BE-202, BE-203, BE-204, BE-205, BE-206, BE-207, BE-208, BE-209, BE-210, BE-211, FE-212, FE-213, FE-214, FE-215, FE-216, FE-217, FE-218, FE-219, FE-220, BE-301, BE-302, BE-303, BE-304, BE-305, BE-306, BE-307, BE-308, BE-309, BE-310, FE-311, FE-312, FE-313, FE-314, FE-315, FE-316, FE-317, FE-318, FE-319, BE-320, BE-321, BE-322, BE-323, BE-324, BE-325, BE-326, BE-327, BE-328, BE-329, BE-330, BE-331, BE-332, BE-333, BE-334, BE-335, BE-336, BE-337, BE-338, BE-339, FE-340, FE-341, FE-342, FE-343, FE-344, BE-401, BE-402, BE-403, BE-404, FE-405, FE-406, FE-407, FE-408, FE-409, BE-410, BE-411, BE-412, BE-413, BE-414, BE-415, BE-416, BE-417, BE-418, BE-419, FE-420, FE-421, FE-422, FE-423, BE-424, BE-425, BE-426, BE-427, BE-428, FE-429, FE-430, FE-431, FE-432, FE-433
**Done เมื่อ:** ทุก task verified และ deploy เรียบร้อย

## Waiting on Human

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน | ขวาง task |
|---|---|---|---|---|

## Phases

| Phase | ชื่อ | Tasks | หมายเหตุ |
|---|---|---|---|
| 1 | Case Classification & Safety 🔒 Security gate | BE-101, BE-102, BE-103, BE-104, BE-105, BE-106, BE-107, BE-108, BE-109, BE-110, BE-111, BE-112, BE-113, BE-114, FE-115, FE-116, FE-117, FE-118, FE-119, FE-120, FE-121, FE-122, FE-123, FE-124, FE-125, FE-126, BE-127, BE-128, BE-129, BE-130, BE-131, BE-132, BE-133, BE-134, BE-135, BE-136, FE-137, FE-138, FE-139, BE-140, BE-141, BE-142, BE-143, FE-144, BE-145, BE-146, BE-147, BE-148, BE-149, BE-150 | 🔒 security gate |
| 2 | Issue & Knowledge Management | BE-201, BE-202, BE-203, BE-204, BE-205, BE-206, BE-207, BE-208, BE-209, BE-210, BE-211, FE-212, FE-213, FE-214, FE-215, FE-216, FE-217, FE-218, FE-219, FE-220 | — |
| 3 | Feature Registry, Menu Relation & Learning Loop | BE-301, BE-302, BE-303, BE-304, BE-305, BE-306, BE-307, BE-308, BE-309, BE-310, FE-311, FE-312, FE-313, FE-314, FE-315, FE-316, FE-317, FE-318, FE-319, BE-320, BE-321, BE-322, BE-323, BE-324, BE-325, BE-326, BE-327, BE-328, BE-329, BE-330, BE-331, BE-332, BE-333, BE-334, BE-335, BE-336, BE-337, BE-338, BE-339, FE-340, FE-341, FE-342, FE-343, FE-344 | — |
| 4 | Queue Interrupt & Customer Promise | BE-401, BE-402, BE-403, BE-404, FE-405, FE-406, FE-407, FE-408, FE-409, BE-410, BE-411, BE-412, BE-413, BE-414, BE-415, BE-416, BE-417, BE-418, BE-419, FE-420, FE-421, FE-422, FE-423, BE-424, BE-425, BE-426, BE-427, BE-428, FE-429, FE-430, FE-431, FE-432, FE-433 | — |

## Tasks



ตาราง task, module, Depends และ Status อยู่ที่ [แผนรวม](INDEX.md#tasks) ที่เดียว
## Sequencing Notes

-

## Change Log

- 2026-10-07 — แปลงเป็น split layout (DES-014)

Back-links: `../../modules/crm-ai-support/INDEX.md`
