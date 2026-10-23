# ใบงาน 011 — ส่งต่อมติ human gate เข้า REQ/DES/แผน

วันที่ของงาน: 2026-10-23 · ผู้ใช้สั่ง "งั้นส่งต่อเลย" หลังสรุปสาย spec → arch → gm → vault → sys

## เป้าหมายและขอบเขต run

นำ decisions-032..034 เข้าข้อกำหนดและสัญญาที่เกี่ยว แล้วให้ gm reconcile แผนระดับโครงการเดิม 74 งานกับ 44 REQ/174 AC (จำนวน AC อาจเพิ่มตามการตรวจของ spec) และ gate ตามหลักฐานจริง ไม่เริ่ม implement/deploy/รัน SQL หรือสั่งหุ่นใน run เอกสารนี้

มติที่ต้องคง: ครูทดลอง local/บันทึก project cloud แต่ไม่ส่ง submission/attempt cloud; กิจกรรมหนึ่งส่งหลายช่องข้ามวิชาได้ แต่ช่องหนึ่งรับกิจกรรมเดียว; mapping ใช้ช่องเดิมและล็อกเมื่อส่ง การเปลี่ยนใช้ชุดใหม่; export = earned/max × target max แล้ว half-up; ผลยังไม่มีให้ข้ามและคงค่าเดิม; คะแนนรวมหลักสูตรถ่วงน้ำหนักรายรายการรวม 100% Quiz ไม่นับน้ำหนัก 0 เปลี่ยนน้ำหนักมีผลเฉพาะ CourseRun ใหม่; ครูปรับเฉพาะเวลาสอบ/ช่วงเปิดปิด ส่วนจำนวนครั้ง/สุ่ม/เวลาเฉลยใช้ค่าส่วนกลาง; คงสอบซ่อมรายคนและคะแนนสูงสุดไม่มีเพดาน; เลื่อน Level นับทุกคน/งานขาดเป็น 0 แยกจาก export

## spec — read-only ส่ง output ให้ผู้คุมบันทึก

อ่าน index ก่อน: knowledge/school-bot/index.md, requirement/index.md, open-questions/index.md
ไฟล์ที่อนุญาตเพิ่ม: requirement/decisions-023.md, decisions-024.md, decisions-025.md, decisions-032.md, decisions-033.md, decisions-034.md; requirement/req-036.md, req-037.md, req-038.md, req-039.md, req-043.md, req-044.md, req-046.md, req-047.md, req-048.md, req-049.md, req-050.md, req-051.md, req-052.md, scope.md; open-questions/oq-014.md, oq-015.md, oq-016.md

ขอปรับเฉพาะที่ได้รับผลจากมติ ตรวจคำว่า "รอมนุษย์" ที่ตอบแล้วให้ไม่ขัดกัน ห้ามถามนโยบายเดิมซ้ำ อย่าระบุว่า contract/implementation ผ่านตามการปิด OQ; 3 PARTIAL/9 CLOSED คงเดิม เว้นแต่มีเหตุผลพร้อมมติจริงรองรับ ให้ AC ตรวจได้ครอบคลุม one-to-many/กันช่องซ้ำข้ามกิจกรรม/ล็อกหลังส่ง/ช่องเดิม/สูตรแปลง/ข้ามไม่มีผล/สูตรรวม/น้ำหนักไม่ย้อนหลัง/ขอบเขตครูและteacher-cloud ban คงรหัสเดิม เพิ่มเฉพาะ AC ที่จำเป็นท้ายเลขเดิมและระบุยอดรวมใหม่

ห้ามเขียนไฟล์หรือเรียก role ซ้อน คืน fenced JSON เดียว:
{"state":"DONE|NEEDS_HUMAN","summary":"...","edits":[{"path":"knowledge/school-bot/...","old":"ข้อความเดิมที่ตรงกันหนึ่งตำแหน่ง","new":"ข้อความใหม่"}],"new_files":[{"path":"...","content":"..."}],"req_count":44,"ac_count":174,"ac_counts":{"REQ-...":4},"confirmed":["..."],"questions":[],"handoff_arch":["..."]}

ทุก amendment มี Change Log 2026-10-23 อ้าง decisions-032..034 ตามจริง เพิ่ม edits ของ requirement/index.md และ module index หากจำนวน AC เปลี่ยน ไม่ regenerate ทั้งไฟล์ ไม่แก้ plan/design/source ใช้ JSON ที่ parse ได้ ให้เนื้อหาแก้ครบไม่ใช่แค่ข้อเสนอหรือรายชื่อไฟล์ จำกัด output เฉพาะจำเป็น

## งานต่อเนื่องของผู้คุม

บันทึกผล spec แล้วส่ง arch ปรับ DES/กติกาข้อมูลตามผลจริง; ให้ vault ตรวจ SQL parity หากมีส่วนข้อมูลได้รับผล; ส่ง gm จัดแผนและ gate ตามผลที่บันทึกแล้ว งานใดต้อง human approval ให้มี artifact ให้ตรวจ ไม่ถามอนุมัติสิ่งที่ยังไม่เตรียม ทุก output มีค่าลง knowledge และ final baan --commit ด้วย config workspace จริง

## Change Log

- 2026-10-23 — นายช่างเปิดใบงานจากคำสั่งผู้ใช้ ส่ง spec เป็นลำดับแรก
