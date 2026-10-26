# SchoolBot — QA index

| รอบ | Scope | Verdict |
|---|---|---|
| [round001](round-001.md) | local logout + Gateway web outcome component | PASSเฉพาะlocalscope; PG/fullLogin NOT_RUN |
| [check088-auth](../planning/check-088-auth-001.md) | compatibilityใหม่ 45cases | FAIL32pass/13fail; sysแก้รอบ1แล้ว [รอตรวจซ้ำ](../planning/slice-088-auth-r1-001.md) |
| [check088-grpc](../planning/check-088-grpc-001.md) | BtypedgRPCLogout direct/wire101cases | FAIL80pass/21fail/7groups; หยุดก่อนเปิดรอบแก้ตาม048 |
| [parent088](../planning/handoff-004.md) | regressionปิดท้ายและcompileGhelper | 4032pass/0fail; Ghelpercompileผ่านแต่solutionbuildติดpackages; ไม่แทนnewcodeacceptance |

## Change Log

- 2026-10-24 — รับcheck041และactualrun; ไม่มีcanonicaltask/gateclose
