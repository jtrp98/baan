# int-007 — หลักฐาน / AC / ข้อจำกัด

วันที่ของงาน: 2026-10-26 · [ไฟล์หลักและ Sign-off](int-007-attempt-policy.md) · [เว็บครู/คะแนน](int-007-teacher-score.md) · [state/a11y](int-007-states.md)

ร่างทั้งหมดเป็นข้อเสนอ รายการด้านล่างคือ expected สำหรับส่ง check; actual ของระบบ **ยังไม่ได้ตรวจ runtime** การมีร่างไม่ใช่หลักฐาน AC ผ่าน

ฐานพาธอ้างอิงทุกบรรทัดในเอกสารนี้: `C:/src/schoolbright/knowledge/school-bot/` ตรวจจากไฟล์จริง ไม่คัดเลขบรรทัดจากความจำ

## 1. Trace ครบ 16 AC

ฐานเดิม 15 AC; เพิ่ม AC-046-07 ตาม042 ไม่ใช่ผล check-066 ใหม่

| AC | ส่วนร่าง / expected | หลักฐาน |
|---|---|---|
| AC-046-01 | หลัก §2 เห็นกติกาที่มีผล ไม่ผูกตามชื่อ | requirement/req-046.md:22; design/des-010.md:37–49 |
| AC-046-02 | หลัก §2 ค่าเริ่มและการจำกัดจริง; states §1–3 | requirement/req-046.md:23; design/des-010.md:42–46 |
| AC-046-03 | หลัก §2 ครั้งเดิมคงชุด/ลำดับจาก server; ข้อจำกัดด้านล่าง | requirement/req-046.md:24; design/des-010.md:89–100 |
| AC-046-04 | หลัก §2 snapshot เดิมไม่เปลี่ยน; ไม่แต่ง revision ที่ไม่คืน | requirement/req-046.md:25; design/des-010.md:22 |
| AC-046-05 | เว็บ T1 เฉพาะเวลา/เปิด–ปิด; field อื่นอ่านอย่างเดียว | requirement/req-046.md:27; design/learning-rules-032-034.md:20–21 |
| AC-046-06 | เว็บ T2 ก ได้ใบ ข ไม่ได้; 6→9 ใช้ 9; ซ่อม 5 คง 6 | requirement/req-046.md:28; design/des-010.md:51–54 |
| AC-046-07 | Q43; recovery delta042: 4/10 ไม่รับย้อนหลัง นับสิทธิ์เดิม | requirement/req-046.md §AC-046-07; requirement/decisions-042.md |
| AC-047-01 | เว็บ S1 แยกรายหลักสูตร รวม 100% และ Quiz ไม่นับ=0 | requirement/req-047.md:20; design/learning-rules-032-034.md:13–17 |
| AC-047-02 | เว็บ S1 Quiz ยังมีผล แต่เปลี่ยน Quiz น้ำหนัก0 ไม่เปลี่ยนรวม | requirement/req-047.md:21; design/des-010.md:48–49 |
| AC-047-03 | เว็บ S1 อ่านค่าที่บันทึกของ A โดย B ไม่เปลี่ยน | requirement/req-047.md:22; design/des-010.md:75–78 |
| AC-047-04 | เว็บ S1 ตาราง 16+18+45=79 | requirement/req-047.md:23; design/learning-rules-032-034.md:14 |
| AC-047-05 | เว็บ S1 รอบเดิม79 รอบใหม่81 ไม่คิดย้อนหลัง | requirement/req-047.md:25; design/learning-rules-032-034.md:16–17 |
| AC-048-01 | เว็บ L1 roster80/0 เฉลี่ย40; เสนอเมื่อ > เท่านั้น | requirement/req-048.md:22; design/des-011.md:25–30 |
| AC-048-02 | เว็บ L1 proposed ยังไม่เปลี่ยนทุกคนก่อนยืนยัน | requirement/req-048.md:23; design/des-011.md:66–73 |
| AC-048-03 | เว็บ L1 ยืนยันทั้งห้อง มีผลเทอมถัดไป | requirement/req-048.md:24; design/des-011.md:79–84 |
| AC-048-04 | เว็บ L1 เท่ากัน/ต่ำกว่าอยู่เดิม เท่ากัน gap0 | requirement/req-048.md:25; design/des-011.md:15–18,29 |

## 2. สัญญาที่ใช้ ไม่เพิ่ม API/field

Attempt ใช้ POST เริ่ม, GET ครั้งเดิม, PUT answers และ POST submit ตาม `design/des-010.md:86–100`; policy/เวลา/retake ตาม `:62–84`; Level/เกณฑ์/confirm/decline ตาม `design/des-011.md:34–77` ชื่อเหล่านี้เป็น client-facing semantics ผ่าน Gateway ไม่ใช่การอนุมัติ direct backend

Retry/error/opaque ETag ใช้ `design/data-contract-rules.md:41–66` ไม่ parse ETag เป็นวันที่ ไม่เปลี่ยน key เพื่อหลบ conflict การรักษาสิทธิ์ก่อน commit อ้าง `design/des-012.md:37,61–78` และ `design/teacher-authority-001.md:7–17`

สูตร/freeze/เลือกผล/งานขาด/roster ว่างใช้ `design/learning-rules-032-034.md:10–23`; snapshot types อยู่ `design/data-dictionary/contract-003.md:39–49` และการขยาย effective_policy/windows ที่ learning-rules:21 ไม่อ่าน snapshot server-only มาเผยเฉลย

## 3. ข้อจำกัดที่ส่ง arch ไม่ผลักให้ผู้เซ็นตัดสินเทคนิค

1. Resume: AttemptView ไม่มี answers และไม่มีรายการค้นหา attempt ค้างใน DES-010:86–100 แม้ข้อมูล Answers มีใน dictionary contract-002:34 จึงร่างการกลับเข้าครั้งเดิมเมื่อทราบ ID ได้ แต่ยังรับรองการกู้คำตอบ/ค้นหาหลังเปิดแอปใหม่ไม่ได้ ให้ arch ระบุวิธีตามสัญญาก่อน front ทำส่วนนี้
2. Policy/revision/history: snapshot เก็บไว้ตาม DES-010:22 และ learning-rules:21 แต่ AttemptView ไม่คืน effective_policy, bank_revision, evaluator_version หรือประวัติทุกครั้ง จึงยังทำรายละเอียดย้อนหลังครบ AC-046-03/04 จาก response นี้อย่างเดียวไม่ได้ ห้ามเติม field หรือ endpoint ใน UX เอง
3. หมดเวลา: business ตอบ A ตาม042/AC-046-07 แล้ว; ยังไม่มี amend076 ของ DES-010/LUX-05 รอ arch/sys ตรึง clock/race/retry/DTO/lifecycle/recovery ไม่รับรอง runtime
4. Aggregate/Level: ProgressView ที่ DES-005:96–97 มีผลที่เลือก แต่ไม่มี aggregate snapshot/breakdown; ProposalView ที่ DES-011:56–64 ไม่คืน roster/source refs/policy revision ทั้งชุด แม้ server เก็บ snapshot ตาม :30 จึงห้ามนำผลสดมาประกอบอ้างเป็น snapshot เดียวกัน ส่วนรายละเอียดที่ยังอ่านไม่ได้รอ arch ระบุช่องทางในขอบเขตเดิม
5. Authority/term resolver และการหาทรัพยากรหลัง unknown ที่ไม่มี ID ยังต้องพิสูจน์; ใช้ fail closed ไม่สร้างทางค้นหาหรือสิทธิ์เพิ่มเอง ตาม teacher-authority:17 และ DES-011:81–82

## 4. หลักฐาน source และ preconditions

อ่าน `C:/src/schoolbright/target/school-bot/app/frontend/src/App.tsx` ครบ 199 บรรทัด: :1–9 import AppView/Seg; :53–54 ตั้งภาษาเอกสาร; :56–72 จัด Escape ของ overlay; :96–105 cloud helper แปลงผล JSON เป็นข้อความ; :199 ส่ง state ไป AppView ไฟล์นี้ไม่แสดงหน้าข้อสอบ/เว็บครูจริง จึงไม่อ้างว่าตรวจ component เหล่านั้นหรือยืนยันว่าทั้ง repo ไม่มีหน้า ยังไม่ได้อ่าน AppView/Seg หรือ implementation ของ component เว็บครู/admin; รอบ070 อ่านเฉพาะกฎ web-system ตาม AGENTS → project-policy → CLAUDE → DESIGN และ loading.md: repo มีลำดับสูงกว่า skill ทั่วไป ใช้ P9 และ DESIGN/shared props สำหรับหน้าที่อยู่ repo นี้ตาม [states §1/§4](int-007-states.md) ไม่ขยายกฎไป Desktop/ส่วนกลาง ไม่เปลี่ยน stack และไม่อ้าง UI verified

`plan/evidence-002.md:7,14,19,21` ระบุ auth/UX/DB preconditions; ข้อความ UX เก่าใช้สถานะจาก `uxui/index.md:14–24` และมติ039–041 ที่ใหม่กว่า G/Light/H5/auth trust และ runtime ยังค้างตาม `design/index.md:8–10` งานนี้ไม่ปิด gate

ใช้ skill School Bright ตามพาธในใบงาน ตรวจ token/contrast ด้วยการคำนวณเท่านั้น ไม่รัน test/build/SQL/network/Git ไม่แก้ index/status/sign-off เดิม และไม่เขียนไฟล์จริง

## Change Log

- 2026-10-26 — 077: delta042 รอ Q43



- 2026-10-26 — ใบงาน070: เพิ่มหลักฐานกฎ repo ที่อ่านและขอบเขต P9/DESIGN; ข้อจำกัดสัญญาและ Q43–Q46 คงเดิม

- 2026-10-26 — ตรวจ AC/path:line และ source ที่อนุญาต; เตรียมส่งผู้คุมบันทึกและส่ง arch ตรวจข้อจำกัดก่อน front
