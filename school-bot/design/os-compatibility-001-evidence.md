# หลักฐาน OS และข้อเสนอขั้นต่ำแบบมีเงื่อนไข — หลักฐาน source และข้อจำกัดเดิม

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [หลักฐาน OS และข้อเสนอขั้นต่ำแบบมีเงื่อนไข](os-compatibility-001.md) อธิบายหลักฐาน source และข้อจำกัดเดิม.

## เอกสารอ้างอิง

[REQ-031 (ติดตั้งและดูแลแอปบน Windows)](../requirement/req-031.md) · [DES-006 (หุ่นจริง Windows/macOS)](des-006.md) · [REQ-032 (ติดตั้งแอปบน macOS)](../requirement/req-032.md) · [AC-032-02 (บน macOS 15+ ทั้ง Intel และ Apple Silicon กับหุ่นรุ่นที่ผ่านการยืนยันแล้ว เชื่อมต่อและส่งคำสั่งควบคุมหุ่นผ่าน native transport …)](../requirement/req-032.md) · [AC-031-01 (บน Windows 11 25H2 x64 บัญชีทดสอบสะอาดที่มี WebView2 ติดตั้ง MSI แล้วเปิดสาม mode และ engines ที่บรรจุมาได้โดยไม่ติดตั้งเครื่อง…)](../requirement/req-031.md) · [AC-032-01 (ติดตั้งแพ็กเกจเดียวบนเครื่องทดสอบ macOS 15+ ทั้ง Intel และ Apple Silicon แล้วเปิดแอปและงาน local ได้)](../requirement/req-032.md) · [DES-007 (Release และ trusted update)](des-007.md)

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

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

- docs/INSTALLERS.md:7–8: Windows 10/11 x64, macOS 15+ Universal; README.md:65–85 เป็น build target ไม่ใช่ acceptance
- REQ-031:9 ยังกล่าวถึง MSI เป็นแพ็กเกจหลัก แต่เอกสารปัจจุบันมี setup EXE ครอบ MSI; ต้องทดสอบสอง entrypoints เพราะ setup เพิ่ม .NET dependency
- DES-006:22–33 เป็น Darwin proposal ไม่ใช่ as-built; REQ-032 AC-032-02 ยังทำไม่ได้ด้วย native source ปัจจุบัน
- README.md:210 ระบุ 300 MB/5 s/30 FPS เป็น targets ไม่ใช่ผลวัดหรือ SLA

| เครื่องแยก | วิธีตรวจภายหลังเมื่อได้รับอนุญาต | Trace |
|---|---|---|
| Windows 11 baseline และ Windows 10 แต่ละ edition/build ที่เสนอ | clean account/VM มี-ไม่มี WebView2, online/blocked network, setup/MSI install/cancel/repair/upgrade/downgrade/uninstall; ตรวจเก็บ Projects/Device ID | AC-031-01–04 |
| Mac Intel และ Apple Silicon บน 15.x และรุ่นที่สำรวจพบ | PKG เดียว/Finder launch, สาม mode/engines/uninstall เก็บ project/permissions/Gatekeeper; ไม่ใช้ Rosetta แทน arm64 | AC-032-01/03 |
| เครื่องจริงทั้งสาม architecture กับ tuple หุ่นที่ยืนยัน | HID/Serial/driver/USB hub/calibration/stop/disconnect ตาม [hardware survey](hardware-survey-001.md) | AC-032-02, G-HW |
| เครื่อง build และ RC สุดท้าย | compiler/SDK/GOOS/GOARCH/GOAMD64, PE/Mach-O/imports, engine/package hashes, version/notices/assets, signature/notarization receipts | DES-007, G-DELIVERY |

เก็บ CPU/RAM/GPU/storage/OS build/web runtime/driver/network, cold/warm start, scene/FPS/ขนาด ก่อนเสนอ performance criteria ยังไม่ยืนยัน min CPU/RAM

scripts/build-desktop.sh:95–104 ใช้ ad-hoc; package-desktop.sh:30–35 และ package-desktop.ps1:59 เป็น unsigned PKG/EXE/MSI ต้อง Windows signing, Mac Developer ID Application/Installer+hardened runtime+notarize/staple ก่อนแจกตาม docs/INSTALLERS.md:171–180 ยังไม่ตรวจ artifact จริง
