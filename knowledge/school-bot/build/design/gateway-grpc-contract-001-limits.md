# Gateway–SchoolBot — deadline, limits และ transport

> Rev 4 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

SchoolBot module ใช้ pipeline/channel ของตัวเอง ไม่อ้าง default retry/deadline ของ global Gateway interceptor เป็นค่าปัจจุบันของโมดูลนี้

| ขอบเขต | ค่าที่ implement |
|---|---|
| HTTP pipeline deadline | 30 วินาทีทุก operation; linked RequestAborted + CancelAfter ส่ง absolute deadline/CancellationToken ใน CallOptions |
| Retry | channel MaxRetryAttempts=0; ไม่ retry mutation อัตโนมัติ |
| Body | control/device 64KiB; project 1MiB; curriculum/question bank 2MiB |
| gRPC | send/receive 4MiB ทั้ง SchoolBot registration และ Gateway module channel |
| Metadata | SchoolBot cap 16KiB รวม overhead 32 bytes/entry; allowlist/duplicate checks |

SchoolBot ใช้ ServerCallContext.CancellationToken ถึงบริการ เมื่อยกเลิกแปลงเป็น DeadlineExceeded หรือ Cancelled ตาม deadline; Gateway deadline→504 และ client abort ไม่เขียน response ใหม่ ไม่อ้าง rollback หาก timeout หลัง commit

ค่าข้างต้นเป็น source configuration ไม่ใช่ deployed SLA หรือ load-test result อ่าน listener/health/trusted transport ที่ [runtime และ deployment](service-runtime-001.md)

## หลักฐาน

SchoolBotHttpPipeline.cs:19,110–113; SchoolBotGrpcCalls.Options; CallDtos SchoolBotEndpoint; SchoolBotGrpcChannel.Create; SchoolBotGrpcRegistration; SchoolBotGrpcMetadata; SchoolBotGrpcRunner ตรวจ SchoolBot35c62bf/Gatewayb4181ca 2026-11-04
