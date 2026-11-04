# TP-001 — เคส normal ของ release API (BE-018)

> Rev 1 · แก้ล่าสุด 2026-11-04 · แก้โดย inspect · ขอโดย ผู้ใช้ (จัดแผนตรวจ persistent release API)

เคสระดับ normal (happy flow + ผลปฏิเสธหลักของ AC) ผลจริงทุกเคส NOT_RUN · path ใช้ Q = /api/school-bot/service ของ Gateway ตามสัญญา gRPC Rev4

## Setup ร่วม

**L-R — Release ต่อจาก setup L**

- หนึ่ง host/หนึ่ง process มี services/adapters A และ B สองชุด; memory แชร์ store object เดียว ส่วน persistent/file ใช้ store objects คนละตัวชี้ canonical directory เดียวกันตาม setup L
- reader C เป็น service/adapter ใหม่; การตรวจ reopen ต้อง dispose A/B และ store objects เดิมทั้งหมด แล้วสร้างใหม่จาก persistent location เดิม ห้ามคัดลอกรายการ release กลับเข้า memory เพื่อทำให้ผ่าน
- memory ใช้ตรวจการมองเห็นข้าม adapter เท่านั้น **ไม่นับเป็นหลักฐาน restart persistence**
- เวลา fake UTC `2026-11-04T00:00:00Z`; ผู้จัดการ release เป็น central staff ที่มี `AdminId`; update check ไม่ต้อง login
- ใช้ trusted peer/identity doubles เฉพาะ harness; ไม่มี fault injection และไม่ติดต่อ artifact URL จริง
- ข้อมูลถูกต้องตั้งต้น: version `1.2.3`, channel `stable`, platform `windows-amd64`, URL `https://example.invalid/school-bot.exe`, SHA256 เป็น `a` จำนวน 64 ตัว และ signature `fixture-signature`
- ตรวจ state ผ่าน C ไม่ใช้ response/cache ของ writer แทนข้อมูลที่เก็บจริง

**U — Admin หลักสูตร**

- หนึ่ง host/หนึ่ง process มี browser context ของ author และ approver แยกกัน; service/adapters A/B และ reader C ใช้ topology memory/file ตาม L
- author เป็น `staff_admin` มี `content_author`; approver เป็นอีก principal มี `content_approver` และไม่เคยสร้างหรือแก้ revision ที่จะเผยแพร่
- โรงเรียน S1 มี License active; school admin เป็น `school_web`, `IsSchoolAdmin=true`; ผู้เรียนเป็น student ของ S1 ที่อยู่ใน roster
- ใช้ Level/subjects และ LessonInput/ActivityInput ที่ผ่าน validation ตาม DES-005; ข้อมูลทดสอบใช้ instruction activities จึงไม่เพิ่มเงื่อนไขประเมินภารกิจที่ไม่เกี่ยวข้อง
- mutation ส่ง `Idempotency-Key` UUID ใหม่; metadata/content/publish ส่ง `If-Match` ล่าสุดจาก server
- ไม่มี fault injection; ไม่ใช้ Google Sheet หรือ hardware จริง; อ่าน state ใหม่ผ่าน C หลังจบแต่ละช่วง
- UI ต้องใช้ implementation จริงของ FE-019 เมื่อมีแล้ว; API/component harness ที่ไม่มีหน้าจอจริงไม่นับเป็นผลตรวจ UI

**U-R — Revision และผลเดิม**

ต่อจาก U โดย seed published v1 ซึ่งมี Lesson A/B คนละ LessonKey, run ของ S1 ที่อ้าง v1 และผลผู้เรียนเดิมอย่างน้อยหนึ่งรายการ เก็บ baseline ของ v1, children, run, result และ snapshot ทั้งหมดก่อนเริ่ม

สำหรับ TP001-125 seed draft v2 ด้วย CurriculumKey เดิม แต่ resource ID ใหม่และ LessonKey A/B เดิม พร้อมประวัติ contributor ที่ถูกต้อง ส่วน TP001-127 เริ่มโดยยังไม่มี v2

**I — นำเข้า**

ใช้ supplied-row fixture และ setup จาก `tp-001-cases-quiz-grade-import.md` Rev2 และผลที่คาดจาก `des-005-import-state.md` Rev1:

- สามแถว D=true/false/null; แถวแรก C=6 แต่ชื่อแผนเป็น `Unit 7: How AI Learns`
- source identity และ LessonKey เป็น UUID ตาม manifest fixture ไม่สร้างจาก C/Unit/O/ตำแหน่ง
- แถวแรกมี supplied media refs ห้าค่า J/L/N/T/X
- baseline S0: Curriculum draft=1, Level=1; Lesson/Activity/Mission/audit/ledger=0
- baseline S1 หลังนำเข้าครั้งแรก: Lesson=3, Activity=3, audit=1, ledger=1
- raw-to-normalized mapping ของ fixture เป็น **สมมติฐานทดสอบ ยังไม่ยืนยันเป็น mapping เนื้อหาจริง**

<a id="tp001-121"></a>
## TP001-121 — สร้าง draft และกัน tuple ซ้ำข้าม reader ใหม่

- **ระดับ:** normal
- **อ้างอิง:** BE-018; AC-029-01; BR-029-01; Gateway–gRPC contract Rev4
- **ระดับการตรวจ:** integration ระหว่าง service/store และ HTTP↔RPC
- **Setup:** L-R; release catalog ว่าง แยก memory/persistent รอบละ store สะอาด
- **ขั้นตอน:** A เรียก `POST Q/admin/releases` ด้วยข้อมูลถูกต้อง; B เรียก `GET Q/admin/releases`; รอบ persistent ให้ reopen แล้วสร้าง tuple version/channel/platform เดิมอีกครั้งด้วย C
- **Response:** create ได้ 201 พร้อม ID และ `published=false`; list ได้ 200 พบข้อมูลตรง create; create ซ้ำได้ 409 `RELEASE_EXISTS`
- **Persisted state:** มี release หนึ่งรายการ ID/metadata เดิมและยังไม่ published ทั้งก่อนและหลัง reopen; คำขอซ้ำไม่เพิ่มหรือแก้ release
- **ส่วน full:** แข่งสร้าง tuple เดียวกันสอง writer; ตัด response หลัง commit; ทดสอบความไม่ซ้ำข้าม process บน store ร่วม — AC-029-01

<a id="tp001-122"></a>
## TP001-122 — ปฏิเสธ metadata ผิดตามข้อกำหนด

- **ระดับ:** normal
- **อ้างอิง:** BE-018; AC-029-02; BR-029-01/02; Gateway–gRPC contract Rev4
- **ระดับการตรวจ:** unit แบบ parameterized และ integration สำหรับ error mapping
- **Setup:** L-R; แต่ละแถวเริ่มจาก catalog ว่างและแก้เพียง field เดียวจากข้อมูลถูกต้อง
- **ขั้นตอน:** ส่ง `POST Q/admin/releases` แยกกรณีต่อไปนี้

| Field | ค่า | Response |
|---|---|---|
| version | `1.2` | 400 `INVALID_RELEASE` |
| platform | `linux-amd64` | 400 `INVALID_RELEASE` |
| URL | `http://example.invalid/a.exe` | 400 `INVALID_ARTIFACT` |
| URL | `https://user:secret@example.invalid/a.exe` | 400 `INVALID_ARTIFACT` |
| SHA256 | `g` จำนวน 64 ตัว | 400 `INVALID_ARTIFACT` |
| signature | string ว่าง | 400 `INVALID_ARTIFACT` |

- **Persisted state:** reader C พบ catalog ว่างทุกกรณี; persistent reopen แล้วยังว่าง ไม่มี partial release
- **ส่วน full:** version มี leading zero/newline/overflow; hash 63/65 ตัว; URL/signature ที่ขอบความยาว; null/malformed/unknown fields — AC-029-02

<a id="tp001-123"></a>
## TP001-123 — Publish คงอยู่และ check เลือก version ถูกต้อง

- **ระดับ:** normal
- **อ้างอิง:** BE-018; AC-029-03; BR-029-03; Gateway–gRPC contract Rev4
- **ระดับการตรวจ:** integration
- **Setup:** L-R; สร้างผ่าน API แล้ว publish `1.2.0`, `1.9.0`, `1.10.0` สำหรับ stable/windows-amd64; คง `2.0.0` ของ tuple นี้เป็น draft เพิ่ม published `9.0.0` สำหรับ beta/windows-amd64 และ stable/darwin-arm64
- **ขั้นตอน:** ใช้ `POST Q/admin/releases/{id}/publish`; จาก B เรียก `GET Q/updates/check` สำหรับ stable/windows-amd64 ด้วย current version `1.0.0`, `1.10.0`, `3.0.0` และทำซ้ำหลัง persistent reopen
- **Response:** publish ได้ 200 และ `published=true`; current `1.0.0` ได้ `available=true`, release=`1.10.0`; อีกสองค่ามี `available=false`, `release=null`; `install_supported=false` ทุกครั้ง
- **Persisted state:** release ทั้งเจ็ดรายการและสถานะเดิมคงอยู่หลัง reopen; การ check ไม่เปลี่ยน catalog ไม่ดาวน์โหลดหรือ execute artifact
- **ส่วน full:** publish แข่งกับ check; query ผิดรูป/ว่าง; store failure; อ่านข้าม host ที่ใช้ฐานเดียวกัน — AC-029-03

## หลักฐาน

- [ตาราง normal แยกตาม task](tp-001-normal-index.md) · [สัญญา Gateway–gRPC Rev4](../design/gateway-grpc-contract-001.md) · [DES-005 import state](../design/des-005-import-state.md)
