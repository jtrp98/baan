# อ่านภาพ DBML ของ SchoolBot

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

เริ่มจาก **ภาพเชื่อมระบบเดิม** เพื่อเห็นว่า SchoolBot ใช้ข้อมูลไหน แล้วค่อยเปิดแบบเต็มเมื่อจะดูทุกฟิลด์

| ไฟล์ | ดูอะไร |
|---|---|
| [schoolbot-integration.dbml](schoolbot-integration.dbml) | ภาพย่อ **24 ตาราง / 112 ฟิลด์**: SchoolBot 10 ตาราง + ตารางเดิม 14 ตาราง; ไม่มี physical FK; logical mapping 16 เส้น |
| [schoolbot.dbml](schoolbot.dbml) | แบบเต็ม **32 ตาราง / 450 ฟิลด์ / PRIMARY KEY 32 รายการ; FK 0** ของ SchoolBot ใหม่ แบ่งสี 10 กลุ่ม ทุกตารางและฟิลด์มีคำอธิบายไทย |

แต่ละไฟล์นำเข้าแยกได้ ไม่ต้องรวมไฟล์ คัดลอกทั้งไฟล์ไปวางใน editor ของ [dbdiagram.io](https://dbdiagram.io) แล้วเปิด Note ของตาราง/ฟิลด์ที่ต้องการอ่าน ชื่อตาราง/คอลัมน์คงชื่อจริงเพื่อใช้เทียบ SQL ได้

## ภาพเต็ม: สีแบ่งงาน

| กลุ่ม | ความหมาย |
|---|---|
| 01 License | สิทธิ์ใช้แอปและผูกเครื่อง |
| 02 Identity | Session และสิทธิ์พนักงานส่วนกลาง |
| 03 Projects | แฟ้มงานและเนื้อหาแต่ละฉบับ |
| 04 Content | Level หลักสูตร บทเรียน กิจกรรม โจทย์ เกณฑ์ตรวจ และข้อสอบกลาง |
| 05 Teaching | เปิดหลักสูตรให้ห้อง/ปี/เทอมและตั้ง policy |
| 06 Results | ส่งโครงงาน ตรวจงาน ทำ Quiz/Test และสอบซ่อม |
| 07 Grades | จองช่องคะแนน แมพผล ตรวจ preview ยืนยัน และติดตามส่ง |
| 08 Promotion | เสนอเลื่อน Level ของห้อง |
| 09 Release | รุ่นแอป |
| 10 System | กันคำขอซ้ำและประวัติการทำรายการ |

Note ของตารางมีหน้าที่ “หนึ่งแถวหมายถึงอะไร” ขั้นตอนที่ใช้ ตัวอย่างสมมติ และขอบเขตโรงเรียน ส่วน Note ของฟิลด์อธิบายความหมาย NULL/หน่วย/รหัสอ้างอิง/สถานะ พร้อมคงหมายเหตุ constraint เดิมไว้

## ภาพเชื่อมระบบเดิม: สีแบ่งฐานข้อมูล

| สี | ตาราง |
|---|---|
| น้ำเงิน | ตารางใหม่ SchoolBot ที่เลือกมาเฉพาะจุดเชื่อม |
| ม่วง | บัญชี Master เดิม: TMasterDBUser |
| เขียว | นักเรียน ครู วิชา แผนรายวิชา ห้อง และเทอมเดิม |
| ส้ม | หัวคะแนน ช่องคะแนน ผลรายนักเรียน override การตั้งค่า และ audit เดิม |

- **ทุกเส้นในภาพ integration เป็น LOGICAL_* เส้นประ** สำหรับอธิบายรหัสอ้างอิง ไม่มี SQL FOREIGN KEY
- **เส้นประสีส้มชื่อ `LOGICAL_*`** เป็นการเทียบรหัส/ตรวจเงื่อนไขโดย application ข้ามฐาน ไม่ใช่ FK ที่ต้องสร้าง อ่านเงื่อนไขของแต่ละหมายเลขใน Note `LogicalLegend`
- `LegacyMaster`, `LegacySchool`, `LegacyGrade` เป็น namespace สำหรับแบ่งฐานในภาพ ไม่ใช่ชื่อ schema สำหรับ deploy
- ตารางเดิมแสดงเฉพาะคอลัมน์ที่เกี่ยวข้อง ไม่ใช่ schema ทั้งตาราง ชนิด `string` บางช่องเป็นชนิดเชิงตรรกะจาก C# ซึ่งยังไม่ยืนยัน physical varchar/ความยาว

เช่น `SchoolBotSession.AccountId → TMasterDBUser.sID` คืออ้างบัญชี ส่วน `ProfileId → TUser.sID` ใช้เฉพาะ `ProfileKind=student` และต้องตรงโรงเรียน ถ้าเป็น `employee` ให้ใช้ TEmployees ตาม Note ไม่ได้แปลว่า AccountId เท่ากับรหัสนักเรียน/ครู

## จุดที่ตั้งใจไม่ลากเส้นผิดประเภท

`CourseRun.PlanCourseIds` เป็นรายการหลายรหัส ไม่ลากเส้น array ไปยัง integer; ตรวจวิชา/เทอม/ห้องผ่านข้อมูลแผนเดิม รายละเอียดแหล่ง roster ยังต้องยืนยัน

`ScorePreviewItem.Snapshot.cells[].grade_detail_id` อยู่ภายใน JSON จึงอธิบายเส้นทางไป `PGTGradeDetail.nGradeDetailId` ใน Note แทนการวาดว่า JSON ทั้งก้อนเป็น FK ไปหาเลขแถวเดียว ใช้ SchoolID/sID/nGradeId และช่องใน ScoreData ประกอบ

ไม่วาด AccountId = profile ID ที่ยังไม่พิสูจน์ ไม่เพิ่ม CourseRunId ใน Submission และไม่แปลงการตรวจปี/ระดับชั้นของ PGTGradeSetting เป็น FK บนปีอย่างเดียว ตารางบางตัวจึงเชื่อมผ่าน Note/บริบทแทนเส้น

## ขอบเขต

แบบเต็มตรง SQL ที่คงเฉพาะ PRIMARY KEY; UNIQUE/FK/CHECK เป็น 0. ความสัมพันธ์เดิมดู dictionary; integration ใช้อธิบายเท่านั้น **ห้ามนำภาพ integration ไปสร้าง SQL/migration** ไม่เพิ่มตารางในฐานเดิมหรือสร้าง FK ข้าม DB การเขียนคะแนนจริงยังขึ้นกับสัญญาและหลักฐานใน DES-009

ตรวจด้วย `@dbml/core 10.3.1` โหมด `dbmlv2` ซึ่งรองรับ [กลุ่มสี Note และ inactive ref](https://dbml.dbdiagram.io/syntax/enrichment-visualization/) ตัว parser แบบ legacy บางตัวไม่รองรับ syntax visualization ใหม่

อ่านเพิ่มเติม: [คู่มือข้อมูล](data-model.md) · [ตารางเดิมและฟิลด์เชื่อม](data-legacy-001.md)

## หลักฐาน

- ผลตรวจเดิม: design/dbml-review-001.md (memory)
- แบบเต็ม Rev5 และ integration Rev2 เคยแก้เฉพาะ Notes ตามกฎ [ผลเรียน](learning-rules-032-034.md) และ [คะแนน](grade-rules-032-034.md) โดยไม่เปลี่ยน type/NULL/default/PK/index/enum/FK/actions ผู้คุมตรวจหลังบันทึกด้วย `@dbml/core 10.3.1` โหมด `dbmlv2` ตาม design/dbml-review-002.md (memory) จำนวนของฉบับที่ตรวจครั้งนั้นคือ 32 ตาราง/450 ฟิลด์/40 physical FK และ 24 ตาราง/112 ฟิลด์/4 physical FK + 12 logical mapping ตัวเลขนี้เป็นหลักฐานฉบับเก่า ไม่ใช่จำนวน FK ของแบบปัจจุบัน arch ไม่ได้รัน parser ใน session ของการแก้ Notes ครั้งนั้น
