# ux-knowledge/ — ความรู้ UX ทั่วไปของทีมออกแบบ

ความรู้ที่ไม่ผูกกับบริษัทหรือ project ใด มากับ package baan และอัปเดตพร้อม role ที่ใช้มัน (`survey`, `ui`, `review`)
ของเฉพาะบริษัท (เกณฑ์ WCAG ของทีม · component กลางของบริษัท) อยู่ที่ `_shared/` ของ knowledge ใน workspace · หน้าตาของแต่ละ project อยู่ที่ `<project>/shared/brand/` + Design System ของ project · ความรู้ของ module เดียว (เช่น ต้นแบบที่ลอกพฤติกรรม) อยู่ใน `design/` ของ module นั้น

## อ่านอะไรบ้าง — ตาม `platform` / `os` ในหัวไฟล์ INDEX ของ module

1. **`common/` อ่านทุกงาน**
2. แล้วเปิดหมวดของแพลตฟอร์ม: `<platform>/` และ `<platform>/<os>/` ที่มีจริง (โฟลเดอร์ที่ยังไม่มี = ยังไม่มีความรู้เฉพาะ ใช้ `common/` อย่างเดียว)

| `platform` | `os` | โฟลเดอร์ |
|---|---|---|
| `web` | — | `web/` |
| `desktop` | `mac` · `windows` | `desktop/apple/` · `desktop/windows/` |
| `mobile` | `ios` · `android` | `mobile/ios/` · `mobile/android/` |

ไม่มี `platform` ในหัวไฟล์ของ module → ใช้ของ `INDEX.md` ของ project · ไม่มีทั้งคู่ → `common/` อย่างเดียว และบอกในผลงานว่า module ยังไม่ระบุแพลตฟอร์ม
หมวดที่ยังว่างสร้างเมื่อมีเนื้อหาจริง · ความรู้ Apple ที่ iOS ใช้ร่วม (สี ตัวอักษร ขนาดขั้นต่ำ) อยู่ที่ `desktop/apple/hig-foundations.md` — `mobile/ios/` อ้างกลับไปที่นั่นได้ ไม่คัดลอก

## ไฟล์ที่มี

| ไฟล์ | สรุป |
|---|---|
| `common/usability-heuristics.md` | Nielsen 10 heuristics (H1-H10) + วิธีใช้ต่อ role |
| `common/ui-design-58-rules.md` | 58 กฎ UI (UI1-UI58) พร้อมเกณฑ์วัดได้ ระดับหลักฐาน A/B/C และข้อห้ามเมื่อผู้ใช้เป็นเด็ก (UI53, UI57, UI58) |
| `common/universal-design.md` | 7 หลักการ Universal Design (UD1-UD7) ตีความสำหรับ UI |
| `desktop/apple/hig.md` | สารบัญ Apple HIG + หลักตัดสินเมื่อไม่มีกฎเฉพาะ (เปิดก่อน แล้วเลือกไฟล์ย่อย) |
| `desktop/apple/hig-macos-bars.md` | HIG บน macOS: menu bar, toolbar, window, sidebar, split view, panel (HM1-HM30) |
| `desktop/apple/hig-foundations.md` | HIG ฐานราก: ขนาดขั้นต่ำ, text styles, สี, Liquid Glass, layout (HF1-HF16) |

ที่มา: `knowledge/` ของ sketchbook (ย้ายเข้า package 2026-11-02) · `arduino-cloud-editor-syntax.md` ย้ายไปอยู่ `school-bot/modules/block-lab/design/` ใน knowledge เพราะใช้กับ Block Lab เท่านั้น
