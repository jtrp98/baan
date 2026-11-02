# TP-002 — การเตรียมและวัดผล Clock

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ใช้ร่วมกับ [ชุดข้อมูล Clock](tp-002-fixture-clock-001.md) และ [แผนหลัก](tp-002-fixture-plan-001.md) ทุกผลจริงยัง NOT_RUN

## การเตรียมและกระตุ้นเหตุการณ์

- ระดับ unit สำหรับฟังก์ชันเวลา และ integration แบบ fake ใน PF-HOST สำหรับ admission/restart/timer; ไม่เปลี่ยน system clock
- FX-01a/d: เริ่ม T เป็น synthetic UTC จากการตรวจสำเร็จ; แยก license_exp>T+3d และ license_exp<T+3d; effective exp ตาม TP001-003. reset ทุก variation แล้วเดินเวลา exp−1s/exp/exp+1s; ทดสอบ Guest/Login ทั้ง 3 modes ผ่านหน้าเข้าและ direct bridge
- เปิด host ซ้ำจาก fake credential/anchor store เดิมที่แต่ละจุด; วัด checked_at/exp ก่อนและหลัง, allow/deny, spawn count และข้อความให้ต่ออินเทอร์เน็ต. ขณะ busy ข้าม exp ให้ FX-03a ปล่อย callback/timer หลัง admission ปิด; next movement=0
- FX-01e: cache A และ binding state ของ fake server แยกกัน; record E ก่อนย้ายและหลังย้าย/เปิดซ้ำ; spy ว่า A offline ไม่ได้ online validation สำเร็จใหม่. B ไม่ได้เขียน cache A
- FX-02a–d: fake local store เริ่มงาน live 1 รายการและ trash 1 รายการ; บันทึก UUID/deleted_at/expires_at. ขับ clock ไปก่อน/ตรง/หลัง 30 วันและ restart โดยไม่มี process ระหว่างนั้น; เก็บรายการกู้ได้/ผล restore/purge/ไฟล์คงเหลือ. barrier ให้ restore และ sweep ชนกัน; inject unlink fail เฉพาะรายการ trash
- แยก observation clock ของการรันออกจากค่าเวลาปลอม; E-TRACE บันทึก wall/monotonic/anchor ทุกจุด, restart, operation และจำนวน dispatch; ก่อน/หลังเวลาไม่น่าเชื่อถือเก็บ anchor เพื่อพิสูจน์ว่าไม่ได้ต่ออายุเงียบ
- FX-01b/c และ FX-02 เป็น fixtures สนับสนุนเดิมนอก 6 AC ของ pack; clock 30 วันไม่ใช่อายุ license. ไม่ยก AC-040 หรือ TTL/replay ขึ้นเป็นเส้นชัยใหม่

## คำย่อ

AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · TTL = Time to Live หรืออายุที่ใช้งานได้ · UTC = Coordinated Universal Time
