# สถานะ compliance และข้อมูลที่ยังต้องยืนยัน

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PII คือข้อมูลที่ระบุตัวบุคคลได้; CVE คือรหัสอ้างอิงช่องโหว่ที่ทราบแล้ว; ACL คือ Access Control List; BFF คือ Backend for Frontend.

## Compliance ที่ยังต้องครบ

inventory ตั้งต้นครอบ 13 ตารางข้อมูลเด็ก, free-text, jsonb ผลประเมิน, DeviceJkt/ResultCipher และ Session.ExpiresAt โดย expiry ไม่เท่ากับ deletion. ยังต้องครอบ legacy/local files/logs พร้อม masking/encryption/access/retention และลบ/ส่งออกรายคนตาม [SEC001-010 (inventory/retention ข้อมูลนักเรียนยังไม่ครบ)](security-findings-08.md). Generated record ToString มี raw Token แต่ไม่มี log sink/caller เป็นข้อระวังในข้อเดิม.

หลักฐานฐานข้อมูลที่ส่งต่อแก้จาก raw hash prefix เป็นป้ายประเภทคงที่ใน DB พร้อม complementary suppression แล้ว ถอนคำรับรองปลอด PII 100% และต้องตรวจ literal ก่อนส่ง DDL.

ยังไม่รับรอง PDPA (Personal Data Protection Act) หรือ GDPR (General Data Protection Regulation). การตรวจ 2026-10-29 อ่าน PDPA เฉพาะส่วนจากแหล่งราชการ; ยังตัดสิน GDPR applicability ตาม Article 3 ไม่ได้. เจ้าของกฎหมายหรือ DPO (Data Protection Officer) ต้องตัดสินฐานประมวลผลข้อมูลผู้เยาว์, retention ของ Submission/Attempt/Session/Audit/Project, hosting และการส่งข้ามประเทศ.

[ผลตรวจ dependency licenses](security-controls.md) มี MIT/Apache-2.0/OFL-1.1/MPL-2.0 และ notice HIDAPI/nlohmann ตามฐานเดิม ยังไม่มี sign-off ทั้งหมด.


## ยังไม่ยืนยัน

- CVE/advisory ของ wails v3.0.0-beta.30 (pre-release), x/sys, Go 1.25 toolchain, react 19.3.1, blockly 13.4.0, phaser 4.2.1, vite 8.3.4, .NET 10 runtime ที่ใช้จริง และ NuGet/npm อื่น — WebFetch/WebSearch ไม่ได้รับสิทธิ์ในการตรวจแรก และไม่ได้รัน npm audit/govulncheck/dotnet list package --vulnerable จึงไม่ประกาศว่ามีหรือไม่มีช่องโหว่
- สถานะกฎหมายปัจจุบัน (PDPA/GDPR) และข้อกำหนดเฉพาะของผู้เยาว์/ข้ามประเทศ — การตรวจแรกไม่ได้ตรวจแหล่งทางการ; การตรวจ 2026-10-29 อ่าน PDPA เฉพาะส่วน จึงยังไม่ประกาศ compliant หรือไม่
- การ deploy จริง: ว่ามี instance ของ API ที่เข้าถึงได้หรือไม่, ค่า env, proxy/TLS, ที่ตั้ง hosting, secret store
- ผลของ Wails service binding ว่าเปิด method ใดให้ webview บ้างและพฤติกรรมของ -tags production (ไม่ได้รันหรืออ่าน runtime)
- ความปลอดภัยของ C++ engine, demo-engine และการ execute ของ Code/Block Lab (ไม่ได้อ่าน source)
- ACL จริงของไฟล์ใน config dir บน Windows และสถานะ signing ของ binary/installer จริง
- source ของ sb-tech-upgrade-web-system (auth-headers, BFF) และ sb-tech-upgrade-academic (credential/profile) ที่ [DES-012 (Auth ข้ามระบบ)](design/des-012.md) และ [DES-004 (ตัวตนและสิทธิ์ SchoolBot)](design/des-004.md) อ้างถึง — ใช้ตามที่เอกสารบันทึกเท่านั้น
- go.sum, license ของ Go modules ทั้งหมด, ผล scripts/check-notices.mjs, และผล dotnet/go/npm test (ไม่ได้รัน)
- ไม่ได้ทดสอบ rate limit, admin brute force หรือ replay กับ instance จริง (static review ไม่เท่ากับ pentest)

## หลักฐาน

- planning/security-gap-sync-review-001.md (memory)
- design/security-review-093-compliance-001.md (memory)
- planning/jpo-094-BE-039-001.md (memory)
