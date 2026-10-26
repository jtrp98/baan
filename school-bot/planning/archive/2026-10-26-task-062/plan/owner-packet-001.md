# ชุดส่งต่อเจ้าของ — Owner Packet 001
วันที่ 2026-10-26 · gm · ใบงาน065 · อ้าง [คิวปัจจุบัน](queue-004.md)

## วัตถุประสงค์และผู้ส่ง
พร้อมให้ผู้ใช้ส่งถึง G owner/Light/infra/B owner/BFF owners และเจ้าของ Master/School/PGGradeDB. ผู้ใช้เป็นผู้ส่งจริง; packet นี้ไม่ยืนยันว่ามีการติดต่อหรือได้รับ approval. ทบทวนสัญญาปัจจุบันและคืนหลักฐานในงานเดิม SA-001/BE-001/BE-039/SEC-001/DBA-002/DBA-007 ไม่เพิ่ม scope.

แนบ [gRPC Rev1 §7](../design/gateway-grpc-contract-001.md), [Gateway Rev4](../design/gateway-integration-001.md), [H5 questionnaire](../planning/h5-questionnaire-001.md), [routing/linkage evidence002](../planning/routing-linkage-evidence-002.json), [DB request](../db/db-safe-evidence-001.md) และ [DB cover](../db/db-safe-evidence-cover-001.md). เป็นเอกสารพร้อม review ไม่ขอให้เจ้าของเตรียม questionnaire ใหม่.

## 1. Owner approval และคำตอบ H5
ตอบกลับในหัวข้อเดิมของ questionnaire เพื่อไม่สร้างคำถามซ้ำ:

| ผู้รับ | ข้อที่ต้องตอบ/รับรอง | หลักฐานขั้นต่ำ |
|---|---|---|
| G owner + B owner | H5 §4.1: รับรอง opaque-session pipeline/tenant authority ตาม contract §7.1 หรือระบุข้อขัดแย้ง | route/pipeline revision, strip/allowlist/duplicate authority header rules, แผน negative cases JWT/opaque/spoof/cross-school/logout |
| Light + G owner | H5 §4.3: ผู้ review/CODEOWNERS และ disposition ของ protected paths, mapper/deadline/retry/limits | review ref; exact manifest/policy/SbRateLimit/Swagger/maintenance/revocation, fixtures 204/401/403/412/428/B503/G502/504/503/malformed trailers |
| infra + G/B | H5 §1–3/4.2: public/private separation, no-loop, TLS/peer และ env/rate-limit ownership | process×purpose×key-name×owner×status; วิธี derive/validate trusted source metadata และผู้รับผิดชอบ negative tests |
| web-system/admin BFF owners + G/B | H5 §6: repo/route allowlist, credential filtering, Origin/CSRF/session | manifest/review ref; web-system ใช้ GATEWAY_API_URL; admin owner ระบุชื่อ key; ไม่ catch-all/private route; cookie แปลง Bearer ฝั่ง server |
| G/sys/legacy/vault + B owner | contract §7.4–5: selector/cardinality/linkage และ continuation/attempt/device-proof | ผูก authenticated account กับ profile/tenant ตลอด attempt; deleted/null/sentinel/duplicate/cross-school disposition และ completion stages; ไม่เดา AccountId=ProfileId |
| ผู้ใช้ธุรกิจ + B owner/sys; vault/ผู้รัน/ผู้ตรวจซ้ำ | H5 §5: แต่งตั้ง staff_admin และวิธี bootstrap | ผู้ถือข้อมูลบัญชีผ่านช่องทางปลอดภัย, mapping proof, procedure/reviewer/runner/second checker และ audit/GET verification plan; school_admin ไม่เท่ากับ staff_admin |

Transport client→HTTP G→gRPC B, cType category และ035 ตัดสินแล้ว ไม่ถามเลือกใหม่. ขอ technical proof ที่ยังขาด; G HTTP Login เดิมแยกจาก service transport. เจ้าของที่ไม่รับรองส่งเหตุผลให้ arch ผ่านนายช่าง ไม่แก้สัญญาหรือปิด gate เอง.

## 2. DB evidence — แยกจาก approval
ผู้ใช้ forward cover เดิม; เจ้าของ Master/School DB คืน EV-01..03 schema metadata ของ TUser/TEmployees/TEmpSalaries ก่อน แล้ว EV-04 linkage counts/EV-05 hash-format category counts; EV-06 student aggregate เป็น optional. คงนิยามและลำดับจาก DB request ไม่สร้าง SQL ใหม่ใน packet.

ขอเฉพาะ schema/aggregate ที่ผ่านการตรวจ literal และ PII; กลุ่ม <5 รวม other ใช้กลุ่มไม่ทับซ้อนและ complementary suppression. ห้าม raw dump, row IDs, username, hash/prefix/suffix จริง. ระบุ EV-ID, schema/version reference, วันที่ที่เจ้าของแจ้ง, coverage/สิ่งที่ยังไม่ทราบ และผู้ตรวจการปกปิดข้อมูล.

เจ้าของ School/PGGradeDB + infra ตอบ SEC001-002/G-DB เรื่องบัญชีเดิมในรูป alias/status/ขอบเขตสิทธิ์อ่านเขียนต่อ process และมีบัญชีแคบกว่าอยู่แล้วหรือไม่; ไม่ขอชื่อบัญชีจริง/connection string ไม่ขอ GRANT/สร้าง role. สิทธิ์เขียนกับ durable receipt และ parity/coexistence/target/authz ต้องพิสูจน์ภายหลังด้วย runtime pack DBA-007; เจ้าของตอบยินยอมอย่างเดียวไม่ใช่ผลทดสอบ.

## 3. รูปแบบ response ขั้นต่ำ
แต่ละแถวส่ง `หัวข้อ/Task | owner role | ผู้ตอบ | วันที่ที่ผู้ตอบระบุ | รับรอง/ไม่รับรอง/รอหลักฐาน | artifact revision/ref | เงื่อนไขค้าง/ผู้รับต่อ`. Env ใช้ `ยังไม่ตั้ง/ตั้งแล้ว/ยังไม่ยืนยัน`; ไม่ใช้ต้องระบุเหตุผล/ผู้รับรอง. แยกคำรับรองกับผล runtime: ยังไม่รันให้เขียน NOT_RUN พร้อม evidence ที่รอ ห้ามใช้ตั้งแล้วแทนผ่านแล้ว.

ขอเฉพาะชื่อ config/env key, ชนิด identity, alias และสถานะ. ไม่ส่ง secret/token/password/private key/certificate material/host-origin-listener ค่าจริง/บัญชีจริงใน knowledge. ค่าจริงเจ้าของจัดการผ่านช่องทางองค์กร. DB ผู้ดูแลเป็นผู้รันและตรวจผลก่อนส่ง; agent ไม่รัน SQL/ไม่ login แทน.

## 4. ลำดับเปิดงานและหลักฐานภายหลัง
1. ผู้ใช้ส่ง packet/DB cover; รับคำตอบ G/Light/infra/BFF และ EV ตามลำดับข้างต้น. service-route คงปิดระหว่างรอ.
2. arch/sys reconcile คำตอบกับ contract เดิมผ่านผู้คุม; ตรึง DTO/trailer/manifest และ Login prerequisites ตาม operation. B เป็นเจ้าของ .proto แล้ว sync G หลัง owner รับรอง พร้อม parser/codegen/hash.
3. เปิด implementation เฉพาะส่วน dependency/gates ครบตาม queue-004; UX-005/007 ร่างได้ทันที→check→ผู้ใช้เซ็น แยกจาก owner approval นี้. signed 5/7 เดิมคงอยู่; draft ใหม่ยังไม่ถือว่าผ่านหรือเซ็น.
4. Runtime ภายหลัง: HTTP↔RPC mapping, private reachability/no-loop/wrong-peer, spoof/tenant, deadline/cancel/retry/limits/BFF security และ SQL/rollback/catalog/grade proof บน environment ที่คนอนุญาต. 4032 local tests ใช้แทน integration ไม่ได้.
5. Bootstrap ตาม procedure ที่ review แล้วโดยมนุษย์และผู้ตรวจซ้ำ; shared/production SQL/deploy ต้องมีคำสั่งเจาะจงภายหลัง. Login end-to-end คงปิดถ้า linkage/continuation/device-proof ไม่ครบ. gm รวม release runbook เมื่อหลักฐาน/ชิ้นส่วนครบ.

## Change Log
- 2026-10-26 — ใบงาน065: รวมชุด owner review พร้อมส่ง; แยก approval/DB evidence/UX sign-off/runtime. ไม่มี approval, H5/G-CORE closure หรือคำอนุญาตรันระบบเกิดจากการสร้าง packet.
