# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; FK คือ Foreign Key.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-002 — SchoolBot API ที่เปิดสู่ภายนอกจะถือบัญชี DB เดิมที่สิทธิ์กว้าง ทั้ง School DB และ PGGradeDB โดยไม่มีแนวป้องกันระดับ DB

**สถานะปัจจุบัน:** เปิด · Important. ยังต้องพิสูจน์ credential/process boundary ของ SchoolBot gRPC service และ worker; ไม่ได้ระบุว่า HTTP API Gateway ถือ DB credential และ private service ไม่ลดสิทธิ์ DB เอง. credential matrix พร้อมให้เจ้าของกรอก แต่ยังขาด effective privileges และหลักฐานแยก process.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ถ้า API ถูกยึด ผู้โจมตีอ่านข้อมูลข้ามโรงเรียนและเขียนเกรดได้ ([มติ 029 (ไม่แตะ School DB / PGGradeDB ด้วย GRANT)](requirement/decisions-029.md) ระบุเองว่าไม่มี least privilege ระดับ DB; ดูข้อที่ยังไม่ยืนยันเรื่องสิทธิ์บัญชี). tenant isolation ฝั่ง SchoolBot DB พึ่ง single-column FK + การตรวจใน application. Desktop login ต้องอ่านข้อมูลบัญชี legacy โดยขอบเขต password hash และ algorithm ยังต้องยืนยัน. นี่ไม่ใช่การรับความเสี่ยงของผู้ใช้ เพราะ decisions-029 ตัดสินแค่ไม่รัน GRANT

วิธีแก้: ไม่ต้อง GRANT: (1) แยก process/identity ของ worker เขียนเกรดออกจาก public API และให้เฉพาะ worker ถือ credential PGGradeDB (2) public API ใช้ credential School DB ที่แคบที่สุดที่เจ้าของ DB มีอยู่แล้วถ้ามี (3) data-access layer บังคับพารามิเตอร์ SchoolId ทุก query ห้าม raw SQL จาก input และมี cross-tenant test ทุก endpoint (4) credential อยู่ใน secret store/env ไม่อยู่ใน repo หรือ knowledge (5) จำกัด network egress ของ API ไปเฉพาะ DB/gateway ที่จำเป็น (6) เปิด DB audit/alert สำหรับการเขียนนอกช่องที่ SchoolBot เป็นเจ้าของ (7) ห้ามเก็บ/แคช/log password หรือ hash legacy และ rate limit login ตาม school/account/source ตาม [DES-004 (ตัวตนและสิทธิ์การใช้งาน SchoolBot)](design/des-004.md)

ผู้รับ: arch (สัญญา) และ be (implementation) โดยเจ้าของ DB ยืนยันบัญชี

การตรวจซ้ำ: jpo ตรวจ source ว่า credential PGGradeDB ไม่อยู่ใน process ของ public API, ตรวจ cross-tenant test และ adapter ownership guard ตาม เงื่อนไขสิทธิ์ส่งคะแนนและสิทธิ์ฐานข้อมูล ก่อนเปิด export

เงื่อนไขลดความเสี่ยงและปิดข้อค้นพบ: รับเป็นหลักฐานของการแก้บางส่วน ไม่ใช่ risk acceptance และไม่พอปิดทั้งข้อ มาตรการตรวจสิทธิ์และขอบเขตในแอปพิสูจน์ตรรกะของแอป ไม่ใช่ขอบเขตความปลอดภัย audit/receipt เป็น detective และเขียนด้วยบัญชีเดียวกับ writer ([DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](design/des-009.md)) process ที่ถูกยึดปลอม receipt ได้ มีแต่การแยก process ที่ลด blast radius ของเส้นเขียนเกรด และนับก็ต่อเมื่อ process ของ public API ไม่ถือ credential PGGradeDB จริง แต่ preview/confirm ต้องอ่าน PGGradeDB (DES-009) จึงต้องให้การอ่านและเขียน PGGradeDB ผ่าน worker/adapter process ภายใน DES-009 ไม่บังคับ process เดียว ทำได้โดยไม่เปลี่ยนสัญญา ถ้าทำได้ ส่วนเขียนเกรดอาจลดเป็น Medium หลัง re-audit ส่วน School DB (บัญชีกว้าง อ่านข้ามโรงเรียน และอ่านข้อมูลบัญชี legacy ที่ login ต้องใช้ DES-004) ยังเป็น Important จนเจ้าของ DB มีบัญชีแคบกว่า หรือคนยอมรับเป็นลายลักษณ์อักษร ตอนนี้คง Important/OPEN

ข้อมูลที่ยังต้องระบุ: เจ้าของ DB+infra ตอบเป็นสถานะว่ามีบัญชี read-only/บัญชีที่แคบกว่าแล้วหรือไม่ และแยก process/unit ใน deploy จริงได้หรือไม่ ถ้าไม่ได้ ผู้มีอำนาจต้องตัดสินยอมรับ residual เป็นลายลักษณ์อักษร

## ยังไม่ยืนยัน

ยังไม่ยืนยันขอบเขตสิทธิ์บัญชี DB จริงและว่า login อ่าน password hash ใดหรือใช้ algorithm ใด ต้องได้คำตอบเจ้าของ DB และหลักฐาน source ที่เกี่ยวข้อง. ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](requirement/decisions-046.md).

## หลักฐาน

- SEC001-002: knowledge/school-bot/requirement/decisions-029.md:13-18; knowledge/school-bot/design/des-009.md:34,116-120; knowledge/school-bot/design/des-004.md:20-24
- งานที่รับข้อค้นพบนี้: BE-001, BE-006, BE-037, BE-038, SA-004
- planning/security-mitigation-001.md (memory)
- planning/security-gap-sync-review-001.md (memory)
- DES-009:58,131 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- DES-009:31 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- DES-004:20-24 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- design/des-009.md:134 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
