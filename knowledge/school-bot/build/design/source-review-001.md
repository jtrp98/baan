# รายงาน as-built — 2026-10-21

> แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

รายงานนี้อ่าน Desktop Go/Wails และ frontend ของ SchoolBot ณ 2026-10-21 พบว่ามี 3 product modes: Block/Arm/Code แยกบทเรียนกับสร้างงาน เป้าหมายระบบเต็มคือคำยืนยันผู้ใช้ ไม่ใช่ผลรับรอง production รายงานนี้เป็น knowledge reference ไม่ใช่ DES/test verdict

ตำแหน่งโค้ดที่รองรับข้อค้นพบอยู่ในหัวข้อหลักฐานท้ายไฟล์ ข้อค้นพบนี้เป็นผลอ่านเดิม ไม่ใช่การตรวจ source ปัจจุบันเพิ่ม

## 1) เส้นทางบทเรียนและสร้างงาน

เมนูแยก Lessons/Code Lab/Block Lab/Arm Lab และ AppView render คนละ entry (หลักฐาน E01)

• บทเรียน: picker มี block|arm|code; Arm เปิด LearnMap ส่วน Block/Code เปิด LessonModeUnavailable แล้วย้อนเลือกได้ ไม่ได้หมายถึงไม่มีตัวเลือกหรือไม่มี Lab (หลักฐาน E02)

• Arm lessons มี 7 stages แต่เริ่ม preset map4, cur=4, conn=connected; finishRun ให้ดาวใน state และ connectRobot ใช้ timer 1,400 ms ไม่ใช่การเชื่อมอุปกรณ์จริง (หลักฐาน E03)

• สร้าง Block: BlockMode เปิด Blockly มี move/jump/repeat → compile เป็น Command[] → program.run → เก็บ response เป็น JSON ให้ result panel; save/load ใช้ schema:1 กับ Blockly workspace (หลักฐาน E04)

• สร้าง Code: CodeLabMode → AdventurePlayground/useCodeLab รับข้อความ DSL → program.run → commands/steps → GameCanvas เล่นฉาก Phaser; มี reset/save/load และตรวจ schema:1/source ตอน load (หลักฐาน E05)

• สร้าง Arm: เริ่ม works; มี connect/works/workspace/teacher; ArmWorkspace โหลด robot-control แล้วแยก Workspace(sample)/NativeWorkspace; newProject ล้างท่า/กลุ่ม แต่ไม่ได้อ่านการกดสร้างภายใน WorksScreen (หลักฐาน E06)

## 2) สิ่งที่ต่อ simulation/hardware ตามโค้ดที่อ่าน

| Mode | Simulation/ผลบนจอ | เส้นทาง hardware |
|---|---|---|
| Block | Blockly compile แล้ว demo ตรวจ commands และคืน simulated:true; ใน entry นี้ผลเป็น JSON ไม่ได้ส่งเข้า GameCanvas | manager ให้เฉพาะ program.run ผ่าน demo ไม่ใช่ zide |
| Arm | sample แยก workspace; มีปุ่ม ArmSimulator เฉพาะ sample แต่ไม่ได้อ่าน implementation ของ simulator | NativeWorkspace เรียก servo.set/read/torque, group.execute/download/run และ robotApi.stop ผ่าน transport; พบเส้นทางเรียก แต่ไม่ได้ยืนยันอุปกรณ์ตอบจริง |
| Code | demo parse hero DSL แล้ว GameCanvas เล่น move_right/move_left/jump | manager ให้เฉพาะ program.run ผ่าน demo ไม่มีเส้นทางคำสั่ง servo ใน mode นี้ |

หลักฐานตาราง: หลักฐาน E17 ; หลักฐาน E18 , ; หลักฐาน E19; หลักฐาน E20 ; หลักฐาน E21 , , , , , ; หลักฐาน E22

preview=1 ใช้ runPreview/localStorage; native ใช้ Wails Run/SaveProject/LoadProject ไม่มี silent fallback; Arm sample เปิดด้วย preview หรือ scenario (หลักฐาน E07)

## 3) ความสามารถท่าและกลุ่ม Arm ที่มีหลักฐาน

• ท่า: มี handler เลือกท่า/ช่วง/หลายรายการ, duplicate, rename, delete; copy/cut/paste/ย้ายลำดับส่งต่อ poseEditing ซึ่งไม่ได้อ่าน จึงยังไม่ยืนยัน mutation/undo ภายใน (หลักฐาน E08)

• กลุ่ม: มีเลือกทั้งกลุ่ม พับ/ขยาย เล่นช่วง copy/delete/paste-after, ungroup พร้อม undo; rename จำกัด 20 ตัวอักษรและห้ามซ้ำ ยังไม่ได้ตาม flow สร้างกลุ่มใหม่ครบ (หลักฐาน E09)

• กลุ่มใน UI อ้างสมาชิกด้วย keys และ playGroup เปลี่ยนช่วงเล่น; native upload กลับแปลงแต่ละ pose เป็น poseGroup ส่งครั้งละไม่เกิน 4 รายการ จึงไม่ควรเทียบ UI group กับ protocol group แบบหนึ่งต่อหนึ่ง (หลักฐาน E10)

• Native มีส่งข้อต่อ/ท่า/ลำดับ เล่นหน่วยความจำตามจำนวนรอบ อ่านทีละข้อหรือครบ 6 ข้อเพื่อแก้/สร้างท่า บันทึก kind:zide-workspace/version:1; saveAs แจ้งว่ารองรับงานเดียว (หลักฐาน E11)

• ส่งสำเร็จไม่ยืนยันตำแหน่ง: move แสดงภาพคาดการณ์ตามเวลา ส่วน servo.read อ่านแยก; stop invalidate callbacks และ manager.Cancel รอ process เดิมจบ ยังไม่ยืนยัน physical stop (หลักฐาน E12)

## 4) ชื่อ product เทียบ implementation IDs

| ความหมาย | ID/entry | Backend/engine |
|---|---|---|
| ตัวเลือกบทเรียน | block / arm / code | state ของ picker ไม่ใช่ engine ID |
| Lessons | coding-adventure → LessonsMode | entry นี้เลือกบทเรียน |
| Code Lab | code-lab → CodeLabMode | run/save/load ใช้ coding-adventure → demo |
| Block Lab | block-programming → BlockMode | block-programming → demo |
| Arm Lab | robot-control → RobotMode | robot-control → zide |

หลักฐาน: หลักฐาน E23; หลักฐาน E24; หลักฐาน E25; หลักฐาน E26; หลักฐาน E27 , ; หลักฐาน E28 จึงมี 3 product modes, 4 หน้าระดับบนที่เกี่ยวข้อง และ 2 engine IDs ใน routing ที่อ่าน ไม่ควรนับแทนกัน

## 5) ข้อสรุปเดิมที่ต้องแก้

• แก้อ้างอิง AdventureMode.tsx: entry ปัจจุบันคือ LessonsMode กับ CodeLabMode/useCodeLab แยกกัน ไม่ได้ยืนยันการลบไฟล์เก่า (หลักฐาน E13)

• unavailable ใช้กับบทเรียน Block/Code; Lab ทั้งคู่มี run/save/load ตามข้อ 1

• ชื่อ arm_move/arm_jump ไม่ได้พิสูจน์ว่าบล็อกสั่งแขนจริง: compiler สร้างคำสั่งเดิน/กระโดดและส่ง demo (หลักฐาน E14)

• หน้า Home มี workKinds เฉพาะ arm/block แต่ไม่ใช่หลักฐานว่า Code ไม่มีการบันทึก เพราะ useCodeLab มี save/load ของตนเอง (หลักฐาน E15)

• merge ใช้ sampleMergeWorkspaces; native Save As จำกัด จึงยังไม่ใช่หลักฐานจัดการหลายไฟล์เต็มระบบ (หลักฐาน E16)

## 6) ขอบเขตและข้อจำกัด

อ่าน knowledge index ก่อนและไฟล์ตรงครบ 27 ไฟล์ ไม่ค้นนอกขอบเขต ไม่อ่านเอกสารเดิมหรือ AdventureMode.tsx จึงแก้เฉพาะข้อสรุปใน brief ไม่ได้ตาม engineAdapter, poseEditing, WorksScreen, nativeWorkspaceView, preview, host service/C++ จึงไม่รับรอง validation/calibration/persistence/hardware end-to-end

ผลอ่านเดิมไม่ได้แก้ code หรือรัน build/tests/UI/hardware จึงไม่รับรอง release

## หลักฐาน

ตำแหน่งอ้างอิง E แต่ละรายการอยู่ใน [หลักฐานของเอกสารนี้](source-review-001-evidence.md)

ตำแหน่งบรรทัดเพิ่มเติมที่รายงานเดิมอ้างในบริบทเดียวกัน: :61, :57, :65, :56, :137, :231, :259, :283, :299, :337, :37, :45
