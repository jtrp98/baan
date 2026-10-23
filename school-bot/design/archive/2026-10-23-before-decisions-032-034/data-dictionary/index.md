# ตาราง SchoolBot ทั้ง 32 ตาราง

[กลับคู่มือภาพรวม](../data-model.md) · [ตารางเดิมของ SchoolBright](../data-legacy-001.md)

กดชื่อตารางเพื่อดูว่า 1 แถวหมายถึงอะไร ตัวอย่าง ผู้ใช้ข้อมูล ฟิลด์ครบทุกตัว และการเชื่อมตาราง ชนิด/NULL/ค่าเริ่มต้นอ้างจาก SQL ไม่ใช่การคาดเดา

## สิทธิ์ใช้แอปและผู้ใช้

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotLicense](table-001.md) | สิทธิ์ใช้แอปของโรงเรียน |
| [SchoolBotLicenseBinding](table-002.md) | ประวัติผูก License กับเครื่อง |
| [SchoolBotSession](table-006.md) | การเข้าใช้ แยกช่องทางและ profile |
| [SchoolBotStaffRole](table-007.md) | บทบาทพนักงานส่วนกลาง |

## โครงงาน

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotProject](table-008.md) | แฟ้มโครงงานและเจ้าของ |
| [SchoolBotProjectRevision](table-009.md) | เนื้อหางานแต่ละฉบับที่บันทึก |

## เนื้อหากลาง

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotLevel](table-010.md) | ระดับหลักสูตรกลาง |
| [SchoolBotLevelPromotionPolicy](table-011.md) | เกณฑ์เลื่อน Level แต่ละฉบับ |
| [SchoolBotCurriculum](table-012.md) | หลักสูตรของ Level หนึ่งฉบับ |
| [SchoolBotLesson](table-013.md) | หน่วยบทเรียนในหลักสูตร |
| [SchoolBotMission](table-014.md) | โจทย์โครงงานที่ต้องส่ง |
| [SchoolBotCriteria](table-015.md) | เกณฑ์ตรวจโจทย์แต่ละฉบับ |
| [SchoolBotActivity](table-016.md) | กิจกรรม: อ่าน/โครงงาน/Quiz/Test |
| [SchoolBotQuestionBank](table-017.md) | คลังคำถามและเฉลยแต่ละฉบับ |

## เปิดสอนจริง

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotCourseRun](table-018.md) | เปิดหลักสูตรให้ห้องในปี/เทอม |
| [SchoolBotScoringPolicy](table-019.md) | นโยบายคะแนนของ CourseRun |
| [SchoolBotCourseRunActivity](table-020.md) | เวลาและ policy กิจกรรมรายห้อง |

## ส่งงาน ตรวจงาน และข้อสอบ

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotSubmission](table-021.md) | งานโครงงานที่นักเรียนส่งตรวจ |
| [SchoolBotGradingJob](table-022.md) | คิวงานตรวจอัตโนมัติ |
| [SchoolBotAssessment](table-023.md) | ผลตรวจภารกิจแต่ละครั้ง |
| [SchoolBotAttempt](table-024.md) | การทำ Quiz/Test แต่ละครั้ง |
| [SchoolBotRetakeGrant](table-025.md) | สิทธิ์สอบซ่อมเพิ่มรายคน |

## ส่งคะแนนและเลื่อน Level

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotGradeSlot](table-026.md) | ช่องคะแนนเดิมที่ SchoolBot ดูแล |
| [SchoolBotScoreMapping](table-027.md) | ผลกิจกรรมที่จะลงช่องคะแนน |
| [SchoolBotScorePreview](table-028.md) | ชุดคะแนนก่อนยืนยันส่ง |
| [SchoolBotScorePreviewItem](table-029.md) | รายละเอียด preview รายคน |
| [SchoolBotScoreExport](table-030.md) | คำยืนยันส่งคะแนนทั้งชุด |
| [SchoolBotScoreOutbox](table-031.md) | คิวส่งและผลการส่งรายรายการ |
| [SchoolBotLevelProposal](table-032.md) | ข้อเสนอ/ผลเลื่อน Level ทั้งห้อง |

## งานระบบ

| ตาราง | เก็บอะไร |
|---|---|
| [SchoolBotRelease](table-003.md) | รุ่นแอปและข้อมูลเผยแพร่ |
| [SchoolBotIdempotency](table-004.md) | กันคำขอซ้ำสร้างผลซ้ำ |
| [SchoolBotAuditEvent](table-005.md) | ประวัติว่าใครทำอะไรกับข้อมูล |


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
