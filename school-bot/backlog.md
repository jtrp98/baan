# SchoolBot — Backlog

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

## กติกา

เพิ่ม BL-NNN แบบ append-only พร้อมวันที่ ที่มา ความสำคัญ ผลกระทบต่อ AC (เกณฑ์ตรวจรับ) และผู้เสนอ ห้ามเปลี่ยนความหมายของรายการเดิมหรือเปลี่ยนเลข ID ข้อค้นพบที่ไม่บล็อก AC เก็บที่นี่ ไม่เปิดงานหรือเพิ่มขอบเขตเผยแพร่เอง การย้ายเข้าแผนเมื่อกระทบขอบเขตต้องเป็นคำสั่งผู้ใช้

## สรุปสถานะวันนี้

| ID | เรื่อง | ที่มา | ลำดับ | สถานะวันนี้ |
|---|---|---|---|---|
| [BL-001](backlog-documentation.md#bl-001) | คำอธิบายและยอด constraints | vault: V012-09 (ข้อแนะนำด้านเอกสาร) | advisory | ติดตามตรวจยอดก่อน implementation ไม่บล็อก AC จากตัวเลขเพียงอย่างเดียว |
| [BL-002](backlog-security.md#bl-002) | tenant/key และ active ใน HTTP API Gateway (`sb-api-gateway`) | arch: auth/security review | รอเจ้าของ security triage | นอก scope; SchoolBot ต้องกรอง SchoolId/fail-closed และรอ runtime proof |
| [BL-003](backlog-security.md#bl-003) | SchoolId ของตารางเชื่อมชั้นเรียนใน `sb-tech-upgrade-academic` | arch: auth/security review | รอเจ้าของ security triage | นอก scope; SchoolBot ต้องกรองทุก join และรอ runtime proof |
| [BL-004](backlog-legacy.md#bl-004) | IsAdmin และช่องโหว่ legacy `sb-web-academic-dev-1` | sys/arch: legacy auth/security review | รอเจ้าของ security triage | แหล่ง is_admin ตอบแล้วตามมติ 035; ข้อค้นพบ legacy และ technical proof ยังค้าง |
| [BL-005](backlog-documentation.md#bl-005) | ทดสอบ logout และปรับเอกสาร Gateway เป็น controller | งาน logout/ทบทวน Gateway | ไม่ระบุในต้นฉบับ | ปิดแล้ว 2026-10-28; test actual ยัง NOT_RUN |
| [BL-006](backlog-persistence.md#bl-006) | ความคงทนและ concurrency ของ Project/License/Session | check: ตรวจงาน [BE-002](plan/index-foundation.md) (เชื่อมฐานข้อมูล) | ไม่ระบุในต้นฉบับ | ข้อ 2/3/5 รอก่อนต่อ DB จริง/production; ข้อ 4 ส่ง arch ตอนแก้ ETag ครั้งถัดไป |

รายละเอียดแบ่งตามหัวข้อในลิงก์ตาราง ทุก ID คงเดิม ไม่มีการเพิ่มรายการในการเรียบเรียงนี้ ประเด็น [DES-007 (Release และ trusted update)](design/des-007.md)/[BE-019](plan/index-delivery.md) (ตรวจอัปเดตและ Prepare/Install) เป็นเงื่อนไข coverage ของ [SA-001](plan/index-foundation.md) (ทบทวนสัญญาระบบ) และ G-RELEASE-DB (อนุมัติฐานเผยแพร่) จึงติดตามใน [แผน](plan/index.md) ส่วนคำตอบจากคนติดตาม Waiting on Human ไม่สร้าง backlog ซ้ำ

## หลักฐาน

รายละเอียดที่มาของแต่ละข้ออยู่ท้ายไฟล์ย่อย ข้อความเดิมว่าไม่มี BL เป็นข้อความเมื่อรับแผนครั้งแรก ถูกแทนด้วยทะเบียนหกข้อข้างต้น
