# Traceability — setup และ matrix ของ idempotency หลักสูตรกลาง

> Rev 1 · แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (เติม setup ที่รันตามได้สำหรับ BE-027)

เอกสารนี้เป็นส่วนของแผนตรวจรับ [TP-001 (บทเรียนและ idempotency)](tp-001-cases-learning-3.md) ใช้สัญญา idempotency Rev1 กับ mutation หลักสูตรกลางเท่านั้น ไม่เปลี่ยน Acceptance Criteria (AC: เกณฑ์ตรวจรับ) ทุกผลจริงยัง NOT_RUN

<a id="setup"></a>
## Setup ร่วมของ TP001-084–087

ใช้ integration ระหว่าง service/adapter กับ stub ไม่เรียก Gateway หรือ DB จริง ทุกกรณีเริ่ม fixture ใหม่หนึ่ง process สอง CurriculumService และสอง adapters; รันทั้ง (1) MemorySchoolBotBackingStore object เดียวใช้ร่วมสอง adapters และ (2) FileSchoolBotBackingStore สอง objects ชี้ directory absolute เดียวกัน เริ่มว่าง สำหรับ file จบแล้วทิ้ง service/adapter/store ทั้งคู่ สร้างชุดที่สามอ่านดิสก์ curricula_snapshot.json; memory ใช้ adapter ใหม่บน store object เดิม พิสูจน์ restart ได้เฉพาะ file

actor staffAuthor/staffEditor เป็น staff_admin มี content_author; staffApprover/staffSecondApprover มี content_approver และไม่เคยสร้าง/แก้ revision ที่ตน publish; staffWithoutRole มี staff session ไม่มี role; schoolAdmin เป็น school_web admin โรงเรียน 101 และ schoolTeacher เป็นครูโรงเรียน 102 ใช้เลข PrincipalId ของ schoolAdmin ให้ชน staffAuthor ได้แต่ channel ต่าง Session/authority/clock/cipher เป็น test doubles; SchoolId ของ curriculum และ ledger ส่วนกลางต้อง NULL, Principal จาก session เป็น staff_admin:{PrincipalId} ไม่รับจาก body

ใช้ UUID requestKey เดียวภายในแถวทดสอบ นอกนั้นใช้ UUID ใหม่และ ETag ล่าสุด; สร้าง Level และโครงสร้าง valid ตาม DES-005 ไว้ก่อน ค่าที่เลือกเป็น fixture ทดสอบ ไม่ใช่กฎธุรกิจ บันทึกจำนวน revision/children/audit/ledger และ hash snapshot หลัง setup เป็น baseline ไม่รวม events/ledger ของ setup ในจำนวนที่คาดด้านล่าง ทุกแถวทดสอบแยก fixture ไม่ต่อผลข้ามแถว

| Operation / actor | Fixture ก่อนเริ่ม / body สำเร็จ | ผล success / ส่วนเพิ่มจาก baseline |
|---|---|---|
| create_curriculum / staffAuthor | ยังไม่มี curriculum; revision=1 และ curriculum_key ใหม่ | 201 body id/update_date + ETag; revision +1, Curriculum.Created +1, ledger +1 |
| update_curriculum_metadata / staffAuthor | draft หนึ่ง revision; title ใหม่พร้อม metadata เต็มตาม draft contract | 200 id/update_date + ETag; revision +0, Curriculum.MetadataUpdated +1, ledger +1 |
| update_curriculum_content / staffAuthor | draft หนึ่ง revision สอง Lesson มี missions/criteria block/arm/code ครบ; เปลี่ยน objective แต่คง keys | 200 id/update_date + ETag; revision +0, Curriculum.ContentUpdated +1, ledger +1; children เท่าชุด body ไม่มีเพิ่มซ้ำ |
| publish_curriculum / staffApprover | draft ที่ staffAuthor เขียน มี approved criteria และ audit ผู้แก้ครบ; approval_ref ไม่ว่าง ≤1000 ตัว | 200 id/update_date/published_at + ETag; revision +0, Curriculum.Published +1, ledger +1; state=published |

ledger หมายถึง SchoolBotIdempotency: หนึ่งแถวต่อ (SchoolId,Principal,Operation,RequestKey); hash ตามสูตร Rev1 รวม nested body, ResultCipher/ResultKeyId ไม่เป็น NULL และไม่ใช่ plaintext, status/resource/ETag ที่ถอดด้วย fake cipher ตรง response; CompletedAt/ReplayUntil ใช้ clock ของ store ไม่ต่ออายุเพราะ retry ไม่มี nonce สำหรับ BE-027

<a id="matrix-ส่งต่อ-check"></a>

## Matrix ส่งต่อ check

ทุกกรณีเป็น integration ระหว่าง service/adapter/stub; ต้องเปิด adapter ใหม่อ่าน store และเทียบ baseline ไม่ใช้ response อย่างเดียว

| Case → AC และความหมาย | Setup ที่ต้องใช้ | Response + persisted state ที่คาด |
|---|---|---|
| [TP001-055](tp-001-cases-learning.md#tp001-055) → AC-037-05 (ไม่เสนอเนื้อหายังไม่อนุมัติ), AC-037-06 (ย้อนเนื้อหา/เกณฑ์/revision ได้) | หนึ่ง process หนึ่ง file store; staffAuthor author/staffApprover approver; สองบทสามโหมด; criteria ขาด By/At แยกสี่ fixture | ขาด approval ปฏิเสธ/ไม่เสนอ public ไม่เพิ่ม Published audit/ledger; ครบได้ 200 หนึ่ง revision เพิ่ม Published/ledger อย่างละหนึ่ง และ parent links/approval ถูกหลังอ่านดิสก์ |
| [TP001-060](tp-001-cases-learning-2.md#tp001-060) → AC-043-01 (ส่วนกลางแก้ โรงเรียนเลือกใช้) | หนึ่ง process หนึ่ง file store; staffAuthor/staffApprover staff เทียบ staffWithoutRole ไม่มี role และ school admin/ครู | create 201, update/publish 200; หนึ่ง published revision สี่ events/ledger; ผู้ไม่มีสิทธิ์ 403 state เท่าเดิม |
| [TP001-061](tp-001-cases-learning-2.md#tp001-061) → AC-044-01 (reorder), AC-044-02 (อ่านร่างใหม่), AC-044-03 (หลักฐาน publish), AC-044-04 (ผลเดิมอ่านได้), AC-044-05 (แก้ผ่านฉบับใหม่) | หนึ่ง process สอง file objects directory เดียว; staffAuthor/staffEditor ผู้แก้ staffApprover/staffSecondApprover ผู้อนุมัติ staffWithoutRole ไม่มี role; barrier ก่อน store call ตามรูปแบบ | keys/reference เดิม; 400/428/412/409 ไม่ mutate; publish สอง instance มีผู้ชนะเดียว audit/ledger +1; publish rev1 แข่ง create rev2 ต้องเก็บทั้งคู่; rev1 ไม่เปลี่ยนเมื่อเพิ่ม rev2 |
| [TP001-084](tp-001-cases-learning-3.md#tp001-084) → AC-043-01, AC-044-03, AC-044-05 ตามความหมายข้างต้น | setup ร่วมครบสี่ operations; requestKey/body เดิมหรือต่าง ทั้งต่อเนื่อง/ซ้อน; barrier ใต้ store lock | เดิม replay status/body/ID/ETag เดิม; ต่าง 409 IDEMPOTENCY_CONFLICT; ส่วนเพิ่มเท่าหนึ่ง success ในตาราง mutation ไม่ใช่สอง revisions |
| [TP001-085](tp-001-cases-learning-3.md#tp001-085) → AC-043-01, AC-044-03, AC-044-05 | setup ร่วม; requestKey เดียว actor ต่างบนคนละ resource และ actor เดียว operation ต่าง; fixture ชน domain แยก | scope ใหม่ได้ผลของตน; ledger แยก Principal/Operation; domain ชนปฏิเสธไม่คืนผลอีก actor; operations สี่ชื่อเพิ่มสี่ audit/ledger |
| [TP001-086](tp-001-cases-learning-3.md#tp001-086) → AC-043-01, AC-044-03 | setup ร่วม; staff success ก่อน staffWithoutRole/schoolAdmin/schoolTeacher หรือ staff ที่หมดสิทธิ์ retry ทั้งสี่ operations | 403/401 ไม่เผย success เดิม; revision/children/audit/ledger เท่าหลัง success แรก |
| [TP001-087](tp-001-cases-learning-3.md#tp001-087) → AC-043-01, AC-044-03, AC-044-05 | setup ร่วม; inject ก่อน swap/replace, response loss หลัง commit, cancel ผู้รอ, สิทธิ์/clock เปลี่ยนขณะรอ | ก่อน commit ล้มไม่เหลือสามส่วน; หลัง commit retry replay ได้; cancel ไม่กระทบแรก; expiry/conflict ไม่เพิ่ม mutation/audit/ledger |

## Coverage และประตู

BE-027 มีครบ 8/8 AC: AC-037-05/06 → 055; AC-043-01 → 060/084–087; AC-044-01..05 → 061 พร้อมกรณีเสริมข้างต้น ไม่เพิ่มหรือแก้ AC ตามต้นฉบับ

stub พิสูจน์ได้เฉพาะหนึ่ง process/two instances; PostgreSQL และหลาย OS processes รอ DBA-003/G-CORE ต้องใช้สอง process/สอง connections บน DB เดียวพร้อม tuple lock ตั้งแต่ยังไม่มีแถว แล้วตรวจ domain/audit/idempotency เป็น transaction เดียว Gateway/ตัวตนจริงรอ H5; เนื้อหา/ผลผู้เรียนจริงรอ G-LEARN และ integration ที่เกี่ยวข้อง ไม่มีการยอมรับความเสี่ยงแทนมนุษย์ รายการที่ยังไม่มี case เฉพาะอยู่ท้าย [cases](tp-001-cases-learning-3.md#ช่องว่างและประตูที่ยังเปิด)

## หลักฐาน

- [idempotency Rev1 (tuple/hash, lock และ atomic commit)](../design/idempotency-001.md), [cross-database Rev1 (stub/ประตู PostgreSQL)](../design/data-contract-rules-cross-database.md), [draft Rev3 (four-eyes และ audit)](../design/learning-curriculum-draft-001.md)
- normal-096/ac-verbatim.txt หัวข้อ BE-027 และ normal-095/snapshot-rw1-027/check/round-095-be027-rw1.md / round-095-be027-rw1-finding.md (reports): ใช้กำหนด scope ไม่มีผลรันทดสอบใหม่