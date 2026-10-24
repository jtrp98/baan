# SchoolBot — Backlog

## กติกา

Append-only เพิ่ม BL-NNN พร้อมวันที่ ที่มา ความสำคัญ ผลกระทบต่อ AC และผู้เสนอ ห้ามแก้แถวเก่าหรือ renumber Findings ที่ไม่บล็อก AC เก็บที่นี่ ไม่เปิด task หรือเพิ่ม frozen release scope เอง การย้ายเข้า plan ต้องมีคำสั่งผู้ใช้เมื่อกระทบ scope

## รายการ

ยังไม่มี BL entry จากการรับแผนนี้ ไม่สร้าง speculative feature เพื่อเติม backlog ประเด็น DES-007/BE-019 เป็น contract coverage precondition ของ SA-001/G-RELEASE-DB จึงติดตามในแผน ส่วน human decisions เดิมติดตาม Waiting on Human โดยไม่สร้าง backlog ซ้ำ

### BL-001 — แก้คำอธิบายและตรวจยอด constraints ในเอกสาร

- วันที่: 2026-10-23
- ที่มา: vault review-006 advisory V012-09 (`db/review-006.md`) และข้อจำกัดที่บันทึกใน `planning/arch-review-001.md`; ผู้เสนอ: vault; ผู้บันทึก: gm
- ความสำคัญ: advisory ไม่บล็อก AC จากตัวเลขเอกสารเพียงอย่างเดียว
- งานติดตาม: arch แก้คำอธิบาย `schema-notes.md`; vault ตรวจยอดและเพิ่มคำชี้แจงใน `db/review-005.md` โดยรักษาประวัติเดิม อ้างผลนับปัจจุบันจาก review-006: 32 ตาราง/450 ฟิลด์/40 FK/24 UQ/80 CHECK/13 unique indexes/0 non-unique indexes พร้อมตรวจความตรงกันอีกครั้งตอนทบทวนสัญญาก่อน implementation
- ขอบเขต: งานเอกสารและตรวจยอดเท่านั้น ไม่เพิ่ม task หรือ frozen release feature ไม่เปลี่ยนสถานะตรวจรับหรือปิด gates และ finding นี้ไม่อนุญาตให้รัน SQL

### BL-002 — ช่องโหว่การกรอง tenant/key และสถานะ active ใน port `sb-api-gateway` (G) นอกขอบเขต SchoolBot

- วันที่: 2026-10-23
- ที่มา: `design/auth-evidence-001.md` (§1 M6, §5 IG5) และ `planning/security-disposition-001.md`; ผู้เสนอ: arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity, ไม่รับความเสี่ยงแทน jpo/เจ้าของระบบ และไม่ตัดสินแทน check/jpo ว่าจะบล็อก AC หรือไม่; ฝั่ง SchoolBot กำหนดเป็น contract-required ให้กรอง `SchoolId` และ fail-closed ใน adapter ของตัวเอง ซึ่งยังเป็น pending implementation/runtime proof)
- เจ้าของระบบ/ผู้รับ: เจ้าของ `sb-api-gateway` (G)
- รายละเอียด: (1) การตรวจสถานะนักเรียนบน mobile (`TstudentClassroomHistoriesRepository.cs:35-43`, `AuthService.cs:210-238`) ค้นด้วย `NTerm`+`CDel` โดยไม่ผูก `SId`/`SchoolId` และข้ามการตรวจเมื่อเป็น null (2) การตรวจพนักงานพ้นสภาพฝั่ง web (`WebLoginService.cs:206-217`) ค้น `TEmployees` ด้วย `sEmp==TUser.sID` (ใช้ `sID` ใน `WorkStatus` ต่างจาก `nSystemID` ที่ใช้ในจุดตรวจ identity โดยยังไม่ฟันธงว่า key ผิดเนื่องจากต้นฉบับเองใช้ต่างกันและยังรอพิสูจน์ data relation) และ `TempSalary` โดยไม่กรอง `SchoolId` พร้อมใช้ `FirstOrDefault` โดยไม่เรียงลำดับ (3) mobile login ไม่ตรวจ `TCompany` active และ `WorkStatus`
- ขอบเขต: อยู่นอก release scope ของ SchoolBot ไม่เปิด task ใหม่ในแผน SchoolBot ส่วนการป้องกันฝั่ง SchoolBot (ห้ามลอก query ที่ไม่กรอง `SchoolId`, ปฏิเสธ `purpose`/`aud` ใน `web-principal`, และไม่ใส่ชื่อ header `JabjaiWebKey-*` ใน log ตาม SEC001-001/013) route เข้างานเดิม `BE-039` และ `BE-006`

### BL-003 — การดึงห้องของวิชาใน `sb-tech-upgrade-academic` (A) ไม่กรอง `SchoolId` ของตารางเชื่อมชั้นเรียน

- วันที่: 2026-10-23
- ที่มา: `design/auth-evidence-001.md` (§1 GAP-006, §5 IG5) และ `planning/security-disposition-001.md`; ผู้เสนอ: arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity, ไม่รับความเสี่ยงแทน jpo/เจ้าของระบบ และไม่ตัดสินแทน check/jpo ว่าจะบล็อก AC หรือไม่; ฝั่ง SchoolBot กำหนดเป็นเพียงสัญญา contract-required ให้กรอง `SchoolId` ทุก join ตาม `data-contract-rules.md` และ `DES-012` ซึ่งยังเป็น pending implementation/runtime proof)
- เจ้าของระบบ/ผู้รับ: เจ้าของ `sb-tech-upgrade-academic` (A)
- รายละเอียด: `PlanCourseRepository.cs:194-215` ตอน join ห้องของวิชาไม่กรอง `SchoolId` ของ `ptsl2`/`tsl2` (`TplanTermSubLevel2`/`TTermSubLevel2`)
- ขอบเขต: งานแก้ของ repo A นอกขอบเขต SchoolBot ไม่เพิ่ม task ในแผน SchoolBot ส่วน query ฝั่ง SchoolBot ที่ตรวจสิทธิ์ครูรายวิชา/ห้องเรียนให้บังคับ `SchoolId` ทุกตารางในงานเดิม (`BE-002`, `BE-006`, `BE-017`, `BE-029`, `BE-034`, `BE-038`)

### BL-004 — ความต่างของ `IsAdmin` ระหว่าง session กับ JWT handoff และช่องโหว่ใน legacy `sb-web-academic-dev-1` นอกขอบเขต SchoolBot

- วันที่: 2026-10-23
- ที่มา: `planning/legacy-auth-review-002.md` (TR-AUTH-02/03/06) และ `planning/security-disposition-001.md`; ผู้เสนอ: sys/arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity หรือรับความเสี่ยงแทน jpo/เจ้าของระบบ; ไม่เพิ่ม scope/task ใน SchoolBot)
- เจ้าของระบบ/ผู้รับ: เจ้าของระบบเว็บเดิม `sb-web-academic-dev-1` ร่วมกับเจ้าของ `sb-api-gateway` (G)
- รายละเอียด: (1) `Default.aspx.cs:193-222` คำนวณ `IsAdmin=true` จากกลุ่มสิทธิ์ `'แอดมิน/ผู้บริหาร'` ใส่เฉพาะ server Session token แต่ `bypassgarde.aspx.cs:55-64` ออก JWT handoff โดยตั้ง `IsAdmin = (UserID==0 && AdminID!=null) ? 1 : 0` ทำให้แอดมินโรงเรียนปกติได้ `IsAdmin=0` ใน JWT ต่างจาก session (2) `BypassSuperAdmin.aspx.cs:19-36,62-63` รับพารามิเตอร์ `q` ที่ถอดรหัสจาก `BusinessLogic.GetTokenInfo` (`CommonLogic/BusinessLogic.cs:2418-2438`) ซึ่งฝัง `id`/`username`/`password` ของ `TAdmin` ลงใน payload และยืนยันตัวตนด้วยการถือ `q` โดยไม่ตรวจรหัสผ่านซ้ำ (3) `Default.aspx.cs:156-160,276-282` ค้น `TEmployees`/`TEmpSalaries` โดยไม่กรอง `SchoolId`, ใช้ key ขัดกันระหว่าง `nSystemID` กับ `sID` ใน `WorkStatus`, และคืน `StackTrace` ออกทาง response เมื่อเกิด exception
- ขอบเขต: เก็บเป็นรายการนอกขอบเขตให้เจ้าของระบบ legacy พิจารณา ห้ามลอกพฤติกรรมเหล่านี้เข้า SchoolBot ส่วนการตกลงแหล่ง `is_admin` สำหรับ `GET /api/school-bot/auth/web-principal` และการป้องกันฝั่ง SchoolBot ติดตามในงานเดิม `SA-001` และ `BE-039` (G-AUTH)

## Change Log

- 2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract
- 2026-10-23 — เพิ่ม BL-001 จาก V012-09 แบบ append-only ส่ง arch/vault แก้คำอธิบายและตรวจยอด โดยคง release scope และสถานะเดิม
- 2026-10-23 — เพิ่ม BL-002..004 จากผลตรวจ auth/legacy/security ของ arch และ sys สำหรับข้อบกพร่องใน G, A และ legacy web นอกขอบเขต SchoolBot (ติดป้ายยังไม่ผ่าน security triage ของเจ้าของระบบ ไม่เปิด task ใหม่ ส่วนงานในขอบเขต route เข้า task เดิม)
- 2026-10-24 — ใบงาน051: เพิ่มคำชี้แจงปัจจุบันต่อท้าย; ไม่แก้ BL เดิม/เพิ่มรายการ.

## คำชี้แจงต่อท้าย — precedence051 (2026-10-24)

BL-002..004 คงประวัติ/เจ้าของ/security triage เดิม. เฉพาะข้อความ BL-004 ว่ารอตกลงแหล่ง is_admin ถูก supersede โดย035 ที่ตอบแล้ว; ไม่เปิดคำถามธุรกิจซ้ำ. งานเดิม SA-001/BE-006/BE-039 อ่าน [queue-003](plan/queue-003.md) และ [Gateway Rev3](design/gateway-integration-001.md): client→HTTP G→gRPC B; ไม่มีHTTP relay/direct public B. ค้างimplementation/trust/tenant/H5/Light; รอบนี้docs-only ไม่เพิ่มscope/BL/task.
