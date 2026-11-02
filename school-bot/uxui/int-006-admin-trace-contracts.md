# T2. ส่วนที่เชื่อมกับงานเซ็นแล้ว

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](int-006-admin-trace.md)


- Desktop: [int-004-learning.md](../uxui/int-004-learning.md) คงผู้เรียนบน revision เดิม ไม่มีปุ่มจัดลำดับของนักเรียน; Q22 (บทเรียนและตัวกรองโหมด)–Q29 (accessibility ของการเรียน) เซ็นแล้วตาม [decisions-040.md (sign-off UX-004 ครบ (Q26–Q29))](../requirement/decisions-040.md)
- เว็บโรงเรียน: [int-005-mapping.md](../uxui/int-005-mapping.md) แยก admin mapping กับครูส่งคะแนน ไม่เพิ่มปุ่มส่งคะแนนใน admin ส่วนกลาง; Q30 (หน้า mapping รายช่องคะแนน)–Q38 (ขอบเขตประวัติครูและ admin) เซ็นแล้วตาม [decisions-041.md (sign-off UX-006 ครบ (Q30–Q38))](../requirement/decisions-041.md)
- การเซ็น Entry/Labs/โครงงาน/การเรียน/mapping ครอบเฉพาะขอบเขตเดิม ส่วน admin ใช้ตารางอนุมัติของชุดนี้

## T3. ช่องว่างส่ง arch ก่อนเชื่อมระบบ

ทุกข้อเป็น Task UX-005 ไม่ใช่คำถามเทคนิคให้ผู้ใช้ตัดสิน:

1. Reference [des-005.md](../design/des-005.md), [source-review-003.md](../design/source-review-003.md): ตาราง API ที่อ่านไม่มีสัญญา Sheet preview/validate/import; ยังขาดการผูกแถวกับ stable key การเก็บความหมาย D/ที่มา หน่วย atomic ผล validation/ผลสำเร็จ และการกันนำเข้าต้นทางเดิมด้วยคำขอใหม่ จึงยังยืนยัน atomic failure/duplicate outcome ไม่ได้ ห้าม front ประกอบหลายคำขอแล้วอ้าง atomic ทั้งชุด
2. Reference [des-005.md](../design/des-005.md): GET curricula ระบุ published summaries; ยังไม่ระบุการอ่านรายการ/รายละเอียด draft และหลักฐานผู้อนุมัติ/วันเวลา API แก้ content รับ lessons ไม่ครอบ metadata หลังสร้าง ต้องให้ arch เติม/ชี้สัญญาที่ใช้จริง ไม่เสนอ GET draft, metadata PUT หรือ audit endpoint ใหม่ใน UX
3. Reference [des-010.md](../design/des-010.md): มีสร้าง bank revision และ publish แต่ยังไม่ระบุอ่าน/แก้ draft ที่บันทึกแล้ว; ตัวแก้ก่อนสร้างและการสร้าง revision ใหม่ร่างได้ แต่ flow เปิดกลับมาแก้ต้องรอสัญญา ไม่สมมติ PUT bank
4. Reference [gateway-grpc-contract-001.md](../design/gateway-grpc-contract-001.md): manifest ปัจจุบันยังไม่เปิด learning/admin-content RPC โดยปริยาย ต้องมี Data Transfer Object (DTO — รูปแบบข้อมูลรับส่ง)/route/error/replay/read-back mapping ตามเจ้าของก่อนเชื่อม ไม่มี การเรียก SchoolBot gRPC service แบบ public โดยตรงเมื่อเส้นทางหลักใช้ไม่ได้ ([gateway-integration-001.md](../design/gateway-integration-001.md))

ร่างเสนอหน้าตาและทางออกของ state ที่ยังขาดได้ แต่ปุ่มที่พึ่งสัญญาเหล่านี้ยังไม่มีหลักฐานพร้อม implement แม้ภายหลังมนุษย์เซ็น UX แล้ว

## T4. Source และข้อจำกัดหลักฐาน

[รายละเอียดของส่วนนี้ย้ายไปไฟล์ประกอบ](int-006-admin-review-signoff.md) โดยคงเนื้อหาเดิม

## T5. Sign-off table

[รายละเอียดของส่วนนี้ย้ายไปไฟล์ประกอบ](int-006-admin-review-signoff.md) โดยคงเนื้อหาเดิม

## T6. ส่งต่อ

[รายละเอียดของส่วนนี้ย้ายไปไฟล์ประกอบ](int-006-admin-review-signoff.md) โดยคงเนื้อหาเดิม

## หลักฐาน

- รายการต่อไปนี้ตรง `plan/tasks-001.json:3772–3812` (memory) ทั้ง 12 AC ไม่ขยายเป็นทุก AC ของ [REQ-043 (หลักสูตรกลางแบบ Level และ Activity)](../requirement/req-043.md)–046; dependencies BA-002/SA-002 ไม่ถูกเปลี่ยน `plan/UX-005.md:7–15` (memory) กำหนดใช้ JSON
- `requirement/req-044.md:21–25`
- `requirement/req-045.md:21–24`
- `requirement/req-043.md:21`
- `requirement/req-046.md:22,25`
- `uxui/int-004-learning.md:6,13–14,32–34`
- `requirement/decisions-040.md:7–12`
- `uxui/int-005-mapping.md:6,15–21`
- `requirement/decisions-041.md:5–9`
- `design/des-005.md:73–85`
- `design/source-review-003.md:24–29`
- `design/des-005.md:73–77`
- `design/des-010.md:60–73`
- `design/gateway-grpc-contract-001.md:26–38,54–60`
- `design/gateway-integration-001.md:5–17`
