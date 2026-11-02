# Windows 10 x64 — หลักฐานและข้อเสนอขั้นต่ำ — ขอบเขตข้อสรุป

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Windows 10 x64 — หลักฐานและข้อเสนอขั้นต่ำ](windows10-compatibility-001.md) ส่วนนี้อธิบายขอบเขตข้อสรุป อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

เอกสารนี้เก็บผลสำรวจและข้อเสนอ OS ณ วันที่ตรวจเดิม Windows 10 เป็นเป้าหมายในช่วงที่สำรวจ ตามมติ 017 ซึ่งถูกแทนด้วย [มติ 019 (เปลี่ยนเป้าหมายเป็น Windows 11)](../requirement/decisions-019.md) แล้ว ตาราง Windows 10 ด้านล่างเป็นบริบทเดิม ไม่ใช่การเพิ่มเป้าหมาย release ปัจจุบัน.

ตรวจ 2026-10-21 ตาม [decisions-017](../requirement/decisions-017.md); ไม่อนุมัติขั้นต่ำ/risk สถานะดู [index](index.md)

## ขอบเขตข้อสรุป

Win10 เป็น business target; Win11/macOS/หุ่นจริงคงเดิม ไม่พบ Windows11-only gate แต่ยังไม่พิสูจน์ runtime floor ทั้งแพ็กเกจ Vendor support แยก Windows/.NET/WebView2/driver; นอก matrix ไม่เท่ากับรันไม่ได้ และ ESU ไม่ต่อ .NET support เอง

## As-built

พาธจาก source root; W=.tools/gopath/pkg/mod/github.com/wailsapp/wails/v3@v3.0.0-beta.30; X=.tools/gopath/pkg/mod/golang.org/x/sys@v0.46.0 cache เดิม

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
