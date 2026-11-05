# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; RC คือ Release Candidate; BFF คือ Backend for Frontend; CSRF คือ Cross-Site Request Forgery; CVE คือ รหัสอ้างอิงช่องโหว่ที่ทราบแล้ว.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-015 — provenance ของ HIDAPI ที่แก้ไขในเครื่อง และ nlohmann/json ไม่มี commit/hash ต้นทางเพื่อเทียบกับ upstream

**สถานะปัจจุบัน:** เปิด · Minor. ต้องระบุ upstream tag/commit/hash และตรวจ notice.

ลักษณะข้อค้นพบ: actual_defect. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ตรวจย้อนไม่ได้ว่าโค้ด vendored ตรงกับ release ต้นทาง ซึ่งกระทบการติดตามช่องโหว่ upstream และ supply chain. license และ notice ครบตามที่เห็น

วิธีแก้: บันทึก tag/commit และ hash ของ release ต้นทาง, เทียบกับ upstream แล้วเก็บ diff ของการแก้ภายใน และเพิ่มขั้นตอนตรวจ advisory ของ dependency ใน RC

ผู้รับ: be

การตรวจซ้ำ: jpo ตรวจไฟล์ notice หลังอัปเดต

## SEC040-001 — public logout ทำงาน DB ไม่ bounded

**สถานะปัจจุบัน:** ปิดเฉพาะ local per-process · Medium. ผู้รับผิดชอบ: be.

พบ 2026-10-24; การแก้ผ่าน static review แล้ว และผลตรวจรับ runtime ยืนยัน conditional close ครบ. ไม่ครอบ distributed limiting หรือ Gateway/gRPC/DB integration ไม่ปิด Important เดิมหรือ security gates ทั้งระบบ.

## SEC001-016 — รายละเอียด upstream รั่วผ่าน log ของ gRPC dependency

**สถานะปัจจุบัน:** ปิดเฉพาะ local logout · Important. ผู้รับผิดชอบ: sys ของ Gateway.

พบ 2026-10-26: upstreamStatus.Detail เข้า Grpc.Net.Client.Internal.GrpcCall Information/EventId 3 ก่อน sanitize แม้ HTTP 500 body/headers sanitize ผ่าน. ใช้ synthetic detail ไม่พบข้อมูลบุคคลจริงรั่ว. การแก้ถัดมายังพบ opaque detail/log scope/constructor fallback bypass และ shared channel mutation จึงยังเปิด. ผลตรวจ 2026-10-28 ยืนยันไม่มี reflection, reject channel/client/invoker ที่ไม่ผ่าน factory ก่อน RPC, sanitizing logger ทุกระดับ/scope/EventId 3, ไม่ fallback ไป generated client และไม่ mutate LoggerFactory ของ caller จึงปิดเฉพาะ local logout. ไม่ปิด TLS/production registration/full private build/DB/BFF CSRF หรือเงื่อนไขระหว่างระบบ.

## SEC001-017 — early upstream deadline ตอบ 504 แทน 502

**สถานะปัจจุบัน:** ปิดเฉพาะ local early deadline · Minor. ผู้รับผิดชอบ: sys ของ Gateway.

พบ 2026-10-26; ต้องแยก upstream deadline จาก outer expiry. Independent wire proof และผลตรวจซ้ำยืนยันการแก้ local; regression 2026-10-28 ยืนยัน early deadline 502, outer 504 และ slow body 504 โดยไม่เรียก RPC. ไม่ปิด integration หรือรับรอง production.

## SEC094-001 — helper อนุญาต publish เมื่อ authorPrincipalId ขาด

**สถานะปัจจุบัน:** เปิด · Minor. ผู้รับผิดชอบ: be.

พบ 2026-10-29: ผู้เรียก helper ที่ตรวจมีเฉพาะ tests ยังไม่มี curriculum HTTP/gRPC endpoint ใน SchoolBot gRPC service จึงไม่เข้าถึงจาก client ผ่าน Gateway. เสนอปฏิเสธ author ที่ขาดและโหลด canonical author ฝั่ง server. เป็นข้อเสนอไม่ขวาง authorization หลักสูตรส่วนที่ตรวจ ไม่เปิดงานเอง. ตรวจ channel/role/fail-closed/error และข้อจำกัด tenant/session จริงแล้ว ไม่มี store หรือการส่งข้อมูลใหม่. ไม่รับรองเกณฑ์เต็ม/release/PDPA/GDPR/CVE/licenses และไม่ปิด Important เดิม.

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-015: engines/zide/THIRD-PARTY-NOTICES.md:20-37
- งานที่รับข้อค้นพบนี้: BE-022
- planning/logout-security-response-001.json; planning/logout-limiting-response-001.json; planning/logout-security-response-002.json; planning/auth-flow-check-response-002.json (reports); qa/round-001.md (memory)
- SchoolBotSessionGrpcClient.cs:19; planning/jpo-090-gateway-r1-001.md; planning/jpo-091-gateway-r2-001.md; planning/jpo-092-logout-r4-001.md (memory)
- SchoolBotLogoutMiddleware.cs:209; planning/jpo-090-gateway-r1-001.md; planning/jpo-091-gateway-r2-001.md; planning/jpo-092-logout-r4-001.md (memory)
- Service:95–104; planning/jpo-094-BE-039-001.md (memory); reports/school-bot/normal-094/jpo-BE-039-evidence/
