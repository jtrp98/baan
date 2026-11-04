# Gateway integration — สถาปัตยกรรมปัจจุบัน

> Rev 6 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

Desktop/Web → HTTP API Gateway → gRPC SchoolBot เป็น topology เป้าหมาย เว็บต้องผ่าน same-origin Backend for Frontend (BFF) แต่ยังไม่มีหลักฐานว่า BFF และ Desktop เชื่อม flow ใหม่นี้ครบแล้ว ไม่มี direct public SchoolBot fallback ที่รับรองให้ใช้งานจริง

## เส้นทางที่มี implementation

Gateway มีห้า controllers ใน `src/ApiGateway.API/Controllers/ServiceSchoolBot`: Projects, Licenses, Curricula, Assessments และ Releases เรียก SchoolBotHttpPipeline → repository interfaces → typed generated gRPC clients → SchoolBot GrpcServices → application services → repositories

Public prefix คือ `/api/school-bot/service` ไม่มี `/v2` ใช้ Gateway JWT สำหรับ resource ที่ต้องมีตัวตน ไม่ใช้ SchoolBotOpaque/session/logout contract รุ่นก่อน อ่าน [RPC และ routes](gateway-grpc-contract-001.md), [identity](gateway-grpc-contract-001-identity.md) และ [controller registration](gateway-controller-entry-001.md)

SchoolBot `Program` ลงทะเบียนและ map gRPC ทั้งห้าบริการแล้ว มีเพียง HTTP `/healthz`; HTTP business routes เดิมถูกถอดออก Session storage ยังเก็บเพื่อ snapshot compatibility ไม่ได้แปลว่ามี session RPC หรือ private web-principal endpoint ปัจจุบัน

## สิ่งที่ยังไม่เชื่อมจริง

Gateway `Program` มี MapControllers แต่ยังไม่เรียก AddSchoolBotModule/AddSchoolBotGrpcClients; SchoolBotSliceGate ต้องพบ module marker และปฏิเสธ Production จึงยังไม่เปิด service-route ใน host ปกติ ตัวตรวจ trusted transport ของทั้งสองฝั่งยัง fail closed ตาม H5 (listener/TLS/peer/private ingress) และ G-AUTH (ยืนยันตัวตนครบเส้นทาง) ต้องมี owner configuration และหลักฐานก่อนเปิด ไม่เปลี่ยน gate หรือสถานะแผนจากการ commit

Desktop ยังใช้ URL/path เก่าและไม่มี Gateway JWT integration; BFF cookie/CSRF, admin BFF และ production authority/roster ยังไม่มีหลักฐานครบ ดู [compatibility](gateway-grpc-contract-001-login.md), [deployment](service-runtime-001.md) และ [ผลตรวจ](gateway-integration-evidence.md)

## หลักฐาน

ตรวจ source/Git 2026-11-04: SchoolBot HEAD `35c62bf`; Gateway HEAD `b4181ca` บน `dev/golf/school-bot`; Gateway SchoolBotRegistration.cs และ Program.cs, SchoolBot API Program.cs/SchoolBotGrpcRegistration.cs; handoff-005 และใบงาน100–105 (memory) ผลอ่านครั้งนี้ไม่ใช่ runtime test ใหม่
