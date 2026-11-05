# ตารางเดิม: MasterDBTUser

[แผนที่ตารางเดิม](../data-legacy-001.md) · [คู่มือภาพรวม](../data-model.md)

**ฐานข้อมูล:** Master DB — JabjaiMasterSingleDB ตามชื่อ context

**หน้าที่เดิม:** view เดิมสำหรับอ่านข้อมูลผู้ใช้ ไม่ใช่ตารางบัญชีที่มี PK อีกชุด

**SchoolBot ใช้อย่างไร:** ไม่มี SchoolBot field ที่กำหนดให้ใช้ view นี้เป็น identity key; AccountId ยังคงอ้าง TMasterDBUser.sID

**ขอบเขตอ่าน/เขียน:** หลักฐานยังไม่พอสำหรับ use case โดยตรงของ SchoolBot; EF ประกาศ HasNoKey/ToView

## ฟิลด์ที่เกี่ยวข้องกับ SchoolBot

ชื่อในวงเล็บ (ถ้ามี) คือชื่อ property ของ C# ซึ่งอาจต่างจากชื่อคอลัมน์ในฐาน

| ฟิลด์เดิม | ความหมาย / ใช้ทำอะไร |
|---|---|
| `nCompany (NCompany)` | รหัสโรงเรียนที่ view แสดง |
| `nSystemID (NSystemId)` | ตัวอ้างอิงเดิมใน view; ไม่พิสูจน์ความสัมพันธ์กับ profile ด้วยการมีชื่อฟิลด์อย่างเดียว |
| `cType (CType)` | ประเภทผู้ใช้เดิมที่ view แสดง |

## หลักฐานและข้อจำกัด

[JabjaiMasterSingleDBPostgreSQLDBContext.cs:1505](<C:/src/schoolbright/target/sb-tech-upgrade-academic/src/ServiceAcademic.Infrastructure/Common/Databases/JabjaiMasterSingleDBPostgreSQLDBContext.cs:1505>)

อ้างจาก source/EF ใน checkout; ยังไม่ใช่ผลสำรวจฐานที่ deploy จริง การอ่าน/เขียนที่ระบุเป็นแบบเป้าหมายของ SchoolBot
