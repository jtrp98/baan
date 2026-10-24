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
| Logout / prerequisite checklist ไม่เพิ่ม case ID | เทียบ HTTP logout acceptance เดิมผ่าน G→RPC→B รวมไม่ต้อง License/authentication, spoofed peer, malformed token, cancel ระหว่าง store ค้าง, limiting/error/no-store และ revoke/audit atomicity. รอ transport contract/DB proof; local HTTP/logout PASS เดิมใช้แทนไม่ได้ |

E-API สำหรับ integration ต้องมี sanitized HTTP↔RPC correlation, build/config/proto revision, fault point และ DB before/after+audit ตาม scope; stub/teststore ให้ระบุชัด ไม่ปิด DB runtime. ขั้นตอนร่วมเพิ่มความลึกการตรวจ ไม่เพิ่ม case IDs/AC coverage. ก่อนมี contract ยอมรับเพียงเอกสารเตรียมทดสอบ ไม่ยอมรับความเสี่ยงเพื่อเปิด integration/release.

[QA round001](../qa/round-001.md) คง 4032 local/static PASS เดิม ไม่ใช่ G/gRPC/DB integration; 77 TP cases ยัง NOT_RUN. tp-001.json คงเป็น raw owner snapshot พร้อม amendment เดิม; strategy/profiles เดิมไม่ใช่ runbook ปัจจุบันเมื่อขัดส่วนนี้. Joined JSON คง AC/expected/owner/actual ตาม schema เดิม; ขั้นตอนปัจจุบันอ่าน TP Markdown และส่วนนี้.

| เอกสาร | ขอบเขต | สถานะ |
| --- | --- | --- |
| [TP-001](tp-001.md) | 77 cases /180 AC; แยก logic/UI/bridge/hardware/installer | NEEDS_DESIGN_CHANGE; ทุก case NOT_RUN |
| [Traceability](traceability-001.md) | 180 AC → cases → implementation/validation owner | IDs/coverage ตรวจแล้ว ไม่ใช่ QA PASS |
| [Owner dataset](tp-001.json) | ผล inspect ต้นฉบับ | ไม่มี test execution |
| [Joined dataset](traceability-001.json) | REQ+canonical tasks+cases | revision2 |

## Change Log

- 2026-10-24 — ใบงาน052: เพิ่ม precedence/กลยุทธ์ Gateway→gRPC และ prerequisite/steps ใน cases เดิม; คง 77 NOT_RUN/180 AC/QA เดิม ไม่รันทดสอบ

- 2026-10-23 — นายช่างบันทึกและจัดรูปจากผล role ผ่าน Claude; ไม่มี runtime/test verdict หรือการปิด gate

- 2026-10-23 — Amendment001 ปรับTP001-007/008/019ตามspec; 77/180เดิม, GAP01/02ยังรอdesignsync; [archive manifest](archive/2026-10-23-before-amendment-001/manifest.json)
