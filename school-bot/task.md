# school-bot — ใบงานกลั่น requirement

- วันที่: 2026-10-21
- งานต่อปัจจุบัน: [task-008.md](task-008.md) — BA amend REQ/AC
- คำสั่งผู้ใช้: อ่าน `C:/src/schoolbright/target/school-bot-v2` แล้วกลั่น requirement
- ผลส่งมอบ: REQ/AC/BR, มติผู้ใช้ และแบบ SA ของระบบเต็มใน knowledge `school-bot`
- วิธีทำ: BA/SA อ่านเอกสารเทียบโค้ดแบบ read-only; MYCELIUM บันทึกผลใน knowledge
- สถานะ: บันทึกแบบ 13 ไฟล์และ amendment Rev2 เรื่อง User/API/4 DB เดิม รวม mapping 31 REQ; ผลส่งต่อ NEEDS_HUMAN รอทบทวน schema/สัญญา ไม่ใช่อนุมัติ implementation หรือ release
- หลักฐาน: working tree ของ source repository ณ วันที่อ่าน; repository ยังไม่มี commit จึงไม่มี commit hash ให้ยึด
- ขอบเขต: วิเคราะห์และเสนอแบบระบบเต็ม แยกข้อเสนอจากของที่ implement แล้ว; ไม่แก้โค้ด รัน SQL หรือยืนยัน release แทนผู้ใช้
- IDs: กัน REQ-001..008 และ OQ-001..005 ที่พบใน Git index ของเอกสารชุดเดิมไว้ เริ่มชุดใหม่ที่ REQ-009 และ OQ-006

## SA dispatch — 2026-10-21

- งานต่อจากคำชี้แจงล่าสุด: ตรวจ Entities ของ `sb-tech-upgrade-academic` และแก้แบบเฉพาะ identity integration ตาม [decisions-010.md](requirement/decisions-010.md) โดยรักษามติและ REQ/AC เดิม
- เรียก SA จริงสำหรับงานทบทวนนี้ด้วย `mycelium-role --agent codex --role sa --tier t1 --date 2026-10-21 --cwd C:/src/schoolbright/target/sb-tech-upgrade-academic` แบบ read-only; รายงาน `C:/src/AICode/baan/baan/reports/2026-10-21-07-26-39-sa-tier-t1-1agents-qybkoL` ผลส่งกลับและ amendment บันทึกแล้ว
- SA รอบบัญชีเดิมส่ง source-review-002 และร่าง patch พร้อม NEEDS_HUMAN แล้ว; MYCELIUM บันทึก review และยังไม่ apply patch แรก เพราะมีคำชี้แจง API/4 DB ระหว่างงาน
- ผู้ใช้ตอบชัดว่า API ทั้งหมดรวม Login อยู่ `school-bot-v2/web` แอปเรียกใช้; ต่อ SA session เดิม `01a15d5a-e232-7d60-99c1-a120c4eda683` แบบ read-only ให้แก้ร่างตาม decisions-010/011 คำตอบ/JSONL เก็บชื่อ `codex.clarified.*` ในรายงานรอบบัญชีเดิม
- Session ที่ต่อจบ exit 0 พร้อมร่าง NEEDS_HUMAN; MYCELIUM เก็บต้นฉบับ 9 ไฟล์แบบ byte-for-byte พร้อม hash ใน [archive](design/archive.md) แล้ว apply patch 8 ไฟล์ design และ source-review-002 เป็น Rev2
- ผลล่าสุด: ถอนบัญชี SchoolBotUser ซ้ำ; legacy refs ใช้ int+SchoolId+kind; เสนอ SchoolBotSession/API ใน web และ colocate ตารางใหม่ใน School DB เพื่อไม่อ้าง atomic ข้าม DB ตำแหน่ง API ยืนยันแล้ว แต่ schema/placement/password compatibility ยังเป็นข้อเสนอ/หลักฐานที่ต้องตรวจต่อก่อน implementation
- เรียก `mycelium-role --role sa --tier t1` แบบ read-only จาก `target/school-bot-v2` หลังคำตอบหลักครบ
- รายงานตัวรัน: `C:/src/AICode/baan/baan/reports/2026-10-21-06-47-27-sa-tier-t1-1agents-khRokk`
- ขอชุด design/index, modules, data-model, DES-001..007, quality-attributes และ risks; MYCELIUM จะบันทึกเมื่อได้รับผล
- รอบแรกหมดเวลา 900 วินาทีก่อนมีคำตอบสุดท้าย; ไม่มีไฟล์ design จากรอบนั้น จึงต่อ session SA เดิม `01a15d37-067d-7093-88f9-8af6bed0822f` ด้วย `codex exec resume` แบบ read-only ภายใต้ model/effort เดิม ไม่ได้เปิด role สมมติในแชตนี้
- หลักฐานการต่อ session: `codex.resumed.stdout.jsonl`, `codex.resumed.stderr.txt` และไฟล์คำตอบเมื่อเสร็จ อยู่ในโฟลเดอร์รายงานเดิม; สถานะ timeout เดิมยังคงไว้ตามจริง
- การต่อ session จบ exit 0 และมี `codex.resumed.answer.txt`; SA ส่ง 12 file blocks และ handoff NEEDS_HUMAN ผู้คุมบันทึกเป็น 13 ไฟล์โดยแยก constraints/HTTP จาก data-model เพื่อให้ทุกไฟล์ไม่เกิน 10 KiB
- ผลส่งมอบ: [design/index.md](design/index.md), [data-model](design/data-model.md), [กฎข้อมูล/HTTP](design/data-contract-rules.md), DES-001..007, modules, quality-attributes และ risks
- ยังรอทบทวน schema/placement/password compatibility, breaking API/host behavior, storage migration และ trust ตาม [รายการของ SA](design/risks.md); ชนิด SchoolId และตำแหน่ง API ยืนยันแล้ว ไม่เปิด DBA/implementation ต่อเองในงานนี้

## ผลตรวจเอกสาร

- ชุดล่าสุด: 31 REQ / 109 AC และ design 13 ไฟล์; mapping ใน design ครบ REQ-009..039 ไม่มี REQ ขาด และลิงก์ภายในตรวจพบปลายทางครบ
- ทุกไฟล์ design มีวันที่/Change Log และขนาดไม่เกิน 10 KiB; การแยกไฟล์รักษาข้อเสนอ SA และ IDs เดิม ผล static checks ไม่ใช่การอนุมัติแบบหรือผล runtime
- ตรวจ source references ของแบบ 48 จุด: พบไฟล์และเลขบรรทัดอยู่ในขอบเขต; `git diff --check -- school-bot` ใน knowledge repository ผ่าน มีเพียงคำเตือน LF/CRLF
- ตรวจไฟล์ใหม่ 33 ไฟล์และ index/task ของ module รวม 35 ไฟล์: มี Change Log และวันที่ครบ
- REQ 24 แถวตรงกับไฟล์และจำนวน AC ทั้ง 78 ข้อ; IDs ของ AC ไม่ซ้ำ
- ตรวจลิงก์เอกสารและ source references แบบ `path:line` 115 จุด: มีไฟล์จริงและเลขบรรทัดอยู่ในขอบเขตไฟล์
- ไฟล์ REQ/OQ ไม่เกิน 4 KB ต่อไฟล์; scope ไม่เกิน 12 KB
- การตรวจครั้งนี้เป็นการตรวจเอกสารและอ่าน source ไม่ใช่ผลทดสอบพฤติกรรม แอป API installer หรือหุ่นจริง

## ขอบเขตหลักฐานที่ควรตรวจต่อเมื่อมีงาน SA

- ตัวแปล DSL ภายใน: SA ตรวจเพิ่มใน source-review-001.md แล้ว ยืนยัน 1–64 คำสั่ง เดิน 1–10 ช่อง รวมไม่เกิน 100 steps และ source 16384 bytes; ยังไม่รันทดสอบ
- Workspace actions ที่ไม่ได้อ่านในรอบ BA: ตรวจการสร้าง แก้ไข เรียงท่า และกลุ่ม เทียบกับ REQ-017 ซึ่งรอบนี้อ้างจากรูปแบบข้อมูลและ restore เป็นหลัก
- ตรวจข้อความจริงว่าแยก predicted position, uploaded-unverified, stop-requested และผล mock ของหน้าตัวอย่างชัดเพียงใด
- หลักฐาน runtime ของ connection loss, stop, macOS และ installer ยังไม่มีจากงานนี้

ประเด็นเหล่านี้เป็นขอบเขตการตรวจเพิ่มเติม ไม่ใช่ข้อสรุปว่าระบบทำงานผิดหรือการเปิดแผน implementation

## Change Log

- 2026-10-22 — BA: task-008.
- 2026-10-21 — OS: decisions-019; task-007.
- 2026-10-21 — ต่อ SA ตรวจ Win10 ตาม task-006
- 2026-10-21 — เปิด SA survey ตาม task-005
- 2026-10-21 — PM รับแผน ดู task-004.md
- ประวัติรอบก่อนเก็บครบที่ [task-history-001.md](task-history-001.md)
- 2026-10-21 — แยก Change Log เดิมเพื่อคุมขนาด task; ตรวจรอบล่าสุด 31 REQ / 109 AC, mapping 31 REQ, design 13 ไฟล์แบบ และลิงก์ภายในครบ; git diff --check ผ่าน มีเพียงคำเตือน LF/CRLF การตรวจนี้เป็น static document checks ไม่ใช่ QA runtime
