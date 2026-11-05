# เส้นทางข้อมูลส่วนบุคคลและ compliance

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

KMS คือ Key Management Service; HSM คือ Hardware Security Module; DDL คือ Data Definition Language; CVE คือ รหัสอ้างอิงช่องโหว่ที่ทราบแล้ว; ACL คือ Access Control List; CAS คือ Compare-and-Swap.

HTTP API Gateway คือ sb-api-gateway; SchoolBot gRPC service คือบริการ SchoolBot ภายใน. BFF คือ Backend for Frontend; JWT คือ JSON Web Token; PII คือข้อมูลที่ระบุตัวบุคคลได้; TTL คือ Time to Live หรือเวลาที่อนุญาตให้เก็บหรือใช้ข้อมูล.

## Personal data flows

ตารางคง observations และแผนจาก static review วันที่ 2026-10-23; HTTP routes เป็นฝั่ง client ของ HTTP API Gateway ก่อนส่งต่อ SchoolBot gRPC service. ยังไม่มีหลักฐาน RPC mapping ครบ.

| ข้อมูล | Flow | Controls | Gaps |
| --- | --- | --- | --- |
| license key และ device_id (Desktop → API) | Desktop host POST /v1/licenses/activate → API ตรวจ hash → เก็บ device_id ใน memory | ส่งผ่าน HTTPS (http อนุญาตเฉพาะ loopback), ไม่ตาม redirect, ตอบ ≤64 KB, timeout 5 วินาที, API เก็บเฉพาะ SHA-256 ของ key, ไม่ log body, rate limit 30/นาที/IP | device_id คัดลอกได้ ([SEC001-005 (Device binding เป็น ID สุ่มที่คัดลอกได้ และไม่มี unbind จึงทั้งใช้ซ้ำข้ามเครื่องและเกิดการล็อก seat ได้)](security-findings-04.md)), ผลไม่ถูกเก็บหรือบังคับ ([SEC001-004 (Desktop ไม่บังคับ entitlement ฝั่ง host เลย: Run/Save/Load ไม่มี gate, ผล activate ถูกทิ้ง และไม่มี signed lease)](security-findings-04.md)), URL อาจเป็น localhost ใน release ([SEC001-008 (build Desktop ไม่บังคับ API URL production จึงอาจแจก binary ที่ฝัง http://localhost:8080)](security-findings-06.md)), ยังไม่มี persistent store จึงยังไม่มี retention |
| Project JSON ของผู้เรียน (local) | frontend → SaveProject → ไฟล์ <mode>.json ใน config dir ของผู้ใช้ (ไม่ผ่าน API) | จำกัด 1 MiB, validate JSON, เขียนแบบ atomic, ไฟล์ 0600/โฟลเดอร์ 0700 (ผลบน Windows ขึ้นกับ ACL ของโปรไฟล์ ไม่ได้ตรวจ) | ไม่เข้ารหัส, ไม่มี policy retention/ลบเมื่อถอนการติดตั้ง, ยังไม่ผ่าน host gate (SEC001-004, [SEC001-010 (ยังไม่มี data inventory/retention/masking สำหรับข้อมูลนักเรียน (ผู้เยาว์) ใน Session, Submission, Attempt, Project, Audit และ log)](security-findings-08.md)) |
| ข้อมูลยืนยันตัวตน (แผน: password นักเรียน/ครู, token เว็บของครู/admin) | Desktop → /v2/auth/login → ตรวจกับบัญชี legacy ใน School DB; web-system → gateway introspection → /v2/auth/web-sessions → opaque session | ตามแบบ: password อยู่ใน memory ชั่วคราว ไม่ log, session token สุ่ม 32 ไบต์เก็บ SHA-256, ล็อกอายุ session, ตรวจ channel และ License, rate limit ตาม school/account/source | ยังไม่มี code ในรอบนี้. ติดตาม [SEC001-001 (web-principal และการแลก token เว็บยังไม่มี และตัว validator ที่จะใช้ยังหลวมเกินกว่าที่ อ้างมติที่เกี่ยวข้อง ยอมรับ)](security-findings-01.md), [SEC001-002 (SchoolBot API ที่เปิดสู่ภายนอกจะถือบัญชี DB เดิมที่สิทธิ์กว้าง ทั้ง School DB และ PGGradeDB โดยไม่มีแนวป้องกันระดับ DB)](security-findings-02.md), SEC001-010/011/013; algorithm password legacy ยังไม่มีหลักฐาน |
| คะแนนรายนักเรียนที่ส่งกลับ PGGradeDB (แผน) | ครู preview/confirm → outbox → worker → PGGradeDB + receipt ใน PgtgradeAuditLog | ตามแบบ: preview ผูก snapshot hash, If-Match, re-check สิทธิ์สามจุด, CAS ด้วย xmin, receipt, idempotency | บัญชี DB เดิมสิทธิ์กว้าง (SEC001-002), เงื่อนไขความตรงกันของคะแนน การอยู่ร่วมระบบเดิม เป้าหมาย สิทธิ์ และฐานข้อมูล ยังไม่ปิด, ยังไม่มี code ให้ตรวจ |
| metadata update (version/channel/platform → release URL/sha256/signature) | Desktop GET /v1/updates/check → API คืน release; host ไม่ดาวน์โหลดหรือรัน | public, ไม่มี PII, install_supported=false, ตรวจรูปแบบ HTTPS URL ไม่มี userinfo | ไม่มี verify ลายเซ็น/allowlist/withdraw ([SEC001-003 (ห่วงโซ่ update trust ยังไม่มี: signature ไม่ถูก verify, ไม่มี origin allowlist, ไม่มี withdraw หรือ audit และยังไม่มีหลักฐาน signing ของ installer จริง)](security-findings-03.md)), key custody ไม่ทราบ ([SEC001-006 (ยังไม่ทราบว่าใครถือและเก็บ signing key ของ entitlement/release (KMS/HSM เป็นเพียงข้อเสนอ))](security-findings-05.md)) |
| log และ telemetry | API logger มาตรฐาน; rate limiter ถือ IP ใน memory; gateway handler log ชื่อ header | API ไม่ log body, key หรือ device_id; ไม่มี telemetry ใน code ที่ตรวจ | ต้องกำหนดรายการห้าม log ก่อน persistent store และ web-principal (SEC001-010, [SEC001-013 (gateway handler log ชื่อ header ของ JabjaiWebKey ระดับ Information ทุก request ซึ่งตามที่ อ้างมติที่เกี่ยวข้อง บันทึกอาจมีรหัสโรงเรียนและผู้ใช้)](security-findings-09.md)) |

## สถานะ compliance

[สิ่งที่มีและสิ่งที่ยังต้องยืนยัน](security-compliance.md) รวม inventory, retention, ฐานกฎหมาย และ dependency licenses.

## ยังไม่ยืนยัน

ตารางคงขอบเขตหลักฐานตามวันที่ตรวจ; ACL ของไฟล์ Windows, legacy password algorithm และ flow ที่ยังไม่มี code ไม่ได้รับรอง. รายการทั้งหมดอยู่ใน [สถานะ compliance](security-compliance.md).

## หลักฐาน

- planning/security-gap-sync-review-001.md (memory)
- design/security-review-093-compliance-001.md (memory)
- planning/jpo-094-BE-039-001.md (memory)
