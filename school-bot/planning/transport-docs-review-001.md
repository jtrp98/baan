# ตรวจเอกสาร Gateway → gRPC ที่เกี่ยวข้อง — 001

วันที่2026-10-24 · Codex ตามบทบาทเจ้าของเอกสาร · รอบนี้ทำเฉพาะเอกสาร ยังไม่ implement

ปรับเอกสาร Markdown เดิม 44 ไฟล์ (37 knowledge / 7 คู่มือใน SchoolBot repository) และ sync canonical task JSON ให้ใช้เส้นทางเดียวกัน: **Desktop/Web → HTTP API Gateway → gRPC → SchoolBot service**; browser คงผ่าน same-origin BFF. เก็บ snapshotก่อนแก้และ SHA256 manifest ทุกชุด ไม่แก้ code/SQL/proto/config หรือผลตรวจรับเดิม

| กลุ่ม | สิ่งที่ตรวจและปรับ | เจ้าของ/หลักฐาน |
| --- | --- | --- |
| แบบระบบ/สัญญา | โมดูล, DES-004/012, HTTP semantics, dictionary contract005, identity evidence, risks และ design index; HTTP paths/status เป็น client boundary ของ Gateway | [arch050](transport-docs-design-response-001.json) |
| คู่มือ repository | README, web/app README, Architecture/API/Deployment/Installer; แยก local HTTP as-built จาก online Gateway–gRPC target | [arch050](transport-docs-design-response-001.json) |
| แผน/ใบงาน/ส่งมอบ | canonical JSON กับ task Markdown, queue, gates, prerequisites, runbook, scope และ backlog; Codex/docs-only เป็นคำสั่งปัจจุบัน | [gm051](transport-docs-plan-response-001.json) |
| แผนทดสอบ | environment/ขั้นตอน HTTP→G→gRPC→B ภายใต้77casesเดิม; local/static4032ไม่ยืนยันintegration | [inspect052](transport-docs-testplan-response-001.json) |
| ข้อกำหนด/OQ | ตรวจ44REQ/180ACและ12OQ; แก้จุดอ่านscope/index/references ข้อกำหนดธุรกิจรายไฟล์คงเดิม | [spec053](transport-docs-requirement-response-001.json) |
| Security | กำกับขอบเขตรายงาน/mitigation/disposition; ไม่เปลี่ยน findings/severity/status/accepted risk | [jpo054](transport-docs-security-response-001.json) |
| สารบัญ/ส่งต่อ | planning/index, handoff002, Login/admin receipts และ auth-flow ชี้เอกสารปัจจุบัน | ผู้คุมตามข้อส่งต่อarch050 |

[Coverage และเหตุผลรายกลุ่มเอกสาร](transport-docs-coverage-001.json) แยกเอกสารที่แก้, ใช้ต่อได้, ไม่เกี่ยวข้อง และหลักฐานเก่าที่เก็บไว้. [รายการก่อนแก้](transport-docs-before-001.json) เป็น inventory/snapshot ไม่ได้หมายความว่าทุกไฟล์ต้องเปลี่ยน. เอกสารประวัติ/raw responses/decisions/source reviews/ผลQAเดิมไม่ถูกเขียนย้อนหลังให้เหมือนเคยมี gRPC แล้ว

## ขอบเขตที่ยังต้องออกแบบ

มาตรฐาน gRPC ยืนยันแล้ว แต่ RPC/DTO, HTTP mapping, error/header/deadline/cancellation/retry/message-limit contract และ trusted tenant/opaque-session/device-proof boundary ยังต้องกำหนดจากหลักฐานจริงก่อน implementation. เอกสารระบุช่องว่างเหล่านี้ไว้ ไม่เดา proto, ports หรือ auth metadata ให้ดูพร้อม. C/035/cType/License/device/สิทธิ์เดิมคงอยู่ และไม่เปิดคำถามที่ผู้ใช้ตอบแล้วซ้ำ

โค้ด logout ปัจจุบันยังเป็น HTTP ใน B และ internal Gateway decoder อ่านผล HTTP Login เดิม; ผล4032testsเป็น local/static ตาม [QAเดิม](../qa/round-001.md). รอบนี้ไม่รัน tests ใหม่/SQL/DB/Gateway/gRPC/runtime/deploy และไม่มีการปิดgateหรือเปลี่ยน110tasks pending/77cases NOT_RUN

## การตรวจเอกสาร

[ผลตรวจโครงสร้าง ลิงก์ archive และ invariants](transport-docs-validation-001.json). ผลตรวจนี้เป็น document validation ไม่ใช่ check PASS ของ implementation

## Change Log
- 2026-10-24 — รับผล050..054 และแก้current pointers/revision labelsตามarch050; ปิดงานเอกสารก่อน final knowledge commit
