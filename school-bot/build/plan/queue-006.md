# คิว006 — CONTINUE089 local subsets

วันที่ 2026-10-26 · เจ้าของเนื้อหา gm Codex T2 · ผู้สกัด นายช่าง

รับ run `2026-10-26-09-50-23-gm-tier-t2-1agents-U2eiLs` (NEEDS_HUMAN เฉพาะ canonical staged proposal). คง 110 tasks/17 gates/44 REQ/186 AC/81 TP และ 15 verified/95 pending. ผู้คุมรัน lint ก่อน dispatch ได้ exit1 implement63/gated62/readyBE001; gm อ้างผลนี้ ไม่ได้รัน lint ซ้ำเอง.

## คิวทำต่อ

ใช้ contract/UX/artifact ที่พร้อมและ injected fake; ห้าม production fallback ไป fake. สถานะ subset ไม่แทน acceptance ทั้ง task. Writer repo เดียวกัน serialize, งานอิสระต่าง repo/readonlyขนานไม่เกิน3.

| คิว | ส่วนงาน | ขอบเขต/จุดหยุด |
|---|---|---|
| เปิดแล้ว | auth independent recheck / B gRPC repair1 | check CodexT2 / sys AGYT3; ไม่ปิด fullLogin/runtime |
| เปิดแล้ว | G helper independent check | CodexT2; compiled cached references; solution build ยังขาด private packages |
| ถัดไป | TP-002 local harness | FX01a/01b/02 fake clock/store/failpoints; ไม่เปลี่ยนเวลาเครื่อง/DB/หุ่น |
| ถัดไป | BE-009 local store | AC01104/local03601, DES003, temp filesystem/injected entitlement; ไม่เดา migration schema |
| หลัง BE009.local | BE-024 Guest | AC04001..06 export/trash/clock; ไม่แตะข้อมูลจริง |
| อิสระ | BE-033/036 calculations | AC04702/04, AC05003; decimal/weights10000/max>0/half-up; ไม่ freeze/persist/confirm/exportPG |
| อิสระ | BE-028 row transform | AC04502/03; supplied rowsตามREQ045/DES005/source003; ไม่เลือก stable-key/dedup/API |
| อิสระ | BE-003 authz/replay | AC02701..03 เฉพาะ logic, fake principal/repo/clock; ไม่ bootstrap/principal/keyจริง |
| อิสระ | FE-001 entry | UX001signed/injected entitlement; เข้าคิว SchoolBot writer |
| เมื่อ B stable | G typed client/mapper/harness | sync canonical proto/hash; ไม่เปิด routeproduction; packagesยังเป็น blocker เฉพาะสายG |

## ข้อเสนอให้ผู้ใช้ตัดสินท้ายรอบ

รับ local/live semantics ภายใน task เดิมหรือไม่: local ใช้ artifact/contract/UX ของ subset; live คง depends_on/gate_ids เดิมครบ. ไม่เพิ่ม taskIDs ไม่ลด gates/AC. ก่อนเปลี่ยน canonical JSON ต้องพิสูจน์รูปแบบ staged ที่ linter รองรับและ lint จริง; ห้ามล้าง gate/dependency เพื่อให้ผ่าน. ระหว่างรอ คิว stub ที่ผู้ใช้อนุญาตแล้วเดินต่อได้.

## ประเด็นส่ง inspect

gm นับ unique ac_ids ใน canonical JSON ได้181 ขณะที่ scope186; ต้องกระทบยอด matrix/amendment ก่อนอ้าง mapping ครบ ไม่สรุปว่า requirementหายและไม่สร้าง/ตัด AC เอง. ให้ inspect ส่ง exact delta โดยไม่มีผล QA PASS/runtime.

## งานรอหลักฐานภายนอก

H5/transport identity/bootstrap/Lightreview, DB parity/EV/transactions, content, hardwareQ3, cert/distribution/release ตาม gatesเดิม. ไม่ถาม devGateway/replay900/UX7ชุดซ้ำ; signerพัก047.

## Change Log

- 2026-10-26 — สกัดข้อเสนอ/คิวจาก gm089; ไม่ apply canonical staged JSON หรือรับรองsubsetแทนfulltask.
