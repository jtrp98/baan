# ข้อเสนอแบบ — บันทึก Project + Revision เป็นหน่วย commit เดียว (แก้ต้นเหตุ F2 ของ BE-002)

สถานะ: **อนุมัติทาง A** ตาม[มติ051](../requirement/decisions-051.md) (2026-11-02) — delta ลงแบบแล้ว · เจ้าของแบบ: arch · วันที่ 2026-11-02 · ที่มา: [ใบงาน094](../planning/task-094.md) หลัง [check-094-wave2-gate-003](../planning/check-094-wave2-gate-003.md) FAIL ครบ rework 2/2 · run `2026-11-02-02-47-24-arch-tier-t1-1agents-lbzv8b` (Codex T1, read-only, ไม่รัน test ใหม่)

## ต้นเหตุ (ตรวจกับโค้ด as-built)

`ISchoolBotBackingStore` (`ISchoolBotBackingStore.cs:12`) เปิดให้บันทึก Project กับ Revision แยกกัน และ `FileSchoolBotBackingStore.cs:33` ทำ temp+move **ทีละไฟล์** → ไม่มีจุด commit ร่วมของคู่ข้อมูล adapter จึงพยายามชดเชยด้วยลำดับเขียน/rollback ซึ่งล้มเหลวได้เมื่อ storage ล้ม

| จุดใน `SchoolBotDbAdapter.cs` | ผลกระทบ | สถานะหลักฐาน |
|---|---|---|
| 199–204 สร้าง Project | `projects.Count > 0` — งานแรกพักใน cache, งานถัดไปเขียนก่อนมี Revision = F2 | ยืนยันด้วย fixture (Project 1,2 / Revision เฉพาะ ProjectId=1) |
| 200–204 | เพิ่ม cache + เลื่อน ID ก่อน write → write ล้มแล้ว cache รั่วไป commit ถัดไป | จาก source ยังไม่รันยืนยัน |
| 256–267 บันทึก Revision | เขียน Revision → cache → pointer → เขียน Project คนละ commit | จาก source |
| 274–285 catch | อิง cache ที่อาจรวมรายการใหม่แล้ว ไม่คืนสถานะก่อนเริ่ม และไม่ทำให้ disk สองไฟล์ตรงกัน | จาก source |
| 224–231 update Project | disk ได้ค่าที่ปรับ `CurrentRevision` แต่ cache/response ได้ค่าที่ไม่ปรับ → ต่างกันแม้ write สำเร็จ | จาก source |
| 40–56 โหลด | เติม cache ทีละชุด โหลดล้มแล้ว retry อาจซ้ำ | จาก source |

นอกจุดหลัก: License/Session ใช้ candidate → write → publish แล้ว (ไม่พบปัญหาแบบเดียวกัน) · Binding ไม่มี load/save ใน interface จึงยังรับรอง atomicity License–Binding ไม่ได้ · `MemorySchoolBotBackingStore.cs:28` ใช้ `Clear()` แล้วเติมทีละรายการ ไม่สลับทั้งชุด · lost-update หลาย instance เป็น backlog เดิม ไม่ปิดด้วยข้อเสนอนี้

## ทางเลือก

| ทาง | ข้อดี | ข้อเสีย/ความเสี่ยง | ขนาด |
|---|---|---|---|
| **A — commit ร่วมที่ backing store; file ใช้ snapshot เดียว (แนะนำ)** | จุดตัดสินสำเร็จจุดเดียว · memory/file/PostgreSQL ถือสัญญาเดียวกัน · ไม่มี compensation write | file เขียน snapshot ทั้งชุด · ต้องนำเข้าข้อมูลสองไฟล์เดิม | กลาง |
| B — คงสองไฟล์ + journal/commit marker + recovery | คงการแยกไฟล์ | สถานะ prepare/commit/replay/cleanup และจุดล้มเพิ่มหลายจุด | ใหญ่ |
| C — ฝัง Revision ใน Project เฉพาะ stub | เขียนหน่วยเดียวง่าย | รูปต่างจาก relational model ต้องรักษาสองรูปเมื่อต่อ DB | กลาง แต่ภาระต่อเนื่องสูง |

## สัญญาที่เสนอ (ทาง A)

- `ISchoolBotDbAdapter` + `ISchoolBotBackingStore` มี `CommitProjectAsync` แทนการเรียก `SaveProjectAsync` → `SaveProjectRevisionAsync` สำหรับ create/save · ไม่เหลือเมธอดเขียนแยกเป็นทางลัด · metadata/delete ห้ามเปลี่ยน revision pointer โดยพลการ
- Input: `ProjectId:int?` (null = create) · `SchoolId`, `OwnerKind: student|employee`, `OwnerId` จากบริบทที่ตรวจสิทธิ์แล้ว · `Mode: block|arm|code` · `Name` 1–200 · `Content: ProjectContent` ตาม DES-003 · `ExpectedETag` (null ตอน create, บังคับตอน update)
- Server-managed: PK, เลข Revision, `CurrentRevision`, `ContentHash`, audit/เวลา · owner/school/mode ของงานเดิมเปลี่ยนไม่ได้
- Output: `ProjectCommitResult { Project, Revision }` ที่ commit แล้วจริง (record เดิม 23 properties)
- ลำดับ: อ่านสถานะ authoritative → ตรวจ context/ETag → สร้าง candidate → commit ทั้งคู่ → publish cache/คืนผล
- Failure: ก่อน commit = ไม่เปลี่ยนสถานะ · outcome ไม่ทราบ = invalidate/reload cache ห้ามเดาว่า rollback แล้ว ห้าม retry create อัตโนมัติ
- Errors คง envelope เดิม: 400 `INVALID_INPUT` · 404 `NOT_FOUND` · 428 `PRECONDITION_REQUIRED` · 412 `VERSION_CONFLICT` · 503 `SERVICE_UNAVAILABLE` (ไม่ใช้ `STORE_UNAVAILABLE` ของ local)
- ต่อ store: **File** snapshot เดียว `{format:1, projects[], revisions[]}` เขียน temp แล้ว replace ครั้งเดียว · **Memory** สลับ snapshot ใต้ lock เดียว · **PostgreSQL** transaction เดียว insert Revision + update Project ไม่แทนทั้งตาราง ไม่เพิ่ม UNIQUE/FK/CHECK (decisions-044)
- ข้อจำกัด: ความทนทาน kill/power-loss ของ file ยังไม่พิสูจน์ (ต้องตรวจ flush/close/replace) · Cloud operation เต็มยังต้องรวม idempotency/audit ตาม project-api-001

## Delta แบบที่จะออกหลังอนุมัติ (ยังไม่บันทึก)

| เอกสาร | delta |
|---|---|
| project-api-001 Rev1 → Rev2 | ขอบเขต `CommitProjectAsync`, ผลก่อน/หลัง commit, unknown outcome · แก้บรรทัด 26 composite FK → logical relation ตาม DDL |
| DES-004 Rev11 → Rev12 | persistence boundary ร่วม + cache authority · คง auth/tenant re-check และ Session+idempotency+audit transaction เดียว |
| data-contract-rules Rev10 → Rev11 | ห้ามเผย Project/pointer ก่อน Revision commit · ห้ามใช้ compensation เป็นหลักประกัน atomicity |
| data-model Rev8 | ไม่เปลี่ยน schema (ไม่มี DBML/SQL ใหม่) |
| local-project-boundary-001 | ไม่เปลี่ยน (Go local คนละขอบเขต) |
| AC/TP | ไม่แก้ข้อความ AC · tp/check ผูก fault points กับ slice/รอบถัดไป — oracle เดิมของ BE-002 S1 ไม่เลื่อน |

## Invariant สำหรับ check รอบถัดไป

1. หลัง restart ทุก Project ที่ไม่ลบมี Revision ตรง `(ProjectId, CurrentRevision, SchoolId)` หนึ่งรายการพอดี และทุก Revision มี Project แม่
2. create/save ที่สำเร็จคืน metadata/content/pointer/ETag ตรงกับ store หลังเปิด instance ใหม่ — ทั้ง Project แรกและลำดับถัดไป
3. fault ก่อน commit ทุกจุดคงสถานะเดิมทั้ง cache/store และ commit ถัดไปไม่พาข้อมูลที่ล้มติดไป
4. kill/cancel/lost response รอบจุด commit เหลือสถานะก่อนหรือหลังครบชุด · outcome ไม่ทราบต้องไม่แสดงว่าสำเร็จและไม่ retry create อัตโนมัติ
5. update ด้วย stale ETag ไม่เขียนอะไร · update สำเร็จเพิ่ม Revision ครั้งเดียว คง owner/school/mode ไม่แก้ Revision เก่า
6. init ที่โหลดล้มแล้ว retry ไม่ซ้ำ/ไม่เผย snapshot ครึ่งชุด · regression License/Session single-write คงสถานะเมื่อ write ก่อน commit ล้ม

## ขอบเขตงาน sys หากอนุมัติ

แก้ interface สองตัว, adapter, file/memory store และ callers/fault stores ใน contract tests · เลิกลำดับสองขั้นใน create/save · เพิ่มเคส update/cache และ fault ก่อน–หลัง commit · รัน F2/scoped/regression เดิม + invariant ข้างบน · ข้อมูล file เดิม: เตรียมนำเข้าสองไฟล์เป็น snapshot แบบ offline ตรวจ relation ก่อน ไม่ลบ/ซ่อม orphan เงียบ ไม่ fallback ไฟล์เก่า และไม่แตะข้อมูลจริงก่อนผู้ใช้เลือกวิธี · vault ทบทวน transaction/parity ตอน DBA-003/G-CORE

## รอผู้ใช้ตัดสิน

1. อนุมัติทาง A (เปลี่ยน internal interface + รูปแบบ file store) และเปิดรอบแก้ F2 ใหม่ตามขอบเขตนี้ หรือไม่ — ถ้าไม่: รับความเสี่ยงเป็นลายลักษณ์อักษร / ปรับขอบเขต / ยุติ
2. ข้อมูล file store เดิม (สองไฟล์) จัดการอย่างไรก่อนนำเข้า — ห้ามถือว่าทิ้งได้จนกว่าจะยืนยัน

## Change Log

- 2026-11-02 — สร้างจาก handoff ของ arch run lbzv8b (นายช่าง สกัดเนื้อหา)
- 2026-11-02 — ผู้ใช้อนุมัติทาง A (มติ051) · delta บันทึกจาก arch run G4xiP6 (agy T1 — Codex ติดโควตา)
