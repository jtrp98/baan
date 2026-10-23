# SchoolBot — คิว Rev2

รายงาน Waiting on Human ที่ evidence-002.md ก่อนเสมอ; runนี้เอกสารเท่านั้น ไม่implement/deploy/SQL/hardware.

## เริ่มเตรียมได้

1. SA-001/arch รับผลtask-013ล่าสุด; BE-001/sys legacy fixtures; DBA-001/vault รับผลtask-012 parity. ไม่รอphaseทั้งก้อน ไม่รับรองผลที่ยังไม่บันทึก.
2. TP-001/inspect จัด180AC matrix ใช้canonical owner/validation. SEC-001/jpo ทบทวนauth/channel/custody/H5 risk. BA-001/specสรุปGuestมติเดิม; BA-002/specเตรียมinventory/criteria; BA-003/004/specเสนอหุ่น/ส่งมอบให้ตรวจ.
3. SA-004/arch หลังSA-001 → TP-003/inspectหลังTP-001 และ DBA-007/vaultหลังDBA-001 เตรียมexport proof/fixtures ไม่รันDB.
4. UX-001/003/intเตรียมartifactได้; UX-002/004และUX-005..007ตามdependencies/G-GUEST/G-LEARNที่เกี่ยว ส่งผู้ใช้sign-offเมื่อartifactพร้อม.

## คิว implementation ภายหลังอนุญาตและครบ evidence

DBA-002→มนุษย์test SQL→DBA-003→BE-002; BE-039ตามG-AUTH/G-COREและH5 owner/route/env/network/staff_admin pack→BE-003→004→005→007เป็นสายDB/auth/License. ส่วนDesktop BE-006ตามdependencies/G-AUTH. ห้ามใช้policyapprovalข้ามruntimegate.

| สาย | Implementation | validation |
|---|---|---|
| Guest | BE-024/025/026→FE-017/018 | QA-011 |
| หลักสูตร/Sheet/Level | BE-027/028/029→FE-019 | QA-012 |
| ข้อสอบ | BE-030/031/032→FE-020/021/022 | QA-013 |
| สูตร/เลื่อนLevel | BE-033/034→FE-022 | QA-014 |
| mapping/export | SA-004/TP-003/DBA-007→BE-035/036/037/038→FE-023/024 | QA-015/016 |

ตารางเป็นสายย่อ ใช้depends_on/gate_idsในJSONจริง. Frontทุกconsumerต้องsigned UXของตน; backendเขียนเกรดต้องexport subconditionsครบ; ไม่มีการสร้างfeatureใหม่. BE-023/SEC-002/PM-001ต้องรับงานใหม่ครบตามJSONก่อนrelease; PM-001รวมrunbookให้คนตรวจ PM-002เก็บreceiptsจริง.

## Routing

ทุกrole→ผู้คุมเท่านั้น. arch→vault/sys/inspect/jpoตามcontract; spec→int/arch/เนื้อหาที่รอมนุษย์; vault→คนรันSQLและsysผ่านผู้คุม; int→ผู้ใช้sign-off→front; sys/front→check; check→ผู้คุมบันทึกverdict; jpo→ผู้แก้/คนรับความเสี่ยง; gm→คนอนุมัติrelease. ไม่chainrole.
Owner alias: sa→arch,ba→spec,be→sys,fe→front,dba→vault,tp→inspect,qa→check,sec→jpo,ux→int,pm→gm. prefixIDsไม่renumber.

207person-days/110งาน/แต่ละงาน1–2วันเป็นสมมติฐาน — ยังไม่ยืนยัน ไม่ใช่deadline ไม่รวมรอคน/เครื่อง; 36งานย่อยแตกscopeที่ผู้ใช้ยืนยันแล้วเพราะใส่รวมงาน2วันเดิมเกินขนาด. Reworkเกิน2รอบให้คนเลือกaccept/re-scope/drop. Non-blocking findingเข้าbacklogเท่านั้น รอบนี้ไม่มีBLใหม่.

## Change Log
- 2026-10-23 — Rev2: คิว44/180; คง8phases/17gates/pendingทั้งหมด
