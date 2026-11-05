# SchoolBot — Backlog ความปลอดภัย Gateway และระบบวิชา

> แก้ล่าสุด 2026-11-02 · แก้โดย gm · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

กลับ [ทะเบียน backlog](backlog.md) H5 คือเงื่อนไข route/env/network/trust; Backend for Frontend (BFF) คือ server ของเว็บที่เรียก Gateway แทน browser

<a id="bl-002"></a>

### BL-002 — ช่องโหว่การกรอง tenant/key และสถานะ active ใน port HTTP API Gateway (`sb-api-gateway`)  นอกขอบเขต SchoolBot

- วันที่: 2026-10-23
- ที่มา: รายงานที่ระบุท้ายไฟล์ (§1 M6, §5 IG5) และ รายงานที่ระบุท้ายไฟล์; ผู้เสนอ: arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity, ไม่รับความเสี่ยงแทน jpo/เจ้าของระบบ และไม่ตัดสินแทน check/jpo ว่าจะบล็อก AC หรือไม่; ฝั่ง SchoolBot กำหนดเป็น contract-required ให้กรอง `SchoolId` และ fail-closed ใน adapter ของตัวเอง ซึ่งยังเป็น pending implementation/runtime proof)
- เจ้าของระบบ/ผู้รับ: เจ้าของ HTTP API Gateway (`sb-api-gateway`) 
- รายละเอียด: (1) การตรวจสถานะนักเรียนบน mobile (ตำแหน่ง source ในหลักฐานท้ายไฟล์, ตำแหน่ง source ในหลักฐานท้ายไฟล์) ค้นด้วย `NTerm`+`CDel` โดยไม่ผูก `SId`/`SchoolId` และข้ามการตรวจเมื่อเป็น null (2) การตรวจพนักงานพ้นสภาพฝั่ง web (ตำแหน่ง source ในหลักฐานท้ายไฟล์) ค้น `TEmployees` ด้วย `sEmp==TUser.sID` (ใช้ `sID` ใน `WorkStatus` ต่างจาก `nSystemID` ที่ใช้ในจุดตรวจ identity โดยยังไม่ฟันธงว่า key ผิดเนื่องจากต้นฉบับเองใช้ต่างกันและยังรอพิสูจน์ data relation) และ `TempSalary` โดยไม่กรอง `SchoolId` พร้อมใช้ `FirstOrDefault` โดยไม่เรียงลำดับ (3) mobile login ไม่ตรวจ `TCompany` active และ `WorkStatus`
- ขอบเขต: อยู่นอก release scope ของ SchoolBot ไม่เปิด task ใหม่ในแผน SchoolBot ส่วนการป้องกันฝั่ง SchoolBot (ห้ามลอก query ที่ไม่กรอง `SchoolId`, ปฏิเสธ `purpose`/`aud` ใน `web-principal`, และไม่ใส่ชื่อ header `JabjaiWebKey-*` ใน log ตาม SEC001-001/013) route เข้างานเดิม [BE-039 (ทำ web-principal/BFF/session และ staff bootstrap)](plan/extension/index.md) และ [BE-006 (ทำ Login และ session)](plan/index-foundation.md)

<a id="bl-003"></a>

### BL-003 — การดึงห้องของวิชาใน `sb-tech-upgrade-academic`  ไม่กรอง `SchoolId` ของตารางเชื่อมชั้นเรียน

- วันที่: 2026-10-23
- ที่มา: รายงานที่ระบุท้ายไฟล์ (§1 GAP-006, §5 IG5) และ รายงานที่ระบุท้ายไฟล์; ผู้เสนอ: arch; ผู้บันทึก: gm
- ความสำคัญ: ยังไม่ผ่าน security triage ของเจ้าของระบบ (gm ไม่กำหนด severity, ไม่รับความเสี่ยงแทน jpo/เจ้าของระบบ และไม่ตัดสินแทน check/jpo ว่าจะบล็อก AC หรือไม่; ฝั่ง SchoolBot กำหนดเป็นเพียงสัญญา contract-required ให้กรอง `SchoolId` ทุก join ตาม `data-contract-rules.md` และ [DES-012 (Auth ข้ามระบบ)](design/des-012.md) ซึ่งยังเป็น pending implementation/runtime proof)
- เจ้าของระบบ/ผู้รับ: เจ้าของ `sb-tech-upgrade-academic` 
- รายละเอียด: ตำแหน่ง source ในหลักฐานท้ายไฟล์ ตอน join ห้องของวิชาไม่กรอง `SchoolId` ของ `ptsl2`/`tsl2` (`TplanTermSubLevel2`/`TTermSubLevel2`)
- ขอบเขต: งานแก้ของ repo `sb-tech-upgrade-academic` นอกขอบเขต SchoolBot ไม่เพิ่ม task ในแผน SchoolBot ส่วน query ฝั่ง SchoolBot ที่ตรวจสิทธิ์ครูรายวิชา/ห้องเรียนให้บังคับ `SchoolId` ทุกตารางในงานเดิม ([BE-002 (เชื่อมฐานข้อมูลของบริการ)](plan/index-foundation.md), `BE-006`, [BE-017 (ทำ API ครู)](plan/index-delivery.md), [BE-029 (ทำ CourseRun/Level/Activity รายห้อง)](plan/extension/index.md), [BE-034 (ทำเสนอ/ยืนยันเลื่อน Level ทั้งห้อง)](plan/extension/index.md), [BE-038 (ทำ export outbox/authz/replay/recovery)](plan/extension/index.md))

## หลักฐาน

- BL-002: `TstudentClassroomHistoriesRepository.cs:35-43`; `AuthService.cs:210-238`; `WebLoginService.cs:206-217`; `design/auth-evidence-001.md` (memory); `planning/security-disposition-001.md` (memory); auth-evidence-001 §1 M6/§5 IG5; SEC001-001/013 (ข้อควรป้องกันฝั่ง SchoolBot)
- BL-003: `PlanCourseRepository.cs:194-215`; `design/auth-evidence-001.md` (memory); `planning/security-disposition-001.md` (memory); auth-evidence-001 §1 GAP-006/§5 IG5; GAP-006 คือช่องว่างการกรอง tenant ของตารางเชื่อม
