# รายงาน as-built — 2026-10-21

มี 3 product modes: Block/Arm/Code แยกบทเรียนกับสร้างงาน เป้าหมายระบบเต็มคือคำยืนยันผู้ใช้ ไม่ใช่ผลรับรอง production รายงานนี้เป็น knowledge reference ไม่ใช่ DES/test verdict

เพื่อย่ออ้างอิง: F = app/frontend/src; C = F/modes/coding-adventure; W = F/modes/robot-control/workspace; E = app/internal/engine ทุกตำแหน่งด้านล่างเป็น path:line ภายใต้ cwd

## 1) เส้นทางบทเรียนและสร้างงาน

เมนูแยก Lessons/Code Lab/Block Lab/Arm Lab และ AppView render คนละ entry (F/app/appData.tsx:17, F/app/appData.tsx:27, F/app/AppView.tsx:232, F/app/AppView.tsx:246)

• บทเรียน: picker มี block|arm|code; Arm เปิด LearnMap ส่วน Block/Code เปิด LessonModeUnavailable แล้วย้อนเลือกได้ ไม่ได้หมายถึงไม่มีตัวเลือกหรือไม่มี Lab (C/lessonModes.ts:3, C/useLessonMode.ts:4, C/LessonsMode.tsx:7, F/components/coding-adventure/LessonModePicker.tsx:16)

• Arm lessons มี 7 stages แต่เริ่ม preset map4, cur=4, conn=connected; finishRun ให้ดาวใน state และ connectRobot ใช้ timer 1,400 ms ไม่ใช่การเชื่อมอุปกรณ์จริง (C/LearnMap.tsx:27, C/LearnMap.tsx:119, C/LearnMap.tsx:227, C/LearnMap.tsx:239, C/LearnMap.tsx:299)

• สร้าง Block: BlockMode เปิด Blockly มี move/jump/repeat → compile เป็น Command[] → program.run → เก็บ response เป็น JSON ให้ result panel; save/load ใช้ schema:1 กับ Blockly workspace (F/modes/block-programming/BlockMode.tsx:123, :173, :220, :238, :250, :274)

• สร้าง Code: CodeLabMode → AdventurePlayground/useCodeLab รับข้อความ DSL → program.run → commands/steps → GameCanvas เล่นฉาก Phaser; มี reset/save/load และตรวจ schema:1/source ตอน load (C/CodeLabMode.tsx:4, C/useCodeLab.ts:17, :35, :43, :65; F/components/coding-adventure/AdventurePlayground.tsx:86, :118; F/components/coding-adventure/GameCanvas.tsx:78)

• สร้าง Arm: เริ่ม works; มี connect/works/workspace/teacher; ArmWorkspace โหลด robot-control แล้วแยก Workspace(sample)/NativeWorkspace; newProject ล้างท่า/กลุ่ม แต่ไม่ได้อ่านการกดสร้างภายใน WorksScreen (F/modes/robot-control/RobotMode.tsx:18, :26, :41; W/ArmWorkspace.tsx:93, :201; W/WorkspaceLogic.ts:619, :631)

## 2) สิ่งที่ต่อ simulation/hardware ตามโค้ดที่อ่าน

| Mode | Simulation/ผลบนจอ | เส้นทาง hardware |
|---|---|---|
| Block | Blockly compile แล้ว demo ตรวจ commands และคืน simulated:true; ใน entry นี้ผลเป็น JSON ไม่ได้ส่งเข้า GameCanvas | manager ให้เฉพาะ program.run ผ่าน demo ไม่ใช่ zide |
| Arm | sample แยก workspace; มีปุ่ม ArmSimulator เฉพาะ sample แต่ไม่ได้อ่าน implementation ของ simulator | NativeWorkspace เรียก servo.set/read/torque, group.execute/download/run และ robotApi.stop ผ่าน transport; พบเส้นทางเรียก แต่ไม่ได้ยืนยันอุปกรณ์ตอบจริง |
| Code | demo parse hero DSL แล้ว GameCanvas เล่น move_right/move_left/jump | manager ให้เฉพาะ program.run ผ่าน demo ไม่มีเส้นทางคำสั่ง servo ใน mode นี้ |

หลักฐานตาราง: E/manager.go:43, :61; E/demo.go:23, :57, :65; F/modes/block-programming/BlockMode.tsx:224; F/modes/robot-control/RobotMode.tsx:44, :56; W/NativeWorkspace.tsx:117, :137, :231, :259, :283, :299, :337; F/components/coding-adventure/GameCanvas.tsx:78

preview=1 ใช้ runPreview/localStorage; native ใช้ Wails Run/SaveProject/LoadProject ไม่มี silent fallback; Arm sample เปิดด้วย preview หรือ scenario (F/core/client.ts:5, :55, :75; F/shell.tsx:23)

## 3) ความสามารถท่าและกลุ่ม Arm ที่มีหลักฐาน

• ท่า: มี handler เลือกท่า/ช่วง/หลายรายการ, duplicate, rename, delete; copy/cut/paste/ย้ายลำดับส่งต่อ poseEditing ซึ่งไม่ได้อ่าน จึงยังไม่ยืนยัน mutation/undo ภายใน (W/poseListActions.ts:39, :67, :111; W/workspaceMenuActions.ts:188; W/WorkspaceLogic.ts:451, :540)

• กลุ่ม: มีเลือกทั้งกลุ่ม พับ/ขยาย เล่นช่วง copy/delete/paste-after, ungroup พร้อม undo; rename จำกัด 20 ตัวอักษรและห้ามซ้ำ ยังไม่ได้ตาม flow สร้างกลุ่มใหม่ครบ (W/poseGroupActions.ts:28, :54, :95, :100; W/WorkspaceLogic.ts:380, :389, :443)

• กลุ่มใน UI อ้างสมาชิกด้วย keys และ playGroup เปลี่ยนช่วงเล่น; native upload กลับแปลงแต่ละ pose เป็น poseGroup ส่งครั้งละไม่เกิน 4 รายการ จึงไม่ควรเทียบ UI group กับ protocol group แบบหนึ่งต่อหนึ่ง (W/workspaceMenuActions.ts:7; W/WorkspaceLogic.ts:436; W/NativeWorkspace.tsx:249)

• Native มีส่งข้อต่อ/ท่า/ลำดับ เล่นหน่วยความจำตามจำนวนรอบ อ่านทีละข้อหรือครบ 6 ข้อเพื่อแก้/สร้างท่า บันทึก kind:zide-workspace/version:1; saveAs แจ้งว่ารองรับงานเดียว (W/NativeWorkspace.tsx:82, :160, :217, :325, :375, :397)

• ส่งสำเร็จไม่ยืนยันตำแหน่ง: move แสดงภาพคาดการณ์ตามเวลา ส่วน servo.read อ่านแยก; stop invalidate callbacks และ manager.Cancel รอ process เดิมจบ ยังไม่ยืนยัน physical stop (W/NativeWorkspace.tsx:67, :137, :278, :337; E/manager.go:115)

## 4) ชื่อ product เทียบ implementation IDs

| ความหมาย | ID/entry | Backend/engine |
|---|---|---|
| ตัวเลือกบทเรียน | block / arm / code | state ของ picker ไม่ใช่ engine ID |
| Lessons | coding-adventure → LessonsMode | entry นี้เลือกบทเรียน |
| Code Lab | code-lab → CodeLabMode | run/save/load ใช้ coding-adventure → demo |
| Block Lab | block-programming → BlockMode | block-programming → demo |
| Arm Lab | robot-control → RobotMode | robot-control → zide |

หลักฐาน: C/lessonModes.ts:3; F/app/appData.tsx:17; F/core/types.ts:1; F/shell.tsx:6; C/useCodeLab.ts:20, :37, :45; E/manager.go:43 จึงมี 3 product modes, 4 หน้าระดับบนที่เกี่ยวข้อง และ 2 engine IDs ใน routing ที่อ่าน ไม่ควรนับแทนกัน

## 5) ข้อสรุปเดิมที่ต้องแก้

• แก้อ้างอิง AdventureMode.tsx: entry ปัจจุบันคือ LessonsMode กับ CodeLabMode/useCodeLab แยกกัน ไม่ได้ยืนยันการลบไฟล์เก่า (F/app/appData.tsx:19, C/CodeLabMode.tsx:1)

• unavailable ใช้กับบทเรียน Block/Code; Lab ทั้งคู่มี run/save/load ตามข้อ 1

• ชื่อ arm_move/arm_jump ไม่ได้พิสูจน์ว่าบล็อกสั่งแขนจริง: compiler สร้างคำสั่งเดิน/กระโดดและส่ง demo (F/modes/block-programming/BlockMode.tsx:134, :225; E/demo.go:41)

• หน้า Home มี workKinds เฉพาะ arm/block แต่ไม่ใช่หลักฐานว่า Code ไม่มีการบันทึก เพราะ useCodeLab มี save/load ของตนเอง (F/home/homeData.ts:14, :21; C/useCodeLab.ts:35)

• merge ใช้ sampleMergeWorkspaces; native Save As จำกัด จึงยังไม่ใช่หลักฐานจัดการหลายไฟล์เต็มระบบ (W/WorkspaceLogic.ts:403, :492; W/NativeWorkspace.tsx:397)

## 6) ขอบเขตและข้อจำกัด

อ่าน knowledge index ก่อนและไฟล์ตรงครบ 27 ไฟล์ ไม่ค้นนอกขอบเขต ไม่อ่านเอกสารเดิมหรือ AdventureMode.tsx จึงแก้เฉพาะข้อสรุปใน brief ไม่ได้ตาม engineAdapter, poseEditing, WorksScreen, nativeWorkspaceView, preview, host service/C++ จึงไม่รับรอง validation/calibration/persistence/hardware end-to-end

ไม่แก้ไฟล์ ไม่รัน build/tests/UI/hardware ไม่รับรอง release ผู้คุมบันทึกผลต่อ

## Change Log

- 2026-10-21 — MYCELIUM บันทึกผล SA ตรวจ Block/Arm/Code จาก source โดยไม่รันทดสอบ
