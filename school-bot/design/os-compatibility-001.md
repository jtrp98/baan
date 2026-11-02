# หลักฐาน OS และข้อเสนอขั้นต่ำแบบมีเงื่อนไข

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## ส่วนต่อของสัญญา

- [หลักฐาน source และข้อจำกัดเดิม](os-compatibility-001-evidence.md)

## เอกสารอ้างอิง

[AC-032-01 (ติดตั้งแพ็กเกจเดียวบนเครื่องทดสอบ macOS 15+ ทั้ง Intel และ Apple Silicon แล้วเปิดแอปและงาน local ได้)](../requirement/req-032.md) · [BA-004 (งานสำรวจเครื่องและเกณฑ์ส่งมอบ)](os-compatibility-001.md) · [OQ-011 (กลุ่มเครื่องและเกณฑ์ยอมรับการส่งมอบ)](../open-questions/oq-011.md) · [SA-003 (งานทบทวน native hardware และ OS)](os-compatibility-001.md) · [DES-006 (หุ่นจริง Windows/macOS)](des-006.md) · [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon กับหุ่นรุ่นที่ผ่านการยืนยันแล้ว เชื่อมต่อและส่งคำสั่งควบคุมหุ่นผ่าน native transport …)](../requirement/req-032.md)

เอกสารนี้เก็บผลสำรวจและข้อเสนอ OS ณ วันที่ตรวจเดิม Windows 10 เป็นเป้าหมายในช่วงที่สำรวจ ตาม[มติ 017 (ข้อเสนอ Windows 10 เดิม)](../requirement/decisions-017.md) ซึ่งถูกแทนด้วย [มติ 019 (เปลี่ยนเป้าหมายเป็น Windows 11)](../requirement/decisions-019.md) แล้ว ตาราง Windows 10 ด้านล่างเป็นบริบทเดิม ไม่ใช่การเพิ่มเป้าหมาย release ปัจจุบัน.

ตรวจ 2026-10-21 ตาม [decisions-017](../requirement/decisions-017.md): ต้องมี Win10 x64; Windows/macOS ต้องใช้หุ่นจริง ยังไม่อนุมัติขั้นต่ำ สถานะดู [index](index.md)

## ข้อเท็จจริง source/build/runtime

Source root: C:/src/schoolbright/target/school-bot-v2; ชื่อ .cpp ที่ย่ออยู่ engines/zide/src/; อ่านตาม allowlist

## เป้าเอกสารและข้อแตกต่าง

## Official evidence ตรวจ 2026-10-21

- Go 1.25 ต้อง macOS 12+ ตาม [release notes](https://go.dev/doc/go1.25#darwin); [Go minimum requirements](https://go.dev/wiki/MinimumRequirements) ระบุ Go 1.21+ ต้อง Windows 10+ ทั้งสองเป็น floor ของ Go ไม่ลด deployment target 15.0 ของโครงการ
- [Wails beta.30](https://github.com/wailsapp/wails/releases/tag/v3.0.0-beta.30) เป็น pre-release; ไม่พบ min OS ทั้งชุดใน release note ไม่ใช้ latest แทน pin
- [.NET 10.0.13](https://github.com/dotnet/core/blob/main/release-notes/10.0/10.0.13/10.0.13.md) มี WindowsDesktop win-x64 ตรง csproj; [OS matrix .NET 10](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md) ระบุ Windows 11 25H2 และ Windows 10 บาง edition/version ไม่ใช่ Windows 10 ทุกเครื่อง
- [Microsoft WebView2/Edge OS policy](https://learn.microsoft.com/en-us/deployedge/microsoft-edge-supported-operating-systems) ระบุ WebView2 updates สำหรับ Windows 10 22H2 ถึงอย่างน้อย October 2028; ไม่ใช่หลักฐานว่า .NET setup หรือ SchoolBot รองรับเครื่องนั้น

ผล Wails/x/sys/installer ดู [Win10 review](windows10-compatibility-001.md); PE/driver/WebView2 จริงและ npm/Zig/MSVC/SDK matrix ยังไม่ครบ

## ข้อเสนอ SA สำหรับนำไปตรวจ

| รายการ | ข้อเสนอแบบมีเงื่อนไข | สิ่งที่ต้องปิดก่อนรับรอง |
|---|---|---|
| Windows | Win10 x64: Home/Pro22H2 และ LTSC2019/2021 เป็น candidates ตาม [Win10 review](windows10-compatibility-001.md); คง Win11 | รอทางจัดการ .NET setup support gap และผล setup/MSI/native ราย edition/build |
| macOS | เสนอ floor 15.0 สำหรับ Intel x86_64 และ Apple Silicon arm64 ตาม build ปัจจุบัน; รุ่นย่อยที่รับรองต้องระบุจากผลจริง | Darwin HID/Serial, installer plist/Mach-O minimum, WebKit, signing และ AC-032-01–03 บนทั้งสองเครื่อง |
| Arch อื่น | ไม่ประกาศ Windows ARM64/x86 หรือ Linux จาก metadata/runtime dependency เพียงอย่างเดียว | ยังไม่มี desktop package/native acceptance หลักฐานในขอบเขตนี้ |

ขั้นต่ำของแพ็กเกจครบยังไม่ยืนยัน ปัดตกประกาศ Windows 10 ทุก build จาก README, ลด Mac ต่ำกว่า 15 จาก Go floor และใช้ Universal build แทน hardware proof เพราะ constraints แต่ละชั้นต่างกัน

## Signing ข้อจำกัด และส่งต่อ

Task BA-004 / Reference OQ-011, G-DELIVERY / Reason: เก็บ inventory/dependency intersection/network/performance/signing แล้วส่งข้อเสนอให้ผู้ใช้ตรวจตามมติเดิม พร้อมผู้รับรองเฉพาะด้าน

Task SA-003 / Reference DES-006, AC-032-02 / Reason: Darwin backend ยังขาด ต้อง review ต่อ; งานนี้ไม่เปลี่ยน schema/API ไม่มี migration/SQL

รอบนี้อ่าน Package.wxs/app.manifest/Wails/x/sys แล้ว: ไม่พบ Win11-only gate แต่ยังไม่พิสูจน์ runtime floor ทั้งชุด; inventory ปัจจุบันเป็น Win11 ไม่ใช่ Win10/โรงเรียน ไม่ build/tests/install/device/rebuild หรือปิด gates
