---
updated: 2026-11-02
source: m3.material.io (เนื้อหารุ่น 2026-10-13, M3 Expressive) หน้า breakpoints, scaffold, typography, color roles/dynamic, shape, elevation, motion easing, buttons, FAB, dialogs, bottom sheets, snackbar, chips, lists, text fields, app bars, navigation bar/rail · developer.android.com หน้า design/ui/mobile/guides (system-bars, accessibility, predictive-back), develop/ui/compose (window size classes, designsystems/material3), guide/topics/ui/accessibility/apps, guide/navigation/principles, guide/navigation/custom-back/predictive-back-gesture, guide/topics/ui/notifiers/toasts, training/permissions/requesting, notification-permission, about/versions/14/features, about/versions/16/behavior-changes-16 · อ่านเมื่อ 2026-11-02 สรุปด้วยคำของทีม
used_by: survey, ui, review
---

# Material 3: กติกาออกแบบแอป Android

ใช้เมื่อ module มี platform `mobile` และ os มี `android` อ้างเป็นเลขข้อ เช่น "MD22: dialog มี 3 ปุ่ม"
อ่านคู่กับ `../../common/` เสมอ ไฟล์นี้ไม่เขียนกฎทั่วไปซ้ำ อ้างเลข UI# แทน · brand ของโปรเจกต์ชนะเรื่องสี/ฟอนต์ ไฟล์นี้ชนะเรื่องพฤติกรรมระบบ (back, insets, permission)
M3 รุ่นล่าสุดคือ **M3 Expressive**: navigation drawer → expanded navigation rail, medium/large top app bar → แบบ flexible, small FAB ไม่แนะนำแล้ว
ถ้าไม่ใช่แอป Android (เช่น เว็บบนมือถือ) ตอบ "ไม่เกี่ยวข้อง" ไม่ใช่ "ผ่าน" · **dp** ใช้กับ layout/ระยะ · **sp** ใช้กับตัวอักษร (ขยายตามที่ผู้ใช้ตั้ง)

## Window size class (ใช้ตรวจ MD1, MD2, MD6)

แบ่งตาม**ความกว้างหน้าต่างที่แอปได้** ไม่ใช่ขนาดเครื่อง (split screen, foldable, หมุนจอ เปลี่ยน class ระหว่างใช้ได้)

| Class | ความกว้าง | ตัวอย่าง | Pane | Margin | Spacer ระหว่าง pane | Navigation ที่แนะนำ |
|---|---|---|---|---|---|---|
| Compact | < 600dp | มือถือแนวตั้ง | 1 | 16dp | – | navigation bar หรือ modal expanded rail |
| Medium | 600–839dp | แท็บเล็ตแนวตั้ง, foldable กางแนวตั้ง | 1 (แนะนำ) หรือ 2 | 24dp | 24dp | navigation bar หรือ navigation rail |
| Expanded | 840–1199dp | แท็บเล็ตแนวนอน, foldable กางแนวนอน, มือถือแนวนอน | 1 หรือ 2 (แนะนำ) | 24dp | 24dp | navigation rail (collapsed/expanded) |
| Large | 1200–1599dp | แท็บเล็ตจอใหญ่ | 1 หรือ 2 (แนะนำ) | 24dp | 24dp | navigation rail |
| Extra-large | ≥ 1600dp | จอ desktop | 1–3 (แนะนำ) ไม่เกิน 3 | 24dp | 24dp | expanded navigation rail |

ความสูง: compact < 480dp (มือถือแนวนอน) · medium 480–899dp · expanded ≥ 900dp ส่วนใหญ่ดูแค่ความกว้างพอ ยกเว้นความสูง compact ที่ทำ 2 pane ไม่ได้จริง

## เกณฑ์ตรวจ

### Layout และ system bars

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD1 | ออกแบบอย่างน้อย compact + medium + expanded และระบุว่าหน้าเปลี่ยนอย่างไรเมื่อ class เปลี่ยนระหว่างใช้ (หมุนจอ, กาง foldable, split screen) ตัดสินจากความกว้างหน้าต่าง ไม่ใช่ "เป็นแท็บเล็ตไหม" ดู UI51 | มีแค่ artboard มือถือแนวตั้ง, แท็บเล็ตแสดงหน้ามือถือยืด |
| MD2 | margin: compact 16dp, medium ขึ้นไป 24dp · spacer ระหว่าง pane 24dp · medium ใช้ 2 pane เฉพาะเนื้อหาไม่แน่น แบ่ง 50/50 · fixed pane กว้าง 360dp (expanded) / 412dp (large ขึ้นไป) · side sheet ≤ 400dp · ไม่เกิน 3 pane ดู UI5, UI8 | margin 8dp บนแท็บเล็ต |
| MD3 | แอปที่ target API 36 (Android 16) บนจอ smallest width ≥ 600dp ระบบ**ไม่สนใจ**การล็อก orientation, resizability, aspect ratio (ยกเว้นเกม) → ต้องมี layout แนวนอนและจอใหญ่จริง · แท็บเล็ตแนวนอน/foldable กาง: ส่วนบน 25% ของจอเอื้อมยาก จำกัด interaction ตรงนั้น | ใช้ "ล็อกแนวตั้งบนแท็บเล็ต" เป็นทางออก |
| MD4 | Edge-to-edge: บังคับกับแอปที่ target API 35 (Android 15) และ target API 36 เลี่ยงไม่ได้แล้ว → เนื้อหาวาดใต้ status/navigation bar ทุกหน้า design ต้องระบุ inset: status bar โปร่งใส (โปร่งแสงถ้าเนื้อหาเลื่อนผ่าน) · gesture navigation bar โปร่งใส **ห้ามใส่พื้นหลัง** · แบบ 3 ปุ่มใช้ scrim โปร่งแสงเมื่อเนื้อหาเลื่อนผ่าน · ปุ่ม/ข้อมูลไม่ถูก system bar หรือ display cutout บัง | ปุ่ม "ส่ง" อยู่ใต้ navigation bar, แถบสีทึบใต้ gesture handle |
| MD5 | ไม่วาง touch target หรือ gesture ลากใน system gesture inset (ขอบซ้าย-ขวาที่ปัด back, ขอบล่างที่ปัดกลับ home) · คีย์บอร์ดขึ้นแล้วช่องที่พิมพ์ยังเห็น · immersive mode (ซ่อน system bars) แตะแล้วเรียก bar กลับได้ | slider ชิดขอบจอชนปัด back, ช่องรหัสผ่านถูกคีย์บอร์ดบัง |

### Navigation และ back

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD6 | ตัวนำทางตาม class: compact = navigation bar (ล่าง) หรือ modal expanded rail · medium = navigation bar หรือ rail · expanded ขึ้นไป = navigation rail ที่ขอบ leading · rail มี 3–7 ปลายทาง แนวตั้งเท่านั้น collapsed rail ห้ามซ่อน ปุ่มเมนูและ FAB ชิดบน · M3 Expressive ใช้ **expanded rail แทน navigation drawer** (standard วางข้างเนื้อหา, modal ทับเนื้อหา เปิดจากปุ่มเมนู) | แถบล่างยืดเต็มแท็บเล็ตแนวนอน, rail วางแนวนอน |
| MD7 | Navigation bar: 3–5 ปลายทางที่สำคัญเท่ากัน (< 3 ใช้ tabs, > 5 ใช้ tabs หรือ modal expanded rail) · **มี label เสมอ** · ตำแหน่งคงที่ ไม่เลื่อน/สลับ เหมือนกันทุกหน้าระดับบน · active หนึ่งอันเสมอ · ไม่ใช้กับหน้างานเดี่ยว | 6 แท็บล่าง, ไอคอนไม่มีชื่อ |
| MD8 | Top app bar: search, small (รวมแบบชื่อกลาง), medium flexible, large flexible · leading = Back/Up หรือ Menu · trailing action 1 ปุ่ม (2 ถ้าจำเป็น) มากกว่านั้นใช้ toolbar · เลี่ยง overflow menu · เลื่อนเนื้อหาแล้วพื้นเปลี่ยนเป็น surface container | app bar 4 ไอคอน + ⋮ |
| MD9 | System Back (ปัดจากขอบซ้าย**หรือขวา** หรือปุ่ม) ใช้ได้ทุกหน้า design ต้องระบุผลของ Back ทุกจุด: ปิด sheet/dialog/search ก่อน → ถอยตามประวัติ → ที่หน้าเริ่มต้น (start destination) ออกจากแอป · Up ใน app bar ทำงานเหมือน Back ในแอปแต่**ไม่เคยออกจากแอป** ไม่แสดงที่หน้าเริ่มต้น · เข้าจาก deep link แล้วกด Up ถอยผ่านหน้าในแอปถึงหน้าเริ่มต้น · login/onboarding ไม่ใช่หน้าเริ่มต้น | Back ใน bottom sheet แล้วหลุดออกแอป, Back แล้วกลับหน้า login |
| MD10 | Predictive back (เห็นปลายทางระหว่างปัด): Android 15+ แสดง animation ของระบบกับแอปที่รองรับ แอป target API 36 บน Android 16 เปิดเป็นค่าตั้งต้น → ดัก Back ได้เฉพาะตรรกะ UI ที่จำเป็น เช่น ยืนยันทิ้งข้อมูลที่ยังไม่บันทึก · sheet และ search ของ Material มี animation ให้แล้ว · ทำ transition เอง: ย่อเหลือ 90% เว้นขอบ 8dp fade-through ที่ 35% ของการปัด ไม่ให้ดูเหมือนปัดแล้วทิ้งรายการ | ขึ้น "ออกจากแอปใช่ไหม" ทุกครั้งที่กด Back |

### สัมผัสและการเข้าถึง (เสริม WCAG AA ใน common)

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD11 | touch target ≥ **48×48dp** ทุกตัวที่กดได้ แม้ภาพเล็กกว่า (ขยายพื้นที่กดเกินขอบภาพ) · เล็กกว่าได้เฉพาะ pointer แม่นยำ (เมาส์/trackpad) ดู UD6 | ไอคอนลบ 24dp ไม่มีพื้นที่กดเพิ่ม |
| MD12 | TalkBack: ไอคอน/ภาพที่มีความหมายมีคำอธิบาย**จุดประสงค์** ไม่ใส่ชนิด ("ส่ง" ไม่ใช่ "ปุ่มส่ง") · ไม่ซ้ำกัน โดยเฉพาะแถวใน list · ภาพตกแต่งตั้งเป็น null · งานที่ทำด้วย gesture ต้องมีทางอื่นที่มองเห็น (ปัดลบ + ปุ่มถังขยะ) · จัดกลุ่มให้ข้ามเป็นบล็อกได้ | ปุ่ม "ดู" 20 อันใน list อ่านเหมือนกันหมด |
| MD13 | ตัวอักษรใช้ sp (รวม line height) body ≥ 12sp · Android 14+ ขยายได้ถึง **200%** แบบไม่เป็นเชิงเส้น → มีภาพที่ 200% ข้อความไม่ถูกตัด ไม่ล้น container สูงตายตัว · ไม่ใช้ sp กับ padding · ภาษาไทย: target API 36 เลิกฟอนต์ UI แบบเตี้ยของอักษรไทย เผื่อความสูงบรรทัด ดู UI24, UI28 | ป้ายปุ่มเป็น "บันทึ..." ที่ 200% |
| MD14 | contrast: ข้อความ < 18sp (ตัวหนา < 14sp) ≥ 4.5:1 นอกนั้น ≥ 3:1 · ไอคอนและขอบของสิ่งที่กดได้ ≥ 3:1 · สิ่งที่กดได้ (เช่น ลิงก์) บอกด้วยมากกว่าสี ดู UI29 | ไอคอนเทาอ่อนบนขาว 2:1 |

### Typography, สี, รูปทรง, ความสูง

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD15 | ใช้บทบาทของ type scale ตามหน้าที่ (ตารางท้ายเกณฑ์) ไม่ตั้งขนาดนอก scale · เลือกชุดย่อยแล้วใช้สม่ำเสมอ · display = ข้อความสั้นเด่น, body = เนื้อหา, label = ป้ายใน component · ใช้ฟอนต์ brand แทน Roboto ได้แต่คงลำดับขนาด ดู UI23, UI27 | ตั้ง 15/17/19sp เองทั่วแอป |
| MD16 | ใช้ **color role** ไม่ใช้ hex ตายตัว: ข้อความ/ไอคอนใช้ on-role คู่กับพื้นของมัน (on primary บน primary, on primary container บน primary container) · container เป็นพื้นเท่านั้น · ลำดับชั้นพื้นผิวใช้ surface container 5 ระดับ · ขอบสำคัญ (ช่องกรอก) ใช้ outline เส้นคั่นตกแต่งใช้ outline variant **ห้าม**ใช้ outline variant เป็นขอบสิ่งที่กดได้ · error คงที่แม้ใช้ dynamic color ดู UI30, UI33 | ปุ่มพื้น tertiary container ตัวหนังสือ primary container |
| MD17 | Dynamic color (Android 12+ สีจากวอลเปเปอร์): ถ้าใช้ ต้องมี scheme สำรองสำหรับเครื่องที่ไม่รองรับ และต้องอ่านได้กับวอลเปเปอร์หลายโทน (ทดสอบด้วย Material Theme Builder) · มีทั้ง light และ dark · ถ้า brand ต้องการสีคงที่ ระบุว่าไม่ใช้ dynamic color | ข้อความอ่านไม่ออกเมื่อวอลเปเปอร์โทนเหลือง |
| MD18 | มุมโค้งตาม scale: 0 · 4 · 8 · 12 (medium) · 16 · 20 · 28 (extra large) · 32 · 48dp · full · ค่าตั้งต้น: ปุ่ม = full, การ์ด = medium, dialog และขอบบน bottom sheet = 28dp · ชุดเดียวทั้งแอป ไม่ใช้มุมใหญ่กับ component ข้อมูลแน่น · ของซ้อน: มุมใน = มุมนอก − padding | การ์ดแต่ละหน้ามุมไม่เท่ากัน |
| MD19 | elevation ระดับ 0–3 = 0/1/3/6dp ใช้ขณะพัก · ระดับ 4–5 = 8/12dp เฉพาะ hover/ลาก · แสดงด้วย**สีพื้นผิว** เป็นหลัก ใช้เงาเฉพาะเมื่อจำเป็น (พื้นหลังลายมาก, ชวนโต้ตอบ) · scrim ใต้ modal 32% opacity | การ์ดทุกใบมีเงาหนาบนพื้นเรียบ |

### Component

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD20 | ลำดับปุ่ม: สูง = FAB, filled (งานสุดท้าย/ปลดล็อก flow) · กลาง = tonal, elevated, outlined · ต่ำ = text, icon button · แต่ละหน้ามี**ปุ่มเด่นปุ่มเดียว**สำหรับ action หลัก · ปุ่มคู่วางข้างกันเมื่อมีที่ ดู UI9, UI34 | filled 3 ปุ่มในหน้าเดียว |
| MD21 | FAB: ไม่เกิน **1 ตัวต่อหน้า** ใช้กับ action หลักเชิงสร้าง (สร้าง, แชร์, เริ่ม) ไม่ใช่ action เล็กหรือทำลาย · compact/medium มุมขวาล่าง (เหนือหรือฝังใน navigation bar) · expanded ขึ้นไปบนซ้ายใน rail · ต้องมีข้อความใช้ extended FAB · มือถือใช้ medium FAB จอใหญ่ใช้ large FAB (small ไม่แนะนำแล้ว) · ไม่มีอะไรทับ FAB | FAB "ลบ", FAB 2 ตัว |
| MD22 | Dialog: เฉพาะเรื่องด่วน/สำคัญที่ต้องตัดสินใจ (เรื่องรองใช้ snackbar) · ปุ่ม**ไม่เกิน 2**: ยืนยันอยู่ขอบ trailing ปฏิเสธอยู่ซ้ายของมัน (RTL กลับด้าน) เรียงแนวตั้งให้ยืนยันอยู่บน · ปุ่มเดียวได้เฉพาะ "รับทราบ" · ป้ายยืนยันเป็นกริยาเจาะจง ("ส่ง", "ลบ") ไม่ใช่ "ตกลง/OK" · ห้าม disable ปุ่มปฏิเสธ · หัวเรื่องเป็นคำถามชัด ไม่ใช่ "แน่ใจไหม" · กว้าง 280–560dp มุม 28dp · full-screen dialog เฉพาะ compact กับฟอร์ม/หลายขั้น ปิดโดยยังไม่บันทึกต้องถามยืนยันทิ้ง | 3 ปุ่มมี "ดูเพิ่มเติม", "ตกลง" อยู่ซ้าย |
| MD23 | Bottom sheet: compact/medium (expanded ขึ้นไปใช้ side sheet) · เนื้อหารอง ไม่ใช่เนื้อหาหลัก · modal ปิดได้ด้วยแตะ scrim, ปัดลง, ปุ่มปิด, Back · สูงเริ่มต้นไม่เกิน 50% ของจอ · กว้างไม่เกิน 640dp มุมบน 28dp · หลายความสูงต้องมี drag handle (กด 48dp) หรือทางเลือกที่กดครั้งเดียว | sheet เปิดมาสูง 90% |
| MD24 | Snackbar: ล่างจอ เหนือ FAB ไม่บัง navigation/ปุ่มที่ใช้บ่อย · ครั้งละ**อันเดียว** action ไม่เกิน 1 · ไม่มี action หายเองใน 4–10 วินาที มี action ค้างจนผู้ใช้ตอบ · compact ไม่เกิน 2 บรรทัด ไม่มีไอคอน/ลิงก์ · ผลสำคัญต้องเห็นในหน้าด้วย (ปุ่มเปลี่ยนเป็น "บันทึกแล้ว") เพราะบางคนอ่านไม่ทัน ดู UI22 | snackbar มี "เลิกทำ" และ "ดู" |
| MD25 | Toast ≠ snackbar: toast เป็น popup ของระบบ (target Android 12+ ไม่เกิน 2 บรรทัด มีไอคอนแอป) ไม่มีปุ่ม · แอปอยู่หน้าจอใช้ snackbar · อยู่เบื้องหลังและต้องให้ผู้ใช้ทำอะไรใช้ notification | "ลบแล้ว" เป็น toast ไม่มีทางเลิกทำ |
| MD26 | Chip 4 แบบ: assist (action อัจฉริยะ), filter (กรอง), input (ข้อมูลที่ผู้ใช้ใส่ เช่น ผู้รับ), suggestion (คำแนะนำ) · แสดงเป็น**ชุด** ไม่เดี่ยว เลื่อนแนวนอนได้ · ไม่ใช้จบ/เดินหน้างาน (ใช้ปุ่ม) · สูง 32dp พื้นที่กด 48dp | chip "ยืนยันสั่งซื้อ" อันเดียว |
| MD27 | List: แถวสูง 56/72/88dp ตาม element สูงสุด · จัดกึ่งกลางแนวตั้ง ยกเว้นแถว ≥ 88dp หรือ 3 บรรทัดขึ้นไปชิดบน · หนึ่ง list มีโหมดเลือกแบบเดียว หนึ่งแถวมีการเลือกแบบเดียว · ปัดเปิด action ต้องมีทางอื่น (MD12) | แถวเดียวมี checkbox และ bookmark |
| MD28 | Text field: label **เห็นตลอด** บรรทัดเดียว ไม่ถูกตัด (placeholder แทน label ไม่ได้) · ไม่ผสม filled กับ outlined ในฟอร์มเดียว · ช่องบังคับใส่ `*` ท้าย label อธิบาย `*` ครั้งเดียวต้นฟอร์ม · error **แทนที่** supporting text (ไม่เพิ่มบรรทัดจน layout กระโดด) อยู่ใต้ช่องจนแก้ บอกวิธีแก้ ควรมีไอคอน error · มีจำกัดตัวอักษรให้มีตัวนับ · สูง 56dp ดู UI33 | label หายเมื่อพิมพ์, error เป็นแค่ขอบแดง |

### Motion และ permission

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD29 | Motion: M3 Expressive ย้ายไประบบ spring (ค่า easing/duration เดิมยังใช้ได้แต่ไม่ดูแลต่อ) · ค่าเดิม: emphasized 500ms, emphasized decelerate 400ms (เข้า), emphasized accelerate 200ms (ออก), standard 300/250/200ms · ออก/ปิด/ยุบ**สั้นกว่า**เข้า · short 50–200, medium 250–400, long 450–600, extra long 700–1000ms (ambient เท่านั้น) · ไม่เร็วจนกระตุกหรือช้าจนรอ ดู UI38 | ปิด sheet 600ms นานกว่าตอนเปิด |
| MD30 | Runtime permission: ขอ**ในบริบท**ตอนผู้ใช้เริ่มใช้ฟีเจอร์ ไม่ขอตอนเปิดแอป · dialog ของระบบแก้ข้อความไม่ได้ → ออกแบบหน้าอธิบายเหตุผล (เมื่อระบบบอกว่าควรแสดง) ว่าเข้าถึงอะไร ได้อะไร มีปุ่ม "ไม่ตอนนี้" · ถูกปฏิเสธ: แอปยังใช้ได้มากที่สุด บอกเจาะจงตรงฟีเจอร์ที่ใช้ไม่ได้ ไม่ขวางด้วยหน้าเต็มจอ ไม่รบเร้า/ส่งไปหน้าตั้งค่าเพื่อเกลี้ยกล่อม · ปฏิเสธ 2 ครั้ง = ถาวร ระบบไม่ถามอีก · ตำแหน่ง/ไมค์/กล้องมี "เฉพาะครั้งนี้" (Android 11+) · Android 13+ แอปติดตั้งใหม่**ปิด notification เป็นค่าตั้งต้น** ขอหลัง action ที่เกี่ยว (กดกระดิ่ง, ติดตาม) | ขอกล้อง ตำแหน่ง notification รวดเดียวที่ splash |

### ต่างจาก iOS (ตรวจเมื่อ design เดียวใช้สองระบบ)

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| MD31 | ข้อเท็จจริงฝั่ง Android ที่ทำให้ copy design จาก iOS ตรง ๆ ไม่ได้: (1) **system Back ทุกหน้า** ปัดได้ทั้งขอบซ้ายและขวา (MD5, MD9) · (2) จอ expanded ขึ้นไปใช้ rail ที่ขอบ leading ไม่ใช่แถบล่าง (MD6) · (3) ปุ่มยืนยันใน dialog อยู่ trailing (MD22) · (4) toast, หน้าอธิบาย permission เป็นกลไกของ Android (MD25, MD30) · (5) Up ไม่ออกจากแอป Back ที่หน้าแรกออก · ฝั่ง iOS ไม่ได้ตรวจในไฟล์นี้ | ปุ่ม "<" มุมซ้ายบนเป็นทางย้อนทางเดียว ไม่ระบุผลของ system Back |

### Type scale ค่าตั้งต้น (ใช้ตรวจ MD15)

ขนาด/ความสูงบรรทัดเป็น sp ฟอนต์ตั้งต้น Roboto (Regular ถ้าไม่ระบุ) scale ฐาน 14 อัตราส่วน 1.125 · M3 Expressive มีชุด emphasized อีก 15 แบบ (หนักกว่า) ใช้คู่กับชุดนี้เพื่อเน้น/สถานะเลือก

| บทบาท | Large | Medium | Small |
|---|---|---|---|
| Display | 57/64 | 45/52 | 36/44 |
| Headline | 32/40 | 28/36 | 24/32 |
| Title (Medium) | 22/28 | 16/24 | 14/20 |
| Body | 16/24 | 14/20 | 12/16 |
| Label (Medium) | 14/20 | 12/16 | 11/16 |

## ยังไม่ได้ตรวจ (ห้ามใช้เป็นเหตุตีตก)
- ความสูง navigation bar/top app bar, ความกว้าง rail, ขนาด FAB และความสูงปุ่ม — เว็บทางการให้เป็นรูป spec อ่านเป็นข้อความไม่ได้ ใช้ค่าจาก Compose Material 3 แทนการตั้งเอง
- reduce motion ของ M3 — ไม่พบในหน้าที่อ่าน ใช้ WCAG ใน common
- พฤติกรรมฝั่ง iOS ใน MD31

## วิธีใช้
- **survey:** เช็ก requirement ที่ชนข้อจำกัดระบบ: ล็อกแนวตั้งบนแท็บเล็ต (MD3), action ด้วยการปัดขอบจอ (MD5), ขอ permission/notification ตอนเปิดแอป (MD30), เมนูหลักเกิน 5 (MD7), popup 3 ตัวเลือก (MD22) แจ้งเป็นความเสี่ยงพร้อมทางเลือก
- **ui:** artboard compact + medium + expanded (MD1) และภาพที่ font 200% (MD13) ใส่ inset ของ system bars ทุก artboard (MD4) เขียนตาราง "Back จากหน้านี้ไปไหน" ต่อหน้า/overlay (MD9) ใช้ token ของ M3 แทนค่าตายตัว ข้อที่เบี่ยงเขียนเหตุผล
- **review:** ผล ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ MD1–MD31 พร้อมจุดที่ต้องแก้ ตรวจคู่กับ UI# ที่อ้าง หมวด "ยังไม่ได้ตรวจ" ให้แค่ข้อสังเกต

## ระดับความรุนแรงเมื่อไม่ผ่าน
- **สูง:** ผู้ใช้ติด ทำงานหลักไม่ได้ หรือเข้าถึงไม่ได้ (MD4 ปุ่มถูก system bar บัง, MD5 control ชน gesture/ช่องกรอกถูกคีย์บอร์ดบัง, MD9 Back ทำให้หลุดออกแอป/วนกลับ login, MD11, MD12, MD13 ข้อความถูกตัดที่ 200%, MD14, MD30 ปฏิเสธ permission แล้วใช้แอปต่อไม่ได้)
- **กลาง:** ใช้ได้แต่ผิดที่ผู้ใช้ Android คาด หรือพังบางขนาดจอ (MD1, MD2, MD3, MD6, MD7, MD10, MD16, MD17, MD20, MD21, MD22, MD23, MD24, MD25, MD28, MD31)
- **ต่ำ:** ความประณีตและความสม่ำเสมอ (MD8, MD15, MD18, MD19, MD26, MD27, MD29)
