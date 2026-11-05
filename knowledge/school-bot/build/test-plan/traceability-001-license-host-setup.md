# Setup ฝั่ง Desktop สำหรับย้าย Key และสิทธิ์ออฟไลน์

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — BE-005/BE-007)

ใช้กับ TP001-002/003/004/009/010/088 ตาม [pack แยก task](traceability-001-license-host-pack.md) ต่อเติม [S-LIC/S-OBS/S-GATE](traceability-001-license-setup.md) โดยไม่เปลี่ยน setup ของ BE-003/BE-004 ผล runtime ทุกเคสยัง NOT_RUN

## H-LIC

ฝั่ง server ใช้หนึ่ง process/หนึ่ง host จำลอง สอง service/adapter instance ตาม S-LIC รันแยก memory store object เดียว และ file store สอง object ที่ canonical directory เดียวกัน ให้โหลด cache ทั้งคู่ก่อนเริ่ม อ่าน authoritative state ผ่าน instance ที่สาม/file object ใหม่หลังทุก operation ใช้ fake server UTC clock และ test ES256 signer ที่ verifier ตรวจ signature จริงได้ ฝัง public trust root ทดสอบ ไม่ใช้ accept-all verifier

ฝั่ง Desktop ใช้สอง host component instance A/B ใน test process อีกหนึ่ง process แยกจาก server ติดต่อผ่าน network double ที่ส่งไป stub server ข้างต้น; เป็น installation จำลองสองชุด ไม่ใช่สองเครื่องจริง แต่ละชุดมี secure storage double namespace ของตน, device P-256 key คนละคู่, wall/monotonic clock และ network switch แยกกัน double ต้องคงข้อมูลเมื่อสร้าง Desktop instance ใหม่ และปฏิเสธ unprotect/sign เมื่อ namespace ไม่ตรง ไม่มี private signer ฝั่ง Desktop

P1 เป็น staff_admin ที่มี active license_admin ใช้จัดการ License S1 ใน fixture นี้; P2 มี staff session แต่ไม่มี role; P3 มี session คนละ Channel กับ staff_admin; P4 ไม่มี session ใช้ actor แยก fixture ไม่ใช้ Login ของผู้เรียนแทน admin/device proof ใช้ If-Match ล่าสุดและ reason สำหรับ unbind ทุกครั้งที่ไม่ได้ตรวจ stale ETag

ค่าทดสอบ T=2026-11-03T00:00:00Z, License.ExpiresAt=T+10 วัน, E=T+259200 วินาที เว้น case ระบุ expiry สั้น; เป็นค่าของ fixture ไม่ใช่วันหมดอายุธุรกิจจริง ตั้ง clock A/B ให้ตรง server เริ่มต้น Session elapsed ใช้ monotonic; restart รีเซ็ต monotonic แต่คง wall/anchor/high-water mark เดิม

Fixture ย้าย: seed License active S1 หนึ่งใบ ก่อนเริ่ม requests; A activate ผ่าน challenge/proof ที่ T และ publish local generation สำเร็จ จึงปิด network A; ที่ T+3600s P1 unbind A ไม่ระบุ next_device_jkt แล้ว B activate ด้วย Key เดิมทันที B ไม่เคยมี entitlement; ไม่เพิ่ม License และไม่รอ E การย้ายไม่ส่งผลเข้า storage A ขณะ offline

## H-OBS

ทุก subcase ใช้ store/storage สะอาดใหม่และสร้าง baseline ด้วย public operation ก่อน inject; มีทั้ง A สะอาด, A valid, A expired ตาม case ไม่ผสม denied กับ offline ที่ยังไม่รู้ผลปฏิเสธ หยุด Desktop instance แล้วสร้างใหม่บน namespace เดิมเพื่อทดสอบ restart จริงของ component ไม่เพียงเรียก init ซ้ำ

พัก network double ได้ที่ก่อนส่ง (server calls=0), หลัง server commit ก่อนส่ง response ถึง Desktop, และหลัง verifier รับ Active ก่อน publish secure storage generation เท่านั้น ไม่แก้ committed record ไม่ถือ lock รอ writer; barrier server ใช้ S-OBS ก่อนเข้า store lock การปลอม response เพื่อทดสอบ protocol ต้องติดป้าย injected response แยกจาก domain denial จริง

เก็บ snapshot ก่อน/หลังแต่ละขั้น: server License ทุก field/Binding ทุกแถว/current pointer/epoch/live count/LastCheckedAt/LastEntitlementExpiresAt/audit/result และ local generation/status/token claims checked_at/exp/key-presence/anchor/high-water mark ใช้ fingerprint/redacted metadata ไม่เก็บ Key/token/private key/ciphertext เต็ม ผลปฏิเสธต้องไม่เพิ่ม success audit/result; nonce consumption แยกจาก domain mutation

Local valid ต้อง publish token/key/anchor แบบ atomic ก่อน unlock write fail ต้องไม่เผย generation ครึ่งชุดและไม่ ready; server ที่ commit ไปแล้วไม่ rollback เพราะ local fail Denied ต้อง persist และ invalidate cache; restart offline ยัง locked ไม่บังคับลบ token bytes ถ้าถูกทำให้ใช้ไม่ได้แล้ว การเปลี่ยน high-water mark ไม่ใช่การต่อ lease

## H-GATE

| ส่วน | พิสูจน์ได้ตอนนี้ | ส่วนรอและผู้รับ |
|---|---|---|
| Stub/test signer | service/store, verifier, clocks, restart component, secure-storage double, fault/response/state | check เก็บหลักฐานแยก backend; ไม่ถือว่าผ่านจนรัน |
| PostgreSQL | ไม่มีหลักฐานจากชุดนี้ | DBA-003/G-CORE ตาม S-GATE: สอง process/host ต่อ PostgreSQL 15.19 ฐานเดียวและ reader ที่สาม; vault เตรียม SELECT ให้มนุษย์รันตามมติ 053 |
| Gateway/auth จริง | network double ไม่พิสูจน์ wire/trust | QA-001 รอ mapping/transport/H5 พร้อมก่อนตรวจของจริง |
| Installer/OS storage | component double ไม่พิสูจน์ custody/durability | QA-001 ร่วม QA-008 Windows 11 25H2 x64 และ QA-009 macOS 15+ Intel/Apple Silicon; รอแพ็กเกจ/เครื่อง/บัญชีและคำอนุญาต installer ตรวจ restart/copy/read/write fail บน OS จริง |
| Signer จริง | test signature ไม่พิสูจน์ custody/rotation จริง | มติ 047 พักผู้ถือกุญแจ/ที่เก็บ; ผู้ใช้/เจ้าของ security ตอบก่อนส่วนใช้กุญแจจริง ไม่สร้างหรืออ่าน secret |

ช่องว่างที่ยังเปิด: OS-level protected key, VM snapshot ทั้ง disk/store โดย privileged attacker, physical uniqueness และ multi-host DB ไม่อยู่ในผล double ไม่มีการบันทึกยอมรับความเสี่ยงแทนคน; ข้อจำกัด rollback ของ privileged attacker อยู่ใน DES-002 แล้ว ไม่สร้าง AC ใหม่

## หลักฐาน

- [DES-002 Rev4](../design/des-002.md), [entitlement Rev4](../design/des-002-entitlement.md), [recovery Rev4](../design/des-002-recovery.md), [device proof Rev3](../design/des-002-device-proof.md), [transactions Rev12](../design/data-contract-rules-transactions.md)
- [มติ 047 — พักกุญแจเซ็นจริง](../../shared/decisions/decisions-047.md), [มติ 053 — stub และประตูของจริง](../../shared/decisions/decisions-053.md)
- build/plan/BE-005.md, BE-007.md และ tasks-001.json: AC/acceptance ตรงใบงาน; ไม่รัน SQL/runtime และไม่แก้สถานะงาน
