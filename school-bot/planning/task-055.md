# ใบงาน055 — sys ตรวจ pre-auth routing/profile linkage จาก source จริง (docs-only)

วันที่2026-10-24 · sys/Codex t3 read-only · ต่อคิว override ใบงาน051 ขั้นแรก: "sys ตรวจ routing/linkage" ก่อน arch จัด gRPC contract

K=C:/src/schoolbright/knowledge/school-bot. อ่านตามลำดับ: K/index → design/index (ส่วน Transport ใบงาน049) → planning/auth-flow-handoff-001 (ส่วน "คำชี้แจง cType" และ "ขั้นเทคนิคถัดไป") → design/desktop-login-adapter-001.md (Rev4) → planning/desktop-login-owner-question-001.md → planning/legacy-auth-review-002.md (หลักฐานรอบ002 ไม่ต้องอ่าน source ซ้ำที่ตรวจแล้ว นำผลเดิมมาต่อ)

Source ที่ตรวจได้ (read-only อย่างเดียว):
- legacy: C:/src/sb-web-academic-dev-1 — อ่าน AGENTS.md ที่รากก่อน แล้วตรวจเฉพาะที่เกี่ยว WebLoginService / FindAuthUserDetail / login routing (ค้นหาเฉพาะจุด ไม่ ls ทั้ง repo ไม่อ่าน config/env/secret)
- B: C:/src/schoolbright/target/school-bot — เฉพาะ web/src/SchoolBot.Api ส่วนที่เกี่ยวกับ login/session ปัจจุบัน

คำถามที่ต้องตอบด้วยหลักฐาน source:line ทุกข้อ:
1. routing seam: การเลือกเส้นทางตาม cType (0=student/1=employee ตาม source033) เกิดที่ server จุดไหน เกิดก่อนตรวจ/ส่ง password หรือหลัง และเป็น single route ที่ไม่กำกวม หรือยังลอง credential หลายเส้นทาง
2. linkage: มีจุดที่ผูก authenticated account กับ profile เดียว (AccountId→ProfileId) แบบไม่กำกวมได้จาก server ไหม ใช้ตาราง/คอลัมน์อะไรที่ source ยืนยันเท่านั้น
3. cType provenance: cType อ่านจากคอลัมน์/แหล่งใดของ server จริง มีกรณีที่ค่าเดียวไม่พอตัดสิน route (บัญชีเดียวหลายบทบาท/ค่า null/soft-delete cDel) หรือไม่
4. failure modes: routing/linkage ล้มเหลวแล้ว legacy ตอบอย่างไร (status/message/redirect) เพื่อใช้ต่อใน error mapping ของสัญญา
5. verdict: seam พร้อมใช้ต่อ caller ได้เลย / มีเงื่อนไข / ไม่มี — พร้อมเงื่อนไขที่ต้องออกแบบเพิ่มโดยไม่เดาชื่อคอลัมน์ที่ไม่มีใน source

ห้าม: ถามผู้ใช้ซ้ำ (cType category ตอบแล้ว ห้ามถามประเภทบัญชีซ้ำ), เขียน/แก้ไฟล์ทุก repo, รัน Login จริง, network/DB, เปิด implementation, อ้างว่า fullLogin พร้อม (คง NOT_READY), สมมติ AccountId=ProfileId หรือใช้ cType เป็นสิทธิ์ admin

คืน fenced JSON <=4000 tokens: {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","findings":[{"question":1..5,"verdict":"...","evidence":[{"repo":"legacy|B","path":"...","lines":"...","note":"..."}]}],"constraints":["..."],"handoff":"สิ่งที่ arch ต้องใช้ต่อในการออกแบบ gRPC login/session contract"} · นายช่างเป็นคนบันทึกเข้า knowledge เอง

## Change Log
- 2026-10-24 — เปิดใบงาน sys ตรวจ routing/linkage ตามคิว override 051 ขั้นแรก (docs-only)
- 2026-10-24 — รับผล: state=BLOCKED — legacy เป็น employee-only (cType="1", cDel==null, เลือก sID มากสุดไม่ reject ซ้ำ), B ยังไม่มี login route, และ WebLoginService/FindAuthUserDetail ไม่อยู่ใน legacy (ค้น rg ไม่พบ) → นายช่างยืนยันว่า symbol อยู่ใน G source จึงเปิด [ใบงาน056](task-056.md) ตรวจฝั่ง G ต่อ; หลักฐานเก็บที่ [routing-linkage-evidence-001.json](routing-linkage-evidence-001.json)
