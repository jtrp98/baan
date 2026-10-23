# ข้อมูลเทคนิคจากผู้ใช้ — รอบ001

วันที่ 2026-10-23 · ตอบคำถามระหว่างคิว task017..021

> ตอนนี้ SchoolBot API เปิดให้เข้าถึงจากที่ใดแล้ว?
>
> เป็น 1 service ผ่าน api gateway C:\src\schoolbright\target\sb-api-gateway

> โค้ดเว็บเดิม sb-web-system ที่มี Default.aspx.cs / bypassgarde.aspx.cs / ComFunction.cs อยู่ที่ repo หรือพาธใด?
>
> C:\src\sb-web-academic-dev-1 คุณดูจากในนี้ก็ได้ นะ

การส่งต่อของนายช่าง: ยืนยันตำแหน่ง source และรูปแบบ SchoolBot service ผ่าน gateway ตามที่ผู้ใช้บอก ให้ sys ตรวจต้นฉบับแบบอ่านอย่างเดียว และ arch ตรวจ routing/topology แบบเดิมกับ source จริงก่อนแก้สัญญา. ข้อความนี้ยังไม่ได้ระบุ host/TLS, public exposure, credential, environment หรือว่ามี instance ที่ deploy จริงแล้ว จึงไม่เติมข้อเท็จจริงเหล่านั้นแทนผู้ใช้. ไม่เปลี่ยนมตินโยบาย 032..034 หรือรับความเสี่ยงใหม่

## Change Log
- 2026-10-23 — นายช่างบันทึกคำตอบตรงตามผู้ใช้และส่งต่อ task022/023
