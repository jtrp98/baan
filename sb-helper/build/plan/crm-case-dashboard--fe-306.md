# FE-306 — group detail + case detail pages wiring

> module: sb-helper/crm-case-dashboard

> Budget ≤ 4 KB (`policies\documentation.md` §4) · เขียนโดย `project-manager` · Owner/Phase/Depends/Status → `INDEX.md` (index ชนะ)

Original Task ID: `FE-crm-case-dashboard-P3-02`

## Goal

`groups/[type]/[groupId]/page.tsx` + `groups/[type]/[groupId]/[caseId]/page.tsx` — case-list-table (pagination) · case-header-card/message-thread/case-timeline/case-csat-card/case-assignee-panel ผูก API จริง — drill-down กลุ่ม → เคสเดี่ยวต้องใช้ข้อมูลจริงจาก API ทั้ง list และรายละเอียด

## References

REQ-002, AC-002.3, DES-002, DES-008

## Scope

type ของหน้ามาจาก payload API จริง — timeline แสดงเฉพาะ timestamp ที่ระบบมีจริง (ไม่มี status-history audit) — pagination ของ case-list-table ต้องเดินตาม API

- Security-sensitive: no

## Out of Scope

endpoint ฝั่ง BE · หน้า dashboard/settings · mock ที่หน้าอื่นยังใช้

## Expected Output

none

## Acceptance

AC-002.3: จากหน้ากลุ่มกดเข้ารายการเคสและเคสเดี่ยวได้จริง — thread/timeline/CSAT/assignee แสดงจาก API จริงครบ

## Dependencies

—

## Handoff

ตรวจ AC-002.3 ด้วย dev server เดิน drill-down จริงทั้งสาย (groups → groupId → caseId) เทียบกับ API + tsc/eslint — เก็บผลเป็นหลักฐานก่อนปิด task
revert wiring สองหน้าได้เป็นชุด — ห้ามค้างครึ่ง ๆ ระหว่าง mock กับ API
ส่งต่อ reviewer

Back-links: `INDEX.md`
