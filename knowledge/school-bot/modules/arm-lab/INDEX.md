---
module: arm-lab
updated: 2026-11-06
status: draft
depends_on: [app-shell, my-work]
target: school-bot
platform: desktop
os: [windows, mac]
---

# Arm Lab (สารบัญ module)

เป้าหมาย: นักเรียน ป.1–6 สอนท่าแขนกล 6 ข้อต่อ แล้วเล่นเป็นลำดับ กับหุ่น Raspberry Pi ผ่าน USB · ครูตั้งค่าขั้นสูงในโหมดครู

ข้อมูลจากระบบเก่า (`~/Documents/School Bot/Handoff`) นำเข้ามาไว้ใน module นี้ครบแล้ว (2026-10-21) **knowledge เป็นแหล่งความจริง** ไม่ต้องเปิดโฟลเดอร์เดิม · บริบทร่วมโปรเจกต์: `../../context.md` · brand: `../../brand.md`

## ไฟล์ (อ่านเฉพาะที่งานต้องใช้)

| ไฟล์ | อ่านเมื่อ |
|---|---|
| requirements.md | ต้องรู้ว่าต้องทำอะไร (R1–R17, กฎ, ตัวเลข/ขีดจำกัด, edge case) |
| oq.md | ต้องรู้ว่ามีอะไรยังไม่ตัดสิน (OQ1–OQ103) |
| feasibility.md | ผล feasibility รวม (ruler 2026-10-21) + ตารางผลรายข้อ + เงื่อนไขหลัก + สถานะที่ขาด (H1/H5/H9) + BUG ของ frame ฐาน (ข้อมูล BUG/EDIT จาก Architect เดิม) |
| feasibility/R1.md | R1, R2, R3, R10: ฐาน 6A, โปรโตคอล Pi, แขนบนจอไม่ขยับ, ป.1–6 (ARC-I04, DEV-Q02) |
| feasibility/R4.md | R4: โหมดครู (SCR-14, SCR-15, ST-26) |
| feasibility/R5.md | R5, R11, R16: ปุ่มหยุด, เชื่อมต่อหุ่น, หลุด/เชื่อมกลับ (SCR-12/13, ตาราง ST-19–24/48, ARC-I31, DEV-Q15) · ตรวจใหม่ 2026-11-04 ทางเข้าไฮไลต์ (OQ30–OQ34) · รอบ 3–6 · รอบ 7 (2026-11-05) R16 modal หลุด/เชื่อมกลับเอง (OQ64–OQ69) · รอบ 8 (2026-11-05) ตรวจบรรทัด "แก้ 2026-11-05" + รายการเกลา requirements.md 26 จุด (OQ71–OQ78) · รอบ 9 (2026-11-06) R16 ฉากหลัง offline คลุมปุ่มหยุด / dialog lab เว้น nav (OQ79–OQ84) · รอบ 10 (2026-11-06) ปุ่มหยุดใน dialog / ประคองแขน vs เมนู (OQ85–OQ89) · **ท้ายไฟล์: รอบ 11 (2026-11-06) แถบเหลือง / ประคองแขนปิดได้ (OQ90–OQ92)** |
| feasibility/R6.md | R6–R9: บันทึก cloud, export .ini, กู้คืนสำรอง, นำเข้า (เทียบ my-work) |
| feasibility/R12.md | R12–R15, R17: ท่า, ข้อต่อ/ขีดจำกัด, แก้/อ่านท่า, การเล่น, เมนูและคีย์ลัด |
| design/ | แก้หรือตรวจ design (D1 มือคีบ % · D2 หน้าเชื่อมต่อ · D4 หุ่นหลุด/ต่อกลับ · ดูตาราง Design) |
| review.md | ดูผลตรวจ (รอบ 2026-11-06 D4 โดย highlighter · รอบ 2026-11-04 D1 โดย highlighter · รอบ 2026-10-21 นำเข้าผล Auditor เดิม AUD-F01, F02, F07–F09) |
| handoff.md | ส่งต่อ dev (ยังไม่มี) |

## Canvas

สร้าง canvas: session หลักเท่านั้น · ไม่มี C# ที่ใช้ได้ → ถามผู้ใช้ก่อนเริ่มงานทุกครั้ง (กฎ "ไม่มี canvas" ใน CLAUDE.md) · สิทธิ์: private / shared (shared ต้องได้รับอนุมัติก่อน publish)

| ID | ชื่อ | ลิงก์ | สิทธิ์ | ใช้กับ |
|---|---|---|---|---|
| C1 | School Bot – หน้าควบคุมแขนกล (ประถม) (Canvas A) | https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd | shared ในองค์กร (ผู้ใช้เป็นเจ้าของ · `read` ได้ 2026-11-04) | R1–R17 · frame ของ Arm Lab: MainV6A (FRM-02) + component, TeacherLoginV1 (FRM-04), ConnectV3 (FRM-06), TeacherV5A (FRM-08) · **D1** (แก้ที่ MainV6A + MainV6AJoints + MainV6ASeq + MainV6ABar) · **D2** (ConnectV3 + wrapper Many/Connected/Fail2) · **รอบ 2 nav bar (2026-11-04): MainV6A/MainV6ATopBar รวมเป็นแถบ N1 สูง 60 (WindowBarV1 nav=n1) + พื้นที่ 840 · เอาการ์ดอุปกรณ์ใน body ออก ขยายเวที · TeacherLoginV1/TeacherV5A = N1 แบบเชื่อมต่อ · **ConnectV3 ไม่ถูกแตะ** (ผู้ใช้แก้อีกแชท · WindowBarV1 คงโหมดแถบเก่า 44 ให้) · publish แล้วที่ C1 v757 (2026-11-04 · ผู้ใช้อนุมัติ · ยังไม่ได้เปิดดู render จริง) · **ConnectV3 + wrapper แก้ตาม D2 แล้ว ใช้ DS (`ds/school-bot/tokens.css`, `bundle.css`) + WindowBar N1 · C1 v758 (2026-11-04)**** |
| C2 | School Bot – Arm Lab หุ่นหลุด/ต่อกลับ (C2) | https://claude.ai/artifact/C8knAvyREPQhD6pe9wDaYn | private (ผู้ใช้เป็นเจ้าของ · สร้างโดย session หลัก 2026-11-06) | R5, R11, R14, R16, R17 · **D4** publish v20 `1793951067-ed9c` (2026-11-06 · ModalFoundPort ไอคอน `triangle-alert` ตาม OQ103 · v19 แก้ตาม review F1–F22 + OQ96–OQ101 · DS v21 ติดตั้งที่ `ds/school-bot/`): Main (modal หลุด), ModalNoReply, ModalNoReplyStopped, ModalPortGone, MenuOverStop, ModalFoundPort, ModalOtherRobot, ModalAutoFail, BannerLost, BannerStopPressed, BannerNoReply, BannerNoReplyStopped, BannerReduced, BackAsk, BackAskArmWeak, BackGoing, BackStopped, BackFailed, BackAskStopped, HoldArm, BannerArmWeak, NavChips + component ArmShell (หน้า Arm Lab ย่อจาก MainV6A) |

หมายเหตุ C1: canvas นี้มี frame ของ module อื่นด้วย (HomeV6A + HomeRail + WindowBarV1 สำเนา → `app-shell` · MyWorkV1/MyWorkV1Block → `my-work` · LearnMapV1 → `quiz`) → กฎ "1 canvas อยู่ใน module เดียว" ลงทะเบียนไว้ที่ module นี้ก่อน · รอผู้ใช้ตัดสินถ้าต้องแยก canvas
canvas อื่นในระบบเก่า (ยังไม่ลงทะเบียน): Canvas B เข้าระบบ+บทเรียน (WindowBarV1 ต้นฉบับ) · Canvas C Block Studio · ARCHIVE ของ Canvas A (46 ไฟล์ฉบับเก่า) · ดู `app-shell`, `block-lab`

## งานออกแบบเดิม (frame จากระบบเก่า · ยังไม่ลงทะเบียนเป็น D#)

| FRM | ชื่อ / ไฟล์ | สถานะในระบบเก่า | หมายเหตุ |
|---|---|---|---|
| FRM-02 | 6A · Arm Lab MainV6A.dc.html (327 KB) + component MainV6ATopBar, MainV6AStage → MainV6ABar, MainV6AJoints, MainV6ASeq | **Done** (ผู้ใช้อนุมัติ 2026-10-21 หลัง CR-05 + EDIT-07) · EDIT-09 แถบหน้าต่าง + เวที 768 รอตรวจบน canvas | ฐาน frame (อนุมัติแล้ว DEC-08) · แก้ผ่านใบสั่งแก้เท่านั้น · ST-21 ใช้ modal หลุด/ต่อกลับของ R16 ใหม่ (D4) · ST-48 ถอดแล้ว (2026-11-04) |
| FRM-04 | login ครู TeacherLoginV1.dc.html (dialog) | **Done** (ผู้ใช้อนุมัติ 2026-10-21) · EDIT-09 รอตรวจ | Tweaks: ok/wrong/student/otherSchool/offKnown/offNew · ข้อมูลตัวอย่าง: โรงเรียนตัวอย่างวิทยา · ครูสมใจ (somjai.k) · น้องมายด์ |
| FRM-06 | เชื่อมต่อหุ่น ConnectV3.dc.html (73 KB) + wrapper Many/Connected/Fail2 | **Draft** · Auditor ตีกลับ (RETURN) · EDIT-10 รอผู้ใช้ตรวจ | ข้อมูลตัวอย่าง: หุ่นกลุ่ม 3 COM7 · หุ่นกลุ่ม 5 COM9 · Bluetooth COM3 · 115200/9600 bps · รหัส E-NOREPLY, E-BUSY · ต้องแก้ตาม CR-10, CR-11, AUD-F07/F08/F09 |
| FRM-08 | เมนูครู 5A TeacherV5A.dc.html (ฐาน SCR-15) | Draft (ฐานเดิม · Assume) · EDIT-03 เปิดที่หน้าเข้าแล้ว + ปุ่มออกจากโหมดครู | หน้า PIN ใน Tweaks ล้าสมัย ต้องลบ · ยังมี emoji เดิม · ทำได้ทุกเมื่อ (ไม่ขึ้นกับ DEV-Q) |
| FRM-07 | กู้คืนงานสำรอง (SCR-10) | ยังไม่สร้าง | module `my-work` |

ข้อควรรู้เมื่อแตะ frame: MainV6A มี logic/state ทั้งหมด (dialog กู้คืน/นำท่าจากงานอื่น/ออก/เริ่มใหม่, ลิ้นชักประวัติ, เมนูซ้อน) ส่ง `vals6` ให้ component ลูก · CSS `.sc-host` = display:contents · ตรวจ emoji ด้วย `tools/check_emoji.py` ของ skill schoolbot-design (ไม่อยู่ใน repo นี้) · แยก component เกิน ~150 KB (ดู `../../context.md` บทเรียน canvas)

## ติดตาม R → D → OQ

D1 (มือคีบ % · R13/R15) มีแล้ว · D2 (หน้าเชื่อมต่อหุ่น · R5/R11/R16) แก้ frame และ publish แล้ว (C1 v758 · 2026-11-04 · ใช้ DS v12 + WindowBar N1 ใน ConnectV3 เท่านั้น) · **D4 (หุ่นหลุด/ต่อกลับ · R16/R5/R14/R11/R17) publish C2 v20 2026-11-06 (แก้ตาม review + OQ102/OQ103)** · R# อื่นยังไม่มี D# (R1–R4, R6–R10, R12 · R13–R15/R17 มีบางส่วน) → ยังไม่ `designed` · frame ที่เกี่ยวข้องดูตารางด้านบน

| Req | สรุป | Design | OQ |
|---|---|---|---|
| R1 | ใช้ 6A แขนกล (MainV6A) เป็นฐาน | - | OQ1, OQ20 |
| R2 | หุ่น Raspberry Pi (ใกล้เคียง Zide) | - | OQ1, OQ12, OQ14 |
| R3 | แขนบนจอไม่ขยับ | - | - |
| R4 | โหมดครู (login ครูโรงเรียนเดียวกัน) | - | OQ6, OQ7, OQ8, OQ9, OQ10, OQ12, OQ19 |
| R5 | ปุ่มหยุด · เตือน · ปิดปุ่มเมื่อหลุด | D2 (publish C1 v758) · D4 (C2 v20) | OQ11, OQ14 · answered: OQ102, OQ96, OQ97, OQ99, OQ95, OQ93, OQ85, OQ88, OQ89, OQ79, OQ80, OQ71, OQ73, OQ77, answered: OQ15, OQ26, OQ29, OQ31, OQ36, OQ39, OQ43, OQ45, OQ47, OQ50, OQ53 |
| R6 | บันทึกบน cloud | - | OQ2, OQ3, OQ8, OQ21 |
| R7 | export .ini | - | OQ22 · answered: OQ3, OQ54 (ก) |
| R8 | กู้คืนสำรองในเครื่อง | - | OQ2, OQ3, OQ21 |
| R9 | นำเข้า .ini (?) | - | OQ4, OQ22 |
| R10 | UI เดียว ป.1–6 · WCAG 2.2 AA | - | OQ8, OQ17, OQ20 |
| R11 | เชื่อมต่อหุ่น USB · สถานะ | D2 (publish C1 v758) · D4 (ชิป N1 หลุด/กำลังเชื่อมต่อ · Attention Ring · C2 v20) | OQ5, OQ14, OQ27 (DS ที่เหลือ), OQ34 (DS gap), OQ61 · answered: OQ99, OQ100, OQ93, OQ94 (DS v20), OQ90, OQ92 · answered: OQ85, OQ80, OQ84, OQ73, OQ74, OQ75, OQ76, OQ78 (DS v16), OQ25, OQ26, OQ28–OQ33, OQ36, OQ38, OQ39, OQ41, OQ43–OQ49, OQ54, OQ55, OQ57, OQ58, OQ64, OQ65, OQ70 |
| R12 | ท่าและท่าชุด (G####/K####, ท่า 0, เลิกทำ 6 วินาที) | - | OQ11, OQ17, OQ20 |
| R13 | ข้อต่อและขีดจำกัด (±180/±135/0–100%, 1000–9000 ms) · มือคีบเป็น % ไม่มีองศา/เลข 0 กลางแถบ | D1 | OQ17, OQ22, OQ23, OQ24 |
| R14 | แก้ท่า · อ่านท่าปัจจุบัน · ประวัติ | D4 (เฉพาะหน้าจอประคองแขน + ปลดล็อกข้อต่อปิด · C2 v20) | OQ1, OQ12, OQ17, OQ18 · answered: OQ98, OQ93, OQ91, OQ92 · answered: OQ87, OQ83, OQ71, OQ72, OQ74, answered: OQ52, OQ58 |
| R15 | การเล่น (popup ขยับครั้งแรก, ช่วงท่า, รอบ, รายการก้าวไกล 30° ไม่นับมือคีบ) | D1 | OQ1, OQ11, OQ14, OQ60 · answered: OQ86, OQ82, OQ84, OQ71, OQ72, OQ77, answered: OQ16, OQ24, OQ43–OQ46, OQ50–OQ52, OQ56, OQ57 (ค ท่าพัก = ท่า 0 รอ OQ11), OQ58, OQ67 |
| R16 | หุ่นหลุดและเชื่อมกลับ (ST-21 · modal หลุด/ต่อกลับ) | D2 (publish C1 v758) · D4 (publish C2 v20) | OQ11, OQ14, OQ18, OQ40 (ถ้อยคำ), OQ61 · answered: OQ102 (ร่าง D4), OQ103 (DS gap ปิด), OQ96–OQ101, OQ95, OQ93, OQ94, OQ90, OQ91, OQ92 · answered: OQ85–OQ89, OQ79–OQ84, OQ69 (DS v16), OQ73, OQ75, OQ76, OQ78 (DS v16), OQ15, OQ16, OQ25, OQ26, OQ28–OQ33, OQ35–OQ39, OQ41, OQ43–OQ53, OQ57, OQ58, OQ62–OQ68, OQ70 |
| R17 | เมนู ☰ และคีย์ลัด | D4 (เฉพาะไม่มี Esc บน modal R16 + เมนู ☰ ซ้อน dialog ไม่ทับปุ่มหยุด · C2 v20) | answered: OQ97, OQ86 (คีย์ลัด nav ขณะ dialog เปิด = เลือกเมนู), OQ81, OQ82, OQ13, OQ15, OQ73, OQ74 |

## Design

| ID | ครอบคลุม | ไฟล์ | Canvas | Artboard | Publish | อัปเดต |
|---|---|---|---|---|---|---|
| D1 | R13, R15 (มือคีบ S5 เป็น %, ข้อความเก็บนิ้ว) | design/D1-gripper-percent.md | C1 | MainV6A (ฐานของ frame), MainV6AJoints, MainV6ASeq, MainV6ABar | publish แล้ว (C1 v756) | 2026-11-04 |
| D3 | R5, R11, R14, R15, R16 (demo เชื่อมหุ่นกลับ: Modal ตรวจตำแหน่งแขน แทน popup ขยับครั้งแรก · ผู้ใช้ตัดสิน 2026-11-05) | design/D3-reconnect-demo.md | Artifact แยก (ไม่ใช่ C1) | https://claude.ai/artifact/WYjPc8w5Kv1SmT8LNEwJKs (private · v1) | 2026-11-05 |
| D4 | R16, R5, R14, R11, R17 (หุ่นหลุด/ต่อกลับ: modal หลุด/หุ่นไม่ตอบ/พบหุ่นที่พอร์ต/หุ่นตัวอื่น · แถบเหลือง `sb-banner-warn` · ต่อกลับแล้ว→ท่าพัก/หยุด/ไม่สำเร็จ · ประคองแขน · ชิป N1) | design/D4-disconnect-reconnect.md | C2 | 22 artboard + ArmShell (ดูตาราง Canvas) | publish แล้ว (C2 v20 `1793951067-ed9c` · DS v21 · ยังไม่ได้เปิดดู render) · แก้ตาม review 2026-11-06: F1–F12, F14, F15, F19, F21, F22 แก้แล้ว · F13/F18 บางส่วน · F16/F17 ค้าง (requirement/DS) · F20 ไม่ทำ · ไม่มี DS gap (OQ103 ปิด: `warn` + `triangle-alert`) · OQ102 ร่าง (1)–(5) ตัดสินแล้ว · ค้าง OQ40 | 2026-11-06 |
| D2 | R11, R16, R5 (หน้าเชื่อมต่อหุ่น: แถบปุ่มล่างตายตัว, แตะการ์ดเลือก, ชื่อเดียว, AUD-F02/F07/F08/F09, CR-11) | design/D2-connect-actions.md | C1 | ConnectV3 (FRM-06) + wrapper Many/Connected/Fail2 | publish แล้ว (C1 v758 · DS v12 · 2026-11-04 · ยังไม่ได้เปิดดู render จริง) · OQ42: เปลี่ยนหุ่นไม่มี guard (MainV6A, C1 v763) | 2026-11-04 |

## ขั้นถัดไปที่ระบบเก่าวางไว้
1. ~~Designer: D4 modal หลุด/ต่อกลับ บน canvas ใหม่~~ ทำแล้ว (C2 v18 · 2026-11-06 · OQ95 ทำแล้ว · รอ OQ40 แล้วยกเข้า MainV6A ด้วยใบสั่งแก้) · แก้ ConnectV3 (AUD-F07, F08) · ST-48 ถอดแล้ว
2. Designer: แก้แถบหน้าต่างที่ต้นฉบับ (CR-10 ทาง ก) แล้วสำเนามา Canvas A · FRM-08 เมนูครู (ลบหน้า PIN ใน Tweaks, ตัด emoji)
3. ผู้ใช้: ตรวจ EDIT-09/EDIT-10 บน canvas · ตอบ OQ11 กับ firmware

## สถานะ
- **2026-11-06 (crayon · D4 ตาม OQ102/OQ103):** publish C2 v20 (`1793951067-ed9c`) แก้เฉพาะ `ModalFoundPort` (ไอคอน plug → `triangle-alert` ในกล่อง `sb-dialog-ico warn`) · ร่าง OQ102 (1)–(5) เป็นข้อตัดสินใน D4 · ไม่มี DS gap · สถานะคง `approved` (R# อื่นยังไม่มี D#) · ไม่แตะ C1
- **2026-11-06 (crayon · D4 แก้ตาม review + OQ96–OQ101):** publish C2 v19 (`1793950755-2a41`) · DS v21 (`1793949954-61ae`) ติดตั้งแทน v20 · F1 สูง แก้แล้ว (ปุ่มหยุดใน modal ต่อกลับแล้ว) · artboard ใหม่ 7 (ModalNoReplyStopped, ModalPortGone, MenuOverStop, ModalAutoFail, BannerNoReplyStopped, BannerReduced, BackAskStopped) · DS gap 1 → OQ103 `open` (ไม่ block) · ร่างถ้อยคำ/วิธีแสดง → OQ102 `open` (agent ไม่มี AskUserQuestion → session หลักถาม) · ค้าง F13 บางส่วน, F16, F17, F18 · สถานะคง `approved` (R# อื่นยังไม่มี D#) · ไม่แตะ C1
- **2026-11-06 กลับ `draft`:** แก้ R11/R16 ตาม review D4 (OQ96, OQ101, F11) · DS v21 (OQ97–OQ100) · **ผู้ใช้ยืนยัน `approved` 2026-11-06** → crayon แก้ D4
- **2026-11-06 (highlighter · review D4 บน C2 v18):** **ไม่ผ่าน · สูง 1 · กลาง 11 · ต่ำ 10** · สูง = F1 modal "ต่อกลับแล้ว" ไม่มีทางกดหยุดขณะหุ่นเชื่อมอยู่และไม่รู้ว่าขยับหรือไม่ (OQ96) · DS gap 1 (tooltip ชิดขอบ + spinner 16 · OQ100) · DS ขัดกัน 3 (Dialog focus/aria-modal vs nav OQ97 · Banner 14 vs คำเตือน 16 OQ98 · reduced-motion สั่น = วงนิ่ง OQ99) · ถ้อยคำ checkbox ไม่มีมือคีบ OQ101 · เปิด OQ96–OQ101 `open` (session หลักถาม) · requirements: เกลา R11 vs R16 (body ใช้ได้/ไม่ได้ขณะแถบ) · สถานะคง `approved` · ดู review.md รอบ 2026-11-06
- **ข้ามขั้น 2026-11-06:** ส่ง highlighter ตรวจ D4 (C2 v18) ทั้งที่สถานะยัง `approved` (ยังไม่ `designed` เพราะ R# อื่นยังไม่มี D#) · ผู้ใช้สั่ง
- **2026-11-06 (crayon · D4 แก้ตาม OQ95):** publish C2 v18 (`1793948754-ebdd`) · แก้เฉพาะ `ArmShell.dc.html`: เลิก `inert` ใน body ขณะแถบเหลืองแสดง · control ทุกตัว `aria-disabled` + `sb-tip` เหตุผล ยัง Tab ได้ · WCAG 2.4.11 = ข้อยกเว้นที่ผู้ใช้อนุมัติ · ปุ่มหยุดที่มุมคงเดิม · ไม่มี DS gap · สถานะคง `approved` (R# อื่นยังไม่มี D#) · ไม่แตะ C1
- **2026-11-06 กลับ `draft`:** แก้ R16 ตาม OQ95 (ยอมรับไม่ผ่าน WCAG 2.4.11 ปุ่มใต้แถบเหลือง) · ไม่กระทบ feasibility (ข้อยกเว้น a11y ที่ผู้ใช้อนุมัติ) · **ผู้ใช้ยืนยัน `approved` อีกครั้ง 2026-11-06**
- **2026-11-06 (crayon · D4 แก้ตาม OQ93/OQ94):** publish C2 v17 (`1793948033-1974`) · DS v20 ติดตั้งแทน v18 · "เชื่อมหุ่น" ใช้ Attention Ring `sb-ring sb-ring-robot sb-ring-inset` · ตัดร่างเลื่อน padding แถบลอยทับ body + ปิด control ใน body ทุก artboard ที่มีแถบ (ยกเว้นปุ่มหยุดที่มุม) · ไม่มี DS gap · OQ95 `open` (วิธีปิด control: `inert` vs โฟกัสได้) · สถานะคง `approved` (R# อื่นยังไม่มี D#) · ไม่แตะ C1
- **2026-11-06 (crayon · D4 บน C2):** publish C2 v16 (15 artboard + component ArmShell · DS v18) · DS gap 1 ข้อ (Attention Ring ของปุ่ม "เชื่อมหุ่น" · ใช้ `sb-btn-primary` แทน) · DS ขัดกัน 3 ข้อ → OQ94 · ข้อตัดสินร่าง 9 ข้อ (รวมวิธีทำ OQ90) → OQ93 `open` (agent ไม่มี AskUserQuestion → session หลักถาม) · สถานะคง `approved` (R# อื่นยังไม่มี D#) · ไม่แตะ C1
- **2026-11-06 ผู้ใช้ยืนยัน `approved`** หลังตอบ OQ90–OQ92 (ruler รอบ 11) · OQ90 = ข้อกำหนดถึง crayon (แถบลอยต้องไม่บัง control ที่ใช้ได้) · ต่อไป: สร้าง C2 + crayon ทำ D4 · ยังค้าง: app-shell R2/R5, `system/spec.md`
- **2026-11-06 (ruler รอบ 11 · แถบเหลือง OQ89 + ประคองแขนปิดได้ OQ87):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม `approved`** (status คง `draft`) · ไม่มี DS gap · OQ85/86/88 ข้อความใน requirements ตรงแล้ว · ไม่เหลือข้อความ "ไม่มีแถบเหลือง" · เปิด OQ90–OQ92 `open` (agent ไม่มี AskUserQuestion → session หลักถาม) · **ก่อน approved:** OQ91 (ปิดประคองแขนด้วยเมนู → modal หลุด) · OQ92 (คำเตือนแขนอ่อนหายเมื่อเชื่อมกลับ/ออกจาก Arm Lab · แถบบนหน้าเชื่อมต่อ) · **ก่อน designed:** OQ90 (แถบลอยบัง body · WCAG 2.4.11) · รายการเกลาข้อความ: `feasibility/R5.md` "รอบ 11" ข้อ 3 · app-shell R# "ประคองแขนตามทุกหน้า" ไม่ต้องทำแล้ว
- **2026-11-06 (ผู้ใช้ตอบ OQ85–OQ89 + ภาพอ้างอิงแถบเตือน):** ปิดหน้าจอเตือนการหลุดแล้ว = disable + แถบเหลือง `sb-banner-warn` (DS v18) · เชื่อมกลับ = modal ต่อกลับแล้วทุกครั้ง ไม่มีแถบเขียว · หน้าจอประคองแขนปิดได้ ปลดล็อกข้อต่อใช้ไม่ได้จนเชื่อมใหม่ · แก้ R5/R14/R16 · OQ ก่อน approved ตอบครบ · สถานะคง `draft` · ต่อไป: ruler ตรวจเฉพาะส่วนที่ต่างจากข้อเสนอ (แถบเหลือง, OQ87) แล้วผู้ใช้ยืนยัน `approved` · ยังค้าง: app-shell R2/R5, `system/spec.md`
- **2026-11-06 (ruler รอบ 10 · ตรวจผลคำตอบ OQ79–OQ84 + design-taste ข้อ 19):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม `approved`** (status คง `draft`) · ไม่มี DS gap ที่ยืนยันได้ (อ่าน DS v17 ตรงไม่ได้ · ต้องตรวจ 4 ข้อก่อนออกแบบ) · เปิด OQ85–OQ89 `open` (agent ถาม AskUserQuestion ไม่ได้ → session หลักถาม) · **ก่อน approved:** OQ85 (ชื่อปุ่ม nav ที่สั่น "เปลี่ยนหุ่น" vs "เชื่อมหุ่น") · OQ86 (ปิด dialog ด้วยเมนู = ปุ่มใด · หุ่นกลับมาขณะ dialog จากเมนูเปิด · คีย์ลัด nav) · OQ87 (หน้าจอประคองแขนถูกกติกา OQ82 ปิด) · OQ88 (ปุ่มหยุดใน dialog โผล่/หาย/dropdown บัง) · **ก่อน designed:** OQ89 (วิธีหยุดทางกายภาพหลังปิด modal) · รับข้อเสนอแรกทั้งหมด = ไม่ต้อง ruler ตรวจซ้ำ · ดู `feasibility/R5.md` "รอบ 10"
- **2026-11-06 (ruler รอบ 9 + ผู้ใช้ตอบ OQ79–OQ84):** ฉากหลัง dialog lab เว้นเฉพาะ nav (เลิกตัดมุมปุ่มหยุด · design-taste ข้อ 19) · dialog ขณะหุ่นขยับมีปุ่มหยุดในตัว · ปุ่มหยุดปิดตอนสายหลุด · เลิก Esc บน modal R16 · แก้ R1/R5/R14/R15/R16/R17 · DS v17 · สถานะคง `draft` · ต่อไป: ruler ตรวจรอบ 10 (คำตอบต่างจากข้อเสนอ ruler) · ยังต้องแก้ app-shell R2/R5 และย้ายกติกาข้าม lab ไป `system/spec.md`
- **2026-11-06 (ruler รอบ 9 · R16 ส่วนที่แก้วันนี้):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม `approved`** (status คง `draft`) · ไม่มี DS gap ใหม่ · เปิด OQ79–OQ84 `open` (ถาม AskUserQuestion ไม่ได้ใน agent → session หลักถาม) · **ก่อน approved:** OQ79 (หุ่นไม่ตอบแต่สายเสียบ ปุ่มหยุดถูกคลุม) · OQ80 (ปุ่มหยุดหลังปิดไว้ก่อน) · OQ81 (Esc ขัดกัน) · OQ82 (กด nav ขณะ dialog lab เปิด · leave guard ถูกซ่อนใต้ modal หลุด · คำสั่งค้าง) · OQ83 (หน้าจอประคองแขน vs nav) + session หลักเกลา R5/R15/R1/R16/R17 และ app-shell R2/R5 (`feasibility/R5.md` รอบ 9 ข้อ 3) · **ก่อน designed:** OQ84 · ตรวจ `Dialog/README.md` v16 เรื่องลำดับ focus ของ dialog ที่ nav กดได้ · OQ ฝั่ง dev/firmware ไม่เปลี่ยน
- **2026-11-06 (เติม DS gap · สถานะกลับเป็น `draft`):** ผู้ใช้ตัดสิน DS gap 3 ข้อ · เติม DS v16 แล้ว: `sb-scrim-lab` เริ่มใต้แถบ nav ทุก dialog lab · variant `sb-scrim-lab-offline` คลุมปุ่มหยุดขณะหุ่นหลุด (modal หลุด/หุ่นตัวอื่น) · `.sb-btn.is-shake` ±`space-1` (OQ78) · **ไม่เติม `sb-progress`** ใช้ `sb-spin` · แก้ R16 (ฉากหลัง/ปุ่มหยุดขณะหลุด/spinner) → `draft` ตามกฎ · ต่อไป: ruler ตรวจ R16 ส่วนที่แก้ (ความปลอดภัย: ปุ่มหยุดถูกคลุมขณะหลุด) → ผู้ใช้ยืนยัน `approved` → สร้าง C2 + D4
- **2026-11-05 (ruler รอบ 8 + เกลา):** ทำได้มีเงื่อนไข · ผู้ใช้ตอบ OQ71–OQ78 ตามข้อเสนอ · เขียน R5, R11, R14, R15, R17 ใหม่เป็นเนื้อเดียว (ฉบับเดิม `archive/2026-11-05_arm-lab-req-before-cleanup.md`) · ไม่มี OQ ที่ block approved (ที่เปิดเหลือเป็นเรื่อง dev/firmware/DS) · **ผู้ใช้ยืนยัน `approved` 2026-11-05** · ก่อนส่ง dev ต้องตอบ OQ ฝั่ง dev/firmware · DS ที่ต้องเติมก่อนออกแบบ: `sb-progress`, variant `sb-scrim-lab` (OQ69), keyframe สั่นปุ่ม (OQ78)
- **2026-11-05 (ruler รอบ 8 · รอบสุดท้ายก่อน approved):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม `approved`** (status คง `draft`) · เปิด OQ71–OQ78 `open` (ถาม AskUserQuestion ไม่ได้ใน agent → session หลักถาม) · **ก่อน approved:** OQ71 (เล่นจากบอร์ดแล้วแอปสั่งซ้อน) · OQ72 ก (slider หลังท่าพักแก้ท่าไหน) · OQ73 (ออก/Esc ขณะ modal หลุด · เปลี่ยนไฟล์ = ตัดการเชื่อม) + session หลักเกลา requirements.md (ข้อความเดิมสั่งตรงข้ามบรรทัดแก้ · รายการ 26 จุดใน `feasibility/R5.md` รอบ 8 ข้อ 3) · **ก่อน designed:** OQ72 ข, OQ74–OQ77, OQ78 (DS gap ปุ่มสั่น), OQ27, OQ40, OQ69, OQ17 (1–5), OQ18 (3) · **ก่อนส่ง dev:** OQ1, 4, 5, 6, 9, 10, 11, 12, 14, 19, 21, 22, 60, 61, OQ57 ค · OQ เดิมที่เปิด 17 ข้อไม่ block approved · OQ17 (6) ย้ายไป OQ74
- **2026-11-05 (ปิด OQ ค้าง):** ผู้ใช้ตอบ OQ13, OQ41, OQ50, OQ52, OQ54–OQ58 · ปิดแบบถูกแทนที่ OQ29, OQ38, OQ39, OQ53, OQ59 · แก้ R7, R11, R14, R15, R17 (บรรทัด "แก้ 2026-11-05") · **OQ ที่ยังเปิดเหลือแต่เรื่อง dev/firmware/DS** (OQ1, 4, 5, 6, 9, 10, 11, 12, 14, 17, 18, 19, 21, 22, 27, 60, 61 · ท่าพัก=ท่า 0 ใน OQ57 ค) · ขั้นต่อไป: ruler ตรวจรอบสุดท้าย → ผู้ใช้ยืนยัน `approved`
- **2026-11-05 (R16 เขียนใหม่ · modal หลุด/ต่อกลับ):** ruler รอบ 7 ทำได้มีเงื่อนไข · ผู้ใช้ตอบ OQ62–OQ70 แล้ว · เลิกแถบเหลือง · R16 เดิมย้ายไป archive · สถานะคง `draft` (ยังมี OQ ค้างรอบ 6 + OQ61 วิธีระบุหุ่นรอ dev) · DS ที่ต้องเติมก่อนออกแบบ: `sb-progress`, variant `sb-scrim-lab` เว้น nav (OQ69) · D3 demo ล้าสมัย · ต่อไป: สร้าง canvas ใหม่ (C2) + D4 โดย crayon
- **2026-11-05 (ruler รอบ 7 · R16 แก้ 2026-11-05 modal หลุด/เชื่อมกลับเอง):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม approved** (สถานะคง `draft`) · เปิด OQ64–OQ69 `open` (ถาม AskUserQuestion ไม่ได้ใน agent → session หลักถาม) · ก่อน approved: OQ64 (ระบุหุ่นเดิมไม่ได้) · OQ66 (ข้อความหยุด/ประคองแขนกับ modal) · OQ67 (ท่าพักใน modal vs ติ๊ก R15) + ของค้างรอบ 6 · ก่อน designed: OQ65, OQ68, OQ69 (DS gap) · requirements R11/R16 มีประโยค "เชื่อมกลับเองพักไว้" ค้าง (session หลักแก้) · OQ59 (D3) ควรปิด · ดู `feasibility/R5.md` "รอบ 7"
- **2026-11-04 (ruler รอบ 6):** ตรวจ R11/R14/R15/R16 ตาม requirements.md จริง · ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · **ยังไม่พร้อม approved** (สถานะคง `draft`) · เปิด OQ58 (ปลดล็อกข้อต่อ vs ข้อความ popup · slider ล็อก/ตำแหน่งไม่ทราบ · พับแขน/ตัดการเชื่อมต่อไม่อยู่ใน trigger · ปุ่มปิดตอนยังไม่เชื่อม · Arm Lab ไม่มีไฟล์) · OQ56 (ก, ข) และ OQ57 (ก) บันทึกเป็น "ตามที่ session หลักแจ้ง" (ไม่มีคำตอบดิบ) · **OQ ที่ยังเปิดก่อน approved:** OQ58 ก ค · OQ50 ก ค จ ฉ · OQ56 ค · OQ57 ข ง · OQ54 ก ค · OQ52 ก จ · OQ13 · เอกสารที่ยังอ้าง ST-48/ST-24 (D1, D2, app-shell, my-work, feasibility ฯลฯ) ดู `feasibility/R5.md` "รอบ 6" ข้อ 3 · หมายเหตุ: บรรทัด "การเปลี่ยนสถานะ ... ตอนนี้ approved" ด้านล่างล้าสมัย (status จริง = draft) และตาราง FRM-02/ขั้นถัดไป ข้อ 1 ยังเป็นฉบับก่อน CR-11 ใหม่
- **2026-11-04 (ruler รอบ 5):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน) · บันทึกคำตอบ OQ50 (ข, ง) · OQ51 · OQ52 (ข, ค) · OQ53 (ก, ข) · OQ54 (ข) · OQ55 บางส่วน · **OQ ที่ยังเปิด:** OQ50 (ก, ค, จ, ฉ) · OQ52 (ก, จ, ตีความ ข) · OQ53 ค · OQ54 (ก, ค, นิยาม "ครั้งแรก") · OQ55 (พอร์ต/ผูกชื่อ) · OQ56 · OQ57 · OQ40 · ร่าง R14/R16 พร้อมบันทึก · R11/R15 บันทึกได้แบบมี ⟨OQ#⟩ แต่ยังไม่ควร approved · requirements.md ยังไม่ถูกแก้ · ดู `feasibility/R5.md` "รอบ 5"
- **2026-11-04 (ruler รอบ 3 · flow เชื่อมหุ่นแบบใหม่):** ผล feasibility **ทำได้มีเงื่อนไข** (ไม่เปลี่ยน · ความเสี่ยงความปลอดภัยสูงขึ้นเพราะถอดท่าพักบังคับ) · OQ43 answered (บันทึกคำตัดสินผู้ใช้ · แทนที่ OQ32/OQ35 คำตอบ/OQ36 ชิปสถานะกลาง/OQ37/OQ38/OQ33 ข้อ 4) · **OQ44–OQ49 `open`** (ความเร็วก้าวแรก · ขอบเขต popup · อายุ/รีเซ็ตติ๊ก · แถบเหลือง · ไฟล์อัตโนมัติ · ชื่อหุ่น) + OQ40 (ถ้อยคำถอดไฟ) ยังเปิด · ต้องตอบก่อน designed: OQ44–OQ48, OQ40 · requirements.md R11/R15/R16 ยังเป็นฉบับเก่า (session หลักแก้ → draft) · D1/D2 ต้องปรับ · ดู `feasibility/R5.md` "รอบ 3"
- **2026-11-04: สถานะกลับเป็น `draft`** เพราะแก้ R11/R16 (ทางเข้าแบบนำทางด้วยไฮไลต์ · OQ30) · **ruler ตรวจแล้ว 2026-11-04: ทำได้มีเงื่อนไข** (`feasibility/R5.md` หัวข้อ "ตรวจใหม่ 2026-11-04") · OQ31–OQ34 `open` (ข้อยกเว้น "กดที่ใดก็ตาม" · ST-48 อยู่ที่ไหน/ปุ่มกลับ · นิยามรอบ/สถานะ · DS gap) ถามผู้ใช้ด้วย AskUserQuestion ไม่ได้ในรอบ ruler → session หลักถาม · ไม่ block feasibility · ต้องตอบก่อน approved/designed · D1 และ D2 (publish บน C1 v758) ต้องปรับตามคำตอบ · ดู CHANGELOG 2026-11-04
- **2026-11-04 (ruler รอบ 2 · ความย้อนแย้ง/ความงงของเด็ก):** ผล feasibility คงเดิม ทำได้มีเงื่อนไข · เปิด OQ35–OQ41 `open` (ท่าพักซ้อนหลายที่ · สัญญาณพร้อมเล่น · popup หายเอง vs ค้าง · ระดับผ่อน · popup ดักการกด · ถ้อยคำถอดไฟ adapter · ชื่อหุ่น/logout) · OQ31, OQ32 answered แล้ว (บรรทัดบนเขียน open ล้าสมัย) · D2 ต้องปรับตาม OQ32/OQ35 · ดู `feasibility/R5.md` "ความย้อนแย้ง/ความงง รอบ 2"
- **2026-11-04 (ruler รอบ 4): ผู้ใช้ตอบ OQ44–OQ49 แล้ว (บางข้อมีช่องเหลือ) · OQ40 answered ส่วนวิธี · ยังไม่พร้อมบันทึก R11/R15/R16 ลง requirements.md เต็มรูป** เพราะมี OQ ที่ต้องตัดสินก่อนเขียน: OQ50 (ST-23 รวม/แยก · คำสั่งหลังติ๊ก · Esc) · OQ51 (ตำแหน่งไม่ทราบแต่ไม่รีเซ็ต) · OQ52 (เวลา/นิยามท่าพัก) · OQ53 (แถบทับ body บังอะไร · ดักการกดตอนหลุด) · OQ54 (ไฟล์: ทางเข้าอื่น/popup หุ่นเดิมใหม่) · OQ55 (ชื่อ "หุ่น" ซ้ำ) · ร่างข้อความ R11/R14/R15/R16 อยู่ท้าย `feasibility/R5.md` หัวข้อ "รอบ 4" (ยังไม่แก้ requirements.md) · ผล feasibility คง "ทำได้มีเงื่อนไข" · สถานะ `draft`
- DS gap รอบนี้ (OQ34 + รอบ 2: popup แถบลอย 4 แบบ · ชิปแดง/เขียว/สถานะกลาง): popup สั่น + reduced-motion · ฉากหลังดักการกดเว้นแถบ N1/ปุ่มหยุด + Dialog persistent · ชิปไฮไลต์พร้อมป้ายการกระทำ
- Feasibility: **ทำได้มีเงื่อนไข** (ruler 2026-11-04 · ตรวจใหม่ R13/R15 ส่วนมือคีบ % และ R11/R16 ส่วนทางเข้าไฮไลต์ (OQ30) · R# อื่นยึดผล 2026-10-21 · ดู feasibility.md · เสี่ยงสูงสุด R16/ST-48 ความปลอดภัยหุ่น)
- OQ ของ D2 (2026-11-04): OQ25, OQ26, OQ28 answered · OQ27 เติม DS แล้ว 4 ข้อ (v11) ที่เหลือ (แถบความคืบหน้า, select/input, การ์ดไม่กดได้, มาสคอตท่าอื่น) ใช้ของเดิมใน DS
- OQ ที่ยังเปิด (เพิ่ม 2026-11-04: OQ29 ข้อ 1, OQ31, OQ32, OQ33, OQ34): OQ1, OQ4, OQ5, OQ6, OQ9, OQ10, OQ11, OQ12, OQ13, OQ14, OQ17, OQ18, OQ19, OQ21, OQ22 (เปิด 2026-11-04 · มือคีบ %) · answered: OQ2, OQ3, OQ7, OQ8, OQ15, OQ16, OQ20 (3 ข้อหลังตอบ 2026-10-21 และแก้ requirements R1, R10, R12, R14–R16 แล้ว) · OQ23, OQ24 (ตอบ 2026-11-04 · แก้ R13/R15 แล้ว) · **ไม่มีข้อที่ block ผล feasibility** · ต้องตอบก่อนส่ง dev: OQ1, OQ11, OQ12, OQ14, OQ18, OQ22 · ที่เหลือใช้ข้อสมมติ Proposed ออกแบบต่อได้
- การเปลี่ยนสถานะ: ตอนนี้ `approved` (ทั้ง 2 ที่ · ผู้ใช้ยืนยัน 2026-11-06 หลังแก้ R11/R16 ตาม review D4)
- Review: highlighter ตรวจ D1 รอบ 2026-11-04 (ข้ามขั้น `designed`) · **ผล: ยังมีข้อ "สูง" 1 ข้อ (F1 R15 ST-23 ไม่มี UI เตือนก้าวไกล · ไม่ได้เกิดจาก D1) + กลาง 5 + ต่ำ 7** · สถานะคง `approved` (ไม่เปลี่ยนเป็น `reviewed`) · ดู review.md · รอบ 2026-10-21 นำเข้าผล Auditor เดิม RETURN: AUD-F01 สูง
- ข้ามขั้น: 2026-11-04 ส่ง highlighter ตรวจ D1 (R13/R15 มือคีบ) ทั้งที่สถานะยังเป็น `approved` (ยังไม่ `designed` เพราะมี D# เฉพาะ R13/R15) · ผู้ใช้สั่งให้ตรวจ
