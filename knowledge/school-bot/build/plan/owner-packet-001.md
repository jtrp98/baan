# ชุดส่งต่อเจ้าของระบบ — Owner Packet 001

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)


## วัตถุประสงค์และผู้ส่ง

Backend for Frontend (BFF) คือส่วน server ของเว็บที่เรียก Gateway แทน browser; infrastructure คือผู้ดูแลเครือข่ายและการตั้งค่าระบบ
พร้อมให้ผู้ใช้ส่งถึง เจ้าของ HTTP API Gateway (`sb-api-gateway`)/Light/infra/เจ้าของ SchoolBot gRPC service/BFF owners และเจ้าของ Master/School/PGGradeDB. ผู้ใช้เป็นผู้ส่งจริง; packet นี้ไม่ยืนยันว่ามีการติดต่อหรือได้รับ approval. ทบทวนสัญญาปัจจุบันและคืนหลักฐานในงานเดิม [SA-001 (ทบทวนสัญญาระบบและการอัปเดต)](index-foundation.md)/[BE-001 (ตรวจความเข้ากันได้ของบัญชีเดิม)](index-foundation.md)/[BE-039 (ทำ web-principal/BFF/session และ staff bootstrap)](extension/index.md)/[SEC-001 (ทบทวนขอบเขตความเชื่อถือและความปลอดภัย)](index-foundation.md)/[DBA-002 (เตรียม DDL ฐานข้อมูลหลัก)](index-foundation.md)/[DBA-007 (เตรียม cross-DB/export runtime evidence pack)](extension/index.md) ไม่เพิ่ม scope.

แนบ [gRPC contract](../design/gateway-grpc-contract-001.md) Rev1 §7 และ [Gateway integration](../design/gateway-integration-001.md) Rev4 ตามฐานที่ packet เดิมอ้าง พร้อม questionnaire, routing/linkage evidence และ DB request/cover ที่ระบุท้ายไฟล์ เป็นเอกสารพร้อม review ไม่ขอให้เจ้าของเตรียม questionnaire ใหม่

## สิ่งที่เจ้าของต้องตอบ

[คำขอรับรองและรูปแบบหลักฐาน](owner-packet-001-requests.md) มีตารางผู้รับทั้ง 6 กลุ่ม ลำดับ DB evidence ข้อกำหนดปกปิดข้อมูล และรูปแบบ response ขั้นต่ำ ใช้หัวข้อเดิมของ questionnaire ไม่สร้างคำถามซ้ำ

## ลำดับเปิดงานและหลักฐานภายหลัง
1. ผู้ใช้ส่ง packet/DB cover; รับคำตอบ HTTP API Gateway/Light/infrastructure/BFF และ EV ตามลำดับข้างต้น. service-route คงปิดระหว่างรอ.
2. arch/sys reconcile คำตอบกับ contract เดิมผ่านผู้คุม; ตรึง DTO/trailer/manifest และ Login prerequisites ตาม operation. SchoolBot gRPC service เป็นเจ้าของ .proto แล้ว sync HTTP API Gateway หลัง owner รับรอง พร้อม parser/codegen/hash.
3. เปิด implementation เฉพาะส่วนที่ dependency และเงื่อนไขอนุมัติครบ; ผู้ใช้เซ็น [UX-005 (เตรียม UX admin หลักสูตร/คลังข้อสอบ)](extension/index.md)/007 Q39–Q46 รวม delta042 แล้วตาม [มติ 043 (อนุมัติ UX และยืนยัน runner)](../../shared/decisions/decisions-043.md) วันที่ 2026-10-26; UX signed 7/7. Owner approval และ technical proof คงแยกตามเดิม
4. Runtime ภายหลัง: HTTP↔RPC mapping, private reachability/no-loop/wrong-peer, spoof/tenant, deadline/cancel/retry/limits/BFF security และ SQL/rollback/catalog/grade proof บน environment ที่คนอนุญาต. 4032 local tests ใช้แทน integration ไม่ได้.
5. Bootstrap ตาม procedure ที่ review แล้วโดยมนุษย์และผู้ตรวจซ้ำ; shared/production SQL/deploy ต้องมีคำสั่งเจาะจงภายหลัง. Login end-to-end คงปิดถ้า linkage/continuation/device-proof ไม่ครบ. gm รวม release runbook เมื่อหลักฐาน/ชิ้นส่วนครบ.

## การเรียนและข้อสอบ
[ช่องว่างสัญญา Learning/UX](../design/learning-ux-contract-gaps-001.md): LUX-01..07 draft/approval, Sheet, bank draft, attempt, expired/time, aggregate/proposal, HTTP API Gateway ไป SchoolBot gRPC service ยัง OPEN ทางเทคนิค. [มติ 042 (ผลข้อสอบเมื่อหมดเวลา)](../../shared/decisions/decisions-042.md): ผู้ใช้เลือก A แล้ว ใช้แทนข้อเสนอ 072; ตรวจ saved answers ทันเวลาอัตโนมัติ ข้อว่างได้ 0 คะแนน เต็มทั้งชุด ไม่รับย้อนหลัง นับครั้ง/ซ่อมตาม policy เดิม. ไม่ถามซ้ำ ไม่ใช่ UX sign-off. เอกสารต้นฉบับอ้าง 44 REQ/186 AC/81 TP ตาม [AC-046-07 (ตรวจข้อสอบหมดเวลา)](../../modules/quiz/shared/requirements/req-046.md)/[ส่วนเพิ่มแผนทดสอบข้อสอบหมดเวลา](../test-plan/tp-001-amendment-004.md); ฐานหลักฐานเดิม 180 AC/77 กรณีทดสอบยังคงเดิม. H5 เดิมคงค้างตามไฟล์คำขอรับรอง.


## หลักฐาน

- เอกสารเดิมจัดทำ 2026-10-26 โดย gm งาน 065; คิวที่อ้าง plan/queue-006.md (memory)
- H5 questionnaire: planning/h5-questionnaire-001.md (memory); routing/linkage: planning/routing-linkage-evidence-002.json (memory); DB request และ cover: db/db-safe-evidence-001.md และ db/db-safe-evidence-cover-001.md (memory)
- ผล local tests 4032 ไม่แทน integration; เอกสาร Learning เดิมรับข้อมูล 071 และใช้มติ 042 แทนข้อเสนอ 072

- Packet เดิมอ้างฐาน 44 REQ/186 AC/81 TP; จำนวนปัจจุบันดู [แผนหลัก](index.md) โดยไม่เปลี่ยนเกณฑ์ที่ตรึงไว้ ป้าย AC07 ในต้นฉบับหมายถึง AC-046-07 (ผลข้อสอบหมดเวลา) ไม่ใช่ ID ใหม่
