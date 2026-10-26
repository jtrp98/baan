# SchoolBot — QA index

| รอบ | Scope | Verdict |
|---|---|---|
| [round001](round-001.md) | local logout + Gateway web outcome component | PASSเฉพาะlocalscope; PG/fullLogin NOT_RUN |
| [check089-auth-final](../planning/check-089-auth-math-final-001.md) | compatibilityrework2 exact45cases | PASS45/45เฉพาะsubset; C1–C10/fullLoginpending |
| [check090-math](../planning/check-090-math-r1-001.md) | weighted/conversionpurehelpersrework1 | PASSWeighted37/Conversion33/additional9; ownerlabelpatchติดตั้งแล้ว รอfullsuite4147 |
| [check089-Gtyped](../planning/check-089-gateway-typed-001.md) | HTTP→typedprotobuf→gRPC TestServer | เดิมFAIL258pass/2fail; [fix parent3/3](../planning/slice-090-gateway-r1-001.md); ImportantรอJPO |
| [check089-grpc-r1](../planning/check-089-grpc-r1-001.md) | BtypedgRPCLogoutหลังrework1 direct/wire/log150assertions | FAIL119pass/31fail; เหลือ4groups; archboundaryพร้อม/sysrework2resumeหลังproviderDNS |
| [check089-Ghelper-r1](../planning/check-089-gateway-r1-001.md) | G requestpreparationหลังแก้รอบ1 | PASS433/433; parentรันซ้ำ433ผ่าน เป็นhelpersubsetไม่ใช่fullG |
| [localprojects089](../planning/slice-089-local-projects-001.md) | Go v2store/migration | checker90casesส่งoverlay; parent63pass26fail1skip รอcheckรับผล/Go rework |
| [parent088](../planning/handoff-004.md) | regressionปิดท้ายและcompileGhelper | 4032pass/0fail; Ghelpercompileผ่านแต่solutionbuildติดpackages; ไม่แทนnewcodeacceptance |

## Change Log

- 2026-10-24 — รับcheck041และactualrun; ไม่มีcanonicaltask/gateclose
