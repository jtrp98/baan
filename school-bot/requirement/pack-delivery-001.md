# pack-delivery-001 — delivery & decision-owner pack เข้า G-DELIVERY (BA-004)

> Task: BA-004 · วันที่ 2026-10-24 · รันโดย นายช่าง solo (subagent role spec) · OS target ยืนยันแล้วตาม decisions-019 (ห้ามถามซ้ำ) · เกณฑ์ signing/notarization/performance เป็นข้อเสนอรอผู้ตรวจรับ

## 1. OS target ยืนยันแล้ว — ห้ามถามซ้ำ (decisions-019, decisions-008)

- Windows 11 25H2 x64 (Windows 10 ออกจากขอบเขต; ผลสำรวจ Win10 เป็นประวัติ)
- macOS 15+ ทั้ง Intel x86_64 และ Apple Silicon arm64; ทั้งสอง OS ต้องควบคุมหุ่นจริงได้
- การเลือก OS ยังไม่ใช่หลักฐานว่าแอป/Setup/หุ่นผ่านทดสอบ — signing/performance/installation/hardware ยังต้องเตรียมหลักฐานตาม gate

## 2. Installer cases (เกณฑ์เสนอเข้า G-DELIVERY — อ้าง REQ-031/032 + os-compatibility-001)

Windows 11 25H2 x64:

- ทดสอบสอง entrypoints แยกกัน: setup EXE และ MSI (setup ครอบ .NET 10.0.13 win-x64 self-contained — เพิ่ม dependency ต่างจาก MSI เปล่า)
- clean account: มี/ไม่มี WebView2 (ไม่มี → ขอ consent ติดตั้ง runtime, ยกเลิกแล้วห้ามแสดงว่าสำเร็จ) · online/blocked network
- install/cancel/repair (ลบ engine แล้ว repair คืน)/major upgrade/กัน downgrade/uninstall เก็บ Projects+Device ID · ต้องปิดแอปก่อนอัปเกรด

macOS 15+:

- PKG เดียว Universal ลง /Applications ผ่าน productbuild; ทดสอบทั้ง Intel และ arm64 จริง (ห้ามใช้ Rosetta แทน arm64); Finder launch ผ่าน Gatekeeper; ถอนแล้วโครงงานใน Application Support ยังอยู่

## 3. Signing / notarization (เกณฑ์เสนอ — ยังไม่มีมติผู้ใช้รับรอง)

- Windows: MSI/EXE ปัจจุบัน unsigned (os-compatibility-001:62) — เกณฑ์เสนอ: ลงนามด้วย code signing cert ขององค์กรก่อนแจก; checksum ไม่ใช่ลายเซ็นผู้เผยแพร่ (BR-031-04)
- macOS: Developer ID Application + Installer, hardened runtime, notarize + staple ก่อนแจก (docs/INSTALLERS.md:171–180); ad-hoc signing ปัจจุบันไม่ใช่ notarized release (BR-032-03)
- Evidence ที่ต้องเก็บ: signature/notarization receipts, PE/Mach-O/architecture, engine/package hashes, version/notices จากเครื่อง build RC

## 4. Performance — ยืนยันเป็น acceptance แล้ว (decisions-037)

ผู้ใช้ยืนยัน 2026-10-24: เป้า **300 MB / เปิด 5 วินาที / 30 FPS ใช้เป็น acceptance ของ G-DELIVERY** พร้อมวิธีวัดตามที่ร่างไว้ (cold/warm start, scene/ขนาด, สเปกเครื่องอ้างอิง CPU/RAM/GPU/OS build/web runtime) — ผู้ตรวจรับรายแพลตฟอร์มยังเป็นช่องกรอกแยกตาม §5 · ผลวัดจริงยังไม่มี (ยังไม่ถือว่าผ่าน)

## 5. ตาราง decision-owner (ช่องว่างให้คนกรอก)

| ประเด็น | ผู้ถือ/ผู้ตัดสิน (กรอก) | กำหนดเสร็จ | หมายเหตุ |
|---|---|---|---|
| ผู้ถือใบรับรอง Windows (code signing) | ______ | ______ | cert หมดอายุ/renewal เป็นของผู้ถือ |
| ผู้ถือ Apple Developer ID (Application+Installer) | ______ | ______ | ต้องมีสิทธิ์ notarize |
| ช่องทางแจกจ่าย (เว็บดาวน์โหลด/แฟลช/อื่น) | ______ | ______ | มีผลต่อ quarantine/Gatekeeper และวิธีทดสอบ |
| ผู้ตรวจรับ G-DELIVERY รายแพลตฟอร์ม (Win11/mac Intel/mac arm64) | ______ | ______ | แยกรายแพลตฟอร์มได้ |
| ผู้ยืนยันเกณฑ์ performance + วิธีวัด | ______ | ______ | จนกว่ายืนยัน ไม่ถือ 300MB/5s/30FPS เป็น SLA |

ข้อจำกัดที่ยังคง: .NET 10 OS matrix รองรับ Win11 25H2; Wails beta.30 เป็น pre-release; ยังไม่ตรวจ artifact จริง — pack นี้เป็นเกณฑ์เสนอ ไม่ใช่ผลตรวจรับ

## Change Log

- 2026-10-24 — สร้าง delivery & decision-owner pack ตาม BA-004 (decisions-019/008 + os-compatibility-001); รันโดย นายช่าง solo (subagent role spec); read-only ไม่ถาม OS ซ้ำ ไม่อนุมัติ release
- 2026-10-24 — decisions-037: §4 performance ยืนยันเป็น acceptance ของ G-DELIVERY (ผู้ตรวจรับรายแพลตฟอร์มยังค้างตาม §5)
