# TP-001 — สภาพแวดล้อมทดสอบ

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) ระบุเครื่อง ระบบจัดเก็บ และเงื่อนไขก่อนตรวจ ใช้กับ [ทางเข้า TP-001](tp-001.md#profiles) และ [กลยุทธ์](tp-001-strategy.md)

## Profiles

| ID | Platform | Store | Mode | Prerequisites |
| --- | --- | --- | --- | --- |
| PF-UNIT | any CI (Go/TS/C#) | in-memory | unit/domain | source commit hash |
| PF-STATIC | document/DDL review | db/schoolbot_db.sql, schoolbot.dbml | static | revision ของ SQL/DBML ที่ตรวจ |
| PF-HOST | Windows 11 25H2 x64 source-built Desktop host (Go/Wails) | local fs + fake credential store + fake clock | fake engine process/test bridge (ไม่แตะ hardware) | build/commit hash<br>fake clock+monotonic harness (TP-002) |
| PF-UI-WIN | Windows 11 25H2 x64 native UI source-built, WebView2 | local | fake bridge/test device | signed UX artifact ตาม gate ที่เกี่ยว สำหรับ expected ข้อความ/สถานะ |
| PF-UI-MAC | macOS 15+ Intel และ Apple Silicon native UI source-built | local | fake bridge | เครื่องทดสอบ Mac ทั้งสอง arch<br>signed UX artifact |
| PF-PREVIEW | browser preview=1 และ browser ไม่มี bridge | browser storage | preview/mock | network spy |
| PF-API | HTTP API Gateway→gRPC SchoolBot ≥2 instances | persistent transactional test SchoolBot DB (ไม่ใช่ shared env) | integration ผ่าน Gateway; fake clock; signer/KMS stub (ไม่ปิด signer จริง) | transport prerequisite/steps ที่ test-plan/index.md + human-run test SQL/rollback/catalog + revision/hash/env/runner (G-CORE/G-PROJECT-DB/G-LEARN-DB/G-RELEASE-DB); SchoolBot HTTP ตรงเป็น local subset เท่านั้น |
| PF-LEGACY | PF-API + Master/School DB sanitized fixtures | SchoolBot DB + School DB fixtures (read) | integration with legacy accounts/profile/roster/course-teacher | [BE-001 (Legacy auth)](../plan/index.md) evidence: password encoding/lookup/profile/tenant (G-AUTH)<br>ไม่เดา credential |
| PF-WEB | web-system school_web→same-origin BFF→HTTP API Gateway→gRPC SchoolBot service | PF-LEGACY | E2E/integration channel=school_web | transport prerequisite/steps ที่ test-plan/index.md; H5 route/BFF/private web-principal/env<br>signed UX (G-UX-LEARN) |
| PF-ADMIN | Next.js admin school-bot/web→same-origin BFF→HTTP API Gateway→gRPC SchoolBot service; channel=staff_admin | PF-API | E2E/integration | transport prerequisite/steps ที่ test-plan/index.md; H5/env/CSRF; staff_admin seed/roles<br>signed UX UX-005..007 |
| PF-GRADE | PGGradeDB sanitized fixtures + SchoolBot writer | sanitized PGGradeDB test instance | integration/crash/race (TP-003 owns fixtures) | G-PARITY/G-COEXIST/G-TARGET/G-AUTHZ/G-DB evidence ตาม evidence-002<br>mock ไม่ปิดเงื่อนไข |
| PF-CATALOG | human-run catalog query on test DB | test SchoolBot DB | runtime evidence review | คนรันระบุ revision/hash/env<br>ผลจริง ไม่ใช่ DDL |
| PF-HW-WIN-SRC | Windows 11 25H2 x64 source-built engine+host + หุ่นที่ผู้รับรองยืนยันรุ่น | local | hardware HID และ Serial | G-HW approvals+คำสั่งอนุญาต+ผู้รับรอง+emergency-stop provision |
| PF-HW-MAC-INTEL-SRC | macOS 15+ Intel source-built + หุ่นที่ยืนยันรุ่น | local | hardware HID และ Serial | G-HW<br>Darwin transport build |
| PF-HW-MAC-ARM-SRC | macOS 15+ Apple Silicon source-built + หุ่นที่ยืนยันรุ่น | local | hardware HID และ Serial | G-HW<br>Darwin transport build |
| PF-INST-WIN | Windows 11 25H2 x64 บัญชีสะอาด (มี/ไม่มี WebView2) | installed per-user | signed installer artifact | G-DELIVERY signed MSI/Setup + hash<br>ไม่มีเครื่องมือ dev |
| PF-INST-MAC | macOS 15+ Intel และ Apple Silicon | /Applications + Application Support | signed/notarized Universal PKG | G-DELIVERY signed PKG + notarization<br>เครื่อง Mac ทั้งสอง arch |
| PF-HW-WIN-INST | Windows 11 25H2 x64 + หุ่น | installed | hardware จาก signed installer | G-HW<br>G-DELIVERY |
| PF-HW-MAC-INST | macOS 15+ Intel และ Apple Silicon + หุ่น | installed | hardware จาก signed PKG | G-HW<br>G-DELIVERY |



## คำย่อ

API = Application Programming Interface · E2E = End-to-End หรือการตรวจครบเส้นทาง · BFF = Backend for Frontend ซึ่งอยู่ origin เดียวกับเว็บ · DDL = Data Definition Language · DBML = Database Markup Language · HID = Human Interface Device · CSRF = Cross-Site Request Forgery · KMS = Key Management Service · CI = Continuous Integration
