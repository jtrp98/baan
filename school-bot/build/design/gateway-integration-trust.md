# Gateway–SchoolBot — trust boundary ปัจจุบัน

> Rev 6 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (ตรวจโค้ดและ Git ปัจจุบัน)

JWT เป็น user credential ที่ Gatewayตรวจแล้ว; metadataที่ Gatewayสร้างเป็น identity input ของ SchoolBot ไม่ใช่หลักฐาน service peer เอง อ่าน [identity rules](gateway-grpc-contract-001-identity.md)

Gateway ProductionSchoolBotTransportValidator คืน IsConfigured=false/IsPeerTrusted=false และ SchoolBotใช้ DenyAllGatewayPeerVerifier จึงยัง fail closed ทั้งสองขา การ override ใน TestServer ใช้เฉพาะ local testsไม่ใช่ production trust implementation

ก่อนเปิดจริงต้องยืนยัน listener/address, TLS/mTLSหรือ trusted transportที่เจ้าของรับรอง, ingress isolation, service identity, configuration owner และ BFF Origin/CSRF อย่า forward client authority headers/cookiesหรือรับ upstream URLจากผู้เรียก Private introspection/session flowรุ่นก่อนยังไม่อยู่ใน current RPC contract ต้อง reconcileก่อนเปิด

## หลักฐาน

Gateway SchoolBotRegistration.cs, ProductionSchoolBotTransportValidator.cs, SchoolBotRequestPreparation.cs; SchoolBot SchoolBotGrpcRegistration.cs, SchoolBotGrpcRunner.cs; [runtime](service-runtime-001.md) และ [หลักฐาน/gates](gateway-integration-evidence.md) ตรวจ2026-11-04
