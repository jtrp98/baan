# SchoolBot — สารบัญแผนทดสอบ

> แก้ล่าสุด 2026-11-03 · แก้โดย inspect · ขอโดย ผู้ใช้ (ใบงาน 097 — เพิ่มเคส normal ของ BE-015, BE-031, BE-035 และ FE-020)

เอกสารนี้ระบุแผนตรวจรับและกลยุทธ์ร่วมของ SchoolBot coverage รวมยังเป็น 187 Acceptance Criteria (AC: เกณฑ์ตรวจรับ); สารบัญฐาน TP001-001–082 ใช้ร่วมกับเคสเพิ่มเติมที่ลิงก์ในตาราง normal; ทุกผลจริงยัง NOT_RUN การมีผล local/static ไม่รับรองการเชื่อมระบบหรือปิดเงื่อนไขส่งมอบ

| เอกสาร | ขอบเขต | สถานะปัจจุบัน |
|---|---|---|
| [เคส normal ตาม task](tp-001-normal-index.md) | 13 task / 41 AC / 26 normal IDs พร้อม setup และ response+persisted state | รวม BE-028, BE-015, BE-031, BE-035 และ FE-020 แล้ว; รายละเอียด full คงไว้ ผล runtime ยัง NOT_RUN |
| [TP-001 (แผนตรวจรับทั้งหมด)](tp-001.md) | สารบัญฐาน 82 cases / 187 AC และกลยุทธ์ Profile; เคสเพิ่มเติมดูตาราง normal | มีแผนทุก AC; รอหลักฐาน runtime และเงื่อนไขแต่ละ profile |
| [Traceability (AC → case)](traceability-001.md) | ตารางปัจจุบัน 187 AC รวมกรณีเพิ่มเติมแล้ว | ทุก Actual เป็น NOT_RUN |
| [TP-002 (failure/race fixtures)](tp-002-fixture-plan-001.md) | FX-01–05: fake clock/trash/bridge/import/authority | เอกสารเตรียม; ไม่มี harness หรือผลรัน |
| [TP-003 (grade fixtures)](tp-003-grade-fixture-plan-001.md) | GF-01–06: parity/coexistence/crash ภายใต้ห้าเงื่อนไขฐานคะแนน | เอกสารเตรียม; ยังไม่รัน; ใช้ test DB เท่านั้น |
| [Owner dataset](tp-001.json) และ [Joined dataset](traceability-001.json) | snapshot เดิม 180 AC/77 cases | ไม่ใช่ coverage ปัจจุบันและไม่มี test execution |

## กลยุทธ์ transport

[Gateway Rev3](../design/gateway-integration-001.md) และ [DES-012 (Auth ข้ามระบบสำหรับเว็บโรงเรียน, admin และ Desktop) Rev9](../design/des-012.md) กำหนดเส้นทาง transport สำหรับแผนทดสอบ: Desktop→HTTP API Gateway→gRPC SchoolBot service; browser→same-origin BFF→HTTP API Gateway→gRPC SchoolBot service. HTTP paths/status ใน cases เป็นฝั่ง client ของ Gateway ไม่ใช่ RPC mapping; ไม่มี HTTP relay/direct public SchoolBot fallback. Login HTTP เดิมของ Gateway และ internal decoder แยกจาก service RPC.

ใช้ขั้นตอนร่วมนี้กับทุก case ที่เรียก service ออนไลน์ รวม PF-API/PF-LEGACY/PF-WEB/PF-ADMIN และทางเรียกจาก PF-HOST/PF-GRADE; ไม่เปลี่ยน AC/IDs/expected ธุรกิจ. Unit/domain, local component และ static ทำแยกได้ แต่ไม่ปิด integration.

### เงื่อนไขก่อนตรวจ integration

- arch/sys/Gateway/Light ระบุ RPC/proto revision, HTTP↔RPC mapping/allowlist, private exposure/TLS, opaque-session/tenant trust และ trusted peer; env ระบุ owner/status โดยไม่เผย secret. ไม่เดา RPC/proto/ports/metadata/error contract.
- ต้องมีสัญญา error mapping, deadline/cancellation, retry/idempotency, request/response/metadata limits และ rate/concurrency scope ทั้ง Gateway/SchoolBot. ส่วนที่ยังไม่มีให้คง NOT_RUN และรายงาน prerequisite ค้าง ไม่กำหนดค่าหรือ expected เอง.
- คง DB/legacy/H5/UX/grade gates เดิม. cType และ [มติ 035 (มติแหล่งสิทธิ์แอดมินโรงเรียน)](../../shared/decisions/decisions-035.md) ตอบแล้ว; รอ technical proof ไม่ถามนโยบายซ้ำ.

### ขั้นตอนร่วมของ online cases

| ขอบเขต / cases | ขั้นตอนเมื่อ prerequisite พร้อม / หลักฐาน |
| --- | --- |
| HTTP↔RPC / ทุก online case ตาม profiles ข้างต้น | เรียกผ่าน Gateway (เว็บผ่าน BFF); เทียบ HTTP method/path/payload/headers กับ RPC/DTO ตาม mapping; ทดสอบ malformed/empty/unknown route และ public access ถึง private introspection/SchoolBot ว่าถูกกันตามสัญญา. ผูก trace HTTP→Gateway→RPC→SchoolBot กับผลจริง ห้ามใช้ SchoolBot HTTP ตรงนับผ่าน Gateway |
| Trust / TP001-007/023/024/058/069/074 | ส่ง identity/tenant/forwarding headers ปลอม, wrong channel/profile/term, colliding IDs และสิทธิ์ถูกถอน; ตรวจ authority ของ session/introspection และ re-check ก่อน commit ตาม contract ไม่ยกสิทธิ์จาก client หรือ cType; แยก protected route จาก logout |
| Cancel/error/retry / TP001-004/022/028/048/075 | ตัด client/หมด deadline ก่อนส่ง ระหว่างทำ และหลัง commit ก่อนตอบ; inject RPC unavailable/domain error/lost response; ตรวจ HTTP mapping ที่อนุมัติ, sanitized logs และผล DB/audit. cancel ไม่ใช่หลักฐาน rollback; ผล commit ไม่ทราบต้อง reconcile ตาม contract; ตรวจ retry/duplicate ไม่เขียนซ้ำและไม่ retry mutation นอกสัญญา |
| Limits / TP001-004/005/007/023/046/062 | ทดสอบต่ำกว่า/เท่ากับ/เกิน bounds ที่อนุมัติของ HTTP body, RPC message/metadata และ response; concurrent calls ข้าม instances ตรวจ rate/queue/concurrency และ capacity หลังจบ/fail/cancel. ค่า local limiter ไม่ใช่ distributed SLA |
| Logout / [TP001-082](tp-001-cases-boundary-3.md#tp001-082) ([AC-036-06 (เมื่อสั่งออกจากระบบของบัญชี Login…)](../../modules/app-shell/shared/requirements/req-036.md)) | ตรวจการออกจากระบบผ่าน Gateway controller (`POST /api/service-school-bot/v2/auth/logout`) → gRPC SchoolBot service (`SchoolBotSessionService.Logout`) ตาม [TP001-082](tp-001-cases-boundary-3.md#tp001-082): เพิกถอนเฉพาะเซสชันของคำขอโดยไม่กระทบสิทธิ์ License ของเครื่อง, ไม่มี/ผิดรูป token จบด้วย 204 (`store=0/quota=0`), กัน untrusted peer/bad metadata/disallowed Origin/wrong verb/oversize body, ตรวจ rate/concurrency limit (429) และบริการขัดข้อง (500/502/503/504) โดยไม่รั่วข้อมูลลับ. หลักฐาน local ยังไม่ครอบ full Login, [FE-002 (Login UI)](../plan/index.md) UI, DB จริง และ production/H5/TLS จึงคง NOT_RUN |

E-API สำหรับ integration ต้องมี sanitized HTTP↔RPC correlation, build/config/proto revision, fault point และ DB before/after+audit ตาม scope; stub/teststore ให้ระบุชัด ไม่ปิด DB runtime. ขั้นตอนร่วมเพิ่มความลึกการตรวจ ไม่เพิ่ม case IDs/AC coverage. ก่อนมี contract ยอมรับเพียงเอกสารเตรียมทดสอบ ไม่ยอมรับความเสี่ยงเพื่อเปิด integration/release.

## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BFF = Backend for Frontend ซึ่งอยู่ origin เดียวกับเว็บ · RPC = Remote Procedure Call · DTO = Data Transfer Object · SLA = Service Level Agreement


## หลักฐาน

qa/round-001.md (memory): local/static 4032 PASS เดิม ไม่ใช่ Gateway/gRPC/DB integration; planning/check-092-grpc-r3-001.md และ planning/jpo-092-logout-r4-001.md (memory) ครอบ local logout เท่านั้น รายละเอียดและขอบเขตอยู่ที่ [หลักฐาน Logout](tp-001-logout-evidence.md)

JSON เดิมใช้ plan/tasks-001.json (memory) revision2 เป็นข้อมูล owner/AC/expected/actual; schema และ snapshot คงเดิม ขั้นตอนปัจจุบันอ่าน Markdown ชุดนี้
