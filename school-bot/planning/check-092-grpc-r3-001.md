# B typed gRPC logout — independent check หลัง rework3

วันที่2026-10-28 · check AGY T2 (gemini-4-argon-medium) run 2026-10-28-06-03-25-check-tier-t2-1agents-gjKjeN · **PASS เฉพาะ task นี้** · นายช่างสกัด

Runner: Codex ติด usage limit ถึง 2026-11-02 → ผู้ใช้สั่งให้ agy ตรวจ ([ใบงาน092](task-092.md)) · writer = agy gemini-3.8-flash-medium / checker = agy gemini-4-argon-medium คนละ session/context · prompt ของ checker มีเฉพาะแบบ + findings เดิม + path source/oracle ไม่แนบคำอ้างของ writer หรือผล parent

## Oracle ตรึง

แบบ design/index Rev5 · gateway-logout-negative-boundary-001 Rev1 · gateway-grpc-contract-001 Rev1 · findings [check-090-grpc-r2](check-090-grpc-r2-001.md) 4 กลุ่ม · script normal-089/grpc-r2-extended-independent.ps1 ไม่แก้ (bundle 81E232…4FD1)

## ผล

pwsh7 จาก root target/school-bot ไม่ rebuild: **BASE 150/0 · ARCH 2084/0/8NOT_RUN · SUMMARY 2234pass/0fail exit0** — ตรงกับที่ parent ทวน ([slice-092-grpc-r3](slice-092-grpc-r3-001.md))

Source binding 48 documents/4 assemblies ตรง PDB/disk · adapter **C5DE7BFC…0B45** · LogoutRateLimiter BC1B3F…531C · Registration 2846E9…2BDF · proto 37C03A…635C

ตรวจโค้ดเทียบแบบ: raw `HttpContext.Request.Headers` ตรวจจำนวนค่า x-request-id/origin/grpc-trace-bin(ต้อง1ค่า+Base64)/transport ก่อนอ่าน `context.RequestHeaders` (ครอบ try/catch) → ขนาดรวม ≤16384 → allowlist/duplicates/caller/UUID → INTERNAL_ERROR → Origin allowlist · ลำดับใน Logout: peer → ValidateMetadata → token → rate limiter → store · ค่าที่ merge แล้วไม่ทับ raw candidate UUID — ปิดครบ 4 findings

## NOT_RUN

8 wire fixture เดิม (dup user-agent/empty lang ทดสอบผ่าน direct injection แทน; lang/trace nonASCII ไม่มี wire fixture) · H5 physical hidden headers · G correlation/502 · PostgreSQL atomicity · fullLogin · TLS/mTLS · production registration (ปิดตามแบบ)

## ผลต่อแผน

finding B gRPC ใน check-090-grpc-r2 **CLOSED** · ลง `verified` ใน tasks-001.json ยังไม่ได้: slice ต้องมี ac_ids และไม่มี AC ที่ครอบ logout transport (ต้องให้ spec ผูก) · ไม่ปิด G-AUTH/fullLogin · JPO ซ้ำ B ตามมติ049 ยังค้าง

## Change Log

- 2026-10-28 — รับ check gjKjeN PASS 2234/0/8; ปิด 4 findings B
