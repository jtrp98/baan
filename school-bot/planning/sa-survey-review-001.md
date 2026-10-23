# SchoolBot — ตรวจผล SA survey

## ผลส่งมอบ

SA ส่ง DONE/exit 0 ใน 626.4s ผ่าน mycelium-role sa/t1, gpt-6-astra/high, read-only, timeout 1800s

ตรวจหลังบันทึก: 16 Markdown / 96 local links ผ่าน ข้อความสองไฟล์ SA ตรงต้นฉบับ ทุกไฟล์อยู่ในงบขนาดที่เกี่ยวข้อง OQ index มี 4 PARTIAL / 2 CLOSED เป็น static document checks ไม่ใช่ SchoolBot QA PASS

- [Hardware survey](../design/hardware-survey-001.md): protocol/device filter/ข้อจำกัดและ matrix สำรวจจริง
- [OS compatibility](../design/os-compatibility-001.md): source/installer/pinned dependencies, official evidence และ candidate แบบมีเงื่อนไข
- นายช่าง บันทึกสองไฟล์จาก [SA response](sa-survey-response-001.json) ตรงข้อความต้นฉบับ และ apply เฉพาะ index patch ของ SA ไม่แก้ plan หรืออ้าง QA verdict
- Report: C:/src/AICode/baan/baan/reports/2026-10-21-13-34-47-sa-tier-t1-1agents-HjWmXL

## การตรวจเพิ่มเติมของผู้คุม

อ่าน source ต่อจากขอบเขตของ SA เพื่อประกอบ review ไม่แก้ข้อเสนอของ SA:

- app/build/macos/Info.plist ระบุ LSMinimumSystemVersion=15.0; installer-requirements.plist ระบุ os=15.0 และ x86_64/arm64 ตรง build target ที่ SA พบ ทั้งหมดเป็น configuration ไม่ใช่ runtime proof
- app/installer/app.manifest ระบุ supportedOS GUID และ asInvoker ไม่ใช้ manifest เพียงอย่างเดียวยืนยันว่าแพ็กเกจทำงานกับ Windows ทุก build
- app/build/windows/Package.wxs ไม่พบ explicit VersionNT/Launch OS condition จากการค้นในไฟล์นี้ ไม่ใช้ผลดังกล่าวแทนข้อจำกัด .NET/Wails/WebView2/driver
- ตรวจ [Go 1.25 release notes](https://go.dev/doc/go1.25#darwin) และ [.NET 10 OS matrix](https://github.com/dotnet/core/blob/main/release-notes/10.0/supported-os.md) วันที่ 2026-10-21: framework floor/support matrix ไม่ใช่ SchoolBot compatibility proof ตาราง .NET ยังระบุ Windows รุ่นอื่นนอกจาก 11 25H2 ดังนั้น candidate ของ SA ไม่ใช่ minimum ทางเทคนิคที่พิสูจน์ว่าต่ำกว่านั้นทำไม่ได้
- [ข้อมูลเครื่องปัจจุบัน](host-inventory-001.md) เป็น WMI inventory แยกจาก source survey ไม่ได้พิสูจน์รุ่นหุ่นหรือ inventory เครื่องโรงเรียน

## ส่งตรวจมนุษย์

ผู้ใช้เป็นผู้อนุมัติภาพรวมตาม decisions-016 ร่างเสนอ candidate Windows 11 25H2 x64 / macOS 15+ Intel+Apple Silicon เพื่อเลือกเป้าหมายพัฒนาและทดสอบ พร้อมทางเลือกให้รวม Windows 10 edition/build จริงก่อนสรุป floor ไม่มีการตัด Windows 10 หรืออนุมัติเลขรุ่นแทนผู้ใช้

ยังไม่มี physical model/firmware/calibration/stop evidence และ Darwin native backend ยังขาด ให้ BA-003/004/SA-003 ใช้เอกสารเตรียมงานต่อ source survey เสร็จ ไม่ใช่การสำรวจหุ่นจริงหรือปิด G-HW/G-DELIVERY

## Change Log

- 2026-10-21 — MYCELIUM บันทึกผล role และตรวจ references/config เพิ่มก่อนเสนอ candidate ให้ผู้ใช้ตรวจ

- 2026-10-23 — นายช่าง (BAAN) ปรับชื่อผู้คุมจาก MYCELIUM เป็นนายช่าง ในข้อความส่งต่อ ตามการเปลี่ยนชื่อระบบเป็น BAAN (release 0.12.0) — รายการลงวันที่เดิมที่อ้าง MYCELIUM คงไว้ตามประวัติ
