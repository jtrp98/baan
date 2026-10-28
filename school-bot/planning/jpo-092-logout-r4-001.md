# Logout transport (G r4 + B rework3) — independent JPO

วันที่2026-10-28 · jpo AGY T2 (gemini-4-argon-medium) run 2026-10-28-06-45-43-jpo-tier-t2-1agents-WZnc4m DONE · นายช่างสกัด

Runner: Codex ติด usage limit ถึง 2026-11-02 → agy ตามแนวที่ผู้ใช้สั่ง ([ใบงาน092](task-092.md)) · writer G = agy gemini-3.8-flash / JPO = agy gemini-4-argon คนละ session · prompt มีเฉพาะแบบ/finding/path oracle ไม่แนบคำอ้าง writer หรือผล parent

## Verdict

| ID | ฝั่ง | Severity | Verdict |
|---|---|---|---|
| SEC001-016 | G | Important | **CLOSED เฉพาะ local logout slice** — residual 4 ข้อของ [jpo-091](jpo-091-gateway-r2-001.md) ปิดครบ |
| SEC001-017 | G | Minor | CLOSED (regression ผ่าน) |
| B UUID duplicate | B | Medium | CLOSED |
| B Origin/binary/transport duplicate | B | Minor | CLOSED |

## Oracle (pwsh 7, foreground)

G: repro-r4 3/0 · regression-r4 5/0 · extended-r4 96/0 · surface probe in-memory 6/0 · B: grpc-r2-extended-independent 2234/0 (8 NOT_RUN เดิม) · diff สำเนา r4 ↔ normal-089 เปลี่ยนเฉพาะ construction/entry ตามแบบข้อ D — ตรงกับที่ parent ทวน ([slice-092-gateway-r4](slice-092-gateway-r4-001.md), [slice-092-grpc-r3](slice-092-grpc-r3-001.md))

## 4 assertion ที่ความหมายเปลี่ยน — JPO ยอมรับ

- shared-channel-factory-not-mutated: พอสำหรับ constructor immutability (ร่วมกับ unrelated-gateway-logging-visible) · ข้อเสนอไม่ใช่ blocker: อาจเพิ่ม assertion `opts.LoggerFactory == logs` หลัง CreateChannel ในอนาคต
- bound-* ×3 levels: พอ — Bound(ch) เป็น sanitizing factory จริงและกรองทุกช่อง
- construction-standard/warm: พอและเข้มขึ้น (fail closed ทุก shape)
- middleware-unsafe-generated-fallback-failclosed: พอ — controller/service 503 RPC0 LogsClean

## พื้นผิวใหม่

SmartScheme: `/api/school-bot/service/v2` → SchoolBotOpaque (jwtCalls0, revoked JWT บน logout ได้ 204 ตามสัญญา) · `/api/auth/check` คง JWT 200 · revoked JWT บน route อื่นถูก control plane 401 · `StartsWithSegments` ไม่ชน `/api/school-bot-other` · SliceGate 404/RPC0 ทั้ง Production, ไม่มี module marker, Enabled=false

## Hash ที่ตรวจ

G SchoolBot/*: Controller A057B8…6C5D · Service 60ACA6…BB65 · Registration 65F806…6837 · Options FA8B94…750E · GrpcClient ABF12E…F22C · Preparation/Trailer/interfaces คงเดิม · proto 37C03A…635C ตรง B · B adapter C5DE7B…0B45

## NOT_RUN

TLS/mTLS/peer จริง (H5) · physical HTTP/2 hidden headers บน Kestrel · 8 wire fixture B · Program.cs/production registration · full private NuGet build · PostgreSQL/atomicity · BFF CSRF · Light CODEOWNERS review

## Change Log

- 2026-10-28 — รับ JPO WZnc4m: SEC001-016 CLOSED local scope; B triage CLOSED
