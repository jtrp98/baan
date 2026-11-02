# ชุดเกณฑ์ส่งมอบและผู้รับผิดชอบการตัดสินใจ

> แก้ล่าสุด 2026-11-02 · แก้โดย spec · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ชุดนี้รวม [REQ-031 (ติดตั้งและดูแลแอปบน Windows)](req-031.md) และ [REQ-032 (ติดตั้งแอปบน macOS)](req-032.md) เพื่อเตรียมตรวจการติดตั้งและควบคุมหุ่นจริงบน Windows/macOS พร้อมเกณฑ์ performance และผู้รับผิดชอบการลงนามแพ็กเกจ การแจกจ่าย และการตรวจรับ


คำย่อในเอกสาร: OS = Operating System หรือระบบปฏิบัติการ; MSI = Windows Installer package; FPS = frames per second หรือจำนวนภาพต่อวินาที; CPU = หน่วยประมวลผล; RAM = หน่วยความจำ; GPU = หน่วยประมวลผลกราฟิก
## แพลตฟอร์มเป้าหมาย

ผู้ใช้ยืนยัน Windows 11 25H2 x64 และ macOS 15+ ทั้ง Intel x86_64 และ Apple Silicon arm64 ตาม [มติ 019 (Windows 11 25H2 x64)](decisions-019.md) และ [มติ 008 (Windows และ macOS ควบคุมหุ่นจริง)](decisions-008.md) ทั้งสองระบบต้องควบคุมหุ่นจริงได้ Windows 10 ออกจากขอบเขตแล้ว ผลสำรวจ Windows 10 เป็นหลักฐานเดิม

การเลือกแพลตฟอร์มไม่ใช่ผลตรวจรับแอป ตัวติดตั้ง หุ่น การลงนาม หรือ performance แต่ละเรื่องยังต้องมีหลักฐานตรวจรับจริง

## กรณีตรวจตัวติดตั้ง

| แพลตฟอร์ม | กรณีที่ต้องตรวจ |
|---|---|
| Windows 11 25H2 x64 | ตรวจ setup EXE และ MSI แยกกัน โดย setup รวม .NET 10.0.13 win-x64 แบบ self-contained ซึ่งมี dependency ต่างจาก MSI เปล่า |
| Windows 11 25H2 x64 | บัญชีสะอาดทั้งมีและไม่มี WebView2 รวมเครือข่ายออนไลน์และถูกบล็อก เมื่อไม่มี runtime ต้องขอความยินยอมติดตั้ง ยกเลิกแล้วห้ามแสดงว่าสำเร็จ |
| Windows 11 25H2 x64 | ติดตั้ง ยกเลิก repair หลังลบ engine อัปเกรดรุ่นหลัก ป้องกัน downgrade และถอนโดยเก็บ Projects กับ Device ID ต้องปิดแอปก่อนอัปเกรด |
| macOS 15+ | ใช้ Universal PKG เดียวติดตั้งใน /Applications ผ่าน productbuild ตรวจเครื่อง Intel และ arm64 จริง โดยไม่ใช้ Rosetta แทน arm64 เปิดจาก Finder ผ่าน Gatekeeper และถอนแล้วยังคงโครงงานใน Application Support |

## การลงนามและ notarization

เกณฑ์ส่วนนี้ยังเป็นข้อเสนอรอผู้ตรวจรับยืนยัน

- Windows: เสนอให้ลงนาม MSI/EXE ด้วย code signing certificate ขององค์กรก่อนแจก checksum ไม่ใช่ลายเซ็นผู้เผยแพร่ ตาม [BR-031-04](req-031.md) (ต้องปิดแอปก่อนอัปเกรดและแยก checksum จากลายเซ็น)
- macOS: เสนอให้ใช้ Developer ID Application และ Installer เปิด hardened runtime ทำ notarize และ staple ก่อนแจก Developer build/ad-hoc signing ไม่เท่ากับ notarized release ตาม [BR-032-03](req-032.md) (ต้องพิสูจน์ความเข้ากันได้และการลงนาม release)
- ต้องเก็บ signature/notarization receipts, ชนิดไฟล์ PE/Mach-O และ architecture, hash ของ engine/แพ็กเกจ ตลอดจน version/notices จากเครื่อง build Release Candidate (RC)

## เกณฑ์ performance ที่ยืนยันแล้ว

ผู้ใช้ยืนยัน 2026-10-24 ให้ **300 MB / เปิด 5 วินาที / 30 FPS** เป็นเกณฑ์ตรวจรับตาม [มติ 037 (เกณฑ์อัปเดต โหมดทดลอง และ performance)](decisions-037.md) ใช้วิธีวัด cold/warm start พร้อมระบุ scene/ขนาด และสเปกเครื่องอ้างอิง CPU/RAM/GPU/OS build/web runtime ผลวัดจริงยังไม่มี และผู้ตรวจรับแต่ละแพลตฟอร์มยังรอระบุ

## ผู้รับผิดชอบ

| ประเด็น | ผู้ถือ/ผู้ตัดสิน (กรอก) | กำหนดเสร็จ | หมายเหตุ |
|---|---|---|---|
| ผู้ถือใบรับรอง Windows (code signing) | ______ — **[มติ 038 (ผู้อนุมัติเนื้อหา rubric และสิทธิ์ทดสอบอุปกรณ์)](decisions-038.md): ยังไม่ระบุ** | ______ | cert หมดอายุ/renewal เป็นของผู้ถือ |
| ผู้ถือ Apple Developer ID (Application+Installer) | ______ — ยังไม่ระบุ (มติเดียวกัน) | ______ | ต้องมีสิทธิ์ notarize |
| ช่องทางแจกจ่าย (เว็บดาวน์โหลด/แฟลช/อื่น) | ______ — ยังไม่ระบุ (มติเดียวกัน) | ______ | มีผลต่อ quarantine/Gatekeeper และวิธีทดสอบ |
| ผู้ตรวจรับ G-DELIVERY รายแพลตฟอร์ม (Win11/mac Intel/mac arm64) | ______ | ______ | แยกรายแพลตฟอร์มได้ |
| ผู้ยืนยันเกณฑ์ performance + วิธีวัด | **ยืนยันแล้ว: ผู้ใช้ (มติ 037 — เกณฑ์ 300 MB / 5 วินาที / 30 FPS)** | — | ผลวัดจริงยังไม่มี |

## ยังไม่ยืนยัน

ผู้ใช้ยังต้องระบุผู้ถือใบรับรอง Windows ผู้ถือ Apple Developer ID ช่องทางแจกจ่าย และผู้ตรวจรับ Windows/macOS Intel/macOS arm64 เกณฑ์ signing/notarization ข้างต้นยังเป็นข้อเสนอ ส่วนเกณฑ์ performance ยืนยันแล้วแต่ยังไม่มีผลวัดจริง

## หลักฐาน

- os-compatibility-001 (หลักฐาน OS และข้อเสนอขั้นต่ำ) ระบุ MSI/EXE ยัง unsigned และ .NET 10 OS matrix รองรับ Windows 11 25H2; Wails beta.30 เป็น pre-release ยังไม่ได้ตรวจ artifact จริงซ้ำในงานนี้
- `docs/INSTALLERS.md:171–180` ระบุ signing/notarization ฝั่ง macOS
- BA-004 (เตรียมเกณฑ์ส่งมอบและเจ้าของการตัดสินใจ) ใช้กับ G-DELIVERY (เงื่อนไขรับรองการติดตั้ง แพ็กเกจและ performance) เกณฑ์ติดตั้งอ้าง [REQ-031 (ติดตั้งและดูแลแอปบน Windows)](req-031.md) / [REQ-032 (ติดตั้งแอปบน macOS)](req-032.md) และ os-compatibility-001
- มติ 038 ยืนยันว่าผู้ถือใบรับรองและช่องทางแจกจ่ายยังไม่ระบุ
