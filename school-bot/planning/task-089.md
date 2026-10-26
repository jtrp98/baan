# ใบงาน089 — CONTINUE-NORMAL: เดินงานขนานต่อจาก handoff004

วันที่ 2026-10-26 · นายช่าง · ผู้ใช้เลือก school-bot และสั่ง parallel

## ขอบเขต

ต่อจาก index → plan/index → handoff004/queue005; ใช้ baan-role ทุก role ไม่ implement เอง. เปิดไม่เกิน 3 งานอิสระพร้อมกัน และ serialize writer ของ repository เดียวกัน. T0–T2 Codex / T3–T5 AGY --no-fallback (ช่วง T3 ในคำสั่งทับกัน: ใช้ AGY ตามช่วงหลังและกติกาโมดูลเดิม เป็นสมมติฐานย้อนกลับได้).

คำสั่งเริ่มรอบนี้ให้ทำงานต่อ ยกเลิกการหยุดรอบ088ตาม048เฉพาะการทำงานต่อ ไม่เปลี่ยนประตู production/DB/hardware/signer. Canonical 110 tasks: 15 verified/95 pending; lint exit1 implement63/gated62/readyBE001. งาน subset ไม่ปิด canonical task ทั้งงาน.

## คิวเริ่ม

1. check Codex T2: ตรวจ auth compatibility รอบ1โดยอิสระจาก spec และ artifact ไม่ส่งคำอ้างผู้เขียนเป็นหลักฐาน.
2. sys AGY T3 write school-bot: แก้ gRPC รอบ1ตาม check088 ทั้ง7กลุ่ม คง production registration ปิด.
3. gm Codex T2 read-only: ทบทวน local/live proposal เมื่อ lint failและคิวที่พร้อม ไม่ apply canonical DAG เอง; รวบรวมคำถามท้ายรอบ.

หลังจากนั้นซ่อม/ตรวจ Gateway dependency/helper และเดิน local slices ตาม queue005 โดยไม่ข้ามสัญญาหรือประตูมนุษย์. ผลดิบอยู่ reports; สกัดผลลง knowledge แล้ว baan --commit ทุก slice. ผู้คุมรัน tests ซ้ำ; verified ใช้ check เท่านั้น.

## รอคำตัดสิน

เก็บคำถามธุรกิจ/สัญญา/schema/SQL/shared environment/security risk/hardware ไว้ถามพร้อมกันเมื่อไม่มีงานพร้อม. ไม่ถาม dev Gateway/replay900/UX7ชุดซ้ำ; signer/custodyยังพักตาม047. ไม่ commit/push/switch source Git ไม่รัน SQLจริง/deploy/hardware.

## Checkpoint และ related-impact sweep

- เปิด check Codex T2 และ gm Codex T2 แล้ว. AGY T3 ครั้งแรก failed เพราะ headless read_file permission ไม่มี output/code verdict (run `2026-10-26-09-50-05-sys-tier-t3-1agents-jAWwt2`); ใช้ setup/agy/grant-read.mjs เพิ่ม read-only เฉพาะ knowledge/school-bot แล้วลองใหม่ ไม่เปิด write/add-dir/skip-permissions.
- Gateway fetch-sb-packages.ps1 exit1: ไม่มี SB_NUGET_TOKEN/GITHUB_TOKEN และ gh ไม่อยู่ใน PATH; package availability ยัง blocked ไม่ใช่ assertion failure.
- gm NEEDS_HUMAN เฉพาะ canonical staged proposal; คิวและ traceability181/186 ส่งต่อใน queue006. เปิด checkGhelper CodexT2 เมื่อ gm จบ เพื่อให้สายGเดินต่อแบบcachedreferencesโดยไม่รอprivatepackages.
- กวาด Queue005/queue-005 ก่อนเปลี่ยน pointerปัจจุบันใน module/plan index เป็น006 (แก้ตาม sweep); เก็บ task088 เป็นประวัติ.
- Authcheck089 FAIL42/45จาก2บั๊ก; สกัดcheck-089-auth-001และเก็บexacttestpatchในreportsเพื่อส่งsysรอบ2. เปิดinspecttraceabilityเมื่อcheckauthจบ. กวาด “รอตรวจซ้ำ/กำลังตรวจอิสระซ้ำ” แล้วแก้module/QAindexตามverdict (แก้ตามsweep); receipt088คงเป็นประวัติ.
- Ghelpercheck FAIL1792/1795เฉพาะmetadata cap3cases; บันทึกcheck-089-gateway-001และส่งsysCodexT2แก้รอบ1พร้อมindependentregressionpatch. Bwriterและinspectยังทำขนานอยู่ รวมไม่เกิน3.
- Ghelperrework1DONE ผู้คุมรัน4cases/compileซ้ำexit0ตามslice-089-gateway-r1-001; เปิดindependentcheckใหม่. กวาด1792pass/3failก่อนเปลี่ยนQAstatusตามreceipt (แก้ตามsweep); checkreceiptเดิมคงประวัติ ไม่ปิดcanonicaltask.
- gmowner-mappingDONE: ผู้คุมapplyเฉพาะfields/5taskMarkdownตามowner-map-089-001 ครบ186ACโดยคง110IDs/17gates/status/DAG; lintยังexit1ตามจริง. เปิดGtypedadapterAGYT3เมื่อgmจบพร้อมscopedread-onlycanonicalproto; Bprotohashยัง37c03...635cตรงฐานตรวจเดิม. ไม่แก้helperที่checkกำลังตรวจ.
- Bgrpcsysrework1DONE (run0WAi50): writer4032regressionและ9targetedprobesผ่าน แต่รอindependentcheckใหม่ไม่รับsemanticchoicesของwriterเป็นcontract. เปิดcheckBเมื่อGhelpercheckจบ; sysauthrework2เขียนเฉพาะAuth/45testsขนานกับBcheckที่อ่านgrpcfilesเสถียร. Parent4032รอบแรกTestRunAbortedเพราะdatacollectorIPC90sในsandbox ไม่ใช่assertionfail ส่งรันซ้ำด้วยlocalIPCpermissions.
- GhelperrecheckPASS433/433และparent433/433ตามcheck-089-gateway-r1-001. กวาดรอindependentrecheckก่อนแก้QAstatus (แก้ตามsweep); เก็บslice089r1เป็นประวัติก่อนcheck. Gtypedwriterยังทำคนละไฟล์.
- ParentBregressionretryผ่าน4032/0/0exit0duration5s บันทึกslice-089-grpc-r1-001. กวาด “กำลังแก้รอบ1” และแก้module/design/QAindexเป็นrepairDONEรอwirecheck (แก้ตามsweep); ไม่เปลี่ยนผลcheck088ย้อนหลัง. Authrework2กำลังทำ ไม่ส่งBหรือGintegrationเป็นverifiedจากregression.
- Authrework2DONE; parent4077ผ่านและpersistent45casesตรงexactcheckpatchตามslice-089-auth-r2-001. กวาดรอแก้รอบ2ก่อนเปลี่ยนQAstatusเป็นรอfinalcheck. เปิดsysCodexT2numerichelpersเมื่อAuthwriterจบ; ไม่แตะAuth/Grpcที่checkอ่านอยู่.
- Numericครั้งแรกNEEDS_HUMANเพราะbriefไม่ได้ยืนยันwriterก่อนหน้าจบ; ผู้คุมยืนยันจากrunOiFl5B/parent4077จริงและเปิดT2เดิมใหม่ ไม่ถามผู้ใช้เรื่องschedulingfact. GtypedAGYconnectionexit3หลังสร้างpartialfiles; เปิดrunner/tierเดิมresumeตามgateway-partial-089-001 ไม่เปลี่ยนไปCodexหรืออ้างDONE.
- กวาดqueue-004เพิ่มเติมพบ15ไฟล์/19บรรทัด: แก้currentpointerในplanextension/designindex/ownerpacketเป็นqueue006และtask089 (แก้ตามsweep). dispatch/evidence/learninggapreceipt/JSONmetadata/queue003/planningเก็บเป็นsourceประวัติของรอบก่อนและcitations ไม่ใช้แทนCONTINUE089; ไม่เปลี่ยนสัญญาหรือgatesจากการเปลี่ยนลิงก์.
- NumericworkerBLOCKEDเพราะVSTestIPC; parentรัน4077/0/0exit0และตัวอย่าง79/7.5→8ผ่านตามslice-089-math-001. เปิดGowriterBE009เมื่อmathwriterจบและcheckAuth+Mathเมื่อGtypedwriterจบ. GtypedresumeDONE parentcompile/hashผ่านตามslice-089-gateway-typed-001; เปิดcheckGtypedCodexT2เมื่อBcheckจบ.
- Bwirecheck089FAIL119/150จาก4groupsตามcheck-089-grpc-r1-001. สกัดC#harnessgzipครบจริงแต่PSwrapperยังไม่มี; เตรียมarchT1ตรึงnegativepairsก่อนrework2ไม่ให้sysเดาcodesเองซ้ำ. ไม่เปิดrework3อัตโนมัติ.
- กวาดรอwirecheck/Gtypedadapterกำลังทำก่อนแก้module/designcurrentstatusเป็นBcheckFAILและGtypedรอcheck (แก้ตามsweep); ไม่เปลี่ยนreceiptประวัติหรือปิดlivegates.
- AuthMathcheckLb0BL0BLOCKEDเพราะผู้คุมระบุcanonicalpathsไม่ครบ แม้106localchecksผ่าน; บันทึกcheck-089-auth-math-blocker-001และเปิดrecheckด้วยabsolutepathsครบ. ไม่applyการถอนSystemIdcase42/ไม่ถือActivityIdlongMaxเป็นcanonicalexpectedโดยยังไม่อ่านspec.
- LocalGoDONE/parentGotests+vetexit0ตามslice-089-local-projects-001 แต่newpackageno tests; รอindependentFS/behaviorcheck. เมื่อGoจบเปิดarchT1negativeBและparentverification ไม่เปิดSchoolBotwriterซ้อน.
- AuthMathfinalcheckFTFIQP: AuthPASS45/45,WeightedPASS37/37,ConversionFAIL31/33จากdecimalmidpointdrift2cases. สกัดindependentMath70tests208lines/hashตรงลงreports ส่งsysT2rework1เฉพาะconversion+installtestsเมื่อslotว่าง/ไม่มีwriterSchoolBotอื่น. ไม่เพิ่มcanonicalverifiedจากsubset.
- กวาดAuth/Mathรอcheckก่อนแก้modulecurrentstatusเป็นAuth/WPASSและConversionFAIL/rework1 (แก้ตามsweep); receiptsเก่าคงเป็นประวัติก่อนverdict.
- กวาดด้วย baan --sweep “หยุดตาม”, “หยุดหลังปิดงาน”, “หยุดก่อนเปิดรอบแก้”: แก้สถานะปัจจุบันใน module/plan/design/QA index ตามคำสั่งเริ่มต่อของผู้ใช้ (แก้ตาม sweep). เก็บ handoff004/decisions048 เป็นประวัติและไม่แก้ผลค้นใน timetableai เพราะคนละงาน. ไม่เปลี่ยนสัญญา/AC/DAG/gates.

## Change Log

- 2026-10-26 — รับ CONTINUE-NORMAL และโมดูลที่ผู้ใช้เลือก พร้อม lint ก่อน dispatch.
