# ใบงาน049 — ปรับเอกสาร REST Gateway → gRPC SchoolBot ให้ชัด

วันที่ 2026-10-24 · arch / Codex t1 · read-only เอกสารเท่านั้น

ผู้ใช้ถาม “ไม่ได้ใช้ grcp หรอ แล้วเรียกผ่าน api gateway” ผู้คุมยืนยัน topology ที่ถูกต้องว่า Desktop/Web → HTTP API Gateway → gRPC → SchoolBot service และแจ้งตามจริงว่า logout ที่เขียนแล้วเป็น HTTP ใน B ยังไม่ต่อ gRPC/Gateway. ผู้ใช้ถามต่อ “ต้องปรับปรุงเอกสารไหม” ผู้คุมรับว่าจะปรับเอกสารให้ตรงกัน ใช้ Codex ตามคำสั่งเดิม ไม่เปิดคำถาม transport business ใหม่ เพราะมาตรฐาน G กำหนดไว้แล้ว

K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot; G=C:/src/schoolbright/target/sb-api-gateway. อ่าน K/index.md → plan/index.md → design/index.md แล้ว gateway-integration-001.md, gateway-login-reuse-001.md, des-012.md เฉพาะ transport, desktop-login-adapter-001.md/desktop-auth-review-packet-001.md เฉพาะ transport, planning/auth-flow-handoff-001.md และ qa/round-001.md เฉพาะผลตรวจ. อ่าน G/AGENTS.md เพื่อยืนยันกฎ transport/Light เท่านั้น ไม่สำรวจโค้ด G รอบนี้. ตรวจ as-built B/AGENTS.md/README.md/web/README.md แล้ว B/web/src/SchoolBot.Api/Program.cs, LogoutEndpoint.cs และ csproj/proto inventory เฉพาะยืนยัน HTTP logout/ไม่มี gRPC implementation; ไม่อ่าน secret/env values

คืน amendment ที่จำเป็น: current topology ต้องอ่านเห็นตั้งแต่บน gateway-integration ไม่ปล่อยข้อความ HTTP relay/HttpClient ที่ถูก supersede ให้อ่านเหมือนทางเลือกปัจจุบัน. คงประวัติครบ archived+dated override+precedence ไม่ regenerate/no renumber. ค่าเป้าหมาย REST/HTTP JSON ที่ G ฝั่ง client, gRPC จาก G ไป B ไม่ใช่ HTTP proxy/ direct public B. Login ที่ G มี HTTP อยู่เดิมแยกจาก service transport ใหม่ ไม่แปลว่าต้อง rewrite G login หรือ decoder ที่แค่ parse outcomes. โค้ด HTTP logout ปัจจุบันเป็น as-built ที่ยังไม่ครบ transport contract ไม่อ้าง gRPC พร้อม; domain/application/logout persistence ที่มีให้ใช้ซ้ำได้ตอนเปลี่ยน transport. 4032local tests คง verdict ขอบเขตเดิม ไม่ใช่ gRPC/Gateway/DB integration proof.

แก้ design index, gateway-integration และ DES012/reuse/adapter/packet เท่าที่คำ active ขัดหรือชวนเข้าใจผิด; ถ้าไม่จำเป็นให้ชี้ precedence ลิงก์สั้น ไม่เพิ่มเอกสารซ้ำ. ห้ามแก้ plan/index ของ gm, source, SQL, REQ/AC, canonical counts หรือ QA verdictเดิม. ไม่ออก proto/RPCmethods/auth metadata/error mappings โดยเดาในงานdocsสั้น; ระบุ next deliverable ให้ sys/arch เป็น gRPC contract+HTTP mapping+trust boundaryก่อน transport implementation. คง C/opaque session/035/cType และ H5/Light implementation review ที่มีจริง; แยกเลือกมาตรฐาน gRPCที่ทราบแล้วจาก proof implementation/trust/tenantที่ยังต้องทำ ไม่ถือว่าต้องขออนุมัติเลือก gRPC ซ้ำหรืออนุมัติ HTTPexception.

คืน fencedJSON <=4000tokens {"state":"DONE|NEEDS_DESIGN_CHANGE","summary":"...","as_built_evidence":[],"edits":[{"path":"knowledge/school-bot/design/...","old":"exact unique anchor","new":"exact replacement"}],"remaining_work":[],"handoff":"..."}. Exact anchorsแต่ละจุดไม่ซ้ำ ผู้คุม archive ก่อนapplyและบันทึกเอง ห้าม knowledge writes/source writes/role chaining/gitmutation/DB/network/tests. ถ้า bump revisions ต้อง sync index ใน output เดียวกัน

## Change Log
- 2026-10-24 — นายช่างส่ง arch แก้เอกสาร transport ให้สอดคล้องมาตรฐาน Gateway และแยก as-built HTTP logout จาก gRPC ที่ยังไม่ implement
