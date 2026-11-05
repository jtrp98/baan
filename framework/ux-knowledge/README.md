# ux-knowledge/ — ความรู้ UX ทั่วไปของทีมออกแบบ

ความรู้ที่ไม่ผูกกับบริษัทหรือ project ใด มากับ package baan และอัปเดตพร้อม role ที่ใช้มัน (`survey`, `ui`, `review`)
ของเฉพาะบริษัท (เกณฑ์ WCAG ของทีม · component กลางของบริษัท) อยู่ที่ `_shared/` ของ knowledge ใน workspace · หน้าตาของแต่ละ project อยู่ที่ `<project>/shared/brand/` + Design System ของ project · ความรู้ของ module เดียว (เช่น ต้นแบบที่ลอกพฤติกรรม) อยู่ใน `design/` ของ module นั้น

ทีมออกแบบใช้เอกสารชุดนี้ใน session แบบคุยสดตาม [BAAN.md](../BAAN.md) และ [CONVENTIONS.md](../CONVENTIONS.md)
ผล review/UX sign-off เป็นบริบทและประตูของงานพัฒนา; Worker implement และ Verifier ของ execution engine ตรวจตาม packet ไม่ใช่การเรียกทีมออกแบบผ่าน role runner เดิม
ชื่อ Feasibility/Designer/Reviewer ในเนื้อหาอ้างหน้าที่ `survey`/`ui`/`review` ตามลำดับ

## อ่านอะไรบ้าง — ตาม `platform` / `os` ในหัวไฟล์ INDEX ของ module

1. **`common/` อ่านทุกงาน**
2. แล้วเปิดหมวดของแพลตฟอร์ม: `<platform>/` และ `<platform>/<os>/` ที่มีจริง (โฟลเดอร์ที่ยังไม่มี = ยังไม่มีความรู้เฉพาะ ใช้ `common/` อย่างเดียว)

| `platform` | `os` | โฟลเดอร์ |
|---|---|---|
| `web` | — | `web/` |
| `desktop` | `mac` · `windows` | `desktop/apple/` · `desktop/windows/` |
| `mobile` | `ios` · `android` | `mobile/ios/` · `mobile/android/` |

ไม่มี `platform` ในหัวไฟล์ของ module → ใช้ของ `INDEX.md` ของ project · ไม่มีทั้งคู่ → `common/` อย่างเดียว และบอกในผลงานว่า module ยังไม่ระบุแพลตฟอร์ม
ความรู้ Apple ที่ iOS ใช้ร่วม (สี ตัวอักษร ขนาดขั้นต่ำ) อยู่ที่ `desktop/apple/hig-foundations.md` — `mobile/ios/` อ้างกลับไปที่นั่น ไม่คัดลอก · ข้อที่ขัดกับ brand ของ project: brand ชนะเรื่องค่า (สี ฟอนต์ ขนาด) ไฟล์ในนี้ชนะเรื่องเหตุผล/ข้อห้าม

## ไฟล์ที่มี

| ไฟล์ | รหัส | สรุป |
|---|---|---|
| `common/usability-heuristics.md` | H1–H10 | Nielsen 10 heuristics + วิธีใช้ต่อ role |
| `common/ui-design-58-rules.md` | UI1–UI58 | 58 กฎ UI พร้อมเกณฑ์วัดได้ ระดับหลักฐาน A/B/C และข้อห้ามเมื่อผู้ใช้เป็นเด็ก (UI53, UI57, UI58) |
| `common/universal-design.md` | UD1–UD7 | 7 หลักการ Universal Design ตีความสำหรับ UI |
| `common/wcag-aa.md` | WA1–WA42 | WCAG 2.2 ระดับ AA ทุกข้อที่ทีมออกแบบตรวจได้ จัดตามเรื่อง บอกว่าตรวจจาก canvas ได้หรือต้องใช้ prototype/โค้ด |
| `web/web-foundations.md` | WB1–WB33 | layout/scroll · URL/Back/deep link · navigation · ตารางข้อมูล · ฟอร์ม · keyboard/focus · ลิงก์/พิมพ์/browser (ไม่ซ้ำกับ skill `web-design-guidelines`) |
| `desktop/apple/hig.md` | — | สารบัญ Apple HIG + หลักตัดสินเมื่อไม่มีกฎเฉพาะ (เปิดก่อน แล้วเลือกไฟล์ย่อย) |
| `desktop/apple/hig-macos-bars.md` | HM1–HM30 | HIG บน macOS: menu bar, toolbar, window, sidebar, split view, panel |
| `desktop/apple/hig-foundations.md` | HF1–HF16 | HIG ฐานราก: ขนาดขั้นต่ำ, text styles, สี, Liquid Glass, layout |
| `desktop/windows/windows-fluent.md` | WF1–WF32 | Windows 11 / Fluent 2: title bar + caption buttons, snap, NavigationView, type ramp, ContentDialog, focus, theme + ส่วน "แอปที่รันทั้ง Windows และ Mac" |
| `mobile/ios/ios-hig.md` | IO1–IO34 | iOS/iPadOS: safe area, size class, tab bar/sidebar, sheet, gesture, Dynamic Type, SF Symbols, permission |
| `mobile/android/material.md` | MD1–MD31 | Material 3 (Expressive): window size class, navigation bar/rail, predictive back, 48dp, type scale, component, font scale 200% |

ทุกไฟล์มี `source:` (หน้าเอกสารทางการ + วันที่อ่าน) และแยกข้อที่ยังยืนยันไม่ได้หรือเป็นดุลยพินิจทีมไว้ชัด — ข้อพวกนั้นห้ามใช้เป็นเหตุตีตก

ที่มา: `knowledge/` ของ sketchbook (ย้ายเข้า package 2026-11-02) · `arduino-cloud-editor-syntax.md` ย้ายไปอยู่ `school-bot/modules/block-lab/design/` ใน knowledge เพราะใช้กับ Block Lab เท่านั้น
