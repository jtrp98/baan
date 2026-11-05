---
legacy: true
---
# ข้อผิดพลาด สิทธิ์ และ accessibility ของหน้าจัดการหลักสูตร

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เอกสารนี้กำหนดข้อความและทางออกเมื่อ admin พบข้อผิดพลาด สิทธิ์ไม่พอ หรือ session ใช้ไม่ได้ รวมมาตรฐานภาพและ accessibility ของหน้าจัดการหลักสูตร

## S4. Error → ทางแก้

| ผลสัญญา | คำไทย/การกระทำที่เสนอ |
|---|---|
| 400 INVALID_INPUT/INVALID_REQUEST | “ข้อมูลยังไม่ถูกต้อง — ตรวจช่องที่ระบุแล้วบันทึกอีกครั้ง”; ใช้ details.field เมื่อมี ไม่เดาจาก message |
| 409 FOUR_EYES_REQUIRED | “ผู้สร้างหรือผู้แก้ร่างเผยแพร่ฉบับนี้เองไม่ได้ — ให้ผู้ตรวจอีกคนดำเนินการ” |
| 409 CRITERIA_NOT_APPROVED / POLICY_NOT_CONFIGURED | “ยังเผยแพร่ไม่ได้ — เติมหลักฐานเกณฑ์หรือการตั้งค่าที่ระบุ”; กลับร่าง |
| 409 QUESTION_KIND_UNSUPPORTED | “ชนิดข้อสอบนี้ยังไม่รองรับ — ใช้ปรนัยหรือถูก/ผิด” |
| 409 STATE_CONFLICT / CONTENT_NOT_PUBLISHED | “สถานะรายการเปลี่ยนแล้ว — โหลดข้อมูลล่าสุดก่อนดำเนินการ” |
| 412 VERSION_CONFLICT | “มีผู้อื่นแก้ฉบับนี้แล้ว — โหลดฉบับล่าสุดและตรวจการแก้ไขอีกครั้ง”; ไม่ทับ/merge เงียบ เก็บสิ่งที่ยังไม่ได้ส่งให้ทบทวน ใช้ ETag ใหม่หลังอ่านและยืนยันใหม่เท่านั้น |
| 428 PRECONDITION_REQUIRED | “ยังบันทึกไม่ได้ — โหลดข้อมูลล่าสุดแล้วลองอีกครั้ง”; เป็นปัญหาการเชื่อมของทีม ไม่ให้ผู้ใช้กรอกรหัสเอง |
| 409 IDEMPOTENCY_CONFLICT / EXPIRED | คำขอเดิมเนื้อหาต่าง: “ข้อมูลคำขอไม่ตรงกัน — ตรวจรายการเดิมก่อน”; หมดอายุ: ใช้ S3 ไม่สั่งสร้างคำขอใหม่ทันที |
| 413/415 | “ข้อมูลมีขนาดเกินหรือรูปแบบไม่รองรับ — ตรวจต้นทางก่อนลองใหม่”; แสดง limit เฉพาะที่สัญญานั้นระบุ |
| 429 | “ทำรายการถี่เกินไป — รอตามเวลาที่ระบบแจ้ง”; ใช้ Retry-After ที่ตรวจแล้ว ไม่ retry mutation อัตโนมัติ |
| 500/503 หรือ HTTP API Gateway (`sb-api-gateway`) envelope ที่ไม่มี domain code | “ระบบยังดำเนินการไม่ได้ — ลองโหลดใหม่หรือติดต่อผู้ดูแล”; ถ้าส่ง mutation แล้วใช้ S3 ไม่เดาผลจากข้อความ |

## S5. Auth, role และ tenant

ก่อนเข้า/ก่อนบันทึกให้ server ตรวจ session, Channel, role และสิทธิ์สด UI ซ่อนเมนูไม่แทน authorization

- 401: “การเข้าสู่ระบบสิ้นสุดแล้ว — เข้าสู่ระบบอีกครั้ง” ปิด mutation และไม่ส่งคำขอค้างต่อหลัง Login อัตโนมัติ ตรวจผลเดิมก่อน
- 403 STAFF_ROLE_REQUIRED/CHANNEL_NOT_ALLOWED: “บัญชีนี้ไม่มีสิทธิ์จัดการเนื้อหาส่วนกลาง — ใช้บัญชีที่ได้รับมอบหมาย” ไม่แนะนำใช้บัญชีร่วม
- 403 SCHOOL_MISMATCH/NOT_FOUND: “ไม่สามารถเข้าถึงรายการนี้ได้ — กลับไปยังรายการที่คุณมีสิทธิ์” ไม่เผยข้อมูลโรงเรียนอื่น
- 403 LICENSE_REQUIRED สำหรับ school_web: “โรงเรียนยังไม่มีสิทธิ์ใช้งานที่ใช้งานได้ — ติดต่อผู้ดูแลโรงเรียน”; ไม่บังคับ device binding บนเว็บหรือเพิ่ม License gate ให้ staff_admin เอง
- 503 AUTH_NOT_CONFIGURED/AUTH_UNAVAILABLE: “ยังตรวจสอบสิทธิ์ไม่ได้ — ติดต่อผู้ดูแลหรือลองใหม่ภายหลัง”; ไม่ให้สิทธิ์ชั่วคราว

เนื้อหากลาง SchoolId=null แยกจากโรงเรียนต้นสังกัดของ StaffRole ไม่เพิ่มตัวเลือก SchoolId เพื่อยกสิทธิ์ หลักฐาน: [des-012.md](../../../../../school-bot/build/design/des-012.md); [des-005.md](../../../../../school-bot/build/design/des-005.md)

## S6. SchoolBright และ accessibility (a11y — การเข้าถึงสำหรับผู้ใช้ทุกกลุ่ม)

ข้อเสนอส่วนนี้ใช้กับ admin ส่วนกลางใน school-bot; school_web ยึดกฎ repo ตาม [T4](int-006-admin-review-signoff.md#source-limitations) โดยใช้ DESIGN/shared props เดิมสำหรับ component/font/spacing และ P9 สำหรับ loading ไม่บังคับค่าของ skill ข้าม repo

ข้อเสนอ: Sidebar+Header, spacing ทวีคูณ 8px, radius12; TH Sarabun New body18/36 ตาราง16/32 หัว24/48 ตามกฎ line-height 2 เท่า ใช้ stack/component กลางที่เจ้าของ repo ยืนยัน ไม่เสนอ migration หรืออ้างตรวจ component แล้ว

Web primary #09C6DD ใช้ตัวอักษร #1F262D บนปุ่ม พื้น #FFFFFF/#F4F5F9 ค่าคอนทราสต์คำนวณจาก token: ดำ/ขาว 15.29:1 เทา #646464/ขาว 5.92:1 แดง #DA1A0C/ขาว 5.08:1 ดำ/cyan 7.38:1; cyan/ขาว 2.07:1 จึงไม่ใช้เป็นข้อความปกติบนขาว ทุกคู่ข้อความต้อง ≥4.5:1

Touch target ≥48×48px; focus เห็นชัดด้วย token เข้มและไม่ถูก sticky bar บัง มี label/aria-describedby/aria-invalid; summary error รับ focus แล้วพาไปช่องผิด ตารางมี caption/header ปุ่มไอคอนมีชื่อไทยและ tooltip เปิดได้ด้วย keyboard dialog trap focus/Escape/คืน focus จุดเดิม เริ่ม focus ปุ่มยกเลิกใน dialog เผยแพร่

ใช้ role=status สำหรับโหลด/สำเร็จ role=alert สำหรับผิดพลาดสำคัญ ไม่ประกาศซ้ำทุก render สถานะใช้ข้อความร่วมกับสี; เคารพ reduced-motion ไม่มี animation ตกแต่ง Spinner ใช้ข้อความคงที่ทดแทนการหมุนเมื่อ reduced-motion

UI ไทยเป็นหลัก เปลี่ยนภาษาแล้วทั้งหน้า รวม aria/copy: “บันทึกฉบับร่าง / Save draft”, “ตรวจร่างและเผยแพร่ / Review and publish”, “ยังไม่ทราบผล / Outcome unknown” เป็นข้อความ i18n ไม่ใช่ field ใหม่

## หลักฐาน

- `design/des-005.md:136`; `design/des-010.md:110–119`; `design/data-contract-rules.md:47–66`; `design/gateway-grpc-contract-001.md:101–120` แสดง request_id ที่ผ่านการกรองให้แจ้งผู้ดูแล ไม่โชว์ token/claims
- `design/des-012.md:49–78,87–95`
- `design/des-005.md:20`
- อ้าง skill `C:/Users/jabja/.codex/plugins/cache/claude-cowork/anthropic-skills/1.0.0/skills/school-bright-design/SKILL.md:65–105,122–155,188–209,234–267,293–335`
