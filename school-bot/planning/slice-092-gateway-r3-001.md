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

## รอบเล็กตาม Amendment มติ049 (2026-10-28)

sys AGY T3 run 2026-10-28-06-00-32-sys-tier-t3-1agents-NPsFMa: **ไม่มี handoff** (stdout มีแต่ "กำลังรอผล…", stderr "root agent idle; waiting for 1 background task") แต่แก้ source แล้ว:

- Client **4A0CDA1471FAFB337406C05290B75981F242C3003FD68D829F1D5E6434EF5A53** — ถอด `SetValue` แล้ว · อ่าน LoggerFactory ของ channel ผ่าน reflection (GetValue) แล้ว throw "Channel LoggerFactory cannot be verified." / "Channel must be configured with SchoolBotSanitizingLoggerFactory." · Middleware 082730…42D6 ไม่เปลี่ยน
- ไฟล์ normal-092/gateway-jpo-r3-seam.ps1 ที่ writer สร้าง = สำเนาตรงต้นฉบับทุกบรรทัด (ไม่มี seam จริง)

Parent รันเองด้วย pwsh 7 (log normal-092/gateway-r3b-parent-*.log):

| ชุด | ผล |
|---|---|
| standalone compile | exit0 |
| independent-helper-check | 433/0 exit0 |
| gateway-independent-repro (base3) | **crash exit1** — "Channel must be configured with SchoolBotSanitizingLoggerFactory." |
| gateway-jpo-regression (baseline5) | **crash exit1** — ข้อความเดียวกัน |
| gateway-jpo-r2-extended (96) | **crash exit1** — ข้อความเดียวกัน |

สาเหตุ: harness ตรึงทุกชุดสร้าง client จาก GrpcChannel ที่ LoggerFactory ดิบ · โค้ดใหม่ reject ตามที่มติสั่ง → ไม่มี assertion ไหนได้รัน · oracle ขัดกับแบบที่อนุมัติ ต้องให้เจ้าของแบบ (arch) กำหนด construction seam ใหม่ ไม่ใช่ writer/ผู้คุม · พร้อมกันผู้ใช้สั่ง[มติ050](../requirement/decisions-050.md) ให้ G ใช้ controller ตาม convention เดิม ซึ่งเปลี่ยนจุดเข้าของ slice นี้

ครบรอบที่อนุมัติแล้ว → หยุดถามผู้ใช้ · SEC001-016 คง OPEN · production off

## Change Log

- 2026-10-28 — รับwriter DOsn1C; oracleเดิม95/1, reflection mutation ยังอยู่; รอคำตัดสินผู้ใช้
- 2026-10-28 — รอบเล็ก NPsFMa: ถอด mutation แล้ว แต่ harness ตรึงทุกชุด crash ที่ construction; compile/helper433 ผ่าน
