# ใบงาน092 — rework3 แบบแคบ B gRPC + Gateway logout ตามมติ049

วันที่2026-10-28 · นายช่าง · ผู้ใช้สั่ง "แก้เลย แต่ใช้ agy ก่อน" หลังตอบ[มติ049](../requirement/decisions-049.md) — ถือเป็นคำสั่งเริ่มวงเฉพาะงานนี้ (ไม่ใช่CONTINUE-NORMALทั้งคิว; มติ048ยังคุมงานอื่น)

## ขอบเขต

- B: sys AGY T3 --no-fallback --write cwd target/school-bot — 4กลุ่มrawmetadata/wire (UUID dup+empty, Origin dup, grpc-trace-bin malformed/dup, transport dup) ตาม[check-090-grpc-r2](check-090-grpc-r2-001.md)
- G: sys AGY T3 --no-fallback --write cwd target/sb-api-gateway — SEC001-016 module-ownedchannel/logboundary + rejectunsafeclientก่อนRPC + allowlistlog ตาม[jpo-091-gateway-r2](jpo-091-gateway-r2-001.md)
- คนละrepo จึงขนานได้ (หนึ่งwriterต่อrepo). ใบงานroleอยู่workspace reports/school-bot/normal-092/sys-{grpc,gateway}-r3-task.txt

## Oracle ตรึง (กติกาข้อ12)

- B: normal-089/grpc-r2-extended-independent.ps1 (2234assertions, เป้า12fail→0) + baseline150 + regression4147 · 8wireNOT_RUNไม่อยู่ในเส้นชัย
- G: normal-089/gateway-jpo-r2-extended.ps1 (96assertions, เป้า15fail→0) + baseline5 + base3 + helper433 + standalonecompile
- หลังwriterDONE: parentทวนคำสั่งเอง → check(B)/JPO(B+G)อิสระด้วยscriptเดิม ห้ามเพิ่มเคสไร้ขอบ

## เพดาน

รอบนี้เป็นรอบเดียวที่อนุมัติ ถ้ายังตก หยุดถามผู้ใช้ทันที ไม่เปิดรอบ4 ไม่รับriskแทน

## ข้อค้างจากวงก่อน (ยังไม่สกัด)

- sys AGY T3 run 2026-10-26-15-52-08-sys-tier-t3-1agents-KEDL0W (BE007 Go license pure core) DONE: writerอ้าง `go test ./...` ใน app exit0 — parentยังไม่ทวน/ยังไม่ลงdone-local
- checkGo/checkBackend/checkFrontR1 ของใบงาน091 ยังไม่มีผลบันทึก

## Change Log

- 2026-10-28 — เปิด092 ตามมติ049; ยืนยันไม่มีroleค้างรันก่อนเปิดwriterสองrepo
- 2026-10-28 — B run FkPMk4 (agy gemini-3.8-flash-medium) exit0 แต่ไม่มีhandoff/state: stdoutบรรทัดเดียว stderr "root agent idle; waiting for 1 background task", ไม่มีไฟล์web/ถูกแก้ → runner failure ไม่นับรอบแก้; เปิดB ใหม่ด้วยagy T3 สั่งforegroundทุกคำสั่ง
- 2026-10-28 — G DOsn1C: oracleเดิม95/1 + reflection mutation → ผู้ใช้อนุมัติรอบเล็กหนึ่งจุด (Amendment มติ049) [receipt](slice-092-gateway-r3-001.md) · B sjuk7W DONE อ้าง2234/0+4147/0 ผ่านrunnerของตัวเอง [receipt](slice-092-grpc-r3-001.md)
- 2026-10-28 — ผู้คุมทวนscriptตรึงไม่ได้: เครื่องไม่มี pwsh (PowerShell 7) · ตัวเลขที่writerอ้างว่ารันด้วยpwshจึงตรวจย้อนไม่ได้ · พักการเปิด G รอบเล็กและ check/JPO จนมีpwsh (oracleทุกชุดต้องใช้)
- 2026-10-28 — ผู้ใช้ติดตั้ง pwsh 7.6.9 · B parent oracle 2234/0 + regression 4147/0 (local green) · เปิด G รอบเล็ก agy T3 · check B Codex ติด usage limit ถึง 2026-11-02 → ผู้ใช้สั่งในแชตให้ใช้ agy ตรวจ ("agy เพราะยังไง มันก็คนละ context") — ข้อยกเว้นกติกา runner T2=Codex เฉพาะงานตรวจรอบนี้ · บันทึกตรงไปตรงมา: writer และ checker เป็น agy gemini เหมือนกัน แยก context
- 2026-10-28 — B check agy PASS 2234/0 ([check092](check-092-grpc-r3-001.md)) · G รอบเล็ก NPsFMa ไม่มี handoff แต่ถอด mutation แล้ว → harness ตรึงทุกชุด crash ที่ construction ([receipt](slice-092-gateway-r3-001.md)) · ผู้ใช้สั่ง[มติ050](../requirement/decisions-050.md) G ใช้ controller ตาม convention · ผู้ใช้เลือกให้ arch ออกแบบใหม่ก่อน ด้วย agy T1 (ข้อยกเว้นกติกา t0–t2=Codex เพราะ Codex ติดโควตา) · หยุดแก้ G จนได้แบบ · JPO B รอรวมกับ G
- 2026-10-28 — arch vMHqG4 DONE → [gateway-controller-entry-001](../design/gateway-controller-entry-001.md) Rev1 (controller + CreateChannel/ConditionalWeakTable ไม่มี reflection + harness seam เป็นสำเนา r4) · เปิด sys AGY T3 ทำตามแบบรอบเดียว · ค้าง sweep เอกสาร gateway อื่น (arch ระบุไฟล์/บรรทัดใน E) — ตอนนี้ใช้ pointer precedence ใน design/index
- 2026-10-28 — sys r4 สองรันติดสิทธิ์ headless agy (อ่านนอก cwd / write_file) ไม่มี handoff แต่ source+harness r4 เขียนครบ · parent green compile/433/3/5/96 ([receipt](slice-092-gateway-r4-001.md)) · เปิด JPO AGY T2 ตรวจ G SEC001-016 + seam 4 assertion + พื้นผิวใหม่ (SmartScheme/SliceGate) + B triage — runner agy ตามแนวที่ผู้ใช้สั่งใช้ agy (Codex ติดโควตา)
- 2026-10-28 — JPO WZnc4m DONE: SEC001-016 CLOSED local, SEC001-017 คง CLOSED, B triage Medium/Minor CLOSED, surface probe 6/0 ([jpo092](jpo-092-logout-r4-001.md)) · security.md append · ปิดเป้าหมายใบงาน092 · ค้าง: spec ผูก AC ให้ logout transport (จึงลง verified/done-local ใน JSON ได้), sweep เอกสาร gateway 5 ไฟล์ตาม arch E, BE007 Go license (KEDL0W) ยังไม่ทวน, check ของใบงาน091 ยังไม่สกัด
