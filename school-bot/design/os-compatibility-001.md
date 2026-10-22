# หลักฐาน OS และข้อเสนอขั้นต่ำแบบมีเงื่อนไข — Rev2

ตรวจ 2026-10-21 ตาม [decisions-017](../requirement/decisions-017.md): ต้องมี Win10 x64; Windows/macOS ต้องใช้หุ่นจริง ยังไม่อนุมัติขั้นต่ำ สถานะดู [index](index.md)

## ข้อเท็จจริง source/build/runtime

Source root: C:/src/schoolbright/target/school-bot-v2; ชื่อ .cpp ที่ย่ออยู่ engines/zide/src/; อ่านตาม allowlist

| ชั้น | หลักฐาน | ขอบเขตที่พิสูจน์ได้ |
|---|---|---|
| Go/Wails | app/go.mod:3–7; app/frontend/package.json:18 | Go directive 1.25.0, Wails Go/JS beta.30, x/sys v0.46.0; scripts/common.ps1:3–20 เลือก portable/PATH ไม่ตรวจเวอร์ชัน |
| Windows Desktop | scripts/build-desktop.ps1:22–53 | สร้าง zide/demo/main production/windowsgui; resource amd64 แต่ไม่ force Go GOARCH/GOAMD64 ต้องตรวจ PE จริง |
| Windows installer | scripts/package-desktop.ps1:29–44; app/installer/SchoolBot.Installer.csproj:4–24 | MSI x64/WixUI 5.0.2; setup WPF net10.0-windows/runtime 10.0.13 win-x64 self-contained; ไม่ต้องลง .NET แยกแต่ OS constraints ยังมี |
| C++ | engines/zide/CMakeLists.txt:1–16; engines/zide/scripts/build.ps1:23–39,66–74 | CMake≥3.16/C++17/HID static; Zig portable 0.15.2 หรือ PATH: x86_64-windows-gnu baseline; fallback CMake -A x64 |
| Mac build | scripts/build-desktop.sh:4–36,51–87 | Darwin build/CGO=1/deployment target 15.0; lipo amd64+arm64 main/demo/zide; engines/zide/scripts/build.sh:36–51 ใช้ CXX/c++ -arch |
| Mac package | scripts/package-desktop.sh:19–32 | ตรวจสอง arch; productbuild ลง /Applications ผ่าน installer-requirements.plist; ไม่อ่าน plist นอก allowlist จึงไม่ยืนยัน installer OS gate |
| Hardware | engines/zide/engine.json:10–11; engines/zide/src/transport.cpp:7–13, discovery.cpp:122–128 | Darwin entrypoint มี แต่ discovery/native HID/Serial ยัง Windows-only |
| Web runtime | app/main.go:28–31; app/runtime_windows.go:19–34,50–75; app/runtime_other.go:10–11 | Windows ตรวจ WebView2 pv มีค่า ไม่ตรวจ min version; ขาดแล้วขอติดตั้งผ่านเน็ต; Mac ใช้ WKWebView |
| Payload/API | scripts/build-desktop.ps1:22,31–33; scripts/build-desktop.sh:57–87; docs/INSTALLERS.md:11–12 | bundle demo+zide; API deploy แยก; README.md:11–13 ระบุ mixly ไม่ bundle/routing |

README.md:17,66: build ใช้ Node 24 LTS; package.json:19–33 มี exact/^ pins ยังไม่ตรวจ lockfile/WebKit floor ผู้ใช้ไม่ต้องลง Node/Go/Qt (docs/INSTALLERS.md:11)

## เป้าเอกสารและข้อแตกต่าง

- docs/INSTALLERS.md:7–8: Windows 10/11 x64, macOS 15+ Universal; README.md:65–85 เป็น build target ไม่ใช่ acceptance
- REQ-031:9 ยังกล่าวถึง MSI เป็นแพ็กเกจหลัก แต่เอกสารปัจจุบันมี setup EXE ครอบ MSI; ต้องทดสอบสอง entrypoints เพราะ setup เพิ่ม .NET dependency
- DES-006:22–33 เป็น Darwin proposal ไม่ใช่ as-built; REQ-032 AC-032-02 ยังทำไม่ได้ด้วย native source ปัจจุบัน
- README.md:210 ระบุ 300 MB/5 s/30 FPS เป็น targets ไม่ใช่ผลวัดหรือ SLA

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

## เครื่องและหลักฐานที่ต้องมี

| เครื่องแยก | วิธีตรวจภายหลังเมื่อได้รับอนุญาต | Trace |
|---|---|---|
| Windows 11 baseline และ Windows 10 แต่ละ edition/build ที่เสนอ | clean account/VM มี-ไม่มี WebView2, online/blocked network, setup/MSI install/cancel/repair/upgrade/downgrade/uninstall; ตรวจเก็บ Projects/Device ID | AC-031-01–04 |
| Mac Intel และ Apple Silicon บน 15.x และรุ่นที่สำรวจพบ | PKG เดียว/Finder launch, สาม mode/engines/uninstall เก็บ project/permissions/Gatekeeper; ไม่ใช้ Rosetta แทน arm64 | AC-032-01/03 |
| เครื่องจริงทั้งสาม architecture กับ tuple หุ่นที่ยืนยัน | HID/Serial/driver/USB hub/calibration/stop/disconnect ตาม [hardware survey](hardware-survey-001.md) | AC-032-02, G-HW |
| เครื่อง build และ RC สุดท้าย | compiler/SDK/GOOS/GOARCH/GOAMD64, PE/Mach-O/imports, engine/package hashes, version/notices/assets, signature/notarization receipts | DES-007, G-DELIVERY |

เก็บ CPU/RAM/GPU/storage/OS build/web runtime/driver/network, cold/warm start, scene/FPS/ขนาด ก่อนเสนอ performance criteria ยังไม่ยืนยัน min CPU/RAM

## Signing ข้อจำกัด และส่งต่อ

scripts/build-desktop.sh:95–104 ใช้ ad-hoc; package-desktop.sh:30–35 และ package-desktop.ps1:59 เป็น unsigned PKG/EXE/MSI ต้อง Windows signing, Mac Developer ID Application/Installer+hardened runtime+notarize/staple ก่อนแจกตาม docs/INSTALLERS.md:171–180 ยังไม่ตรวจ artifact จริง

Task BA-004 / Reference OQ-011, G-DELIVERY / Reason: เก็บ inventory/dependency intersection/network/performance/signing แล้วส่งข้อเสนอให้ผู้ใช้ตรวจตามมติเดิม พร้อมผู้รับรองเฉพาะด้าน

Task SA-003 / Reference DES-006, AC-032-02 / Reason: Darwin backend ยังขาด ต้อง review ต่อ; งานนี้ไม่เปลี่ยน schema/API ไม่มี migration/SQL

รอบนี้อ่าน Package.wxs/app.manifest/Wails/x/sys แล้ว: ไม่พบ Win11-only gate แต่ยังไม่พิสูจน์ runtime floor ทั้งชุด; inventory ปัจจุบันเป็น Win11 ไม่ใช่ Win10/โรงเรียน ไม่ build/tests/install/device/rebuild หรือปิด gates

## Change Log

- 2026-10-21 — Rev1: แยก source constraints/เอกสารเป้า/official evidence/ข้อเสนอทดสอบ; ยังไม่อนุมัติ min OS หรือ hardware support

- 2026-10-21 — Rev2: ใช้มติ Win10 decisions-017; เพิ่ม windows10-compatibility-001 และแยก runtime/vendor support
