# BE-406 — feature-requests endpoints + live derive counts

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `BE-crm-case-dashboard-P4-06`

## Goal

`GET/POST .../insights/feature-requests` + `[id]` — guard write `CRM_AI_PM` · response **derive สด**: requestCount/schoolCount (เคส FEATURE ที่ IssueId ตรง distinct SchoolId) + dealCount (นับ `TCrmCustomerPromise` `PromiseType=FEATURE` ที่ ProductFeatureId/MenuId ตรง) + trendPct (30 วันล่าสุด vs ก่อนหน้า) — ห้ามรับค่า count จาก request body — จำนวนที่ PM พิมพ์เองจะเพี้ยนจากของจริง (data drift) — ทุกตัวเลขต้อง derive จากเคสและ promise จริงทุกครั้งที่อ่าน

## References

REQ-006, AC-006.3, DES-006, DES-007, DEC-006

## Scope

write guard `CRM_AI_PM` (คนละ kind กับ SA) — ทุก count/trend คำนวณสดตอนอ่าน ห้ามเก็บและห้ามรับจาก body — identity link ของ FR ใช้ issueId/productFeatureId ที่ schema refine แล้ว

- Security-sensitive: no

## Out of Scope

`TCrmCustomerPromise`/`TCrmSupport` (อ่านอย่างเดียว) · permission เดิม · Sales pipeline ของระบบอื่น

## Expected Output

none

## Acceptance

AC-006.3: จำนวน request/โรงเรียน/ดีลของ Feature Request derive จากเคสจริง + `TCrmCustomerPromise` เสมอ — ไม่มีเส้นทางใดให้รับค่านับจากภายนอก

## Dependencies

—

## Handoff

ตรวจ AC-006.3 ด้วย dev server: ส่ง body แปลก (มี count) ต้องไม่มีผล — response ตรงกับการนับ SQL จริง + guard CRM_AI_PM 401/403 — เก็บผลเป็นหลักฐานก่อนปิด task
endpoint ใหม่ additive — revert รายไฟล์ได้ ไม่กระทบข้อมูล promise จริง
ส่งต่อ reviewer

Back-links: `INDEX.md`
