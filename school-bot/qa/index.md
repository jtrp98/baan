# SchoolBot — QA index

| รอบ | Scope | Verdict |
|---|---|---|
| [round001](round-001.md) | local logout + Gateway web outcome component | PASSเฉพาะlocalscope; PG/fullLogin NOT_RUN |
| [check089-auth](../planning/check-089-auth-001.md) | compatibilityหลังแก้รอบ1 45cases | เดิมFAIL42pass/3fail; [rework2](../planning/slice-089-auth-r2-001.md) parent4077ผ่าน รอfinalindependentcheck |
| [check089-grpc-r1](../planning/check-089-grpc-r1-001.md) | BtypedgRPCLogoutหลังrework1 direct/wire/log150assertions | FAIL119pass/31fail; เหลือ4groups รอexactnegativeboundaryจากarchก่อนsysrework2 |
| [check089-Ghelper-r1](../planning/check-089-gateway-r1-001.md) | G requestpreparationหลังแก้รอบ1 | PASS433/433; parentรันซ้ำ433ผ่าน เป็นhelpersubsetไม่ใช่fullG |
| [parent088](../planning/handoff-004.md) | regressionปิดท้ายและcompileGhelper | 4032pass/0fail; Ghelpercompileผ่านแต่solutionbuildติดpackages; ไม่แทนnewcodeacceptance |

## Change Log

- 2026-10-24 — รับcheck041และactualrun; ไม่มีcanonicaltask/gateclose
