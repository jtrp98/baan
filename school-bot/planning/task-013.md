# ใบงาน 013 — arch sync สัญญาจาก spec รอบ 001

วันที่ของงาน: 2026-10-23 · งานเอกสารจาก task-011 ผู้ใช้สั่งส่งต่อ

spec DONE และผู้คุมบันทึกแล้วที่ planning/spec-review-001.md และ spec-response-001.json; requirement/index.md รวม 44 REQ/180 AC เพิ่ม 036-05,046-05/06,047-05,049-05,051-05; ไม่มี OQ ใหม่ 3 PARTIAL/9 CLOSED มติ decisions-032..034 คือมนุษย์ตัดสินแล้ว ห้ามถามย้ำ/เรียกว่ารออนุมัตินโยบายเดิม

ผล vault พร้อมแล้ว (บันทึกหลังเริ่ม arch): อ่าน db/review-006.md และ planning/vault-response-001.json เพิ่ม พบ V012-02..08 เป็น design gaps: Sources เดียว10000, mapping queued/running/unknown ต้องล็อกและห้ามsoftdelete/retireหลบ, freeze policy/run, allow-listครู, missingรายช่อง, durable receipt/hash/lease fencing/partial retry, และ Submission ไม่มี CourseRunId ต้องพิสูจน์ขอบเขตผลต่อรอบเรียน ถ้าเก็บcontextเดิมแยกไม่ได้ให้เสนอphysicaldeltaต่อhuman ไม่เพิ่มเอง; V012-09 ยอดจริง32ตาราง/450ฟิลด์/40FK/24UQ/80CHECK/13uniqueIndexes/nonunique0 แก้คำอธิบายเก่าโดยคงประวัติ รอบนี้ schema_delta_required=false หมายถึงยังไม่เสนอdelta ไม่ใช่ยืนยันว่าปิดทุกgapแล้ว

อ่าน index-first knowledge/school-bot/index.md, requirement/index.md, design/index.md, db/index.md แล้วไฟล์ต่อไปนี้ตามขอบเขต: planning/spec-review-001.md, spec-response-001.json; requirement/decisions-024.md,025.md,032.md,033.md,034.md, req-036.md,038.md,039.md,046.md,047.md,048.md,049.md,050.md,051.md,052.md; design/des-004.md,005.md,008.md,009.md,010.md,011.md,012.md, data-contract-rules.md, data-model.md, data-json-001.md, risks.md, archive.md, schoolbot.dbml, schoolbot-integration.dbml, dbml-guide-001.md, data-dictionary/index.md, contract-index.md และหน้าที่ลิงก์ตรงเฉพาะที่ต้องแก้; db/schoolbot_db.sql,schoolbot_db_rollback.sql,review-005.md,proposal-learnerkind.md

as-built ต้องตรวจจริงเฉพาะ target/school-bot/web/src/SchoolBot.Api/Program.cs, SchoolBot.Application/ManagementService.cs, SchoolBot.Infrastructure/Persistence/InMemoryManagementStore.cs (พาธแยกโปรเจกต์ที่อยู่ใต้ web/src), target/school-bot/app/desktopservice.go; ถ้าต้องพิสูจน์ grade identifiers ตามลิงก์ exact source ใน des-008/009 หรือ dictionary ได้ ไม่อ่าน secrets ไม่รัน DB/build/hardware ไม่แก้ code/SQL

แก้ให้ครบ: teacher profile employee ห้าม Cloud submission/attempt ทุกทางรวม Guest import แต่เก็บprojectCloudได้; Sources mappingหนึ่งช่องหนึ่งกิจกรรม/100% sourceเดียวอย่างถาวร หนึ่งactivityไปหลายslotได้; ช่องเดิมเท่านั้น; ส่งแล้วmappingimmutableรวมsoft-delete/retire/สร้างชุดใหม่เพื่อทับslotเดิม; partial-export/pending outbox ล็อกตั้งแต่เมื่อใดและสร้างชุดใหม่อย่างไรให้ไม่เลี่ยงมติ; exportสูตรearned/max*targetMax decimal half-up และ missing=skipแยกจริง0; freeze ScoringPolicyต่อCourseRunเมื่อเริ่มรอบ น้ำหนักใหม่ใช้CourseRunใหม่; สูตรSUM(normalized*weight)รวม100%, quizไม่นับ0, เลื่อนLevelนับrosterทุกคนงานขาด0; ครูoverrideได้เฉพาะtime/window ข้ออื่นส่วนกลาง ซ่อมรายคนและคะแนนสูงสุดไม่มีเพดานคงเดิม

ใช้ schema 32ตาราง/450ฟิลด์เดิมหากรองรับ แยกSQLconstraintsกับtransaction/applicationinvariants ระบุerror/lock/recheck/idempotency/durableevidenceที่จำเป็น ถ้าพบphysical/schemaใหม่จำเป็นให้เสนอdeltaเป็นhuman gateพร้อมเหตุผล ไม่ทำเอง อย่าเพิ่มโครงสร้างเพื่อเก็บflagถ้าderiveจากreceipt/outbox/snapshotเดิมได้ ถ้ามีvault review006ที่db/index.mdแล้วให้ใช้ด้วย (อาจกำลังรัน จึงไม่รอหากยังไม่มี)

output read-only แบบกระชับ: ผู้คุมจะบันทึกและarchiveทุกไฟล์designก่อนแก้ที่ design/archive/2026-10-23-before-decisions-032-034/<relative-path> โดยคงbyteเดิม ให้ส่ง editsของarchive.md และdesign/index.mdให้ตรงด้วย

ห้ามเขียนไฟล์/เรียกroleซ้อน คืน fenced JSON เดียว ไม่ต้องเล่าประวัติซ้ำ:
{"state":"DONE|NEEDS_REQUIREMENT_CHANGE|NEEDS_HUMAN","summary":"...","edits":[{"path":"knowledge/school-bot/design/...","old":"ข้อความที่ตรงหนึ่งตำแหน่ง","new":"ข้อความใหม่"}],"new_files":[{"path":"...","content":"..."}],"schema_changes":[],"as_built":["source:line fact"],"remaining_gates":["..."],"handoff_gm":["..."],"handoff_vault":["..."]}

Amendไม่regenerate ทำ Rev/ChangeLog 2026-10-23 ให้ไฟล์ที่แก้ ใช้ภาคผนวกcanonicalรวมกฎได้แล้วlinkจากแต่ละDESและลบข้อความรอOQที่ตอบแล้ว/กฎเก่าขัดกันเฉพาะจุด ไม่ย่อข้อความที่ไม่เกี่ยว ขนาดoutputเป้าหมายไม่เกิน25000ตัวอักษร มีexactpatchพอบันทึกจริง หากแก้DBMLnotesให้ระบุชัดphysicalstructureไม่เปลี่ยน ผู้คุมจะตรวจparser/semanticก่อนหลังอีกครั้ง ไม่ต้องยกmodel450ฟิลด์ทั้งก้อน

## Change Log

- 2026-10-23 — arch DONE บันทึก patches/สอง canonical rules และ archiveแล้ว; ผู้คุมตรวจ DBML parser/semanticผ่านและSQLhashเดิมตาม design/dbml-review-002.md

- 2026-10-23 — นายช่างแนบหลักฐาน vault review-006/response-001 ให้ arch ตรวจตาม instruction อ่าน review ล่าสุดก่อนสรุป

- 2026-10-23 — นายช่างรับ spec 44/180 และส่ง arch ปรับสัญญาโดยคงขอบเขต gate/SQL เดิม
