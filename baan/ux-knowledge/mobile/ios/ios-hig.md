---
updated: 2026-11-02
source: Apple HIG https://developer.apple.com/design/human-interface-guidelines/ หน้า layout (แก้ล่าสุด 2026-09-09), designing-for-ios, designing-for-ipados, status-bars, going-full-screen (2025-06-09), multitasking (2025-06-09), windows (2025-06-09), split-views (2025-06-09), tab-bars (2026-06-08), sidebars (2026-06-08), toolbars (2025-12-16), sheets (2026-03-24), modality (2023-12-05), alerts (2024-02-02), action-sheets, menus (2026-06-08), context-menus (2023-12-05), the-menu-bar (2025-06-09), lists-and-tables (2023-06-21), search-fields (2026-06-08), accessibility (2025-06-09), gestures (2026-10-28), typography (2025-12-16), sf-symbols (2025-07-28), virtual-keyboards (2025-06-09), entering-data (2023-06-21), playing-haptics (2024-05-07), privacy (2023-06-21), launching (2024-06-10), onboarding (2024-06-10), pointing-devices (2026-10-28), keyboards (2025-06-09) · วันในวงเล็บ = แถวบนสุดของ Change log (ไม่มีวัน = หน้านั้นไม่แสดง change log) · อ่านจากเว็บ Apple เมื่อ 2026-11-02 สรุปด้วยคำของทีม
used_by: survey, ui, review
---

# HIG: app บน iPhone และ iPad

ใช้เมื่อ module มี platform `mobile` และ os มี `ios` อ้างเป็นเลขข้อ เช่น "IO14: sheet มี Done แต่ไม่มี Cancel"
ไฟล์นี้มีเฉพาะของ iOS/iPadOS ของที่ใช้ร่วมกับ macOS อยู่ใน `../../desktop/apple/hig-foundations.md` ตรวจคู่กันเสมอ:
- ใช้กับ iOS ตรง ๆ: HF1 (hierarchy), HF4–HF7 (สี), HF8–HF11 (Liquid Glass, แยกตัวควบคุมจากเนื้อหา), HF14 (ป้ายปุ่ม), HF16 (มีทางอื่นนอกจาก gesture)
- HF2, HF3, HF12, HF13, HF15 เขียนด้วยค่าของ Mac บน iOS ใช้ IO25, IO22, IO4–IO7, IO34 แทน
- สารบัญและหลักตัดสินเมื่อไม่มีกฎเฉพาะ: `../../desktop/apple/hig.md`

brand ของโปรเจกต์กำหนดหน้าตา ไฟล์นี้คือขั้นต่ำและพฤติกรรมที่คนใช้ iPhone/iPad คาดหวัง ถ้าขัดกันให้บันทึกเป็นข้อตัดสินใจ ข้อที่ขึ้นต้น "iPad:" ให้ "ไม่เกี่ยวข้อง" ถ้า module ไม่ทำ iPad
**HIG เปลี่ยนทุกปี** (รอบใหญ่ทุกมิถุนายน + แก้ย่อยกลางปี) ก่อนอ้างเป็นข้อกำหนดกับ dev ให้เปิดหน้าต้นฉบับเทียบวัน change log อีกครั้ง เลขข้อ IO เป็นของทีม ไม่ใช่ของ Apple

## ตัวเลขที่ต้องจำ

| เรื่อง | ค่า | หน้า |
|---|---|---|
| ตัวอักษรปริยาย / ต่ำสุด | 17 pt / 11 pt | Typography |
| พื้นที่กดปริยาย / ต่ำสุด | 44×44 pt / 28×28 pt | Accessibility |
| ระยะรอบตัวควบคุม | ~12 pt (มีกรอบ) / ~24 pt (ไม่มีกรอบ) | Accessibility |
| sheet detents ของระบบ | large = เต็มสูง, medium ≈ ครึ่งของ large | Sheets |
| ปุ่มใน alert | ไม่เกิน 3 | Alerts |
| เมนู small / medium / large | แถวบน 4 ไอคอนไม่มีป้าย / 3 ไอคอน+ป้าย / รายการล้วน (ปริยาย) | Menus |
| tab ตั้งต้นเมื่อให้ปรับแต่งบน iPad | ≤ 5 | Tab bars |
| title ของ view | < 15 ตัวอักษร | Toolbars |

**ไม่ยืนยัน (ไม่ใส่ตัวเลข):** ความสูง status bar / home indicator / Dynamic Island, ขนาดจอแต่ละรุ่น, จำนวน tab สูงสุดบน iPhone — หน้า Layout ฉบับปัจจุบันไม่มีตาราง spec อุปกรณ์ และ Tab bars บอกแค่ "tab ยิ่งน้อยยิ่งไปง่าย" ให้ใช้ template จาก Apple Design Resources + safe area ของระบบ

### Dynamic Type ที่ขนาดปริยาย (Large)

| Style | น้ำหนัก | ขนาด/leading (pt) | | Style | น้ำหนัก | ขนาด/leading (pt) |
|---|---|---|---|---|---|---|
| Large Title | Regular | 34/41 | | Callout | Regular | 16/21 |
| Title 1 | Regular | 28/34 | | Subhead | Regular | 15/20 |
| Title 2 | Regular | 22/28 | | Footnote | Regular | 13/18 |
| Title 3 | Regular | 20/25 | | Caption 1 | Regular | 12/16 |
| Headline | Semibold | 17/22 | | Caption 2 | Regular | 11/13 |
| Body | Regular | 17/22 | | | | |

ตัวเน้น (emphasized): Title ขึ้นไป = Bold, ที่เหลือ = Semibold · Body ตามระดับ: xSmall 14 · Small 15 · Medium 16 · **Large 17** · xLarge 19 · xxLarge 21 · xxxLarge 23 · AX1 28 · AX2 33 · AX3 40 · AX4 47 · AX5 53 pt

## เกณฑ์ตรวจ

### Layout, safe area, system UI

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO1 | เนื้อหาและตัวควบคุมอยู่ใน safe area/margin ของระบบ ไม่ถูก Dynamic Island, status bar, home indicator, แถบระบบบัง ภาพพื้นหลังเต็มจอลากไปใต้แถบได้ (HF11) | ปุ่มใต้ Dynamic Island, ปุ่มหลักทับ home indicator |
| IO2 | Status bar: เนื้อหาที่เลื่อนไปใต้ต้องถูกพรางด้วย scroll edge effect ให้อ่านออกและไม่ดูเหมือนกดได้ ซ่อนได้ชั่วคราวตอนดูสื่อเต็มจอ เรียกกลับด้วย gesture ง่าย (แตะครั้งเดียว) ห้ามซ่อนถาวร | ปุ่มโผล่ใต้นาฬิกา, ซ่อน status bar ทุกหน้า |
| IO3 | เต็มจอ: คงพฤติกรรม home indicator ปริยาย (ซ่อนเอง ปัดครั้งเดียวออก) เลื่อนเป็นปัดสองครั้งเฉพาะเมื่อผู้ใช้หลุดออกโดยไม่ตั้งใจจริง ตัวควบคุมจำเป็นเรียกได้เสมอ แถบที่ซ่อนกลับมาด้วยแตะ/ปัดลง ผู้ใช้เลือกออกจากเต็มจอเอง | เลื่อน home gesture ใน app อ่านข่าว, หาปุ่ม pause ไม่เจอ |
| IO4 | ตัดสิน layout ด้วย size class (compact/regular ทั้งกว้างและสูง) ไม่ใช่รุ่นเครื่องหรือแนวจอ ออกแบบครบทุกคู่ที่เกิดได้ ทดสอบ layout ใหญ่สุดและเล็กสุดก่อน | มีแค่ iPhone แนวตั้งทั้งที่ module รองรับ iPad |
| IO5 | ฟีเจอร์เท่าเดิมเมื่อ size class เปลี่ยน เปลี่ยนได้แค่ปริมาณที่เห็น (regular width: tab bar → sidebar, ดึงของจาก overflow ออกมา) | iPad ไม่มีปุ่มแก้ไขที่ iPhone มี |
| IO6 | รองรับการหมุนถ้าไม่มีเหตุผลล็อก เปิดตามแนวที่ถืออยู่ landscape-only ต้องถูกทั้งหมุนซ้ายและขวา ล็อกแนวแล้วก็ยังปรับขนาดได้ดี | หมุน iPad แล้ว layout แตก |
| IO7 | iPad: ใช้ได้ทั้งเต็มจอและ windowed ทุกความกว้าง (แคบ, compact, กลาง) ตอน windowed ปุ่มควบคุมหน้าต่างอยู่ขอบ leading ของ toolbar อย่าวางปุ่มตรงนั้น รองรับหลายหน้าต่าง บันทึก/คืนสถานะเสมอ หยุดสื่อเมื่อสลับออก งานที่ผู้ใช้สั่งทำต่อใน background | ย่อหน้าต่างแล้ว split view ไปต่อไม่ได้ |

### Navigation

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO8 | Tab bar ใช้นำทาง ไม่ใช่ action (action ใช้ toolbar) เห็นตลอดยกเว้นตอน modal ทับ ทุก tab มีป้าย (คำเดียวถ้าได้) + SF Symbols แบบ fill ไม่ disable/ซ่อน tab ถ้าว่างอธิบายในหน้า badge เฉพาะเรื่องสำคัญ | tab "+ สร้าง", tab หายเมื่อยังไม่ login |
| IO9 | tab ยิ่งน้อยยิ่งดี เลี่ยงจน tab ล้นเป็น "More" โครงลึกใช้ sidebar หรือ tab bar ที่แปลงเป็น sidebar ได้ iPhone: ลอยล่างจอบน Liquid Glass, ย่อได้เมื่อมี accessory, search เป็น tab ท้ายได้ · iPad: tab bar อยู่บน | 7 tab บน iPhone จน 3 tab ไปอยู่ใน More |
| IO10 | iPad: เริ่มจาก tab bar ส่วนเยอะใช้แบบ sidebar-adaptable หรือ split view sidebar ≤ 2 ชั้น ซ่อน/แสดงด้วย edge swipe ของระบบ split view ใช้เฉพาะ regular width และไฮไลต์ที่เลือกค้างทุก pane | iPhone แนวตั้งแสดง 2 pane, sidebar 4 ชั้น |
| IO11 | แถบบน (navigation bar = toolbar บน): title สั้นบอกตำแหน่ง ไม่ใช้ชื่อ app หน้าระดับบนใช้ large title ที่ยุบเมื่อเลื่อนและใหญ่กลับเมื่อถึงบนสุด ใช้ปุ่ม Back/Close มาตรฐาน (สัญลักษณ์ ไม่ใช่คำ "Back") ทำเองต้องเหมือนทั้ง app | ปุ่ม "< กลับ" วาดเองต่างกันแต่ละหน้า |
| IO12 | ปัดจากขอบซ้ายเพื่อย้อนกลับใช้ได้ทุกหน้าที่มี Back ห้ามเอาการปัดขอบจอไปทำอย่างอื่นหรือสร้าง gesture ชน gesture ระบบ ปุ่ม Back ยังต้องอยู่ (ทีมสรุปเอง ดูหมายเหตุท้ายไฟล์) | carousel เต็มจอกินการปัดขอบจนย้อนไม่ได้ |

### Modality

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO13 | ใช้ modal เมื่อมีประโยชน์ชัด สั้น ง่าย มีชื่อบอกงาน ไม่เป็น app ซ้อน app (หน้าย่อยมีทางเดียว) ปิดได้ชัดแบบ iOS (ปุ่มใน toolbar บน หรือปัดลง) ทีละอัน งานยาว/หลายขั้น (แก้รูป, กล้อง) ใช้ full-screen modal | sheet ซ้อน sheet, ปิดได้ทางเดียวคือกดส่ง |
| IO14 | Sheet: Cancel ที่ leading ของ toolbar บน, Done ที่ trailing มี Done ต้องคู่ Cancel (หรือ Back ใน flow หลายขั้น) ไม่แสดงทั้ง 3 ปุ่มพร้อมกัน ปัดลงปิดได้ ถ้ามีข้อมูลยังไม่บันทึกให้ถามด้วย action sheet | มีแต่ Done, ปัดปิดแล้วข้อความหายเงียบ |
| IO15 | Detents: large เสมอ เพิ่ม medium เมื่อเปิดเผยทีละชั้นได้ (แบบ share sheet) เต็มสูงอย่างเดียวเมื่อต้องพื้นที่เขียน sheet ปรับขนาดได้ต้องมี grabber (ใช้กับ VoiceOver ได้) iPad: ใช้ page/form sheet | medium-only ที่เนื้อหาถูกตัด |
| IO16 | Alert: ใช้น้อย ไม่ใช้แจ้งข้อมูลเปล่า ไม่ใช้กับการลบที่ undo ได้ ไม่แสดงตอนเปิด app · title บอกเหตุชัด ≤ 2 บรรทัด · ปุ่ม ≤ 3 ชื่อ 1–2 คำเป็นกริยา "OK" เฉพาะ alert แจ้งข้อมูล ปุ่มยกเลิกชื่อ "Cancel" และไม่เป็น default · ปุ่ม default อยู่ trailing/บนสุด Cancel อยู่ leading/ล่างสุด · destructive style เฉพาะการทำลายที่ผู้ใช้ไม่ได้ตั้งใจเลือก · ไม่ให้ alert ต้องเลื่อน | "Error 329" ปุ่ม Yes/No, alert ทุกครั้งที่ลบแชท |
| IO17 | Action sheet: ใช้ให้เลือกต่อจาก action ที่ตั้งใจทำ (ไม่ใช้ alert หรือ menu แทน) title บรรทัดเดียว destructive อยู่บนสุด Cancel อยู่ล่างสุด ไม่ต้องเลื่อน | ยกเลิกร่างแล้วไม่มีตัวเลือก "บันทึกร่าง" |
| IO18 | Menu: เลือก layout ให้เข้างาน (small = action กลุ่มเดียวกัน, medium = 3 action สำคัญ) · Context menu (กดค้าง): รายการน้อยและเกี่ยวกับสิ่งที่กด ทุกรายการทำได้จากหน้าหลักด้วย submenu ≤ 1 ชั้น ซ่อน (ไม่ทำจาง) รายการที่ใช้ไม่ได้ มี context menu หรือ edit menu อย่างเดียว ทำสม่ำเสมอทั้ง app | "ลบ" อยู่ใน context menu ที่เดียว |

### Toolbar, list, search

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO19 | Toolbar iPhone: เฉพาะ action สำคัญสุด ที่เหลือใส่เมนู More · action หลัก 1 ปุ่ม prominent ที่ trailing · SF Symbols ไม่มีกรอบ (ใช้ข้อความเมื่อสัญลักษณ์สื่อไม่ได้ เช่น Edit) · ปุ่มข้อความเว้นช่องจากปุ่มอื่น · ≤ ~3 กลุ่ม · ไม่ทาพื้น/ย้อมสีเอง (HF10–HF11) · iPad: อยู่แถวเดียวกับ tab bar ได้ ระบบทำ overflow เอง | 6 ปุ่มชิดกัน, prominent 2 ปุ่ม |
| IO20 | List: grouped style แยกกลุ่ม เข้าหน้าลึกใช้ disclosure indicator ปุ่ม info ใช้ดูข้อมูลเพิ่มเท่านั้น ไม่ใส่ index ตัวอักษรเมื่อแถวมี accessory ด้าน trailing แถวนำทางไฮไลต์ค้าง แถวตัวเลือกใช้ checkmark เลือกหลายรายการผ่าน edit mode ข้อความสั้น แถวสูงขึ้นตาม Dynamic Type swipe action ต้องมีทางอื่นด้วย (HF16) | ปุ่ม ⓘ พาไปหน้าลูก, ลบได้ด้วยการปัดอย่างเดียว |
| IO21 | Search iPhone: เป็น tab (แบบหน้า landing มีคำแนะนำ หรือแบบปุ่มเปิดคีย์บอร์ดทันที), ใน toolbar (ล่างถ้ามีที่ บนเมื่อของสำคัญอยู่ล่างจอ) หรือ inline เหนือรายการที่ค้น · placeholder บอกว่าค้นอะไรได้ ค้นขณะพิมพ์ มีคำค้นล่าสุด/คำแนะนำ scope เริ่มกว้าง · iPad: trailing ของ toolbar หรือบนสุดของ sidebar หน้า search เฉพาะให้ focus ทันที ยกเว้นมีแต่คีย์บอร์ดบนจอ | search ซ่อนในเมนู ⋯, placeholder แค่ "Search" |

### Touch และ gesture

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO22 | พื้นที่กด ≥ 44×44 pt (ต่ำสุด 28×28) แม้ไอคอนเล็กกว่า เว้น ~12 pt รอบตัวมีกรอบ ~24 pt รอบตัวไม่มีกรอบ | ไอคอน 20 pt ชิดกัน |
| IO23 | Gesture มาตรฐานคงความหมาย: แตะ = เปิด/เลือก, ปัด = เผย action/ปิด/เลื่อน, ลาก = ย้าย, กดค้าง = ตัวเลือกเพิ่ม, แตะสองครั้ง/pinch = ซูม, หมุน = หมุนวัตถุ ของ iOS: ปัดสามนิ้ว undo/redo, pinch สามนิ้ว copy/paste, เขย่า = undo, iPad ปัดสี่นิ้ว = สลับ app | แตะสองครั้ง = กดถูกใจบนรูปที่ซูมไม่ได้ |
| IO24 | Gesture เฉพาะ app เมื่อจำเป็น: ค้นพบได้ ทำง่าย ไม่ซ้ำอันอื่น ไม่ใช่ทางเดียวของงานสำคัญ ไม่ชน gesture ระบบ มี feedback ทันที บอกเมื่อใช้ไม่ได้ (เช่น วัตถุถูกล็อก) | ปัดสองนิ้วเพื่อส่งงาน ไม่มีปุ่ม |

### ตัวอักษร สัญลักษณ์ การป้อนข้อมูล

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO25 | ใช้ text styles ของ Dynamic Type เป็นฐาน (ฟอนต์ brand ต้องรองรับ Dynamic Type และ Bold Text เอง) ≥ 11 pt ที่ขนาดปริยาย ใช้ได้ทุกระดับถึง AX5: ของเรียงแนวนอนเปลี่ยนเป็นซ้อน แถวสูงขึ้น ไม่ทับ ตัดข้อความน้อยสุด (ที่ AX ใหญ่สุดเห็นข้อความใช้ได้เท่าที่ xxxLarge) ลดคอลัมน์ ลำดับสำคัญคงเดิม ไอคอนที่สื่อความหมายขยายตาม | ฟอนต์ fix 14 pt, ขยายแล้วป้าย "..." ทุกแถว |
| IO26 | SF Symbols ก่อน ให้ component เลือก variant (tab bar = fill, toolbar = outline) น้ำหนักเท่าข้อความข้าง ๆ เน้นด้วย scale ใช้สีระบบเพื่อรองรับ Dark Mode ไอคอนเองทำเป็น custom symbol (vector) ห้ามใช้ SF Symbols หรือรูปคล้ายใน app icon/โลโก้ เช็กว่ามีใน iOS รุ่นต่ำสุดที่รองรับ | โลโก้ทำจาก SF Symbol, ไอคอน PNG แตก |
| IO27 | คีย์บอร์ดบนจอตรงชนิดข้อมูล (email, URL, number/decimal/phone pad) ปุ่ม Return ตรงงาน (เช่น Search) ใช้ keyboard layout guide ให้ช่องที่พิมพ์และปุ่มถัดไปไม่ถูกบัง แถบเหนือคีย์บอร์ดใส่เฉพาะที่เกี่ยวกับข้อมูลนั้น | ช่องเบอร์โทรเปิดคีย์บอร์ด ABC, "บันทึก" อยู่ใต้คีย์บอร์ด |
| IO28 | ดึงข้อมูลจากระบบแทนให้พิมพ์ (ขออนุญาตก่อน) ให้เลือกแทนพิมพ์ ใส่ค่าเริ่มต้น ข้อมูลลับใช้ secure field ห้ามเติมรหัสผ่านไว้ก่อน (ใช้ passkey/keychain/biometric) มีปุ่ม Clear ที่ trailing ตรวจค่าทันที ปุ่ม Next ใช้ได้เมื่อกรอกที่จำเป็นครบ | พิมพ์จังหวัดเอง, แจ้ง error ทีเดียวหลังส่งฟอร์มยาว |

### Feedback สิทธิ์ การเปิด app

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO29 | Haptics: ใช้ที่ติดมากับ control มาตรฐาน เพิ่มเองใช้ตามความหมาย — notification (ผลของงาน), impact (กระทบ/snap), selection (ค่ากำลังเปลี่ยน) สม่ำเสมอ เสริม feedback ที่เห็น สั้น ไม่พร่ำเพรื่อ ปิดได้โดย app ยังใช้ได้ครบ ไม่รบกวนกล้อง/ไมค์ | สั่นทุกครั้งที่เลื่อนรายการ |
| IO30 | ขอสิทธิ์เฉพาะที่ใช้ ตอนผู้ใช้เริ่มใช้ฟีเจอร์ ไม่ขอตอนเปิด app เว้นแต่ขาดไม่ได้ purpose string บอกว่าใช้ทำอะไรและทำไม (ไม่ใช่ "เพื่อประสบการณ์ที่ดีขึ้น") หน้าก่อน alert ระบบมีปุ่มเดียวที่เปิด alert ไม่มีปุ่มปิด/ข้าม ไม่ใช้คำ "Allow" ไม่ให้รางวัล ไม่วาด alert ปลอมหรือชี้ปุ่ม tracking ต้องผ่าน alert ระบบก่อนเก็บข้อมูล | เปิดครั้งแรกขอ 4 สิทธิ์รวด, ลูกศรชี้ปุ่ม Allow |
| IO31 | Launch screen แทบเหมือนหน้าแรก ไม่มีข้อความ ไม่มีโลโก้เว้นแต่เป็นส่วนของหน้าแรก ไม่ใช่ splash/โฆษณา เปิดเร็ว เปิดตามแนวจอ คืนสถานะเดิม (หน้า, ตำแหน่งเลื่อน) เมื่อเปิดใหม่ | โลโก้ใหญ่บนพื้นสีแบรนด์แล้วหน้าแรกพื้นขาว |
| IO32 | Onboarding หลัง launch: สั้น ให้ลองทำจริง ใช้ tip ตามบริบทได้ดีกว่า tutorial ข้ามได้ ข้ามแล้วไม่โผล่อีกแต่หาเปิดได้ สอนเฉพาะ app ไม่ใส่ license เลื่อนการตั้งค่าที่ไม่จำเป็น ขอ rating/ซื้อหลังผู้ใช้ได้ใช้จริง splash (ถ้ามี) แสดงสั้น | onboarding 6 หน้าบังคับดู, ขอรีวิวตั้งแต่เปิดแรก |

### iPad: pointer และคีย์บอร์ด

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| IO33 | iPad: รองรับ pointer ด้วย effect ระบบ — highlight (กลุ่มปุ่มในกระจก), lift (ปุ่มเดี่ยว/ชิ้นเล็กพื้นทึบ), hover (ชิ้นใหญ่) ปุ่ม/ช่องข้อความใช้ pointer มาตรฐาน ปุ่มเรียงในแถบมี hit region ต่อกัน ผลเท่ากันทั้งแตะและคลิก ตัวควบคุมที่ซ่อนเองเรียกได้ด้วย pointer secondary click เปิด context menu ไม่มีข้อความสอนติด pointer | toolbar ทำเอง hover แล้วไม่ highlight, คลิกขวาไม่ได้เมนู |
| IO34 | iPad: คีย์บอร์ดจริง — shortcut มาตรฐานเหมือน Mac shortcut ของ app เฉพาะคำสั่งใช้บ่อย Command หลัก Shift รอง Option น้อย เลี่ยง Control เรียง Control-Option-Shift-Command รองรับ Full Keyboard Access Esc/Command-. ปิด alert ได้ · menu bar ของ iPad (ซ่อนจนชี้/ปัดลงจากขอบบน) เรียงแบบ Mac ตาม HM1–HM8 ใน `../../desktop/apple/hig-macos-bars.md` | Command-F ไม่เปิด search, menu bar ไม่มีคำสั่งของ app |

## วิธีใช้
- **survey:** เช็กว่า requirement ชนข้อจำกัด iOS ไหม — ขอสิทธิ์ตอนเปิด app (IO30), alert ตอนเปิด (IO16), action ที่มีแต่ gesture (IO24, HF16), ส่วนหลักเกิน tab bar (IO9–IO10), งานยาวที่ต้อง full-screen modal (IO13), และต้องรองรับ iPad/แนวนอน/windowed ไหม (IO4–IO7) ถ้าไม่ระบุ iPad ให้ถาม ไม่เดา
- **ui:** artboard อย่างน้อย iPhone compact width แนวตั้ง + (ถ้าทำ iPad) regular width และหน้าต่างแคบ + 1 artboard Dynamic Type ระดับ AX (IO25) วาง safe area จริง (IO1) ใช้ตัวเลข/text styles ในไฟล์นี้เป็นฐานแล้วใส่ brand ใช้ component มาตรฐานแทนวาดใหม่ ระบุเลข IO/HF ที่ใช้ เบี่ยงข้อไหนเขียนเหตุผล
- **review:** ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ IO1–IO34 ร่วมกับ HF ที่ระบุต้นไฟล์ พร้อมจุดที่ต้องแก้

## ระดับความรุนแรงเมื่อไม่ผ่าน
- **สูง:** ทำงานหลักไม่ได้ ติด หรือเสียข้อมูล — IO1 ปุ่มถูกระบบบัง, IO7 iPad windowed ใช้ไม่ได้, IO12 ย้อนกลับไม่ได้, IO13 modal ปิดไม่ได้, IO14 ปัดปิดแล้วข้อมูลหาย, IO22 พื้นที่กด < 28 pt, IO25 ไม่รองรับ Dynamic Type, IO27 ช่อง/ปุ่มถูกคีย์บอร์ดบัง, IO30 หน้าขอสิทธิ์ชักนำ (เสี่ยง App Store ปฏิเสธ)
- **กลาง:** ใช้ได้แต่ไม่คุ้น/สับสน/รบกวน — IO2–IO6, IO8–IO11, IO15–IO21, IO23, IO24, IO28, IO31–IO34
- **ต่ำ:** ความประณีต — IO26, IO29, IO22 ที่ ≥ 28 แต่ < 44 pt

## หมายเหตุแหล่ง
- ตัวเลขทุกตัวมาจากหน้าใน `source` ณ 2026-11-02 ยกเว้นที่เขียนว่าไม่ยืนยัน
- IO12 ทีมสรุปเอง: HIG ปัจจุบันบอกให้ปัดเพื่อย้อนกลับได้ (Designing for iOS), ห้ามสร้าง gesture ชน gesture ระบบ, gesture ลัดเสริมไม่แทนปุ่ม Back (Gestures) แต่ไม่มีประโยคตรงว่า "ห้ามแย่ง edge swipe back"
- หน้า Navigation bars เดิมถูกรวมเข้า Toolbars แล้ว (navigation bar = toolbar ด้านบน)
