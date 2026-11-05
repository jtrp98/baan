# UX-013 — ส่งตารางสอนเข้าระบบตารางสอนหลัก (ปุ่ม "ใช้งานตารางสอน") (UX-013)

> ไฟล์ต่อ artifact (งบไม่กำหนดใน des-014 — คงกระชับ) · เขียนโดย `uxui-designer` · Status `draft` เท่านั้น

- **Status:** signed  <!-- บันทึกตามคำตอบจริงของ jtrp98 ไม่ใช่ agent เซ็นเอง -->
- **Signed by:** jtrp98 · **Signed on:** 2026-10-11 (ขอบเขต = ร่างปัจจุบัน; ไม่ใช่ owner/schema approval; ดู Sign-off)
- **Traces:** REQ-019, AC-047..AC-049, AC-052, AC-053, DES-016
- **Sources:** current `src/app/[locale]/timetable/[year]/page.tsx` (รายการตาราง/toggle), `src/app/[locale]/timetable/page.tsx` (hub ปี/เทอม), `../design/des-016.md`, `../../../../build/plan/timetableai--ux-013.md`, `data-model.md` §27.6 และ plan Waiting on Human

## User Flow

1. **จุดเข้าและเงื่อนไขการส่ง (`/timetable/[year]` — รายการตารางของปี/เทอมตาม task):**
   - ที่หน้ารายการตารางสอน ผู้ใช้สามารถเลือกตารางสอนที่ต้องการส่งเข้าสู่ระบบหลัก (`/academic`)
   - **เงื่อนไขเบื้องต้น (Gate `isActive` — AC-047, BR-58):**
     - เฉพาะตารางที่มีสถานะ `isActive = true` (เปิดใช้งาน) เท่านั้นที่สามารถส่งได้
     - ตารางที่ `isActive = false` ปุ่ม "ใช้งานตารางสอน" จะอยู่ในสถานะ Disabled พร้อม Tooltip: "ต้องเปิดใช้งานตารางสอนก่อนจึงจะสามารถส่งข้อมูลได้"
   - ผู้ใช้สามารถเลือกติ๊กตารางได้มากกว่า 1 ชุดพร้อมกัน (AC-053, BR-60)
   - ผู้ใช้กดปุ่ม **"ใช้งานตารางสอน" (Push to Academic)**

2. **ขั้นตอนการตรวจสอบก่อนส่ง (Preview Flow — AC-049, BR-61):**
   - Modal แสดงขึ้นมา: ร่างกำหนด Preview แบบอ่านอย่างเดียวของข้อมูลทั้งหมดที่จะถูกแทนที่ราย (ห้องเรียน, เทอม) ตามข้อเสนอ DES-016 §41.4a; ไม่ใช้ GET by-room ปัจจุบันเป็นหลักฐานว่าปลายทางว่างหรือครบ
   - **กรณีพบห้องเรียนชนกันข้ามตาราง (`ClassInMultipleTimetables` / BR-60):**
     - หากเลือกตาราง \(\ge 2\) ชุดที่ครอบคู่ (ห้องเรียน, เทอม) เดียวกัน ทำเครื่องหมาย NotSendable ที่คู่นั้นพร้อมรายชื่อตาราง: "ห้องนี้ในภาคเรียนนี้อยู่ในหลายตาราง กรุณาเลือกเพียงชุดเดียวสำหรับคู่นี้"; คู่อื่นส่งได้ตาม BR-60 ไม่บล็อกทั้ง batch และไม่เลือกชุดให้เอง
   - **กรณีพบข้อมูลเดิมในระบบปลายทาง (Overwrite Warning — AC-049):**
     - แสดงจำนวนแถวเดิมที่จะถูกแทนที่รายห้องเรียน
     - แสดงแถบเตือนสีส้มเข้ม: "ระบบจะแทนที่ตารางสอนเดิมทั้งหมดในระบบวิชาการหลักสำหรับห้องเรียนที่เลือก"
     - ผู้ใช้ต้องติ๊กเครื่องหมายถูก: `[ ] ข้าพเจ้ารับทราบว่าข้อมูลตารางสอนเดิมในระบบหลักจะถูกเขียนทับทั้งหมด`
   - ผู้ใช้กดปุ่ม **"ยืนยันและส่งข้อมูล (Apply)"**

3. **ขั้นตอนการส่งข้อมูลและการติดตามสถานะ (Push Execution & Progress):**
   - ร่างเสนอ Browser Orchestration (A) ทีละคู่ (ห้องเรียน, เทอม) ผ่าน Gateway; ตำแหน่ง orchestrate/owner/T1 ยัง conditional ตามหัวข้อ gates ด้านล่าง ไม่ถือประวัติปิด gate ที่ขัด provenance เป็น approval
   - แสดง Progress bar จากจำนวนคู่ที่ได้ผลยืนยันจริง พร้อมสถานะรายคู่:
     - ห้องเรียนที่ส่งสำเร็จ: แสดงเครื่องหมายถูกสีเขียว (Sent) เฉพาะเมื่อ receipt ของปลายทางยืนยัน commit จริง
     - ผลอื่นแสดงชื่อสถานะและเหตุจริงครบ: Rejected / Failed / Partial / NotSendable พร้อม lstInvalidRows; Partial ต่อคู่จาก T2 เป็นประวัติทางเลือก ไม่อนุมัติให้ใช้ T2 แทน T1

4. **สรุปผลลัพธ์และการส่งซ้ำ (Result Modal — AC-048):**
   - เมื่อเสร็จสิ้น แสดงผลลัพธ์จริงรายห้องเรียนอย่างโปร่งใส (ไม่มี Silent failure)
   - สำหรับคู่ที่ยืนยันว่าล้ม มีปุ่ม **"ส่งซ้ำเฉพาะรายการที่ล้มเหลว (Retry Failed)"** หลัง Preview/Confirm ใหม่; ถ้ายังไม่ทราบผลส่งให้กู้ผลเดิมก่อน และถ้าส่งสำเร็จแต่บันทึกผลล้มให้กู้เฉพาะการบันทึกผล ไม่ส่งเข้า Academic ซ้ำ
   - ร่างต้องบันทึกผลรายคู่ผ่าน `SetAcademicSyncResult` เมื่อ schema/owner contract พร้อม; ผลการส่งและผลบันทึกเป็นคนละ transaction ไม่ถือว่าเกิดแล้วอัตโนมัติ

## States

| State | ผู้ใช้เห็นอะไร | ข้อความ (copy) |
|---|---|---|
| loading (preview) | Spinner ใน Modal กำลังตรวจสอบข้อมูลปลายทาง | กำลังตรวจสอบข้อมูลตารางสอนเดิมในระบบวิชาการหลัก… |
| loading (pushing) | Progress bar แสดงความคืบหน้า (เช่น 3/5 ห้องเรียน) | กำลังส่งข้อมูลตารางสอนเข้าระบบหลัก กรุณาอย่าปิดหน้านี้… |
| blocked (`ClassInMultipleTimetables`) | แถบสีแดงระบุห้องเรียนที่ซ้ำซ้อน | ไม่สามารถส่งข้อมูลได้: ห้อง {className} ปรากฏอยู่ในตารางสอนมากกว่า 1 ชุดที่เลือก |
| warning (overwrite) | กล่องเตือนสีส้มพร้อม checkbox ยืนยัน | ระบบจะแทนที่ข้อมูลเดิมทั้งหมด ({rowCount} คาบ) ในระบบหลัก |
| partial / failed | Modal สรุปผลพร้อมรายชื่อห้องที่ล้มเหลว | ส่งข้อมูลสำเร็จ {success}/{total} ห้องเรียน (พบข้อผิดพลาด {fail} ห้องเรียน) |
| success | Modal แสดงไอคอนสำเร็จสีเขียว | ส่งข้อมูลตารางสอนเข้าระบบวิชาการหลักสำเร็จเรียบร้อยแล้ว |
| disabled (`!isActive`) | ปุ่ม Disabled พร้อม Tooltip | สามารถส่งได้เฉพาะตารางสอนที่เปิดใช้งานอยู่เท่านั้น |

## Layout & Interaction

- **Action Button:** ปุ่ม "ใช้งานตารางสอน" ใช้ Success token `#289A2D` หรือ Web Primary `#09C6DD` ตาม component กลาง (ไม่สร้างสีใหม่) อยู่ที่ Action bar หน้ารายการตารางสอน
- **Modal Preview (ขนาด 700px — สมมติฐาน layout ยังไม่ยืนยัน):**
  - แสดงตารางสรุป: คอลัมน์ ห้องเรียน, จำนวนคาบที่จะส่ง, สถานะเดิมในระบบหลัก, ผลการตรวจสอบ
  - ช่อง Checkbox รับทราบการแทนที่ข้อมูล
- **Progress Panel:**
  - แสดงสถานะเป็น Stepper หรือ Progress bar ชัดเจนระหว่างการส่งทีละห้อง

## Accessibility

- Focus trap ใน Modal ระหว่างการส่ง
- Progress bar มี `role="progressbar"` พร้อม `aria-valuenow` และ `aria-valuemax`
- ข้อความแจ้งเตือนความล้มเหลวอ่านออกเสียงผ่าน `aria-live="assertive"`
- รองรับการใช้งาน Keyboard ควบคุม Checkbox และปุ่มยืนยัน

## Open Decisions

| # | ต้องตัดสินอะไร | ตัวเลือก | ผู้ตัดสิน |
|---|---|---|---|
| 1 | เมื่อส่งตารางสอนสำเร็จ ควรมีปุ่มทางลัด (Deep Link) พากระโดดไปยังหน้าระบบ `/academic` เพื่อตรวจสอบผลทันทีหรือไม่ | (ก) มีปุ่ม "เปิดดูในระบบวิชาการหลัก" เฉพาะเมื่อ owner ยืนยัน URL/สิทธิ์แล้ว (เปิดแท็บใหม่) / (ข) "เสร็จสิ้น" ปิด Modal (แนะนำใน draft ปัจจุบัน เพราะยังไม่มี deep-link contract) | jtrp98 / 2026-10-11 — ปิด: เลือก (ข) |

### คำตัดสิน OD-1 — jtrp98 2026-10-11

- คำตอบจริง: มีปุ่ม “เสร็จสิ้น” เพื่อปิดหน้าต่าง (แนะนำ เพราะยังไม่มีสัญญา URL ปลายทาง)
- ผล: หลังส่งสำเร็จใช้ปุ่ม “เสร็จสิ้น” ปิด Modal; ไม่เพิ่มปุ่ม deep link ไป /academic ในขอบเขตนี้
- who/when ตามผู้ใช้ระบุ: `jtrp98 / 2026-10-11`; บันทึกคำตัดสินของมนุษย์ เฉพาะ OD-1 ไม่ขยายเป็น schema/owner/security/DDL/deploy/release approval. ข้อความใน Sign-off และ Change Log เดิมเป็นประวัติก่อนคำตอบนี้.

### Contract gates / payload และ states ที่รอเซ็น

**ข้อมูลสำคัญที่ยัง conditional:** plan Waiting on Human #5 และ data-model §27.6 ง correction ระบุว่ายังไม่มี human schema/default/transaction-owner confirmation ที่ใช้ได้; archive:2717 เป็นการไม่มีคำตอบแล้วใช้ข้อเสนอเอง. SA แก้ active claims แล้ว และร่าง concrete pure-preview/atomic replacement ใน DES-016 §41.4a; owner checklist อยู่หัวข้อเดียวกัน ทั้งหมดเป็น proposal ที่ยังไม่ผ่าน human/owner confirmation. ร่าง technical เสนอ `POST /service-academic/timetables/replace-by-room/preview` และ `POST /service-academic/timetables/replace-by-room` แต่ไม่แสดงชื่อ endpoint/implementation fields ใน user flow. UX นี้ไม่สร้าง contract เพิ่ม ไม่ใช้ import/upsert/delete รายแถวแทน atomic และไม่เปิดส่งจริงจาก UX sign-off.

- **AC047/053:** อ่าน snapshot ของตารางที่บันทึกแล้วเป็นแหล่งเดียว; เลือก active หลายชุดปีเดียวกันไม่จำกัดจำนวน. แท็บใช้งาน/ไม่ใช้งานยังเดิม. ปุ่มการส่งไม่ใช่ toggle isActive; ก่อน Apply อ่าน active ล่าสุด, school/term/teacher-course data ต้องส่งได้. ปิด active หลังส่งไม่ถอนข้อมูล academic. BR60 คู่ซ้ำแสดงทุกตารางที่ครอบคู่และให้คนเลือกหนึ่งชุดสำหรับคู่นั้น; ไม่ merge/เลือกล่าสุดเอง; คู่อื่นยังเดินต่อได้.
- **AC049:** Preview ต้องอ่าน replacement scope ครบแบบไม่มี mutation ตาม pure-preview proposal §41.4a; ID fingerprint เดิมคงอยู่และ revision guard เป็นข้อเสนอ owner ที่ต้องยืนยัน ไม่ใช้ GET by-room ที่ filter/soft-delete เป็น authoritative preview; แสดงปี/เทอม/ห้อง/จำนวนแถวที่จะถูกแทนที่รวมแถวที่สร้างใน academic เอง. ยืนยันเขียนทับทุกครั้งที่มีแถว รวม retry. Apply ตรวจ fingerprint ซ้ำ; DestinationChanged คู่ใดไม่ส่งคู่นั้น ต้อง Preview ใหม่. เปลี่ยนชุดเลือก/context หลัง Preview ล้างผลและยืนยันเดิม; ไม่อ่านกลับเนื้อตาราง academic มาปรับ snapshot.
- **AC052:** `calculate=true` เสมอเป็นธุรกิจยืนยันแล้ว. วันที่/planeId/roomId/teacherIds และ default/null ของฟิลด์ที่ไม่มีข้อมูลใช้ §41.7 **ในฐานะข้อเสนอ SA รอ owner** เท่านั้น; draft summary "ส่งจากตารางที่บันทึกไว้ ใช้ calculate=true; ฟิลด์เพิ่มเติมใช้ค่าตามสัญญาที่เจ้าของยืนยัน". ไม่มี form ให้เดาเวลาเช็คชื่อ/ค่า null/สร้าง payload ใหม่. Source ที่ SA ตรวจพบ null/empty attendance → 00:00 และ timeLate → 0 ไม่ใช่ school default; owner/attendance ต้องยืนยัน semantics/default ต่อ field. Academic Rooms ใช้ Tclasses.SClassId จึงยังต้อง owner ยืนยัน TRoom↔Tclasses room mapping ไม่ cast key หรืออ้างว่า import ปัจจุบันรองรับครบ/แทนที่ atomic.
- **AC048:** แสดงผลครบทุกคู่จริงรวม lstInvalidRows และ reason; ไม่ใช้ HTTP200 หรือ progressถึง100 เป็น success. ไม่มี atomic ข้ามคู่; ไม่ rollback คู่ Sent. Retry เฉพาะคู่ที่มีหลักฐานล้มและส่งได้หลัง Preview/Confirm ใหม่; ไม่ retryอัตโนมัติ ไม่ส่งคู่ Sent ซ้ำเอง และไม่ส่ง NotSendable โดยไม่แก้สาเหตุ. ถ้าปิดหน้า/timeout แล้วไม่ทราบว่า request commit หรือไม่ แสดงการรับรู้ "ยังยืนยันผลการส่งไม่ได้" แยกจาก persisted status; ไม่ตั้ง Sent/Failed จากการเดา. เมื่อ owner ยืนยัน receipt/replay recovery ตาม §41.4a แล้วจึงกู้ผล request เดิมโดยไม่ทำ replace ใหม่; ห้ามเปลี่ยน key/payload แล้วส่งซ้ำเงียบ.

| State / reason | ผู้ใช้เห็นอะไร | Copy draft / วิธีแก้ |
|---|---|---|
| empty (ไม่มีตาราง/ไม่มี active) | label ไม่มี CTA ของ empty; ยังไม่เริ่ม Preview | "ยังไม่มีตารางที่ส่งได้ในบริบทนี้" / "มีตารางแต่ยังไม่มีตารางที่เปิดใช้งาน" |
| no selection | ปุ่มเริ่มส่งปิดจนเลือก active | "เลือกตารางสอนที่ต้องการส่ง" |
| loading snapshot/Preview | Spinner; Applyปิด, context ที่ตรวจเห็นชัด | "กำลังตรวจตารางที่เลือกและข้อมูลปลายทาง…" |
| error Preview/status/shape | ห้ามใช้ emptyแทนข้อมูลล้ม; ไม่มี Applyด้วย fingerprintที่ไม่ครบ | "ตรวจข้อมูลปลายทางไม่สำเร็จ กรุณาตรวจใหม่ก่อนยืนยันส่ง" |
| NotSendable NotActive/NoTerm | ระบุคู่และเหตุ, ไม่เดาเทอม/ไม่เปิด activeแทนคน | "ตารางนี้ยังไม่เปิดใช้งาน" / "ไม่พบเทอมที่ใช้ส่งตาราง กรุณาตรวจบริบท" |
| NotSendable MissingTeacherOrCourse/SchoolMismatch | แสดง lstInvalidRows/เซลล์ที่ขาด; ไม่ข้ามแถวแล้วอ้างส่งทั้งคู่ | "ข้อมูลครูหรือวิชาไม่ครบ กรุณาแก้ตารางและบันทึกก่อนส่ง" / "ตารางไม่ใช่ของโรงเรียนปัจจุบัน จึงส่งไม่ได้" |
| NotSendable ClassInMultipleTimetables | ทุกชื่อตารางครอบคู่แสดงพร้อม (ห้อง/เทอม) | "เลือกหนึ่งตารางสำหรับห้อง {ห้อง} ภาคเรียน {เทอม}; คู่อื่นยังส่งได้" |
| DestinationChanged | คู่นั้นหยุด; ผลคู่ Sent อื่นยังคง | "ข้อมูลปลายทางของห้อง {ห้อง} ภาคเรียน {เทอม} เปลี่ยนแล้ว กรุณาตรวจและยืนยันใหม่" |
| Sent | receipt ยืนยัน commit จริงต่อคู่ แล้วจึงแสดงชื่อ/เทอม; progress/HTTP เพียงอย่างเดียวไม่พอ | "ส่งห้อง {ห้อง} ภาคเรียน {เทอม} สำเร็จ" |
| Rejected | validation400/ผลรายแถวจริง; ไม่เสนอ retryโดยยังไม่แก้ | "ปลายทางปฏิเสธข้อมูล ตรวจรายการคาบที่ไม่ถูกต้องด้านล่าง" |
| Failed | ยืนยันว่า abort/ไม่ commit จากผลจริงแล้วจึงแสดง Failed; timeout/response หายไม่เข้าแถวนี้โดยอัตโนมัติ | "ส่งห้อง {ห้อง} ภาคเรียน {เทอม} ไม่สำเร็จ กรุณาตรวจสาเหตุแล้วตรวจใหม่ก่อนส่งซ้ำ" |
| Partial | แสดงต่อคู่เฉพาะถ้า contract/resultจริงรองรับ ไม่เดา rollback; batch mixed แสดงสถานะแต่ละคู่ | "รายการนี้มีผลบางส่วน กรุณาตรวจรายละเอียดก่อนส่งซ้ำ"; ไม่อ้างเปิดใช้ T2 |
| unknown commit (สถานะการรับรู้ของ UI) | ยังไม่แสดง Sent/Failed และไม่รวมเป็นสำเร็จ; กู้ receipt เดิมเฉพาะเมื่อ owner contract พร้อม ไม่เขียนซ้ำ | "ยังยืนยันผลการส่งห้อง {ห้อง} ภาคเรียน {เทอม} ไม่ได้ กรุณากู้ผลการส่งเดิมก่อนส่งใหม่"; ไม่เพิ่ม nStatus enum |
| result recording error | เฉพาะเมื่อ receipt ยืนยัน commit: แสดง Sent ของปลายทางแยกจาก error บันทึกผล; retry เฉพาะ module record ด้วยผลเดิมที่ตรวจได้ ไม่ resubmit Academic; ไม่สร้าง enum/IDs สมมติ | "ส่งถึงระบบวิชาการหลักสำเร็จ แต่บันทึกผลการส่งไม่สำเร็จ กรุณากู้การบันทึกผล"; receipt verification/record-only recovery ยังรอ owner ตาม §41.4a |
| success batch | ตารางผลมีทุกคู่และ countsแยก Sent/Rejected/Failed/Partial/NotSendable | "เสร็จสิ้นการส่ง: สำเร็จ {จำนวน} คู่ กรุณาตรวจผลทุกรายการ"; ไม่ใช้คำว่าทั้งหมดสำเร็จเมื่อมีคู่ล้ม |
| no permission/auth | ปุ่ม/หน้าใช้สิทธิ์เมนูเดิม+gatewayJWT; ไม่สร้าง permissionใหม่ | 401 SessionExpiredเท่านั้น/403 UX004 ช่องทางเดียว; ไม่มี successหรือ alert401ซ้อน |

Layout/a11y draft: Preview/result table มีคอลัมน์ตาราง/ห้อง/ปี/เทอม/จำนวนคาบเดิม-ใหม่/เหตุ; รายการยาวเลื่อนได้และแสดงทุกคู่/invalid rows ไม่สรุปจนผู้ใช้แก้ไม่ได้. Checkbox warning ผูก aria-describedby, defaultfocus "ยกเลิก" ก่อน write; closeคืน trigger. Progressเป็นจำนวนคู่ที่ได้ผลจริง ไม่มี realtimeจากserverที่ไม่ได้กำหนด; Spinner+ข้อความระหว่าง request, keyboardออกจากscrollได้ไม่มีtrap, reducedmotionไม่ใช้ตกแต่ง. Thai/longnames wrap, status icon+text ไม่สีอย่างเดียว, no-permission hint เข้าถึงด้วย focus. ใช้ componentกลางและ THSarabunNew/8px/radius12px/48px/SchoolBright tokens; WCAG2.2 AA keyboard/contrastต้องตรวจจริง.

Evidence 2026-10-09: อ่าน hub/page และ [year]/page จริง; hub เป็นปี/เทอม ส่วนรายการ/`toggleTimetableStatus` อยู่ [year] และเขียน isActive. ไม่พบ academic push flow ใน pageที่อ่าน จึงไม่ถือว่า buttonเดิมส่ง academic แล้ว. Gateway/Academic source availability อ้าง SA current DES-016 §41.1/41.4a: มี backend source จริงที่ `sb-tech-upgrade-academic/backend/src/` แล้ว; import เพิ่มแถว ไม่ใช่ atomic replace และ GET by-room มี filter/soft-delete. T1 pure-preview/replacement/receipt ยัง proposed แม้ร่าง concrete มีแล้ว; ไม่อ้างว่า UX อ่าน backend เองหรือมี owner-confirmed DTO. ยังไม่ตรวจ Figma/browser.

## Sign-off (คนเท่านั้น)

| ผู้เซ็น | วันที่ | ผล (อนุมัติ/แก้ไข) | หมายเหตุ |
|---|---|---|---|
| jtrp98 | 2026-10-11 | อนุมัติ (ตามที่ผู้ใช้เลือก) | เลือกอนุมัติ sign-off ผ่านคำตอบ AskUserQuestion (review แล้ว ตามที่ผู้ใช้เลือก) ขอบเขต = ร่างปัจจุบันของไฟล์นี้ (flow/copy/states) · ไม่ใช่ owner/schema/contract approval: T1 pure-preview/atomic replacement/receipt, §41.7 defaults, TRoom↔Tclasses mapping ยังเป็น proposal รอ owner (plan Waiting on Human #5) · Open Decision #1 (deep link ไประบบหลัก) ผู้ใช้ยังไม่ได้ตอบเป็นรายข้อ จึงไม่บันทึกว่าปิด |

## Change Log

- 2026-10-11 — บันทึกคำตัดสิน OD-1 ของ jtrp98: เลือก (ข) — หลังส่งสำเร็จใช้ปุ่ม “เสร็จสิ้น” ปิด Modal; ไม่เพิ่มปุ่ม deep link ไป /academic ในขอบเขตนี้; เก็บประวัติ sign-off เดิม ไม่ปิด gate อื่น.

- 2026-10-11 — บันทึก sign-off ตามคำตอบจริงของ jtrp98 (AskUserQuestion) ต่อร่างปัจจุบัน; ไม่ปิด owner/schema gate; OD-1 ยังไม่ถูกตอบเป็นรายข้อ.

- 2026-10-09 — amend UX-013: entryอยู่ [year] ตาม task, BR60บล็อกเฉพาะคู่ซ้ำ, ผลรายคู่/NotSendable/invalidrows/retry/record-failure, AC052และT1เป็น conditionalowner contract; เก็บ business-approved rules ไม่อ้าง false schemaapproval; คง draft/signaturesว่าง.

- 2026-10-09 — narrow align UX-013 หลัง SA §41.4a: concrete pure-preview/atomic replacement ยัง proposal, backend source มีจริง/import append/GET filter-cleanup/null attendance/room-key owner gaps; Sent ต้อง receipt ยืนยันและ record-only recovery ไม่ resend Academic; คง draft/ธุรกิจ/Sign-off ว่าง.

Back-links: `../../INDEX.md`
