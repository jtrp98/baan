# Setup ร่วมสำหรับตรวจ License บน stub

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 096 — setup ของ BE-003 และ BE-004)

เอกสารนี้เป็นส่วนบังคับของเงื่อนไขก่อนตรวจ TP001-005–009 และ TP001-083 สำหรับ BE-003 (Admin License) และ BE-004 (activate/validate และ signed lease) ใช้ [DES-002 — License/device binding Rev4](../design/des-002.md), [หน่วย commit Rev4](../design/des-002-entitlement.md), [setup race Rev4](../design/des-002-recovery.md) และ [กฎ transaction Rev12](../design/data-contract-rules-transactions.md) ไม่เพิ่ม AC (Acceptance Criteria: เกณฑ์ตรวจรับ)

## S-LIC — topology และ actor

รันแยกสอง backend ใน **หนึ่ง process บนหนึ่ง host** ทุก case: memory ใช้ adapter สอง instance และ service สอง instance ต่อ memory store object เดียว; file ใช้ adapter/service สอง instance ต่อ FileSchoolBotBackingStore **สอง object ชี้ canonical directory เดียวกัน** ให้ทั้งสอง adapter โหลด cache ก่อนเริ่ม race แต่ละรอบใช้ store/directory สะอาดและ seed ก่อนเริ่มคำขอเท่านั้น

กำหนด License ของโรงเรียน S1; device A/B ใช้ P-256 คนละ key ขอ challenge และลง proof จริง ไม่ใช้ user Login แทน device proof ผู้ดูแล P1 มี session Channel=staff_admin และ role license_admin active ของ scope ที่อนุญาต fixture ลบ/ผิดสิทธิ์ต้องแยกจาก P1 ใช้ fake server UTC clock และ signer ทดสอบที่ verifier ตรวจ signature ได้ ไม่ใช้ secret จริง

## S-OBS — การจัดลำดับและอ่านผล

Proxy/barrier พักหลัง service อ่าน state/ตรวจ proof แล้ว **ก่อนเข้า store lock** ที่ขอบ service→commit/adapter; เลื่อน scheduling เท่านั้น ไม่แก้ record/request ไม่ปลอมผล ห้ามถือ lock รออีก writer บันทึก snapshot ก่อนเริ่มและหลังแต่ละ commit แล้วอ่านผ่าน adapter/service instance ที่สามซึ่งไม่ใช้ cache ของสอง writer; file ใช้ store object ใหม่เปิด directory เดิมด้วย

ทุก assertion ตรวจ response และ authoritative state: License ทุก field, Binding ทุกแถว, จำนวน live (`DetachedAt=null AND IsDelete=false`), CurrentBindingId, BindingEpoch, DetachedAt, lease, audit และ idempotency เทียบก่อน/หลัง การปฏิเสธไม่เปลี่ยน domain/success audit/success result ไม่ถือ challenge nonce consumption เป็น domain mutation ไม่ตัดสินผ่านจาก timeout

Success ต้องมี audit/result ของ operation ในหน่วยเดียวตาม DES-002; validate ไม่เพิ่ม idempotency header ใหม่ ถ้า surface มี idempotency จึงตรวจ result นั้น Replay ไม่สร้าง domain/success audit ซ้ำ ไม่เลื่อน lease/ReplayUntil เก็บหลักฐาน sanitized response, signature claims และ state diff; ห้ามเก็บ key เต็มหรือ ciphertext ในรายงาน

## S-GATE — สิ่งที่พิสูจน์ได้และสิ่งที่ยังรอ

ทุก case ระบุส่วน stub ซึ่งตรวจ service/store ภายในหนึ่ง process ได้ ผลนี้ไม่ปิด integration ผ่าน Gateway หรือ PostgreSQL และไม่รับรองหลาย process/host ให้ QA-001 (ตรวจ DB/License/Login) รัน response/state ชุดเดิมผ่าน transport ที่มีสัญญาพร้อม

ส่วน PostgreSQL รอ DBA-003 (ตรวจ core หลังมนุษย์รัน SQL) ภายใต้ G-CORE: ใช้สอง process/host คนละ service/adapter/connection ต่อ **PostgreSQL 15.19 ฐานเดียวกัน** และ instance ที่สามอ่าน committed state; ควบคุมลำดับก่อน transaction lock เช่นเดิม ตรวจ lock/CAS, rollback, restart และ physical constraint จากฐานจริง ไม่ใช้ file directory ร่วมแทน distributed DB lock การรัน SQL/เชื่อม DB จริงต้องผ่านประตูเดิมโดยคน ไม่มีการยอมรับความเสี่ยงหรือปิดประตูจากผล stub

## หลักฐาน

- AC ต้นฉบับ: reports/school-bot/normal-096/ac-verbatim.txt หัวข้อ BE-003/BE-004
- Finding ที่กำหนด regression: reports/school-bot/normal-095/snapshot-rw1/check/round-095-rw1-findings.md หัวข้อ validate ค้างย้อน unbind; ไม่ใช่ผลรันปัจจุบัน
- TP001-083 ต่อจาก TP001-082 ใน tp-001.md ที่อ่านในใบงานนี้; ตารางหลักอยู่นอกสิทธิ์แก้ของใบงาน