# int-005-mapping — UX ราย feature: GradeSlot mapping / Preview ยืนยัน / คะแนนชน / Export status (Task UX-006)

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

> ฐานอ้างอิง: [REQ-049 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../requirement/req-049.md) · [REQ-050 (Preview และยืนยันส่งคะแนนกิจกรรม)](../requirement/req-050.md) · [REQ-051 (คะแนนชนและการคุ้มครองคะแนนครู)](../requirement/req-051.md) · [REQ-052 (สิทธิ์ การส่งซ้ำ และ audit คะแนน)](../requirement/req-052.md) · pack-guest-001 (G8 (หนึ่งกิจกรรมส่งหลายช่องได้ แต่หนึ่งช่องรับกิจกรรมเดียว)) · [DES-008 (Mapping หลักสูตรกับช่องคะแนน SchoolBright)](../design/des-008.md) Rev5 · [DES-009 (Preview ยืนยัน และส่งคะแนนกลับ SchoolBright)](../design/des-009.md) Rev4 · grade-rules-032-034 Rev1 · [มติ 020 (หลักสูตรแบบ Level, quiz/test และการส่งคะแนนกลับ SchoolBright)](../requirement/decisions-020.md), [มติ 021 (การส่งคะแนนเข้าระบบเกรด SchoolBright)](../requirement/decisions-021.md), [มติ 022 (ที่อยู่ของหน้าจอ Admin / ครู / Desktop)](../requirement/decisions-022.md), [มติ 023 ( writer คะแนน, ปัดเศษ, นำเข้า Sheet และเจ้าของ mapping)](../requirement/decisions-023.md), [มติ 025 ( auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../requirement/decisions-025.md), [มติ 027 (ที่ตั้งฐานข้อมูล SchoolBot)](../requirement/decisions-027.md)–034
> หลักการสำคัญ: หน้าทั้งหมดเป็น **เว็บ (เว็บโรงเรียน = sb-tech-upgrade-web-system · Next.js โฟลเดอร์ school-bot · เรียกผ่าน Backend for Frontend (BFF — ตัวกลางฝั่งเว็บ) `/api/school-bot/*` ด้วย session channel `school_web`)** ไม่ใช่ Desktop ([BR-049-05 (หน้า mapping/ส่งคะแนนอยู่ sb-tech-upgrade-web-system เรียก SchoolBot API)](../requirement/req-049.md), มติ 021, มติ 022) · ผู้ใช้สองกลุ่ม: **admin โรงเรียน** (จัด mapping) และ **ครูรายวิชา** (preview/ยืนยัน/แก้ชน) · accessibility (a11y — การเข้าถึงสำหรับผู้ใช้ทุกกลุ่ม) ใช้กติกากลางที่อนุมัติแล้วของ int-001/int-002 ต่อโดยไม่เปิดใหม่

## เนื้อหาแยกตามงาน

เลขหัวข้อ § เดิมคงไว้ให้เทียบขอบเขตในตาราง Sign-off

| หัวข้อและเนื้อหา |
|---|
| [1. ภาพรวมหน้าและสิทธิ์ (ข้อเสนอ) · 2. หน้าจัด mapping (admin โรงเรียน) — DES-008 · REQ-049 · 2.1 โครงหน้า (ข้อเสนอ — Q30 (หน้า mapping รายช่องคะแนน))](int-005-mapping-permissions.md) |
| [2.2 ขั้นที่ 1 — ถือครองช่องเดิม (GradeSlot ownership)](int-005-mapping-ownership.md) |
| [2.3 ขั้นที่ 2 — ผูกกิจกรรมเข้าช่อง (ScoreMapping) — G8 · 2.4 การตรวจชน (validation)](int-005-mapping-sources-validation.md) |
| [2.5 ล็อกหลังส่ง + ใช้ชุดใหม่เมื่อเปลี่ยน (G8) · 2.6 Error ทั่วไปของหน้า mapping → คำ copy (ข้อเสนอ — ต่อรูปแบบ int-001 §5 ที่อนุมัติแล้ว)](int-005-mapping-lock-errors.md) |
| [3. หน้าส่งคะแนน (ครูรายวิชา): พรีวิว → ยืนยัน → แก้ชน → สถานะส่ง — DES-009 · REQ-050, REQ-051, REQ-052 · 3.1 เริ่มพรีวิว · 3.2 ตารางพรีวิว: นักเรียน × ช่องคะแนน](int-005-mapping-preview.md) |
| [3.3 ข้าม (missing) vs จริง 0 vs ผลพิเศษ](int-005-mapping-missing.md) |
| [3.4 ยืนยันส่ง (confirm) — receipt / idempotent](int-005-mapping-confirm.md) |
| [3.5 คะแนนชน (conflict) → แก้ชน (resolve) — พรีวิวใหม่ / CAS / owned-only · 3.6 สถานะการส่ง (export status) + outbox](int-005-mapping-conflict-status.md) |
| [4. Audit trail — มุมมองครู/admin · 5. a11y ของ int-005 (ต่อมาตรฐานที่อนุมัติแล้วของ int-001/int-002)](int-005-mapping-audit.md) |

## 6. Sign-off table — อนุมัติครบทุกส่วน (Q30–Q38 · มติ 041)

คำถามในตาราง: Q30 (หน้า mapping รายช่องคะแนน) · Q32 (ล็อก mapping หลังส่งและใช้ช่องใหม่) · Q33 (รูปแบบคะแนนพรีวิวและการปัด) · Q37 (ติดตามผลส่งทุกห้าวินาทีและส่งต่อส่วนค้าง) · Q38 (ขอบเขตประวัติครูและ admin)

| ส่วน | สถานะ | ผู้อนุมัติ | วันที่ |
|---|---|---|---|
| §1 ภาพรวมหน้า/สิทธิ์ | **อนุมัติ** (Q30) | ผู้ใช้ (แบบฟอร์มคำถาม) | 2026-10-24 |
| §2 หน้าจัด mapping admin | **อนุมัติ** (Q30–Q32) | ผู้ใช้ | 2026-10-24 |
| §3 หน้าส่งคะแนนครู | **อนุมัติ** (Q33–Q37) | ผู้ใช้ | 2026-10-24 |
| §4 audit trail ครู/admin | **อนุมัติ** (Q38) | ผู้ใช้ | 2026-10-24 |
| §5 a11y | **อนุมัติ** (ตามมาตรฐานที่เซ็นแล้วของ int-001/002) | ผู้ใช้ | 2026-10-24 |

**สรุป: เอกสารนี้อนุมัติครบทุกส่วน** — front/web-system implement UX-006 จากไฟล์นี้ได้ (signed int artifact ตาม มติ 041)
