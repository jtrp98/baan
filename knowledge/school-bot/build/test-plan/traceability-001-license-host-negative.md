# Negative/fault ของสิทธิ์เครื่อง

> Rev 2 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — ติดป้าย full)

ส่วนบังคับของ [pack BE-007](traceability-001-license-host-pack.md#be-007) และ [H-LIC/H-OBS/H-GATE](traceability-001-license-host-setup.md) ไม่เพิ่ม AC ผลจริงทั้งหมด NOT_RUN

| Case → AC | Setup และจุด inject | Response + persisted state ที่คาด |
|---|---|---|
| TP001-003 → AC-034-03/04 ป้องกันย้อนเวลา | บันทึก high-water ที่ T+3600s แล้ว restart ด้วย wall=T+1s ขณะ offline; อีก subcaseคืน snapshot local เก่าที่เทียบกับ anchor ใหม่ได้; ไม่อ้างต้าน rollback disk/store ทั้งชุด | CLOCK_UNTRUSTED/locked ต้อง online; server leaseคงเดิม local ไม่คืน valid/ไม่เลื่อน exp; privileged full snapshot ยังเป็นข้อจำกัดตาม H-GATE |
| TP001-004 → AC-034-02/05/06 ตรวจรับ response | A valid และ expired แยก fixture; network down/5xx/429 inject ก่อน dispatch (server calls=0); อีกชุดส่งจริงให้ commit แล้วตัด response; malformed success/signature/kid ผิด inject หลัง server responseก่อน verifier | network/5xx/429 ไม่เลื่อน local E, valid เดิมใช้ได้ก่อน E เท่านั้น; malformed/signature → INVALID_ENTITLEMENT ไม่รับ leaseใหม่; kid ผิดต้อง online recovery; server คงเดิมเฉพาะก่อน dispatch ส่วนหลัง commit ต้องเห็น leaseใหม่ที่ commit จริง แต่ local ไม่รับ response เสีย/หาย ห้ามอ้าง rollback |

<a id="tp001-088"></a>

## TP001-088 — ปฏิเสธสิทธิ์ที่ถูกแก้ไขหรือคัดลอกจาก A ไป B

ระดับ: full

AC: [AC-034-02 (Active แล้วจึงมีสิทธิ์ในเครื่อง)](../../modules/app-shell/shared/requirements/req-034.md), [AC-035-03 (B ต้องเปิดใช้ออนไลน์ครั้งแรก ไม่ใช้สิทธิ์ของ A)](../../modules/app-shell/shared/requirements/req-035.md) · Criterion BE-007: tamper/copy ข้ามเครื่องปฏิเสธ · References: [device proof Rev3](../design/des-002-device-proof.md), [signed entitlement Rev4](../design/des-002-entitlement.md), [local state Rev4](../design/des-002-recovery.md) · Level: host component/integration บน doubles · Profile: PF-HOST

เงื่อนไขก่อนตรวจ: ใช้ [H-LIC/H-OBS](traceability-001-license-host-setup.md) ทั้ง memory/file; A activate ที่ T, B มี key ของตนและไม่เคย activate; secure storage double แยก namespace A/B และปฏิเสธ protected key ข้าม namespace; network ทั้งคู่ปิด reset fixture ต่อ subcase เก็บ state ก่อน inject ไม่คัดลอก private key จริง

ขั้นตอน: (1) แก้ payload exp หรือ cnf.jkt ของ token A โดยคง signature เดิม แล้วให้ A เปิดใหม่ (2) คัดลอก token/device-id และ clock anchor A ไป B แต่ไม่มี private key A (3) คัดลอก protected key blob ด้วยให้ double คืน unprotect failure (4) บน A inject storage read/sign failure ตอนเปิดใหม่ (5) ทำ anchor เสียแล้วเปิดใหม่ (6) control A เปิด token เดิมไม่แก้และพิสูจน์ key A ได้ก่อน E

ผลที่คาด: (1) INVALID_ENTITLEMENT ไม่รับ token ใหม่ (2–4) locked ไม่ fallback plaintext/temp และ B ไม่ได้สิทธิ์ใหม่ (5) clock_untrusted/locked ต้องออนไลน์ใหม่ (6) valid; server domain/binding/lease/audit/result คงเดิมเพราะไม่มี request; local ไม่มี accepted lease ใหม่, checked_at/exp ไม่เลื่อน, ข้อมูลเสียไม่ถูกเขียนเป็น valid; ไม่กำหนด error code ใหม่ให้ key-store failure ที่สัญญาไม่ได้ตั้งชื่อ

ส่วน stub พิสูจน์ verifier/possession/fail-closed ของ double; OS secure storage/copy จริงและ cloned VM ยังรอ H-GATE ไม่อ้าง physical uniqueness จากเคสนี้

หลักฐานที่ต้องเก็บ: sanitized host status, storage generation diff (ไม่เก็บ token/key/ciphertext), network calls=0 และ server snapshot ก่อน/หลัง

ผลจริง: NOT_RUN

## หลักฐาน

- อิง DES-002 entitlement/recovery Rev4 และ device proof Rev3 ที่ลิงก์ใน case; criterion tamper/copy มาจาก BE-007 acceptance ในใบงาน ไม่ใช่ AC ใหม่
- ไม่มีผลรัน runtime/OS/DB; ข้อจำกัดและประตูใช้ H-GATE
