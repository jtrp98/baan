# 3. ข้อจำกัดที่ส่ง arch ไม่ผลักให้ผู้เซ็นตัดสินเทคนิค

> แก้ล่าสุด 2026-11-02 · แก้โดย int · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

[กลับเอกสารหลัก](int-007-trace.md)

## 3. ข้อจำกัดที่ส่ง arch ไม่ผลักให้ผู้เซ็นตัดสินเทคนิค

1. Resume: AttemptView ไม่มี answers และไม่มีรายการค้นหา attempt ค้างใน [DES-010 (Question Bank, Attempt และนโยบายคะแนน)](../design/des-010.md) แม้ข้อมูล Answers มีใน dictionary contract-002 จึงร่างการกลับเข้าครั้งเดิมเมื่อทราบ ID ได้ แต่ยังรับรองการกู้คำตอบ/ค้นหาหลังเปิดแอปใหม่ไม่ได้ ให้ arch ระบุวิธีตามสัญญาก่อน front ทำส่วนนี้
2. Policy/revision/history: snapshot เก็บไว้ตาม DES-010 และ learning-rules แต่ AttemptView ไม่คืน effective_policy, bank_revision, evaluator_version หรือประวัติทุกครั้ง จึงยังทำรายละเอียดย้อนหลังครบ AC-046-03, AC-046-04 จาก response นี้อย่างเดียวไม่ได้ ห้ามเติม field หรือ endpoint ใน UX เอง
3. หมดเวลา: business ตอบ A ตามมติ 042/AC-046-07 แล้ว; ใช้สัญญาผลข้อสอบเมื่อหมดเวลาตาม [des-010.md](../design/des-010.md) และ [learning-ux-contract-gaps-001.md](../design/learning-ux-contract-gaps-001.md); technical proof ยัง OPEN: clock/deadline, save/submit/expiry race, idempotent finalization, crash/retry/recovery, read ระหว่าง finalize และ reveal mapping รอ arch/sys ตรึงและพิสูจน์ ไม่รับรอง runtime
4. Aggregate/Level: ProgressView ที่ [DES-005 (หลักสูตร ภารกิจ และผลประเมิน)](../design/des-005.md) มีผลที่เลือก แต่ไม่มี aggregate snapshot/breakdown; ProposalView ที่ [DES-011 (ระบบเสนอเลื่อน Level และครูยืนยันทั้งห้อง)](../design/des-011.md) ไม่คืน roster/source refs/policy revision ทั้งชุด แม้ server เก็บ snapshot ตาม :30 จึงห้ามนำผลสดมาประกอบอ้างเป็น snapshot เดียวกัน ส่วนรายละเอียดที่ยังอ่านไม่ได้รอ arch ระบุช่องทางในขอบเขตเดิม
5. Authority/term resolver และการหาทรัพยากรหลัง unknown ที่ไม่มี ID ยังต้องพิสูจน์; ใช้ fail closed ไม่สร้างทางค้นหาหรือสิทธิ์เพิ่มเอง ตาม teacher-authority และ DES-011

## 4. หลักฐาน source และ preconditions

ค่าคอนทราสต์เป็นผลคำนวณจาก token เท่านั้น ยังไม่มีหลักฐานตรวจ UI/runtime

## หลักฐาน

- ฐานพาธอ้างอิงทุกบรรทัดในเอกสารนี้: `C:/src/schoolbright/knowledge/school-bot/` ตรวจจากไฟล์จริง ไม่คัดเลขบรรทัดจากความจำ
- requirement/req-046.md:24
- design/des-010.md:37–49
- requirement/req-046.md:25
- design/des-010.md:42–46
- requirement/req-046.md:26
- design/des-010.md:89–100
- requirement/req-046.md:27
- design/des-010.md:22
- requirement/req-046.md:29
- design/learning-rules-032-034.md:20–21
- requirement/req-046.md:30
- design/des-010.md:51–54
- requirement/req-047.md:20
- design/learning-rules-032-034.md:13–17
- requirement/req-047.md:21
- design/des-010.md:48–49
- requirement/req-047.md:22
- design/des-010.md:75–78
- requirement/req-047.md:23
- design/learning-rules-032-034.md:14
- requirement/req-047.md:25
- design/learning-rules-032-034.md:16–17
- requirement/req-048.md:22
- design/des-011.md:25–30
- requirement/req-048.md:23
- design/des-011.md:66–73
- requirement/req-048.md:24
- design/des-011.md:79–84
- requirement/req-048.md:25
- design/des-011.md:15–18,29
- `design/des-010.md:86–100`
- `design/des-011.md:34–77`
- `design/data-contract-rules.md:41–66`
- `design/des-012.md:37,61–78`
- `design/teacher-authority-001.md:7–17`
- `design/learning-rules-032-034.md:10–23`
- `design/data-dictionary/contract-003.md:39–49`
- learning-rules:21
- DES-010:86–100
- contract-002:34
- DES-010:22
- design/des-010.md:123–135
- design/learning-ux-contract-gaps-001.md:13,24
- DES-005:96–97
- DES-011:56–64
- teacher-authority:17
- DES-011:81–82
- อ่าน `C:/src/schoolbright/target/school-bot/app/frontend/src/App.tsx` ครบ 199 บรรทัด: :1–9 import AppView/Seg; :53–54 ตั้งภาษาเอกสาร; :56–72 จัด Escape ของ overlay; :96–105 cloud helper แปลงผล JSON เป็นข้อความ; :199 ส่ง state ไป AppView ไฟล์นี้ไม่แสดงหน้าข้อสอบ/เว็บครูจริง จึงไม่อ้างว่าตรวจ component เหล่านั้นหรือยืนยันว่าทั้ง repo ไม่มีหน้า ยังไม่ได้อ่าน AppView/Seg หรือ implementation ของ component เว็บครู/admin; หลักฐานเดิมอ่านเฉพาะกฎ web-system ตาม AGENTS → project-policy → CLAUDE → DESIGN และ loading.md: repo มีลำดับสูงกว่า skill ทั่วไป ใช้ P9 และ DESIGN/shared props สำหรับหน้าที่อยู่ repo นี้ตาม [states §1/§4](int-007-states.md) ไม่ขยายกฎไป Desktop/ส่วนกลาง ไม่เปลี่ยน stack และไม่อ้าง UI verified
- `plan/evidence-002.md:7,14,19,21` (memory) ระบุ auth/UX/DB preconditions; ข้อความ UX เก่าใช้สถานะจาก `uxui/index.md:14–24` และ[มติ039 (sign-off UX-002 ครบ + UX-004 บางส่วน (Q14–Q25))](../requirement/decisions-039.md)–041 ที่ใหม่กว่า HTTP API Gateway (`sb-api-gateway`)/Light/H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ)/auth trust และ runtime ยังค้างตาม `design/index.md:8–10` งานนี้ไม่ปิด gate
