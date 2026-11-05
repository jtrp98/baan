# ขอบเขตการบันทึก Project ในเครื่อง

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

สัญญานี้กำหนดข้อผิดพลาด การตรวจ JSON และข้อจำกัดของ Project ในเครื่อง ใช้ร่วมกับ [DES-003 (หลายโครงงาน Local/Cloud)](des-003.md), [Project API](project-api-001.md), [กฎข้อมูล](data-contract-rules.md), [ชนิดข้อมูลกลาง](data-dictionary/contract-001.md) และ [พื้นที่ Guest](guest-workspace-001.md) ไม่เพิ่ม schema, public code หรือ field ของ Inter-Process Communication (IPC)

ส่วนต่อของสัญญาคือ [lock และ filesystem](local-project-boundary-001-filesystem.md) กับ [migration และ receipt](local-project-boundary-001-migration.md)

## ข้อผิดพลาดและลำดับตรวจ

Save/Copy ที่ไม่มี `expected_local_revision` หรือส่ง integer ≤0 คืน `PRECONDITION_REQUIRED` ก่อนอ่านหรือเขียนเป้าหมาย หาก raw value เป็น null, string, boolean, fraction หรือเกินช่วง ให้คืน `PROJECT_INVALID` โดยไม่แปลงชนิดอัตโนมัติ ค่า positive ที่ไม่ตรง revision ปัจจุบันคืน `VERSION_CONFLICT` พร้อม `current_local_revision` ภายใต้ lock

UUID ถูกต้องแต่ไม่พบงานคืน `NOT_FOUND`; ไม่มี entitlement คืน `LICENSE_REQUIRED`; document ผิดคืน `PROJECT_INVALID`; เกินขนาดคืน `PROJECT_TOO_LARGE`; secure storage, lock หรือ commit ทำไม่ได้คืน `STORE_UNAVAILABLE` ใช้รหัสเหล่านี้แทน implementation เดิมที่เรียก `PROJECT_NOT_FOUND`/`ENTITLEMENT_REQUIRED` โดยไม่เพิ่ม HTTP status

ตรวจ raw size และ strict JSON ก่อนแปลงเป็น typed input หลัง decode ให้ตรวจ entitlement, expected revision และ UUID ตามลำดับ จากนั้นเปิด secure storage/lock อ่านและตรวจ document ปัจจุบัน ตรวจ revision conflict แล้วตรวจ candidate ก่อน recheck entitlement และ commit ห้ามเผย revision แก่ผู้ไม่มีสิทธิ์ ห้ามรายงานไฟล์เสียเป็น conflict และห้ามเขียนหากสิทธิ์ถูกถอนระหว่างรอ lock

## Strict JSON และ union

ทุกระดับปฏิเสธ required field ที่หาย, null, unknown field, duplicate key หลัง JSON unescape, case ไม่ตรง, invalid UTF-8 และหลาย document ต้องตรวจ raw presence ก่อน typed conversion ไม่ดูเฉพาะ nonzero ใน broad struct Field ของ variant อื่นต้องปฏิเสธแม้เป็น 0, false, empty หรือ null

| Object | Required/exactfields |
|---|---|
| LocalProjectDocument | schema,project_id,mode,name,local_revision,updated_at,content |
| code | kind,source |
| block | kind,stacks |
| arm | kind,poses,order,groups,joint_names,time_mode,loops,view |
| Stack | x,y,blocks |
| move | id,enabled,type,direction,tiles |
| jump | id,enabled,type |
| repeat | id,enabled,type,times,body |
| Pose | id,name,values,duration_ms,joint_duration_ms |
| PoseGroup | id,name,pose_ids |

`source` เป็น empty string ได้; stacks/poses/order/groups/blocks/repeat body เป็น empty array ได้ แต่ต้อง serialize ไว้ ไม่ omit หรือเป็น null ค่า enabled=false และ x=0/y=0 เป็นค่าจริง Pose values/joint durations ต้องมี raw array length 6 ก่อนแปลงเป็น [6] ปฏิเสธความยาว 5/7, null member, invalid number และค่าผิด bounds ไม่เติม default เพื่อรับ raw JSON ที่ผิด และ codec serialize เฉพาะ variant จริงโดยไม่เพิ่ม schema field

## Block depth และ compilation fuel

Root depth เท่ากับ 0; repeat body เพิ่ม depth 1 ระดับ ซ้อน 8 ชั้นพร้อม leaf ผ่าน แต่ 9 ชั้นไม่ผ่าน Structural validation ตรวจ stored block ทุกตัวรวม disabled ครอบ IDs, cycle, type, bounds และจำนวนไม่เกิน 1000 blocks ทั้ง document

Pure compilation fuel เพิ่ม 1 ทุก walk รวม empty body และเพิ่ม 1 ทุก block visit ก่อนตรวจ enabled; disabled เสีย visit แต่ไม่ execute และไม่เดิน body ของ disabled repeat; enabled repeat คูณ body ตาม times จริง Fuel 1000 ผ่าน แต่ 1001 ไม่ผ่าน ใช้ saturating bounded calculation ไม่ขยายข้อมูลมหาศาล

ตาม [REQ-026 (สร้างและทดลองโปรแกรมบล็อก)](../../modules/block-lab/shared/requirements/req-026.md) ตรวจ fuel ≤1000 เฉพาะก่อน Run; Save/Load/Migration ต้องไม่ปฏิเสธ draft ที่ผ่าน structural validation เพราะ fuel หรือจำนวน output commands ไม่มี draft budget ต่อ stack หรือรวม document ข้อจำกัดหนึ่ง stack และ output ≤64 เป็นเงื่อนไขก่อน Run จึงไม่ห้าม draft หลาย stack สูตร pure fuel, structural depth/count และการตรวจ disabled ไม่เปลี่ยน การทดสอบต้องแยก draft กับ Run และไม่เปลี่ยนผลทดสอบเก่าย้อนหลัง

## หลักฐาน

- E01 — Compiler: `BlockMode.tsx:123`; save: `BlockMode.tsx:238` ผลทดสอบ ParentFuelOverflow เดิมไม่ใช้ตัดสิน store ว่าผิดจากการรับ draft ที่เกิน fuel
- คำวินิจฉัย draft/Run: planning/spec-090-draft-fuel-001.md (memory)
- เอกสารเดิมตรวจ source 6 hashes ตรงกับฐานตรวจ; ผล 63 ผ่าน/26 ไม่ผ่าน/1 ข้ามเป็น local overlay ใน planning/check-090-local-runtime-001.md (memory)
- AncestorSwapAccessDenied เกิดจากชุดทดสอบถูกขัดขวาง; symlink ที่ข้ามยังเป็นช่องว่างหลักฐาน; junction เขียนนอก boundary 2 ไฟล์จริงใน scratch
- ที่มา: งานออกแบบ 2026-10-26, run 2026-10-26-14-14-23-arch-tier-t1-1agents-p8z60N งานเรียบเรียงนี้ไม่ได้ตรวจ runtime ใหม่
