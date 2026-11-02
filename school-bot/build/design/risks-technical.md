# ความเสี่ยงทางเทคนิคและขอบเขตหลักฐาน

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับทะเบียนความเสี่ยง Rev5](risks.md)

## ความเสี่ยงทางเทคนิคและมาตรการตามแบบ

ทุกข้อในตารางยังต้องพิสูจน์ด้วย implementation และผลทดสอบ มาตรการที่ระบุเป็นข้อเสนอในสัญญา ยังไม่ใช่หลักฐานว่าลดความเสี่ยงสำเร็จ

| ความเสี่ยง | ข้อเสนอใช้ได้ / ทางที่ปัดตก |
|---|---|
| Activate/transfer race | ยังต้องพิสูจน์มาตรการตามแบบ; ข้อความเรื่อง unique ขัดกับฐาน PK-only ตามรายการที่ยังไม่ยืนยันท้ายไฟล์; ปัดตก process lock อย่างเดียว |
| เครื่องเก่า reacquire หลัง unbind | detached fingerprint ถูกกันจน admin อนุญาต / ปัดตก validate ที่ activate แอบแฝง |
| Offline clock tampering | signed expiry+protected high-water mark+online recovery / ไม่อ้างกัน disk snapshot ได้สมบูรณ์ |
| Cloud overwrites | immutable revision+If-Match / ปัดตก last-write-wins |
| False grading | server reparse snapshot+versioned criteria / ปัดตก client trace/ดาวเป็น authority |
| Partial hardware delivery | unknown outcome, no replay, drain/stop / ปัดตก cancel=physical stop |
| Mac compatibility | Darwin adapter+Intel/ARM proof / ปัดตก simulator-only delivery |
| Update supply chain | signed manifest+OS publisher+TOCTOU checks / ปัดตก checksum-only execution |

## ข้อแตกต่างจากเอกสารและข้อจำกัดหลักฐาน

เอกสาร architecture เดิมยังเรียกระบบว่า Robot Simulator ทั้งที่มี native path จริง และระบุว่าไม่ enforce License ซึ่งขัดเป้าหมายล่าสุด จึงใช้เป็นข้อยกเว้นไม่ได้ เอกสาร API และ SchoolLicense เดิมยังยอมรับ `device_limit` 1–1000 ขณะที่เป้าหมายต้องเป็นหนึ่งเครื่อง

เอกสาร installer มี setup EXE และเนื้อหาเพิ่ม เลขบรรทัดที่อ้างใน requirement บางแห่งจึงคลาดเคลื่อน ให้ใช้หลักฐาน source ของแบบ Rev1 ส่วน engine manager ยังไม่ตรวจ unknown fields แบบ strict จึงต้องเพิ่มก่อนอ้างว่าตรวจ payload ครบตามสัญญา

ขอบเขตหลักฐานเดิมไม่ครอบ helpers, third-party implementation, auth integration หรือ installer scripts จึงยังไม่รับรองส่วนเหล่านี้ ประเด็นค้างมี dependency ระบุไว้ และไม่พบข้อขัดแย้งใหม่ที่ต้องแก้ requirement ทั้งชุด

ผลกระทบ consumer/schema, API/migration และ release signing ยังต้องผ่านการอนุมัติเดิม ไม่ใช่การอนุมัติรหัสผ่าน legacy หรือการเขียนเกรด ทางเลือกที่ปัดตกคือใช้ client int PK พร้อม public UUID ซ้ำทุกตาราง

## ยังไม่ยืนยัน

แถว Activate/transfer race เดิมระบุ `transaction+unique+epoch+idempotency` แต่กฎข้อมูลปัจจุบันระบุ SQL ไม่มี UNIQUE และใช้ application/repository transaction locks ต้องให้ arch และ vault ยืนยันว่าคำว่า unique ในแถวเดิมหมายถึงกฎ application หรือ SQL constraint โดยงานนี้ไม่เลือกแทน

## หลักฐาน

- `docs/ARCHITECTURE.md:5`
- `docs/API.md:44`
- `SchoolLicense.cs:12`
- `manager.go:207`
- `docs/ARCHITECTURE.md:84` ระบุพฤติกรรม License เดิม
- `docs/INSTALLERS.md`: เอกสารติดตั้งที่มี setup EXE และเลขบรรทัดเปลี่ยนจากหลักฐานเดิม
