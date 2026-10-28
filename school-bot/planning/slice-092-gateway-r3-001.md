# Gateway typed logout rework3 — writer receipt (ยังตก oracle)

วันที่2026-10-28 · sys AGY T3 (gemini-3.8-flash-medium) run 2026-10-28-04-55-20-sys-tier-t3-1agents-DOsn1C DONE · นายช่างสกัด/ทวนstatic · ตาม[มติ049](../requirement/decisions-049.md)

## ผลตาม oracle ตรึง

- gateway-jpo-r2-extended.ps1 **ไม่แก้script** (mtime 2026-10-26 22:28 ไม่มี CreateSanitizingLoggerFactory): writerรายงาน **95pass/1fail/96 exit1** — ตกข้อ `shared-channel-factory-not-mutated`
- 14/15 ข้อเดิมผ่านตามwriter: bound-arbitrary/scope/marker-scope ×Debug/Information/Error, construction-hidden/callerlogger (+logs-) rejected RPC0, middleware-unsafe-generated-fallback-failclosed HTTP503/RPC0
- baseline 5/5, base3 3/3, helper433 433/0, standalonecompile exit0 (ตามwriter)
- writerเสนอ seam diff ใน harness บรรทัด147 ให้ channel ใช้ `SchoolBotSessionGrpcClient.CreateSanitizingLoggerFactory(logs)` แล้วได้96/0 — **ไม่นับเป็นผ่าน**: เปลี่ยนเงื่อนไขของ assertion ที่ตกโดยตรง

## หลักฐาน static ของผู้คุม

[SchoolBotSessionGrpcClient.cs](../../../target/sb-api-gateway/src/ApiGateway.API/SchoolBot/SchoolBotSessionGrpcClient.cs) บรรทัด112–119 ยังใช้reflection อ่าน `<LoggerFactory>k__BackingField` ของchannelที่callerส่งมาแล้ว `SetValue` เป็น SchoolBotSanitizingLoggerFactory — ขัดมติ049ข้อ1 (ห้ามreflection/private-field mutation/แตะshared channel). ไฟล์ยังพึ่งreflectionหาcallInvoker/interceptor/channelหลายจุด (บรรทัด38–103)

Hash หลังแก้: Client **BB7CCF53D2C80AEDED35D4B6F130474AD30FE671B45530CC9C0BE83D3494E239** · Middleware **0827304971DBD88188C40D85F1CE9C0CC53F9CF401EC6FE53A1F1717158842D6** · TrailerValidator/Registration/Options/Preparation/interfaces คงเดิม

## ข้อจำกัด

Parentรัน extended script ซ้ำไม่ได้ในsessionนี้ (คำสั่ง powershell -ExecutionPolicy Bypass ถูกpermission classifierปฏิเสธ) — ตัวเลข95/1เป็นของwriterยังไม่ทวน. FullsolutionSecurity0.5.1/TLS/H5/production NOT_RUN. SEC001-016 คง **OPEN**. ยังไม่ส่งJPO.

## สถานะ

ครบรอบเดียวที่มติ049อนุมัติแล้วยังตก oracle → หยุดถามผู้ใช้ทันทีตามกติกาข้อ12 ไม่เปิดรอบ4เอง

## Change Log

- 2026-10-28 — รับwriter DOsn1C; oracleเดิม95/1, reflection mutation ยังอยู่; รอคำตัดสินผู้ใช้
