# ใบงาน030 — arch รับมติ035เฉพาะแหล่งis_admin

วันที่2026-10-23 · arch t1 read-only · งานเล็กเฉพาะมติ ไม่เปิดgm/planหรือสำรวจใหม่

ลำดับผู้ใช้Claude→AGY→Codexสุดท้าย: Claudeยังweeklylimitที่บันทึกในrunner-results-002; AGYก่อนในงานเล็กนี้ ขอบเขตแคบและtimeout240s ไม่รอ20นาทีแบบครั้งก่อน. ห้ามเรียกroleเอง

อ่านindex-first knowledge/school-bot/index.md,design/index.md,requirement/index.md แล้ว requirement/decisions-035.md (คำตอบผู้ใช้เลือกA), design/des-012.mdเฉพาะ§2/§4และamendmentRev5, gateway-integration-001.mdเฉพาะIsAdmin, auth-evidence-001.mdเฉพาะC11/หลักฐานเพิ่มเติมRev3 และ planning/legacy-auth-review-002.mdเฉพาะIsAdmin. ไม่อ่านsourceนอกworkspaceซ้ำหรือขอข้อมูล/นโยบายเดิมใหม่ ใช้upstream source:lineที่ตรวจHEAD/hashแล้ว

ส่งamendmentสั้นให้ชัดว่าแหล่งis_adminผู้ใช้ยืนยันแล้ว: ตรวจกลุ่มแอดมิน/ผู้บริหารฝั่งserverตามlegacyผูกตัวตน/โรงเรียนที่ตรวจแล้ว และคงsuperadminเดิม. JWTอย่างเดียวที่ส่ง0ไม่ใช่เหตุปิดสิทธิ์กลุ่ม และไม่เชื่อbody/headerassertion. ข้อมูลmapping/กลุ่ม/identityยังไม่พร้อมต้องfailclosed ไม่ยกสิทธิ์จากclaimอย่างเดียว. แยกpolicychoiceที่ปิดแล้วจากtechnicalproof/implementation/H5ที่ยังค้าง. ไม่สร้างตาราง/GRANT/Roleใหม่ ไม่เพิ่มAC. ไม่ใส่คอลัมน์/DBplacement/queryที่sourceไม่ยืนยัน. ไม่ทำให้school_adminกลายเป็นstaff_adminหรือให้สิทธิ์ครูทุกคน/ข้ามโรงเรียน. ระบุtest scenariosสั้นๆที่inspect/sysรับต่อ (สมาชิก/ไม่สมาชิก/ถูกถอน/ข้ามโรงเรียน/superadmin/bodyปลอม) ไม่อ้างรันผ่าน

คืนfencedJSONเดียว<=1800tokens เท่านั้น {"state":"DONE","summary":"...","edits":[{"path":"knowledge/school-bot/design/des-012.md หรือ gateway-integration-001.md หรือ auth-evidence-001.md หรือ index.md","old":"uniqueexact","new":"..."}],"handoff":["..."]}. ใช้append overrideที่มีลำดับเหนือข้อความรอคำตอบเดิมแทนrewriteทั้งไฟล์; อ้างdecisions-035ให้ลิงก์ถูกและChangeLogวันที่. ปรับเฉพาะจุดที่จำเป็นไม่เกิน4ไฟล์ ไม่ต้องเพิ่มไฟล์ใหม่/เพิ่มRevทุกไฟล์. ไม่sourcewrite/knowledgewrite/SQL/DB/network/tests/git/role. ยัง110tasks pending/77casesNOT_RUN/Important6OPEN. DONE=policy syncในเอกสาร ไม่ใช่G-AUTHผ่าน

## Change Log
- 2026-10-23 — นายช่างส่งคำตอบที่ผู้ใช้ยืนยันให้archก่อนเตรียมLoginต่อ
