---
module: arm-lab
design: D4
covers: [R16, R5, R14, R11, R17]
canvas: C2
updated: 2026-11-06
---

# D4 · หุ่นหลุด / ต่อกลับ: modal R16 + แถบเหลือง + ประคองแขน + ชิปบนแถบ N1

ที่มา: R16 (ฉบับ 2026-11-06 หลัง review) เป็นหลัก + R5 (ปุ่มหยุดใน dialog, ปุ่มหยุดปิดตอนสายหลุด) + R14 (หน้าจอประคองแขน, ปลดล็อกข้อต่อปิด) + R11 (ชิป/ปุ่ม "เชื่อมหุ่น" · แยก "ยังไม่เคยเชื่อม" กับ "หลุด") + R17 (ไม่มี Esc บน modal R16) · OQ79–OQ101 (answered) · review รอบ 2026-11-06 (F1–F22) · design-taste ข้อ 17 และ 19

## สถานะงาน
- **publish แล้ว: C2 version 20 (`1793951067-ed9c`) · 2026-11-06** · https://claude.ai/artifact/C8knAvyREPQhD6pe9wDaYn (private · ไม่แตะ C1) · v20 แก้เฉพาะ `ModalFoundPort` (OQ103: ไอคอนหัว plug → `triangle-alert` ในกล่อง `sb-dialog-ico warn`) · ร่าง OQ102 (1)–(5) ผู้ใช้รับทั้งหมด = ตัดสินแล้ว (ไม่ต้องแก้ canvas)
- ไฟล์ที่เปลี่ยนใน v19 (แก้ตาม review 2026-11-06 + OQ96–OQ101 + DS v21): `ArmShell`, `BackAsk`, `ModalNoReply`, `Main`, `ModalFoundPort`, `ModalOtherRobot`, `HoldArm`, `BackGoing`, `NavChips`, `canvas.json`, `ds/school-bot/*` · artboard ใหม่ 7: `ModalNoReplyStopped`, `ModalPortGone`, `MenuOverStop`, `ModalAutoFail`, `BannerNoReplyStopped`, `BannerReduced`, `BackAskStopped`
- ประวัติ: v19 `1793950755-2a41` (review F1–F22 + OQ96–OQ101) · v18 `1793948754-ebdd` (OQ95 เลิก inert ใน body) · v17 `1793948033-1974` (OQ93/OQ94 · DS v20 · Attention Ring) · v16 (DS v18)
- DS: School Bot Studio **v21** (`1793949954-61ae`) · คัดลอกฝั่งเซิร์ฟเวอร์: `project/ds/school-bot/tokens.json`, `tokens.css`, `components/bundle.css` + record `designSystems` (namespace `school-bot`) · ไม่ใช้ `bundle.js` (ไอคอน inline `<svg class="sb-i">` จากชุด `icons` ของ DS แบบเดียวกับ D2)
- asset: โลโก้ `Arm Lab.svg` จาก DS → C2 `/_blob/362e7e913865fc9a43ffd5e32f4002c2` · `<img width="4748" height="1200">` ตามขนาดไฟล์ใน Logos README (F22) · CSS ของ DS ให้สูง 32
- ฟอนต์: IBM Plex Sans Thai ผ่าน Google Fonts ใน helmet (DS ยังไม่มีไฟล์ฟอนต์)
- **หน้า Arm Lab ในทุก artboard เป็นฉบับย่อ** (`ArmShell.dc.html`) ไม่ใช่สำเนา frame ที่อนุมัติ · ตอนแก้ MainV6A จริงต้องยก state เหล่านี้ไปใส่ตาม R1 (ใบสั่งแก้)
- ยังไม่ได้เปิดดู render จริง (ไม่ได้รับคำสั่งให้ตรวจ)

## Artboard (C2 v20)

| # | ไฟล์ | state | R# |
|---|---|---|---|
| 1 | `Main.dc.html` | modal หลุด (สายหลุด/พอร์ตหาย): ไม่มีปุ่มหยุดใน modal · ปุ่มหยุดที่มุม `is-covered` + `inert` · body `inert` · spinner รอหุ่น · บรรทัดวิธีหยุดทางกายภาพ · [ปิดไว้ก่อน][เปลี่ยนไปใช้หุ่นตัวอื่น] | R16, R5 |
| 2 | `ModalNoReply.dc.html` (กดได้จริง · Tweaks › state, menu) | modal หุ่นไม่ตอบ (พอร์ตเปิด): `sb-btn-stop` บนสุดใต้หัว เต็มกว้าง (focus เริ่มที่นี่) · กดแล้วขึ้นบรรทัดผล | R16, R5 |
| 2b | `ModalNoReplyStopped.dc.html` | กดหยุดแล้ว: บรรทัด `role=status` "ส่งคำสั่งหยุดแล้ว · ดูว่าหุ่นหยุดหรือยัง" ใต้ปุ่มหยุด (F3 · ไม่เขียน "หยุดแล้ว") | R5, R16 |
| 2c | `ModalPortGone.dc.html` | หุ่นไม่ตอบ → พอร์ตหาย ใน modal เดียวกัน: หัว/เนื้อเป็นแบบสายหลุด · ปุ่มหยุดคงไว้ `aria-disabled` + `sb-tip` เหตุผลเปิดค้าง · โฟกัสคงที่ปุ่มเดิม (F2 ข · OQ88) | R5, R16 |
| 2d | `MenuOverStop.dc.html` | เมนู ☰ (`sb-menu`) เปิดซ้อน dialog ที่มีปุ่มหยุด: เมนูอยู่ x ≈ 92–372 · dialog x 460–980 ไม่ทับ (F12) | R5, R16, R17 |
| 3 | `ModalFoundPort.dc.html` | ไม่มี ID: "พบหุ่นที่ COM7" + ปุ่มหลัก "เชื่อมต่อ" · ไม่อ้างชื่อหุ่นเดิม · หัว `sb-dialog-ico warn` + ไอคอน `triangle-alert` (OQ103 · v20) | R16 |
| 3b | `ModalOtherRobot.dc.html` | หุ่นตัวอื่น (มี ID): "หุ่นที่เสียบไม่ใช่หุ่นกลุ่ม 3" | R16 |
| 3c | `ModalAutoFail.dc.html` | **ใหม่ (F2 ก):** เชื่อมเองไม่สำเร็จ: ชิปกลับ "ขาดหาย" · modal ถอดเสียบใหม่/ไปหน้าเชื่อมต่อ · [ปิดไว้ก่อน][เปลี่ยนไปใช้หุ่นตัวอื่น] · ถ้อยคำตัดสินแล้ว (OQ102-2) | R16 |
| 4 | `BannerLost.dc.html` (กดได้จริง) | หลังปิดไว้ก่อน (สายหลุด): แถบเหลืองลอยทับ body · control ใน body `aria-disabled` + tooltip · **กดปุ่มที่ปิดตัวใดก็ได้ = "เชื่อมหุ่น" `is-shake`** (F21) · ลดการเคลื่อนไหว = เปิด tooltip ของปุ่มที่กด (OQ99) · ปุ่มหยุด `aria-disabled` + tooltip | R16, R5, R11 |
| 4b | `BannerStopPressed.dc.html` | กดปุ่มหยุดที่ปิด: tooltip เหตุผล**เหนือปุ่ม** (`sb-tip-top sb-tip-start`) เปิดค้าง + "เชื่อมหุ่น" สั่น (F19) | R5, R16 |
| 4c | `BannerNoReply.dc.html` (กดได้จริง) | แถบ "หุ่นไม่ตอบ" · ปุ่มหยุดที่มุมกดได้ · control อื่นใน body ปิด | R16, R5 |
| 4d | `BannerNoReplyStopped.dc.html` | กดปุ่มหยุดที่มุมแล้ว: `sb-tip-top sb-tip-start` เปิดค้าง "ส่งคำสั่งหยุดแล้ว · ดูว่าหุ่นหยุดหรือยัง" + ประกาศผ่าน live region (F3 · OQ102-3) | R5, R16 |
| 4e | `BannerReduced.dc.html` | ลดการเคลื่อนไหว: กด "เล่น" ที่ปิด → ไม่สั่น เปิด tooltip เหตุผลของ "เล่น" (OQ99 · DS Button v21) | R11, R5 |
| 5 | `BackAsk.dc.html` (กดได้จริง) | "ต่อหุ่นกลุ่ม 3 กลับแล้ว" · **ปุ่มหยุดในตัวเสมอ บนสุดใต้หัว เต็มกว้าง focus เริ่มที่นี่ (F1 · OQ96)** · checkbox ถ้อยคำใหม่ (OQ101 · ตัดสินแล้ว OQ102-1 ก) ปลด "พาหุ่นไปท่าพัก" · [ข้าม] · Tweaks › armWeak, sent | R16, R15, R5 |
| 5b | `BackAskArmWeak.dc.html` | + บรรทัด "แขนอาจยังอ่อนอยู่ ปล่อยมือจากแขนก่อน…" + ปุ่มหยุดในตัว | R16, R14 |
| 5c | `BackGoing.dc.html` | กำลังพาไปท่าพัก: `sb-spin` + "อย่าเอามือเข้าใกล้แขนหุ่น" + ปุ่มหยุดในตัว · ปิดเองเมื่อถึง | R16, R5 |
| 5d | `BackStopped.dc.html` | กดหยุดระหว่างไป: ack / ไม่มี ack (Tweaks › ack) · [ข้าม][พาไปท่าพักอีกครั้ง] · ปุ่มหยุดคงไว้ | R16 |
| 5e | `BackFailed.dc.html` | ไปท่าพักไม่สำเร็จ: [ข้าม][ลองอีกครั้ง] | R16 |
| 5f | `BackAskStopped.dc.html` | ต่อกลับแล้ว · กดหยุดในตัว: บรรทัดผล `role=status` (ไม่มี ack) | R16, R5 |
| 6 | `HoldArm.dc.html` | หน้าจอประคองแขน · ปุ่มเดียว "รับทราบ" | R14, R16 |
| 6b | `BannerArmWeak.dc.html` | หลังปิด: แถบเหลือง **หัว = "แขนยังอ่อนอยู่ ประคองแขนไว้แล้วเรียกครู"** · บรรทัดรอง = การหลุด (COM7) + วิธีหยุดทางกายภาพ (OQ98) · ปลดล็อกข้อต่อและ control อื่นปิด | R14, R16 |
| 7 | `NavChips.dc.html` | ชิป N1: ขาดหาย + "เชื่อมหุ่น" (Attention Ring) · กำลังเชื่อมต่อ (`sb-spin sb-spin-sm` + "เชื่อมหุ่น" `aria-disabled` + **tooltip ตามองเห็น `sb-tip-end`** "กำลังเชื่อมต่อ รอให้เสร็จก่อน" · F9) | R11, R16 |
| - | `ArmShell.dc.html` | component ฐาน · props: `chip` lost/busy/ok · `stopMode` on/covered/disabled · `banner` none/lost/noreply/armweak · `pressed` · `sent` · `reduced` · `openTip` · `menuOpen` · `busyTip` | - |

ข้อมูลตัวอย่าง: หุ่นกลุ่ม 3 · COM7 · ไฟล์ "Arm Lab 2026-11-06" · หุ่นตัวอื่น COM9

## ค่าที่ใช้ (ชื่อ token/component ของ DS v21)

| ส่วน | ใช้ |
|---|---|
| แถบบน | `sb-bar` N1 Lab · `header-height` 60 · `z-windowbar` 65 · `sb-sep` · `sb-ibtn` · `sb-logo` + โลโก้ Arm Lab (asset DS) · `sb-job` · `sb-win`/`sb-wb` |
| ชิปหุ่น | `sb-dev` + `sb-dev-col` + `sb-dev-name` · `sb-dev-st warn` · `sb-dev-st busy` + **`sb-spin sb-spin-sm`** (`icon-sm` 16 · `border-default` · OQ100) · `sb-dev-st ok` |
| ปุ่มบนแถบ | "เชื่อมหุ่น" `sb-btn sb-btn-primary sb-btn-sm` + Attention Ring `sb-ring sb-ring-robot sb-ring-inset` + `is-shake` (`dur-shake` ±`space-1` · ลดการเคลื่อนไหว = ไม่สั่น + `sb-tipwrap.is-open` ของปุ่มที่กด · OQ99) · กำลังเชื่อมต่อ: `aria-disabled` ไม่มีวง + `sb-tipwrap` + `sb-tip sb-tip-end` · "เปลี่ยนหุ่น" `sb-btn-secondary sb-btn-sm` |
| เมนู ☰ | `sb-menu` (`menu-max-width` 280 · `z-popover` 40) + `sb-mi` (`control-sm` 44 · 16/600 · `kbd` 12/700) + `sb-menu-sep` · ตำแหน่ง `top: header-height` · `left: space-6 + control-sm + space-6` |
| dialog | `sb-dialog` (`dialog-width` 520 · `space-6` · gap `space-3` · `radius-lg` · `shadow-modal` · `z-dialog`) · `sb-dialog-head` + `sb-dialog-ico warn` · ModalFoundPort ใช้ไอคอน `triangle-alert` `sb-i-lg` (OQ103 · v20) · `sb-dialog-title` (`text-2xl` 24/700) · `sb-dialog-body` (`text-md` 16) · `sb-dialog-actions` · `role="alertdialog"` **ไม่มี `aria-modal`** (Dialog README v21 หน้า lab · OQ97) |
| ฉากหลัง | `sb-scrim sb-scrim-lab` (`scrim` · `z-backdrop` 20 · เริ่มใต้ nav) · `<main>` ของหน้า `inert` (nav ไม่ inert) · ปุ่มหยุดที่มุม `is-covered` + `inert` |
| ปุ่มหยุด | `sb-btn-stop` (`stop`/`stop-dark` · `control-lg` 56 · `radius-lg` · ไอคอน `square` · `z-stop` 70) · ใน dialog: เต็มกว้าง บนสุดใต้หัว · สายหลุด/พอร์ตหาย: `aria-disabled` + `sb-tip` เหตุผล |
| ปุ่มใน dialog | `sb-btn-secondary` · `sb-btn-primary` ("เชื่อมต่อ", "รับทราบ") · `sb-btn-robot` ("พาหุ่นไปท่าพัก", "พาไปท่าพักอีกครั้ง", "ลองอีกครั้ง") `control-md` 48 |
| แถบเหลือง | `sb-banner sb-banner-warn` (`warning-bg` · `triangle-alert` `icon-lg` `warning-strong` · หัว `sb-banner-title` `text-lg` 18/700 · **รอง `sb-banner-body` `text-md` 16/400** (OQ98) · `space-4`/`space-6` · `shadow-float` · `z-sticky` 10) · แขนอ่อน = หัวแถบ · ไม่มี `<b>` ในบรรทัดรอง · ประกาศผ่าน live region `sb-sr role=status` ที่มีอยู่ก่อน (F14) |
| tooltip | `sb-tipwrap` + `sb-tip` · `sb-tip-top` (ปุ่มล่าง/การ์ด) · **`sb-tip-start` / `sb-tip-end`** (ปุ่มชิดขอบแผง · OQ100 · แทน `.d4-tip-r` และ inline `left:0`) · `z-popover` 40 · 14/500 (`text-sm` · tooltip) |
| สถานะในหน้า | `sb-notice sb-notice-warning` · `sb-loading` + `sb-spin` (`dur-spin`) · `sb-check` + `sb-check-box` · ผลกดหยุด = `sb-dialog-body` `role=status` |
| หน้า Arm Lab ย่อ (ตัวอักษร · F8) | ชื่อท่า "ท่า 2" `text-xl` 20/700 · รหัส G0002 `text-xs` 12/400 · หัวแผง `text-lg` 18/700 · ป้ายข้อต่อ/ค่า/ข้อความบน slider `text-md` 16/400 · ป้ายในกรอบแขน `text-sm` 14/500 · คำอธิบายใน NavChips `text-sm` 14/500 · ความสูงแถว NavChips `header-height` |
| หน้า Arm Lab ย่อ (layout · F8) | **ขนาด layout ของ artboard ฉบับย่อ ไม่ใช่ค่า design:** เวที 560 · แผงขวาเริ่ม 608 · กรอบแขน 360x340 · ช่องชื่อท่า min 200 · ป้ายข้อต่อ 96 · ค่าข้อต่อ 64 → ตอนยกเข้า MainV6A ใช้ layout ของ MainV6A · ค่าอื่นเป็น token (`space-*`, `radius-*`, `border-default`, `surface`, `off-bg`, `control-sm`) |
| body ขณะแถบเหลืองแสดง (OQ93-1 · OQ95) | แถบลอยทับ ไม่เลื่อน control · control ทุกตัวใน body `aria-disabled` (ไม่ใช้ `inert`) โฟกัสได้ + `aria-describedby` + `sb-tip` · slider `role="slider"` + `aria-valuemin/max/now/valuetext` (F15) · ยกเว้นปุ่มหยุดที่มุมตาม `stopMode` |

## DS gap
- **ไม่มี DS gap**
- DS gap เดิม OQ103 (กล่องไอคอนหัว dialog แบบข่าวกลาง · ModalFoundPort) ปิดแล้ว 2026-11-06: ผู้ใช้ให้คง `sb-dialog-ico warn` ไม่เติม DS · เปลี่ยนไอคอน plug เป็น `triangle-alert` ตาม Dialog README (C2 v20)
- DS gap เดิม (tooltip ชิดขอบ + spinner 16 · OQ100) ปิดแล้ว: ใช้ `sb-tip-start`/`sb-tip-end` + `sb-spin-sm` ของ DS v21

## DS ขัดกัน
- ไม่มี (OQ97/OQ98/OQ99 แก้ใน DS v21 แล้ว · D4 ใช้ตามนั้น)

## ข้อตัดสิน
ผู้ใช้ยืนยัน (OQ93 · 2026-11-06) ข้อ 1–9 คงเดิม · ข้อ 7 ข้อความ tooltip ปุ่มหยุดที่ปิด "หุ่นหลุด ส่งคำสั่งหยุดไม่ได้ · วิธีหยุดอยู่ที่แถบเหลืองด้านบน" อยู่**เหนือปุ่ม** (`sb-tip-top sb-tip-start`) · บรรทัดถอดสายไฟ adapter ยังรอ OQ40

เพิ่ม 2026-11-06 (ผู้ใช้ตอบหลัง review):
10. **OQ96:** modal ต่อกลับแล้วมีปุ่มหยุดในตัวเสมอ บนสุดใต้หัว เต็มกว้าง focus เริ่มที่ปุ่มนี้ · กดแล้ว = "ส่งคำสั่งหยุดแล้ว · ดูว่าหุ่นหยุดหรือยัง"
11. **OQ97 · focus ของ dialog lab:** ไม่ใช้ `aria-modal` · body ใต้ฉากหลัง `inert` (nav ไม่ inert) · Tab วนใน dialog แล้วไปแถบ nav · ไม่มี Esc (R16) · ปุ่มหยุดในตัวได้โฟกัสก่อน · **หลังปิด:** modal หลุด / หุ่นตัวอื่น / เชื่อมเองไม่สำเร็จ / ประคองแขน → ปุ่ม "เชื่อมหุ่น" บนแถบ · modal ต่อกลับแล้ว (ข้าม / ปิดเองเมื่อถึงท่าพัก) → ปุ่มที่โฟกัสก่อน modal ขึ้น · "พบหุ่นที่ COM7 › เชื่อมต่อ" → โฟกัสไป modal ต่อกลับแล้ว (ปุ่มหยุด)
12. **OQ98:** บรรทัดรองของแถบ 16 · แขนอ่อนเป็นหัวแถบ
13. **OQ99:** ลดการเคลื่อนไหว: กดปุ่มที่ปิด = ไม่สั่น เปิด tooltip เหตุผลของปุ่มที่กด · "เชื่อมหุ่น" คงวงนิ่ง
14. **OQ100:** `sb-tip-start`/`sb-tip-end` + `sb-spin-sm`
15. **OQ101:** checkbox มีคำเรื่องนิ้ว/มือคีบ · ถ้อยคำ "ดูรอบหุ่นแล้ว เก็บมือ นิ้ว และของออกจากแขนและมือคีบแล้ว" (ผู้ใช้ยืนยัน OQ102-1 ก · 2026-11-06)
16. **F12 (OQ88 ง) กติกาถึง dev:** เมนู ☰ / popover (i) / dropdown จาก nav ห้ามทับปุ่มหยุด (ทั้งใน dialog และที่มุม) · ขณะเมนูเปิด **คลิกแรกที่ปุ่มหยุด = ส่งหยุดทันที** แล้วปิดเมนู (ไม่ใช่แค่ปิดเมนู · ห้ามตัวดักคลิกนอกเมนูกินคลิกนั้น) · ที่ 1440x900 เมนูอยู่ x ≈ 92–372 ไม่ทับ dialog (x 460–980) · ปุ่มหยุดที่มุม (ซ้ายล่าง) อยู่ใต้เมนูแนวตั้งไม่ถึง (เมนู 10 รายการ ≈ y 60–590 · ปุ่มหยุด ≈ y 800–856)
17. **F21:** ทุกปุ่ม/ช่องที่ปิดใน body (รวม slider) กดแล้วทำเหมือนกัน = "เชื่อมหุ่น" สั่นครั้งเดียว ไม่ขึ้น popup (R11) · หน้าเชื่อมต่อ (ConnectV3 · D2 บน C1) ต้องแสดงแถบเดียวกัน (OQ92 ค) → ทำใน D2 รอบถัดไป

18. **OQ102 (ผู้ใช้ตอบ 2026-11-06 · รับร่างทั้งหมด):** (1) checkbox = ทาง ก (ข้อ 15) · (2) ModalAutoFail หัว "ต่อหุ่นกลุ่ม 3 กลับไม่สำเร็จ" · เนื้อ "ถอดสาย USB ของหุ่นกลุ่ม 3 แล้วเสียบใหม่ หรือไปหน้าเชื่อมต่อเพื่อเลือกหุ่นเอง" · ปุ่มเดิม [ปิดไว้ก่อน][เปลี่ยนไปใช้หุ่นตัวอื่น] · ไม่มี spinner · มีบรรทัดวิธีหยุดทางกายภาพ · (3) ผลกดหยุด: ใน modal = บรรทัด `sb-dialog-body` `role=status` "ส่งคำสั่งหยุดแล้ว · ดูว่าหุ่นหยุดหรือยัง" ค้างจน modal ปิด · ปุ่มหยุดที่มุม = `sb-tip sb-tip-top sb-tip-start` เปิดค้างข้อความเดียวกัน (ไม่ใช้ Toast) · (4) tooltip ปุ่มหยุดใน dialog เมื่อพอร์ตหาย "หุ่นหลุด ส่งคำสั่งหยุดไม่ได้ · ถ้าจำเป็นให้ถอดสายไฟ adapter ของหุ่น" (ส่วนถอดสายไฟยังรอ OQ40) + หัว/เนื้อเปลี่ยนเป็นแบบสายหลุด · (5) ลดการเคลื่อนไหว: tooltip จากการกดปุ่มที่ปิด ค้างจนกดปุ่มอื่นหรือแถบหาย
19. **OQ103 (ผู้ใช้ตอบ 2026-11-06):** ModalFoundPort คง `sb-dialog-ico warn` ไอคอน `triangle-alert` (C2 v20)

## ตาราง F# (review 2026-11-06)

| F# | ระดับ | ผล | ทำอะไร (C2 v19) |
|---|---|---|---|
| F1 | สูง | แก้แล้ว | BackAsk/BackAskArmWeak ปุ่มหยุดในตัว บนสุดใต้หัว เต็มกว้าง focus เริ่มที่นี่ + BackAskStopped |
| F2 | กลาง | แก้แล้ว (ถ้อยคำตัดสินแล้ว OQ102) | ก: ModalAutoFail · ข: ModalPortGone (ปุ่มหยุดใน dialog `aria-disabled` + tooltip) |
| F3 | กลาง | แก้แล้ว (วิธีแสดงตัดสินแล้ว OQ102-3) | ModalNoReplyStopped, BannerNoReplyStopped, BackAskStopped · ถ้อยคำเดิมของ BackStopped |
| F4 | กลาง | แก้แล้ว | เอา `aria-modal` ออกทุก dialog · `<main>` inert ใต้ฉากหลัง · focus หลังปิด (ข้อตัดสิน 11 + โน้ตบน canvas) |
| F5 | กลาง | แก้แล้ว | แถบ: รอง 16/400 · แขนอ่อนเป็นหัว · ไม่มี `<b>` |
| F6 | กลาง | แก้แล้ว | ลดการเคลื่อนไหว = tooltip ของปุ่มที่กด (BannerReduced · Tweaks › reduced) |
| F7 | กลาง | แก้แล้ว | `sb-tip-start`/`sb-tip-end` แทน `.d4-tip-r`/inline |
| F8 | กลาง | แก้แล้ว | ตัวอักษรตาม type scale · `sb-spin-sm` · `header-height` · ขนาด layout ระบุเป็น placeholder (ตารางค่าที่ใช้ + คอมเมนต์ใน ArmShell) |
| F9 | กลาง | แก้แล้ว | tooltip ตามองเห็น `sb-tip-end` บน "เชื่อมหุ่น" ตอนกำลังเชื่อมต่อ |
| F10 | กลาง | แก้แล้ว (ถ้อยคำยืนยันแล้ว OQ102-1 ก) | checkbox มีมือ/นิ้ว/มือคีบ |
| F11 | กลาง | - | session หลักเกลา R11 แล้ว (2026-11-06) |
| F12 | กลาง | แก้แล้ว | MenuOverStop + กติกาข้อ 16 |
| F13 | ต่ำ | **ค้างบางส่วน** | tooltip ของปุ่มใต้แถบ (กลับท่าพัก/ไปท่านี้/ปลดล็อกข้อต่อ) ยังซ้อนบรรทัดของแถบตอนโฟกัส: ทุกตำแหน่งของ DS (ใต้/บน/ซ้าย) อยู่ในแนวเดียวกับแถบ · เป็นผลของข้อยกเว้น OQ95 · tooltip ปิดด้วย Esc ไม่ได้ = เรื่อง DS Tooltip (session หลัก) |
| F14 | ต่ำ | แก้แล้ว | live region `sb-sr role=status` มีอยู่ก่อนแล้วเติมข้อความ (แถบ + ผลกดหยุดที่มุม) |
| F15 | ต่ำ | แก้แล้ว (ต้นแบบ) | slider มี `aria-valuemin/max/now` · ของจริงใช้ `input type=range` (ข้อเสนอแนะ 2) |
| F16 | ต่ำ | ค้าง | "กำลังเชื่อมต่อ..." ใช้ตาม R11 ตามตัวอักษร · เปลี่ยนเป็น "…" ต้องแก้ R11/brand §7 (session หลัก) |
| F17 | ต่ำ | ค้าง | วงกะพริบวนไม่จบ = เรื่อง DS Focus (session หลัก) |
| F18 | ต่ำ | แก้แล้วบางส่วน | ไอคอน: OQ103 คง `warn` + `triangle-alert` (v20) · ความกว้าง 3 ปุ่มใน 520 ยังไม่ได้ render |
| F19 | ต่ำ | แก้แล้ว | ชื่อ artboard/ตาราง: tooltip เหนือปุ่ม · หัวข้อ DS gap แก้แล้ว |
| F20 | ต่ำ | ไม่ทำ | D3 (ตามที่สั่ง) |
| F21 | ต่ำ | แก้แล้ว (ส่วน D4) | ทุกปุ่มที่ปิดสั่นเหมือนกัน · แถบบนหน้าเชื่อมต่อ = D2 รอบถัดไป |
| F22 | ต่ำ | แก้แล้ว | โลโก้ `width`/`height` ตามไฟล์ |

## Heuristics (H#) · HIG · UD
- H1 สถานะเห็นตลอด: spinner, ชิป, แถบค้าง, ผลหลังกดหยุดค้างบนจอ (F3) · H3 ทางออก: ทุก modal ที่หุ่นเชื่อมอยู่หรือพอร์ตเปิดมีปุ่มหยุดในตัว (F1) · ปิดไว้ก่อน/ข้าม/เปลี่ยนไปใช้หุ่นตัวอื่น · H4 ชื่อปุ่มเดิมทุกที่ (modal เชื่อมเองไม่สำเร็จใช้ปุ่มเดิม) · H5 checkbox ปลดปุ่มพาไปท่าพัก + คำเตือนมือคีบ (F10) · ไม่เขียน "หยุดแล้ว"/"ถึงแล้ว" โดยไม่มี ack · H6 วิธีหยุดทางกายภาพบนจอเสมอ · H9 บอกวิธีแก้ (เสียบสาย/ถอดเสียบใหม่/เชื่อมหุ่น) · ปุ่มที่ปิดบอกเหตุผลทั้งตาและผู้อ่านจอ (F9)
- HIG/UD: ไอคอนคู่ข้อความทุกสถานะ · ไม่มีกะพริบนอกจาก Attention Ring (F17 ค้างที่ DS) · ลดการเคลื่อนไหวมีผลที่เห็นได้ (F6) · UD3 คำเตือนความปลอดภัยในแถบ ≥ 16 (F5)

## WCAG AA (ค่าที่ DS ตรวจไว้ · ไม่ได้คำนวณใหม่)
- contrast: `text-primary` บน `warning-bg` ≈ 14:1 · ขาวบน `stop` 4.98 · ขาวบน `action-primary` 5.55 · `text-primary` บน `action-robot` 6.59 · `text-secondary` บน `off-bg` 5.56 · tooltip ขาวบน `text-primary` 15.6 · ไอคอน `warning-strong` กราฟิกคู่ข้อความ
- เป้ากด: ปุ่มทุกตัว ≥ 44 · `sb-mi` 44 · ปุ่มหยุด 56 · `sb-check` ≥ 44
- keyboard/focus: `role="alertdialog"` + labelledby/describedby ไม่มี `aria-modal` (หน้า lab) · body `inert` ใต้ฉากหลัง · nav ไปถึงได้ด้วย Tab · focus เริ่มที่ปุ่มหยุดในตัวเมื่อมี ไม่งั้นปุ่มปลอดภัย · focus หลังปิดตามข้อตัดสิน 11 (2.4.3) · ไม่มี Esc บน modal R16 · ปุ่มปิดใช้ `aria-disabled` โฟกัสได้ + `aria-describedby` + tooltip ที่เห็น
- 2.4.11 = ข้อยกเว้นที่ผู้ใช้อนุมัติ (OQ95) สำหรับปุ่มใต้แถบ · ปุ่มหยุดที่มุมไม่อยู่ใต้แถบ
- status (4.1.3): live region ของหน้ามีอยู่ก่อนแล้วเติมข้อความ · ผลกดหยุดใน dialog = `role=status` ที่มีอยู่ก่อน (ซ่อนด้วย `sb-sr` ตอนว่าง)
- slider (4.1.2): `aria-valuemin/max/now/valuetext`
- 2.3.3/2.2.2: ลดการเคลื่อนไหว = ไม่สั่น ไม่หมุน วงนิ่ง · Attention Ring วนไม่จบ (F17 · DS)
- ยังไม่ได้ตรวจ: render/screenshot จริง, ความกว้างปุ่ม 3 ตัวใน "พบหุ่นที่ COM7", ตำแหน่งเมนู ☰ จริง (คำนวณจาก token), tooltip ล้น/ซ้อนแถบจริง, ซูม 200%, screen reader, ภาษาอื่น +40%, ลำดับ Tab จริง

## ข้อเสนอแนะ
1. OQ102/OQ103 ตอบแล้ว (2026-11-06) · ตอบ OQ40 แล้วจึงยกเข้า MainV6A บน C1 ผ่านใบสั่งแก้
2. ตอนยกเข้า MainV6A: ทุก control ใน body (รวมจุด S0–S5, slider, เมนูท่า, ลิ้นชักประวัติ) ปิดด้วย `aria-disabled` + tooltip ขณะแถบแสดง · slider จริง `input type=range` + `aria-disabled` + กันค่าเปลี่ยนในสคริปต์ · ทุกปุ่มที่ปิดสั่น "เชื่อมหุ่น"
3. D2 (ConnectV3) รอบถัดไป: แถบเหลืองบนหน้าเชื่อมต่อ (OQ92 ค · F21) + dialog lab ไม่ใช้ `aria-modal`
4. DS (session หลัก): Tooltip ปิดด้วย Esc (F13 · 1.4.13) · Attention Ring หยุดได้ (F17 · 2.2.2)
5. ส่ง highlighter ตรวจ D4 ซ้ำเฉพาะ F1–F12 (+ F18 ไอคอน ModalFoundPort) ได้แล้ว
