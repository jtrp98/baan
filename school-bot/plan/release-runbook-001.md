# SchoolBot — โครง Release Runbook

วันที่2026-10-23 · เจ้าของgm/PM-001 · เป็นโครงเตรียมหลักฐาน ยังไม่พร้อมใช้รันจริง ไม่มีSQL/deployapprovalจากrunนี้

| ลำดับ | สิ่งที่ต้องพร้อม/ผู้เตรียม | จุดหยุดและrollback |
|---|---|---|
| 1 | check/jpoส่ง180AC/verdict,RC hashes,security retest/riskacceptance; gmตรวจG-QA/G-SEC | ขาดหลักฐานหยุด ไม่ประกาศreadiness |
| 2 | vault DBA-002/004/005/006/007รวมrevision/hashของdb/schoolbot_db.sqlและschoolbot_db_rollback.sql,ผลtest/catalog/restore,backup target; sysระบุcompatibility/workerstop | ยังไม่มีhuman execution receipts; ห้ามกรอกผลสมมติ |
| 3 | sys BE-023/039+เจ้าของinfraเตรียมroute/env/network/web-principal/secret refs,รายชื่อstaff_adminจากคน,rollout/health/rollback commandsจริง | H5/identityไม่พร้อมหยุด ไม่เปิดadminหรือexport |
| 4 | gmรวมทุกคำสั่งจริงจากvault/sysพร้อมผู้รัน/environment/backup/rollbackpointsให้คนอนุมัติG-RELEASEเฉพาะRC | ยังไม่มีartifactครบ ห้ามขอpermissionรวม/คนต้องเห็นrunbookก่อน |
| 5 | มนุษย์backupและหยุดwriter/workerตามแผนที่อนุมัติแล้ว จากนั้นรันSchoolBot DB SQLตามvault | catalog/constraintsไม่ตรงหยุด; ใช้rollback/restoreที่vaultตรวจพร้อมผลกระทบข้อมูล ห้ามรันdropกับข้อมูลจริงโดยเดา |
| 6 | มนุษย์rolloutAPI/worker, gateway introspection/BFF/Next.js admin/web-systemตามcompatibility orderที่sysระบุ | health/auth/license/four-eyes/v1ปิดไม่ผ่าน rollbackapp/configตามsys; ตัดสินDBrestoreโดยคน |
| 7 | คนยืนยันexport subconditionsครบก่อนเปิดgrade write; ไม่GRANT/เปลี่ยนschemaSchool/PGGradeDB | ปัญหาexportหยุดworker/กันwrite ตรวจdurable receipts/reconcile owned cells ไม่ล้างคะแนนครู |
| 8 | คนpublishsignedDesktop/assetsตามRC/hashและapproveddelivery; smokeOS/hardwareตามสิทธิ์จริง | ถอนการแจก/ย้อนappตามsignedplan คงGuest/Clouddata ไม่ลบประวัติ |
| 9 | PM-002รวบรวมdeployment/publication/SQL/smoke/ผู้ตรวจรับ receiptsที่เกิดจริง | ขาดreceiptหรือผู้ใช้ไม่ยอมรับยังไม่released |

คำสั่งลำดับdeployย่อยและrollbackที่รันได้ต้องมาจากengineersก่อนปิดPM-001 ไม่แต่งคำสั่ง/ผู้รัน/วันอนุมัติแทนคน. SchoolBot DBแยก4DBlegacy; ใช้บัญชีเดิมSchool/PGGradeDB; sourceoftruthล่าสุดตามevidence-002.md/decisions-025..034. การประกอบrunbookไม่อนุญาตexecute.

## Precedence 051 — 2026-10-24

ลำดับ3/6 ต้องรวม B gRPC service และ HTTP→RPC mapping ของ G พร้อม compatibility/health/rollback ของแต่ละฝั่งตาม [Gateway Rev3](../design/gateway-integration-001.md). sys เตรียมลำดับ rollout จริงก่อนคนอนุมัติ; ห้ามเดาลำดับหรือใช้ direct public B/HTTP relay fallback. Login HTTP เดิมของ G แยกขอบเขต. H5/Light/trust/tenant และ Gateway/gRPC/DB runtime ยังต้องมีหลักฐาน; 4032 local tests ไม่แทน. รอบนี้แก้โครงเอกสาร ไม่ execute.

## Change Log
- 2026-10-24 — ใบงาน051: sync transport ในrunbook; คงจุดหยุด/rollback/ผู้อนุมัติเดิม.
- 2026-10-23 — ตั้งโครงrunbookตามหน้าที่gm; SQL/rollout/backup/restore/คนรันยังรอartifact
