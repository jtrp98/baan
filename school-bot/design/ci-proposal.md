---
project: school-bot
updated: 2026-10-26
status: moved (ผู้ใช้ approve 2026-10-26 · ย้ายเข้า brand.md §11 แล้ว · ไฟล์นี้เก็บเป็นหลักฐานและตาราง (ก)(ข)(ค) ใช้ต่อได้)
used_by: session หลัก (เสนอผู้ใช้) → ถ้า approve ย้าย (ง) ไป brand.md §11 และ (จ) ไปแก้ §9/§10
---

# ข้อเสนอ: CI ของ School Bot Studio (component ระดับ UI) → brand.md §11

ถอดจากหน้าจอ Arm Lab ที่อนุมัติแล้ว เพื่อให้ Block Lab และหน้าอื่นใช้ "ตระกูลเดียวกัน" (design-taste ข้อ 1) · **ไฟล์นี้เป็นข้อเสนอเท่านั้น ไม่ได้แก้ `../shared/brand/README.md`**

## ที่มาและวิธีอ่าน

- Canvas Arm Lab: https://claude.ai/artifact/AnEWv6UNbgcNvUXS1sfHQd (เวอร์ชัน 1792930020-06e0 · อ่านด้วย Artifact `read` วันที่ 2026-10-26) · อ่านไฟล์ `MainV6ATopBar` · `MainV6AStage` · `MainV6ABar` · `MainV6AJoints` · `MainV6ASeq` · `WindowBarV1` · `MainV6A` (เฉพาะ style/handler/dialog ที่ใช้) · `canvas.json`
- Block Lab A2 (อ่านอย่างเดียว): `../modules/block-lab/design/D1-editor.md` §A2 รอบ 3–4
- ชื่อย่อไฟล์ในคอลัมน์ "ที่มา": **TB** = MainV6ATopBar · **ST** = MainV6AStage · **BR** = MainV6ABar · **JT** = MainV6AJoints · **SQ** = MainV6ASeq · **WB** = WindowBarV1 · **MA** = MainV6A · เลขหลังชื่อ = บรรทัดในไฟล์ `.dc.html` ของ canvas (เวอร์ชันข้างบน)
- คอลัมน์ "ตรง token?": **ตรง** = ทุกค่าอยู่ในตาราง §1–4 · **ผิด token** = มีค่าที่ไม่อยู่ในตาราง (ระบุค่านั้น ไม่ปัดเอง) · ค่าที่ไม่ใช่สี/ขนาด (เช่น 11px, 10px) ก็นับเป็นผิด token เมื่อขัด §2/§3
- **ข้อค้นพบหลัก:** `WindowBarV1` ตรง token ทั้งไฟล์ (สีนอกตาราง 0 ค่า · ฟอนต์ IBM Plex Sans Thai · ขนาด 14/16/18/24 · radius 8/12/16/999) = **แบบอ้างอิงที่สะอาดที่สุด** ส่วน `MainV6A` มีสีนอกตาราง 64 ค่า (243 จุด) · ขนาดตัวอักษร 15 ค่า · radius 16 ค่า · symbol/emoji แทนไอคอน ≈ 75 จุด → CI ต้อง **ถอดโครงจาก Arm Lab แต่ใช้ค่าจาก token** ไม่ใช่คัดค่าดิบมาทั้งหมด
- สถิติทั้งหมดนับด้วยสคริปต์จากไฟล์ที่อ่าน (ไม่ได้ render)

---

## (ก) ตาราง component × ค่า × ที่มา

### ก1 โครงหน้าจอและกรอบ

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| frame ทั้งหน้า | 1440×900 = แถบหน้าต่าง **44** + พื้นที่ **856** · พื้นหลัง `background` #F4F7FB | **ผิด** (brand §9: แถบ 60 + พื้นที่ 840 · CR-09 2026-10-22 ยังไม่ถูกแก้ใน canvas) | MA 203–204 · WB 32, 105–110 |
| header (TopBar) | สูง **60** · padding 0 24 · พื้น #FFFFFF · ขอบล่าง 2px #DCE3EC · gap 10 · min-width 0 · z 56 | ผิด: gap 10 (ไม่อยู่ใน spacing scale) · อื่น ๆ ตรง (D-14 header 60) | TB 16 |
| ลำดับใน header | ซ้าย→ขวา: [โลโก้ School Bot Studio รูป 192×34] [ป้าย Arm Lab รูป 100×25 · margin-left 2] [spacer flex-grow] [ชื่องาน + สถานะบันทึก (เรียงตั้ง ชิดขวา)] [ปุ่ม ☰] · **ไม่มีปุ่มบ้าน** · ไม่มีตัวคั่นแนวตั้ง (ใช้ spacer) · โลโก้ไม่ใช่ลิงก์ | — | TB 17–28 |
| กรอบ content (พื้นที่ใต้ header) | ซ้าย: แผงเวทีหุ่น `left 24 · top 72 · bottom 16 · กว้าง 560` (ห่าง header 12) · ขวา: เริ่ม x 608 → 1416 (กว้าง 832) ขอบนอก 24 · ช่องว่างซ้าย–ขวา 24 · ระหว่างแผงขวา 12 | ผิด: 72/12 (12 ตรง space-3 แต่ 72 เกิดจาก 60+12 ใช้ได้) · **ตรงตาม scale ทั้งหมด** (24, 16, 12) | ST 16 · MA 1554 · SQ/JT margin |
| กรอบแผง (JT: ขยับแขน) | พื้น #FFFFFF · ขอบ 2px #DCE3EC · **radius 20** · padding **10** 12 · gap 16 | **ผิด:** radius 20 (token 16) · padding 10 (scale 12) | JT 16 |
| กรอบแผง (SQ: ลำดับท่า) | margin 12 24 0 · พื้น #FFFFFF · ขอบ 2px #DCE3EC · **radius 20** · padding **10** 16 **12** · gap 8 | **ผิด:** radius 20 · padding 10 | MA 1888 · SQ 16 |
| กรอบแผง (ST: การ์ดข้อมูลหุ่น) | สูง 52 · ขอบ 2px #DCE3EC · radius 16 · พื้น #FFFFFF · padding 0 8 0 12 · gap 8 | ตรง (radius 16) | ST 19 |
| กรอบเวที (ST: stage card) | **radius 22** · พื้น radial-gradient `#F2F8FF → #DCEBFB → #CFE2F8` · padding 8 8 78 · overflow hidden | **ผิด:** radius 22 · gradient 3 สีนอกตาราง | ST 35 |
| กรอบแถบล่าง (BR) | พื้น #FFFFFF · ขอบ 2px #DCE3EC · **radius 18** · padding 10 12 · gap 10 | **ผิด:** radius 18 · padding/gap 10 | BR 16 |

### ก2 ชิปสถานะ / อุปกรณ์ (มีกรอบ เทียบ ไม่มีกรอบ)

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| **ชิปมีกรอบ** · ชิปอุปกรณ์ + ชิปคลาวด์ที่แถบหน้าต่าง | ปุ่มโปร่งสูง 44 ครอบ pill สูง **32** · padding 0 12 · radius 999 · **border 2px** · ไอคอน 20 + ข้อความ **16/600** lh 1.7 + chevron-down 16 #5A6377 · gap 8 · hover: border #1866C9 | ตรง | WB 49–57, 71–82 · สไตล์ L258, L269 |
| สีชิปอุปกรณ์ | none: พื้น #F4F6F8 ขอบ #DCE3EC · connecting: #EAF2FD / #C6D6EA · board/robot: #FFFFFF / #DCE3EC · lost: #FFFFFF / #D32F2F | ตรง (off-bg + border ตาม D-03) | WB 249 |
| สีชิปคลาวด์ | online: #FFFFFF / #DCE3EC (ไอคอน #2E7D32) · syncing: #EAF2FD / #C6D6EA (spinner #1866C9) · offline: #FFF4CC / #B07F00 (ไอคอน #B07F00) · fail: #FFFFFF / #D32F2F | ตรง | WB 220–224 |
| **ชิปไม่มีกรอบ** · สถานะเชื่อมต่อใน ST | จุด 9px (#2E7D32) + ข้อความ **13/600** สี **#1E6B25** · gap 5 · ไม่มีพื้น | **ผิด:** #1E6B25 (ใช้ `success` #2E7D32 ได้ · 5.13:1) · 13px | ST 22 |
| ชิปไม่มีกรอบ · สถานะบันทึกใต้ชื่องาน | ข้อความ **11/600** ไม่มีพื้น · padding 0 6 · สี #2E7D32 (บันทึกแล้ว · "· มีแก้ไขใหม่" สีเดียวกัน) / #5A6377 (ยังไม่ได้บันทึกงาน) · `role=status` | **ผิด:** 11px (metadata ≥12) | TB 24 · MA 1615–1616 |
| ชิปมีกรอบ (เล็ก) · ชิปเน็ตในเมนู ☰ | สูง **26** · padding 0 10 · radius 999 · border 2px · **12/700** · ok #E8F5E9/#2E7D32/#2E7D32 · slow #FFF8E1/#F2C94C/#6B4E00 · off #FDECEC/#D32F2F/#B71C1C · measuring #F4F6F8/#C6D6EA/#5A6377 | **ผิด:** #E8F5E9 · #FFF8E1 · #F2C94C · #6B4E00 · #FDECEC · #B71C1C · สูง 26 · 12px | MA 1608–1611 |
| ชิปตัวเลข/ป้ายในการ์ดท่า | pill สูง 24–26 · พื้น #EEF3F9 (ปกติ) / #5B5FC7 ตัว #FFFFFF (เลือก) · 12/800 | **ผิด:** #EEF3F9 · 800 (ฟอนต์ไม่มี 800) | SQ (ดู CSS ใน MA 173–196) |

### ก3 ชื่อไฟล์ + สถานะบันทึก + เปลี่ยนชื่อ inline

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| ตำแหน่ง | กลุ่มชิดขวาก่อน ☰ · เรียงตั้ง ชิดขวา · gap 1 · ชื่อบน สถานะล่าง | ผิด: gap 1 (ไม่ใช่ spacing) | TB 19–24 |
| ชื่อ (โหมดแสดง) | `role=button tabindex=0` · **14/700** lh 1.3 · padding 0 6 · radius 6 · ขอบล่าง 2px โปร่ง · max-width 190 · nowrap + ellipsis · `title` "แตะเพื่อเปลี่ยนชื่องาน" · cursor text · สี text-primary (สืบทอด) | **ผิด:** 14px (ชื่อเป็นเนื้อหาหลัก ≥16) · radius 6 · ไม่มี lh-clip (ellipsis ต้อง 1.7) | TB 23 |
| ชื่อ hover | พื้น #EAF2FD · ตัว #1866C9 · ขอบล่าง #1866C9 | ตรง | MA 22 (`.dc-name:hover`) |
| ชื่อ (โหมดแก้) | `<input>` สูง **22** กว้าง 190 · ไม่มีขอบ ยกเว้นขอบล่าง 2px #1866C9 · radius 6 · padding 0 6 · **14/700** · ตัว #1866C9 · พื้น #EAF2FD · ชิดขวา · `maxLength=30` · placeholder "ตั้งชื่องาน เช่น แขนหยิบกล่อง" · `aria-label="ชื่องาน"` · autofocus | **ผิด:** สูง 22 (< 44) · 14px · radius 6 | TB 22 · MA 91 (`.dc-proj6:focus`) |
| พฤติกรรม | **คลิกชื่อ** → เข้าโหมดแก้ (ร่าง = ชื่อเดิม) · **Enter** → blur → commit · **Esc** → ยกเลิก (ไม่ commit) · **blur** (คลิกที่อื่น) → commit · commit: trim · **ว่าง = คงชื่อเดิม เงียบ ๆ** (ไม่มีข้อความ) · save-as: ว่าง = ยกเลิก · ถ้ายังไม่มีชื่อ กด บันทึกงาน → เปิดช่องแก้ แล้วบันทึกต่อทันทีหลัง commit · ชื่อว่างแสดง "งานยังไม่มีชื่อ" | — ไม่มี validate (ชื่อซ้ำ · อักขระต้องห้าม · ยาวเกิน) · ไม่มีข้อความ error | MA 1602–1606, 857–862 |
| สถานะบันทึก (ข้อความ) | "ยังไม่ได้บันทึกงาน" · "บันทึกแล้ว 10:20" · "บันทึกแล้ว 10:20 · มีแก้ไขใหม่" · ตามบรรทัดสถานะคลาวด์ที่แถบหน้าต่างที่เดียว (EDIT-09) | — (brand §9 ตัดสินแล้ว) | MA 1615 |
| ปุ่ม ☰ (เมนู) | **44×40** · radius 12 · border 2px #C6D6EA · พื้น #FFFFFF · ไอคอน 20 stroke **2.6** · เปิดอยู่: พื้น+ขอบ #1866C9 ตัว #FFFFFF · `aria-haspopup=menu` `aria-expanded` `aria-label=เมนู` | **ผิด:** สูง 40 (< 44) · stroke 2.6 (icon token 2.4) | TB 28 · MA 1655 |
| เมนู ☰ (popover) | กว้าง 280 · top 46 · right 0 · padding 8 · gap 2 · พื้น #FFFFFF · ขอบ 2px #C6D6EA · **radius 14** · shadow `0 10px 24px rgba(20,36,61,.18)` · z 60 · รายการสูง 40 padding 0 10 radius 9 · **15/600** · kbd: padding 1 6 · ขอบ 1px #DCE3EC (ล่าง 2px) · พื้น #F4F6F8 · radius 5 · 11/700 #5A6377 · hover พื้น #EAF2FD · ตัวคั่น 2px **#EEF1F5** margin 4 0 | **ผิด:** radius 14/9/5 · shadow (token float = `0 8px 20px rgba(20,36,61,.2)`) · รายการสูง 40 · 15/11px · #EEF1F5 | TB 30–55 · MA 26 |

### ก4 ปุ่มหน้าต่าง (WindowBar)

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| แถบ | สูง **44** · พื้น #FFFFFF · ขอบล่าง **1px** #DCE3EC · padding 0 0 0 12 · gap 8 · `role=banner` | **ผิดขนาด** (brand §9 = 60 · ดู ข4) · ขอบ/สี ตรง | WB 32 |
| ชื่อแอป | ไอคอนหุ่น 28×28 radius 8 พื้น #EAF2FD ตัว #1866C9 (ไอคอน 20) + "School Bot Studio" **14/600** lh 1.7 · gap 8 · Win: ชิดซ้าย / Mac: กึ่งกลาง | ตรง (14px = metadata ได้) | WB 42–45, 254 |
| Windows · ปุ่มขวา | ลำดับ **ซ่อน · ย่อ · ปิด** · ปุ่ม **48×44** โปร่ง · face **40×36** radius 8 border 2px โปร่ง · ไอคอน 20 stroke 2.4 · ตัว #5A6377 · ปุ่มปิด margin-right 4 · `aria-label` ไทย | ตรง | WB 96–104 |
| Windows · hover / active / focus | hover/focus: face พื้น #EAF2FD ขอบ+ตัว #1866C9 · active: พื้น+ขอบ #1866C9 ตัว #FFFFFF · focus ring `3px solid #B85E00` offset 2 (ทั้ง `.wb-root`) | ตรง | WB 14–17 |
| Mac · ปุ่มซ้าย | ลำดับ **ปิด · ย่อ · ซ่อน** · ปุ่ม 40×44 · วงกลม **28** border 2px โปร่ง · สี #FF5F57 / #FEBC2E / #28C840 · ไอคอน 16 ตัว #14243D (เห็นตลอด) · hover ขอบ #14243D · active brightness .85 | ตรง (DSG-11 รอเพิ่มใน §1) | WB 35–40 · L19–21 |
| ไอคอน | ซ่อน = ลูกศรลงมีเส้นฐาน · ย่อ = ขีดนอน · ปิด = กากบาท (Lucide stroke 2.4 · ขนาด 20 ใน Win / 16 ใน Mac) | ตรง | WB 98–104 |
| **ไอคอนขยาย/ย่อหน้าต่าง (maximize/restore)** | **ไม่มี** (จอ 1440×900 ตายตัว · ย่อ = minimize เท่านั้น) | — ถ้าต้องการต้องออกแบบใหม่ (ดู ค) | — |

### ก5 tab · selected · hover · focus

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| tab (segmented · "เล่นจาก แอป | บอร์ด") | ราง `role=tablist`: padding 3 · gap 2 · radius 12 · พื้น **#E7EDF5** · tab: สูง **36** · padding 0 12 · radius 9 · **14/700** · ไอคอน+ข้อความ gap 6 | **ผิด:** #E7EDF5 · padding 3/radius 9 · สูง 36 (< 44) · 14px (tab ≥16) | BR 70–71 · MA 1778 |
| tab ปกติ | พื้นโปร่ง · ตัว #5A6377 · cursor pointer | ตรง (แต่ไม่มี hover) | MA 1778 |
| tab เลือก (`aria-selected`) | พื้น #FFFFFF · ตัว #1866C9 · shadow `0 1px 3px rgba(20,36,61,.18)` · ไม่มีขอบ | **ผิด:** shadow ไม่อยู่ในตาราง · ไม่ใช้ `border-selected` 3px | MA 1778 |
| tab ปิดใช้ (เล่นอยู่) | เลือก: พื้น #F4F6F8 ตัว #8A96A3 · ไม่เลือก: ตัว #A9B3BF · cursor not-allowed · `disabled` | **ผิด:** #8A96A3 · #A9B3BF (1.8:1 บน #E7EDF5) · ใช้ `disabled` เงียบ ขัด D-03 | MA 1778 |
| tab hover / focus | **ไม่มี** (เห็นแค่ `title` ของเบราว์เซอร์) · ไม่มี focus-visible เฉพาะ | **ผิด** (D-17 ทุก control ต้องมีวง #B85E00) | BR 71 |
| selected: การ์ดข้อต่อ | ขอบ 2px #1866C9 + inset 1px #1866C9 (รวม ≈3px) · พื้น #EAF2FD · วงนอก 3px #D0EBFD · radius 14 | ผิด: radius 14 · วง #D0EBFD (ตกแต่งได้ ห้ามเป็นตัวบอกอย่างเดียว) | MA 1082 |
| selected: การ์ดท่า (ลำดับท่า) | **ขอบ 3px #1866C9** · พื้น #EAF2FD · วงนอก 3px #D0EBFD · padding-right 42 | ตรง `border-selected` + `action-primary-subtle` | MA 1214 |
| selected: การ์ดท่าที่เลือกหลายท่า | ขอบ 3px #5B5FC7 พื้น #F1F0FD (สี `group`) | ตรง | MA 1215 |
| selected: ไม่ได้เลือก/ปกติ | ขอบ 2px #DCE3EC (ล่าง 4px) พื้น #FFFFFF | ตรง | MA 1220 |
| hover รายการเมนู | พื้น #EAF2FD (`.dc-menuitem`) | ตรง | MA 26 |
| focus ring | **WB เท่านั้น** ใช้ `3px solid #B85E00 offset 2` · ส่วนอื่น: `.dc-jcard` `3px solid #1866C9` · `.dc-addfirst` `3px solid #D0EBFD` · ที่เหลือไม่กำหนด | **ผิด** (D-17) ยกเว้น WB | WB 14 · MA 18, 22 |

### ก6 tooltip · popover · dialog + ฉากหลัง · toast

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| tooltip (แถบหน้าต่าง) | พื้น #14243D · ตัว #FFFFFF **14/500** lh 1.6 · padding 4 12 · radius 8 · top 48 · nowrap · z 40 · `pointer-events:none` · แสดงตอน hover **และ** focus-visible | ตรง (ขาวบน text-primary 15.56:1) | WB 18–19 |
| tooltip (ST: ข้อมูลสาย) | พื้น #14243D · ตัว #FFFFFF **13/600** lh 1.5 · padding 6 10 · radius 8 · `role=tooltip` · เปิดตอน hover/focus/click · z 40 | **ผิด:** 13px · padding 6 | ST 29 |
| tooltip (JT: คำอธิบาย) | พื้น #14243D · **13/600** · padding 8 12 · radius 8 · กว้าง 240 | **ผิด:** 13px | JT 21 |
| tooltip ส่วนใหญ่ | ใช้ `title` ของเบราว์เซอร์ (ปุ่มส่วนใหญ่) — ไม่ขึ้นบนจอสัมผัส | ผิดหลักไม่พึ่ง hover (brand §3) | หลายจุด |
| popover (ข้อมูลจากชิป) | กว้าง 330 · padding 16 · **radius 16** · พื้น #FFFFFF · **border 1px #DCE3EC** · **shadow-float `0 8px 20px rgba(20,36,61,.2)`** · gap 8 · หัว 18/700 · ตัว 16 lh 1.6 · เมตา 14 #5A6377 · เข้า `wbIn` .2s ease `cubic-bezier(.2,.8,.2,1)` translateY(-4px→0) · ฉากหลังโปร่งใสคลุมจอ (z 39) ปิดด้วยแตะที่อื่น + Esc · reduced-motion = ไม่มี animation | ตรง (แบบอ้างอิง) | WB 84–95 · L21–23 |
| popover (เมนู/ยืนยันใน MA) | กว้าง 330 · padding 12 14 · **radius 14** · ขอบ 2px #C6D6EA (แดง #D32F2F เมื่อ error / ส้ม #FF8A00 เมื่อยืนยันให้หุ่นขยับ) · shadow `0 10px 24px rgba(20,36,61,.2)` · หัว 15/700 · ตัว 13 · hint 12 | **ผิด:** radius 14 · ขอบ 2px (token popover = radius-lg 16 + shadow-float) · shadow · 12–13px | MA 1845 · ST 42 · BR 16 (popover ก่อนหุ่นขยับ) |
| dialog (แถบหน้าต่าง: ยืนยันปิด) | กว้าง 520 · padding 24 · **radius 16** · พื้น #FFFFFF · **shadow-modal `0 16px 40px rgba(20,36,61,.3)`** · gap 12 · หัว **24/700 lh 1.3** + กล่องไอคอนเตือน 40×40 radius 12 พื้น #FFF4CC ขอบ 2px #B07F00 · ตัว 16 lh 1.6 · ปุ่ม: สูง **48** padding 0 16 radius 12 **16/700** · ปุ่มรอง: ขอบ 2px #C6D6EA ล่าง 4px พื้นขาว · ปุ่มหลัก: ล่าง 4px #0F4C99 พื้น #1866C9 ตัวขาว · ชิดขวา gap 12 · `role=alertdialog aria-modal` · โฟกัสเริ่มที่ปุ่ม "อยู่ต่อ" · Esc ปิด | ตรง (แบบอ้างอิง) | WB 121–135 |
| dialog (MA: ออกจากหน้า/เริ่มใหม่) | กว้าง 520 · **radius 20** · padding **24 26** · gap 12 · หัว **20/700** · ตัว **15** #5A6377 · ปุ่มสูง **46** padding 0 18 radius 12 **15/700** · ปุ่มหยุด: ล่าง 4px **#8E1414** พื้น #D32F2F ตัวขาว "■ หยุดหุ่นก่อน" | **ผิด:** radius 20 · padding 26 · ขนาด 20/15 · สูง 46 · #8E1414 (DSG-12 = #8E1B1B) · ■ เป็นอักขระ | MA 302–317 |
| dialog (MA: ปลดล็อกข้อต่อ/ยืนยัน) | กว้าง 400–480 · **radius 22–24** · padding 24–28 · ตัวอักษร 20–22 · ปุ่ม 44–48 | **ผิด:** radius 22/24 · padding 28 | MA 330–333 |
| ฉากหลัง dialog (WB) | `rgba(20,36,61,.35)` · คลุมใต้แถบหน้าต่าง (top 44 · สูง 780 → เว้นพื้นที่ล่าง 76 ไม่คลุม) · คลิกฉากหลัง = ยกเลิก · z 30 | ตรง z-dialog 30 · alpha .35 ไม่อยู่ในตาราง (ได้จาก `text-primary` + alpha) | WB 122–123 |
| ฉากหลัง dialog (MA) | `rgba(20,36,61,.35)` (บางจุด .45) · `top 0 … bottom 76` · **z 70** (ปุ่ม "ปลดล็อก" `position:fixed inset 0 z 60`) | **ผิด:** z 70 = `z-stop` (D-18 ไม่มีอะไรเท่า/สูงกว่า) · z 60 = `z-bottombar` · alpha .45 | MA 302, 330–333 |
| toast | `position:absolute left 50% bottom 100 translateX(-50%)` · พื้น #14243D · ตัว #FFFFFF **14/600** · padding 8 8 8 16 · gap 12 · **radius 12** · shadow `0 8px 20px rgba(20,36,61,.3)` · `role=status` · ปุ่ม "เลิกทำ" สูง **32** padding 0 12 ขอบ 2px **#8FB3E3** radius 8 โปร่ง ตัว #FFFFFF **13/700** · z 35–37 · หายเอง 5 วิ (ค่าเริ่มต้น) | **ผิด:** 14px · shadow alpha .3 (float = .2) · ปุ่มสูง 32 · #8FB3E3 · z 35–37 (D-18 toast = 50) | MA 268, 334 · 856 |

### ก7 ปุ่มไอคอน · กลุ่มปุ่ม toolbar · ปุ่มนูน

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| ปุ่มนูนหลัก (BLUE) | ขอบล่าง **5px** #0F4C99 · พื้น #1866C9 · ตัวขาว · radius 16 (เล่น 120×52) / 12 (ทั่วไป) | **ผิด:** ล่าง 5px (raise 4px) · radius 16 ใช้กับปุ่มได้เฉพาะ `radius-md` 12 | MA 1009, 1949 |
| ปุ่มนูนหุ่น (Y) | ขอบล่าง 4px #B85E00 · พื้น #FF8A00 · **ตัวขาว** · ใช้งาน: "กลับท่าพัก" | **ผิด:** ตัวขาวบนส้ม = 2.36:1 (brand: ใช้ text-primary) · Y_ON พื้น **#F07800** | MA 1006–1007 |
| ปุ่มนูนรอง | พื้น #FFFFFF · ขอบ 2px #C6D6EA · ล่าง 4px · ตัว #1866C9 · radius 10–12 · สูง 30–36 · 13–15px | **ผิด:** สูง < 44 · ตัว 13 · radius 10 | MA 1848 · SQ 58, 69 |
| ปุ่มปิดใช้ (GREY) | ล่าง 4px #D3D9E1 · พื้น #E7EBF0 · ตัว #8A96A3 · `cursor:not-allowed` · `disabled` | **ผิด:** ขัด D-03 (ต้อง `off-bg` #F4F6F8 + ขอบ `border` + `aria-disabled` + popup อธิบาย) | MA 1008 |
| ปุ่มหยุดทั้งหมด | สูง **56** · padding 0 26 · **radius 16 (สี่เหลี่ยมมุมมน ไม่ใช่วงกลม)** · พื้น #D32F2F · ตัวขาว **20/700** · ไอคอน ■ 22 + "หยุด" · ล่าง **5px #9E1F1F** · อยู่ใน BR กว้าง 168 · ปิดใช้ตอนสายหลุด (#E7EBF0) | **ผิด:** ขัด D-01 (วงกลมใหญ่ + ตำแหน่งตายตัว) · #9E1F1F (DSG-12 = #8E1B1B) · 5px | BR 123–127 · MA 1950 |
| ปุ่มเล่น | 120×52 (กว้างจริง 223) · radius 16 · 18/700 (14 ถ้าข้อความ >8 ตัว) · เล่น = BLUE · หยุดชั่วคราว = ขาว+ขอบ 2px #1866C9 ล่าง 5px | ผิด: 14px · 5px · radius 16 | BR 127–135 · MA 1949 |
| ปุ่มวงกลมนำทางท่า ‹ › | **44×44** · radius 999 · ขอบ 2px #C6D6EA ล่าง 4px · พื้นขาว · ตัว #1866C9 · 20/800 (อักขระ ‹ ›) · อยู่ในแคปซูล: พื้นขาว radius 999 padding 5 gap 10 shadow `0 6px 18px rgba(24,102,201,.18)` | **ผิด:** อักขระ ‹ › (D-20 ต้อง SVG `chevron-left/right`) · 800 · shadow | MA 1558, 1586 · ST 37–41 |
| ปุ่มแถบ home/caret (กลับท่าพัก ▾) | สูง **30** · radius 10 4 4 10 / 4 10 10 4 (ปุ่มติดกัน) · 13/700 · ไอคอน 16/14 stroke 2.4/3 | **ผิด:** สูง 30 · radius 4/10 · 13px · stroke 3 | MA 1591–1593 · ST 43, 45 |
| ปุ่มข้อมูล ⓘ (ในกรอบ ST) | 36×36 radius 8 โปร่ง · วงกลม 20 ขอบ 2px #5A6377 + อักขระ "i" Georgia 12/700 | **ผิด:** สูง 36 · อักขระ i (ใช้ไอคอน `info`) · Georgia (ไม่ใช่ฟอนต์ brand) | ST 25–28 |
| ปุ่มจุดสามจุด (⋯ เมนูท่า) | 40×40 radius 12 โปร่ง · hover/เปิด: พื้น #EAF2FD ตัว #1866C9 · ปกติ ตัว **#3F5A7A** · ไอคอน mask `dots` | **ผิด:** #3F5A7A · สูง 40 | MA 1675 · MA 48, 67 |
| กลุ่มปุ่ม toolbar | **ไม่มีกลุ่มกรอบเดียว** ในจอ Arm Lab · ปุ่มวางกระจายตามแผง (หัวแผงขวา: ปุ่มเวลา · ⋯ ; หัว ST: กลับท่าพัก · เปลี่ยนหุ่น ; แถบล่าง: เล่นจาก · ตั้งแต่/ถึง · ซ้ำ − + · หยุด · เล่น) | — (ดู ค · toolbar ซูม/เลื่อน) | — |
| ปุ่ม − + (จำนวนรอบ) | วงกลมเล็ก (ขนาดตาม `loopBtnStyle`) · อักขระ − + | ผิด: อักขระ (D-20) | BR 96–98 |

### ก8 ไอคอนขยาย/ย่อ (ของแผง ไม่ใช่ของหน้าต่าง)

| component | ค่าใน Arm Lab (จริง) | ตรง token? | ที่มา |
|---|---|---|---|
| ปุ่ม "เต็มจอ / ย่อ" ตาราง | ปุ่มนูนรอง สูง 36 padding 0 12 radius 10 · ขอบ 2px #C6D6EA ล่าง 4px · ตัว #1866C9 · ไอคอน 14 stroke 2.4 + ข้อความ **13/700** · `aria-pressed` · `aria-label` "ตารางเต็มพื้นที่ (ซ่อนแผงข้อต่อ)" / "ย่อตาราง กลับมาแสดงแผงข้อต่อ" | **ผิด:** สูง 36 · 13px · ไอคอน 14 (icon-sm 16) | SQ 58, 69 · MA 1555 |
| path ไอคอนขยาย | `M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5` (4 มุมชี้ออก = maximize) | ตรงสไตล์ Lucide (`maximize`) | MA 1555 |
| path ไอคอนย่อ | `M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5` (4 มุมชี้เข้า = minimize) | ตรงสไตล์ Lucide (`minimize`) | MA 1555 |
| ไอคอนย่อ/ขยายอื่น | chevron-down ในปุ่ม select/menu (12–16 stroke 3–3.2) | ผิด: stroke 3/3.2 (2.4) | BR 74–76 |

### ก9 สิ่งที่ Block Lab A2 ใช้ไปแล้ว (อ่านอย่างเดียว · §A2 รอบ 3–4)

| เรื่อง | ที่ A2 ทำ | เทียบ Arm Lab |
|---|---|---|
| แถบหน้าต่าง | `WindowBarA2` สูง **60 รวมแถบเดียว** (รวม header+window bar) · ซ้าย [ปุ่ม Mac] [บ้าน 48] [เมนู 48] [ชิป Uno 48] · กลาง โลโก้ · ขวา ชื่องาน + สถานะบันทึก + ปุ่ม Windows · เอาชิปคลาวด์ออก | Arm Lab = 2 แถบ (44 + 60) · **ปุ่มบ้านมีเฉพาะ A2** |
| พื้นที่ | 1440×**840** (60 + 840) | ตรง brand §9 · Arm Lab ยัง 44+856 |
| ปุ่มแถวแท็บล่าง | สูง/กว้าง **46** · ปุ่มส่งน้ำเงิน #1866C9 ล่าง #0F4C99 · หยุดทั้งหมดสี่เหลี่ยมมุมมน 46 ขอบ+ไอคอน #D32F2F (OQ82) · ปุ่มยุบ/ขยายไม่มีกรอบ 46 | ใกล้ Arm Lab (หยุดไม่เป็นวงกลม) · ขนาด 46 ≠ 44/56 |
| popup ฉากหลัง | คลุมถึงขอบบนแถวแท็บ เว้นปุ่มหยุดเห็น/กดได้ | ต่างจาก MA (bottom 76 / z 70) |
| toast | พื้น #14243D · ปุ่ม **#2A3D5C** ตัว **#9CC3F0** · สูง 56/44 · หาย 9 วิ | **ผิด token:** #2A3D5C · #9CC3F0 (Arm Lab ใช้ #8FB3E3) |
| พื้นที่ลบ | พื้น **#FDECEC** ขอบประ 3px #D32F2F + ไอคอนถังขยะ + "ปล่อยตรงนี้เพื่อลบ" | **ผิด token:** #FDECEC |
| พื้นหลังลายจุด | ขาว + จุด 1.3px #DCE3EC · 24px | ไม่มีใน Arm Lab (ของใหม่) |
| ค่าชั่วคราวที่ A2 ลงทะเบียนไว้ | ปุ่มวงกลม + 28 · แถบล่างบล็อก 44 · คูณ 16 สีหมวด (DSG-13) | ต้องรวมเข้า §11 หรือ DSG |
| zoom/undo toolbar | ปุ่มเลิกทำ/ทำซ้ำ/−/+/พอดีจอ มุมล่างขวาของพื้นที่ต่อบล็อก (เลิกทำ/ทำซ้ำใช้จริง · ซูมเป็นภาพ aria-disabled) | **ไม่มีใน Arm Lab → ดู ค** |

---

## (ข) จุดที่ Arm Lab เองผิด/ไม่ตรง brand (สรุปจาก ก)

เรียงตามความสำคัญต่อ CI · ทุกข้อ "ไม่นำมาเป็น CI" จนกว่าผู้ใช้ตัดสิน (CI ใช้ค่า token ตาม (ง))

1. **frame 44 + 856** ยังไม่ปรับเป็น 60 + 840 ตาม brand §9 (CR-09 2026-10-22) · `WindowBarV1` ยังสูง 44 ขอบล่าง 1px และมี preview พื้นที่ 856 · ปุ่ม Win 48×44 ถูกต้องแล้วสำหรับแถบ 60 (ปุ่ม 44 สูงใน 60 = เหลือที่) แต่ยังไม่ได้ปรับ (WB 32, 105–110 · MA 203–204)
2. **สองแถบซ้อน (window bar 44 + header 60 = 104)** vs **A2 แถบเดียว 60** vs brand D-14 "Header 60" และ §9 "แถบหน้าต่าง 60" → ไม่ชัดว่า "แถบหน้าต่าง" กับ "header" เป็นแถบเดียวกันหรือสองแถบ (คำถาม Q1)
3. **ฟอนต์:** ทุกไฟล์ยกเว้น WB ยังโหลด **Mitr + Noto Sans Thai** (MA root font-family L204 · JT 22 "Mitr" · TB/ST/BR helmet) ขัด D-08/D-09 (บันทึกใน brand §2 "ค้างไว้" อยู่แล้ว)
4. **ขนาดตัวอักษรต่ำกว่า 16px ในปุ่ม/tab/ช่องกรอก:** tab 14 · ชื่องาน 14 · ปุ่มนูน 13 · เมนู 15 · toast 14/13 · dialog 15 · ชิป 12–13 · สถานะบันทึก 11 · สถิติ: MA font-size 11px × 14, 12px × 25, 13px × 37, 14px × 39, 15px × 40 (ขัด D-10/D-12)
5. **สีนอกตาราง §1:** MA 64 ค่า / 243 จุด · ค่าที่พบบ่อย: #8A96A3 (31 · ข้อความ off/hint · 3.01:1 บนขาว **ไม่ผ่าน 4.5**) · #E7EBF0 (28 · พื้น off) · #8FB3E3 (24+ · ขอบปุ่มรองบนพื้นเข้ม/อ่อน) · #B71C1C (12 · ข้อความ/ปุ่มลบ · table danger = #D32F2F) · #EEF3F9 (9) · #FDE7E7 (9) · #A9B3BF (7 · 1.8:1) · #9AA6B2 (7) · #1E6B25 (7) · #A83D06 (6) · #DFF3E2 (5) · TB: #8A96A3 #EEF1F5 #B71C1C · ST: #1E6B25 + gradient 3 สี + #7D2E04 · BR: #E7EDF5 #7D2E04 #FFC7A3 #8FB3E3 #D7E4F5 #EEF1F5 #8A96A3 · JT: 17 ค่า (เช่น #8A4700 #F3C2C2 #FBE3E3 #FFF4E8 #FFF4ED) · SQ: 21 ค่า (#DCDBF6 #B7B4F0 #9AA6B2 #9DB3C9 ฯลฯ)
6. **ตัวอักษรขาวบน `action-robot`:** ปุ่มนูนหุ่น `Y` (MA 1006) ตัวขาว (2.36:1) · "ไปเลย" ใน popover ยืนยันให้หุ่นขยับไกล (ST 42 สไตล์ส้ม #FF8A00 + ตัวขาว) ขัด brand §1 ตัวอักษรบนส้ม · พื้น "กด" `Y_ON` = **#F07800** ไม่อยู่ในตาราง (MA 1007)
7. **ปุ่มหยุด:** radius 16 (ไม่ใช่วงกลม) · ล่าง 5px **#9E1F1F** (DSG-12 = #8E1B1B) · พื้นที่ใน BR ไม่ใช่ตำแหน่งตายตัวทุกหน้า (ขัด D-01) · ทั้ง Arm Lab (56 สี่เหลี่ยมมุมมน) และ A2 (46 สี่เหลี่ยมมุมมน · OQ82) ไม่เป็นวงกลม → CI ต้องตัดสิน (Q2)
8. **ปุ่มนูน raise 5px** (BLUE · stop · play) vs token `raise` 4px
9. **ปุ่มปิดใช้ (GREY)** ใช้ `disabled` + #E7EBF0/#8A96A3 ขัด D-03 (ต้อง `off-bg` + ขอบ + `aria-disabled` + popup อธิบาย) · มีเฉพาะ A2 ที่ทำถูก (ส่งลงบอร์ดถูกปิดกั้น)
10. **radius นอก scale:** MA มี 16 ค่า (2, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 999) · กรอบแผง 20 / stage 22 / bar 18 / dialog 20–24 / popover 14 (token = 8/12/16/999)
11. **spacing นอก scale:** 10 (header gap, bar gap, panel padding) · 5, 6, 14, 26 ฯลฯ
12. **เป้ากดต่ำกว่า 44:** ☰ สูง 40 · ปุ่มข้อมูล 36 · ปุ่ม tab 36 · ปุ่มนูนรอง 30–36 · ปุ่มโฟกัสท่า 30 · ช่องเปลี่ยนชื่อ 22 · ชิปเน็ต 26 · ปุ่มใน toast 32 · รายการเมนู 40/36 (brand §9 "ไม่เล็กกว่า 44×44" · Proposed)
13. **focus ring** ถูกเฉพาะ WB (#B85E00) · MA ใช้ #1866C9 (jcard) / #D0EBFD (addfirst) / ไม่กำหนด (ที่เหลือ) ขัด D-17
14. **z-index ขัด D-18:** ฉากหลัง dialog z **70** (= `z-stop`) · ปุ่มปลดล็อก `fixed inset 0` z **60** (= `z-bottombar`) · popover เน็ต z **72** (> `z-stop`) · wrapper แถบหน้าต่าง z **80** (> `z-stop`; ปัญหาเดียวกับ CR-10/AUD-F01 ที่ยังไม่แก้ frame) · ค่าอื่น: 8, 19, 20, 29, 30, 31, 35, 36, 37, 38, 40, 45, 55, 56, 60, 90, 92 (นอกตาราง) · toast z 35–37 (token = 50)
15. **dialog หลายแบบ:** WB ตรง token (radius 16, 24/16/48) แต่ MA มี 3 แบบ (radius 20 · 22 · 24) → CI ใช้แบบ WB
16. **อักขระ/emoji แทนไอคอน (D-20):** MA 75 จุด (✓ 22 · 📦 9 · ■ 5 · ✕ 5 · ▾ 5 · 📋 4 · ✂ 3 · 🗑 3 · ● 3 · ＋ 2 · ○ 2 · ⤒ ⤓ › ×) · TB: ↺ ⓘ · ST: ‹ › ＋ · BR: ↺ ✕ ⬆ ▾ · SQ ✓ 6 + 📦 + ＋ · JT ＋ 4 · WB ใช้ `×` 6 จุด (ตรวจแล้วเป็นอักขระใน `t.*` ข้อความ/ไม่ใช่ไอคอน — ต้องตรวจซ้ำ)
17. **icon stroke:** ☰ 2.6 · chevron 3/3.2 · mask icons `.dc-i` 2.2 (token 2.4 ค่าเดียว) · ไอคอนเฉพาะ SVG ใน WB ตรง 2.4
18. **tab ไม่มี hover/focus** · track #E7EDF5 · ปิดใช้ด้วย `disabled` + #A9B3BF (1.8:1)
19. **tooltip ไม่เป็นมาตรฐานเดียว:** 3 สไตล์ (WB 14/500 pad 4 12 · ST 13/600 pad 6 10 · JT 13/600 pad 8 12) + `title` เบราว์เซอร์ส่วนใหญ่ (ไม่ขึ้นบนจอสัมผัส)
20. **shadow ไม่ตรง token:** `0 8px 20px .18/.3` · `0 10px 24px .18/.2` · `0 12px 32px .18` · `0 6px 18px rgba(24,102,201,.18)` · `0 6px 14px .16/.28` · `0 1px 3px .18` (ตรง token แค่ `0 8px 20px .2` ใน WB popover และ `0 16px 40px .3` ใน WB dialog)
21. **เปลี่ยนชื่อ inline ไม่มี validate/ข้อความ:** ว่าง = คงชื่อเดิมเงียบ ๆ · ไม่ตรวจชื่อซ้ำ/อักขระ · ไม่มีตัวนับ 30 ตัว · Esc แล้วอินพุตถูกถอด (ต้องทดสอบจริงว่า blur ไม่ commit ซ้ำ) · ไม่มี `aria-describedby` บอกกติกา
22. **สถานะบันทึก "· มีแก้ไขใหม่" สีเขียวเดียวกับ "บันทึกแล้ว"** (สื่อ "ผ่าน" ทั้งที่มีของยังไม่บันทึก) → brand §1 สีผูกความหมายเดียว · แนะนำใช้ `text-secondary` หรือ `warning-strong` + ข้อความ (ตัดสิน: Q5)
23. **ไม่มีปุ่มบ้านใน Arm Lab** (ออกหน้าหลักไม่ได้จาก header · ทาง ☰ → งานของฉัน เท่านั้น) · A2 เพิ่มปุ่มบ้านเอง
24. **ฉากหลัง dialog ไม่คลุมแถบล่าง 76px (MA bottom 76)** ทำให้ปุ่มหยุดกดได้ · แต่เป็นสูตรของเลย์เอาต์เก่า (แถบล่างอยู่ใต้ทั้งหน้า) · ในเลย์เอาต์ใหม่ปุ่มหยุดอยู่ใต้เวที (ซ้าย) ฉากหลังที่ `top 0..bottom 76` จึงบังเวทีทั้งก้อน/ปุ่มหยุด → ต้องออกแบบพื้นที่เว้นใหม่ (CR-10)
25. **เส้นขอบ `border` #DCE3EC บนขาว 1.29:1** (ไม่ถึง 3:1 ตาม WCAG 1.4.11 เมื่อเป็นเส้นขอบ control) · เป็นข้อจำกัดของ brand เอง (A2 บันทึกไว้แล้ว) · ชิปที่ขอบเป็น `border` มีข้อความกำกับอยู่แล้ว

---

## (ค) ของที่ Arm Lab ไม่มี → ต้องออกแบบใหม่ · ป้าย **ใหม่ · School Bot Studio**

ข้อกำหนดกลาง: ใช้เฉพาะสี/ขนาด/radius/spacing/z ใน §1–6 · **ห้ามคิด hex ใหม่** · ถ้าขาด → ระบุเป็น **DSG ที่ต้อง approve** · ทุกอันต้องมี reduced-motion · เป้ากด ≥ 44 · ข้อความ ≥ 16 · ไอคอน SVG Lucide stroke 2.4 · focus ring #B85E00

### ค1 terminal (พิมพ์คำสั่ง) · **ใหม่ · School Bot Studio**

- **หน้าที่:** ช่องพิมพ์คำสั่งส่งเข้า Serial / รับข้อความกลับ (ต่อยอด D4 · SerialPane)
- **แนวทาง A (แนะนำ · ไม่ต้องมี hex ใหม่):** พื้น `surface` #FFFFFF · ขอบ `border-default` 2px #DCE3EC · `radius-lg` 16 · padding `space-4` 16 · เนื้อหา monospace **16px** `lh-body` 1.6 (ฟอนต์ mono = Consolas/ui-monospace ที่ brand §2 สงวนให้คอนโซลครู → **ต้องขยายขอบเขตเป็น DSG**) · ข้อความที่ผู้ใช้พิมพ์ = `text-primary` · ข้อความจากบอร์ด = `text-secondary` · error = `danger` + ไอคอน `triangle-alert` + ข้อความ · prompt = ไอคอน `chevron-right` `action-primary` · ช่องพิมพ์ติดล่าง สูง 44 `radius-md` 12 ขอบ 2px `border` (focus = ring #B85E00) · ปุ่ม "ส่ง" นูน `action-primary` (ไม่ขยับหุ่น) 44 สูง · เลื่อนในกรอบเท่านั้น (ห้ามเลื่อนทั้งหน้า) · `lh-clip` 1.7 ถ้ามี ellipsis
- **แนวทาง B (ดำแบบ terminal จริง):** พื้น `text-primary` #14243D ตัว #FFFFFF (15.56:1) · แต่ `success` (3.04:1) `danger` (3.13:1) `action-primary` (2.8:1) **ไม่ผ่านบนพื้นเข้ม** → ต้องมี DSG สีสถานะบนพื้นเข้ม (ห้ามคิดเอง) · จึงไม่แนะนำจนกว่าจะอนุมัติ
- **ข้อควรทำ:** ปุ่มล้างหน้าจอ · ปุ่มคัดลอก (ไอคอน + ข้อความ) · ข้อความสถานะ `role=log aria-live=polite` · จำกัดบรรทัด (เช่น 200) บอกเมื่อตัด

### ค2 toolbar เลื่อน/ซูมแบบกรอบตั้ง 5 ปุ่ม · **ใหม่ · School Bot Studio**

- **สมมติฐาน (ขอยืนยัน · Q3):** 5 ปุ่ม = **เลิกทำ · ทำซ้ำ · ซูมออก · ซูมเข้า · พอดีจอ** (ตามภาพ A2) · "เลื่อน" ทำด้วยลากพื้นหลัง/ล้อเลื่อน/ปุ่มลูกศรบนคีย์บอร์ด ไม่ใช่ปุ่มแยก · ถ้า 5 ปุ่มต้องรวม "มือเลื่อน" ให้สลับปุ่มทดแทน "ทำซ้ำ" ไม่ได้ ต้องบอก
- **กรอบ:** แนวตั้ง · พื้น `surface` · ขอบ 2px `border` · `radius-lg` 16 · padding `space-1` 4 · gap `space-1` 4 · `shadow-float` · กว้าง 44 + 8 + 4 = **56** · สูง = 5×44 + 4×4 + 8 + 4 = **248** (+ตัวคั่น)
- **ปุ่มในกรอบ:** 44×44 · `radius-md` 12 · ไอคอน `icon-lg` 24 stroke 2.4 · ตัว `text-primary` · **ไม่นูน ไม่มีกรอบรายปุ่ม** (แบบเดียวกับปุ่มหน้าต่าง WB) · hover/focus: พื้น `action-primary-subtle` ตัว `action-primary` · active: พื้น+ตัว `action-primary`/ขาว · ปิดใช้ (เช่น ไม่มีให้เลิกทำ): `aria-disabled` + ตัว `text-secondary` พื้น `off-bg` ขอบ `border` + tooltip บอกเหตุผล (ไม่ใช่ `disabled` เงียบ · D-03)
- **ตัวคั่น:** `border-thin` 1px `border` แนวนอนระหว่าง [เลิกทำ ทำซ้ำ] | [−  +  พอดีจอ] (เส้นคั่นภายในเท่านั้น = ใช้ border-thin ถูกต้อง)
- **tooltip:** ฝั่ง **ซ้าย** ของปุ่ม (กรอบอยู่ขวา) · แบบ tooltip CI (ดู ง) · มีคีย์ลัดเป็นข้อความรอง (Ctrl+Z / Ctrl+Y / − / + / Ctrl+0)
- **ตำแหน่ง:** ขอบขวาล่างของ "พื้นที่ทำงาน" ห่างขอบ `space-4` 16 · `z-sticky` 10 (ใต้ popover/dialog) · ห้ามทับปุ่มหยุด/บล็อกที่วาง (ดัน content ด้วยการเว้น padding ขวา ไม่ใช่ลอยทับ) · ต้องใช้งานได้จริง (design-taste ข้อ 2)
- **ระดับซูม:** แสดงเปอร์เซ็นต์เป็นข้อความ `text-sm` 14 ใน tooltip ของ "พอดีจอ" หรือในกรอบ? → ข้อเสนอ: **ไม่แสดงตัวเลขถาวร** (ลดรก ข้อ 4) แสดงเมื่อกด + ขึ้น toast สั้น (หรือ `aria-live`)

### ค3 flyout พื้นทึบ 80–90% · **ใหม่ · School Bot Studio**

- **แนวทาง:** พื้น = `surface` #FFFFFF ที่ **alpha 0.9** (หรือ 0.8 ตามที่ผู้ใช้เลือก) · **ไม่มี hex ใหม่** แต่เป็นค่า alpha ใหม่ → ต้องบันทึกเป็น DSG ก่อนใช้ (Q4)
- ขอบขวา 2px `border` · `radius-lg` 16 เฉพาะมุมนอก · `shadow-float` · ไม่ blur (blur ซ่อนบล็อกด้านหลัง + หนักเครื่อง · ไม่ใช้ `backdrop-filter`)
- ข้อความ/บล็อกใน flyout: ตัว `text-primary` 16px · **ตรวจ contrast กรณีแย่สุด:** `text-primary` บนขาว 90% ทับ #F4F7FB → ≥ 14.4:1 · ทับสีหมวดบล็อกเข้มสุด (DSG-13) ยังต้องวัดเมื่อมี hex ถาวร
- เปิด/ปิด: `dur-move` 0.2s `ease-out` / `ease-in` · เปิดไม่ผลัก layout (ลอยทับพื้นที่ต่อบล็อก) · ปิดด้วย Esc/แตะที่อื่น/กดซ้ำหมวด · reduced-motion = ไม่มี transition
- ความกว้าง flyout ใช้ 184 (A2 · panels=show) หรือ 424 (A2 ปกติ) → ตัดสินในงาน Block Lab ไม่ใช่ CI
- ฉากหลังพื้นที่ต่อบล็อกที่ถูกทับ **ต้องยังโต้ตอบได้ไหม?** ข้อเสนอ: โต้ตอบไม่ได้ขณะ flyout เปิดด้วยฉากหลังโปร่ง (ไม่ dim) เพื่อไม่ให้ลากพลาดทะลุ

### ค4 บล็อกหัวโดมแบบ Tinkercad (hat block) · **ใหม่ · School Bot Studio**

- **รูปทรง (ไม่ใช่สี):** แถบหัวโค้งโดมด้านบนซ้าย · รัศมีโดม `radius-lg` 16 (ไม่ใช้ 24+ นอก scale) · ตัวบล็อกกว้างตามเนื้อหา · มุมล่างซ้าย 0 (เพื่อต่อเข้า stack) · notch ล่างตามบล็อกอื่น (ค่าเดียวกับบล็อกของ A2) · ขอบ SVG 1px สีขอบหมวด (DSG-13) · ไม่มีบล็อกเกาะบน (hat เกาะไม่ได้ · A2 รอบ 4)
- **ข้อความ:** ชื่อ hat ("เริ่มต้น" / "วนซ้ำ") 16px 400 `text-primary` (ตามที่ A2 ใช้ · ห้าม 700 บนพื้นสี) · คำกำกับ "ทำครั้งเดียว/ทำไปเรื่อย ๆ" เป็นชิปขาว 60% (เหมือน A2 รอบก่อน)
- **สี:** พื้น/ขอบตามหมวด = **DSG-13 (16 สี พื้น/ขอบ)** ที่ A2 ลงทะเบียนไว้ ยังไม่เป็น token → ระบุเป็น DSG ที่ต้อง approve (ดู จ)
- **สถานะ:** วางแล้ว (✓ + ข้อความ + `aria-disabled` ในรายการ) · ถูกเลือก = ขอบ 3px `action-primary` · มีปัญหา = ป้ายเตือน `warning-bg` + ไอคอน · disabled/ยังไม่ได้ต่อ = `off-bg` + ขอบประ `text-secondary` (ตาม A2)
- **อ้างอิง:** Tinkercad Codeblocks / Scratch / mBlock (design-taste ข้อ 3) · ลากต่อได้จริง (ข้อ 2)

### ค5 splash · **ใหม่ · School Bot Studio**

- **องค์ประกอบ (ขั้นต่ำ):** พื้น `background` #F4F7FB เต็มจอ 1440×840 · โลโก้ "School Bot Studio" กึ่งกลาง (ใช้ไฟล์ที่ทีม SchoolBright ให้ · ตอนนี้ยังเป็นรูปตัวอักษร · brand §9 ชื่อและโลโก้) · มาสคอตท่า **วิ่ง (#7 · กำลังโหลด)** ขนาด ≤ 150px ตาม brand §8 (หรือท่า #1 โบกมือ เมื่อเปิดครั้งแรก) · ข้อความกำกับ "กำลังเปิด School Bot Studio…" 18/700 (ห้ามสื่อด้วยภาพอย่างเดียว) · แถบโหลด: รางสูง 8 `radius-pill` `border` + แท่ง `action-primary` (ไม่มีเลขตัวเลข ไม่มี hex ใหม่)
- **การเคลื่อนไหว:** ปรากฏ/หาย **ครั้งเดียว ≤ `dur-move` 0.2s** · วนไม่หยุดได้เฉพาะ spinner `dur-spin` 0.8s (ถ้าไม่มีแถบโหลดจริง) · แถบเดินใช้ `linear` · มาสคอตไม่กะพริบ (AC-19) · reduced-motion = ไม่เลื่อน ไม่ fade
- **เนื้อหา:** ไม่เกิน 1 สิ่ง · แสดงนานเท่าที่โหลดจริง · ถ้าเกินเกณฑ์ (เช่น > 5 วิ ต้องมีกำหนด dev) ขึ้นข้อความ "รอสักครู่นะ" + ปุ่ม "ลองใหม่" (voice §7 ไม่ลงโทษ) · ห้ามมีเสียง
- **มาสคอต:** สีส้มของภาพ 3D ไม่อยู่ใน §1 → ใช้ในภาพเท่านั้น ไม่เอามาทำ UI (brand §8) · ภาพตกแต่ง alt ว่าง ข้อความกำกับอยู่แล้ว

---

## (ง) ข้อความร่างที่จะย้ายไป brand.md §11 (หลังผู้ใช้ approve)

> ร่างด้านล่างคือ **ข้อความที่จะวางใน §11** · ค่าที่ Arm Lab ผิด token ถูกปรับให้ตรง §1–6 และติดป้าย `[ปรับ]` (บอกค่าเดิม) · ค่าที่ขาด token ติดป้าย `[DSG]` · ป้าย **ใหม่ · School Bot Studio** = ไม่มีใน Arm Lab

```markdown
## 11. CI ของ School Bot Studio (components ระดับ UI)

ที่มา: ถอดจากหน้าจอ Arm Lab ที่อนุมัติแล้ว (ผู้ใช้ approve 2026-10-26) · Arm Lab เป็นแม่ของ CI (design-taste ข้อ 1) · ค่าทุกตัวต้องมาจาก §1–6 · ป้าย [ปรับ] = Arm Lab ใช้ค่านอกตารางแล้วปรับเป็น token · [DSG] = ยังไม่มี token ต้อง approve ก่อนใช้ · "ใหม่" = ไม่มีใน Arm Lab ออกแบบใหม่ในตระกูลเดียวกัน
กฎร่วม: ฟอนต์ IBM Plex Sans Thai · เนื้อหา/ทุก control ≥ 16px · เป้ากด ≥ 44×44 · focus ring #B85E00 (D-17) · ไอคอน SVG Lucide stroke 2.4 · ปุ่มปิดใช้ = aria-disabled + popup อธิบาย (D-03) · ทุก animation มี reduced-motion

### 11.1 โครงหน้า
- หน้าต่าง 1440×900 = แถบหน้าต่าง 60 + พื้นที่ 840 [ปรับ · Arm Lab เดิม 44 + 856] (รอผู้ใช้ตัดสิน Q1: รวม header เป็นแถบเดียวแบบ A2 หรือแยก)
- กรอบ content: ขอบนอก 24 · ห่างจากแถบบน 12 · ระหว่างแผง 12 (แนวตั้ง) / 24 (ซ้าย–ขวา) · ห่างล่าง 16
- แผง: พื้น surface · ขอบ border-default 2px #DCE3EC · radius-lg 16 [ปรับ · เดิม 20/22/18] · padding space-3 12 (หัวแผง/แถบล่าง space-4 16) [ปรับ · เดิม 10]
- เวที (stage): พื้น background หรือ surface [DSG · Arm Lab ใช้ gradient 3 สี #F2F8FF/#DCEBFB/#CFE2F8] · radius-lg 16 [ปรับ · เดิม 22]

### 11.2 แถบบน (header)
- สูง 60 · padding 0 24 · พื้น surface · ขอบล่าง 2px border · gap space-3 12 [ปรับ · เดิม 10]
- ลำดับซ้าย→ขวา: โลโก้ School Bot Studio (192×34) · ป้ายโมดูล (Arm Lab/Block Lab 100×25) · spacer · ชื่องาน + สถานะบันทึก · ปุ่ม ☰
- ไม่มีตัวคั่นแนวตั้ง (ใช้ spacer) · ตัวคั่นภายใน (เมนู/แถบล่าง) = border-thin 1px border [ปรับ · เดิม 2px #EEF1F5/#DCE3EC]
- ปุ่ม ☰: 44×44 [ปรับ · เดิม 44×40] · radius-md 12 · ขอบ 2px border-strong #C6D6EA · พื้น surface · ไอคอน icon-md 20 stroke 2.4 [ปรับ · เดิม 2.6] · เปิดอยู่: พื้น+ขอบ action-primary ตัวขาว
- ปุ่มบ้าน: [DSG/Q6] A2 มี Arm Lab ไม่มี

### 11.3 ชิป
- ชิปมีกรอบ (สถานะอุปกรณ์/คลาวด์): สูง 32 (พื้นที่กด 44) · padding 0 space-3 12 · radius-pill · border-default 2px · ไอคอน 20 + ข้อความ 16/600 · gap space-2 8 · hover ขอบ action-primary
  - ปกติ/มีค่า: พื้น surface ขอบ border · ไม่มี/ปิด: พื้น off-bg ขอบ border · กำลังทำ: พื้น action-primary-subtle ขอบ border-strong + spinner action-primary · เตือน/ออฟไลน์: พื้น warning-bg ขอบ warning-strong + ไอคอน triangle-alert/cloud-off · ผิดพลาด/หลุด: พื้น surface ขอบ danger + ไอคอน circle-alert
- ชิปไม่มีกรอบ (สถานะอ่านอย่างเดียว เช่น "เชื่อมต่อแล้ว"): จุด 8–10 สีตามความหมาย + ข้อความ 14–16/600 สีตามความหมาย (success/text-secondary/warning-strong) · ไม่มีพื้น · ใช้เฉพาะข้อมูลรองที่ไม่ต้องกด [ปรับ · เดิม #1E6B25 13px]
- สถานะที่ต้องกดหรือเปลี่ยนการตัดสินใจ = ชิปมีกรอบเสมอ (เปิด popover)
- สีสถานะ + ไอคอน + ข้อความคู่กันเสมอ (§1)

### 11.4 ชื่อไฟล์ + สถานะบันทึก + เปลี่ยนชื่อ inline
- ชื่อ: ปุ่ม (role=button) ขนาด 16/700 [ปรับ · เดิม 14] · พื้นที่กดสูง 44 · padding 0 space-2 · radius-sm 8 [ปรับ · เดิม 6] · max-width 190 · ellipsis ใช้ lh-clip 1.7 · hover: พื้น action-primary-subtle ตัว+ขอบล่าง action-primary · title/tooltip "แตะเพื่อเปลี่ยนชื่องาน"
- ช่องแก้: ขอบล่าง 2px action-primary · พื้น action-primary-subtle · radius-sm 8 · 16/700 · maxLength 30 · aria-label "ชื่องาน" · placeholder ตามตัวอย่าง
- พฤติกรรม: คลิก = เข้าโหมดแก้ · Enter = บันทึกชื่อ · Esc = ยกเลิก (ไม่บันทึก) · blur = บันทึก · ตัดช่องว่างหัวท้าย · [DSG/Q5] ชื่อว่าง = กลับชื่อเดิม + ข้อความสั้น "ชื่องานต้องไม่ว่าง" (aria-live) ไม่เงียบ · ชื่อซ้ำ = แจ้ง "มีชื่อนี้แล้ว" ยังให้ใช้ได้หรือไม่ [Q5]
- สถานะบันทึก (ใต้ชื่อ): ข้อความ 12–14/600 · "บันทึกแล้ว HH:MM" = success · "บันทึกแล้ว HH:MM · มีแก้ไขใหม่" = text-secondary [ปรับ · เดิมเขียว] · "ยังไม่ได้บันทึกงาน" = text-secondary · role=status · ไม่ใช้ 11px [ปรับ]

### 11.5 ปุ่มหน้าต่าง
- Windows (ขวา): ซ่อน · ย่อ · ปิด · ปุ่ม 48×44 · face 40×36 radius-sm 8 · ขอบ 2px โปร่ง · ไอคอน 20 stroke 2.4 · ตัว text-secondary · hover/focus: พื้น action-primary-subtle ขอบ+ตัว action-primary · active: พื้น+ขอบ action-primary ตัวขาว · tooltip ใต้ปุ่ม
- Mac (ซ้าย): ปิด · ย่อ · ซ่อน · ปุ่ม 40×44 · วงกลม 28 · สี DSG-11 (#FF5F57/#FEBC2E/#28C840) ไอคอน 16 text-primary
- ไม่มี maximize/restore (หน้าต่าง 1440×900 ตายตัว) [ถ้าต้องการ: ออกแบบใหม่ Q7]

### 11.6 tab (segmented)
- ราง: พื้น border #DCE3EC [ปรับ · เดิม #E7EDF5] · padding space-1 4 [ปรับ · เดิม 3] · gap space-1 4 [ปรับ · เดิม 2] · radius-md 12
- tab: สูง 44 [ปรับ · เดิม 36] · padding 0 space-3 12 · radius-md 12 [ปรับ · เดิม 9] · 16/700 [ปรับ · เดิม 14] · ไอคอน 20 gap 8
- ปกติ: พื้นโปร่ง ตัว text-secondary (4.66:1 บน border) · hover: พื้น action-primary-subtle ตัว text-primary [ปรับ · เดิมไม่มี hover] · selected: พื้น surface ตัว action-primary ขอบ 3px border-selected? [DSG · Arm Lab ใช้ shadow `0 1px 3px` ซึ่งไม่อยู่ใน §4 → ใช้ shadow-float ไม่เหมาะ · ข้อเสนอ: ขอบ border-default 2px action-primary] · focus-visible: ring #B85E00 3px offset 2 · ปิดใช้: aria-disabled + off-bg + ขอบ border + ตัว text-secondary + popup อธิบาย [ปรับ · เดิม #A9B3BF disabled]
- role=tablist/tab · aria-selected · ลูกศรซ้ายขวาเลื่อนระหว่าง tab

### 11.7 สถานะ selected
- การ์ด/แถว/รายการที่เลือก: ขอบ border-selected 3px action-primary + พื้น action-primary-subtle (ตัวอย่างต้นแบบ: การ์ดท่าใน Arm Lab) · วงนอก 3px #D0EBFD ตกแต่งได้ (ห้ามเป็นตัวบอกเดียว)
- เลือกหลายรายการ (ท่าชุด): ขอบ 3px group + พื้น group-bg
- ไม่ได้เลือก: ขอบ 2px border (ล่าง 4px ถ้าเป็นการ์ดกดได้ — raise)
- hover รายการเมนู/แถว: พื้น action-primary-subtle

### 11.8 tooltip
- พื้น text-primary #14243D · ตัว #FFFFFF · 14/500 lh 1.6 (ข้อความรอง) · padding space-1 4 space-3 12 · radius-sm 8 · z-popover 40 · ไม่รับเมาส์ · ขึ้นตอน hover และ focus-visible (และแตะค้างบนจอสัมผัส) [ปรับ · Arm Lab มี 3 สไตล์ 13/14px + title ของเบราว์เซอร์]
- วางใต้ปุ่ม 4–8 (ปุ่มขอบล่างวางด้านบน · ปุ่มขอบขวาวางด้านซ้าย)
- ทุกปุ่มไอคอนล้วนต้องมี aria-label + tooltip ข้อความเดียวกัน

### 11.9 popover
- พื้น surface · ขอบ border-thin 1px border · radius-lg 16 · padding space-4 16 · shadow-float · หัว 18/700 · ตัว 16 lh 1.6 · เมตา 14 text-secondary · z-popover 40 · ฉากหลังโปร่งใสคลุมจอ ปิดด้วยแตะที่อื่นและ Esc · เข้า dur-move 0.2s ease-out จาก translateY(-4px) (reduced-motion = ไม่มี)
- popover ในแถบล่างเปิดขึ้นด้านบน ไม่บังปุ่มหยุด (§4)
- เมนู (รายการกดได้): กว้างตามเนื้อหา ≤ 280 · padding space-2 8 · รายการสูง 44 [ปรับ · เดิม 40/36] radius-md 12 [ปรับ · เดิม 9/10] 16/600 [ปรับ · เดิม 15] · hover action-primary-subtle · ตัวคั่น border-thin · รายการคีย์ลัด: kbd 12/700 text-secondary

### 11.10 dialog + ฉากหลัง
- dialog: กว้าง 520 · padding space-6 24 · radius-lg 16 · พื้น surface · shadow-modal · gap space-3 12 · หัว 24/700 lh-heading 1.3 (มีกล่องไอคอน 40×40 radius-md 12 ตามความหมาย: เตือน = warning-bg + warning-strong) · ตัว 16 lh-body 1.6 · ปุ่มสูง 48 padding 0 space-4 radius-md 12 16/700 ชิดขวา gap space-3 · role=alertdialog aria-modal · โฟกัสเริ่มที่ปุ่ม "อยู่ต่อ/ยกเลิก" (ปุ่มปลอดภัย) · Esc ปิด · ปุ่มหลัก = action-primary นูน (ลบ/อันตราย = danger ไม่ใช้รูปทรง stop)
- ฉากหลัง: rgba(20,36,61,.35) (text-primary ที่ alpha .35 · [DSG] บันทึกค่า alpha) · z-backdrop 20 · dialog z-dialog 30 · ห้ามคลุมปุ่มหยุด (ต้องออกแบบพื้นที่เว้นหรือยก z-stop 70 · CR-10)
- ไม่ใช้ dialog radius 20/22/24 [ปรับ · เดิม MA]

### 11.11 ปุ่มไอคอน และกลุ่มปุ่ม toolbar
- ปุ่มไอคอนล้วน: 44×44 · radius-md 12 · ไอคอน icon-lg 24 stroke 2.4 · ไม่มีกรอบ ไม่นูน · ตัว text-primary · hover action-primary-subtle · active action-primary/ขาว · aria-label ไทย + tooltip
- กลุ่มปุ่ม (toolbar): กรอบเดียว พื้น surface · ขอบ 2px border · radius-lg 16 · padding 4 · gap 4 · shadow-float · ตัวคั่น border-thin ระหว่างกลุ่มที่ทำงานต่างกัน · ปุ่มที่ทำงานเกี่ยวกันรวมกรอบเดียว (design-taste ข้อ 5)
- ปุ่มนูน (ปุ่มกด/คำสั่ง): สูง ≥ 44 [ปรับ · เดิม 30–36] · radius-md 12 · ขอบล่าง raise 4px [ปรับ · เดิม 5px] · หลัก = action-primary/ล่าง action-primary-dark ตัวขาว · รอง = surface ขอบ 2px border-strong ตัว action-primary · หุ่น = action-robot ล่าง action-robot-dark **ตัว text-primary** [ปรับ · เดิมตัวขาว] · กด: ล่างเหลือ 2px เลื่อนลง 2px
- ปุ่มหยุดทั้งหมด: ตาม D-01 วงกลมใหญ่ + z-stop (Arm Lab/A2 ใช้สี่เหลี่ยมมุมมน — รอผู้ใช้ตัดสิน Q2) · ขอบล่าง DSG-12 (#8E1B1B)

### 11.12 ไอคอนขยาย/ย่อ (ของแผง)
- เต็มพื้นที่ = Lucide `maximize` (path `M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5`) · ย่อกลับ = `minimize` (path `M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5`) · icon-md 20 stroke 2.4 · ปุ่มสูง 44 · ข้อความ "เต็มจอ"/"ย่อ" 16/700 [ปรับ · เดิม 13px สูง 36] · aria-pressed + aria-label บอกผล
- chevron เปิด/ปิดเมนู: chevron-down 16 stroke 2.4 [ปรับ · เดิม 3–3.2]
```

---

## (จ) ข้อเสนอแก้ข้อความเก่าใน brand.md §9 / §10

| ตำแหน่ง | ข้อความเดิม | ข้อเสนอแทน | เหตุผล |
|---|---|---|---|
| §9 แถว "สีหมวดบล็อก Block Lab" (brand.md บรรทัด 342) | ใช้ "สีชุด B" 8 กลุ่มจาก Main-1D · ยังไม่มี token (โน้ตบน canvas) · ต้องทำ token ก่อนออกแบบหมวดใหม่ 10 หมวด · สถานะ ค้าง · ที่มา EV-04, EV-05 | **แถบหมวดบล็อก 16 หมวด 4 กลุ่ม** (พื้นฐาน 5 · ข้อมูล 4 · อุปกรณ์ 6 · อื่น ๆ 1 · R18 · DEC-20) · **สี 16 คู่ พื้น/ขอบ = DSG-13** (ลงทะเบียนใน `block-lab/design/D1-editor.md` §ค่าที่ใช้ · อิงชุด mBlock/Scratch 3 ปรับความสว่างให้ตัวกรมท่าผ่าน) · ตัวอักษรบนบล็อก `text-primary` 16px/400 ทุกหมวด · ใช้เฉพาะบล็อกและแถบหมวด ไม่ใช่ปุ่ม/สถานะ · สถานะ: รอ approve เป็น token `cat-<ชื่อ>` / `cat-<ชื่อ>-border` · ที่มา R18, OQ74–75, DSG-13 | "8 กลุ่ม / 10 หมวด" ล้าสมัย (DEC-20: 10 → 16 หมวด ผู้ใช้ 2026-10-22) · สีชุด B 8 กลุ่มไม่พอ · ค่าสีมีแล้วใน D1 |
| §9 แถว "ข้อความล้าสมัยใน DESIGN.md / skill" | — | เพิ่มรายการ: "สีหมวดบล็อก 8/10 หมวด → 16 หมวด (DEC-20)" | ให้เจ้าของ design system แก้ตามไปด้วย |
| §9 แถว "พื้นที่หน้าจอแอป" และ "แถบหน้าต่าง (DSG-03)" | แถบ 60 + พื้นที่ 840 · "ปุ่ม Windows ซ่อน/ย่อ/ปิด" | เพิ่มหมายเหตุ: canvas Arm Lab (`WindowBarV1` · `MainV6A`) ยังสูง 44 + 856 · ต้องแก้ (CR-09 ค้าง) · A2 ใช้ 60 + 840 แล้ว | ให้ brand ตรงกับของจริงและไม่ให้ใครคัดลอกค่า 44/856 ไปอีก |
| §10 หัวข้อ/ย่อหน้าแรก | "DESIGN.md หมวด 8–16 (components, patterns) ยังเป็น TODO ต้นฉบับ → component ใหม่ทุกตัวเป็น DS gap" | เพิ่มประโยค: "component ระดับ UI ที่ Arm Lab มีแล้วอยู่ที่ §11 (CI) · DSG ใหม่ใช้ได้เฉพาะของที่ §11 ไม่ครอบคลุม" | กันสร้างสไตล์ซ้ำ (design-taste ข้อ 1) |
| §10 ตาราง DSG | DSG-04 ถึง DSG-10 | เพิ่มแถว DSG ใหม่ (ถ้า approve): DSG-11 (Mac) และ DSG-12 (stop-dark) ที่ §9 อ้างอยู่แล้ว **ไม่อยู่ในตาราง §10** → เพิ่มลงตาราง · DSG-13 (16 สีหมวดบล็อก) · DSG-14 (alpha ฉากหลัง dialog .35 / flyout .8–.9) · DSG-15 (monospace ในแอปนักเรียนสำหรับ terminal) · DSG-16 (สีสถานะบนพื้นเข้ม ถ้าเลือก terminal แนวทาง B) · DSG-17 (stage gradient/พื้นเวที) | ตาราง §10 ไม่ครบเทียบกับที่ §9 และ D1 อ้างถึง |
| §1 "ค้างไว้" | "เมนูด้านข้างใช้ #3A5576" / "ปุ่ม ⋯ #3F5A7A" ไม่มี | เพิ่ม: #3F5A7A (ปุ่ม ⋯ ใน MainV6AJoints) · #8FB3E3 (ขอบปุ่มบนพื้นอ่อนและเข้ม ~30 จุด) · #8A96A3 (31 จุด · 3.01:1 ไม่ผ่านเป็นข้อความ) · #E7EBF0/#E7EDF5 (พื้น off/ราง tab) | ให้ "ค้างไว้" ตรงกับที่ถอดรอบนี้ (ไม่ใช่งานของ CI แต่เกี่ยวเนื่อง) |

---

## คำถามที่ผู้ใช้ต้องตัดสินก่อน approve (ตอบทีละข้อ · รูปแบบ design-taste ข้อ 8)

1. **Q1 แถบหน้าต่าง/header:** CI = แถบเดียว 60 รวมทุกอย่างแบบ A2 หรือ 2 แถบ (หน้าต่าง 60 + header 60) แบบ Arm Lab เดิม (ซึ่งตอนนี้ 44 + 60) · ผลต่อพื้นที่ใช้งาน (840 หรือ 780)
2. **Q2 ปุ่มหยุดทั้งหมด:** ยึด D-01 วงกลมใหญ่ + ตำแหน่งตายตัว หรืออนุมัติสี่เหลี่ยมมุมมน (Arm Lab 56 / A2 46) เป็น CI และแก้ D-01 (ผูก OQ82)
3. **Q3 toolbar 5 ปุ่ม:** เป็น เลิกทำ/ทำซ้ำ/−/+/พอดีจอ (สมมติฐานในไฟล์นี้) หรือมีปุ่ม "เลื่อน (มือ)" ด้วย
4. **Q4 flyout:** ใช้ alpha 0.8 หรือ 0.9 (ไม่ต้องมี hex ใหม่ แต่ alpha เป็น DSG)
5. **Q5 ชื่อ/สถานะบันทึก:** ชื่อว่างให้ขึ้นข้อความเตือนหรือเงียบเหมือนเดิม · "· มีแก้ไขใหม่" เปลี่ยนเป็น `text-secondary`/`warning-strong` ได้ไหม · ตรวจชื่อซ้ำหรือไม่
6. **Q6 ปุ่มบ้าน:** Block Lab A2 มี Arm Lab ไม่มี → ให้ทั้งสองมี (ย้ายไปแถบหน้าต่าง) หรือใช้ ☰ → งานของฉัน อย่างเดียว
7. **Q7 maximize/restore:** ไม่ต้องมี (หน้าต่างตายตัว 1440×900) ตามที่เป็นอยู่ใช่ไหม
8. **Q8 ขอบเขตการแก้:** ถ้า approve (ง) ให้ session หลักย้ายไป brand.md §11 แล้วเปิดงานแก้ Arm Lab ให้ตรง CI (frame 60/840, ฟอนต์, ปุ่ม 44, สี) เป็น CR แยก หรือคง Arm Lab ไว้ก่อนเพราะ "อนุมัติแล้ว" (เปลี่ยนต้องผ่าน CR · brand §8)

## ข้อจำกัดของไฟล์นี้

- ไม่ได้ render canvas (อ่านโค้ดอย่างเดียว) · ขนาดจริงของ element ที่ flex อาจต่างจากค่าที่อ่านจากโค้ด
- เลขบรรทัดอ้างอิงจากไฟล์ `.dc.html` เวอร์ชัน 1792930020-06e0 · ถ้า canvas เปลี่ยน เลขจะเลื่อน
- ค่า contrast คำนวณมือด้วยสูตร WCAG (ไม่ใช่เครื่องมือรับรอง)
- ค่าที่ไม่ได้ตรวจ: การทำงานจริงของ rename (Esc/blur), ค่า `loopBtnStyle`/`rgSelStyle`/`lpStyle` ใน BR (ขนาดปุ่ม − + และ select) อ่านเฉพาะส่วนที่อ้างข้างบน
