---
updated: 2026-11-02
source: web.dev · MDN · W3C (Understanding WCAG 2.2, WAI-ARIA APG) · GOV.UK Design System + Service Manual · NN/g · Baymard · Bootstrap 5.3 / Tailwind / Android window size classes (ค่า breakpoint) · StatCounter (ต.ค. 2026) · อ่านจากเว็บเมื่อ 2026-11-02 สรุปด้วยคำของทีม (รายการหน้าและ URL ท้ายไฟล์)
used_by: survey, ui, review
---

# เว็บแอป: layout, navigation, ตาราง, ฟอร์ม และพฤติกรรมของ browser

ใช้เมื่อ module มี `platform: web` (เช่น dashboard ครูบนคอมโรงเรียน 1024–1440 px + หน้า admin) อ้างเป็นเลขข้อ เช่น "WB17: เรียงแล้วไม่บอกทิศทาง"
ไฟล์นี้ตัดสิน**ระดับ design** (โครงหน้า, flow, state, สิ่งที่ต้อง annotate ให้ dev) ไม่ซ้ำกับ:
- `../common/wcag-aa.md` (WA#) — ตัวเกณฑ์ WCAG ไฟล์นี้บอกแค่ว่าบนเว็บต้องออกแบบอะไรเพิ่มให้ผ่าน · `../common/` อื่น (H#, UI#, UD#) อ้างเลขข้อแทนการเขียนซ้ำ
- skill `skills/web-design-guidelines/references/rules.md` (Vercel Web Interface Guidelines, ย่อ **WIG**) — ตรวจ**โค้ด** HTML/CSS รายบรรทัด อ้างเป็นหมวด เช่น "WIG: Forms"

ข้อความที่ขึ้นต้น **ดุลยพินิจทีม:** ไม่ใช่มาตรฐานภายนอก ใช้เป็นข้อเสนอแนะ ห้ามใช้ตีตกระดับสูง · module ไม่ใช่เว็บ → "ไม่เกี่ยวข้อง" ทั้งไฟล์ · หน้าไม่มีของนั้น (เช่น ไม่มีตาราง) → ข้อนั้น "ไม่เกี่ยวข้อง"

## หน่วยที่ต้องรู้ก่อน
- ขนาดทั้งหมดเป็น **CSS px**: CSS px = pixel จริง ÷ `devicePixelRatio` และ zoom ของ browser ทำให้ CSS px ใหญ่ขึ้น (MDN) → จอ 1920 ที่ตั้ง Windows scaling 125% เหลือ viewport ราว 1536 CSS px · zoom 200% บนจอ 1280 เหลือ 640
- StatCounter (desktop ไทย ต.ค. 2026): 1920×1080 26.8% · 1536×864 10.9% · 1366×768 7.4% (1536×864 น่าจะคือจอ 1920 ที่ scaling 125% — ทีมอนุมาน) ใช้เป็นภาพรวม ค่าที่ตัดสินจริงมาจาก analytics ของผู้ใช้ระบบเอง (WB33)
- ความสูงที่ใช้ได้จริงน้อยกว่าจอ เพราะแถบแท็บ/address bar และ taskbar กินไป — 1366×768 คือกรณีเตี้ยที่ต้องเผื่อ

## เกณฑ์ตรวจ

### Layout และการเลื่อน

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB1 | design ระบุ**ความกว้างที่ออกแบบ** (CSS px) อย่างน้อย 3 จุด: ต่ำสุดที่รองรับเต็มรูป, ความกว้างหลัก, จอกว้าง มี artboard ทุกจุดสำหรับหน้าหลัก **ดุลยพินิจทีม:** dashboard ครูใช้ 1024 / 1366 / 1920 | มี artboard 1440 อันเดียว ไม่รู้ว่า 1024 เป็นอย่างไร |
| WB2 | breakpoint ตัดสินจาก**เนื้อหา** (จุดที่ layout เริ่มพัง) ไม่ใช่รุ่นอุปกรณ์ (web.dev) ถ้าใช้ชุดสำเร็จ ใช้ของ framework ที่ dev ใช้จริงทั้งชุด ไม่ผสม ไม่ตั้งเลขเอง: Bootstrap 5.3 = 576/768/992/1200/1400 · Tailwind = 640/768/1024/1280/1536 · Android/Material window size class = 600/840/1200/1600 dp (สองตัวแรก mobile-first ด้วย `min-width`) | design แตก layout ที่ 1100 แต่โค้ดใช้ Bootstrap 992/1200 |
| WB3 | ผ่าน WA6 (1.4.10) แม้ไม่ทำมือถือ: 320 CSS px = จอ 1280 ที่ zoom 400% · ข้อยกเว้นสองมิติใช้กับ**ตัวตาราง/กราฟ**เท่านั้น หัวข้อ ช่องค้นหา pagination รอบตารางยัง reflow (Understanding 1.4.10) **ดุลยพินิจทีม:** มี artboard 320 อย่างน้อยหนึ่งหน้าหลัก | zoom 400% แล้วย่อหน้าต้องเลื่อนซ้าย-ขวา |
| WB4 | ผ่าน WA5 (1.4.4) ทุกขั้น 100–200%: บนเว็บพังบ่อยที่กล่อง**สูงตายตัว** (F69) และช่องกรอกไม่โตตามตัวอักษร (F80) → ใช้ความสูงตามเนื้อหา ตัดด้วย … ได้เฉพาะป้ายที่เปิดดูเต็มได้ · ห้ามปิด zoom (WIG: Anti-patterns) | การ์ดสูง 80 px ตายตัว zoom 150% ตัวเลขล้น |
| WB5 | จอกว้าง ≥ 1600: ย่อหน้าข้อความยังจำกัดความยาวบรรทัด (UI28) grid ข้อมูล/ตารางยืดได้ **ดุลยพินิจทีม:** ระบุใน design ว่าส่วนไหนยืด ส่วนไหนมีความกว้างสูงสุด | คำอธิบายยาวเต็ม 1920 px |
| WB6 | ระบุว่าหน้าเลื่อน**ทั้งหน้า**หรือ**เป็น panel** (side nav คงที่ + เนื้อหาเลื่อน) บริเวณที่เลื่อนแยกต้องเลื่อนด้วยคีย์บอร์ดได้ (WA17) ถ้าข้างในไม่มีอะไร focus ได้ annotate ให้ตัวบริเวณ focus ได้ **ดุลยพินิจทีม:** scroll หลักบริเวณเดียวเป็นค่าตั้งต้น scroll ซ้อนทำให้ wheel เลื่อนผิดที่ | หน้า การ์ด และตารางในการ์ดเลื่อนแยก 3 ชั้น |
| WB7 | ส่วนที่ติดจอ (header, filter bar, หัวตาราง, แถบ action, banner) คิดงบความสูงที่ 1366×768 หลังหัก browser และต้องไม่บังสิ่งที่ focus ทั้งชิ้น (WA19; WIG: Focus States) **ดุลยพินิจทีม:** รวมไม่เกินราว 1/3 ของความสูงที่เหลือ | ส่วนติดจอกินครึ่งจอ เห็นข้อมูล 4 แถว |

### URL, ปุ่ม Back และ deep link

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB8 | ทุก "หน้า" ที่ผู้ใช้อาจ bookmark/ส่งต่อ/กลับมาใหม่ มี URL ของตัวเอง และ design ระบุข้อความ `<title>` ต่อหน้า (WA12) **ดุลยพินิจทีม:** รูปแบบ "สิ่งที่ดู – ส่วน – ชื่อระบบ" (ของเฉพาะขึ้นก่อน เพราะแท็บแคบตัดท้าย) หน้าแบ่งหน้าใส่เลขหน้าใน title (GOV.UK) | ทุกแท็บชื่อเดียวกัน เปิด 5 แท็บแยกไม่ออก |
| WB9 | แนบ**ตาราง state↔URL**: state ไหนอยู่ใน URL (filter, sort, หน้า, แท็บ, รายการที่เปิด — WIG: Navigation & State) และเปลี่ยนแล้ว**เพิ่มประวัติ** (Back ย้อนได้) หรือ**แทนที่** **ดุลยพินิจทีม:** ที่รู้สึกเป็น "ไปหน้าใหม่" (เปิดรายการ, เปลี่ยนแท็บหลัก/หน้า) เพิ่ม · พิมพ์ค้นหา/ลาก slider แทนที่ | ทุกตัวอักษรที่พิมพ์ลงประวัติ กด Back สิบครั้ง |
| WB10 | Back ของ browser ทำตามที่คาด (Baymard: เว็บ 59% ผิดอย่างน้อยหนึ่งข้อ): overlay ใหญ่ที่ดูเหมือนหน้าใหม่ → Back = ปิด (NN/g; Baymard 37% ผิด) · รายละเอียด → รายการ ได้ filter/sort/หน้า และ**ตำแหน่ง scroll เดิม** · flow หลายขั้น → กลับขั้นก่อน · ถ้าข้อมูลที่กรอกจะหายต้องเตือน (WIG: Forms) | Back จากรายละเอียดได้หน้า 1 ไม่มี filter |
| WB11 | เปิด deep link ตรง ๆ แล้วทุกกรณีมีหน้าที่ออกแบบไว้: ยังไม่ login → login แล้วพากลับ URL เดิม (**ดุลยพินิจทีม**) · ไม่มีสิทธิ์ → บอกและบอกว่าขอสิทธิ์จากใคร · รายการถูกลบ → บอกและพากลับรายการ · เลขหน้าเกิน → ไปหน้าแรก (GOV.UK) | ครูเปิดลิงก์ใบงาน login แล้วไปโผล่หน้าแรก |

### Navigation

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB12 | เลือก top/side nav ตามจำนวนและการเติบโตของหมวดบนสุด (NN/g): side nav รับหมวดมาก เพิ่มง่าย สแกนง่าย แต่กินความกว้าง · top nav เหมาะหมวดน้อย ประหยัดความกว้าง แต่เพิ่มหมวดแล้วต้องรื้อ · NN/g ไม่ให้ตัวเลขเพดาน อย่าอ้างตัวเลข | top nav 11 หมวดจนตัวเล็กและย่อชื่อ |
| WB13 | บน desktop เมนูหลักเห็นอยู่เสมอ ไม่ซ่อนใน hamburger ป้ายเป็นข้อความชิดซ้าย (NN/g) ยุบเป็นแถบไอคอนได้ถ้าผู้ใช้เลือกเองและขยายกลับได้ ไอคอนมี tooltip (UI19) · ตำแหน่งปัจจุบันชัดทุกชั้นด้วยมากกว่าสี (UI33) + annotate `aria-current="page"` · เมนูอยู่ที่เดิมทุกหน้า (WA36) | 1366 px แต่เมนูอยู่ใน ☰, เมนูที่เลือกต่างแค่สีตัวอักษร |
| WB14 | breadcrumb: ใช้เมื่อโครงลึก ≥ 3 ชั้น (NN/g) แสดง**ตำแหน่งในโครง** ไม่ใช่ประวัติ ลิงก์เฉพาะหน้าที่มีจริง อยู่บนสุดก่อน `<main>` ไม่ใช้แทนตัวบอกขั้นของ flow (UI15) · หน้าปัจจุบัน: GOV.UK ไม่ใส่ / NN/g ใส่แต่ไม่เป็นลิงก์ → **ดุลยพินิจทีม:** เลือกแบบเดียวทั้งระบบ · จอแคบยุบเหลือแรก+สุดท้ายได้ (GOV.UK) | breadcrumb ใน wizard 4 ขั้น, ป้ายหมวดคลิกแล้ว 404 |
| WB15 | design แสดง skip link ("ข้ามไปเนื้อหาหลัก" โผล่เมื่อ tab ครั้งแรก) และ annotate landmark header/nav/main + หัวข้อต้นแต่ละส่วน (WA20) | tab 30 ครั้งกว่าจะพ้นเมนูข้าง |

### ตารางข้อมูล

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB16 | ตารางใช้เทียบข้อมูลแถว/คอลัมน์เท่านั้น ไม่ใช้จัด layout มี caption และหัวคอลัมน์/หัวแถว (GOV.UK) · คอลัมน์แรกเป็นตัวระบุที่คนอ่านออก เรียงตามความสำคัญ ที่เกี่ยวกันอยู่ติดกัน (NN/g) · ตัวเลขที่เทียบกันชิดขวา (หัวชิดตาม) ข้อความชิดซ้าย (GOV.UK; WIG: Typography) | คอลัมน์แรกเป็น `stu_000123` ชื่ออยู่คอลัมน์ 5, คะแนนชิดกลาง |
| WB17 | **เรียง:** หัวคอลัมน์ที่เรียงได้เป็นปุ่ม บอกทิศทางด้วยไอคอน (ไม่ใช่สีอย่างเดียว) เรียงทีละคอลัมน์ annotate `aria-sort` ที่คอลัมน์ที่เรียงอยู่ (WAI-ARIA APG) design บอกการเรียงตั้งต้น · sort/filter มีผลกับ**ข้อมูลทั้งชุด**แล้วพากลับหน้า 1 (GOV.UK) | เรียงคะแนนแล้วเรียงเฉพาะ 20 แถวในหน้าที่เห็น |
| WB18 | **กรอง:** หาเจอง่าย บอกชัดว่ากรองอะไรอยู่ มีปุ่มล้างทั้งหมด (NN/g) แสดงจำนวนผลลัพธ์ filter อยู่ใน URL (WB9) | ตารางเหลือ 3 แถวโดยไม่มีอะไรบอกว่ามี filter ค้าง |
| WB19 | **ข้อมูลยาว:** งานที่ต้องหา เทียบ หรือกลับมารายการเดิม ใช้ pagination หรือปุ่ม "โหลดเพิ่ม" ไม่ใช้ infinite scroll ที่โหลดเอง (GOV.UK: ปัญหากับผู้ใช้คีย์บอร์ด · NN/g: footer หาย Back กลับบนสุด หาของเดิมยาก) · pagination อยู่ใต้เนื้อหา แสดงหน้าแรก/สุดท้าย/ปัจจุบัน/ข้างเคียง ข้ามด้วย … ซ่อนเมื่อมีหน้าเดียว (GOV.UK) · virtual scroll ใช้เมื่อวัดแล้วช้าจริง (web.dev; WIG: Performance) **ดุลยพินิจทีม:** แถวที่ยังไม่ render Ctrl+F หาไม่เจอ → ต้องมีช่องค้นหาของตารางเอง | รายชื่อ 1,200 คน infinite scroll กด Back แล้วเลื่อนหาใหม่ |
| WB20 | ตารางยาว/กว้างเกินจอ: หัวแถวติดบน และคอลัมน์แรกติดซ้ายเมื่อเลื่อนข้าง (NN/g) ตารางกว้างเลื่อนข้าง**ในกรอบตาราง** หน้าทั้งหน้าไม่เลื่อนข้าง (WB3) มีตัวช่วยไล่แถว — เส้น/แถบสลับ/ไฮไลต์แถวที่ hover (NN/g) | เลื่อนถึงแถว 40 แล้วไม่รู้ว่าคอลัมน์ไหนคือสอบย่อยไหน |
| WB21 | **state ของตาราง**ออกแบบครบ: กำลังโหลด (คงโครงคอลัมน์ เกิน ~1 วิมีตัวบอก — UI16) · ว่างเพราะ**ยังไม่มีข้อมูล** (บอกวิธีเพิ่ม) แยกจากว่างเพราะ**filter ไม่เจอ** (บอกเงื่อนไข + ปุ่มล้าง) · โหลดไม่สำเร็จ (สาเหตุ + ลองใหม่ — H9) | filter ไม่เจอ แต่ขึ้น "ยังไม่มีนักเรียน เพิ่มเลย" |
| WB22 | **action ต่อแถว:** inline 1–2 อย่าง ที่เหลือเข้าเมนู · หลายแถวใช้ checkbox + action กลุ่ม + เลือกทั้งหมด · แก้แถวใน panel ข้างแบบไม่ modal (modal บังแถวข้างเคียง) แก้ในเซลล์เฉพาะตารางแคบ (NN/g) **ดุลยพินิจทีม:** "เลือกทั้งหมด" บอกว่าหน้านี้หรือทั้งผลลัพธ์ · ลบต้องยืนยันหรือ undo (H5) | ไอคอน 6 ตัวท้ายแถว, เลือกทั้งหมดแล้วลบ 1,200 คนทั้งที่เห็น 20 |

### ฟอร์ม

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB23 | label อยู่**เหนือ**ช่องและเห็นตลอด ห้ามใช้ placeholder แทน label (web.dev, WA29) บอกช่องบังคับ/ไม่บังคับแบบเดียวทั้งระบบ **ดุลยพินิจทีม:** คอลัมน์เดียวเป็นค่าตั้งต้น | label อยู่ใน placeholder พิมพ์แล้วลืมว่าช่องอะไร |
| WB24 | **จังหวะตรวจ:** ห้ามขึ้น error ขณะยังพิมพ์ (GOV.UK, NN/g) · ตอนออกจากช่องแหล่งต่างกัน (GOV.UK รอ submit / NN/g ตรวจเมื่อกรอกช่องเสร็จ) → **ดุลยพินิจทีม:** ตรวจตอน submit เป็นหลัก ตอนออกจากช่องเฉพาะรูปแบบ (อีเมลผิดรูป) · หลัง submit มี error: สรุปบนสุด + ย้าย focus ไปที่นั่น + ข้อความข้างช่อง + คงค่าที่กรอก + "ผิดพลาด:" หน้า title (GOV.UK) ไม่ใช้ tooltip แสดง error (NN/g) · **ไม่ disable ปุ่ม submit เพื่อบอกว่ากรอกไม่ครบ** ผู้ใช้จะคิดว่าเสีย (web.dev) — ตัวอย่างนี้ใน H5 ใช้ไม่ได้บนเว็บ ปิดได้เฉพาะช่วงกำลังส่ง (WIG: Forms) | ช่องอีเมลแดงตั้งแต่ตัวแรก, ปุ่ม "บันทึก" เทาค้างไม่บอกว่าขาดอะไร |
| WB25 | ช่องข้อมูลของ**ผู้ใช้เอง**ระบุ token `autocomplete` (WA30; MDN): `name` `given-name` `family-name` `email` `tel` `street-address` `postal-code` `bday` `organization` · login: `username` + `current-password` · ตั้งรหัสใหม่: `new-password` · OTP: `one-time-code` · ไม่ให้กรอกอีเมล/รหัสผ่านซ้ำสองช่อง มีปุ่มแสดงรหัสผ่าน (web.dev) | ฟอร์มโปรไฟล์ไม่มี autocomplete, เปลี่ยนรหัสต้องพิมพ์ 2 ครั้ง |
| WB26 | ชนิดช่องตรงข้อมูล: อีเมล/โทร/URL ใช้ชนิดของมัน · **รหัสที่เป็นตัวเลขแต่ไม่ใช่จำนวน** (รหัสนักเรียน, PIN) ใช้ช่องข้อความ + `inputmode="numeric"` ไม่ใช้ `type="number"` (web.dev) · `type="date"` แสดงรูปแบบตาม locale ของ browser ผู้ทำเว็บคุมไม่ได้ (MDN) **ดุลยพินิจทีม:** ถ้าผู้ใช้คิดเป็น พ.ศ. design ต้องระบุวิธีกรอก/แสดงปี และทดสอบกับ browser จริงของโรงเรียน | รหัสนักเรียน `00123` เป็น number field เลข 0 หาย |
| WB27 | **หมดเวลา session:** ผ่าน WA38 (2.2.1 — เตือนก่อนหมด ให้ต่อได้ง่าย) **ดุลยพินิจทีม:** งานยาว (กรอกคะแนนทั้งห้อง) ต้องไม่หายเมื่อหมดเวลา — บันทึกร่างอัตโนมัติ หรือ login ใหม่แล้วกลับมาพร้อมข้อมูลเดิม | กรอก 40 นาที กดบันทึกแล้วเด้งไป login ข้อมูลหาย |

### คีย์บอร์ดและ focus

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB28 | หน้าซับซ้อน (dashboard หลายการ์ด, ฟอร์มสองคอลัมน์, ตารางมี action) design annotate **ลำดับ tab** ให้ตามลำดับอ่าน/ความหมาย (WA17) — ไม่ต้องตรงตำแหน่งภาพเป๊ะ แต่ห้ามข้ามความหมาย (Understanding 2.4.3) | ฟอร์มสองคอลัมน์ tab สลับซ้าย-ขวาตามแถว |
| WB29 | modal: เปิดแล้ว focus เข้า modal ข้างหลังใช้ไม่ได้ ปิดแล้ว focus กลับปุ่มที่เปิด (หรือตัวถัดไป) · panel/เมนูที่ไม่ modal อยู่ถัดจากปุ่มที่เปิดในลำดับ focus (F85) (Understanding 2.4.3) design ระบุ "focus ไปไหน" ทั้งตอนเปิดและปิด | ปิด dialog แล้ว focus เด้งไปบนสุดของหน้า |
| WB30 | design กำหนดหน้าตา focus ของทุก component (WA18; วิธีทำในโค้ดดู WIG: Focus States) · shortcut ตัวอักษรเดียวตาม WA21 · สิ่งที่โผล่เมื่อ hover ตาม WA28 · เป้าคลิกตาม WA23 — บนเว็บที่ใช้เมาส์ ไอคอนแก้ไข/ลบในแถวตารางคือจุดที่พลาดบ่อย | ไอคอนแก้ไข/ลบ 16 px ติดกันท้ายแถว |

### ลิงก์, การพิมพ์ และ browser

| # | เกณฑ์ | ตัวอย่างที่ไม่ผ่าน |
|---|---|---|
| WB31 | ลิงก์เปิดแท็บเดิมเป็นค่าตั้งต้น แท็บใหม่เฉพาะเมื่อออกจากหน้าแล้วข้อมูลที่กรอกจะหาย (เช่น ลิงก์คำอธิบายกลางฟอร์ม) และป้ายบอก "(เปิดในแท็บใหม่)" + `rel="noreferrer noopener"` (GOV.UK; WCAG G201) · เปิดแท็บเองโดยผู้ใช้ไม่ได้ขอ = failure F22/F52 ของ 3.2.5 (AAA จึงไม่บังคับ แต่ถือเป็นสัญญาณเตือน) · ลิงก์ต้องเป็นลิงก์จริงให้ Ctrl/กลางคลิกได้ (WIG: Navigation & State) | ทุกเมนูเปิดแท็บใหม่ ครูมี 15 แท็บระบบเดียว |
| WB32 | หน้าที่ผู้ใช้พิมพ์จริง (รายชื่อห้อง, รายงาน) มี design ฉบับพิมพ์: ซ่อน nav/ปุ่ม/filter bar, กระดาษ/แนว/ขอบด้วย `@page`, จุดตัดหน้าด้วย `break-inside`/`break-before` (MDN) **ดุลยพินิจทีม:** บนกระดาษมีชื่อรายงาน, filter ที่ใช้, วันเวลาที่พิมพ์, เลขหน้า · เอกสารทางการส่งออก PDF แทน print ของ browser | พิมพ์ได้ side nav ครึ่งหน้า แถวขาดกลาง |
| WB33 | **ท่าทีเรื่อง browser:** progressive enhancement — หน้าตาต่างกันเล็กน้อยได้ แต่ทุกคนทำงานหลักได้ · รายการที่รองรับมาจาก analytics ของผู้ใช้จริง ทบทวนเป็นระยะ มีช่องแจ้งปัญหา (GOV.UK Service Manual; GOV.UK เองทดสอบบน Windows ด้วย Edge, Chrome, Firefox) · ของที่ browser วาดเอง (date picker, select, scrollbar) หน้าตาต่างได้ **ดุลยพินิจทีม:** ไม่รู้ว่าคอมโรงเรียนใช้ browser/รุ่นไหน = ช่องโหว่ | design อิง date picker ของ Chrome ทั้งที่ห้องคอมใช้ Firefox |

## วิธีใช้
- **survey (Feasibility):** เช็กว่า requirement ระบุหรือถามได้: ความกว้างต่ำสุดที่รองรับและ browser ของผู้ใช้ (WB1, WB33), หน้าที่ต้องพิมพ์ (WB32), ข้อมูลชุดใหญ่แค่ไหนและผู้ใช้หา/เทียบหรือไล่ดู (WB19), เวลา session (WB27), flow ที่เปิดจากลิงก์ภายนอก/แจ้งเตือน (WB11) รายงานเป็นช่องโหว่ ไม่แก้ requirement เอง
- **ui (Designer):** artboard ตาม WB1 + 320 (WB3) + 1366×768 (WB7) · artboard state ของตาราง (WB21) · ฉบับพิมพ์ถ้ามี (WB32) · แนบตาราง state↔URL (WB9), title ต่อหน้า (WB8), ลำดับ tab และ focus ของ modal (WB28, WB29), token `autocomplete` ต่อช่อง (WB25) ระบุข้อ WB ที่ใช้ ถ้าเบี่ยงเขียนเหตุผล ข้อ "ดุลยพินิจทีม" ที่เลือกต่างไปให้บันทึกไว้
- **review (Reviewer):** ให้ผล ผ่าน/ไม่ผ่าน/ไม่เกี่ยวข้อง รายข้อ WB1–WB33 ในหัวข้อ Review พร้อมจุดที่ต้องแก้ ถ้ามี HTML/prototype ให้รัน skill `web-design-guidelines` แยกแล้วรวมผล ไม่นับประเด็นเดียวกันซ้ำ (ข้อที่อ้าง WA# ให้ตัดสินตาม `wcag-aa.md` ข้อนี้นับเฉพาะส่วนที่เป็นเว็บ) · ส่วน "ดุลยพินิจทีม" ตีได้แค่ข้อเสนอแนะ

## ระดับความรุนแรงเมื่อไม่ผ่าน
- **สูง:** ผู้ใช้บางกลุ่มทำงานหลักไม่ได้หรือข้อมูลหาย — WB3, WB4 (ข้อความ/ปุ่มหายเมื่อ zoom), WB6 (บริเวณเลื่อนใช้คีย์บอร์ดไม่ได้), WB10 (Back ทำข้อมูลหาย/หลุด flow), WB17 (sort แค่หน้าที่เห็น), WB22 (ลบหลายแถวไม่ยืนยัน/ไม่ชัดว่าเลือกเท่าไร), WB27 (หมดเวลาแล้วงานหาย), WB29 (focus หลุดจาก modal)
- **กลาง:** ใช้ได้แต่ช้า สับสน หรือหลงทาง — WB1, WB2, WB7, WB8, WB9, WB11, WB12, WB13, WB14, WB15, WB18, WB19, WB20, WB21, WB23, WB24, WB25, WB26, WB28, WB30, WB31, WB33
- **ต่ำ:** ความประณีต — WB5, WB16, WB32 (ยกเป็นกลางถ้าการพิมพ์เป็นงานหลักของ module)

## แหล่งอ้างอิง (อ่านเมื่อ 2026-11-02)
- W3C: [Understanding 1.4.10 Reflow](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html) · [1.4.4 Resize Text](https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html) · [2.4.3 Focus Order](https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html) · [2.4.11 Focus Not Obscured](https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum.html) · [2.2.1 Timing Adjustable](https://www.w3.org/WAI/WCAG22/Understanding/timing-adjustable.html) · [3.2.5 Change on Request](https://www.w3.org/WAI/WCAG22/Understanding/change-on-request.html) · [APG Sortable Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/)
- web.dev: [Media queries](https://web.dev/learn/design/media-queries) · [Sign-in form best practices](https://web.dev/articles/sign-in-form-best-practices) · [Sign-up form best practices](https://web.dev/articles/sign-up-form-best-practices) · [Virtualize long lists](https://web.dev/articles/virtualize-long-lists-react-window)
- MDN: [autocomplete](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Attributes/autocomplete) · [input type=date](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/date) · [devicePixelRatio](https://developer.mozilla.org/en-US/docs/Web/API/Window/devicePixelRatio) · [Printing](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Media_queries/Printing)
- GOV.UK: [Validation](https://design-system.service.gov.uk/patterns/validation/) · [Links](https://design-system.service.gov.uk/styles/links/) · [Breadcrumbs](https://design-system.service.gov.uk/components/breadcrumbs/) · [Pagination](https://design-system.service.gov.uk/components/pagination/) · [Table](https://design-system.service.gov.uk/components/table/) · [Designing for different browsers and devices](https://www.gov.uk/service-manual/technology/designing-for-different-browsers-and-devices)
- NN/g: [Data tables](https://www.nngroup.com/articles/data-tables/) · [Vertical navigation](https://www.nngroup.com/articles/vertical-nav/) · [Breadcrumbs](https://www.nngroup.com/articles/breadcrumbs/) · [Infinite scrolling](https://www.nngroup.com/articles/infinite-scrolling-tips/) · [Form errors](https://www.nngroup.com/articles/errors-forms-design-guidelines/) · [User control and freedom](https://www.nngroup.com/articles/user-control-and-freedom/)
- [Baymard: Back button expectations](https://baymard.com/blog/back-button-expectations)
- Breakpoint: [Bootstrap 5.3](https://getbootstrap.com/docs/5.3/layout/breakpoints/) · [Tailwind CSS](https://tailwindcss.com/docs/responsive-design) · [Android window size classes](https://developer.android.com/develop/ui/compose/layouts/adaptive/use-window-size-classes)
- [StatCounter: desktop screen resolution, Thailand](https://gs.statcounter.com/screen-resolution-stats/desktop/thailand)
