# กฎตัวแก้โค้ดและ Output ของ Block Lab

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (แตกจาก brand.md ของ sketchbook ให้อ่านได้ทีละไฟล์)
> ใช้ที่: D1 (`CodeEditorA2`) · D4 (`TerminalA2`)

ย้ายมาจาก brand.md §11.16–§11.19 ของ sketchbook (2026-11-02) เพราะเป็นพฤติกรรมเฉพาะ module ไม่ใช่ของทุกหน้า · ข้อเท็จจริงของต้นแบบ: [arduino-cloud-editor-syntax.md](arduino-cloud-editor-syntax.md) (AS1–AS7) · component ช่องพิมพ์ทั่วไป: [shared/brand/components/input.md](../../../shared/brand/components/input.md)

## Output (terminal) · Proposed (แนวทาง A ใน sketchbook `projects/school-bot/ci-proposal.md` ค1)

- พื้น `surface` · ขอบ `border-default` `border` · `radius-lg` · ช่องพิมพ์คำสั่งติดล่างสูง 44 · ปุ่ม "เลื่อนตาม" และ "ล้าง"
- ข้อความผู้ใช้ `text-primary` · จากบอร์ด `text-secondary` · error `danger` + ไอคอน
- monospace 16px (DSG-15 · ยังไม่ approve) · `role=log` `aria-live=polite`
- ยังไม่ approve รายละเอียดจนกว่าจะแก้ R8 (ช่องส่งข้อความ Serial)

## autocomplete (OQ204–OQ206 · AS4–AS5)

- **ตาม Arduino Cloud Editor:** ขึ้นใต้เคอร์เซอร์หลังพิมพ์ตัวอักษรแรก · จับคำขึ้นต้น แยกตัวพิมพ์เล็ก-ใหญ่ · รายการคำชุดของ Arduino (4 กลุ่ม hints/builtIn/literal/type) · ไม่มี keyword C/C++ · ไม่มีเมธอดหลังจุด · ไม่ใส่ `()` · แนะนำในคอมเมนต์ด้วย (ถือแบบ AS4 จนกว่าจะตรวจซ้ำ)
- ส่วนที่ตรงตัวหนา · ป้ายกลุ่มท้ายแถวเป็นคำไทย/3 ภาษา: คำสั่ง · คลาส · ชนิดข้อมูล · ค่าคงที่ (OQ205) · ตำแหน่ง/สี/ตัวเอียงเหมือน Arduino
- **Enter/Tab ใส่รายการแรกทันที** ไม่ต้องกดลูกศรก่อน (OQ206) · Esc ปิด · หน้าตาเมนูตาม [shared/brand/components/popover.md](../../../shared/brand/components/popover.md)
- ไม่มีแผงปัญหาถาวร · error แปลงโค้ดแจ้งใน Output · ไม่ใช้สีแดง/เส้นหยักเตือนระหว่างพิมพ์ (design-taste ข้อ 11)

## เครื่องหมายคู่ (OQ203, OQ206 · AS5, AS7)

- `(` `{` `[` `"` `'` เติมคู่ เคอร์เซอร์อยู่กลาง · พิมพ์ตัวปิดซ้ำ = ข้าม · Enter ระหว่าง `{}` แตก 3 บรรทัดและเยื้อง
- Backspace ในคู่ว่าง ลบแค่ตัวเปิด เหลือตัวปิด · `'` หลังตัวอักษรไม่เติมคู่ (เช่น don't) · ครอบข้อความที่เลือกด้วยคู่ = ค่าเริ่มต้นของตัวแก้โค้ด (ยังไม่ได้ทดสอบกับ Arduino)

## สี syntax (OQ204, OQ207, OQ208 · AS2)

- จับคู่กลุ่มคำตาม Arduino ปรับเข้มให้ ≥ 4.5:1 บนพื้นตัวแก้โค้ด บรรทัดเคอร์เซอร์ และพื้นที่เลือก

| กลุ่ม | สี |
|---|---|
| ชนิด/keyword (`int` `void` `String` `long` `float` `char` `unsigned`) + ค่าคงที่ | teal |
| ฟังก์ชัน/เมธอด Arduino + `if` `for` `while` `else` `return` `switch` `break` `#include` | มะกอก |
| `true` `false` | เทา (หนา — ต่างจากคอมเมนต์ด้วยน้ำหนัก) |
| คลาส (`Serial` `Servo`) + การเรียกที่ไม่อยู่ในรายการ | ส้ม |
| ข้อความ "..." | teal เข้ม |
| ตัวเลข | น้ำตาล |
| คอมเมนต์ | เทา |
| ตัวแปร / เครื่องหมาย | `text-primary` |

- ค่า hex ของแต่ละสีอยู่ในตาราง D1 (designer คำนวณ)
- **ตัวหนา 700 บนทุกคำที่ลงสี** (keyword ชนิด ค่าคงที่ ฟังก์ชัน คลาส `true` `false`) · ปกติ = ตัวเลข ข้อความ คอมเมนต์ ตัวแปร การเรียกที่ไม่อยู่ในรายการ · เป็นสัญญาณที่สองตาม WCAG 1.4.1 (OQ208 · ต่างจาก Arduino ที่ไม่มีตัวหนา)
