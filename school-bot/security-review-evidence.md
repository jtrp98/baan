# หลักฐานและข้อจำกัดของการตรวจ

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

BFF คือ Backend for Frontend; CSRF คือ Cross-Site Request Forgery.

## ขอบเขตหลักฐานที่คงไว้

ตัวเลขและผลด้านล่างคัดสรุปจาก security.md เดิมเพื่อคงข้อจำกัดการตรวจ ไม่ใช่การรันทดสอบเพิ่ม. ข้อค้นพบและสถานะอยู่ใน [ตารางข้อค้นพบ](security.md); เกณฑ์ auth ที่อ้างคือ [AC-036-06 (logout เฉพาะ session ที่ได้รับอนุญาตและปฏิเสธอย่างปลอดภัย)](requirement/req-036.md).

## ยังไม่ยืนยัน

ยังไม่มีหลักฐานครบสำหรับ full pipeline/private package/TLS/production/DB/hardware, BFF CSRF หรือเกณฑ์ logout ทั้งข้อ. Native test suite ของ authorization หลักสูตรไม่ได้รับรอง เพราะ VSTest เชื่อม testhost ไม่ได้.

## หลักฐาน

- 2026-10-23: static review ต้นฉบับ planning/security-response-001.json (reports); planning/task-019.md (memory). Important เดิม 6 ข้อ แยก planned gap 4, web-principal 1 และ deployment unknown 1; Medium/Minor เดิม 9 ข้อ. WebFetch/WebSearch ไม่ได้รับสิทธิ์ ไม่รัน build/test/audit หรือ network probe.
- 2026-10-23: mitigation 5 ข้อ — planning/security-mitigation-001.md (memory), planning/security-mitigation-response-001.json (reports). Routing ไม่ยืนยัน host/TLS/exposure/secret/instance; TTL/limit เดิมเป็นข้อเสนอ เว้น replay ที่ได้รับมติภายหลัง.
- 2026-10-24: planning/auth-flow-handoff-001.md และ qa/round-001.md (memory); ผล 4,032 tests เป็น local/static เท่านั้น. SEC040-001 ปิดเฉพาะ local per-process หลัง static remediation และ runtime criteria ครบ; reports planning/logout-security-response-001.json, logout-limiting-response-001.json, logout-security-response-002.json และ auth-flow-check-response-002.json.
- 2026-10-24: planning/security-gap-sync-review-001.md (memory) ตรวจแบบ mitigation. เงื่อนไข MUST-1..5 ฝังใน release-trust-001 + DES-007 Rev3 และ license-admin-security-001 + DES-002 Rev3 + data-contract-rules Rev8. ยังต้องพิสูจน์ registry/custody/pin/negative tests/RC และ backup expiry; ไม่มี Important ใหม่หรือ acceptance ใหม่.
- 2026-10-24: EV-05 (การส่งหลักฐานฐานข้อมูลโดยไม่เผยข้อมูลระบุตัวบุคคล) ใน db-safe-evidence-001 และ db/review-007 (memory) — เปลี่ยน raw hash prefix เป็นป้ายประเภทคงที่และ complementary suppression; ถอนคำรับรองปลอด PII 100%, ตรวจ literal ก่อนส่ง DDL. now()>=ReplayUntil และข้อจำกัด MVCC/WAL/backup ไม่ทำให้ SEC001-009 ปิด.
- 2026-10-26: planning/jpo-090-gateway-r1-001.md (memory), run o1ULFh — extended 17/19, boundary 9/9, reproduction 3/5; source hashes และข้อจำกัดอยู่ใน receipt. พบ SEC001-016/017; ไม่พบข้อมูลบุคคลจริงรั่ว.
- 2026-10-26: planning/jpo-091-gateway-r2-001.md (memory), run LqKvlN — parent extended 81 ผ่าน/15 ไม่ผ่าน จาก 96, exit 1; baseline 5 ผ่านไม่พอปิด SEC001-016. SEC001-017 ปิดเฉพาะ local early deadline จาก independent wire proof และ parent. หลังแก้ครบสองครั้งให้ผู้ใช้ตัดสินการแก้แบบแคบเพิ่มหรือพักส่วนนี้; ไม่เปิดรอบเพิ่มเอง.
- 2026-10-28: planning/jpo-092-logout-r4-001.md (memory), run WZnc4m — ผู้ใช้สั่งใช้ AGY เมื่อ Codex ติดโควตา. HTTP API Gateway controller/module-owned channel: 96/0, 5/0, 3/0 และ surface probe 6/0; SchoolBot gRPC service: 2,234/0. SEC001-016 ปิด local; SEC001-017 regression ผ่าน.
- 2026-10-28: UUID duplicate ระดับ Medium และ Origin/binary/transport duplicate ระดับ Minor ใน SchoolBot gRPC service ปิดจาก source และผล 2,234/0 ไม่เพิ่ม SEC ID ซ้ำ. SmartScheme ส่งเฉพาะ /api/school-bot/service/v2 ไป SchoolBotOpaque; route อื่นคง JWT, revoked JWT ถูก control plane ตัด 401; SliceGate คืน 404 ใน Production/ไม่มี module/Enabled=false. ไม่พบ finding ใหม่จากพื้นผิวนี้.
- 2026-10-29: design/security-review-093-001.md; design/security-review-093-evidence-001.md; design/security-review-093-compliance-001.md (memory). ครบ 10 เกณฑ์ของ SEC-001 (ทบทวน trust/security) โดยตรึง DES-001 Rev1, DES-002 Rev3, DES-004 Rev11, DES-007 Rev3. อ่าน source เฉพาะจุดและผลเดิม ไม่มี test run/DB/deploy ใหม่. ไม่มี finding หรือ acceptance ใหม่. ข้อรอคน H1–H5 อยู่ในชุดหลักฐาน.
- 2026-10-29: planning/jpo-094-BE-039-001.md (memory), reports/school-bot/normal-094/jpo-BE-039-evidence/. Isolated reflection runner ใช้ xUnit Assert: 43 ผ่าน/0 ไม่ผ่าน (เดิม 22 + อิสระ 21 รวม reproduction ที่ยืนยัน defect ยังไม่แก้). Native suite ไม่รับรอง; เพิ่ม SEC094-001 Minor โดยไม่มี Critical/Important ใหม่. SEC001-001/002/010/011/012/013 คงผลเดิม; ไม่มี store/data flow ใหม่หรือ acceptance.
