# Windows 10 x64 — หลักฐานและข้อเสนอขั้นต่ำ Rev1

ตรวจ 2026-10-21 ตาม [decisions-017](../requirement/decisions-017.md); ไม่อนุมัติขั้นต่ำ/risk สถานะดู [index](index.md)

## ขอบเขตข้อสรุป

Win10 เป็น business target; Win11/macOS/หุ่นจริงคงเดิม ไม่พบ Windows11-only gate แต่ยังไม่พิสูจน์ runtime floor ทั้งแพ็กเกจ Vendor support แยก Windows/.NET/WebView2/driver; นอก matrix ไม่เท่ากับรันไม่ได้ และ ESU ไม่ต่อ .NET support เอง

## As-built

พาธจาก source root; W=.tools/gopath/pkg/mod/github.com/wailsapp/wails/v3@v3.0.0-beta.30; X=.tools/gopath/pkg/mod/golang.org/x/sys@v0.46.0 cache เดิม

| ชั้น | หลักฐานและข้อจำกัด |
|---|---|
| Setup EXE | app/installer/SchoolBot.Installer.csproj:4–24 WPF net10.0-windows/10.0.13/self-contained win-x64; ยังพึ่ง runtime ที่ฝัง; app.manifest:5–13 asInvoker/GUID/DPI ไม่ยืนยัน floor |
| Direct MSI | app/build/windows/Package.wxs:2–5,24–70,92–109 per-user/InstallerVersion500/main/demo/zide/WebView2; รวม InstallerUI.wxs/InstallerDialogs.wxs ไม่พบ OS launch condition หรือ .NET custom action |
| Go desktop | app/go.mod:3–7, go.sum:25–30 Go1.25/Wails beta.30/x/sys0.46; scripts/build-desktop.ps1:22–52 ไม่ force GOARCH/GOAMD64; [Go floor] Win10+; PE/CPU ยังไม่ตรวจ |
| Wails | W/pkg/application/application_windows.go:381–412 ตรวจ DPI API แล้ว fallback; W/pkg/w32/theme.go:181–200 กั้น themes ที่17763/backdrop22621 ไม่ใช่ global OS floor; W/pkg/application/webview_window_windows.go:1557 มี theme guard |
| API audit | W/pkg/application/webview_window_windows.go:795 เรียก GetDpiForWindow ตรงใน helper ยังไม่ยืนยัน caller; :2275 มี guard; [API] เริ่ม1607 ไม่ใช่ global minimum |
| x/sys | X/windows/dll_windows.go:266–316 Find คืน error/Call panic หาก API หาย ต้องตรวจ caller/imports ไม่ใช้ declarations ตัดสิน floor |
| Engine | engines/zide/scripts/build.ps1:23–39,72 ใช้ Zig0.15.2 x86_64-windows-gnu baseline หรือ CMake x64; engines/zide/src/discovery.cpp:49–69 SetupAPI, engines/zide/src/transport_serial.cpp:12–38 CreateFile/DCB; driver/imports ยังไม่ตรวจ |
| WebView2 | app/runtime_windows.go:19–34,50–75 เช็ก registry pv ไม่ว่าง ไม่ตรวจ minimum version; ขาดแล้วขอติดตั้งผ่านเน็ต ตรวจ evergreen จริง |

Direct MSI ไม่เรียก WPF shell แต่พึ่ง desktop/engine/WebView2/driver เดิม; docs/INSTALLERS.md:30–31,93 ให้ IT ใช้ ไม่ใช่แทน setup UX; :178–179 ยัง unsigned ต้อง signing/updater trust ตาม DES-007; API deploy แยก (:11–12)

## Edition/build และ vendor policy

ตรวจ official 2026-10-21; patch เป็น test baseline ไม่ใช่ source minimum อ่าน [Windows builds] คู่ [.NET matrix]

| Windows 10 x64 | หลักฐาน ณ วันที่ตรวจ | ข้อเสนอ SA |
|---|---|---|
| Home/Pro 22H2 /19045 | Windows ปกติหมด support; .NET10 ไม่ระบุ22H2; LCU19045.7807 [KB22] | ชุดทดสอบหลัก; setup10.0.13 มี support gap แม้ทดสอบผ่าน |
| Enterprise LTSC2019 /1809 /17763 | .NET matrix มี1809(E); Windows extended ถึง2029-01-09; LCU17763.9376 [KB19] | candidate ต่ำสุดเฉพาะ edition นี้ ไม่ใช่ทุก build≥17763 |
| Enterprise LTSC2021 /21H2 /19044 | .NET มี21H2(E); Windows ถึง2027-01-12; LCU19044.7807 [KB22] | แยกจาก Home/Pro21H2; IoT ถึง2032 ไม่ครอบคลุม Enterprise |
| Enterprise LTSB2016 /1607 /14393 | .NET matrix วันที่2026-09-28 ยังมี1607(E) แต่ Windows ระบุ End of updates; LCU14393.9612 [KB16] | ตรวจ servicing/ESU/API/DPI เพิ่มก่อนเสนอ |
| Enterprise/Education22H2, IoT, รุ่นอื่น | ตรวจ lifecycle/สิทธิ์ | รอ inventory ไม่เหมารวมกับ LTSC |

[.NET install] จำกัด Win10 LTSC/Enterprise และผูก lifecycle; matrix ที่ยังมี1607 ไม่ยืนยัน support หลัง Windows สิ้นสุด

[WebView2 policy] ให้22H2 updates ถึงอย่างน้อย October2028 ไม่ต้อง ESU; ไม่ต่อ Windows/.NET support

### Patch prerequisites

- 22H2 commercial/education ESU: KB5066791 หรือใหม่กว่า แล้ว KB5072653 ตาม [ESU organization]; ตรวจสิทธิ์/servicing channel กับ IT
- [ESU consumer]: สิ้นสุด2027-10-12, latest updates และ KB5126256; ห้ามใช้ใน commercial scenarios โรงเรียนต้องตรวจสิทธิ์
- [KB22]: image เก่ากว่า KB5028244 ต้อง SSU KB5031539 สำหรับ offline servicing; WSUS/Catalog ที่ยังไม่มี KB5003173 ต้อง KB5005260; ตรวจ latest SSU ตามวิธีติดตั้ง
- [KB19]: ต้อง SSU KB5005112 ก่อน LCU; [KB16] แนะนำ SSU KB5126649 ก่อน LCU
- IT ยืนยัน edition/license/UBR/ESU ก่อนสร้าง image; LTSB/LTSC ไม่ใช้22H2 ESU เหมารวม

## ทางเลือก

เสนอ test baseline Home/Pro22H2 + Enterprise LTSC2019/2021 พร้อม patch ข้างต้น; Win11 ทดสอบ regression

1. ทดสอบแพ็กเกจเดิม: งานน้อยสุด แต่ QA ผ่านไม่ปิด .NET support gap ต้องเสนอข้อยกเว้นให้คนตัดสินก่อน release
2. คง Home/Pro ประเมิน setup ที่ไม่พึ่ง .NET10: เพิ่มงาน runtime/installer/maintenance ต้องคง UX, MSI transaction/cancel/repair, signing/updater ยังไม่เลือกเทคโนโลยี
3. ใช้ LTSC ที่มีสิทธิ์: ลด .NET gap แต่กระทบ Home/Pro/ค่า license/image ต้องให้คนยืนยันก่อนจำกัด edition

ปัดตก Win11-only เพราะขัดมติ; downgrade .NET โดยเดา support และตัด setup UX เพราะไม่มีหลักฐาน/เปลี่ยนสัญญา

## Matrix ทดสอบ

Home22H2, Pro22H2, LTSC2019/2021 × setup EXE/direct MSI ทุกแถว; เพิ่ม Win11 regression; LTSB2016 เมื่อเลือกเพิ่ม ทุกช่องยังไม่ทดสอบ

| มิติทุก OS/entrypoint | หลักฐานต้องเก็บ |
|---|---|
| Clean install | มี/ไม่มี WebView2, online/blocked network, standard user/admin, cancel/rollback/reboot-required; hash/log/exit code/signature |
| Desktop | Block/Arm/Code; ไม่มี License ห้ามเข้า, Guest/Local และ Login/Cloud, activate online/สิทธิ์ offline3วัน/หมดสิทธิ์ ตาม REQ-009; local save/load และ cloud/error recovery |
| Native | เครื่องจริง+หุ่น tuple ที่ยืนยัน HID/Serial/driver, calibration/stop/disconnect; Sample ห้ามส่งอุปกรณ์; รออนุญาตทดสอบ |
| Maintenance | repair engine, upgrade, reject downgrade, uninstall เก็บ Projects/Device ID/WebView2; app-in-use/cancel และ update trust ตาม DES-007/AC-031-01–04 |
| Runtime/UI | PE imports/GOAMD64, Wails/WebView2 version, DPIหลายจอ/fullscreen/drag/drop/GPU; CPU/RAM/driver/failures |

## ข้อจำกัดและส่งต่อ

planning/host-inventory-001.md:9–13 (memory) คือเครื่องปัจจุบัน Win11 Home Single Language10.0.26300 ไม่ใช่ Win10/โรงเรียน ไม่มี compatibility proof; ไม่ build/tests/install/device/rebuild

Task BA-004/SA-003 / Reference decisions-017, REQ-009/031, OQ-011/G-DELIVERY / Reason: รอทางจัดการ Home/Pro gap/inventory; BA/PM รับข้อเสนอ, engineering ตรวจ imports/installer, QA รับ matrix; ผู้ใช้ตรวจขั้นต่ำ/ผลจริง ไม่ปิด gate

## URLs

[Go floor]: https://go.dev/wiki/MinimumRequirements
[API]: https://learn.microsoft.com/en-us/windows/win32/api/winuser/nf-winuser-getdpiforwindow
[.NET matrix]: https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md
[.NET install]: https://learn.microsoft.com/en-us/dotnet/core/install/windows
[Windows builds]: https://learn.microsoft.com/en-us/windows/release-health/release-information
[WebView2 policy]: https://learn.microsoft.com/en-us/deployedge/microsoft-edge-supported-operating-systems
[ESU organization]: https://learn.microsoft.com/en-us/windows/whats-new/enable-extended-security-updates
[ESU consumer]: https://www.microsoft.com/en-us/windows/extended-security-updates
[KB22]: https://support.microsoft.com/help/5126657
[KB19]: https://support.microsoft.com/help/5126651
[KB16]: https://support.microsoft.com/help/5126868

## Change Log

- 2026-10-21 — Rev1: ทบทวน Win10 ตาม decisions-017; แยก runtime/vendor/business ไม่รับรองขั้นต่ำ
