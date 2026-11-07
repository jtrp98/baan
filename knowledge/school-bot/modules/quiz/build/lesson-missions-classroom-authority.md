# Lesson Missions · สิทธิ์ครูรายห้อง

Rev 1 · 2026-11-06 · บันทึกโดย นายช่าง · ที่มา: ผู้ใช้ตอบในแชตว่า «ทั้งครูประจำชั้น ครูผู้ช่วย และครูผู้สอนของห้องนั้น»

`GetClassroom` และ `SetClassroomAccess` ให้สิทธิ์กับครูประจำชั้นหลัก ครูผู้ช่วยประจำชั้น และครูผู้สอนที่ได้รับมอบหมายอย่างน้อยหนึ่งวิชาในห้องนั้น ใช้กติกาเดียวกันสำหรับดูผลและเปิด–ปิด ครูต้องเป็น employee ที่ยืนยันตัวตนผ่าน `school_web` ในโรงเรียนเดียวกับห้อง

## การอ้างข้อมูลเดิม

- ตรวจห้องด้วย `SchoolId` จาก session และ `ClassroomId` ซึ่งอ้างถึง `nTermSubLevel2` ตรวจห้องที่ยังใช้งานและเทอมจริงของห้องจาก `NTerm` / `NYear` ของโรงเรียน โดยอิงช่วงวันที่เทอมและเวลาโรงเรียนที่กำหนดไว้ ผลที่ระบุเทอมไม่ได้หรือกำกวมให้ปฏิเสธสิทธิ์และคืนข้อผิดพลาดที่ตรวจสอบได้
- สายครูประจำชั้นใช้แถว `TClassMember` ที่ยังใช้งานและตรงโรงเรียน ห้อง และ `NTerm` เทียบ `EmployeeId` กับ `NTeacherHeadid`, `NTeacherAssistOne` หรือ `NTeacherAssistTwo`
- สายครูผู้สอนใช้ความสัมพันธ์ครู → `TPlanCourseTeacher` → `TPlanCourse` → เทอมและห้องของแผน ตามเงื่อนไข active/deleted ที่ใช้ใน authority เดิม ยืนยันว่ามีอย่างน้อยหนึ่งวิชาที่มอบหมายในขอบเขตห้องและเทอมจริง ตรวจสถานะพนักงานก่อนอนุญาตทั้งสองสาย
- ทำผ่าน adapter สิทธิ์รายห้องของภารกิจกลาง การอ่านรายชื่อนักเรียนใช้ roster จริงของโรงเรียน/ห้อง/เทอม โดยตรวจข้อมูลสมาชิกที่ใช้งานอยู่ ส่วน `level_no` และ `term_no` กรองแผนที่และผลภารกิจหลังผ่านสิทธิ์ การตรวจครูรายวิชาแบบ `CourseRun` เดิมยังใช้กับงานสอบและการส่งคะแนนของรอบเรียน
- ตรวจสิทธิ์ทั้งตอนอ่านและก่อนเขียน ถ้าห้องมีศูนย์ หนึ่ง หรือหลาย `CourseRun` การอนุญาตภารกิจกลางขึ้นกับการมอบหมายรายห้องและเทอมจริงตามข้างต้น สอง RPC ใช้รูปแบบ payload เดิมที่ยืนยันแล้ว

[TClassMember mapping](../../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Entities/JabjaiSchoolSingleDB/TclassMember.cs) · [Authority รายวิชาเดิม](../../../../../target/sb-web-school-robot/backend/src/ServiceSchoolBot.Infrastructure/Repositories/Databases/SchoolAssessmentAuthority.cs) · [สัญญา payload Rev 1](lesson-missions-payload-v1.md)
