# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; RC คือ Release Candidate.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-001 — web-principal และการแลก token เว็บยังไม่มี และตัว validator ที่จะใช้ยังหลวมเกินกว่าที่ [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](../shared/decisions/decisions-025.md) ยอมรับ

**สถานะปัจจุบัน:** เปิด · Important. is_admin ใช้ [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](../shared/decisions/decisions-035.md) ตรวจกลุ่มฝั่ง server และคง superadmin เดิม แทน claim-only. cType ไม่ใช่สิทธิ์ admin หรือหลักฐาน AccountId=ProfileId. ยังต้องพิสูจน์ endpoint และการแยกชนิด token.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: decisions-025 ยอมรับเฉพาะการรับ token ที่ไม่มี exp. validator เดิมไม่ตรวจ issuer/audience และไม่บังคับ exp, handler ไม่ปฏิเสธ handoff token (purpose=legacy-handoff) และ secret fallback ไปที่ Jwt:Secret. ถ้า web-principal ห่อ validator นี้ตรงๆ จะรับ token ผิดประเภทแลกเป็น SchoolBot session และ IsAdmin ที่ตรวจสิทธิ์ admin โรงเรียนอาจมาจาก claim ที่ไม่ผ่านการตรวจประเภท token. ณ วันที่ตรวจครั้งแรกไม่มี endpoint จึงยังไม่ถูกใช้โจมตี

วิธีแก้: ในงาน [BE-039 (web-principal และ auth ข้ามระบบ)](plan/index.md) ที่ยังต้องพิสูจน์ route/env/network/trust ระหว่างระบบ: (1) ปฏิเสธ token ที่มี claim purpose หรือ aud ทุกกรณี (2) บังคับ claim NCompany และ user_id/admin_id (3) ตรวจกลุ่มสิทธิ์ฝั่ง server และคง superadmin เดิมตาม decisions-035 ไม่อ่านสิทธิ์จากชื่อ header/body (4) rate limit ตาม (school,user), no-store, ไม่ log token/claims (5) ฝั่ง SchoolBot ล็อกอายุ session 30 นาที/8 ชม., audit ทุกการแลกพร้อมแหล่ง token และมีช่องทาง revoke ตาม [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop)](design/des-012.md) ข้อ 3 และ 6 (6) เมื่อ expires_at เป็น null ต้องยังจำกัดอายุ session ตามตาราง

ผู้รับ: be (ร่วมกับเจ้าของ sb-api-gateway)

การตรวจซ้ำ: jpo re-audit endpoint จริงหลัง implement: test token ที่มี purpose/aud ต้อง 401, token ไม่มี NCompany ต้อง 401, token ที่เซ็นด้วย Jwt:Secret ของ Bearer ปกติต้องไม่ผ่านถ้ามี secret แยก, ตรวจ log ว่าไม่มี token/claims. ตรวจ session cap และ audit ในการตรวจ [SEC-002 (RC Security)](plan/index.md)

เงื่อนไขลดความเสี่ยงและปิดข้อค้นพบ: ไม่ขัด fix ข้อ 1-6 ไม่ได้กำหนด MenuPermission และ endpoint นี้เป็น introspection ของ token ตัวเอง ไม่ได้เข้าข้อมูลตามเมนู MenuPermission ผูก TMenuPermission/Master DB และ fail closed (MenuPermission.cs (ดูหลักฐาน)) เห็นด้วยกับ arch แต่ policy ต้องไม่หลวม SmartScheme ส่ง Bearer ก่อน JabjaiWebKey (ApiServiceExtensions.cs (ดูหลักฐาน)) ถ้าใช้ default scheme/RequireAuthenticatedUser เฉยๆ Bearer ปกติ (Jwt:Secret) จะผ่านได้ handler ใช้ FirstOrDefault ของ JabjaiWebKey-* (JabjaiWebLegacyAuthHandler.cs (ดูหลักฐาน)) และ validator ไม่ปฏิเสธ purpose/aud จึงต้องปฏิเสธที่ endpoint/policy เอง ข้อเสนอ 'JabjaiWebKey-* มากกว่า 1 header → 401' ยืนยันเป็น optional ไม่ใช่ gate เพราะ claims ที่ตรวจแล้วเป็นแหล่งตัวตนเดียว (DES-012 §3 ข้อ 2)

ข้อมูลที่ยังต้องระบุ: ผู้ใช้ประสานเจ้าของ HTTP API Gateway ยืนยันผู้รับผิดชอบ endpoint, mapping user_id และสถานะ secret; is_admin ใช้ decisions-035 ถ้าเจ้าของ HTTP API Gateway ยืนยันว่าต้องใช้ MenuPermission ให้เป็น NEEDS_DESIGN_CHANGE DES-012

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](../shared/decisions/decisions-046.md).

## หลักฐาน

- SEC001-001: sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JwtTokenService.cs:184-197; sb-api-gateway/src/ApiGateway.Infrastructure/Common/Authentication/JabjaiWebLegacyAuthHandler.cs:25-54; knowledge/school-bot/design/des-012.md:33-37,46; knowledge/school-bot/requirement/decisions-025.md:19
- งานที่รับข้อค้นพบนี้: BE-039, BE-006, BE-001
- planning/security-mitigation-001.md (memory)
- MenuPermission.cs:14-19
- ApiServiceExtensions.cs:79-109
- JabjaiWebLegacyAuthHandler.cs:27-28
