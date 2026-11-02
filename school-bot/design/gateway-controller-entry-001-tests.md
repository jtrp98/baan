# Gateway SchoolBot entry — controller + module-owned channel — การเชื่อมชุดทดสอบและ assertion

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway SchoolBot entry — controller + module-owned channel](gateway-controller-entry-001.md) อธิบายการเชื่อมชุดทดสอบและ assertion.

## การเชื่อมชุดทดสอบและขอบเขต assertion

- repro: `GrpcChannel.ForAddress` → `SchoolBotSessionGrpcClient.CreateChannel` · generated client → `CreateGeneratedClient(channel)` · TestServer `AddSchoolBotLogoutModule()` + `UseRouting/UseAuthentication/UseAuthorization/MapControllers` แทน `UseSchoolBotLogout`+404
- regression: ไม่ต้องแก้ (อ่าน repro + แทรก `LoggerFactory = logs`) — ต้องชี้ไปที่สำเนา repro ใหม่ถ้า path เปลี่ยน
- extended: เหมือน repro + direct entry `SchoolBotLogoutMiddleware(...).InvokeAsync` → `SchoolBotAuthController(new SchoolBotLogoutService(), peer, client, options){ControllerContext}.Logout(...)`

ตารางเทียบ assertion ระหว่าง entry เดิมกับ controller โดยผู้ตรวจอิสระเป็นผู้ประเมินการยอมรับ:

| assertion | เดิม | ตามแบบใหม่ |
|---|---|---|
| shared-channel-factory-not-mutated | channel ดิบเข้า constructor แล้วต้องไม่ถูก mutate | channel สร้างผ่าน CreateChannel; constructor ไม่ mutate · channel ดิบถูก reject ใน construction-* |
| bound-arbitrary/scope/event3/marker-scope ×3 levels | log ผ่าน `Bound(ch)` | `Bound(ch)` ต้องเป็น sanitizing factory และกรองทุกระดับ |
| construction-standard/warm (+logs-) | ดิบผ่านได้ถ้า LogsClean หรือ rejected | ทุก shape ที่ไม่ผ่าน factory = rejected RPC0 (นิพจน์เดิมรองรับ) |
| middleware-unsafe-generated-fallback-failclosed | middleware ไม่ fallback | controller/service ไม่ fallback ไป generated client ดิบ → 503 RPC0 (ชื่อคงเดิม) |
