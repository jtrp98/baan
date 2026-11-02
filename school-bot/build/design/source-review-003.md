# Source review 003 — Course Plan (Google Sheet)

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายงานนี้อ่าน Google Sheet “Course Plan” พบว่าลำดับหน่วยไม่ใช่ identity ถาวร เนื้อหาผสมหลายโหมดในชั้นเดียว และ Exercises เป็นเอกสารแบบฝึกหัด ไม่ใช่ข้อสอบ ผลนี้มีผลต่อการแยก Lesson/Activity และการนำเข้าเป็น draft

ตรวจ 2026-10-22 ตามที่ผู้ใช้ส่งลิงก์ในแชต อ่านผ่าน browser หลังผู้ใช้ login เอง ไม่แก้ไฟล์ต้นทาง หลักฐานเป็นสถานะ Sheet ณ วันที่ตรวจ ไม่ใช่เนื้อหาที่อนุมัติแล้ว

ต้นทางชื่อ "Course Plan" มีแท็บเดียว `Sheet1` (gid=0) 107 แถว × 35 คอลัมน์ (export CSV ไม่มี hyperlink ที่ฝังในเซลล์)

## ข้อเท็จจริงจาก Sheet

- ขอบเขต: ประถมเท่านั้น ป.1–ป.6; ยังไม่มีมัธยม
- แถว 1–2 เป็นหัวตารางสองชั้น แถว 3–107 เป็นข้อมูล 105 แถว ระดับชั้น (A) และคอนเซปการเรียนรู้ (B) ใส่เฉพาะแถวแรกของแต่ละชั้น (ลักษณะ merged cell)
- คอลัมน์ที่มีข้อมูล: A ระดับชั้น · B คอนเซปการเรียนรู้ของชั้น · C ลำดับหน่วย · D TRUE/FALSE (ไม่มีหัวคอลัมน์) · E เรื่อง · F จำนวนคาบ 1–3 · G รายละเอียด (bullet + กิจกรรม) · J Lesson Plan (35 แถว) · K Comment รีวิวแผน (36 แถว) · L Slide (1 แถว) · M/N Exercises 1 รายละเอียด/Link (8/10 แถว) · O ลำดับไม่มีหัวคอลัมน์ (103 แถว) · W/X Exercises 2 (5 แถว)
- คอลัมน์ H/I (Interdisciplinary) และชุดขวา P–T (เรื่อง, รายละเอียด, Interdisciplinary, Slide) มีหัวแต่ไม่มีข้อมูล
- จำนวนต่อชั้น: ป.1 20 หน่วย/40 คาบ, ป.2 20/40, ป.3 21/41, ป.4 20/40, ป.5 20/40, ป.6 4/6 (ยังร่างไม่ครบ) · D=TRUE 21 แถว ตรงกับแถวที่มี Lesson Plan เป็นส่วนใหญ่
- ลิงก์ Slide/Exercises เป็น `canva.link` และบางเซลล์เป็นข้อความ "Teachable Machine" แทน URL
- เครื่องมือที่หลักสูตรอ้าง: กิจกรรม unplugged/เอกสารแบบฝึกหัด, Teachable Machine (ภายนอก), Joystick, Zide (แขนกล), Mixly (Block), Arduino — หลักสูตรหนึ่งชั้นปนหลายโหมด เช่น ป.1 มี AI + Joystick + Robot Arm; ป.3 Mixly; ป.5 Robot Arm + Mixly/Arduino
- ยังไม่มี quiz/test ใน Sheet; Exercises เป็นเอกสารแบบฝึกหัด Canva

## ปัญหาที่พบใน Sheet (หลักฐานว่าไม่ควร hardcode ลำดับ/เลขหน่วย)

- เลขหน่วยใน C, เลขใน O และเลข Unit ในชื่อ Lesson Plan ไม่ตรงกัน เช่น ป.1 C=6 ใช้ "Unit 7: How AI Learns", C=13 ใช้ "Unit 6"; ป.3 O ข้ามเลขและแถว C=2 ไม่มี O
- Comment ใน K ระบุให้ย้ายลำดับหลายจุด เช่น ย้าย DATA Literacy (ป.1 C=13) มาก่อน How AI Learns, สลับ ป.1 C=14/15 และมีการอ้าง "Unit 11: Robot Commands" ที่ไม่มีใน Sheet
- เนื้อหาซ้อนข้ามชั้นตาม Comment เช่น ป.4 Unit 2 กับ ป.3, ป.6 Unit 3 กับ ป.5

## ยังไม่ยืนยัน

ข้อเสนอโครงข้อมูล รหัสถาวร การแยกแท็บ และการเก็บ asset ข้างต้นยังต้องให้เจ้าของหลักสูตรยืนยัน การนำเข้าไม่ถือว่าเนื้อหาผ่าน [BR-037-03 (เนื้อหาและเกณฑ์ต้องมีที่มาและผู้อนุมัติ)](../../modules/quiz/shared/requirements/req-037.md) แล้ว


- โครงข้อมูล: Course (ต่อชั้น/ภาคเรียน) → Lesson (หนึ่งแถวของ Sheet) → Activity (slide, lesson plan สำหรับครู, เอกสารแบบฝึกหัด, mission block/arm/code, quiz, test) โดย Mode อยู่ที่ Activity ไม่ใช่ Course
- ทุก Lesson มีรหัสถาวร (เช่น `P1-AI-DATA`) แยกจากลำดับ (Ordinal) การสลับลำดับแก้แค่ Ordinal ไม่ทำให้การอ้างอิงหรือคะแนนเดิมเสีย
- ใช้ Sheet เป็นแหล่ง authoring ต่อได้ แต่ต้องเพิ่มคอลัมน์รหัสถาวร ระดับชั้นทุกแถว (เลิก merged cell) และแยกแท็บ Activities/Questions; import เป็น draft → ตรวจ → อนุมัติ → publish revision ตาม [มติ 015 (มติถังขยะ Guest ผู้ร่างหลักสูตร และขอบเขตครู)](../../shared/decisions/decisions-015.md)
- ลิงก์ Canva เป็นสื่อภายนอกที่อาจเปลี่ยนหรือหมดอายุ ควรเก็บเป็น asset หรือ export ไฟล์เมื่อ publish

## ความหมายคอลัมน์และระยะหลักสูตร

D = ตรวจ/อนุมัติแล้ว · O = ไม่ได้ใช้แล้ว · P–X = สื่อชุดที่ 2 ของหน่วยเดิม · หลักสูตรต่อชั้นคือหนึ่งภาคเรียน ~22 สัปดาห์ ดู [มติ 020 (มติหลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../../shared/decisions/decisions-020.md)



## หลักฐาน

ผลอ่าน Google Sheet [Course Plan](https://docs.google.com/spreadsheets/d/172kDibNgBQbzxbIXm6lo2dedcMcTduLtajYqEcSsQLc) แท็บ Sheet1 (gid=0) ณ 2026-10-22 งานนี้ไม่ได้เปิด Sheet ใหม่
