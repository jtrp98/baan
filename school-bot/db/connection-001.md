# ผลทดสอบการเชื่อมต่อ PostgreSQL

วันที่ 2026-10-26 · ผู้รัน: นายช่าง · ตามคำสั่งผู้ใช้ “ลองเชื่อมดู”

ใช้ connection string จาก `target/school-bot/web/.env` ในหน่วยความจำ โดยไม่พิมพ์หรือบันทึกค่าเชื่อมต่อ ใช้ Npgsql 10.0.2 ที่มีใน build output ของ API และกำหนด connection/command timeout 8 วินาที

ผลจริง: เชื่อมต่อและ authentication สำเร็จ; `SELECT 1` คืน 1; PostgreSQL รายงานรุ่น 15.19; คำสั่ง `SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE' AND table_name LIKE 'SchoolBot%'` คืน 32; ไม่มีคำสั่งเขียนข้อมูล

รอบแรกติด SocketError AccessDenied จาก sandbox; รันทดสอบเดิมผ่านช่องทาง require_escalated แล้วสำเร็จ exit 0 ไม่ใช่ปัญหา credential ของฐานข้อมูล

ขอบเขตนี้พิสูจน์ direct DB connectivity และจำนวนตารางที่มองเห็นเท่านั้น ยังไม่ตรวจรายชื่อตาราง/คอลัมน์/constraints เทียบ SQL Rev7, สิทธิ์เขียน, transaction/rollback, API integration, fullLogin หรือ Gateway/gRPC ไม่เปลี่ยน task verdict และไม่ปิด runtime gates

## Change Log

- 2026-10-26 — บันทึกผลเชื่อมต่อจริงและ SELECT แบบอ่านอย่างเดียวตามคำสั่งผู้ใช้
