# DES-003 — หลายโครงงาน Local/Cloud — ผู้ใช้และเงื่อนไขก่อนเริ่ม

> Rev 4 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [DES-003 — หลายโครงงาน Local/Cloud](des-003.md)

ชนิดข้อมูลที่ใช้: `K` = int4 primary key ของ SchoolBot; `S` = SchoolId; `U` = UUID; `N` = integer ≥1; `B` = boolean; `D` = UTC instant; `Tn` = ข้อความยาวไม่เกิน n ตัวอักษร; `P` = profile ที่ระบุโรงเรียน kind และ id ตาม [สัญญาชนิดข้อมูลร่วม](data-dictionary/contract-001.md).

## ผู้ใช้และเงื่อนไขก่อนเริ่ม

Guest/Login ที่มี entitlement สร้าง เปิด บันทึก สำเนา เปลี่ยนชื่อ หรือลบงาน Host เลือก store จาก session ที่ยืนยันแล้ว ไม่รับ owner/storage path จาก UI

Guest ใช้ workspace ร่วมหนึ่งแห่งต่อ OS account ไม่มี PIN/guest profile ตาม [REQ-040 (พื้นที่ร่วมและถังขยะ Guest)](../requirement/req-040.md); Login namespace ใช้ P ตาม data-model; OwnerId/OwnerKind/SchoolId มาจาก session ของ web ไม่เดาจาก Guest. สัญญาถังขยะ/เวลา/ไฟล์ส่งออกอยู่ที่ [guest-workspace-001.md](guest-workspace-001.md); explicit import/receipt อยู่ที่ [guest-import-001.md](guest-import-001.md). ไม่มี auto-upload และไม่เปิดคำถาม Guest policy เดิมซ้ำ

## เอกสารโครงงาน v2

`LocalProjectDocument={schema:2,project_id:U,mode:Mode,name:T200,local_revision:N,updated_at:D,content:ProjectContent}`
`CloudProjectDocument={schema:2,project_id:K,project_revision_id:K,mode:Mode,name:T200,revision:N,update_date:D,content:ProjectContent}`

UTF-8 document ≤1 MiB; ชื่อ 1–200 ตัวอักษร ไม่ใช้เป็น path. Host สร้าง Local UUID ออฟไลน์; web สร้าง Cloud K. `project_revision_id` คือ PK ของ snapshot; `revision` คือ `SchoolBotProjectRevision.Revision` ซึ่งยังคงอยู่ ไม่ใช่ concurrency token. Cloud ใช้ `ETag` จาก `SchoolBotProject.UpdateDate` คู่กับ `If-Match` ตาม [มติ 030 (ถอนคอลัมน์ Version — ใช้ UpdateDate แทน)](../requirement/decisions-030.md); `update_date` ใช้แสดงผล ห้าม client แปลงวันที่ไปสร้าง ETag. `local_revision` เป็น counter ไฟล์ใต้ lock ไม่ใช่คอลัมน์ Version ใน DB และไม่ใช่ cloud ETag

Host ใช้ reference `{store:"local",project_id:U}` หรือ `{store:"cloud",school_id:S,project_id:K}`; Cloud cache/recovery แยก P ตามเดิม ห้าม cast/hash UUID เป็น K หรือใช้ bare ID ข้าม store

ProjectContent เป็น tagged union:

| kind | Fields ทั้งหมด |
|---|---|
| code | `{kind:"code",source:string}`; จุดโหลด UI ตรวจ `source.length ≤16384` UTF-16 code units; ตอนรัน engine ตรวจ UTF-8 bytes ≤16384 แยกกันตาม [BR-025-03 (ขอบเขตรันปัจจุบันคือ 1–64 คำสั่ง เดินครั้งละ 1–10 ช่อง รวมไม่เกิน 100 steps และ source ไม่เกิน 16384 bytes; การโหลดฝั่ง UI ตรวจ 16384 ตัวอักษร (UTF-16 code unit ตาม `String.length`) แยกต่างหาก — สองจุดตรวจใช้หน่วยต่างกันตามที่ source เป็นจริง ยังไม่มีมติผู้ใช้ให้รวมเป็นหน่วยเดียวหรือเปลี่ยนหน่วย; ข้อความหลายไบต์ (เช่น ไทย 1 ตัวอักษร = 3 UTF-8 bytes) อาจผ่านการโหลดแต่ถูกปฏิเสธตอนรันเมื่อเกิน 16384 bytes)](../requirement/req-025.md)/[AC-025-03 (บันทึกแล้วเปิด source เดิมได้; เมื่อโหลด schema ผิดหรือ source ยาวเกิน 16384 ตัวอักษร (หน่วยตาม BR-025-03) แสดงข้อผิดพลาด; เพดาน bytes ตอนรันอยู่ใน BR-025-03 ไม่ใช่เกณฑ์ของข้อนี้)](../requirement/req-025.md) |
| block | `{kind:"block",stacks:Stack[]}` |
| arm | `{kind:"arm",poses:Pose[],order:U[],groups:PoseGroup[],joint_names:T200[6],time_mode:"same"|"split",loops:integer1–9999,view:"cards"|"table"}` |

`Stack={x:number,y:number,blocks:Block[]}`; coordinates finite; รวม ≤1000 blocks
`Block` มี `id:U,enabled:B` และ union:
`{type:"move",direction:"move_right"|"move_left",tiles:integer1–10}`;
`{type:"jump"}`;
`{type:"repeat",times:integer1–10,body:Block[]}`

ID ไม่ซ้ำ ไม่มี cycle; draft บันทึกหลาย stacks ได้ แต่ run ต้องหนึ่ง stack ตาม [REQ-026 (สร้างและทดลองโปรแกรมบล็อก)](../requirement/req-026.md); nesting ≤8 และ compilation fuel ≤1000

`Pose={id:U,name:T200,values:number[6],duration_ms:integer1000–9000,joint_duration_ms:integer1000–9000[6]}`
ช่วง values: `[-180,180]`, สี่ค่า `[-135,135]`, ค่า gripper `[0,100]`
`PoseGroup={id:U,name:T20,pose_ids:U[]}`; ≥2 IDs ที่อยู่ใน order; ชื่อกลุ่มไม่ซ้ำ
order ไม่ซ้ำ อ้าง poses ครบหนึ่งครั้ง และ ≤10000; zero poses บันทึกได้แต่เล่นไม่ได้

ไม่บันทึก connection, uploaded/verified, predicted telemetry, torque หรือ executable path เป็นข้อเท็จจริงถาวร กลุ่มผิดใน legacy ถูกละพร้อม warning; document v2 ที่เขียนใหม่ต้อง valid ทั้งชุด

## API และ bridge

Cloud/local operations, ETag/If-Match, source_project_revision_id และ transaction ตาม [project-api-001.md](project-api-001.md); เป็นส่วน canonical ของ DES-003. Local ใช้ UUID/local_revision ไม่ใช่ Cloud PK/ETag

