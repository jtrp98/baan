# ใบงาน077 — int sync คำแสดงผลหมดเวลาตามมติ042

วันที่ 2026-10-26 · int / codex t2 / read-only · เริ่มหลังreq046/decisions042บันทึกแล้ว

K=C:/src/schoolbright/knowledge/school-bot. อ่านK/index.md→requirement/index.md→uxui/index.md→design/index.md แล้วrequirement/decisions-042.md,req046AC07,expiredproposal; uxui/int-004-learning.mdเฉพาะTestหมดเวลา+signoff; int-007-attempt-policy.md,int-007-states.md,int-007-recovery-a11y.md,int-007-teacher-score.md,int-007-trace.md; design/des-010.md,learning-ux-contract-gaps-001.mdLUX05 (ถ้ายังไม่มีamend076ให้ใช้มติbusiness042เป็นฐานและแยกtechnicalgapไว้)

userAตอบแล้ว: หมดเวลาตรวจsavedanswersทันเวลาอัตโนมัติ ข้อว่าง0 คะแนนเต็มทั้งชุด นับครั้ง/สิทธิ์ซ่อมเดิม ไม่รับคำตอบค้างเครื่องย้อนหลัง. Amendเฉพาะcopy/flow/traceที่เกี่ยว: หยุดแก้คำตอบ→กำลังประมวลผล→อ่านผลserverที่ยืนยันได้; unknownอย่าแสดงสำเร็จ/เดาคะแนน, offlineไม่ส่งย้อนหลัง. แสดงstateexpiredที่มีผลตรวจอย่างมีนัยชัด ไม่ตีexpiredเป็น"ไม่มีคะแนน"โดยปริยาย; feedbackยังตามpolicy

UX004ที่เซ็นแล้วปรับreadingpointer/ข้อความหมดเวลาให้ตรงมติ042โดยแยกdeltaจากส่วนเดิม (Q22–Q29คงมติเดิม ไม่ถือ042เป็นการเซ็นUXใหม่). UX007Q43สามารถเพิ่มตัวอย่างหมดเวลา4/10และขอเซ็นcopy/interactionส่วนนั้นพร้อมชุด007 ไม่สร้างคำถามย่อยใหม่ถ้าQ43ครอบได้ชัด และอย่าบันทึกhumanapprovalเอง. UX005ไม่มีผลAถ้าจริงให้บอกconsistentไม่แก้. เพิ่มAC04607ในtrace007 (รวม16entries)และข้อจำกัดexpiredbusinessตอบแล้ว/technicalยังรอ. uxui/indexcurrentnoticeต้องอธิบายมติAกับpendingdeltaของ004และQ43ให้ตรง โดยไม่อ้างทุกส่วนใหม่signed

ไม่regen/ขยายไฟล์เกิน11000UTF8bytes; exactedits+datedchangelogเท่านั้น. หากเกินงบใช้companionที่มีแล้วก่อน. คงP9/แพลตฟอร์ม/กฎที่เพิ่งตรวจ073 ไม่เปลี่ยนlayoutที่ไม่เกี่ยว. คำถามเซ็นQ39–Q46ต้องชัดว่าไม่รวมownerapprovalหรือruntime

คืนfencedJSON<=3000tokens {"state":"NEEDS_HUMAN|DONE|BLOCKED|NEEDS_DESIGN_CHANGE","summary":"...","edits":[{"path":"knowledge/school-bot/uxui/...","old":"uniqueexact","new":"replacement"}],"signoff_questions":[],"coverage":[],"handoff":"..."}. ห้ามเขียนจริง/code/SQL/DB/tests/network/Git/rolechain/status/signoffเดิม. คำถามใหม่เปลี่ยนได้เฉพาะQ43ให้รวมexpiredcopyโดยไม่ปิดมติbusiness042

## Change Log
- 2026-10-26 — ผู้ใช้เลือกAจริง; routeintsyncส่วนexpiredก่อนส่งเซ็นfinal UX
