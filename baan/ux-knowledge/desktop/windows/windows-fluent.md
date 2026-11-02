---
updated: 2026-11-02
source: learn.microsoft.com/windows/apps/ — design/basics/{titlebar-design, content-basics}, design/signature-experiences/{typography, geometry, layering, color}, design/layout/screen-sizes-and-breakpoints-for-responsive-design, design/style/{mica, segoe-fluent-icons-font}, design/accessibility/high-contrast-themes, develop/title-bar, develop/input/{targeting, touch, accelerators, access-keys, visual feedback}, develop/ui/controls/{compact-sizing, navigationview, command-bar, menus, dialogs, infobar}, desktop/modernize/ui/apply-snap-layout-menu + fluent2.microsoft.design/layout · อ่านเมื่อ 2026-11-02 สรุปด้วยคำของทีม
used_by: survey, ui, review
---

# Windows 11 (Fluent 2): title bar, หน้าต่าง, layout และฐานรากของ app desktop

ใช้เมื่อ module มี platform `desktop` และ os มี `windows` อ้างเป็นเลขข้อ เช่น "WF4: แถบบนสูง 60 แต่ไม่ได้บันทึกเหตุผล"
ฝั่ง Mac คือ `../apple/hig-macos-bars.md` (HM) และ `../apple/hig-foundations.md` (HF) app ที่รันทั้งสอง OS ตรวจทั้งสองชุด และดูหัวข้อ "แอปที่รันทั้ง Windows และ Mac"
ค่าหน้าตาใช้ตาม brand ของโปรเจกต์ ข้อในไฟล์นี้คือ**ขั้นต่ำและพฤติกรรม**ที่ผู้ใช้ Windows คาดหวัง ถ้าขัดกับ brand ให้บันทึกเป็นข้อตัดสินใจ ไม่เลือกเงียบ ๆ
หน่วยเป็น **epx** (effective pixel ไม่ต้องคิดความหนาแน่นจอ) ถ้าไม่ใช่ app บน Windows ตอบ "ไม่เกี่ยวข้อง" ไม่ใช่ "ผ่าน"

## โครงหน้าต่าง Windows (บนลงล่าง)

ระบบ 2 ชั้น: **base layer** (พื้น app: เมนู คำสั่ง navigation) กับ **content layer** (เนื้อหา ทับบน base เป็นผืนเดียวหรือเป็น card)

| ส่วน | หน้าที่ / ที่อยู่ |
|---|---|
| Title bar | ชื่อ app, ลากหน้าต่าง, ปุ่ม caption มุมขวาบน |
| Menu bar (ถ้ามี) | **ในหน้าต่าง** บนสุด (ไม่มี menu bar กลางของระบบแบบ Mac) |
| NavigationView | ส่วนหลักของ app: pane ซ้าย หรือแถบบน |
| Command bar | คำสั่งใช้บ่อยของหน้า: ใกล้ขอบบน หรือ inline |
| Content + InfoBar | เนื้อหา (content layer) · InfoBar inline ดัน layout ไม่ลอยทับ |

ตัวเลขที่ต้องจำ: title bar 32 (48 ถ้ามี search/รูปบัญชี) · หน้าต่างขั้นต่ำกว้าง ≤500 จึง snap ได้ · เป้ากด ≥40×40 · ตัวอักษรขั้นต่ำ 12 Regular / 14 Semibold · breakpoint ≤640 / 641–1007 / ≥1008

## Type ramp ของ Windows 11 (Segoe UI Variable, ขนาด/line height)

| Style | optical size, น้ำหนัก | ขนาด |
|---|---|---|
| Caption | Small, Regular | 12/16 |
| Body / Body Strong | Text, Regular / Semibold | 14/20 |
| Body Large / Body Large Strong | Text, Regular / Semibold | 18/24 |
| Subtitle | Display, Semibold | 20/28 |
| Title | Display, Semibold | 28/36 |
| Title Large | Display, Semibold | 40/52 |
| Display | Display, Semibold | 68/92 |

Bold/Italic ไม่อยู่ใน ramp (เน้นด้วย Semibold) · ที่แคบใช้ Body Strong แทน Title · ที่แคบมาก (ปุ่มคำสั่ง) ใช้ Caption

## เกณฑ์ตรวจ

### Title bar และปุ่ม caption

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF1 | ปุ่ม caption ครบ 3 ปุ่ม ย่อ → ขยาย/คืนขนาด → ปิด ที่**มุมขวาบน** (ภาษาขวาไปซ้ายย้ายไปซ้าย) ปิดอยู่มุมสุด ไอคอน app และปุ่ม caption เห็นครบเสมอแม้หน้าต่างแคบ ห้ามวางสิ่งที่ต้องกดใต้พื้นที่ปุ่ม caption (ระบบรับอินพุตตรงนั้น) | ปุ่มปิดอยู่ซ้าย, ปุ่มโปรไฟล์ซ้อนใต้ปุ่มย่อ |
| WF2 | ใช้ปุ่ม caption ที่ระบบวาดถ้าทำได้ ถ้าวาดเองต้องเหมือนระบบ: glyph Segoe Fluent Icons E921 Minimize, E922 Maximize, E923 Restore, E8BB Close (ขยาย/คืนขนาดมุมมน) พื้นปุ่มเต็มช่อง (full-bleed) มีสถานะ rest, hover, pressed, active, inactive | ปุ่มวงกลมสีแบบ Mac, ไม่มี hover |
| WF3 | hover ปุ่มขยายเปิด **snap layouts** ได้ (Win+Z ก็เปิดได้) title bar ทำเอง: ให้ platform วาดปุ่ม caption หรือ (Win32) ตอบ `WM_NCHITTEST` = `HTMAXBUTTON` ตรงปุ่มขยาย · Electron ต้อง v13 ขึ้นไป | hover ปุ่มขยายแล้วไม่มีเมนู snap |
| WF4 | แถบสูง 32 หรือ 48 เมื่อมี search box/รูปบัญชี (โหมด Tall ปุ่ม caption สูงเท่าแถบ glyph อยู่กลาง) ข้อความในแถบรองรับ text scaling สูงกว่า 48 (เช่น แถบเดียว 60 ของ School Bot Studio) = เบี่ยงจาก Microsoft: บันทึกเหตุผล และกำหนดความสูง/การจัดแนวของปุ่ม caption เอง (Microsoft ไม่ให้ค่า) | แถบ 60 ไม่มีบันทึก, ปุ่ม caption ครึ่งแถบลอยบนโดยไม่ตั้งใจ |
| WF5 | **drag region:** ที่ว่างทุกส่วนและสิ่งที่กดไม่ได้ (เช่น title) ลากหน้าต่างได้ สิ่งที่กดได้ในแถบต้องกำหนดเป็น passthrough เหลือที่ลากได้เสมอแม้หน้าต่างแคบ drag region อยู่ขอบบนตรงกับแถบที่เห็น | แท็บ/ปุ่มเต็มแถบจนไม่มีที่ลาก |
| WF6 | ดับเบิลคลิกที่ว่าง = ขยาย/คืนขนาด · คลิกขวา/กดค้างที่ว่าง = system window menu · คลิกไอคอน app = system menu · ดับเบิลคลิกไอคอน = ปิด | ดับเบิลคลิกแถบแล้วไม่มีอะไร |
| WF7 | ลำดับในแถบ (ซ้ายไปขวา): back (E830, ห่างขอบ 16) → ไอคอน app → title (Segoe UI Variable สไตล์ Caption ตัดด้วย … ได้) → search box **กึ่งกลางหน้าต่าง** เฉพาะ global search และยืดหดตามหน้าต่าง → รูปบัญชีอยู่ซ้ายปุ่ม caption · แท็บวางในแถบได้แต่ปุ่ม caption ยังชิดขวา · title เป็นชื่อ app ที่มีความหมาย ไม่ใช่ค่าตั้งต้นของ framework | search box ชิดซ้าย, title "WinUI Desktop" |
| WF8 | หน้าต่าง inactive: ข้อความ ไอคอน ปุ่มในแถบจาง/โปร่งลง (อย่างน้อยเปลี่ยนสี) | หน้าต่างหลังดูเหมือนหน้าต่างที่ใช้อยู่ |
| WF9 | สีแถบ: ค่าตั้งต้น Mica ควรกลืนกับหน้าต่าง เปลี่ยนตาม light/dark และ contrast theme (ใช้ SystemColors) ถ้ากำหนดสีแถบเองต้องกำหนดครบทุกสี เพราะผู้ใช้ตั้งให้ accent color ทาแถบได้ | แถบสีแบรนด์ทึบไม่มีแบบ dark/contrast |

### หน้าต่าง

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF10 | ขนาดต่ำสุดกว้าง ≤500 เพื่อให้ลงช่อง snap ได้ (แนะนำ ≤330) ตั้งใหญ่กว่า (เช่น 1440×900) = snap ครึ่งจอบนจอทั่วไปไม่ได้: ต้องเป็นข้อตัดสินใจที่บันทึก และ layout ไม่ทับกันที่ขนาดต่ำสุด รองรับทั้งหน้าต่างแนวกว้างและแนวสูง | ขั้นต่ำ 1440 โดยไม่มีใครรู้ว่า snap ใช้ไม่ได้ |
| WF11 | มุมหน้าต่าง 8 ไม่โค้งเมื่อ snap/maximize · full screen ระบบซ่อน title bar และปุ่ม caption (ออกแบบสถานะนี้ถ้ามี full screen) | maximize แล้วยังมีมุมโค้ง |

### Layout, navigation, command bar, ชั้น

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF12 | **left nav** เมื่อมี 5–10 หมวดหลักที่สำคัญเท่ากัน · **top nav** เมื่อ ≤5 หมวด อยากได้พื้นที่เนื้อหา หรือไอคอนสื่อหมวดไม่ได้ (ที่ล้นเข้า overflow ต้องสำคัญน้อยกว่า) · ลำดับชั้นตื้น 2 ระดับดีที่สุด · Settings เป็นรายการท้าย pane (footer items อยู่ก่อน Settings ของที่ไม่ใช่ navigation ใส่ PaneFooter) · เลือกได้ทีละรายการ | top nav 9 หมวด, nav ซ้อน 4 ชั้น |
| WF13 | ปรับตามความกว้างหน้าต่าง: pane เต็ม ≥1008 · ไอคอนอย่างเดียว 641–1007 · ปุ่มเมนูอย่างเดียว ≤640 · header สูง 52 ถือชื่อหน้า · margin เนื้อหา 24 (12 ในโหมด Minimal) · top nav ที่แคบลงให้เปลี่ยนเป็น left แทนการยัดหมวดหลักเข้า overflow | หน้าต่าง 1440 แต่ pane เหลือแค่ไอคอนโดยไม่มีเหตุผล |
| WF14 | command bar: จอใหญ่วางใกล้ขอบบน · เรียงตามความสำคัญ (ตัวสำคัญเห็นเสมอ ที่เหลือล้นเข้า "…") · คำสั่งที่มีทุกหน้าอยู่ที่เดิม · Accept/Yes/OK อยู่ซ้าย Reject/No/Cancel · label สั้น (คำเดียวดีสุด) หน้าต่างใหญ่วาง label ขวาไอคอน · ไม่ค้างเปิด (sticky) · ไม่ซ่อนทุกคำสั่ง | "บันทึก" อยู่คนละที่ในแต่ละหน้า |
| WF15 | base layer ถือเมนู คำสั่ง navigation · content layer ถือเนื้อหา (ผืนเดียว หรือ card เมื่อเป็นส่วนแยก) · shadow บอกระดับ ไม่ใช่ตกแต่ง (elevation: window/dialog 128, flyout 32, tooltip 16, card 8, control 2, เส้นขอบ 1) | การ์ดทุกใบเงาหนา |

### ตัวอักษร ระยะ รูปทรง ขนาดเป้า

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF16 | ฟอนต์เดียวทั้ง app (Segoe UI Variable สำหรับละติน) ใช้ type ramp · Regular ทั่วไป Semibold หัวข้อ ไม่ใช้ Bold/Italic · ไม่เล็กกว่า 12 Regular / 14 Semibold · ป้าย UI ทุกจุดรวมหัวข้อใช้ **sentence case** · ชิดซ้าย (กลางเฉพาะเช่นใต้ไอคอน) · บรรทัด 50–60 ตัวอักษร · ล้นตัดด้วย … เป็นหลัก | หัวข้อ Title Case, ป้าย 10 epx |
| WF17 | ภาษาไทย: Segoe UI Variable รองรับละติน กรีก ซีริลลิกเท่านั้น ฟอนต์ UI ไทยที่ Microsoft ระบุคือ **Leelawadee UI** (Regular, Semilight, Bold — ไม่มี Semibold) ต้องตัดสินว่าน้ำหนัก Semibold ของ ramp เป็นอะไรในข้อความไทยแล้วบันทึก ถ้า brand มีฟอนต์ไทยเองใช้ brand แต่ยังตรวจขั้นต่ำตาม WF16 | ออกแบบ Semibold ไทยแต่เครื่องจริงแสดงอีกน้ำหนัก |
| WF18 | ขนาด ระยะ ตำแหน่งเป็นทวีคูณ 4 (ข้อความยกเว้น) · 8 ระหว่างปุ่ม, ปุ่ม–flyout, control–header · 12 control–label และระหว่างพื้นที่เนื้อหา · 16 ขอบพื้นผิวถึงข้อความ · ramp Fluent 2: 0, 2, 4, 6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40, 48, 52, 56 | ระยะ 7, 13, 18 ปนกัน |
| WF19 | มุม 8: หน้าต่าง, ContentDialog, Flyout, MenuFlyout, TeachingTip · มุม 4: Button, CheckBox, ComboBox, TextBox, พื้นรายการ, ProgressBar, ScrollBar, Slider, ToolTip · มุม 0: ขอบตรงที่ชนกัน (สองส่วนของ SplitButton) และด้าน flyout ที่ติดตัวเปิด | ปุ่มมุม 12, dialog มุม 4 |
| WF20 | เป้ากด ≥40×40 แม้ภาพเล็กกว่า (หรือสูง 32 ถ้ากว้าง ≥120) · เน้น touch 44×44 เว้น ≥4 · เป้าที่กดผิดแล้วเสียหายต้องมีที่ว่างมากขึ้นและห่างขอบ · density มีแค่ default กับ compact: compact เหมาะกับงาน productivity/กรอกข้อมูลที่ใช้เมาส์/คีย์บอร์ด ใช้แล้วให้บันทึกว่ายอมต่ำกว่า 40 | ปุ่มไอคอน 24×24 ชิดกัน, ลบอยู่ติดบันทึก |

### คำสั่ง เมนู คีย์บอร์ด focus

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF21 | ปุ่มที่หน้าที่หลักคือเปิดคำสั่งเพิ่ม ใช้ **menu** (คลิกซ้าย) · สิ่งที่มีหน้าที่อื่น (ข้อความ รูป รายการ) ใช้ **context menu** (คลิกขวา/กดค้าง) ใส่เฉพาะคำสั่งรองของสิ่งนั้น · Cut/Copy/Paste/Delete/Share จัดเป็นแถวแนวนอนบน (CommandBarFlyout) · คำสั่งใช้บ่อยและมีที่ วางเป็นปุ่มตรง ๆ · เมนูปิดเมื่อคลิกนอก · ประกาศ/ขอยืนยันใช้ dialog/flyout ไม่ใช่เมนู | "ลบ" มีแต่ในเมนูคลิกขวา |
| WF22 | รายการเมนู: ใส่ไอคอนเฉพาะรายการใช้บ่อย ไอคอนที่รู้จัก หรือสื่อได้ดี ไม่ใส่ไอคอนกำกวม (ไม่ต้องครบ) ขนาด 16 · จัดกลุ่มด้วย separator · ปุ่มลัดแสดงท้ายรายการ · คำสั่งเยอะใช้ MenuBar บนสุดของหน้าต่าง (Microsoft ไม่กำหนดชุดเมนูมาตรฐานแบบ HM1 ตัวอย่างใน docs คือ File, Edit, View, Help) | ไอคอนกำกวมทุกรายการ |
| WF23 | **accelerators** ตามแบบแผน ไม่เอาไปทำอย่างอื่น: Ctrl+Z ย้อน · Ctrl+Y ทำซ้ำ · Ctrl+X/C/V · Ctrl+A · Ctrl+F ค้น · F3 ถัดไป · Ctrl+H แทนที่ · Ctrl+N ใหม่ · Ctrl+S บันทึก · Ctrl+W ปิด · Ctrl+P พิมพ์ · F2 เปลี่ยนชื่อ · Del ลบ (undo ได้) / Shift+Del (undo ไม่ได้) · F5 หรือ Ctrl+R รีเฟรช · Ctrl +/−/0 ซูม · F6/Shift+F6 สลับ pane · Ctrl+E เข้าโหมดแก้ไข · แสดงใน tooltip ("Copy (Ctrl+C)") หรือ label เมนู · ของ context menu ทำงานเฉพาะใน element นั้น · ไม่ override ปุ่มลัดในตัว control | Ctrl+S ไป "ส่งข้อมูล" |
| WF24 | **access keys:** กด Alt แสดง keytip · ตัวเดียว (Alt+ตัวนั้นได้ทันที) ไม่เกิน 2 · ไม่ชนกันใน scope เยอะให้แบ่ง scope · ใช้ตัวแรกหรือพยัญชนะเด่น · เลี่ยง I/1, O/0 · ตามแบบที่คุ้น (F = File, H = Home) · แปลตามภาษา | สองปุ่มใน scope เดียวใช้ "S" |
| WF25 | **focus visual** ของระบบ (เส้นนอก 2 + ใน 1 ห่าง 1) ปรับสีตาม brand ได้ · คีย์บอร์ดใช้ focus rectangle เป็น feedback ถ้าปิด (`UseSystemFocusVisuals=False`) ต้องมีของตัวเองแทน (ข้อของทีม: Microsoft ให้ปิดได้) · control ที่ทำเองรองรับ accelerator/access key | กด Tab แล้วไม่รู้ว่าอยู่ปุ่มไหน |

### Dialog และการแจ้งเตือน

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF26 | **ปุ่ม ContentDialog:** มีปุ่มปลอดภัย (Close/Cancel) เสมอ อยู่**ขวาสุด** ทำงานเดียวกับ Esc · ปุ่ม "ทำ" 1–2 ปุ่มอยู่ซ้าย (Primary ซ้ายสุด Secondary กลาง) · 3 ปุ่มใช้น้อยและ Secondary ต้องต่างจากปุ่มปิดชัด · ป้ายตอบคำถามตรง ๆ และสั้น (Delete/Cancel, Allow/Block) · default button ได้ 1 ปุ่ม (สี accent รับ Enter) ไม่ตั้งก็ได้ | dialog ลบมีแต่ "OK", Cancel อยู่ซ้ายสุด |
| WF27 | ใช้ dialog เมื่อแจ้งเรื่องสำคัญ ขอคำยืนยัน หรือสถานะร้ายแรงจนต้องบล็อก · บรรทัดแรกบอกปัญหา/เป้าหมาย · title สั้น ไม่บังคับ แต่สัมพันธ์กับปุ่ม · เนื้อหาบังคับ ไม่พูดซ้ำ title · error เฉพาะจุด (validation) แสดง inline · เปิดได้ทีละ 1 ต่อหน้าต่าง · ข้อมูลของ element ใช้ Flyout · ช่วงสอนใช้ TeachingTip | dialog "รหัสผ่านสั้นไป" |
| WF28 | **InfoBar** สำหรับสถานะระดับ app ที่ต้องรู้/ทำอะไร (เน็ตหลุด, บันทึกอัตโนมัติล้มเหลว) inline ไม่ลอยทับ · severity ตรงเนื้อหา: Error เกิดแล้ว, Warning อาจเกิด, Success งานเบื้องหลังเสร็จ, Informational ทั่วไป · ต้องมีข้อความ ไม่ใช้สี/ไอคอนอย่างเดียว · ไม่กระพริบเข้า-ออกเร็ว · ปิดไม่ได้เฉพาะเมื่อต้องค้างจนแก้สถานะ · ไม่ใช้ยืนยัน action ที่ไม่เปลี่ยนสถานะ app, แจ้งเร่งด่วน หรือข้อความไม่จำเป็น | InfoBar "คัดลอกแล้ว", แถบแดงไม่มีข้อความ |

### สี ธีม วัสดุ ไอคอน

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WF29 | รองรับ light และ dark ค่าตั้งต้นตามธีมของผู้ใช้ · accent ใช้น้อย เน้นสิ่งสำคัญและสถานะของสิ่งที่กดได้ · สีเดียวบอก "กดได้" · contrast พอทุกธีม/ทุก accent · ไม่ใช้แดง-เขียวเป็นตัวแยกอย่างเดียว · คิดความหมายสีตามวัฒนธรรม | ออกแบบ light อย่างเดียว |
| WF30 | **contrast themes:** ใช้คู่ SystemColor ไม่ hardcode: Window+WindowText (พื้น/ข้อความ/สิ่งที่กดไม่ได้), ButtonFace+ButtonText (สิ่งที่กดได้), Highlight+HighlightText (เลือก/hover/pressed), Hotlight เฉพาะลิงก์, GrayText เฉพาะ disabled (ไม่ใช้กับข้อความรอง) · พื้นสองส่วนกลืนกันให้เพิ่มเส้นขอบเฉพาะโหมดนี้ (flyout/dialog ขอบ 2) · ทดสอบ 4 ธีม Aquatic, Desert, Dusk, Night sky | พื้นเทาอ่อน hardcode ใต้ข้อความขาว |
| WF31 | **Mica** เป็น base layer ของหน้าต่างที่เปิดนาน ควรเห็นใน title bar (ชั้นบนโปร่ง) · Mica Alt เมื่อ title bar เป็นแท็บ/ต้องแยกแถบกับส่วนคำสั่ง · ใช้ backdrop ครั้งเดียวต่อ app ไม่ทาเป็นพื้น element · มีสถานะ fallback สีทึบ (inactive, ปิด transparency, Battery Saver, เครื่องสเปกต่ำ) | การ์ดทุกใบเป็น Mica |
| WF32 | **ไอคอน** Segoe Fluent Icons (แทน Segoe MDL2 Assets) ขนาด 16/20/24/32/40/48/64 · ไม่ใช้ glyph E0xx–E5xx (deprecated) · ไม่แทรกในบรรทัดข้อความ · **ห้าม ship ฟอนต์นี้ไปแพลตฟอร์มอื่น** (ดาวน์โหลดไปออกแบบ/พัฒนาบน Mac ได้ แต่ ship ไม่ได้) | ไอคอน 18 เบลอ, bundle ฟอนต์ไปกับ build Mac |

## แอปที่รันทั้ง Windows และ Mac

ทำ artboard แถบบนแยก OS ไม่ใช้ภาพเดียวแล้วสลับปุ่ม

| เรื่อง | Windows | Mac | ตรวจที่ |
|---|---|---|---|
| ปุ่มหน้าต่าง | มุม**ขวา**บน ย่อ → ขยาย → ปิด | มุม**ซ้าย**บน ปุ่มของระบบ ไม่วาดเอง | WF1–WF2 / HM18 |
| เว้นที่ในแถบบนที่ทำเอง | มุมขวาให้ปุ่ม caption (ระบบบอกขนาดผ่าน `RightInset`/`LeftInset`) ของที่กดได้เป็น passthrough | มุมซ้ายให้ปุ่มของระบบ | WF1, WF5 / HM18 |
| เมนู | ไม่มี menu bar ของระบบ เมนูอยู่ในหน้าต่าง (MenuBar, ปุ่มเปิดเมนู, context menu) | menu bar ของระบบที่ขอบจอ ทุกคำสั่งเฉพาะ app และทุกปุ่มบน toolbar ต้องมีในเมนู | WF21–WF22 / HM1–HM3, HM9 |
| ผลต่อแถบบนตัวเดียว | คำสั่งที่บน Mac อยู่ใน menu bar ต้องมีที่อยู่ในหน้าต่าง | แถบบนไม่แทน menu bar ต้องมี menu bar คู่เสมอ | WF22 / HM9 |
| ปุ่มลัด | Ctrl (+ Alt access keys, F-keys) · ทำซ้ำ Ctrl+Y | Command · Settings = Command-, | WF23–WF24 / HM5 |
| Settings | รายการท้าย nav pane | เมนูชื่อ app → Settings… | WF12 / HM1 |
| ชื่อหน้าต่าง | ชื่อ app ที่มีความหมาย | บอก view ไม่ใช้ชื่อ app | WF7 / HM16 |
| ป้ายภาษาอังกฤษ | sentence case ทุกที่ | ชื่อเมนูหลายคำ title-style | WF16 / HM4 |
| ไอคอนในเมนู | เฉพาะที่สื่อได้ ไม่ต้องครบ | ทั้งกลุ่มหรือไม่มีเลย | WF22 / HM6 |
| ลำดับปุ่ม dialog | "ทำ" ซ้าย ปุ่มปลอดภัยขวาสุด | ยังไม่ยืนยันจาก Apple และไม่มีใน HM ห้ามคัดลอกลำดับ Windows ไปเอง | WF26 |
| ตัวอักษร | Segoe UI Variable body 14 ขั้นต่ำ 12 · ไทย Leelawadee UI | SF Pro body 13 ขั้นต่ำ 10 | WF16–WF17 / HF2 |
| เป้ากด | ≥40×40 | ปริยาย 28×28 ขั้นต่ำ 20×20 | WF20 / HF3 |
| วัสดุ | Mica เป็นพื้นหน้าต่าง | Liquid Glass บนชั้นควบคุม | WF31 / HF8–HF11 |
| ไอคอน | Segoe Fluent Icons (ship ไป Mac ไม่ได้) | SF Symbols | WF32 / HM13, HM25 |

## วิธีใช้
- **survey:** เช็ก requirement ที่ชน WF3 (title bar ทำเองแต่ต้องคง snap — ขึ้นกับ stack), WF4 (แถบสูงกว่า 48), WF10 (ขนาดต่ำสุดกับ snap), WF17 (ฟอนต์ไทย), WF32 (license ฟอนต์ไอคอนเมื่อมี build Mac) และคำสั่งที่บน Mac อยู่ใน menu bar แต่บน Windows ยังไม่มีที่อยู่
- **ui:** ระบุข้อ WF ที่ใช้ เบี่ยงข้อไหนเขียนเหตุผล ทำ artboard title bar ที่ระบุ drag region, passthrough, พื้นที่ปุ่ม caption, active/inactive และหน้าจอหลักใน light, dark และ contrast theme อย่างน้อย 1 ธีม app สองระบบทำคู่กับ artboard Mac ตามตารางด้านบน
- **review:** ให้ผล ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ WF1–WF32 ในหัวข้อ Review พร้อมจุดที่ต้องแก้ ข้อที่เบี่ยงโดยมีเหตุผลบันทึกไว้ไม่นับไม่ผ่าน ให้อ้างจุดที่บันทึก ใช้คู่กับ `../../common/wcag-aa.md`

## ระดับความรุนแรงเมื่อไม่ผ่าน
- **สูง:** จัดการหน้าต่างไม่ได้ อ่าน/กดไม่ได้ หรือเสี่ยงด้าน license (WF1, WF5, WF20 เป้าเล็กกว่าขั้นต่ำโดยไม่ได้ตัดสินใจ, WF25, WF26 ไม่มีปุ่มปลอดภัย, WF28 สื่อด้วยสีอย่างเดียว, WF30, WF32 ship ฟอนต์ไอคอนไป Mac)
- **กลาง:** ใช้ได้แต่ไม่คุ้น/สับสน (WF2, WF3, WF4, WF6, WF8, WF9, WF10, WF12, WF13, WF14, WF16, WF17, WF21, WF22, WF23, WF24, WF27, WF29, WF31)
- **ต่ำ:** ความประณีต (WF7, WF11, WF15, WF18, WF19)

## ยังไม่ยืนยัน (อย่าใส่ตัวเลขเอง)
- ความกว้างปุ่ม caption: ไม่พบในหน้าที่อ่าน อ่านจาก `LeftInset`/`RightInset` ตอน runtime
- ความสูง control แบบ compact: หน้า Compact sizing ไม่ระบุตัวเลข
- ปุ่ม caption เมื่อแถบสูงกว่า 48: Microsoft ไม่กำหนด
- ลำดับปุ่ม alert ของ macOS: หน้า Apple HIG Alerts โหลดเนื้อหาไม่ได้รอบนี้
