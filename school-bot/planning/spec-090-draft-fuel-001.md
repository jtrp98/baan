# REQ026 — draft fuel clarification

วันที่2026-10-26 · spec CodexT2 run 2026-10-26-14-30-17-spec-tier-t2-1agents-I3wFS9 · DONE · นายช่างสกัด

**Fuel≤1000เป็นก่อนRun ไม่ใช่เงื่อนไขปฏิเสธSave/Load/Migrationของstructurallyvaliddraft**. ไม่มีdraftfuelbudgetต่อstackหรือรวมdocument. ข้อวินิจฉัยจากREQ026BR02602/AC02602/04, signedint002§4/decisions038, actualBlockMode.tsx run:220/save:238 และTP001020:334; ไม่ใช่มติธุรกิจใหม่/ไม่เพิ่มACIDsหรือscope.

Controllerใช้exactamendmentของspecในREQ026: BR01แยกรันหนึ่งลำดับจากdraftหลายstack; BR02fuelและoutputcommandsเป็นrunconstraints; AC03ก่อนRunfuel1000ผ่าน/1001reject; AC04roundtripคงenabledรวมdraftเกินrunfuel/outputถ้าstructuralvalid. Structural≤1000storedblocksทั้งdoc/ID/union/depth8root0รวมdisabledคงตามarchpacket.

| Example | Expected |
|---|---|
| jumpenabled1+disabled998/singlestack | fuel1000ผ่านfuelgate |
| เพิ่มdisabledอีก1/storedรวม1000 | draftเก็บเปิดได้/Runfuel1001rejectก่อนส่ง |
| หลายstackstructuralvalid | save/loadได้/runrejectone-stack ไม่คิดdraftfuelbudget |
| nestedrepeat8+leaf /9+leaf | structuralผ่าน8/reject9 |
| stored1000/1001หรือinvaliddisabledbody | จำนวนผ่าน1000/reject1001; ข้อมูลผิดยังreject |

Checkownerต้องถอนoracleFuelOverflowที่คาดstoredenyเพราะfuelอย่างเดียว แล้วแยกdraftpassกับrunrejectภายใต้AC02603/04/TP001020เดิม. **ไม่เปลี่ยน63/26/1เก่าย้อนหลังเป็นPASS**. ผลเก่าเป็นharnessresultไม่ใช่ทุกfailureเป็นproductbug (ยังมีAncestorSwapsetupblocked). ArchจัดDESประโยคกำกวมให้แยกstructuralกับrunfuel; TPownerผูกขั้นตอนเดิมไม่เพิ่มtestcaseID/AC. ไม่มีคำถามธุรกิจค้างในเรื่องนี้; GoFS/parser/receipt/structural/depthและpurefuelcheckerเดินได้.

## Change Log

- 2026-10-26 — รับspecDONEและamendREQ026ตามคำวินิจฉัย/มติเดิม; ส่งarch/check/TPตามเจ้าของ ไม่สร้างpolicyใหม่หรือเปิดคำถามผู้ใช้.
