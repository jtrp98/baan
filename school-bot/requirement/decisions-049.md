# มติที่ 049 — อนุมัติแก้รอบ 3 แบบแคบ B gRPC logout และ Gateway typed logout

วันที่ 2026-10-28 · ผู้ตอบ: ผู้ใช้ในแชต · ผู้บันทึก: นายช่าง

ผู้ใช้เลือก "แก้รอบ 3 แบบแคบ" ทั้งสองเรื่องที่ติดเพดาน rework ตาม [waiting-090-001](../planning/waiting-090-001.md) (เดิมพักไว้ท้ายวงตั้งแต่ 2026-10-26)

## 1. B typed gRPC logout (SchoolBot)

- ที่มา: [check-090-grpc-r2-001](../planning/check-090-grpc-r2-001.md) final rework2 = 2222 pass / 12 fail / 8 wire NOT_RUN (parent ยืนยันซ้ำ)
- ขอบเขตแก้: เฉพาะ raw metadata/wire boundary — UUID duplicate+empty, Origin duplicate, malformed/duplicate `grpc-trace-bin`, transport header duplicate → ตอบ Internal/INTERNAL_ERROR ตามแบบ arch (store0/quota0 และอ่าน raw ก่อน Origin policy)
- เส้นชัย (oracle ตรึง): script extended เดิม 2234 assertions + baseline 150 + regression 4147 ที่ source binding ใหม่ · แล้ว check อิสระ + JPO ซ้ำ
- 8 wire NOT_RUN ที่ไม่มี wire fixture ไม่เลื่อนเส้นชัยของรอบนี้ (กติกาข้อ 12)

## 2. Gateway typed logout (G)

- ที่มา: [jpo-091-gateway-r2-001](../planning/jpo-091-gateway-r2-001.md) = 81 pass / 15 fail / 96 assertions · SEC001-016 Important (log leak) OPEN
- ขอบเขตแก้: module-owned channel/log boundary ผ่าน public configuration API ก่อนสร้าง client · reject prebuilt/unproven client-invoker ก่อน RPC · log เฉพาะ status/method/requestID ที่ sanitize แล้ว · ห้าม raw state/scope/exception, marker regex, private-field mutation และการแก้ shared channel LoggerFactory ของ caller อื่น
- เส้นชัย (oracle ตรึง): JPO extended script เดิม 96 assertions + baseline 5/5 · แล้ว JPO ซ้ำ

## ขอบเขตมติ

- อนุมัติแก้เพิ่ม **หนึ่งรอบ** ต่อเรื่องเท่านั้น — ถ้ายังตก กลับมาถามผู้ใช้ ไม่เปิดรอบ 4 เอง
- ไม่ใช่ risk acceptance ไม่ปิด security/runtime gates ไม่อนุญาต production/deploy/SQL จริง/Git mutation เพิ่ม
- คำอนุญาต dev Gateway และ replay 900 ตาม [046](decisions-046.md), การพัก signer ตาม [047](decisions-047.md) คงเดิม
- มติ [048](decisions-048.md) (หยุดหลังปิดงานรอบ 088) ไม่เปลี่ยนด้วยมตินี้ — การเปิด role แก้จริงรอคำสั่งเริ่มวงจากผู้ใช้

## Change Log

- 2026-10-28 — ผู้ใช้ตอบในแชต: แก้รอบ 3 แบบแคบทั้ง B gRPC และ Gateway
