# คิว005 — local subsets และการเชื่อมจริง

วันที่ 2026-10-26 · เจ้าของเนื้อหา: gm Codex T2 · ผู้สกัด/บันทึก: นายช่าง · ใบงาน088

รับผล gm จาก run `2026-10-26-08-35-47-gm-tier-t2-1agents-uMSApV`: ตรวจ110tasks/15verified/95pending; lint implement63/gated62/readyBE001. ผล role NEEDS_HUMAN เฉพาะข้อเสนอ staged DAG ไม่ใช่ผลตรวจรับโค้ด

ผู้ใช้สั่ง CONTINUE-NORMAL ข้อ2/4a ให้เดินงานบน stub ต่อระหว่างเก็บข้อเสนอแก้แผนไว้ถามตอนจบ จึงใช้คิวนี้ dispatch เฉพาะส่วนที่ contract ชัดตามคำสั่งนั้น ไม่เปลี่ยน depends_on/gate_ids หรือปิด canonical task. คิว004 docs-only เดิมไม่จำกัดรอบนี้; ส่วนที่ต่อของจริงยังต้อง prerequisites/gates เดิม

| ลำดับ | งานเดิม / subset | ผู้รับ | artifact/เกณฑ์ และจุดหยุด |
|---|---|---|---|
| 1 | BE-001 compatibility | sys AGY T3 | source:line + sanitized account/profile/tenant/hash fixtures; ไม่เปิด fullLogin จน linkage/continuation ครบ |
| 2 | TP-002 harness | sys Codex T2 สำหรับ code ตาม fixture plan ที่ inspect มีแล้ว | FX-01a/01b/FX-02 fake clock/store/failpoints; ไม่เปลี่ยนเวลาเครื่อง/DB/หุ่น |
| 3 | BE-009 local store | sys AGY T3 | AC-011-04/local AC-036-01, DES-003, temp filesystem/fake entitlement; host จริงรอBE007 |
| 4 | BE-024 Guest history | sys AGY T3 | AC-040-01..06, guest-workspace, หลังBE009.local; fake trusted-clock |
| 5 | BE-033 calculator | sys AGY T3 | AC-047-02/04, learning-rules-032-034, decimal/weights10000/max>0; ไม่ persist/freeze รอบจริง |
| 6 | BE-036 per-cell conversion | sys AGY T3 | AC-050-03, grade-rules-032-034, half-up; ไม่เขียนPG/confirmจริง |
| 7 | BE-028 Sheet row transform | sys AGY T3 | AC-045-02/03, REQ045/DES005/source-review003; ไม่กำหนดstable-key/dedup/APIเอง |
| 8 | BE-003 authz/replay logic | sys AGY T3 | AC-027-01..03 subset, license-admin-security/046; fake principal/repo/clock; ไม่ใช้กุญแจจริง |
| 9 | FE-001 entry component | front Codex T2 | AC-009-01/02/AC-028-04, UX001signed; test injected entitlement ไม่มีproductionfakefallback |
| 10 | BE-006/039 logout transport | sys AGY T3 | รอarch088 exact typed contract แล้วreuse LogoutService + fake store/inprocessRPC; ไม่อ้างAC04301หรือfullLoginผ่าน |

ต้อง serialize งานที่เขียน repository เดียวกัน. ผลsubsetเก็บในslice receiptแยก; canonical Status ไม่เปลี่ยนเป็นdone-local/verifiedทั้งtaskหากacceptanceยังไม่ครบ

## ข้อเสนอรอคำตัดสินท้ายรอบ

gm เสนอ staged local/live semantics โดย local ใช้ contract/artifact/UXของตน ส่วน live รอ depends_on/gate_ids เดิม. ไม่มี taskIDใหม่ ไม่ลด17gates ไม่ล้างgate_idsเพื่อให้lintผ่าน; ก่อนแก้canonicalJSONต้องยืนยันว่ารูปแบบ/linterรองรับและให้ผู้ใช้ตัดสินตอนท้ายตามCONTINUE-NORMAL

## คน/หลักฐานที่ยังรอ

- Gateway dev อนุญาตแล้วตาม046; ไม่ถามdevซ้ำ ยังต้อง review implementation/H5 TLS-peer/private exposure/BFF/bootstrap สำหรับต่อจริง
- DBสร้างและdirectconnectผ่านแล้ว ไม่รอสร้างซ้ำ; schema parity/EV/transaction/API evidenceยังแยก
- เนื้อหาจริง/hardware/cert/distribution/RC-releaseตามgatesเดิม เฉพาะเมื่อถึงงานที่พึ่งพา
- replay900วินาทีอนุมัติแล้ว; signer/custodyพักตาม047 ไม่ถามซ้ำ

## Change Log

- 2026-10-26 — รับคิวgmและแยกคำสั่งเดินstubที่ผู้ใช้อนุญาตแล้วจากข้อเสนอเปลี่ยนcanonicalDAGที่ยังไม่apply
