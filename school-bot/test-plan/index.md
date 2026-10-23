# SchoolBot — Test Plan Index

| เอกสาร | ขอบเขต | สถานะ |
| --- | --- | --- |
| [TP-001](tp-001.md) | 77 cases /180 AC; แยก logic/UI/bridge/hardware/installer | NEEDS_DESIGN_CHANGE; ทุก case NOT_RUN |
| [Traceability](traceability-001.md) | 180 AC → cases → implementation/validation owner | IDs/coverage ตรวจแล้ว ไม่ใช่ QA PASS |
| [Owner dataset](tp-001.json) | ผล inspect ต้นฉบับ | ไม่มี test execution |
| [Joined dataset](traceability-001.json) | REQ+canonical tasks+cases | revision2 |

## Change Log

- 2026-10-23 — นายช่างบันทึกและจัดรูปจากผล role ผ่าน Claude; ไม่มี runtime/test verdict หรือการปิด gate

- 2026-10-23 — Amendment001 ปรับTP001-007/008/019ตามspec; 77/180เดิม, GAP01/02ยังรอdesignsync; [archive manifest](archive/2026-10-23-before-amendment-001/manifest.json)
