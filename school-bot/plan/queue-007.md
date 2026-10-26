# คิว007 — readiness ครบ63 implementation tasks

วันที่2026-10-26 · เจ้าของเนื้อหา GM CodexT2 run 2026-10-26-13-50-10-gm-tier-t2-1agents-ak959i · นายช่างสกัด

ตรวจin-memoryครบBE39+FE24=63: **21tasksมีlocal subsetพร้อม / 5มีงานเดิมหรือผลบางส่วน / 37รอเหตุผลเฉพาะ**. จึงต้องเดินCONTINUEต่อ ไม่หยุดเพราะcanonical62/63gated. คง110tasks/17gates/44REQ186AC81TP/15verified95pending/IDs/DAG. รายการนี้เป็นsubsetreadiness ไม่เปลี่ยนcanonicalstatusและไม่รับรองruntime.

เทียบreceiptล่าสุดหลังGMเริ่มอ่าน: [parentB150/4147ผ่าน](../planning/slice-090-grpc-math-parent-001.md)แต่[finalcheck2222pass12fail8NOT_RUN](../planning/check-090-grpc-r2-001.md)ครบ2reworksต้องรอคำตัดสินท้ายวง; [GJPO](../planning/jpo-090-gateway-r1-001.md)ยังOPENlogleak/earlydeadlineส่งrework2; Local63/26/1ได้[archboundary](../design/local-project-boundary-001.md)แล้วรอGoR1/Specเฉพาะdraftfuel. ไม่เปิดimplementationเดิมซ้ำ.

## ลำดับงานพร้อม

1. TP002 executable failure fixtures: fakeclock/store/failpoints FX01a/01b/02. ต้องมีconsumer/runnableproof ไม่เขียนfakebusinessimplementationให้แทนของจริง.
2. BE028 supplied-row transform กับBE003 authorization/replaycore แยกpureApplicationhelpers; ไม่HTTP/DB/key/bootstrap.
3. FE001 entry +FE005 shellตามsignedint001/injectedentitlement/save/close; ไม่productionfakefallback.
4. BE018 manifestvalidator→BE019 localworkflowกับexplicitpolicy/pin/registry/installeroutcomes; ไม่download/executeจริง/ไม่อ้างOSrecovery.
5. BE007 entitlementtime/denialcoreกับinjectedverifier/store; ไม่unlockhostจากunsignedclaims.
6. BE016 automatic-v1 evaluator จากcriteriaที่callerส่ง; ไม่แต่งrubric/defaultscores/publish.
7. BE030 questionvalidator→BE031 answerscorerจากsnapshot; ไม่attemptlifecycle/finalizer/reveal.
8. FE004 codecs→FE006/007 signedLablogicกับDSL/compilerจริง/injectedclient; ไม่ผูกstoreที่ยังตก.
9. BE010/013/014 existingIPC/enginefakeprocess/dryrunprobesและแก้เฉพาะdelta; ไม่เปลี่ยนpublicprotocol/USBก่อนrobotcontract.
10. FE008/009 existingprofile/probe/queueและFE010/011/012 sequence/upload/read/lostผ่านfakeBridge; ไม่motion/physicalstop/calibration.

BE024 Guesttrash/exportเป็นคิวมีเงื่อนไข: หลังBE009FS/behaviorแก้และcheckผ่านจึงต่อจริง; FXclock/expiryเดินแยกได้. Repoเดียวonewriter/ไม่เกิน3roles. งานสัญญาLUX01–07/rosterresolver/PK-onlytransactionenforcementต้องroutearch/vaultก่อนผูกของจริง ไม่โยนtechnicaldesignให้ผู้ใช้เดา; ไม่เอกสารเกิน5ใบติดกัน.

## รอคำตัดสิน/เจ้าของท้ายวง

Canonicalstagedlocal/liveยังรอผู้ใช้และlinterproofก่อนapply ไม่ล้างDAG/gates. H5/Light/G/B/BFF/trust/tenant/bootstrap/linkageตามownerpacket; DBEV/catalogparity/transaction/gradeproofตามDBcover; contentinventory/revision/media/rubric/คู่ผ่านไม่ผ่าน; hardwareQ3รุ่น/board/firmware/calibration/stopcriteriaและคนรับรอง; cert/distribution/publisheridentity/RCและDarwinIntelARMrunner; GprivateSecurity0.5.1packageavailability. ไม่ถามdevGateway/replay900/UX7ชุดซ้ำ; signer/custodyพัก047.

ข้อความผู้ใช้forward: ขอแต่ละเจ้าของคืน Task/หัวข้อ | ผู้ตอบ | วันที่ | artifact revision/ref | รับรอง/รอหลักฐาน/ไม่รับรอง | เงื่อนไขค้างและผู้รับต่อ ตามownerpacketเดิม แยกapprovalจากruntime/NOT_RUNและส่งเฉพาะข้อมูลปกปิดแล้ว ไม่ส่งsecret.

## Inventory ราย task

พาธย่อจากGM: D/ = knowledge/school-bot/design; U/ = uxui; S/ = target/school-bot. ตารางเป็นผลตรวจreadiness ณGMrun; receiptที่ใหม่กว่าข้างบนมีprecedence.

| Task | Readiness / reason category | Artifact/contract/gate ที่พร้อมหรือยังขาด |
|---|---|---|
| BE-001 | บางส่วนผ่าน / evidence | Auth45ผ่าน; ยังขาด C1–C10/collation/EV01–05 และ fullLogin proof — G-AUTH |
| BE-002 | ติด / DB evidence | DBA-003 catalog parity, transactions/restart และ mapping4DB ยังไม่ครบ — G-CORE |
| BE-003 | พร้อม Q3 / authz-replay | `D/license-admin-security-001.md`; live session/bootstrap/cipher custody ยังไม่พร้อม |
| BE-004 | ติด / trust contract | `D/des-002.md` ยังรอยืนยัน machine/shared-user custody และ binding/nonce transaction proof; signerพัก047 |
| BE-005 | ติด / DB contract | BE-004 binding/epoch/idempotency/audit และ concurrent activation transaction ยังไม่มีหลักฐานครบ |
| BE-006 | งานเดิม / rework | B rework2/G JPOตาม090; fullLogin continuation/linkage/H5ยังค้าง ห้ามเปิด logoutซ้ำ |
| BE-007 | พร้อม Q6 / entitlement core | expiry/denial/clock แยกได้จาก `D/des-002.md`; real OS store/device custodyยังค้าง |
| BE-008 | ติด / DB contract | `D/project-api-001.md`: current-pointer/ownership/dedup ภายใต้ PK-only SQL ยังไม่พิสูจน์; project RPCยังขาด — G-PROJECT-DB |
| BE-009 | งานเดิม / FS behavior | parent63/26/1จาก QA index; รอ checkและงานแก้เดิม ไม่รับ compilerผ่านแทนbehavior |
| BE-010 | พร้อม Q10 / IPC fake | `D/des-001.md`, manager seam; public host hookupยังรอ BE-007/SA-003/G-ROBOT-CONTRACT |
| BE-011 | ติด / platform proof | `D/des-006.md`, `engines/zide/CMakeLists.txt`; ยังไม่มี Darwin HID runnable build/runner evidenceครบIntel+ARM |
| BE-012 | ติด / platform proof | Darwin enumeration/POSIX serial backend และdual-arch runner evidenceยังไม่มีในชุดตรวจ; ห้ามเดา `/dev` identity |
| BE-013 | พร้อม Q10 / engine dry-run | payload/boundsจาก `D/robot-boundary-001.md`; breaking integrationและphysical proofยังค้าง |
| BE-014 | พร้อม Q10 / stop fake | cancel/drain/read/torque failure logicจากrobot boundary; physical stopไม่ถูกพิสูจน์ด้วยfake |
| BE-015 | ติด / content+contract | BA-005/006 approved inventory และ BE-027/029/LUX07 typed learning routesยังขาด |
| BE-016 | พร้อม Q7 / evaluator core | `automatic-v1` จาก `D/des-005.md`; approved numeric rubric/content/full grading flowยังค้าง |
| BE-017 | ติด / authority contract | `D/teacher-authority-001.md`: history/move/status/term resolver proofและArm rubric/typed APIยังขาด |
| BE-018 | พร้อม Q5 / manifest validator | `D/des-007.md`, `D/release-trust-001.md`; signer/publish/persistenceจริงยังค้าง |
| BE-019 | พร้อม Q5 / update fake | `plan/BE-019.md` อนุญาต injected workflow; registry/publisher pin/OS/DBจริงยังค้าง |
| BE-020 | ติด / package artifact | runnable payloadจาก FE-005/016/012/BE-019, RC hashes และ MSI repair proofยังไม่ครบ — G-DELIVERY |
| BE-021 | ติด / package+platform | BE-011/012 Universal artifacts และ Intel/ARM PKG recovery runnerยังไม่ครบ |
| BE-022 | ติด / certificate | BE-020/021 RC artifacts และ cert/distribution/publisher identityจาก `D/signing-custody-001.md` ยังขาด |
| BE-023 | ติด / deploy contract | `plan/owner-packet-001.md`: H5/Light/BFF manifests และ deployable backend/web outputsยังไม่ครบ |
| BE-024 | ติด / local dependency | BE-009 FS behaviorยังตก; `D/guest-workspace-001.md` ต้องต่อ lock/atomic trash/exportจริง; Q1อิสระ |
| BE-025 | ติด / receipt contract | `D/guest-import-001.md`: canonical hash/receipt protection และ cross-instance dedup transactionยังไม่พิสูจน์; BE-008/009ยังไม่พร้อม |
| BE-026 | ติด / content dependency | `D/guest-history-001.md`: verified published mission/criteria IDs และ BE-025/016/017 recheck/provenanceยังไม่พร้อม |
| BE-027 | ติด / API contract | `D/learning-ux-contract-gaps-001.md` LUX01 draft/read/edit/approval/ETag และ LUX07 typed routesยังเปิด |
| BE-028 | พร้อม Q2 / row transform | REQ045/DES005/source003เพียงพอสำหรับ O/P–X; LUX02 stable-key/storage/atomic import/dedupยังขาด |
| BE-029 | ติด / roster contract | `D/teacher-authority-001.md` history/move/status/term resolver และ CourseRun typed DTOยังขาด |
| BE-030 | พร้อม Q8 / question validator | DES010กำหนดชนิด/options/keys/max_scoreแล้ว; bank draft read/edit/reveal/APIตามLUX03/07ยังค้าง |
| BE-031 | พร้อม Q8 / pure scorer | DES010มีquestion/answer shapeและกฎคะแนน; LUX04readback และ LUX05clock/race/finalization/recoveryยังไม่ตรึง |
| BE-032 | ติด / authority contract | BE-031 lifecycle และ teacher override/retake authority/recheck/typed contractยังไม่ครบ — G-AUTH |
| BE-033 | บางส่วนผ่าน / pure helper | Weighted37ผ่าน; policy freeze/source selection/LUX06 immutable snapshotยังไม่ครบ |
| BE-034 | ติด / snapshot contract | LUX06 source refs/aggregate projectionกับdictionaryยังต้องreconcile; roster/term-end proofยังขาด |
| BE-035 | ติด / grade evidence | SA004/DBA007ผ่านเอกสารเท่านั้น; GradeSlot target/cardinality/ownershipและBE039authorityจริงยังไม่พิสูจน์ |
| BE-036 | บางส่วนผ่าน / pure helper | Conversion33+9ผ่าน; preview/source snapshot/BE035mapping/confirmationยังไม่ครบ |
| BE-037 | ติด / writer evidence | DES009ยังขาด runtime G-PARITY/COEXIST/TARGET/AUTHZ/DB รวมCASและdurable receipt; TP003/DBA007ไม่ใช่runtime |
| BE-038 | ติด / writer dependency | BE037 durable receipt/recovery, BE032authz และreal outbox transactionยังไม่พร้อม |
| BE-039 | ติด / owner H5 | opaque peer/tenant/private BFF/bootstrap/linkage confirmationsตามowner packetยังขาด — G-AUTH/G-CORE |
| FE-001 | พร้อม Q4 / signed entry | signed `U/int-001-entry.md`; ใช้ injected entitlement ไม่เปิดhostจริง |
| FE-002 | ติด / login contract | `D/desktop-login-adapter-001.md` ยังขาด public continuation/completion, selector/attempt/profile/device binding; ไม่เดาDTO |
| FE-003 | ติด / local dependency | BE009FSยังตก, public local bridgeยังไม่ต่อ, BE008cloudยังไม่พร้อม; UXเซ็นแล้ว |
| FE-004 | พร้อม Q9 / project codec | DES003tagged contentและcallerseamมีแล้ว; store/bridgeจริงยังไม่ถูกเชื่อม |
| FE-005 | พร้อม Q4 / signed shell | signed int001 + DES001 + existingwindowLifecycle; host gateจริงยังค้าง |
| FE-006 | พร้อม Q9 / signed Lab | REQ025/int002/useCodeLab; DSLจริงผ่านinjected client ไม่ใช่grading |
| FE-007 | พร้อม Q9 / signed Lab | REQ026/int002/BlockMode; single-stack/nesting/fuel/schema ไม่ต้องเดานโยบาย |
| FE-008 | พร้อม Q11 / profile fake | DES006/int002/engineAdapter; fakeprobeไม่รับรองcalibration/acceptance |
| FE-009 | พร้อม Q11 / queue fake | NativeWorkspaceมีpending/generation seam; ทดสอบfailure/late callbacksโดยไม่motion |
| FE-010 | พร้อม Q12 / sequence fake | NativeWorkspace/ZideTransport และrobot boundary; drain/stop/loop logicไม่ใช่physical stop |
| FE-011 | พร้อม Q12 / upload fake | NativeWorkspacebatch4/progress-after-reply/run state; ไม่uploadบอร์ดจริง |
| FE-012 | พร้อม Q12 / read fake | engineAdapter/NativeWorkspace: full-six-read/torque/lost/reconnect; ไม่ยืนยันpoll cadenceใหม่ |
| FE-013 | ติด / content dependency | BA005/006 approved lesson bundleและBE015typed viewยังขาด; ไม่ใช้sampleเป็นหลักสูตรจริง |
| FE-014 | ติด / result dependency | FE013real curriculumและBE015/016submission/assessment flowยังไม่มี; evaluator coreอย่างเดียวไม่พอ |
| FE-015 | ติด / authority contract | BE017teacher scope/history resolverและtyped review APIยังขาด; UX004เซ็นแล้ว; หน้าครูอยู่school_web |
| FE-016 | ติด / progress contract | DES005actual progress projection/scopeผ่านBE017/FE014/015ยังไม่พร้อม; ไม่เติมดาวหรือemployeecloudผลสมมติ |
| FE-017 | ติด / local dependency | FE003library/public bridgeและBE024trash/exportยังไม่รับผลbehavior; int003เซ็นแล้ว |
| FE-018 | ติด / import contract | BE025receipt/hash/protectionและBE026recheck/provenanceยังไม่ครบ; ไม่มีauto-upload |
| FE-019 | ติด / API contract | LUX01/02/07: draft/import source-key/dedup/atomicity/readback typed RPCยังขาด; UX005เซ็นแล้ว |
| FE-020 | ติด / API contract | LUX03/07: bank read/edit/ETag/answer visibility typed RPCยังขาด; UX005เซ็นแล้ว |
| FE-021 | ติด / attempt contract | LUX04/05: resume/history/saved answers/effective policy/time readbackยังขาด; UX007และมติ042ตอบแล้ว |
| FE-022 | ติด / snapshot contract | LUX06aggregate/source refs และ BE029/032/034roster/authz/typed viewsยังไม่ครบ |
| FE-023 | ติด / grade contract | BE035actual GradeSlot/ScoreMapping authorityและtyped readbackยังไม่พร้อม; UX006เซ็นแล้ว |
| FE-024 | ติด / grade dependency | BE038durable export/conflict/recovery outcomesและFE023mappingยังไม่พร้อม; UX006เซ็นแล้ว |

## Change Log

- 2026-10-26 — สกัดGMครบ63rowsและ21ready subsets; countsAC181เก่าในqueue006ถูกowner-map089แก้ครบ186แล้ว ไม่เปิดdeltaเดิมซ้ำ; joinedJSONยังต้องinspectsync186/81. canonicalstagedข้อเสนอไม่apply.

- 2026-10-26 — รับBfinalwirecheckFAILหลัง2reworks; ไม่เปิดr3เองและไม่หยุด21localreadyอื่น. Gยังrework2/archLocalทำงาน; เปิดFrontFE001/005CodexT2ต่อแล้ว.
