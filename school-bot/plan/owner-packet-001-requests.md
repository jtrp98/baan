# SchoolBot — คำขอรับรองและรูปแบบหลักฐานจากเจ้าของระบบ

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ประกอบ [ชุดส่งต่อเจ้าของ](owner-packet-001.md) HTTP API Gateway คือ `sb-api-gateway`; SchoolBot gRPC service คือบริการปลายทาง; Backend for Frontend (BFF) คือ server ของเว็บที่เรียก Gateway แทน browser

## 1. การรับรองจากเจ้าของและคำตอบ H5 (เงื่อนไข route/env/network/trust)
ตอบกลับในหัวข้อเดิมของ questionnaire เพื่อไม่สร้างคำถามซ้ำ:

| ผู้รับ | ข้อที่ต้องตอบ/รับรอง | หลักฐานขั้นต่ำ |
|---|---|---|
| เจ้าของ HTTP API Gateway + เจ้าของ SchoolBot gRPC service | H5 §4.1: รับรอง opaque-session pipeline/tenant authority ตาม [gRPC contract](../design/gateway-grpc-contract-001.md) §7.1 หรือระบุข้อขัดแย้ง | route/pipeline revision, strip/allowlist/duplicate authority header rules, แผน negative cases JWT/opaque/spoof/cross-school/logout |
| Light + เจ้าของ HTTP API Gateway | H5 §4.3: ผู้ review/CODEOWNERS และ disposition ของ protected paths, mapper/deadline/retry/limits | review ref; exact manifest/policy/SbRateLimit/Swagger/maintenance/revocation, fixtures 204/401/403/412/428/B503/G502/504/503/malformed trailers |
| infra + HTTP API Gateway/SchoolBot gRPC service | H5 §1–3/4.2: public/private separation, no-loop, TLS/peer และ env/rate-limit ownership | process×purpose×key-name×owner×status; วิธี derive/validate trusted source metadata และผู้รับผิดชอบ negative tests |
| web-system/admin BFF owners + HTTP API Gateway/SchoolBot gRPC service | H5 §6: repo/route allowlist, credential filtering, Origin/CSRF/session | manifest/review ref; web-system ใช้ GATEWAY_API_URL; admin owner ระบุชื่อ key; ไม่ catch-all/private route; cookie แปลง Bearer ฝั่ง server |
| HTTP API Gateway/sys/legacy/vault + เจ้าของ SchoolBot gRPC service | contract §7.4–5: selector/cardinality/linkage และ continuation/attempt/device-proof | ผูก authenticated account กับ profile/tenant ตลอด attempt; deleted/null/sentinel/duplicate/cross-school disposition และ completion stages; ไม่เดา AccountId=ProfileId |
| ผู้ใช้ธุรกิจ + เจ้าของ SchoolBot gRPC service/sys; vault/ผู้รัน/ผู้ตรวจซ้ำ | H5 §5: แต่งตั้ง staff_admin และวิธี bootstrap | ผู้ถือข้อมูลบัญชีผ่านช่องทางปลอดภัย, mapping proof, procedure/reviewer/runner/second checker และ audit/GET verification plan; school_admin ไม่เท่ากับ staff_admin |

เส้นทาง client ผ่าน HTTP API Gateway ไป SchoolBot gRPC service, cType category และ [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../requirement/decisions-035.md) ตัดสินแล้ว ไม่ถามเลือกใหม่. ขอ technical proof ที่ยังขาด; HTTP Login ของ HTTP API Gateway เดิมแยกจาก service transport. เจ้าของที่ไม่รับรองส่งเหตุผลให้ arch ผ่านนายช่าง ไม่แก้สัญญาหรือปิด gate เอง.

## 2. DB evidence — แยกจาก approval
ผู้ใช้ forward cover เดิม; เจ้าของ Master/School DB คืน EV-01..03 schema metadata ของ TUser/TEmployees/TEmpSalaries ก่อน แล้ว EV-04 linkage counts/EV-05 hash-format category counts; EV-06 student aggregate เป็น optional. คงนิยามและลำดับจาก DB request ไม่สร้าง SQL ใหม่ใน packet.

ขอเฉพาะ schema/aggregate ที่ผ่านการตรวจ literal และข้อมูลระบุตัวบุคคล (PII); กลุ่ม <5 รวม other ใช้กลุ่มไม่ทับซ้อนและ complementary suppression. ห้าม raw dump, row IDs, username, hash/prefix/suffix จริง. ระบุ EV-ID, schema/version reference, วันที่ที่เจ้าของแจ้ง, coverage/สิ่งที่ยังไม่ทราบ และผู้ตรวจการปกปิดข้อมูล.

เจ้าของ School/PGGradeDB + infra ตอบ SEC001-002 (ข้อค้นพบสิทธิ์บัญชีเดิม)/G-DB (เงื่อนไขสิทธิ์ฐานข้อมูล) เรื่องบัญชีเดิมในรูป alias/status/ขอบเขตสิทธิ์อ่านเขียนต่อ process และมีบัญชีแคบกว่าอยู่แล้วหรือไม่; ไม่ขอชื่อบัญชีจริง/connection string ไม่ขอ GRANT/สร้าง role. สิทธิ์เขียนกับ durable receipt และ parity/coexistence/target/authz ต้องพิสูจน์ภายหลังด้วย runtime pack [DBA-007 (เตรียม cross-DB/export runtime evidence pack)](extension/index.md); เจ้าของตอบยินยอมอย่างเดียวไม่ใช่ผลทดสอบ.

## 3. รูปแบบ response ขั้นต่ำ
แต่ละแถวส่ง `หัวข้อ/Task | owner role | ผู้ตอบ | วันที่ที่ผู้ตอบระบุ | รับรอง/ไม่รับรอง/รอหลักฐาน | artifact revision/ref | เงื่อนไขค้าง/ผู้รับต่อ`. Env ใช้ `ยังไม่ตั้ง/ตั้งแล้ว/ยังไม่ยืนยัน`; ไม่ใช้ต้องระบุเหตุผล/ผู้รับรอง. แยกคำรับรองกับผล runtime: ยังไม่รันให้เขียน NOT_RUN พร้อม evidence ที่รอ ห้ามใช้ตั้งแล้วแทนผ่านแล้ว.

ขอเฉพาะชื่อ config/env key, ชนิด identity, alias และสถานะ. ไม่ส่ง secret/token/password/private key/certificate material/host-origin-listener ค่าจริง/บัญชีจริงใน knowledge. ค่าจริงเจ้าของจัดการผ่านช่องทางองค์กร. DB ผู้ดูแลเป็นผู้รันและตรวจผลก่อนส่ง; agent ไม่รัน SQL/ไม่ login แทน.


## หลักฐาน

H5 questionnaire: planning/h5-questionnaire-001.md (memory); DB request: db/db-safe-evidence-001.md (memory); คำขอรับรองอิง [gRPC contract](../design/gateway-grpc-contract-001.md) Rev1 §7 และ [Gateway integration](../design/gateway-integration-001.md) Rev4 ตามฉบับที่ packet เดิมอ้าง
