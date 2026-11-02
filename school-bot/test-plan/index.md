# SchoolBot — Test Plan Index

## กลยุทธ์ร่วม transport — 2026-10-24

[Gateway Rev3](../design/gateway-integration-001.md) และ [DES-012 Rev8](../design/des-012.md) มี precedence เฉพาะ transport เหนือ TP/JSON เดิม: Desktop→HTTP G→gRPC B; browser→same-origin BFF→HTTP G→gRPC B. HTTP paths/status ใน cases เป็นฝั่ง client ของ G ไม่ใช่ RPC mapping; ไม่มี HTTP relay/direct public B fallback. Login HTTP เดิมของ G และ internal decoder แยกจาก service RPC.

ใช้ขั้นตอนร่วมนี้กับทุก case ที่เรียก service ออนไลน์ รวม PF-API/PF-LEGACY/PF-WEB/PF-ADMIN และทางเรียกจาก PF-HOST/PF-GRADE; ไม่เปลี่ยน AC/IDs/expected ธุรกิจ. Unit/domain, local component และ static ทำแยกได้ แต่ไม่ปิด integration.

### Prerequisite ก่อนรัน integration

- arch/sys/G/Light ระบุ RPC/proto revision, HTTP↔RPC mapping/allowlist, private exposure/TLS, opaque-session/tenant trust และ trusted peer; env ระบุ owner/status โดยไม่เผย secret. ไม่เดา RPC/proto/ports/metadata/error contract.
- ต้องมีสัญญา error mapping, deadline/cancellation, retry/idempotency, request/response/metadata limits และ rate/concurrency scope ทั้ง G/B. ส่วนที่ยังไม่มีให้คง NOT_RUN และรายงาน prerequisite ค้าง ไม่กำหนดค่าหรือ expected เอง.
- คง DB/legacy/H5/UX/grade gates เดิม. cType และ decisions-035 ตอบแล้ว; รอ technical proof ไม่ถามนโยบายซ้ำ.

### Steps/coverage ภายใต้ cases เดิม

| ขอบเขต / cases | ขั้นตอนเมื่อ prerequisite พร้อม / หลักฐาน |
| --- | --- |
| HTTP↔RPC / ทุก online case ตาม profiles ข้างต้น | เรียกผ่าน G (เว็บผ่าน BFF); เทียบ HTTP method/path/payload/headers กับ RPC/DTO ตาม mapping; ทดสอบ malformed/empty/unknown route และ public access ถึง private introspection/B ว่าถูกกันตามสัญญา. ผูก trace HTTP→G→RPC→B กับผลจริง ห้ามใช้ B HTTP ตรงนับผ่าน G |
| Trust / TP001-007/023/024/058/069/074 | ส่ง identity/tenant/forwarding headers ปลอม, wrong channel/profile/term, colliding IDs และสิทธิ์ถูกถอน; ตรวจ authority ของ session/introspection และ re-check ก่อน commit ตาม contract ไม่ยกสิทธิ์จาก client หรือ cType; แยก protected route จาก logout |
| Cancel/error/retry / TP001-004/022/028/048/075 | ตัด client/หมด deadline ก่อนส่ง ระหว่างทำ และหลัง commit ก่อนตอบ; inject RPC unavailable/domain error/lost response; ตรวจ HTTP mapping ที่อนุมัติ, sanitized logs และผล DB/audit. cancel ไม่ใช่หลักฐาน rollback; ผล commit ไม่ทราบต้อง reconcile ตาม contract; ตรวจ retry/duplicate ไม่เขียนซ้ำและไม่ retry mutation นอกสัญญา |
| Limits / TP001-004/005/007/023/046/062 | ทดสอบต่ำกว่า/เท่ากับ/เกิน bounds ที่อนุมัติของ HTTP body, RPC message/metadata และ response; concurrent calls ข้าม instances ตรวจ rate/queue/concurrency และ capacity หลังจบ/fail/cancel. ค่า local limiter ไม่ใช่ distributed SLA |
| Logout / [TP001-082](tp-001-amendment-005.md) (AC-036-06) | ตรวจการออกจากระบบผ่าน G controller (`POST /api/school-bot/service/v2/auth/logout`) → gRPC B (`SchoolBotSessionService.Logout`) ตาม [TP001-082](tp-001-amendment-005.md): เพิกถอนเฉพาะเซสชันของคำขอโดยไม่กระทบสิทธิ์ License ของเครื่อง, ไม่มี/ผิดรูป token จบด้วย 204 (`store=0/quota=0`), กัน untrusted peer/bad metadata/disallowed Origin/wrong verb/oversize body, ตรวจ rate/concurrency limit (429) และบริการขัดข้อง (500/502/503/504) โดยไม่รั่วข้อมูลลับ. หลักฐาน local (check-092 (memory: planning/check-092-grpc-r3-001.md)/jpo-092 (memory: planning/jpo-092-logout-r4-001.md)) ครอบเฉพาะ G/B local slice; ยังรอ full Login, FE-002 UI, DB จริง และ production/H5/TLS จึงคง NOT_RUN |

E-API สำหรับ integration ต้องมี sanitized HTTP↔RPC correlation, build/config/proto revision, fault point และ DB before/after+audit ตาม scope; stub/teststore ให้ระบุชัด ไม่ปิด DB runtime. ขั้นตอนร่วมเพิ่มความลึกการตรวจ ไม่เพิ่ม case IDs/AC coverage. ก่อนมี contract ยอมรับเพียงเอกสารเตรียมทดสอบ ไม่ยอมรับความเสี่ยงเพื่อเปิด integration/release.

QA round001 (memory: qa/round-001.md) คง 4032 local/static PASS เดิม ไม่ใช่ G/gRPC/DB integration; 82 TP cases ยัง NOT_RUN (Amendment005). tp-001.json คงเป็น raw owner snapshot พร้อม amendment เดิม; strategy/profiles เดิมไม่ใช่ runbook ปัจจุบันเมื่อขัดส่วนนี้. Joined JSON คง AC/expected/owner/actual ตาม schema เดิม; ขั้นตอนปัจจุบันอ่าน TP Markdown และส่วนนี้.

| เอกสาร | ขอบเขต | สถานะ |
| --- | --- | --- |
| [TP-001](tp-001.md) | 82 cases / 187 AC ([Amendment005](tp-001-amendment-005.md) เพิ่ม TP001-082 ครอบ AC-036-06; [Amendment004](tp-001-amendment-004.md) ตาม decisions-042 เพิ่ม AC-046-07; ประวัติ Amendment002 sync GAP+SEC + Amendment003 เปิด coverage GAP-07 — AC-030-04..08 ตรวจรับแล้วตาม decisions-037); แยก logic/UI/bridge/hardware/installer | GAP ส่วนใหญ่ design_synced — รอ runtime; ทุก case NOT_RUN |
| [TP-002 fixture plan](tp-002-fixture-plan-001.md) | แผน failure/race fixtures FX-01..05 (fake clock/trash/late callback/import lost response/cross-tenant) — ไม่สั่งหุ่น | เอกสารเตรียม — ยังไม่มี harness/การรัน |
| [TP-003 grade fixture plan](tp-003-grade-fixture-plan-001.md) | แผน grade parity/coexistence/crash fixtures GF-01..06 ตาม 5 gate ของ SA-004 (AC-049..052) — test DB เท่านั้น ไม่แตะ PGGradeDB จริง | เอกสารเตรียม — ยังไม่มีการรัน |
| [Traceability](traceability-001.md) | snapshot เดิม 180 AC → cases → implementation/validation owner; coverage ปัจจุบัน 187 AC / 82 cases อ่าน [TP Amendment004](tp-001-amendment-004.md) และ [Amendment005](tp-001-amendment-005.md) + ส่วนต่อท้าย traceability | snapshot 180/77 ยังไม่รวม AC-030-04..08 (Amendment003), AC-046-07 (Amendment004) และ AC-036-06 (Amendment005); ไม่ใช่ QA PASS |
| [Owner dataset](tp-001.json) | raw snapshot เดิม180 AC/77 cases | ไม่มี test execution |
| [Joined dataset](traceability-001.json) | snapshot เดิม 180 AC/77 cases; REQ+canonical tasks+cases | source อ้าง plan/tasks-001.json (memory) revision2; ยังไม่รวม AC-030-04..08 ทั้ง 5 ข้อใน [TP Amendment003](tp-001.md#amendment003--2026-10-24) , AC-046-07 ใน [Amendment004](tp-001-amendment-004.md) และ AC-036-06 ใน [Amendment005](tp-001-amendment-005.md); จึงไม่ใช่ joined coverage 187 AC |

- 2026-10-24 — ใบงาน061: เพิ่ม TP-003 grade fixture plan (GF-01..06 ครอบ AC-049..052 ทั้ง 5 gate) — docs-only

## Change Log

- 2026-10-28 — Amendment005: เพิ่ม [TP001-082](tp-001-amendment-005.md) ครอบ AC-036-06 (logout) รวม 82 cases / 187 AC และผูกแถว Logout prerequisite ชี้ไป TP001-082; แยกหลักฐาน local (check-092/jpo-092) จากส่วนที่รอ full Login/FE-002/DB/H5; snapshot 180/77 คงเดิม ทุก actual NOT_RUN ไม่มี test execution

- 2026-10-26 — ใบงาน078 Amendment004 ตาม [decisions-042](../requirement/decisions-042.md): เพิ่ม TP001-081 รวม81 cases/186 AC; snapshot180/77คงเดิม ทุก actual NOT_RUN ไม่มี test execution

- 2026-10-26 — ใบงาน069: แยก Traceability/Joined JSON snapshot เดิม 180 AC/77 cases จาก coverage ปัจจุบันใน TP Amendment003 ที่ 185 AC/80 cases; AC-030-04..08 ทั้ง 5 ข้อตรวจรับแล้วตาม decisions-037 แต่ยังไม่อยู่ใน snapshot. แก้เฉพาะคำอธิบายสารบัญ ไม่เปลี่ยน snapshot/raw/actual/REQ/tasks/status/case IDs และไม่มี test execution

- 2026-10-24 — Amendment003 ตาม decisions-036 (นายช่าง solo สวมบท inspect): แก้ TP001-048 + เพิ่ม TP001-080 เปิด coverage GAP-07 (AC-030-04..08 ข้อเสนอรอผู้ใช้ตรวจรับ) — 80 cases/185 AC ทุก actual NOT_RUN

- 2026-10-24 — ใบงาน060e (นายช่าง solo — subagent role inspect): Amendment002 sync TP-001 ตามสัญญาใบงาน060a (แก้ 19 cases เพิ่ม TP001-078/079 — รวม 79 cases ครอบ 180 AC ทุก actual NOT_RUN) + สร้าง TP-002 fixture plan (FX-01..05); ไม่แตะ GAP-07 coverage จนกว่า disposition จะตัดสิน; ไม่มี execution

- 2026-10-24 — ใบงาน052: เพิ่ม precedence/กลยุทธ์ Gateway→gRPC และ prerequisite/steps ใน cases เดิม; คง 77 NOT_RUN/180 AC/QA เดิม ไม่รันทดสอบ

- 2026-10-23 — นายช่างบันทึกและจัดรูปจากผล role ผ่าน Claude; ไม่มี runtime/test verdict หรือการปิด gate

- 2026-10-23 — Amendment001 ปรับTP001-007/008/019ตามspec; 77/180เดิม, GAP01/02ยังรอdesignsync; archive manifest (ใน tag `school-bot-pre-cleanup-2026-10-26`)
