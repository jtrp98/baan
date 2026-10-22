# Physical Schema & SQL Migration Review — SchoolBot (Rev2)

> หมายเหตุ MYCELIUM 2026-10-22: ผู้ใช้สั่งถอน index `ix_schoolbot_license_active_school` และรวมไฟล์ต่อ database — ดู [review-003](review-003.md)

วันที่: 2026-10-22
บทบาท: Database Advisor (`dba`)
อ้างอิง: [decisions-026.md](../requirement/decisions-026.md), [decisions-025.md](../requirement/decisions-025.md), [amendment-proposal-001.md](../design/amendment-proposal-001.md), [amendment-proposal-002.md](../design/amendment-proposal-002.md), [DES-004](../design/des-004.md), [DES-012](../design/des-012.md), [review-001.md](review-001.md)
สถานะ: ปรับตาม baseline ที่ผู้ใช้อนุมัติใน `decisions-026` — **รอคนรันบนฐานทดสอบและส่งหลักฐานให้ `DBA-003` (ห้ามรันอัตโนมัติ)**

---

## 1. ผลการประเมิน 2 จุดที่ผู้ใช้สั่งแก้ใน `decisions-026`

### จุดที่ 1: Session ช่องทาง `school_web` ต้องตรวจว่าโรงเรียนมี SchoolBot License active (ไม่ต้องมี device binding)

1. **การประเมิน Schema และ Constraint**:
   - ใน `db/002_identity_session_staff.sql` ตาราง `"SchoolBotSession"` มี `CONSTRAINT "CK_SchoolBotSession_ChannelDesktopFields"` ที่กำหนดว่า:
     - เมื่อ `"Channel" = 'desktop'` ต้องมี `"DeviceJkt" IS NOT NULL` และ `"AccountId" IS NOT NULL`
     - เมื่อ `"Channel" IN ('school_web', 'staff_admin')` ต้องมี `"DeviceJkt" IS NULL`
   - ตาราง `"SchoolBotSession"` ไม่ได้ผูก Foreign Key ไปยัง `"SchoolBotLicense"` หรือ `"SchoolBotLicenseBinding"`
   - ในตาราง `"SchoolBotLicense"` (`db/001_base_license_release_atomic.sql`) คอลัมน์ `"CurrentBindingId"` เป็น `integer NULL` อยู่แล้ว ดังนั้นโรงเรียนที่มีใบอนุญาตที่ยังไม่หมดอายุ (`"ExpiresAt" > now()`) และยังไม่ถูกเพิกถอน/ลบ (`"RevokedAt" IS NULL AND "IsDelete" = false`) จึงถือว่ามี active license ของโรงเรียนได้ทันที แม้ยังไม่มีเครื่อง Desktop ใดทำการ activate (`"CurrentBindingId" IS NULL`)
2. **การประเมิน Index และ Query Pattern (สิ่งที่ต้องเพิ่มใน `db/001`)**:
   - **Query pattern จริง**: ทุกครั้งที่แลก session ช่องทาง `school_web` (`POST /v2/auth/web-sessions` ตาม `DES-012` ขั้นที่ 6) และเมื่อตรวจสิทธิ์ของ `school_web` ระบบต้องเช็กว่าโรงเรียนนั้นมี active license อย่างน้อย 1 ใบหรือไม่:
     ```sql
     SELECT 1
     FROM public."SchoolBotLicense"
     WHERE "SchoolId" = @schoolId
       AND "RevokedAt" IS NULL
       AND "IsDelete" = false
       AND "ExpiresAt" > @now
     LIMIT 1;
     ```
   - ใน Rev1 ตาราง `"SchoolBotLicense"` มีเพียง `UNIQUE ("SchoolId", "SchoolBotLicenseId")` ซึ่งไม่ได้กรองแถวที่ถูกเพิกถอนหรือลบ และไม่ได้เรียงตาม `"ExpiresAt"`
   - **การปรับปรุงใน Rev2**: เพิ่ม partial index `"ix_schoolbot_license_active_school"` ใน `db/001_base_license_release_atomic.sql`:
     ```sql
     CREATE INDEX IF NOT EXISTS "ix_schoolbot_license_active_school"
         ON public."SchoolBotLicense" ("SchoolId", "ExpiresAt" DESC)
         WHERE "RevokedAt" IS NULL AND "IsDelete" = false;
     ```
   - **ผลกระทบฝั่งการเขียน (Write Overhead)**: ต่ำมาก เพราะ `"SchoolBotLicense"` เป็นตารางที่เกิดรายการเมื่อออก/ต่ออายุ/เพิกถอนใบอนุญาตของโรงเรียนเท่านั้น ไม่ใช่ตาราง high-frequency write

---

### จุดที่ 2: Desktop bind ได้ทั้งนักเรียนและครู (`ProfileKind` = `student` หรือ `employee`) ใช้เรียน/ลองเท่านั้น

1. **การตรวจสอบ `CHECK` Constraints ใน `db/002_identity_session_staff.sql` และ `db/004_course_run_policy_attempt_submission.sql`**:
   - **`SchoolBotSession`** (`db/002_identity_session_staff.sql` บรรทัด 40–48):
     - `CONSTRAINT "CK_SchoolBotSession_ProfileKind" CHECK ("ProfileKind" IS NULL OR "ProfileKind" IN ('student', 'employee'))`
     - `CONSTRAINT "CK_SchoolBotSession_ChannelDesktopFields" CHECK (("Channel" = 'desktop' AND "DeviceJkt" IS NOT NULL AND char_length("DeviceJkt") = 64 AND "AccountId" IS NOT NULL) OR ("Channel" IN ('school_web', 'staff_admin') AND "DeviceJkt" IS NULL))`
     - **ผลลัพธ์**: Constraint ใน Rev1 **ไม่ได้จำกัด** ให้ `Channel = 'desktop'` ต้องมี `ProfileKind = 'student'` เท่านั้น ดังนั้นเมื่อครู login บน Desktop และเรียก `PUT /v2/auth/session` เพื่อ bind `ProfileKind = 'employee'` จึงผ่าน constraint ของ `"SchoolBotSession"` ได้ทันที
   - **`SchoolBotProject`** (`db/002_identity_session_staff.sql` บรรทัด 144):
     - `CONSTRAINT "CK_SchoolBotProject_OwnerKind" CHECK ("OwnerKind" IN ('student', 'employee'))`
     - **ผลลัพธ์**: รองรับให้ทั้งนักเรียน (`student`) และครู (`employee`) เป็นเจ้าของโปรเจกต์เมื่อใช้งานโหมดเรียน/ทดลองบน Desktop อยู่แล้ว
   - **`SchoolBotSubmission` และ `SchoolBotAttempt`** (`db/004_course_run_policy_attempt_submission.sql` บรรทัด 141, 283):
     - คอลัมน์ `"LearnerId" integer NOT NULL` เป็น logical ID (`I`) ที่ไม่มี physical FK ผูกติดกับ `"TUser"` (เนื่องจากกฎไม่สร้าง FK ผูกตาราง legacy) จึงไม่เกิดข้อขัดแย้งระดับ schema
2. **ข้อควรระวังระดับ Application (สำหรับ `be` / `sa`)**:
   - เมื่ออนุญาตให้ครู (`ProfileKind = 'employee'`) ใช้ Desktop เพื่อเรียน/ลองได้ ต้องระวังกรณีที่ครูส่งงานหรือทำแบบทดสอบ (`SchoolBotSubmission` / `SchoolBotAttempt`) ว่าหากใช้ `SEmp` เก็บใน `"LearnerId"` ซึ่งอาจมีเลขตรงกับ `SId` ของนักเรียนใน `"TUser"` ระบบคำนวณคะแนนส่งออก (`DES-009`) และระบบเลื่อนระดับชั้น (`DES-011`) จะต้องกรองเฉพาะสมาชิกใน roster นักเรียนของห้องเรียนเท่านั้น (หรือป้องกันไม่ให้ session ของ `employee` เขียนทับผลของนักเรียนที่มี ID ชนกัน)

---

## 2. สรุปความเปลี่ยนแปลงรายไฟล์ (Diff จาก Rev1)

| ไฟล์ SQL | สถานะใน Rev2 | รายละเอียดการเปลี่ยนแปลงจาก Rev1 |
|---|---|---|
| `db/001_base_license_release_atomic.sql` | **แก้ไข (Rev2)** | เพิ่ม partial index `"ix_schoolbot_license_active_school"` บน `"SchoolBotLicense" ("SchoolId", "ExpiresAt" DESC) WHERE "RevokedAt" IS NULL AND "IsDelete" = false` และอัปเดตหัวไฟล์อ้างอิง `decisions-025/026` |
| `db/001_base_license_release_atomic_rollback.sql` | **แก้ไข (Rev2)** | เพิ่ม `DROP INDEX IF EXISTS public."ix_schoolbot_license_active_school";` ก่อน `DROP TABLE public."SchoolBotLicense";` |
| `db/002_identity_session_staff.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | ตรวจแล้ว `"CK_SchoolBotSession_ProfileKind"`, `"CK_SchoolBotSession_ChannelDesktopFields"` และ `"CK_SchoolBotProject_OwnerKind"` รองรับทั้ง `'student'` และ `'employee'` บน `desktop` และรองรับ `school_web` แบบไม่มี `DeviceJkt` ครบถ้วนแล้ว |
| `db/003_learning_content_global.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | ตรงตาม baseline `amendment-proposal-001/002` ที่อนุมัติแล้ว |
| `db/004_course_run_policy_attempt_submission.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | ตรงตาม baseline `amendment-proposal-001/002` ที่อนุมัติแล้ว |
| `db/005_grade_slot_mapping_preview_export.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | ตรงตาม baseline `amendment-proposal-001/002` ที่อนุมัติแล้ว |
| `db/006_level_proposal.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | ตรงตาม baseline `amendment-proposal-001/002` ที่อนุมัติแล้ว |
| `db/007_pggradedb_grants.sql` (+ rollback) | **ไม่เปลี่ยน (คง Rev1)** | คงการบล็อกด้วย release gates ทั้ง 5 ของ `DES-009` ตาม `decisions-026` |

---

## 3. ผลกระทบต่อแผนย้อนกลับ (Rollback Impact)

- การเพิ่ม `"ix_schoolbot_license_active_school"` เป็นการเพิ่ม index บนตารางใหม่ `"SchoolBotLicense"` เท่านั้น
- ใน `db/001_base_license_release_atomic_rollback.sql` ได้เพิ่มคำสั่ง `DROP INDEX IF EXISTS public."ix_schoolbot_license_active_school";` ไว้ก่อน `DROP TABLE IF EXISTS public."SchoolBotLicense";` เพื่อให้ rollback สะอาดและ idempotent แม้ในกรณีที่ต้องการถอนเฉพาะ index
- ลำดับการรัน rollback ทั้งชุด (`007` ย้อนกลับถึง `001`) และคำเตือนเรื่องการทำลายข้อมูลในตาราง `SchoolBot*` เมื่อ `DROP TABLE` ยังคงเดิมตาม `db/review-001.md` §6

---

## 4. เช็กลิสต์สำหรับ `DBA-003` ที่อัปเดตจาก Rev1

นอกเหนือจากคำสั่งตรวจสอบ 5 ข้อใน `db/review-001.md` §7 แล้ว เมื่อมนุษย์รัน migration บนฐานทดสอบและส่งหลักฐานให้ `DBA-003` ให้เพิ่มการตรวจรายการต่อไปนี้ใน **ข้อที่ 3 (ตรวจ Partial Indexes)**:

1. **ตรวจว่ามี Partial Index `"ix_schoolbot_license_active_school"` บนตาราง `"SchoolBotLicense"`**:
   ```sql
   SELECT indexname, tablename, indexdef
   FROM pg_indexes
   WHERE schemaname = 'public'
     AND tablename = 'SchoolBotLicense'
     AND indexname = 'ix_schoolbot_license_active_school';
   ```
   - *Expected*: พบ 1 แถว โดย `indexdef` มีเงื่อนไข `WHERE (("RevokedAt" IS NULL) AND ("IsDelete" = false))` บนคอลัมน์ `("SchoolId", "ExpiresAt" DESC)`

2. **ตรวจ `CHECK` Constraint ของ `"SchoolBotSession"` ว่าไม่บล็อก `employee` บน `desktop` และไม่บังคับ `DeviceJkt` บน `school_web`**:
   ```sql
   SELECT conname, pg_get_constraintdef(oid) AS constraint_def
   FROM pg_constraint
   WHERE conrelid = 'public."SchoolBotSession"'::regclass
     AND contype = 'c'
   ORDER BY conname;
   ```
   - *Expected*:
     - `"CK_SchoolBotSession_ProfileKind"` อนุญาต `'student'` และ `'employee'`
     - `"CK_SchoolBotSession_ChannelDesktopFields"` บังคับ `"DeviceJkt"` เฉพาะ `'desktop'` และบังคับ `"DeviceJkt" IS NULL` สำหรับ `'school_web'` และ `'staff_admin'`

---

## Change Log
- 2026-10-22 — สร้างเอกสารรีวิว Rev2 ตามมติ `decisions-026`: เพิ่ม partial index `ix_schoolbot_license_active_school` ใน `db/001` สำหรับตรวจ active license ของ `school_web`, ยืนยัน `CHECK` constraints ใน `db/002`–`007` รองรับ Desktop ทั้งนักเรียนและครูโดยไม่ต้องแก้ไฟล์ `002`–`007`, และอัปเดตเช็กลิสต์ `DBA-003`
