# SchoolBot — Security review

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

DPO คือ Data Protection Officer; BFF คือ Backend for Frontend; CSRF คือ Cross-Site Request Forgery; CVE คือ รหัสอ้างอิงช่องโหว่ที่ทราบแล้ว.

## ขอบเขตปัจจุบันและสรุป

มีข้อค้นพบ 19 ข้อ: เปิด Important 6, Medium 6 และ Minor 4; ปิดเฉพาะ local 3 ข้อ. ไม่พบ Critical ตามผลที่บันทึก. Important ยังขวางส่วนที่เกี่ยวข้องจนแก้และ จป. ตรวจซ้ำ หรือผู้ใช้รับความเสี่ยงเป็นลายลักษณ์อักษร.

Desktop/Web → HTTP API Gateway (sb-api-gateway) → SchoolBot gRPC service; browser ผ่าน same-origin Backend for Frontend (BFF) ไม่มี HTTP relay หรือ direct public service fallback. คง introspection ผ่าน Gateway, opaque session, Channel/License และ device binding. HTTP Login เดิมของ Gateway กับ decoder เป็นอีกขอบเขต ไม่สั่ง rewrite ตาม transport. cType ไม่ใช่สิทธิ์ admin หรือหลักฐาน AccountId=ProfileId; แหล่ง admin ใช้ [มติ 035 (แหล่งสิทธิ์แอดมินโรงเรียน)](requirement/decisions-035.md).

ผล local logout ไม่ปิด Login, route/env/network/trust ระหว่างระบบ, TLS/peer, production registration, full private build, DB หรือ BFF CSRF. งานนี้จัดเอกสาร ไม่ตรวจ source ใหม่ ไม่เปลี่ยนเกณฑ์หรือรับรอง release.

## ตารางข้อค้นพบทุกข้อ

| ID | เรื่อง | ความรุนแรง | สถานะวันนี้ | ใครต้องทำ |
|---|---|---|---|---|
| [SEC001-001](security-findings-01.md) | การแลก token เว็บยังไม่แยกชนิดอย่างปลอดภัย | Important | เปิด | be/เจ้าของ Gateway |
| [SEC001-002](security-findings-02.md) | credential DB เดิมกว้างเกินขอบเขตบริการ | Important | เปิด | arch/be/ผู้ใช้ (DB) |
| [SEC001-003](security-findings-03.md) | update trust และ signing ยังต้องพิสูจน์ | Important | เปิด | be/arch/ผู้ใช้ (release) |
| [SEC001-004](security-findings-04.md) | Desktop ขาด host entitlement gate | Important | เปิด | be |
| [SEC001-005](security-findings-04.md) | device binding คัดลอกได้และขาด unbind | Important | เปิด | be |
| [SEC001-006](security-findings-05.md) | custody ของ signing key ยังไม่ชัด | Important | เปิด | arch/ผู้ใช้ (custody; License พัก) |
| [SEC001-007](security-findings-05.md) | admin bearer ร่วมไม่มี throttle/audit | Medium | เปิด | be/ผู้ใช้ (infra) |
| [SEC001-008](security-findings-06.md) | release อาจฝัง localhost URL | Medium | เปิด | be |
| [SEC001-009](security-findings-07.md) | replay เก็บ license key ที่ถอดรหัสได้ | Medium | เปิด | sa/be |
| [SEC001-010](security-findings-08.md) | inventory/retention ข้อมูลนักเรียนยังไม่ครบ | Medium | เปิด | arch/vault/ผู้ใช้ (DPO) |
| [SEC001-011](security-findings-08.md) | ยังไม่ยืนยันการแยก LegacyWebJwt secret | Medium | เปิด | ผู้ใช้ (Gateway/infra) |
| [SEC001-012](security-findings-09.md) | proxy/TLS และ rate limit ยังต้องพิสูจน์ | Medium | เปิด | be/ผู้ใช้ (infra) |
| [SEC001-013](security-findings-09.md) | log header อาจมีรหัสโรงเรียนและผู้ใช้ | Minor | เปิด | เจ้าของ Gateway |
| [SEC001-014](security-findings-09.md) | PIN คงที่ทำให้เข้าใจว่าควบคุมสิทธิ์ได้ | Minor | เปิด | fe |
| [SEC001-015](security-findings-10.md) | vendored dependency ขาด upstream hash | Minor | เปิด | be |
| [SEC040-001](security-findings-10.md) | public logout ทำงาน DB ไม่ bounded | Medium | ปิดเฉพาะ local per-process | be |
| [SEC001-016](security-findings-10.md) | รายละเอียด upstream รั่วผ่าน log ของ gRPC dependency | Important | ปิดเฉพาะ local logout | sys ของ Gateway |
| [SEC001-017](security-findings-10.md) | early upstream deadline ตอบ 504 แทน 502 | Minor | ปิดเฉพาะ local early deadline | sys ของ Gateway |
| [SEC094-001](security-findings-10.md) | helper อนุญาต publish เมื่อ authorPrincipalId ขาด | Minor | เปิด | be |

ผู้ใช้ประสานเจ้าของตามวงเล็บ; ตอบสถานะ ห้ามส่ง secret/credential. เรื่อง License signer/custody พักตาม [มติ 047 (พักเรื่องกุญแจเซ็น License)](requirement/decisions-047.md) ไม่ถามซ้ำ แต่เงื่อนไขก่อนใช้กุญแจจริงยังเปิด.

## Accepted risks

ยอมรับเฉพาะ token เว็บไม่มี exp และ revoke รายตัวไม่ได้ตาม [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](requirement/decisions-025.md) ไม่ครอบ finding อื่น. [ขอบเขตและข้อจำกัด](security-accepted-risks.md).

## Personal data flows

[เส้นทางข้อมูลและ compliance](security-data-flows.md) ครอบ credentials, Project, คะแนน, log และเรื่องที่ DPO ต้องตัดสิน. [สถานะ compliance](security-compliance.md) ยังไม่รับรอง PDPA/GDPR/CVE/licenses ทั้งระบบ.

## รายละเอียดข้อค้นพบ

เปิด ID ในตารางเพื่ออ่านผลกระทบ วิธีแก้ และเงื่อนไขตรวจซ้ำ; [controls ที่ตรวจ](security-controls.md) แยก static observations เดิมจากข้อเท็จจริงที่ตรวจเพิ่ม.

## ประวัติการตรวจ

| วันที่ | ตรวจอะไร | ผล |
|---|---|---|
| 2026-10-23 | static review ระบบ/manifests | เพิ่ม 15 ข้อ; Important 6 เปิด |
| 2026-10-23 | mitigation 5 ข้อ | ปรับเงื่อนไขแก้; ไม่ปิด finding |
| 2026-10-24 | local logout/rate limit | ปิด SEC040-001 เฉพาะ per-process |
| 2026-10-24 | แบบ mitigation/inventory | แบบคืบหน้า; Important 6 เปิด |
| 2026-10-26 | log/deadline ของ logout | เพิ่ม SEC001-016, SEC001-017 |
| 2026-10-26 | ตรวจการแก้ log/deadline | SEC001-016 เปิด; SEC001-017 ปิด local |
| 2026-10-28 | controller/module-owned channel | SEC001-016 ปิด local; regression ผ่าน |
| 2026-10-29 | security review 10 เกณฑ์ | ไม่มี finding ใหม่; Important 6 เปิด |
| 2026-10-29 | authorization หลักสูตร | เพิ่ม SEC094-001 Minor |

## ยังไม่ยืนยัน

ยังต้องได้หลักฐาน deployment, DB privileges, signing custody/pins, retention/ฐานกฎหมาย, GDPR applicability และ CVE/licenses ตามแต่ละข้อ. ไม่ใช้ dev approval หรือ local proof แทนหลักฐานเหล่านี้.

## หลักฐาน

- [ผลตรวจและข้อจำกัดรายครั้ง](security-review-evidence.md) เก็บตัวเลขการตรวจและ revision ที่ตรึงไว้.

- ต้นฉบับก่อนเรียบเรียง: git history ของ security.md
- planning/security-mitigation-001.md; planning/security-gap-sync-review-001.md (memory)
- planning/jpo-090-gateway-r1-001.md; planning/jpo-091-gateway-r2-001.md; planning/jpo-092-logout-r4-001.md (memory)
- design/security-review-093-001.md; design/security-review-093-evidence-001.md; design/security-review-093-compliance-001.md (memory)
- planning/jpo-094-BE-039-001.md (memory)
