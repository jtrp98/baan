# Project ในเครื่อง — lock และ filesystem

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [ขอบเขตการบันทึก Project ในเครื่อง](local-project-boundary-001.md) กำหนดการป้องกันการเขียนทับและการออกนอกพื้นที่จัดเก็บ

## Shared lock

ใช้ stable lock ต่อ workspace identity และ project UUID ร่วมทุก LocalStore/process ครอบตั้งแต่อ่าน revision จน commit ทุก create/save/copy/import/migration ใช้ทางเดียวกัน Lock artifact แยกจาก JSON ที่ถูก replace ห้าม unlink/recreate ตอน release และห้ามยึดคืนโดยเดาจาก Process ID (PID) หรืออายุ

Windows ใช้ OS file lock; macOS ใช้ advisory file lock ร่วมกับการประสานงานภายใน process หาก acquire ล้มเหลวหรือ timeout ให้คืน `STORE_UNAVAILABLE` ไม่ข้าม lock การ copy ที่ใช้หลาย lock ต้องเรียงลำดับเดียวกัน และ migration ต้องไม่เรียก public lock ซ้อนจน deadlock Index เป็นข้อมูล derived ที่ต้องเห็น writer อื่น ห้ามใช้ map cache ตลอด process เป็นแหล่งความจริง

## Filesystem boundary

ก่อน mkdir/temp/rebuild ต้องยืนยัน trusted host app-data anchor และ root identity ผูก operation กับ directory handle/descriptor ที่ตรวจแล้ว ไม่กลับไปเปิดด้วย string path ครอบ projects, receipts, locks, temp, legacy read, root และ ancestors หากยืนยัน root/ancestor policy หรือ containment ไม่ได้ ให้คืน `STORE_UNAVAILABLE` ก่อนเขียน ถ้า project leaf เป็น link หรือ nonregular file ให้คืน `PROJECT_INVALID` และตรวจ document UUID ให้ตรง filename ก่อนสร้าง index

การตรวจ Lstat/EvalSymlinks แล้วเปิดด้วย string ยังมีช่อง Time-of-check to time-of-use (TOCTOU) ใช้ `os.Root` ได้เมื่อ Software Development Kit (SDK) รองรับ operation ที่ต้องการ แต่การ OpenRoot จาก path ที่สับเปลี่ยนได้ยังไม่ยืนยัน trusted anchor Windows ต้องถือ boundary handle และข้อจำกัด rename/delete ตลอด operation ส่วน macOS ใช้ descriptor-relative operation กัน symlink ใหม่ แต่ไม่รับรอง absolute pathname เดิมทุกขณะเมื่อ directory ถูกย้าย Platform ที่รักษา boundary ไม่ได้ต้อง fail closed ไม่ fallback ไป string write และไม่อ้าง support/runtime ที่ยังไม่พิสูจน์

ตรวจ write, short write, sync, close และ replace errors ครบ ห้าม remove target แล้วค่อย rename ต้องพิสูจน์ atomic replace ของแต่ละ platform ไม่อาศัยชื่อ helper เป็นหลักฐาน

## หลักฐาน

- E01 — หลักอ้างอิงเดิม: [Go Root](https://go.dev/blog/osroot), [os.Root](https://pkg.go.dev/os#Root), [os.Rename](https://pkg.go.dev/os#Rename), [LockFileEx](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-lockfileex), [flock](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/flock.2.html) เอกสารนี้ไม่ได้ตรวจ runtime ใหม่
