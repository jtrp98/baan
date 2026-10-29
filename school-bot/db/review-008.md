# Review 008 — runbook สำหรับมนุษย์: DBA-002 และ DBA-004

วันที่ของงาน: 2026-10-29 · vault · ตรึง DES-002 Rev3 / DES-003 Rev4 และ Oracle pack ใบงาน094

ผล: โครงสร้างร่างตรง AC ที่ตรวจจากไฟล์ได้; ยังไม่ปิด AC/catalog/runtime และไม่อนุมัติรันแทนคน อ่าน [ตาราง AC](review-008-ac.md), [parity/ข้อแก้เอกสาร](review-008-parity.md) และ [physical fields/กฎ Project](review-008-project.md) ประกอบ

## สิ่งที่ยืนยันแล้วกับหลักฐานที่ยังไม่มี

- แบบ H4 ของ G-CORE มีมติ025/026แล้วตาม `plan/evidence-002.md` แถว G-CORE; placement027, บัญชี029, UpdateDate030 และ PK-only044 ใช้ต่อได้ ไม่ถามอนุมัติแบบเดิมซ้ำ
- [decisions-045](../requirement/decisions-045.md): ผู้ใช้แจ้งว่าสร้างตารางแล้ว แต่ไม่ระบุ environment/ชื่อ DB/hash ที่รัน จึงเริ่มที่ catalog ของฐานเดิม ไม่เริ่มด้วย CREATE ซ้ำ
- รอบนี้ไม่ต่อ DB/รัน SQL; ไม่มีผล rollback/catalog/concurrency/API/restart และไม่ปิด G-CORE/G-PROJECT-DB หรือประตู signer/custody

## ลำดับสำหรับเจ้าของ DB

1. ระบุผู้รัน/environment/ชื่อฐานทดสอบจริง และหลักฐานว่า API ทดสอบใช้ฐานเดียวกันโดยปกปิด connection string; ชื่อ `SchoolBot` ยังเป็นสมมติฐาน ไม่อ่าน `.env`/secret เพื่อเติมข้อมูล
2. ตรวจทาน [catalog SQL](schoolbot_catalog_review.sql) แล้วมนุษย์รัน C0–C5 ใน read-only transaction เดียว เก็บผลครบ: C1 ทุกตารางผู้ใช้ต้องมีเจ้าของช่วยจำแนกว่าตารางใดเป็นผลิตภัณฑ์ ห้ามใช้การกรอง prefix อย่างเดียวพิสูจน์ว่าไม่มีตารางตกหล่น
3. เทียบ C2 รายชื่อ32ตาราง; C3 ครบ450ฟิลด์ตรง DDL/dictionary, หกฟิลด์ร่วมครบ, PK int4 identity ALWAYS; audit4ตัว NULL/default NULL; C4 PK32/UQ0/FK0/CHECK0; C5 backing PK indexes32 valid/ready ไม่มี standalone indexes ดู [expected ราย AC](review-008-ac.md)
4. ถ้าฐานเดิมไม่ตรง ให้หยุดและส่ง catalog ที่ปกปิดข้อมูลให้ vault/arch ออก delta เฉพาะฐานนั้น ไม่มี ALTER/ล้างข้อมูลในชุดนี้
5. เฉพาะฐานทดสอบใหม่ที่คนอนุญาตแยกต่างหากและไม่มีทั้ง32ตาราง: มนุษย์รัน `schoolbot_db.sql` ทั้งไฟล์ใน session เดียว โดยให้ client หยุดที่ error (ถ้าใช้ psql ตั้ง `ON_ERROR_STOP=1`); ห้ามรันเฉพาะ Section เพราะไฟล์ครอบทั้ง32ตาราง ไม่เพิ่ม grants ของ School/PGGradeDB
6. ตรวจ C0–C5 ซ้ำหลัง CREATE และใช้ฐานทดสอบแยกสำหรับ rollback proof; API save/open/race/restart และ Guest local เป็นงาน BE/check ตาม TP ในตาราง AC ไม่ใช้ catalog รับรองแทน

## จุด rollback และการคงข้อมูล

- ก่อน COMMIT หรือเมื่อเกิด error: `ROLLBACK;` ใน session เดิมโดยมนุษย์; การพบตารางเดิมทำให้ CREATE ล้มและย้อนทั้ง transaction
- หลัง COMMIT: `schoolbot_db_rollback.sql` ใช้ได้เฉพาะการสร้างใหม่รอบเดียวที่มีหลักฐานก่อนสร้างว่าไม่มี32ตาราง ไม่มี writer และทุกตารางยังว่าง guard ล็อก ACCESS EXCLUSIVE ตามชื่อเรียงลำดับและตรวจทุกตารางก่อน DROP; ไม่ใช้ CASCADE
- พบข้อมูลแม้1แถว/ตารางขาด/สิทธิ์อ่านไม่พอ/มี dependency: ต้องล้มทั้ง transaction แล้วคน ROLLBACK; ห้ามข้าม guard ห้ามใช้ DROP นี้กับฐานตาม045ที่ไม่ทราบ baseline คงตาราง/ข้อมูลและส่งออกแบบวิธีกู้ ไม่ย้อนเกรด legacy
- คนพิสูจน์บนฐานทดสอบแยก: (ก) fresh32ว่าง → rollback สำเร็จและ catalog ไม่เหลือ32ชื่อ (ข) fixture มีข้อมูล → guard ปฏิเสธและหลัง ROLLBACK ตาราง/ข้อมูลอยู่ครบ (ค) มีตารางเดิมแล้วรัน CREATE → error และไม่สร้างตารางค้าง ผลทั้งหมดรอคน ไม่ได้ทำในรอบนี้

## Receipt ที่ส่งกลับ

ผู้รัน/วันเวลาจริง/environment/ชื่อ DB, SHA256 ของไฟล์ที่รัน, revision ที่ review, คำสั่งและ exit code, C0–C5 ก่อน/หลัง, ผล rollback สามกรณีและข้อผิดพลาดที่ sanitize; raw output อยู่ `reports/school-bot/normal-094/` ไม่คัดเข้า knowledge ส่ง DBA-003/check ตรวจ ไม่ให้ role กรอกผลแทนผู้รัน

## ข้อรอคน

| Task / Reference | คำถาม · ผู้ตัดสิน | งานที่จะปลดล็อก |
|---|---|---|
| DBA-002 / AC-033-01..05,045 | เจ้าของ DB ยืนยันฐานที่ API ใช้และส่ง C0–C5 ได้หรือไม่? | DBA-003 ตรวจ deployed catalog |
| DBA-002+004 / CONVENTIONS9.2/9.6 | เจ้าของ schema/ผู้รัน review ชุด SQL และให้ receipt จากฐานทดสอบแยกได้หรือไม่? | หลักฐาน CREATE/rollback; G-CORE/G-PROJECT-DB ตาม gate จริง |
| DBA-004 / AC-011-01/02,036-02/03 | BE/check ส่งผล save/open ของ student+employee, race และ restart เมื่อเชื่อมจริงได้หรือไม่? | พิสูจน์พฤติกรรม Cloud/Guest; ไม่ขวาง stub |

## Change Log

- 2026-10-29 — ใบงาน094: เตรียม runbook, catalog และ rollback ที่คงข้อมูล; แยก H4 แบบเดิมจาก execution evidence ไม่รัน SQL
