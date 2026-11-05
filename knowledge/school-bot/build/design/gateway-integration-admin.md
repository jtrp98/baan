# Gateway integration — แหล่งสิทธิ์ admin โรงเรียน

> Rev 5 · แก้ล่าสุด 2026-11-04 · แก้โดย นายช่าง · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

หน้านี้เป็นนโยบายเป้าหมาย ไม่ใช่ผลตรวจสิทธิ์จริง ปัจจุบัน Gateway ส่ง IsAdmin/admin_id จาก JWT และ SchoolBot resolver ใช้ identity.IsSchoolAdmin หรือ employee.IsAdmin; หลักฐานกลุ่ม/active account/profile และการรับรองสิทธิ์ productionยังต้องตรวจ ไม่ถือว่าตรงนโยบายครบเพียงเพราะมี claim อ่าน [contract ปัจจุบัน](gateway-grpc-contract-001.md) และ [หลักฐาน/ข้อแตกต่าง](gateway-integration-evidence.md)

ส่วนต่อของ [Gateway integration](gateway-integration-001.md) และ [DES-012 authorization](des-012-authorization.md) กำหนดการคำนวณ school_admin เฉพาะโรงเรียนที่ยืนยันแล้ว

## เกณฑ์ที่ใช้

ผู้ใช้ยืนยัน**ทาง A** ตาม [มติ 035 (ตรวจกลุ่มแอดมิน/ผู้บริหารและคง super admin)](../../shared/decisions/decisions-035.md):

1. **เกณฑ์ให้สิทธิ์ `is_admin=true` ฝั่ง server**:
   - **แอดมินโรงเรียนปกติ**: ตรวจสมาชิกกลุ่มฝั่ง server ตามหลักฐาน legacy การตรวจกลุ่มใน legacy (`TGroupPermissionUser` ที่ `SchoolID==school_id`, `UserID==user_id` (`nSystemID`), `IsActive==true` join `TGroupPermissionMenu(Type=='W')` และ `TMenuPermission` ที่ `groupName=='แอดมิน/ผู้บริหาร' && isEditable==false` และมีแถวเมนูอย่างน้อย 1 แถว) ผูกกับตัวตนพนักงานที่ active (`WorkStatus ∉ {2,3}`) และโรงเรียน active (`TCompany`) ของ `school_id` ที่ตรวจจาก token แล้วเท่านั้น
   - **Super admin เดิม**: คงสิทธิ์ตาม legacy การตรวจ super admin ใน legacy และ การตรวจ super admin ใน legacy (`user_id==0 && admin_id!=null` ที่ตรวจ `TAdmins` และโรงเรียน active แล้ว)
2. **การตีความ JWT และ fail-closed**:
   - JWT ของพนักงานปกติที่ส่ง `IsAdmin=0` ไม่ใช่เหตุปิดสิทธิ์กลุ่ม หากผลตรวจกลุ่มฝั่ง server ผ่าน
   - ห้ามเชื่อ `is_admin`/`user_id`/`admin_id`/`school_id` จาก request body, header หรือ suffix ของ `JabjaiWebKey-*`
   - เมื่อข้อมูล mapping (การพิสูจน์ account/profile mapping), ตารางกลุ่มสิทธิ์ หรือ identity lookup ยังไม่พร้อม/เกิดความผิดพลาด ต้อง **fail closed** (`503 AUTH_NOT_CONFIGURED` / `503 AUTH_UNAVAILABLE`) ห้ามยกสิทธิ์จาก JWT claim ลอยๆ
3. **ขอบเขตสิทธิ์และข้อจำกัด**:
   - ได้เฉพาะสิทธิ์ `school_admin` ของ `school_id` นั้นบน `channel="school_web"` (ไม่กลายเป็น `staff_admin`, ไม่ให้สิทธิ์แอดมินแก่ครูทุกคนที่ไม่ใช่สมาชิกกลุ่ม, ไม่ข้ามโรงเรียน) และต้อง re-check ก่อน commit
   - ไม่สร้างตาราง/GRANT/Role ใหม่ ไม่เพิ่ม AC และไม่สมมติชื่อคอลัมน์/DB placement/query นอกเหนือที่ source ยืนยัน
   - แยก policy choice ที่ปิดแล้วออกจากสิ่งที่ยังค้าง: ตัวตรวจ login `TAdmin`, account/profile mapping, collation, hash/culture และ student login, การ implement ใน API Gateway/SchoolBot และ H5 (เงื่อนไข route/env/network/trust ระหว่างระบบ) ยังไม่ปิด (เงื่อนไขเปิดใช้ authentication ยังไม่ครบ)
4. **กรณีตรวจสิทธิ์ที่ต้องพิสูจน์**:
   - **สมาชิกกลุ่ม**: พนักงานในกลุ่ม `แอดมิน/ผู้บริหาร` ที่ active ของโรงเรียนตนเอง แม้ JWT ส่ง `IsAdmin=0` → ได้ `is_admin=true` (`school_admin` เฉพาะโรงเรียนนั้น)
   - **ไม่เป็นสมาชิก**: ครู/พนักงานปกติในโรงเรียนเดียวกันที่ไม่อยู่ในกลุ่ม → ได้ `is_admin=false` (ไม่ได้ `school_admin`)
   - **ถูกถอนสิทธิ์/พ้นสภาพ**: ผู้ใช้ที่ถูกถอนจากกลุ่ม (`IsActive=false` หรือไม่มีเมนู `Type='W'` ของกลุ่ม) หรือ `WorkStatus ∈ {2,3}` → ปฏิเสธ `school_admin` ทั้งตอนแลก session และตอน re-check ก่อน commit
   - **ข้ามโรงเรียน**: แอดมินกลุ่มของโรงเรียน A เรียกจัดการข้อมูลโรงเรียน B → ปฏิเสธ (`403`)
   - **Super admin เดิม**: token `user_id=0, admin_id!=null` ของโรงเรียนที่ active → คงได้ `is_admin=true` สำหรับ `school_web` ของโรงเรียนนั้น แต่แลก `staff_admin` ไม่ได้หากไม่มี `SchoolBotStaffRole`
   - **Body/Header ปลอม หรือ mapping ไม่พร้อม**: ส่ง body/header ปลอม (`is_admin=true`, `x-school-id`, suffix ไม่ตรง) หรือระบบกลุ่ม/mapping ยังไม่ตั้งค่า → ปฏิเสธ (`401`/`403`) หรือ fail closed (`503 AUTH_NOT_CONFIGURED`)

## หลักฐาน

- `FingerprintPayment/Default.aspx.cs:193–240` คำนวณ IsAdmin ใน server session; `FingerprintPayment/bypassgarde.aspx.cs:55–75` และ `BypassAcademic.aspx.cs:43–63` ให้ JWT IsAdmin=1 เมื่อ user_id=0/admin_id!=null ส่วนแอดมินโรงเรียนปกติได้ 0
- legacy-auth-review-002 และ legacy-source-check-001 (memory) มี HEAD/hash ของ 13 ไฟล์ เป็นผลตรวจเดิม ไม่ได้อ่าน source นอกขอบเขตซ้ำในงานนี้
- [มติ 035 (เลือกตรวจกลุ่มฝั่ง server)](../../shared/decisions/decisions-035.md) แทนคำถาม JWT-only เดิม กรณีตรวจข้างต้นเป็นเกณฑ์ที่เอกสารเดิมยังไม่มีผลรัน ไม่อ้างว่า policy approval ปิด H5 หรือ technical proof
