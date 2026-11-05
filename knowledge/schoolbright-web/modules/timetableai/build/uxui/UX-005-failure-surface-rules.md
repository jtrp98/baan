# UX-005 — กติกาการแสดงผลของ action: สำเร็จ/ล้มเหลว (แก้ as-built จาก UI review 2026-09-29)

Status: **ร่าง — ยังไม่มีผู้เซ็น** · UX sign-off เป็นการกระทำของคน
วันที่ร่าง: 2026-09-29 (วันที่ของ session ที่ผู้เรียกระบุ)
Traceability: AC-063 (ความล้มเหลวที่ผู้ใช้เห็น) · DES-020 §45.3 (สถานะล้มของ Generate) · AC-014 (confirm ก่อนลบ — มีอยู่แล้ว คงไว้) · REQ-008
As-built basis: UI review 2026-09-29 — ไฟล์อ้างอิงทั้งหมดอยู่ใต้ `C:\src\sb-tech-upgrade-web-system\`

## ปัญหาที่ร่างนี้แก้

as-built มีจุดที่ **แสดงสำเร็จทั้งที่ล้ม** และ **กลืนความล้มเหลวแบบเงียบ** — ผู้ใช้ตัดสินใจบนข้อมูลเท็จ ร่างนี้กำหนดกติกาเดียวให้ทุก action ของโมดูลใช้

## กติกานำ

1. ทุก action ที่เขียนข้อมูล ต้องมีผลที่ผู้ใช้เห็นทั้งสำเร็จและล้มเหลว — **ห้ามแสดงสำเร็จก่อนยืนยันผลจาก response**
2. ความล้มเหลวต้องบอกให้ไปต่อได้: สถานะของข้อมูลบนจอต้องกลับมาตรงความจริงเสมอ (rollback ถ้า optimistic)
3. ข้อความใหม่ทุกตัวอยู่ใน `messages/th.json` + `en.json` — ห้าม hardcode ข้อความใน component

## ข้อกำหนดรายจุด

| จุด | as-built วันนี้ (หลักฐาน) | กติกาที่ต้องเป็น |
|---|---|---|
| บันทึกตาราง (`set-all`) | ไม่อ่าน response เปิด SuccessModal เสมอ + `catch { }` (`manage-teaching-schedule/page.tsx:670-689`) | ตรวจ `res.ok` + `status === 1` ก่อน SuccessModal · ล้ม → toast/Alert "บันทึกไม่สำเร็จ กรุณาลองอีกครั้ง" และคงอยู่หน้าเดิม (ข้อมูลบนกริดไม่หาย) |
| ลบตาราง / toggle สถานะ | optimistic ล่วงหน้า + `.catch(() => {})` (`timetable/[year]/page.tsx:118-133, 135-160`) | รอผลก่อน update หรือ rollback เมื่อล้ม + `toast.error` |
| ลบกลุ่มครู / set-times / เพิ่ม-ถอดครู | กลืนผลเช่นเดียวกัน (`TeacherGroupsTab.tsx:102-116, 489-499`) + toast อังกฤษ hardcoded (`:81, 750, 753, 928, 931`) | rollback + `toast.error` ข้อความจาก locale ไฟล์ |
| Generate exception | spinner ค้าง (`use-timetable-generation.ts:767-779` ไม่มี try/catch) | มี catch → สถานะ "ตรวจผลการจัดไม่ได้ — กรุณาตรวจกริด" ของ UX-001 (ห้าม spinner ค้าง ห้าม "จัดครบ") |
| โหลดข้อมูล conflict ล้ม | `.finally` ปลดล็อกให้จัดด้วยข้อมูลว่าง (`use-timetable-generation.ts:78, 126`) | แจ้งเตือน "ไม่สามารถโหลดข้อมูลครูสอนแทน/งดสอนได้ครบ — ผลการจัดอาจไม่ถูกต้อง" ก่อนเริ่มจัด (ไม่บล็อก แต่ต้องเห็น) |
| ลบข้อมูลผูกวิชา-คาบ | ลบแล้วไม่เช็คผล, `catch { // ignore }` (`subject-settings/[year]/page.tsx:344-354, 409-428, 430-443, 485-498`) | รอผล + toast.error เมื่อล้ม |
| ข้อมูลปลอมแสดงเป็นของจริง | แท็บภาพรวมครู mock (`timetable/[year]/page.tsx:44-53`) · ห้องเรียนครูประจำชั้น mock (`settings/[year]/page.tsx:29-78`, save ไม่รวมค่า) | ซ่อนแท็บ/การ์ด หรือใช้ pattern "Coming Soon" เดิม (`UsageHistoryCard`) จนกว่า API จริงจะมา — ห้ามรับค่าจาก UI ที่ไม่ได้ไปลง payload |
| Toast error อังกฤษ hardcoded ที่เหลือ | `create-class-period/[year]/page.tsx:124`, `add-class-period-modal.tsx:196`, `create-class-period-form.tsx:478` ฯลฯ | ย้ายเข้า locale ไฟล์ทั้งหมด (งานวิศวกรรม) |

## หมายเหตุ

- รูปแบบ error ของ **กฎ hard** การวางมือ (error modal เต็มจอในกริด) คงเดิม — ร่างนี้ไม่แตะ; คำเตือน **soft** ของความเข้มข้นใช้ UX-003 (toast warning) สองรูปแบบต้องแยกกันชัดเจน
- รายการไฟล์:บรรทัดด้านบนเป็น as-built วันที่รีวิว (branch `backlog/ACA-5111` @ `c212ca6`) — engineer ต้องยืนยันกับ worktree ปัจจุบันก่อนแก้ (worktree volatile ตาม plan.md)

## Sign-off (เป็นการกระทำของคน — agent ห้ามเซ็นแทน)

| ผู้เซ็น | วันที่ | ผล (อนุมัติ/แก้ไข) | หมายเหตุ |
|---|---|---|---|
| | | | |
