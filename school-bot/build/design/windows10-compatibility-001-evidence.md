# Windows 10 x64 — หลักฐานและข้อเสนอขั้นต่ำ — หลักฐาน source และข้อจำกัดเดิม

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Windows 10 x64 — หลักฐานและข้อเสนอขั้นต่ำ](windows10-compatibility-001.md) อธิบายหลักฐาน source และข้อจำกัดเดิม.

## เอกสารอ้างอิง

[DES-007 (Release และ trusted update)](des-007.md)

## หลักฐาน

เอกสารนี้เรียบเรียงหลักฐานที่บันทึกไว้เดิม ไม่ได้ตรวจ source/runtime ซ้ำ.

| ชั้น | หลักฐานและข้อจำกัด |
|---|---|
| Setup EXE | app/installer/SchoolBot.Installer.csproj:4–24 WPF net10.0-windows/10.0.13/self-contained win-x64; ยังพึ่ง runtime ที่ฝัง; app.manifest:5–13 asInvoker/GUID/DPI ไม่ยืนยัน floor |
| Direct MSI | app/build/windows/Package.wxs:2–5,24–70,92–109 per-user/InstallerVersion500/main/demo/zide/WebView2; รวม InstallerUI.wxs/InstallerDialogs.wxs ไม่พบ OS launch condition หรือ .NET custom action |
| Go desktop | app/go.mod:3–7, go.sum:25–30 Go1.25/Wails beta.30/x/sys0.46; scripts/build-desktop.ps1:22–52 ไม่ force GOARCH/GOAMD64; [Go floor] Win10+; PE/CPU ยังไม่ตรวจ |
| Wails | W/pkg/application/application_windows.go:381–412 ตรวจ DPI API แล้ว fallback; W/pkg/w32/theme.go:181–200 กั้น themes ที่ 17763/backdrop22621 ไม่ใช่ global OS floor; W/pkg/application/webview_window_windows.go:1557 มี theme guard |
| API audit | W/pkg/application/webview_window_windows.go:795 เรียก GetDpiForWindow ตรงใน helper ยังไม่ยืนยัน caller; :2275 มี guard; [API] เริ่ม 1607 ไม่ใช่ global minimum |
| x/sys | X/windows/dll_windows.go:266–316 Find คืน error/Call panic หาก API หาย ต้องตรวจ caller/imports ไม่ใช้ declarations ตัดสิน floor |
| Engine | engines/zide/scripts/build.ps1:23–39,72 ใช้ Zig0.15.2 x86_64-windows-gnu baseline หรือ CMake x64; engines/zide/src/discovery.cpp:49–69 SetupAPI, engines/zide/src/transport_serial.cpp:12–38 CreateFile/DCB; driver/imports ยังไม่ตรวจ |
| WebView2 | app/runtime_windows.go:19–34,50–75 เช็ก registry pv ไม่ว่าง ไม่ตรวจ minimum version; ขาดแล้วขอติดตั้งผ่านเน็ต ตรวจ evergreen จริง |

Direct MSI ไม่เรียก WPF shell แต่พึ่ง desktop/engine/WebView2/driver เดิม; docs/INSTALLERS.md:30–31,93 ให้ IT ใช้ ไม่ใช่แทน setup UX; :178–179 ยัง unsigned ต้อง signing/updater trust ตาม DES-007; API deploy แยก (:11–12)

planning/host-inventory-001.md:9–13 (memory) คือเครื่องปัจจุบัน Win11 Home Single Language10.0.26300 ไม่ใช่ Win10/โรงเรียน ไม่มี compatibility proof; ไม่ build/tests/install/device/rebuild
