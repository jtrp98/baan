# ตารางเดิม: TMasterDBUser

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** Master DB — JabjaiMasterSingleDB ตามชื่อ context

**หน้าที่เดิม:** บัญชีเดิมที่ใช้เป็นฐานสำหรับ Desktop login; ไม่สร้างบัญชี SchoolBotUser ซ้ำ

**SchoolBot ใช้อย่างไร:** SchoolBotSession.AccountId → TMasterDBUser.sID; ตรวจ nCompany กับ SchoolBotSession.SchoolId และ resolve profile แยกต่างหาก; ไม่มี FK ข้าม DB

**ขอบเขตอ่าน/เขียน:** อ่านตามสัญญา login; หลักฐาน credential compatibility และ account-profile link ยังไม่พอ; ไม่เขียนบัญชีหรือรหัสผ่าน

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `sID (SId)` | int รหัสบัญชี Master และ PK; เป็น AccountId ไม่ใช่รหัส profile นักเรียนหรือพนักงาน |
| `nCompany (NCompany)` | int? รหัสโรงเรียนประกอบบัญชี; null ต้องจัดการตามกฎ directory ที่พิสูจน์แล้ว |
| `nSystemID (NSystemId)` | int? ตัวอ้างอิงระบบเดิม; หลักฐานที่อ่านยังไม่พิสูจน์กฎเชื่อม profile จึงห้ามใช้เท่ากับ sID/sEmp โดยเดา |
| `Username` | ชื่อบัญชีเดิม; ยังไม่พิสูจน์กฎ normalization/lookup สำหรับ SchoolBot |
| `cType (CType)` | รหัสประเภทบัญชีเดิมแบบ string?; ไม่ใช่ enum student/teacher/school_admin ของ SchoolBot |
| `cDel (CDel)` | char? สถานะลบเดิม; mapping มี filter ที่ถือ null หรือ '0' เป็นกลุ่มไม่ลบ แต่ยังไม่พิสูจน์เงื่อนไข login ทั้งหมด |

## หลักฐานและข้อจำกัด

[TmasterDbuser.cs:8](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Entities/JabjaiMasterSingleDB/TmasterDbuser.cs:8>); [JabjaiMasterSingleDBPostgreSQLDBContext.cs:7292](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:7292>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot


## Change Log

- 2026-10-23 — นายช่างบันทึกคำอธิบายจาก arch ตามใบงาน 009 เทียบกับ SQL/แบบเดิม; ไม่เปลี่ยน schema หรือยืนยันผล runtime
