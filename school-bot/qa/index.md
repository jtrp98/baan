# SchoolBot — QA index

| รอบ | Scope | Verdict |
|---|---|---|
| [round001](round-001.md) | local logout + Gateway web outcome component | PASSเฉพาะlocalscope; PG/fullLogin NOT_RUN |
| [check089-auth](../planning/check-089-auth-001.md) | compatibilityหลังแก้รอบ1 45cases | FAIL42pass/3fail; รอsysแก้รอบ2หลังgRPCwriterจบ |
| [check088-grpc](../planning/check-088-grpc-001.md) | BtypedgRPCLogout direct/wire101cases | FAIL80pass/21fail/7groups; กำลังแก้รอบ1ใน089 |
| [check089-Ghelper-r1](../planning/check-089-gateway-r1-001.md) | G requestpreparationหลังแก้รอบ1 | PASS433/433; parentรันซ้ำ433ผ่าน เป็นhelpersubsetไม่ใช่fullG |
| [parent088](../planning/handoff-004.md) | regressionปิดท้ายและcompileGhelper | 4032pass/0fail; Ghelpercompileผ่านแต่solutionbuildติดpackages; ไม่แทนnewcodeacceptance |

## Change Log

- 2026-10-24 — รับcheck041และactualrun; ไม่มีcanonicaltask/gateclose
