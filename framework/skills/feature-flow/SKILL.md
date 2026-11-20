---
name: feature-flow
description: คุมจังหวะพัฒนาฟีเจอร์ครบวงจร 7 ขั้นตอน (spec -> arch -> dba -> pm -> build -> testplan -> check) ผ่านคำสั่ง baan flow จากหน้าต่างแชทตัวกลางบน Desktop App พร้อมระบบ Ticket & Close และ 3 ประตูอนุมัติ
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "<project>/<module> [เป้าหมายหรือฟีเจอร์ใหม่]"
---

# 🏗️ คู่มือปฏิบัติการตัวกลาง: `feature-flow` (`baan flow`)

ทักษะนี้ใช้เมื่อผู้ใช้สั่งในแชทตัวกลางบน Desktop App (`claude` / `codex` / `agy`) เช่น:
- **"เริ่มทำ module <name>"**
- **"ทำต่อ module <name> ตาม flow"**
- **"รัน flow ฟีเจอร์ ... ของ <project>/<module>"**

## หลักการทำงาน (Single Coordinator + Auto-Close Grid Windows)

1. **ตัวกลางคุยกับผู้ใช้จุดเดียวที่นี่**: ผู้ใช้ไม่ต้องไปพิมพ์โต้ตอบในหน้าต่าง `cmd` ที่ถูกเปิดขึ้นมา
2. **`baan flow` เปิดหน้าต่าง Grid สูงสุด 4 หน้าต่าง**: แต่ละขั้น/Wave เปิดหน้าต่าง `cmd` ใหม่ ทำงานแล้วปิดตัวเองอัตโนมัติเพื่อล้าง Context (ความจำทั้งหมดเก็บใน Knowledge)
3. **Ticket & Close**: หากหน้าต่างใดมีคำถาม จะเขียน **Ticket** ลง Knowledge แล้วปิดหน้าต่างคืนสล็อตทันที ตัวกลางมีหน้าที่หยิบ Ticket เหล่านั้นมาถามผู้ใช้ในแชทนี้

---

## ขั้นตอนปฏิบัติการ 4 จังหวะ

### จังหวะที่ 1 — ตรวจสถานะของโมดูลก่อนเสมอ
1. หากไม่แน่ใจชื่อ `<project>/<module>` ให้ตรวจจาก `baan.config.json` หรือเรียก `baan survey --json`
2. ตรวจสอบสถานะปัจจุบันของ flow:
   ```bash
   baan flow status --module <project>/<module>
   ```

### จังหวะที่ 2 — เคลียร์ Ticket ที่ค้างอยู่ (`openTickets`)
หาก `openTickets` มีรายการค้างอยู่:
1. นำคำถามใน Ticket มาถามผู้ใช้ในแชทนี้ให้ครบ (ใช้คำถามทีละประเด็นพร้อมตัวเลือกแนะนำตามหลัก `grill-me`)
2. บันทึกคำตอบจริงของผู้ใช้ทีละ Ticket:
   ```bash
   baan flow answer --module <project>/<module> --ticket <TICKET_ID> --answer "<คำตอบของผู้ใช้>" --by user --source "desktop chat <YYYY-MM-DD>"
   ```

### จังหวะที่ 3 — ตรวจและขออนุมัติ Milestone Gate (`pendingGate`)
หาก `pendingGate` ค้างอยู่ที่ประตูใดประตูหนึ่ง:
- **`G-SPEC`**: สรุป `shared/requirements/` + ผลการคัดแยกโมดูล (+ `knowledge_impact` ถ้ามี) ให้ผู้ใช้ตรวจ
- **`G-KB-RESTRUCTURE`**: แสดง Impact Plan ที่กระทบโครงสร้าง Knowledge และ `shared/id-map.md` ให้ผู้ใช้ยืนยันก่อนปรับโครงสร้าง
- **`G-ARCH-DBA`**: แสดงสถาปัตยกรรม (`build/contracts/`, `shared/adr/`) + DBML/SQL (`build/db/`, ถ้ามี) ให้ผู้ใช้ตรวจ
- **`G-WAVES`**: แสดงแผน Waves (`build/waves/INDEX.md`) ให้ผู้ใช้ตรวจก่อนปล่อย Dev ลงมือ

เมื่อผู้ใช้ยืนยันในแชทแล้ว ให้บันทึกอนุมัติจริง:
```bash
baan flow approve --module <project>/<module> --gate <GATE_ID> --by user --decision "<สรุปมติ>" --source "desktop chat <YYYY-MM-DD>"
```

### จังหวะที่ 4 — เดินเครื่อง `baan flow start`
1. เมื่อไม่มี Ticket หรือ Gate ค้าง ให้สั่งเดินเครื่อง:
   ```bash
   baan flow start --module <project>/<module> [--goal "<เป้าหมาย>"] [--worktree]
   ```
2. หาก `stage === "completed"` และผู้ใช้ต้องการต่อยอดรอบใหม่ (Round N+1):
   ```bash
   baan flow next --module <project>/<module> --goal "<เป้าหมายรอบใหม่>"
   baan flow start --module <project>/<module>
   ```
3. อ่านผล JSON ที่ได้:
   - ถ้า `status === "waiting_human"` → กลับไปทำจังหวะที่ 2 (Ticket) หรือจังหวะที่ 3 (Gate) หรือแจ้งผู้ใช้กรณี `PROVIDER_LIMIT`
   - ถ้า `status === "completed"` → สรุปผลการส่งมอบ ไฟล์ที่แก้ และ Automated Tests ที่ผ่านทั้งหมดให้ผู้ใช้

---

## กฎเหล็ก
- **ห้ามตอบ Ticket หรืออนุมัติ Gate แทนผู้ใช้เด็ดขาด** (ต้องมีคำยืนยันจริงจากผู้ใช้ก่อนใส่ `--by user`)
- **ห้ามแก้ไฟล์ Wave หรือ Test Plan ที่สถานะ `done` แล้ว**
- **Strict No-Impersonation**: หากเกิด `PROVIDER_LIMIT` ให้หยุดแจ้งผู้ใช้ทันที ห้ามแอบสลับค่ายหรือลดรุ่นแทน
