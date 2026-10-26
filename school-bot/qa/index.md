# SchoolBot — QA index

| รอบ | Scope | Verdict |
|---|---|---|
| [round001](round-001.md) | local logout + Gateway web outcome component | PASSเฉพาะlocalscope; PG/fullLogin NOT_RUN |
| [check089-auth-final](../planning/check-089-auth-math-final-001.md) | compatibilityrework2 exact45cases | PASS45/45เฉพาะsubset; C1–C10/fullLoginpending |
| [check090-math](../planning/check-090-math-r1-001.md) | weighted/conversionpurehelpersrework1 | PASSWeighted37/Conversion33/additional9; ownerlabelpatchติดตั้งแล้ว [parent4147PASS](../planning/slice-090-grpc-math-parent-001.md) |
| [check089-Gtyped](../planning/check-089-gateway-typed-001.md) | HTTP→typedprotobuf→gRPC TestServer | เดิมFAIL258pass/2fail; [fix parent3/3](../planning/slice-090-gateway-r1-001.md); [JPOพบSEC001-016logleak/017earlydeadline](../planning/jpo-090-gateway-r1-001.md); rework2กำลังทำ |
| [check089-grpc-r1](../planning/check-089-grpc-r1-001.md) | BtypedgRPCLogoutหลังrework1 direct/wire/log150assertions | FAIL119pass/31fail; แก้rework2แล้ว[parent150/150](../planning/slice-090-grpc-math-parent-001.md)แต่[finalcheckFAIL2222pass12fail8NOT_RUN](../planning/check-090-grpc-r2-001.md)ครบ2reworksรอคนท้ายวง |
| [check089-Ghelper-r1](../planning/check-089-gateway-r1-001.md) | G requestpreparationหลังแก้รอบ1 | PASS433/433; parentรันซ้ำ433ผ่าน เป็นhelpersubsetไม่ใช่fullG |
| [localprojects089](../planning/slice-089-local-projects-001.md) | Go v2store/migration | checker90casesส่งoverlay; parent63pass26fail1skip [archboundaryพร้อม](../design/local-project-boundary-001.md)รอGoR1; [specRun-only](../planning/spec-090-draft-fuel-001.md)ถอนstoreFuelOverfloworacle/ไม่เปลี่ยนผลเก่าย้อนหลัง |
| [Front090](../planning/slice-090-front-entry-001.md) | signedentry/shell local | parenttypecheck/i18n14/build129/SSR99/15hashbindingผ่าน; interactionยังNOT_RUNรอcheckUI |
| [parent088](../planning/handoff-004.md) | regressionปิดท้ายและcompileGhelper | 4032pass/0fail; Ghelpercompileผ่านแต่solutionbuildติดpackages; ไม่แทนnewcodeacceptance |

## Change Log

- 2026-10-24 — รับcheck041และactualrun; ไม่มีcanonicaltask/gateclose
