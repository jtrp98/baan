# กฎผลเรียน — สูตรคะแนนและการตรึง policy

> Rev 2 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [กฎผลเรียนและ policy](learning-rules-032-034.md) กำหนดสูตรรวมและการห้ามแก้ย้อนหลัง ใช้ตาม [มติ 034 (สูตรรวมและขอบเขตครูปรับข้อสอบ)](../../shared/decisions/decisions-034.md)

## สูตรและ freeze

Policy คงรูป `{quiz_counts,activity_weights:[{activity_id,weight_bps}],formula_version}` ต้องระบุ activity ที่ให้คะแนนครบ ไม่ซ้ำ และอยู่ใน curriculum ของ run น้ำหนักเป็น integer ช่วง 0..10000 รวมเท่ากับ 10000 หรือ 100% โดย instruction ไม่เป็น source และเมื่อ quiz_counts=false ต้องให้น้ำหนัก quiz เป็น 0

weighted-normalized-v1: total=SUM((earned/max)*weight_bps/100) สเกล 0..100 เทียบเท่า normalized 0..100*weight_bps/10000; decimal, max>0, 0<=earned<=max ไม่ปัดรายส่วน ตัวอย่างสมมติ 8/10*20+6/10*30+18/20*50=79; น้ำหนัก 30/20/50 ได้ 81 ไม่มีน้ำหนักเริ่มที่กำหนดแทนผู้ใช้

policy revision/pointer แก้ได้เฉพาะ planned ที่ไม่เคยเริ่ม ภายใต้ CourseRun lock+If-Match ตรวจ same-run/tenant/weights เริ่มรอบ=planned→active transaction ตรึง CurrentPolicyId พร้อม audit/idempotency บันทึก Event=CourseRun.Started, EntityType=SchoolBotCourseRun, EntityId=PK, Reason={"policy_id":K,"policy_hash":H}; H=SHA-256 canonical Policy ต้องพร้อมก่อนเริ่ม Lifecycle ไป active→closing→closed ห้ามย้อน planned/ลบหลบ freeze

หลังเริ่มห้ามแก้ quiz_counts/weights/formula/pointer หรือลบ policy ที่อ้าง: 409 SCORING_POLICY_FROZEN น้ำหนักใหม่ใช้ run ใหม่ planned ตาม unique ห้อง/เทอม/successor เดิม ไม่ปิดรอบเพื่อย้อนคิดผล NULL สูตรคือร่างเปิดไม่ได้: 409 POLICY_NOT_CONFIGURED; weights ผิด 409 SCORING_WEIGHT_INVALID
