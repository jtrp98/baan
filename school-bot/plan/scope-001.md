# SchoolBot — Frozen Release Scope

## Baseline

รักษาระบบเต็มตาม [decisions-002](../requirement/decisions-002.md), [สามโหมด](../requirement/decisions-003.md), [หลายโครงงาน/ผู้ประเมิน](../requirement/decisions-009.md) และ [logical baseline](../requirement/decisions-013.md) ไม่ลดเป็น PoC/MVP หรือถือข้อจำกัด source เดิมเป็นเพดานผลิตภัณฑ์ มี 31 REQ / 109 AC ตาม [Requirements index](../requirement/index.md)

## Release Scope

- Block/Arm/Code พร้อม Labs และ Lessons จริงแยกจากพื้นที่สร้างงาน มีหลักสูตร ภารกิจ ประเมินจริงและความคืบหน้า Code/Block ตรวจอัตโนมัติ Arm ครูตรวจ ครูติดตามภายใต้ scope ที่คนยืนยัน
- หลายโครงงานทุกโหมด ทั้ง Guest local และ Login DB/cloud รักษาความเป็นเจ้าของ ความคงทนและ failure semantics งานหนึ่งไม่แทนอีกงานโดยอัตโนมัติ
- Windows/macOS ควบคุมหุ่นจริงทั้งคู่ตาม [decisions-008](../requirement/decisions-008.md) ต้องมี platform/transport/hardware evidence และ signed installer acceptance ตามเกณฑ์ที่มนุษย์กำหนด ไม่ส่ง Mac simulator แทน native
- License บังคับทั้ง Guest/Login และสามโหมด ครั้งแรก online; signed offline lease ไม่เกินสามวันจาก online check สำเร็จล่าสุด เปิดแอปซ้ำไม่เริ่มนับใหม่ หนึ่ง Key ผูกเครื่องปัจจุบันหนึ่งเครื่อง ผู้ดูแลย้าย Key เดิมได้ทันที เครื่องเดิมอาจ offline ถึง lease เดิมหมดตาม decisions-004..007
- API ทั้งหมดรวม Login อยู่ target/school-bot/web แอปเรียก HTTPS ใช้บัญชีและ 4 DB เดิม ไม่สร้าง SchoolBotUser และไม่บังคับ Academic Login API/OIDC ตาม decisions-010/011 ไม่เพิ่ม DB ที่ห้าโดยพลการ
- ตารางใหม่ prefix SchoolBot; PK/FK ที่อ้าง PK เป็น int4 และมี IsDelete/CreateBy/CreateDate/UpdateBy/UpdateDate/SchoolId ครบ UUID สำหรับ logical/local/request ที่ไม่ใช่ DB PK ยังใช้ได้ตาม decisions-012
- รักษาภาษา th/en/zh offline, shell/window controls/close guards, sample/native boundary, trusted engine routing และ protocol/lifecycle ตาม REQ ที่เกี่ยวข้อง
- รวม persistent License/release APIs, update metadata check, Windows/macOS distribution และการตรวจรับตาม REQ-027..035 API server deploy แยกจาก desktop installer

## ขอบเขตที่ยังต้องทบทวน

REQ ยัง DRAFT และ DES บางส่วน PROPOSED ใช้สถานะจาก index ของหมวดนั้น การยืนยัน DBML ไม่ใช่ physical DDL/SQL execution, credential compatibility, UX sign-off, hardware acceptance หรือ release approval

DES-007 เสนอ PrepareUpdate/InstallPreparedUpdate ขณะที่ BE-019 เป็น check-only ให้ SA-001 trace กับ REQ-030/มติจริงและเสนอ disposition ก่อน freeze implementation contract ผ่าน G-RELEASE-DB แผนนี้ไม่ตัด requirement หรืออนุมัติ feature เพิ่มแทนคน งานส่วนที่ไม่พึ่งคำตอบเดินต่อได้

TeacherGrant เป็น conditional fallback ตามแบบ ต้องมีหลักฐานช่องว่าง scope เดิมและ schema approval ก่อนใช้ ไม่ถือการรับ logical model เป็นอนุมัติ fallback อัตโนมัติ เช่นเดียวกับ global SchoolId/null semantics, physical placement และ retention ที่ยังต้อง review ตาม gates

## การควบคุมขอบเขต

Release scope frozen ย้ายของเข้า/ออกได้เฉพาะคำสั่งผู้ใช้ Findings ที่ไม่บล็อก AC เข้า [backlog](../backlog.md) ไม่เปิด task เอง IDs ห้าม renumber หาก inventory/matrix มากจน task เกิน 1–2 วัน PM ต้องเสนอแตกงานก่อนจ่ายโดยรักษาขอบเขตและ mapping ไม่ลด requirement เพื่อให้พอดี effort

136 person-days เป็นสมมติฐาน ไม่ใช่กำหนดส่ง ไม่รวมเวลารอคน/อุปกรณ์/credentials ความสำเร็จ release ต้องมี receipts และผู้ตรวจรับจริง ไม่ใช้ verified แทน released

## ข้อจำกัดของหลักฐาน

PM อ่าน knowledge ตาม allowlist และตรวจโครงสร้างแผน/AC mapping เท่านั้น ไม่ audit source ซ้ำ ไม่รัน build/tests/SQL/UI/hardware ไม่ rebuild EXE/installer ไม่อ้าง SchoolBot QA PASS หรือ implementation เสร็จ หลักฐาน as-built ที่ใช้คือ source-review-001/002 ซึ่งมีขอบเขตของรายงานเอง

## Change Log
- 2026-10-23 — แก้พาธ `school-bot-v2` → `school-bot` ตาม [decisions-031](../requirement/decisions-031.md)

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
