# timetableai — QA Round 16 — FE-021 build recheck

> qa-engineer · solo · Phase 8 · วันที่ผู้ใช้ 2026-10-11 / jtrp98 · build environment recheck ONLY หลัง SA amend · ใช้ templates/qa-round.md
> F = C:/src/schoolbright/target/sb-tech-upgrade-web-system; B = C:/src/schoolbright/target/sb-api-academic-timetable-ai. รอบเก่าคง verbatim; ผู้ใช้ยกเลิกงบเอกสารแล้ว.

## Open Issues

| ID | Task | Severity | สถานะ |
|---|---|---|---|
| QA-006 | FE-021 | Important | resolved ด้าน fixture ตาม QA15 ของ sessionจริง 43/43 + full1049/1049; buildรอบนี้ผ่านโดยใช้cacheที่อนุญาต ไม่ reopen |

## Round 16

**Status:** ✅ Verified

Output PASS / FE-021 verified: approved-cache build attempt4 exit0 พร้อม QA15 typecheck/scopedlint/fulltests/fixturetests ของ sessionนี้ซึ่ง sourceไม่เปลี่ยน. Attempts1–3ล้มก่อนcompileตามประวัติด้านล่าง. ผลนี้เป็นdev/codeverification ไม่ใช่released/humanacceptance/schema/production/deployapproval; defaultcacheยังไม่ได้แก้ถาวร.

### Checks run

คำอนุญาตจริง: **jtrp98 วันที่ 2026-10-11: “อนุญาตลอง cache นี้เฉพาะคำสั่ง build (แนะนำ)”** ต่อคำถาม exact root
`C:/Users/jabja/.codex/visualizations/2026/10/09/01a1201c-fd22-72d1-8682-50bca437e488/swc-native-cache`.
ครอบ cache preparation ภายใต้ rootนี้/process envเฉพาะbuild และ pathsyntaxที่ resolveเป็นphysicaldirectoryเดียวกัน; ไม่ใช่ ACL/source/dependency/permanent config/DDL/deploy approval. ใช้ narrow escalation เฉพาะcommand/checkoutputsในF. ทุกattemptใช้ try/finallyคืนค่า process SWC_NATIVE_BINDING_CACHE เดิมจริง.

| Check | Command | Result |
|---|---|---|
| approved-cache build (4 attempts; finalPASS) | `npm run build` โดย process `SWC_NATIVE_BINDING_CACHE=<same exact authorized absolute root>` | finalPASS exit0 — attempt4ใช้ Windows extended-length syntaxกับphysicalrootเดิมซึ่งverifiedก่อนrun; next.configโหลด186ms,Compiledsuccessfully48s,TypeScript5.6s,staticpages77/77ใน230ms,finaloptimization/routesสำเร็จ. Attempts1–3exit1ก่อนcompileตามตารางด้านล่าง |
| cache read/preparation/identity | อ่าน installed `node_modules/@swc/core-win32-x64-msvc/README.md`; GetFullPath/StartsWith(root+separator, OrdinalIgnoreCase); Test-Path; New-Item Directory -Forceเฉพาะerrorlockparent; Get-Item canonical/extended identity | inspected/prepared — READMEรองรับabsolutecustomroot; parentอยู่ภายในrootและมีอยู่จริง. Extended Get-Item.FullNameเมื่อstripprefixเพื่อcomparisonเท่านั้น=canonicaldirectoryเดียวกัน; ไม่ย้ายcache ไม่แก้ACL/registry/config |
| hashes before/after build | Get-FileHash SHA256 fixture,package.json,QA15 | unchangedทั้งสามไฟล์ก่อน/หลังattempts;hashesด้านล่าง |
| typecheck | `npm run type-check` | CARRY QA15 pass exit0; NOT RERUNตามbrief/sourceunchanged; buildattempt4ตรวจTypeScriptจริงเพิ่ม5.6sด้วย |
| scoped lint | `npm run lint -- tests/integration/timetable-session-expired.test.tsx` | CARRY QA15 pass exit0เฉพาะchangedfixture; NOT RERUN;ไม่อ้างfullprojectlint |
| full tests | `npm test` | CARRY QA15 ของ sessionนี้:93files/1049testspassed exit0,38.49s; NOT RERUN |
| fixture tests | `npm test -- tests/integration/timetable-session-expired.test.tsx` | CARRY QA15 ของ sessionนี้:43/43 exit0,8.54s; NOT RERUN |
| backend/browser/liveDB | — | NOT RUN |

| Attempt | Same physical cache root / preparation | Actual result |
|---|---|---|
| 1 | exactapprovedrootสร้างแล้ว; valueใช้ C:/Users/... syntax | exit1: Failedtoloadnativebinding;MODULE_NOT_FOUND ./swc.win32-x64-msvc.node;ERR_SWC_NATIVE_CACHE customopenlock os error3 “The system cannot find the path specified”;defaultAppDataLocal DACLreplacementrights0x1f01ff |
| 2 | GetFullPathเป็นC:\Users\...;ตรวจdescendant/เตรียมerrorlockparentด้วยNew-ItemDirectory-Force | exit1errorเดิม;parentมีอยู่จริง |
| 3 | Get-Item.FullName canonical;verifyequalsauthorizeddirectory;nootherprep | exit1errorเดิม;canonicalbackslashsyntaxยังไม่พอ |
| 4 | `\\?\` prefix+canonicalGet-Item.FullName;verifyextendedliteralresolvesphysicalrootเดียวกันก่อนbuild | exit0;compile/TypeScript/staticgeneration/optimizationผ่าน;envrestored |

Errorlockparentจริง:
`<authorized root>/swc-native-S-1-5-21-102196212-2591113451-3018522968-1001/v1`.
Lockfilenameจากerror:
`770e584dccdd971808f3dc63c981b500c6ff9cf9b63aaa24b1d0e6c7be18f606fce45de3a6cadd277cbd077c7688b6ad22f7306910c97f82c00a8716debff3fb.lock`.
Measuredroot101chars,parent161chars,actualhash128chars → fullnormalWindowslockpath295chars; parent=True. Extended-lengthsame-rootbuildผ่านเป็นหลักฐานว่าวิธีนี้ปลดloaderblockerในการตรวจครั้งนี้ได้; ไม่อ้างว่าDACL/defaultcache/dependenciesถูกซ่อมถาวร และไม่ตั้งregistry/ACL/alternatephysicalroot/SWC_BINARY_PATH.

คำสั่งที่ผ่าน (รันจาก F; cache physical root เดิมที่มนุษย์อนุมัติ):
```powershell
$priorSwcCache = $env:SWC_NATIVE_BINDING_CACHE
try {
    $env:SWC_NATIVE_BINDING_CACHE = '\\?\C:\Users\jabja\.codex\visualizations\2026\10\09\01a1201c-fd22-72d1-8682-50bca437e488\swc-native-cache'
    npm run build
    $buildExit = $LASTEXITCODE
} finally {
    $env:SWC_NATIVE_BINDING_CACHE = $priorSwcCache
}
```

Buildrouteoutputมีทั้ง7timetableroutesและ `/api/school/[schoolId]/years/[yearId]/terms`. ไม่มีsource/deps/permanentconfigfixจากQA;buildoutputs/cacheเป็นผลจากcheckที่อนุญาต.

| Evidence file | SHA256 ก่อนและหลังbuild |
|---|---|
| F/tests/integration/timetable-session-expired.test.tsx | EC5EC0856E221DD6C1B765C6E39416259F2ABCC917DE6D02D6208FD1945D4818 |
| F/package.json | BF9298B022D816217EEEFB29ABE3E43F57E3FCE928BAFC5349F0677BE51BBD91 |
| qa/round-15.md (closed;preservedverbatim) | 4B47FA87676D9CB2E8AC50074F09230C3886674BB293FAD17CC7405906D4FF91 |

DriverยืนยันFE-021codeunchangedsinceQA15ด้วยread-onlyaudit;sessionนี้ไม่รันgit. Hashesยืนยันfixture/manifest/closedQA15ระหว่างrecheck ไม่อ้างแทนentiretreeaudit.

### perTask

| Task | Result | หลักฐาน |
|---|---|---|
| FE-021 | verified | ✅ Verified finalapproved-cachebuild exit0 + ownQA15typecheck/scopedlint/full1049/fixture43pass; QA-006resolved; manual/schema/production/deployholdsแยกคงเดิม |

### Feature QA flows

ไม่ใช่ Feature QA/runtime flowรอบใหม่. Contract REQ-012 AC-026/027/065 และ REQ-021 AC-063/066..070 อ่านตาม index-first; DES-009 §34.2/2a/3/4, DES-018 §43.2b ยังไม่เปลี่ยนใน scope FE-021. ผลแต่ละข้อเป็น carryของ sessionจาก QA15 ไม่ใช่ testรันใหม่:

| AC / contract | Result | Evidence |
|---|---|---|
| AC-026 term/bridge/S1 | ⚠️ Partial carry | QA15:46 — mocked scoped calls/bridge/conflictผ่าน; live7routes/DBยังไม่รัน |
| AC-027 Terms/no guessed term | ✅ Verified automated carry | QA15:47 — validopaque/scoped Terms + empty/multiple/malformed fail-closed; fixtureยังhashเดิม |
| AC-063 auth regression | ✅ Verified automated carry | QA15:48 — target401จริง/receiverจริง,403visible+rollback,200control |
| AC-066 401 silent | ✅ Verified automated carry | QA15:49 — ToastProbeนอกprovider/SessionExpired/token-cleared;43fixturetests |
| AC-067 failure viewable | ✅ Verified automated carry | QA15:50 — missingterm/status0/-1ไม่ค้างspinner/empty; fullsuite1049passed |
| AC-068 disabled/no writes | ✅ Verified automated carry | QA15:51 — fail-closedsettings/save/tabguards |
| AC-069 pending Generate | ⚠️ Partial carry | QA15:52 — existingregressionsuiteผ่าน; livependingGenerateยังไม่walk |
| AC-070 reload/no retry | ⚠️ Partial source carry | QA15:53 — noautoretry/source; browserrecovery/retryUXยังunverified |
| AC-065 paired cutover | ⚠️ Partial carry | QA15:54 — BE-010/FE-021 DDL/backfill/SA-Q8/deploy window hold |
| URL/dirty/stale approved subset | ✅ Verified automated carry | QA15:55 — term-contexttests/query/school-year/dirty/history/lateVRpassed; no freshbrowserQA |

### Review findings

review13 PASS อ่านใหม่; ไม่พบ scope/source changeให้ reopen finding. หนึ่งแถวต่อ finding คงผลเดิม:

| Finding | Result | Evidence |
|---|---|---|
| REV-006 | ✅ Verified carry resolved | QA15:63 + review13 Open Findings |
| REV-007 | ✅ Verified carry resolved | QA15:64 + review13 |
| REV-008 | ✅ Verified carry resolved | QA15:65 + review13 |
| REV-009 | ✅ Verified carry resolved | QA15:66 + review13 |
| REV-015 | ✅ Verified carry resolved | QA15:67 + review13 |
| REV-010 | ⚠️ Partial carry backlog | review13 hub/yearnavigation Minor |
| REV-011 | ⚠️ Partial carry backlog | review13 classperiodform Minor |
| REV-012 | ⚠️ Partial carry backlog | review13 timetablegrid Minor |
| REV-013 | ⚠️ Partial carry backlog | review13 settings Minor |
| REV-014 | ⚠️ Partial carry backlog | review13 UX-007 metadata Minor |
| REV-016 | ⚠️ Partial carry backlog | review13 UX-009 historical Minor; sign-offไม่ใช่findingclosure |

### Data Model check

อ่าน current design/data-model.md **เต็ม**หลัง SA amend; SHA256
`1089670291E2B7C62E53F84E6106D49A6629B993886A4E33B457DC1C818D3893`.
§27.5 term contractไม่เปลี่ยน; เทียบกับ field evidenceจริงที่ sessionอ่าน QA15 และ code unchangedตาม driver:

| Field / relation | Result / evidence |
|---|---|
| Tbl_Setting.nYear / sTermID | ✅ Verified source carry — B Models/Tbl_Setting.cs:12–13 int?/string legacyNULL; QA15 DataModel; §27.5ข |
| Tbl_ClassPeriod.nYear / sTermID | ✅ Verified source carry — B Models/Tbl_ClassPeriod.cs:12–13 int?/string; §27.5ข |
| Tbl_TeacherClassAssignment.nYear / sTermID | ✅ Verified source carry — B Models/Tbl_TeacherClassAssignment.cs:11–12 int?/string; §27.5ข |
| Tbl_Timetable.nYear / sTermID | ✅ Verified source carry — B Models/Tbl_Timetable.cs:12–13 int/string; §27.5ข |
| TTerm.nTerm / tenant-year-deleted filter | ✅ Verified source carry — B TTerm.cs:16/25/32; WebAPIController.cs:56–66,170–181; stringopaque; §27.5ก |
| TermItem.sTermID/sTermNumber/dStart/dEnd | ✅ Verified source/fixture carry — F types/timetable.ts:188–193 string/string/nullable dates; fixture:90–96ตรงและmalformedlabelfail-closed; QA15 |
| Request.sTermID | ✅ Verified source carry — B Request.cs:131/163/196/262/311/343/373/397/414/421 stringเดิม; QA15 |
| Derived group/link/grid | ✅ Verified structure carry — B Tbl_TeacherSchedule.cs:20/Tbl_LinkSubjectSetting.cs:10–11/Tbl_TimetableClass.cs:12 parentreferencesไม่เก็บtermซ้ำ; livejoinsยังunverified |
| Class-period data.lstPeriods | ✅ Verified automated carry — fixture:411/427/444 status1/object/array[]ตรง DES-018§43.2b5.1; QA15 43/43 |

Future fields §27.6/§27.7ไม่ถูกทดสอบเป็นimplementationของFE-021: current §27.6ก2 C1′ storage/read-only chosen แต่ exact TRoomTermSetting/columns/PK/check/readstates/K=1/SA-Q5/SA-Q10 ยังproposal/ownerholds; §27.6ขคจ BE-013 schema/breaking/M1 **dev only approved**; §27.6ง A+atomicT1directionapprovedแต่exactsyncschema/runtime/receipt/transactionownerยังhold. ไม่ใช้ future proposalที่ยังไม่implementเป็นFE-021drift และไม่สร้างDDLapproval.


### Issues Found (defect packet)

ไม่มีappCritical/Importantfindingใหม่และQA-006ไม่reopen. SWCbuildvalidationblockerคลี่คลายเฉพาะapprovedextended-lengthcachecommandในattempt4; defaultcacheยังenvironmentlimitedและไม่มีpermanentrepair. RequiredchecksในapprovedFE-021devscopeครบจึงStatusverified;ประวัติreview8+10+QA9/fix1+fix2/fixtureextraoneคงเดิมไม่reset ไม่มีautonomouscodefixroundใหม่.

🔒 Phase8markerคงเดิม. SecurityauditPhase8เดิมไม่พบfindingใหม่ตามdriver/planและfixture-onlyไม่มีproductioncodechange;รอบนี้ไม่รันsecurityre-audit/ไม่สร้างnewsecurityapproval/ไม่ปิดSEC-01/02.

**Nextrole:** project-managerreconcileWaitingonHuman#6/#7/sequencingกับQA16และคำอนุมัติจริง;QAเขียนเฉพาะFE-021Statuscell. UXownerบันทึกUX-011approval; FE-023จากsignedUX-009และBE-013devหลังPMexactboundsไปต่อserialตามdriver โดยไม่เปิดroom/T1/schema/deploygatesเอง.

## Unverified Behaviour — undeployed phases

- Carry QA15/QA14 Phase8: liveBE-010/sharedDB, DDL4tables/backfillAC-028/legacyNULL/pairedBE-010+FE-021cutoverAC-065/SA-Q8/manual7routesยังไม่รัน; approved-cache build artifactรอบนี้ผ่าน; defaultcacheยังมีenvironmentข้อจำกัดเดิม; devapprovalไม่ใช่sharedDDL/deploy.
- Multi-tab/live school-switch/staleHTTPทุกlocale, keyboard/focus/contrast/responsive/extremetext/browsermanualE2Eยังไม่ตรวจ; jsdomproofไม่ใช่visual/a11yacceptance.
- UX-007 approvedsubsetคงเดิม; precisecopy/details/retry/UX-005/fullsignoffhold. UX-009signedแล้วตามdriverวันที่2026-10-11แต่solverruntimeไม่รัน; UX-011fulluserapprovalยังรอUXownerลงartifact; UX-008/010/012/013unsignedตามhandoff ไม่เซ็นแทนคน.
- Phase9 Copy/token/transaction, Phase10 whole-block/solver/groups, Phase11 mapping/capacity/caretaker/Academicusage, Phase12 caps/eligibility/precheck/recheckยังไม่liveverified; review:REV-016/backlogไม่ปิด.
- Current §27.6ก2 C1′ read-only/SQLartifact userexecเท่านั้น; exactshape/readstates/K=1/SA-Q5runtimeTRoom/SA-Q10mappingusageยังproposed. BE-012/FE-024consumersไม่เปิดเอง.
- BE-013 devschema/breakingขคจapproved/M1re-enterหลังpairedcutover ตามคำตอบ “อนุมัติรูปนี้สำหรับ dev; ตั้งเพดานใหม่เมื่อเปิดใช้”;ไม่มีDDLexecution/sharedmigration/deploy; BE-013/FE-025/DES-011 releasecutoverSA-Q8hold.
- Phase13 A+atomicT1directionapprovedonly; purePreview/replace/concurrency/replay/unknownoutcome/receipt/recordrecovery/attendance/roomdefaults/runtimeowner/§27.6งexactschemaยังรอยืนยันและไม่รัน.
- CarryQA8ผ่านQA15: livemenuupstream/periodJSON/liveDB/deepJSONไม่E2E; SA-Q14MenuID401..404/422/permissions/Type/Role+TP-D2authmasterdataรอDevOps/owner; SEC-03proofไม่แทนFE-021/liveQA.
- §27.5schema/DDL/backfillและownerholdsยังเปิด; archive:2717ไม่ใช่approval. SEC-01/SEC-02productionholdคงเดิม; ไม่rotate/รับrisk/release/deploy/migrationแทนมนุษย์.


## Change Log

- 2026-10-11 — Round16 FE-021 PASS/verified:approvedsame-rootextended-lengthcachebuildattempt4exit0;attempts1–3failbeforecompile preserved. CarryownQA15typecheck/scopedlint/full1049/fixture43/QA-006resolved;envrestoredทุกattemptและQA15verbatimhashunchanged. CurrentSAfutureholds/manual/schema/SEC01/02production/deployคงเดิม;noACL/source/deps/config/git/DDL/deploy.

Back-links: `../../../../build/plan/INDEX.md` · `../../INDEX.md`

