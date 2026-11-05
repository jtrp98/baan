# TP-001 — บัญชีและพื้นที่ Guest (TP001-025–TP001-026)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-025"></a>

## TP001-025 — คนที่ 2 เปิดงานคนแรก

AC: [AC-040-01 (ผู้ใช้สองคนใช้ Guest ใน OS account เดียวกัน…)](../../modules/my-work/shared/requirements/req-040.md), [AC-040-02 (จบใช้งานและเปิดใหม่ รวมเมื่อผ่าน 30 วัน งานที่ไม่เคยสั่งลบยังเปิดได้)](../../modules/my-work/shared/requirements/req-040.md), [AC-040-03 (ส่งออกงานแต่ละโหมดแล้วได้ไฟล์ที่เปิดกลับได้เนื้อหาเดิม และต้นฉบับ Guest…)](../../modules/my-work/shared/requirements/req-040.md) · References: [มติ 014 (มติ Guest พื้นที่ร่วม การนำงานและประวัติเข้าบัญชี)](../../shared/decisions/decisions-014.md), [มติ 015 (มติถังขยะ Guest ผู้ร่างหลักสูตร และขอบเขตครู)](../../shared/decisions/decisions-015.md), BR-040 · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: Guest 2 คนใน OS account เดียว; งานสามโหมด; fake clock +31 วัน; export ไฟล์

ขั้นตอน: คนที่ 2 เปิดงานคนแรก; ปิด/เปิดแอปและข้าม 30 วัน; export ทุกโหมดแล้วเปิดกลับ

ผลที่คาด: เปิดได้ทุกโหมดไม่ขอ PIN; งานที่ไม่สั่งลบยังเปิดได้แม้ผ่าน 30 วัน; ไฟล์ export เปิดกลับเนื้อหาเดิม ต้นฉบับ Guest อยู่ ไฟล์ `.schoolbot-project.json` media type `application/json` UTF-8 ไม่มี archive; ทั้งไฟล์ ≤1 MiB; เนื้อหา LocalProjectDocument schema=2 (UUID/mode/name/local_revision/updated_at/content) ไม่มี License/session/device key/acceptance/uploaded truth/Cloud owner/ประวัติเรียน; atomic write ผ่าน save dialog ของ host; cancel→`EXPORT_CANCELLED`; I/O fail→`STORE_UNAVAILABLE`; เกิน→`PROJECT_TOO_LARGE`; เปิดกลับตรวจ JSON/schema/ขนาด/Code UTF-16 bound ก่อนเขียน ไม่รัน source/คำสั่งหุ่น; UUID ใหม่→นำเข้า mode/content เดิม; UUID ซ้ำ+เนื้อหาเท่ากัน→เปิดงานเดิม; ต่าง→`PROJECT_EXISTS` ให้ผู้ใช้เลือกสำเนา UUID ใหม่ ไม่ทับเงียบ; งาน trash ต้อง restore ตามอายุ ไม่ใช้ export/import ต่ออายุรายการเดิม; ต้นฉบับไม่ถูกแก้

หลักฐานที่ต้องเก็บ: E-TRACE+ไฟล์ hash

ผลจริง: NOT_RUN

<a id="tp001-026"></a>

## TP001-026 — ลบ

AC: [AC-040-04 (สั่งลบงานแล้วงานออกจากรายการปกติและอยู่ในถังขยะ ไม่แสดงว่าลบถาวรแล้ว)](../../modules/my-work/shared/requirements/req-040.md), [AC-040-05 (กู้คืนงานก่อนครบ 30 วันนับจากสั่งลบ แล้วเปิดได้โหมด/เนื้อหาเดิม)](../../modules/my-work/shared/requirements/req-040.md), [AC-040-06 (เปิดระบบโดยมีงานในถังขยะครบ 30 วันแล้ว…)](../../modules/my-work/shared/requirements/req-040.md) · References: decisions-015, [BR-040-03 (งานที่สั่งลบเข้าถังขยะ กู้คืนได้ 30 วัน แล้วลบถาวรอัตโนมัติ…)](../../modules/my-work/shared/requirements/req-040.md), [BR-040-04 (ต้องมี License ตาม REQ-034)](../../modules/my-work/shared/requirements/req-040.md) · Level: integration · Profiles: PF-HOST

เงื่อนไขก่อนตรวจ: งานลบที่ T; งานปกติ; fake clock ที่ T+29d23h59m, T+30d, clock ย้อน, แอปปิดช่วงนั้น

ขั้นตอน: ลบ; กู้คืน; เปิดแอปที่แต่ละเวลา

ผลที่คาด: ลบ→อยู่ถังขยะ ไม่บอกลบถาวร; กู้ก่อน 30 วัน เปิดโหมด/เนื้อหาเดิม; ครบ 30 วัน→ลบถาวรตอนเปิดระบบ กู้ไม่ได้ งานปกติอยู่ ลบ→trashed durable ก่อนตอบ `{project_id,deleted:true,deleted_at,expires_at}`; `expires_at=deleted_at+2592000s` absolute ไม่เลื่อนเมื่อเปิด/ปิดแอป; list trash เฉพาะยังไม่หมดอายุ; restore ก่อน expires_at คืน UUID เดิม+counter ถัดไป; active UUID ชน→`PROJECT_EXISTS`; `now>=expires_at`→`TRASH_EXPIRED` กู้ไม่ได้แม้ unlink ยังไม่สำเร็จ; เปิดแอป/resume sweep ก่อน list/restore/export เสมอ ขณะเปิด timer ทุก 60 วินาที ****; ขณะปิดไม่มี background service เวลานับจาก absolute expires_at และลบตอนเปิดครั้งถัดไปตาม AC-040-06; clock ใช้ anchor [DES-002 (License และ device binding)](../design/des-002.md) (server UTC ล่าสุด/wall/max effective; monotonic ขณะเปิด; high-water ไม่ลด); rollback ตรวจตอน start/resume ก่อนเลื่อน anchor; เวลาไม่น่าเชื่อถือ→`CLOCK_UNTRUSTED` หยุด restore และ irreversible purge จน online ยืนยันเวลาใหม่ ไม่ตั้ง deleted_at ใหม่/เพิ่มอายุ; ปิดเครื่องด้วยนาฬิกาปกติยังนับช่วงปิดด้วย wall clock; sweep ลบเฉพาะไฟล์ trash+cache/thumbnail ของ project นั้น ไม่ลบงานปกติ/Cloud copy/import tombstone/ประวัติอิสระ; ลบไม่สำเร็จ→`STORE_UNAVAILABLE` และ retry ไม่แสดงรายการว่ากู้ได้; ย้อนทั้งดิสก์/OS store ยังเป็นข้อจำกัด DES-002 ตามสัญญา

หลักฐานที่ต้องเก็บ: E-TRACE+ไฟล์ list

ผลจริง: NOT_RUN


## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · REQ = Requirement หรือข้อกำหนด · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · UTC = Coordinated Universal Time · OS = Operating System


## ยังไม่ยืนยัน

timer sweep 60 วินาทีขณะแอปเปิดยังเป็นสมมติฐาน ต้องให้ arch/เจ้าของสัญญายืนยัน cadence ก่อน runtime โดยอายุ absolute 30 วันและ sweep ก่อน operation คงเดิม
