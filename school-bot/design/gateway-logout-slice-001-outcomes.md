# Gateway logout — local gRPC slice — Replies/errors

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway logout — local gRPC slice](gateway-logout-slice-001.md) ส่วนนี้อธิบายReplies/errors อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

## เอกสารอ้างอิง

[BL-005 (ข้อ 2: ผูกเอกสาร logout กับ controller as-built)](gateway-controller-entry-001.md)

หลักฐาน sb-api-gateway/src/ApiGateway.API/SchoolBot/: SchoolBotAuthController.cs:8–58; SchoolBotLogoutRegistration.cs:97–163; SchoolBotSessionGrpcClient.cs:17–102. ข้อความ “สถานะเริ่มต้นก่อนตรวจเป็นยังไม่ได้รัน ผลภายหลังอยู่ในหลักฐาน integration” เป็นประวัติเริ่มต้นของ packet; ผลตรวจภายหลังอ้าง JPO092 (memory: planning/jpo-092-logout-r4-001.md) และสถานะใน [index](index.md).

รหัสอ้างอิงที่ปรากฏในบันทึกเดิม: BL-005.
