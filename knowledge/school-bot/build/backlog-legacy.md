# SchoolBot — Backlog ระบบเว็บเดิม

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [ทะเบียน backlog](backlog.md) H5 คือเงื่อนไข route/env/network/trust

<a id="bl-004"></a>

### BL-004 — ความต่างของ `IsAdmin` ระหว่าง session กับ JWT handoff และช่องโหว่ใน legacy `sb-web-academic-dev-1` นอกขอบเขต SchoolBot

- วันที่: 2026-10-23
- ที่มา: รายงานที่ระบุท้ายไฟล์ (TR-AUTH-02/03/06) และ รายงานที่ระบุท้ายไฟล์; ผู้เสนอ: sys/arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity หรือรับความเสี่ยงแทน jpo/เจ้าของระบบ; ไม่เพิ่ม scope/task ใน SchoolBot)
- เจ้าของระบบ/ผู้รับ: เจ้าของระบบเว็บเดิม `sb-web-academic-dev-1` ร่วมกับเจ้าของ HTTP API Gateway (`sb-api-gateway`) 
- รายละเอียด: (1) ตำแหน่ง source ในหลักฐานท้ายไฟล์ คำนวณ `IsAdmin=true` จากกลุ่มสิทธิ์ `'แอดมิน/ผู้บริหาร'` ใส่เฉพาะ server Session token แต่ ตำแหน่ง source ในหลักฐานท้ายไฟล์ ออก JWT handoff โดยตั้ง `IsAdmin = (UserID==0 && AdminID!=null) ? 1 : 0` ทำให้แอดมินโรงเรียนปกติได้ `IsAdmin=0` ใน JWT ต่างจาก session (2) ตำแหน่ง source ในหลักฐานท้ายไฟล์ รับพารามิเตอร์ `q` ที่ถอดรหัสจาก `BusinessLogic.GetTokenInfo` (ตำแหน่ง source ในหลักฐานท้ายไฟล์) ซึ่งฝัง `id`/`username`/`password` ของ `TAdmin` ลงใน payload และยืนยันตัวตนด้วยการถือ `q` โดยไม่ตรวจรหัสผ่านซ้ำ (3) ตำแหน่ง source ในหลักฐานท้ายไฟล์ ค้น `TEmployees`/`TEmpSalaries` โดยไม่กรอง `SchoolId`, ใช้ key ขัดกันระหว่าง `nSystemID` กับ `sID` ใน `WorkStatus`, และคืน `StackTrace` ออกทาง response เมื่อเกิด exception
- ขอบเขต: เก็บเป็นรายการนอกขอบเขตให้เจ้าของระบบ legacy พิจารณา ห้ามลอกพฤติกรรมเหล่านี้เข้า SchoolBot แหล่ง `is_admin` ตอบแล้วตาม [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../shared/decisions/decisions-035.md) ไม่ถามธุรกิจซ้ำ ส่วนการป้องกันสำหรับ `GET /api/school-bot/auth/web-principal` ฝั่ง SchoolBot ติดตามในงานเดิม [SA-001 (ทบทวนสัญญาระบบและการอัปเดต)](plan/index-foundation.md) และ [BE-039 (ทำ web-principal/BFF/session และ staff bootstrap)](plan/extension/index.md) (G-AUTH)
- สถานะวันนี้: เจ้าของระบบยังไม่ได้ security triage เช่นเดียวกับ BL-002 (tenant/key และ active) และ BL-003 (SchoolId ในตารางเชื่อมชั้นเรียน) งาน SchoolBot ยังรอ implementation/trust/tenant/H5/Light เส้นทางใช้ client ผ่าน HTTP API Gateway ไป SchoolBot gRPC service ไม่มี HTTP relay/direct public service ตาม [Gateway integration](design/gateway-integration-001.md) Rev3 ที่หลักฐานเดิมอ้าง ไม่เพิ่ม scope หรืองาน

## หลักฐาน

- BL-004: `Default.aspx.cs:193-222`; `bypassgarde.aspx.cs:55-64`; `BypassSuperAdmin.aspx.cs:19-36,62-63`; `CommonLogic/BusinessLogic.cs:2418-2438`; `Default.aspx.cs:156-160,276-282`; `planning/legacy-auth-review-002.md` (memory); `planning/security-disposition-001.md` (memory); TR-AUTH-02/03/06 คือประเด็นตรวจบัญชีและสิทธิ์ของระบบเดิม
- plan/queue-003.md (memory) เป็นคิวที่ข้อความชี้แจงเดิมอ้าง งานเดิม SA-001 (ทบทวนสัญญาระบบ), [BE-006](plan/index-foundation.md) (Login/session), BE-039 (web-principal/BFF/session) ยังรอ implementation/trust/tenant/H5/Light ตามสถานะเดิม
