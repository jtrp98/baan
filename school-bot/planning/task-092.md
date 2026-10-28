# ใบงาน092 — rework3 แบบแคบ B gRPC + Gateway logout ตามมติ049

วันที่2026-10-28 · นายช่าง · ผู้ใช้สั่ง "แก้เลย แต่ใช้ agy ก่อน" หลังตอบ[มติ049](../requirement/decisions-049.md) — ถือเป็นคำสั่งเริ่มวงเฉพาะงานนี้ (ไม่ใช่CONTINUE-NORMALทั้งคิว; มติ048ยังคุมงานอื่น)

## ขอบเขต

- B: sys AGY T3 --no-fallback --write cwd target/school-bot — 4กลุ่มrawmetadata/wire (UUID dup+empty, Origin dup, grpc-trace-bin malformed/dup, transport dup) ตาม[check-090-grpc-r2](check-090-grpc-r2-001.md)
- G: sys AGY T3 --no-fallback --write cwd target/sb-api-gateway — SEC001-016 module-ownedchannel/logboundary + rejectunsafeclientก่อนRPC + allowlistlog ตาม[jpo-091-gateway-r2](jpo-091-gateway-r2-001.md)
- คนละrepo จึงขนานได้ (หนึ่งwriterต่อrepo). ใบงานroleอยู่workspace reports/school-bot/normal-092/sys-{grpc,gateway}-r3-task.txt

## Oracle ตรึง (กติกาข้อ12)

- B: normal-089/grpc-r2-extended-independent.ps1 (2234assertions, เป้า12fail→0) + baseline150 + regression4147 · 8wireNOT_RUNไม่อยู่ในเส้นชัย
- G: normal-089/gateway-jpo-r2-extended.ps1 (96assertions, เป้า15fail→0) + baseline5 + base3 + helper433 + standalonecompile
- หลังwriterDONE: parentทวนคำสั่งเอง → check(B)/JPO(B+G)อิสระด้วยscriptเดิม ห้ามเพิ่มเคสไร้ขอบ

## เพดาน

รอบนี้เป็นรอบเดียวที่อนุมัติ ถ้ายังตก หยุดถามผู้ใช้ทันที ไม่เปิดรอบ4 ไม่รับriskแทน

## ข้อค้างจากวงก่อน (ยังไม่สกัด)

- sys AGY T3 run 2026-10-26-15-52-08-sys-tier-t3-1agents-KEDL0W (BE007 Go license pure core) DONE: writerอ้าง `go test ./...` ใน app exit0 — parentยังไม่ทวน/ยังไม่ลงdone-local
- checkGo/checkBackend/checkFrontR1 ของใบงาน091 ยังไม่มีผลบันทึก

## Change Log

- 2026-10-28 — เปิด092 ตามมติ049; ยืนยันไม่มีroleค้างรันก่อนเปิดwriterสองrepo
