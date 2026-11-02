# TP-001 — กลยุทธ์และเงื่อนไขก่อนตรวจ

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้กับ [ทางเข้า TP-001](tp-001.md) ทุกผลจริงยัง NOT_RUN

## สิ่งที่ต้องมีจากคน

- G-AUTH: sanitized credential/lookup/profile/roster/course-teacher fixtures ([BE-001 (Legacy auth)](../plan/index.md)) + H5 route/web-principal/staff_admin seed ก่อนรัน cases ฝั่ง Login/school_web/admin
- G-CORE/G-PROJECT-DB/G-LEARN-DB/G-RELEASE-DB: คนรัน test SQL/rollback/catalog และส่ง revision/hash/environment/ผลจริง ก่อน cases PF-API/PF-CATALOG ที่พึ่ง DB
- G-UX-ENTRY/PROJECT/LABS/LEARN: signed UX artifact ก่อนปิด expected ฝั่ง UI (ข้อความ/สถานะ/ปุ่ม)
- G-LEARN: signed content/criteria/pass-fail pairs/ผู้อนุมัติ revision ก่อนใช้ตรวจ [AC-037-05 (เมื่อยังไม่มีหลักฐานอนุมัติเนื้อหาและเกณฑ์…)](../requirement/req-037.md)/06, 038-01, 044-03 กับเนื้อหาจริง (ตอนนี้ใช้ synthetic fixture ติดป้าย test-only)
- G-HW: รุ่น/firmware/calibration/stop/disconnect/emergency-stop/platform matrix + คำสั่งอนุญาต motion/upload/torque ก่อน cases PF-HW-*
- G-DELIVERY: เครื่อง/signing/notarization/network/ช่องทางแจก + artifact signed MSI/PKG ก่อน cases PF-INST-*/PF-HW-*-INST
- G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB (export): ตาม evidence-002 ก่อน grade write cases ใน TP-003
- G-QA/G-SEC/G-RELEASE: ไม่เกี่ยวกับ TP-001 แต่ห้ามอ้างผ่านจาก plan นี้

## กลยุทธ์

- ระดับ: unit/static ก่อน; integration ที่ host(fake engine)/API(persistent test DB, ≥2 instances, fake clock); E2E/manual เฉพาะสิ่งที่ต้องเห็นจริง (window controls, installer, hardware) หนึ่ง case ครอบหลาย AC เมื่อ fixture เดียวกัน และ expected ตรวจแยกต่อ AC ได้
- evidence codes: E-TRACE=bridge/process trace+log (นับ spawn/คำสั่ง/ลำดับ); E-API=request/response+DB rows before/after+audit+instance logs; E-UI=screenshot/video+build hash; E-HW=engine exchange log (bytes_written/read)+บันทึกผู้สังเกต+ชื่อผู้อนุญาต; E-INST=installer log+artifact sha256+OS build+signing status; E-CAT=catalog query output จากคนรัน (revision/hash/env) ทุกชิ้นต้องระบุ build/commit hash และ profile
- หลักฐานแยกกัน ไม่ใช้แทนกัน: bridge/fake ≠ hardware; source-built ≠ signed installer; mock PGGradeDB ≠ G-PARITY/COEXIST/TARGET; script review/DDL static ≠ catalog runtime; OQ closed ≠ AC ผ่าน
- Fault/race ที่ต้องมีเสมอสำหรับ money/grade/auth/lease/update: duplicate/lost-response retry, concurrent writers (≥2 process), commit/signer fail, crash ระหว่าง commit, clock rollback/boundary (exp-1s/exp), revoked-during-commit, tenant/ID injection (cross-school, sId==sEmp), stale If-Match/ETag
- ไม่ใช้ sample/preview/mock เป็นหลักฐานของ native/Cloud/hardware; preview ตรวจเฉพาะ AC-013
- Hardware: TP ไม่กำหนด pass threshold เอง (latency ฯลฯ) เก็บเป็น observation รอเกณฑ์จากผู้รับรอง; ไม่ motion/upload/torque ก่อนมีคำสั่งอนุญาต
- TP-003 (depends TP-001+SA-004): รับ AC-049..052 ส่วน PGGradeDB ใช้ TP001-069..076 เป็นฐาน เพิ่ม parity/coexist/crash fixtures; TP-001 ตรวจ logic ฝั่ง SchoolBot/mock target ได้ก่อน แต่ไม่ปิด G-PARITY ฯลฯ
- expected ที่อ้างตัวเลข/รหัส error มาจาก AC/DES/learning-rules/grade-rules ตรง ๆ ค่าที่ไม่มีใน source ไม่ถูกสร้างใหม่



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · E2E = End-to-End หรือการตรวจครบเส้นทาง · DDL = Data Definition Language · OS = Operating System
