# int-001-entry — UX ราย feature: Entry / License / Guest-Login / Shell / Close (Task UX-001)

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ข้อกำหนดที่ใช้ในไฟล์นี้: [AC-021-04 (ออกจาก workspace ที่เชื่อมต่อแล้วส่งคำขอหยุดแม้ไม่มีงานค้าง)](../requirement/req-021.md)
เอกสารนี้เป็นทางเข้าสำหรับลำดับเปิดแอป ตรวจ License เลือก Guest/Login เข้า Home shell และปิดแอป โดยรายละเอียดแต่ละสถานะอยู่ในไฟล์ย่อยและผลอนุมัติเดิมอยู่ในตาราง §9

> ฐานอ้างอิง: [REQ-009 (Desktop และการใช้งานออฟไลน์)](../requirement/req-009.md) · [REQ-012 (ออกจากงานและปิดหน้าต่าง)](../requirement/req-012.md) · [REQ-028 (Activate, validate และจำกัดอุปกรณ์)](../requirement/req-028.md) · [REQ-034 (ตรวจ License ออนไลน์และสิทธิ์ออฟไลน์ 3 วัน)](../requirement/req-034.md) · [REQ-036 (Guest Local และ Login Cloud)](../requirement/req-036.md) · [DES-002 (License และ device binding)](../design/des-002.md) Rev3 · [pack-guest-001 (ชุดมติพื้นที่ Guest การนำเข้าและการตรวจใหม่)](../requirement/pack-guest-001.md) (G1 (Guest ใช้พื้นที่ร่วมโดยไม่มี PIN)/G2 (ไม่ล้างงาน Guest อัตโนมัติ)/G6 (บังคับ License ทั้ง Guest และ Login)) · [มติ 004 (License และมาตรฐานชื่อข้อมูล)](../requirement/decisions-004.md), [มติ 005 (License ออฟไลน์ 3 วัน)](../requirement/decisions-005.md), [มติ 014 ( Guest พื้นที่ร่วม การนำงานและประวัติเข้าบัญชี)](../requirement/decisions-014.md), [มติ 019 ( Windows 11 ตามข้อเสนอแรก)](../requirement/decisions-019.md), [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../requirement/decisions-035.md)
> หลักการสำคัญ: เขียนตาม **target contract** (auth ผ่าน HTTP API Gateway (`sb-api-gateway`) → ระบบบัญชีเดิม ตามมติ 035) ไม่ใช่ as-built (ปัจจุบัน fullLogin NOT_READY, auth เหลือ HTTP logout/decoder local)

## เนื้อหาแยกตามงาน

เลขหัวข้อ § เดิมคงไว้ให้เทียบขอบเขตในตาราง Sign-off

| หัวข้อและเนื้อหา |
|---|
| [1. ภาพรวมลำดับ Entry (ข้อเสนอ — proposal)](int-001-entry-flow.md) |
| [2. E1 — First-run: กรอก Key และเปิดใช้งาน](int-001-entry-activation.md) |
| [3. การตรวจตอนเปิดแอปทุกครั้ง (validate + หน้าต่างออฟไลน์ 3 วัน)](int-001-entry-validation.md) |
| [4. E2 — เลือก Guest หรือ Login + Login flow · 5. ตาราง mapping ผลตรวจ → สถานะ → คำ copy (จาก DES-002 "Local state/errors")](int-001-entry-login.md) |
| [6. Home shell + ปุ่มหน้าต่าง · 7. ปิดหน้าต่าง / Save แล้วออก (REQ-012 + AC-021-04) · 8. a11y พื้นฐาน (int-001)](int-001-entry-shell.md) |

## 9. Sign-off table

คำถามในตาราง: Q1 (ลำดับตรวจ License ก่อนเข้าแอป) · Q2 (ข้อความไทยและ accessibility ของ Entry/Labs) · Q3 (แสดงวันสิ้นสิทธิ์ออฟไลน์และเตือนเมื่อเหลือหนึ่งวัน) · Q4 (บันทึกและขอหยุดหุ่นก่อนล็อกเมื่อหมดสิทธิ์) · Q5 (แสดงตัวเลือก Guest/Login ทุกครั้ง) · Q6 (ปุ่มหน้าต่างมุมขวาบน) · Q13 (หยุดหุ่นล้มเหลวแล้วคงหน้าต่างไว้)

| ส่วน | สถานะ | ผู้อนุมัติ | วันที่ |
|---|---|---|---|
| §1 ภาพรวม Entry + state machine License | **อนุมัติ** (Q1 — ผู้ใช้ตอบในแบบฟอร์มเดียวกับ[มติ 036](../requirement/decisions-036.md) และบันทึกไว้ในหัวข้อ "ผูกกับ" ของมตินั้น) | ผู้ใช้ (ผ่านแบบฟอร์มคำถามของนายช่าง) | 2026-10-24 |
| §2 E1 First-run activate | **อนุมัติ** (Q2, decisions-038) | ผู้ใช้ | 2026-10-24 |
| §3 ตรวจตอนเปิดแอป + หน้าต่างออฟไลน์ 3 วัน + หมดสิทธิ์ระหว่างใช้งาน | **อนุมัติ** (Q3 แสดงตลอด+เตือน 1 วัน, Q4 บันทึก+หยุดหุ่นแล้วล็อก) | ผู้ใช้ | 2026-10-24 |
| §4 E2 Guest/Login + Login states | **อนุมัติ** (Q5 ถามทุกครั้ง) | ผู้ใช้ | 2026-10-24 |
| §5 ตาราง error → คำ copy | **อนุมัติ** (Q2) | ผู้ใช้ | 2026-10-24 |
| §6 Home shell + ปุ่มหน้าต่าง | **อนุมัติ** (Q3, Q6 มุมขวาบน) | ผู้ใช้ | 2026-10-24 |
| §7 Close/Save guard | **อนุมัติ** (Q13 stop ล้ม → หน้าต่างยังเปิด เลือกลองอีก/ยกเลิก) | ผู้ใช้ | 2026-10-24 |
| §8 a11y | **อนุมัติ** (Q2) | ผู้ใช้ | 2026-10-24 |

**สรุป: เอกสารนี้อนุมัติครบทุกส่วน** — front implement UX-001 จากไฟล์นี้ได้ (signed int artifact ตาม [decisions-038 (sign-off UX ครบทั้งสองไฟล์ + spec Q1/Q2/Q4/Q5)](../requirement/decisions-038.md))

## หลักฐาน

- [DES-002 (License และ device binding)](../design/des-002.md):79
