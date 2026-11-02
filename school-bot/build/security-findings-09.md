# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PII คือ ข้อมูลที่ระบุตัวบุคคลได้; TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; RC คือ Release Candidate; JWT คือ JSON Web Token.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-012 — ยังไม่ทราบ topology ของ proxy/TLS ซึ่งกำหนดว่า rate limit และการป้องกันเส้นทาง public ทำงานจริงหรือไม่

**สถานะปัจจุบัน:** เปิด · Medium. การเลือก gRPC ไม่พิสูจน์ trust boundary, JWT tenant เทียบ opaque session, auth/tenant metadata, private exposure/service identity, TLS/peer และ Light/เงื่อนไขระหว่างระบบ.

ลักษณะข้อค้นพบ: deployment_unknown. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: API เชื่อ X-Forwarded-For เฉพาะจาก loopback. ถ้า proxy อยู่คนละเครื่องหรืออยู่ container network ทุก client ใช้ bucket เดียว (30/60 ต่อนาที) ทำให้ client เดียวบล็อก activate/update ของโรงเรียนอื่นได้ และ API เองไม่ทำ HTTPS/HSTS. IPv6 ใช้ที่อยู่ละบัญชี จึงเลี่ยง limit ได้ง่าย (ผลต่ำเพราะ key 256 บิต)

วิธีแก้: ตัดสิน topology ก่อน deploy: ถ้า proxy ไม่อยู่ loopback ให้เพิ่ม trusted proxy ที่ระบุเฉพาะในโค้ด/config, ให้ proxy บังคับ HTTPS+HSTS, limit แยกชั้น edge, เพิ่ม partition ของ IPv6 เป็นระดับ /64

ผู้รับ: be และ infra

การตรวจซ้ำ: jpo ตรวจ deploy pack และคำตอบ topology; การทดสอบ limit บนระบบจริงทำใน [SEC-002 (RC Security)](plan/index.md) เมื่อมีคำสั่งอนุญาต

## SEC001-013 — gateway handler log ชื่อ header ของ JabjaiWebKey ระดับ Information ทุก request ซึ่งตามที่ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md) บันทึกอาจมีรหัสโรงเรียนและผู้ใช้

**สถานะปัจจุบัน:** เปิด · Minor. ต้องตรวจ log หลังแก้; รูปแบบ header ยังอ้างเอกสาร ไม่ได้ยืนยัน source ระบบเว็บเดิม.

ลักษณะข้อค้นพบ: actual_defect. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: รหัสพนักงาน/โรงเรียนเป็นตัวระบุแบบ pseudonymous ที่เข้า log ทุกครั้ง ขัดกับกฎ repo ของ gateway ที่ห้าม log PII และ web-principal จะผ่านเส้นนี้. หมายเหตุ: รูปแบบชื่อ header อ้างจาก DES-012 ไม่ได้เปิด source ของ web-system ยืนยัน

วิธีแก้: ใน endpoint web-principal และ handler ที่ใช้ร่วม ให้ log เฉพาะผลสำเร็จ/ล้มเหลวและ correlation id โดยไม่ใส่ชื่อ header หรือ claim; ตรวจเจ้าของ repo gateway

ผู้รับ: เจ้าของ sb-api-gateway

การตรวจซ้ำ: jpo ตรวจตัวอย่าง log หลังแก้

## SEC001-014 — เมนูครูบน Desktop ใช้ PIN ฝั่ง client ที่เป็นค่าคงที่ใน bundle เป็นเครื่องหมาย 'ต้องใช้ PIN'

**สถานะปัจจุบัน:** เปิด · Minor. ต้องนำเมนูครูออกจาก Desktop หรือจำกัดเป็น sample/preview.

ลักษณะข้อค้นพบ: actual_defect. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ใครอ่าน bundle ก็ผ่านได้ จึงเป็น false assurance. ตอนนี้ไม่มีสิทธิ์จริงให้ข้าม (การ restart ใน UI เป็น timer จำลอง) และไม่ได้ยืนยันค่า PIN ในรายงานนี้. [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../shared/decisions/decisions-025.md) ให้ Desktop ไม่มีเมนูครู

วิธีแก้: นำเมนูครูออกจาก Desktop ตามมติ หรือจำกัดให้ sample/preview เท่านั้น ห้ามใช้เป็นการควบคุมสิทธิ์

ผู้รับ: fe

การตรวจซ้ำ: jpo ตรวจ source ว่าไม่มีเส้นทาง native ไปเมนูครูและไม่มี PIN คงที่ใน bundle release

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-012: Program.cs:31-40,56-57,123-131; docs/DEPLOYMENT.md:49-54
- งานที่รับข้อค้นพบนี้: BE-023
- SEC001-013: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:33,39,46,51; knowledge/school-bot/design/des-012.md:12
- งานที่รับข้อค้นพบนี้: BE-039
- SEC001-014: app/frontend/src/modes/robot-control/teacher/teacherData.ts:5; app/frontend/src/modes/robot-control/teacher/TeacherMenu.tsx:174; app/frontend/src/app/AppView.tsx:348-357
- งานที่รับข้อค้นพบนี้: FE-005
