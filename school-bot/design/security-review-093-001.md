# SEC-001 — ชุดทบทวน threat/trust ใบงาน093

วันที่ 2026-10-29 · jpo · Rev1 · ต่อจาก [security.md](../security.md) · oracle: [SEC-001](../plan/SEC-001.md#acceptance)

ครบการจับคู่ 10 AC; Important เดิมยังรอ fix+re-audit หรือคนรับ residual เป็นลายลักษณ์อักษร ไม่ใช่ AC PASS/อนุมัติ release. ไม่สร้าง finding ซ้ำหรือเปลี่ยน severity. E1–E5/H1–H5 อ่าน [หลักฐานและข้อรอคน](security-review-093-evidence-001.md).

## ขอบเขตและวิธีตรวจ

ตรึง DES-001 Rev1 / DES-002 Rev3 / DES-004 Rev11 / DES-007 Rev3; อ่าน DES-012 Rev9 และภาคผนวกที่เกี่ยว. ตรวจ source เฉพาะจุดด้วย Get-Content/rg และอ่าน check/JPO092; ไม่มี test run ใหม่. client→HTTP G→gRPC B; เว็บผ่าน same-origin BFF. HTTP paths เป็น client semantics ไม่ยืนยัน RPC mapping ครบ.

**มี mitigation** = แบบมี controls แต่ยังไม่พิสูจน์ as-built; **ค้าง** = ขาด implementation/หลักฐานสำคัญ. ไม่มี AC ใดปิดทั้งข้อในรอบนี้. H คือผู้ตอบ/ผู้ตัดสิน ไม่ใช่ผู้ที่รับความเสี่ยงแล้ว.

## ตาราง AC และการควบคุม

| AC / TP001 | Threat / finding เดิม | แบบ: path#หัวข้อ + revision | Expected → actual / สถานะ | รอคน / ข้อจำกัด |
|---|---|---|---|---|
| AC-027-01 / 007 | ยกสิทธิ์ admin/static bearer; SEC001-001,007,009 | [DES-004#Permissions](des-004.md#permissions-ตามช่องทางและบทบาท) Rev11; [license-admin#Authorization](license-admin-security-001.md#authorization) Rev1 | 503/401/403; staff_admin+active license_admin; ปิด v1 → E1 ยังมี v1 static bearer; **มี mitigation / บางส่วน** | H1,H2; seed/G จริงยังไม่พิสูจน์; replay 15 นาทีอนุมัติแล้ว |
| AC-028-01 / 005 | ปลอม device/แข่งยึด seat/replay; SEC001-005,006 | [DES-002#API](des-002.md#api-และ-proof), [Atomicity](des-002.md#atomicity--retries) Rev3 | A ซ้ำได้/B ได้ DEVICE_LIMIT; proof+nonce+tx → E2 ยัง DeviceId/process lock; **มี mitigation / บางส่วน** | H3; ขาด multi-instance race/device custody proof |
| AC-028-03 / 006 | ต่อสิทธิ์หลัง revoke/expiry; SEC001-004,005,006 | [DES-002#Atomicity](des-002.md#atomicity--retries), [Signed entitlement](des-002.md#signed-entitlement) Rev3 | activate/validate/replay ปฏิเสธ inactive → E2 ยังไม่พิสูจน์ tx/signer/replay v2; **มี mitigation / บางส่วน** | H3; ตรวจ E−1/E/E+1 และ revoke replay; ไม่อ้าง domain PASS |
| AC-030-04 / 080 | installer ปลอม/URL อันตราย/publisher ผิด; SEC001-003,006 | [DES-007#Host](des-007.md#host-workflow--states) Rev3; [release-trust#Host](release-trust-001.md#host-publisher-identity) Rev1 | ผู้ใช้สั่ง Prepare; registry+JWS/hash+OS pin ก่อนเก็บ staging → E3 metadata-only; **มี mitigation / บางส่วน** | H4; ขาด artifact/pin/RC proof; trust ไม่ผ่านต้องไม่มี artifact ค้าง |
| AC-030-05 / 080 | TOCTOU/withdraw/expiry/downgrade; SEC001-003,006 | [DES-007#Host](des-007.md#host-workflow--states), [Errors](des-007.md#errors--recovery--invariants) Rev3; [release-trust#Host](release-trust-001.md#host-publisher-identity) Rev1 | staging เปลี่ยน/หมดอายุ/withdraw/เก่ากว่า→ไม่ execute → E3 ยังไม่มี install; **มี mitigation / บางส่วน** | H4; ต้องตรวจซ้ำจนถึงส่ง OS installer จาก protected staging |
| AC-034-06 / 004 | cache ชนะ denial/ข้าม host gate; SEC001-004,006 | [DES-001#bridge](des-001.md#ข้อเสนอ-bridge-และ-routing) Rev1; [DES-002#Local](des-002.md#local-state--errors) Rev3 | inactive→denied+invalidate; outage ไม่เลื่อน exp → E3 Run ไม่ gate/activate คืน JSON; **ค้าง / บางส่วน** | H3; fake clock/bridge direct ต้องไม่ปลดล็อก |
| AC-035-01 / 009 | ไร้สิทธิ์ unbind/cross-tenant; SEC001-001,002,005 | [DES-002#API](des-002.md#api-และ-proof) Rev3; [license-admin#Authorization](license-admin-security-001.md#authorization) Rev1; [DES-004#State](des-004.md#state--invariants--failure) Rev11 | active license_admin/scope สด/If-Match; ปฏิเสธแล้ว binding คงเดิม → E1/E2 ยังไม่มี unbind v2 ในส่วนที่ตรวจ; **มี mitigation / บางส่วน** | H1,H2; ต้องมี negative authz+DB before/after |
| AC-035-04 / 009 | A ต่อ lease หลังย้าย B/replay เก่า; SEC001-004,005,006 | [DES-002#Atomicity](des-002.md#atomicity--retries), [Local](des-002.md#local-state--errors) Rev3 | เพิ่ม BindingEpoch/ตรวจ binding ก่อน replay; A online ปฏิเสธ → E2/E3 ขาด epoch/lease; **มี mitigation / บางส่วน** | H3; A offline ถึง exp เดิมตามแบบ ไม่ใช่ online renewal |
| AC-036-06 / 082 | revoke ผิด session/DoS/log secret/peer ปลอม; SEC001-016,017,SEC040-001 | [DES-004#State](des-004.md#state--invariants--failure) Rev11; [DES-012#6](des-012.md#6-cors--origin--csrf--อายุ-session--audit) Rev9; [entry#B](gateway-controller-entry-001.md#b-channel-ที่-module-เป็นเจ้าของ--ไม่มี-reflection) Rev2 | revoke เฉพาะ session/License คงเดิม; invalid store0/quota0; sanitize → E4 local มีหลักฐานเดิม; **มี mitigation / บางส่วน** | H1; 016/017 คง CLOSED local; TP082 เต็มเส้น NOT_RUN รอ H5/DB/BFF/UI |
| AC-038-05 / 058,079 | IDOR/ครูข้ามรายชื่อหรือโรงเรียน; SEC001-002,010 | [DES-004#Authority](des-004.md#authority-เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย) Rev11; [teacher-authority#Authority](teacher-authority-001.md#authority-เดียวของรายชื่อนักเรียนที่ได้รับมอบหมาย) Rev1 | course-teacher∩roster∩term+SchoolId/re-check ก่อน commit/ผลเดิมคงเดิม → E5 resolver proof ขาด; **มี mitigation / บางส่วน** | H2,H5; synthetic fixture ไม่พิสูจน์ legacy roster/status/move |

## ส่งต่อ

ครอบ tenant/auth/lease/replay/device/key/update trust ตาม oracle. Important SEC001-001..006 ยังเปิด; [เกณฑ์ปลด blocker](security-review-093-evidence-001.md#findings-และเกณฑ์ปลด-blocker) ระบุผู้แก้/หลักฐาน. ไม่พบเหตุจากส่วนที่ตรวจให้เพิ่ม Critical/Important ใหม่. fake/stub ทำต่อได้; เชื่อมของจริง/แจก update ต้องผ่าน gates ที่เกี่ยว.

H1/H2/H4/H5 เป็นหลักฐานที่ยังขาด; H3 พักตาม047 ไม่ถามซ้ำ. ไม่มี risk acceptance ใหม่ ไม่รับรอง PDPA/GDPR/CVE/license ทั้งระบบ.

## Change Log

- 2026-10-29 — jpo เพิ่ม traceability ครบ 10 AC ตามใบงาน093; อ้าง findings เดิม ไม่แก้โค้ด/รันทดสอบ/DB/plan status.
