# Local projects boundary — Rev1

วันที่2026-10-26 · arch CodexT1/gpt-6-astra high ผ่านbaan-role run 2026-10-26-14-14-23-arch-tier-t1-1agents-p8z60N · นายช่างสกัด technicalclarificationของDES003ก่อนrework1

ฐาน [DES003](des-003.md), [ProjectAPI](project-api-001.md), [rules](data-contract-rules.md), [commontypes](data-dictionary/contract-001.md), [Guest](guest-workspace-001.md). ไม่มีschema/publiccode/IPCfieldใหม่; source6hashตรงparent. Parent63/26/1 (memory: planning/check-090-local-runtime-001.md)เป็นoverlayจริง; AncestorSwapAccessDeniedเป็นharnessblocked, symlinkskipเป็นgap, junctionoutsidewrite2filesในscratchจริง.

## Local errors และลำดับ

Save/Copy missing/≤0 integer expected_local_revision → PRECONDITION_REQUIRED ก่อนtargetread/write; rawnull/string/bool/fraction/out-of-range → PROJECT_INVALIDไม่coerce. Positive mismatch → VERSION_CONFLICT/current_local_revisionใต้lock. UUIDvalidไม่มีงาน → NOT_FOUND; ไม่มีentitlement → LICENSE_REQUIRED; invaliddocument → PROJECT_INVALID; sizebound → PROJECT_TOO_LARGE; securestorage/lock/commitทำไม่ได้ → STORE_UNAVAILABLE. เปลี่ยนimplementationPROJECT_NOT_FOUND/ENTITLEMENT_REQUIREDให้canonical ไม่เพิ่มHTTPstatus.

Rawsize/strictJSONก่อนtypedinput; หลังdecode: entitlement→expectedrevision→UUID→securestorage/lock→read/validatecurrentdoc→revisionconflict→candidatevalidate→entitlementrecheck→commit. ไม่เผยrevisionแก่ผู้ไม่มีสิทธิ์/ไม่ให้corruptfileกลายเป็นconflict/ไม่เขียนเมื่อสิทธิ์ถูกถอนขณะรอlock.

## Shared lock และ filesystem

Stablelockต่อworkspaceidentity+projectUUIDร่วมทุกLocalStore/process ครอบreadrevisionถึงcommit; ทุกcreate/save/copy/import/migrationใช้ทางเดียว. LockartifactแยกจากJSONที่ถูกreplace ไม่unlink/recreateตอนrelease/ไม่ยึดคืนจากPIDหรืออายุโดยเดา. WindowsOSfilelock/macOSadvisoryfilelock+in-processcoordination; acquirefailure/timeout→STORE_UNAVAILABLEไม่ข้ามlock. Copyหลายlockเรียงลำดับเดียวกัน; migrationไม่recursivepubliclockจนdeadlock. Indexderivedต้องเห็นwriterอื่น ไม่ถือmapcacheตลอดprocessเป็นtruth.

Establishtrustedhostappdataanchor/rootidentityก่อนmkdir/temp/rebuild; ผูกoperationsกับdirectoryhandles/descriptorsที่ตรวจแล้วไม่กลับไปstringpath. ครอบprojects/receipts/locks/temp/legacyread/root/ancestors. Root/ancestorpolicyหรือcontainmentยืนยันไม่ได้→STORE_UNAVAILABLEก่อนเขียน; projectleaflink/nonregular→PROJECT_INVALID; documentUUIDต้องตรงfilenameก่อนindex.

Lstat/EvalSymlinksแล้วเปิดตามstringไม่ปิดTOCTOU. Standardlibraryos.Rootใช้ได้เมื่อSDKรองรับoperations แต่OpenRootจากpathที่ถูกสับเปลี่ยนได้ยังไม่establishtrustedanchor. Windowsต้องถือboundaryhandle/rename-deleteconstraintsตลอดoperation; macOSdescriptorrelativeกันตามsymlinkใหม่แต่ไม่รับรองabsolutepathnameเดิมทุกขณะเมื่อdirectoryถูกย้าย. Platformที่รักษาboundaryไม่ได้failclosed ไม่fallback/stringwriteหรืออ้างsupport/runtimeที่ยังไม่พิสูจน์.

ตรวจwrite/shortwrite/sync/close/replaceerrorsครบ; ห้ามremove-target-then-rename. ต้องพิสูจน์platformatomicreplaceไม่อาศัยชื่อhelper. Archอ้างprimary [GoRoot](https://go.dev/blog/osroot), [os.Root](https://pkg.go.dev/os#Root), [os.Rename](https://pkg.go.dev/os#Rename), [LockFileEx](https://learn.microsoft.com/en-us/windows/win32/api/fileapi/nf-fileapi-lockfileex), [flock](https://developer.apple.com/library/archive/documentation/System/Conceptual/ManPages_iPhoneOS/man2/flock.2.html); packetนี้ไม่ใช่runtimeproof.

## Strict JSON/union

ทุกระดับrejectmissingrequired/null/unknown/duplicatekeysหลังJSONunescape/exactcase/invalidUTF8/multipledocuments. ตรวจrawpresenceก่อนtypedconversion ไม่ดูเฉพาะnonzeroในbroadstruct; foreignvariantfieldแม้0/false/empty/nullต้องreject.

| Object | Required/exactfields |
|---|---|
| LocalProjectDocument | schema,project_id,mode,name,local_revision,updated_at,content |
| code | kind,source |
| block | kind,stacks |
| arm | kind,poses,order,groups,joint_names,time_mode,loops,view |
| Stack | x,y,blocks |
| move | id,enabled,type,direction,tiles |
| jump | id,enabled,type |
| repeat | id,enabled,type,times,body |
| Pose | id,name,values,duration_ms,joint_duration_ms |
| PoseGroup | id,name,pose_ids |

source emptystring, stacks/poses/order/groups/blocks/repeatbody emptyarraysถูกต้องและต้องserializeไว้ไม่omit/null; enabledfalse/x0/y0เป็นค่าจริง. Posevalues/jointdurationsต้องrawarraylength6ก่อนแปลง[6], reject5/7/nullmember/invalidnumber/bounds. ไม่เติมdefaultsเพื่อรับrawJSONที่ผิด; codecserializeเฉพาะvariantจริงโดยไม่เพิ่มschemafield.

## Block depth/fuel — ส่วนที่ชัดกับส่วนรอspec

Compilerจริงอยู่BlockMode.tsx:123/save:238. Rootdepth0, repeatbody+1;8nested+leafผ่าน9ไม่ผ่าน. Structuralตรวจทุกstoredblockรวมdisabled: IDs/cycle/type/bounds/≤1000blocksทั้งdoc.

Purecompilationfuel: +1ทุกwalkรวมemptybody/+1ทุกblockvisitก่อนenabled; disabledเสียvisitแต่ไม่execute/ไม่เดินdisabledrepeatbody; enabledrepeatคูณbodytimesจริง;1000ผ่าน1001ไม่ผ่าน/saturatingboundedไม่expandมหาศาล. One-stack/output≤64เป็นrunconstraints ไม่ห้ามmulti-stackdraftโดยอัตโนมัติ.

**ยังไม่ตรึงfuelrejectionที่Save/Load/Migration**: DESกล่าวfuel≤1000แต่ไม่ได้บอกdraftboundaryหรือmulti-stackbudgetต่อstack/รวมdoc และlegacysaveไม่compile. ParentFuelOverflowFAILจริงแต่ยังใช้ตัดสินstoreผิดจุดนี้ไม่ได้. ส่งspecREQ026; safeส่วนstructural/depth/purefuelcheckerเดินต่อ ไม่เพิ่มข้อห้ามบันทึกdraftเองหรือแก้testexpectedเงียบ.

## Migration/receipt

SchoolBotPoCก่อนArmStudioPoC/fallbackเฉพาะfileabsent ไม่fallbackไฟล์เสีย/อ่านไม่ได้. คงdeterministicUUIDseedเดิมsourceapp/slot/mode ไม่ใส่path/time/sourcehash. Sourcebytesคงเดิม; badslotไม่ขัดslotอื่น. InvalidlegacyJSON/schema/content/size→MIGRATION_UNSUPPORTED; I/O/containment→STORE_UNAVAILABLE.

Armexplicitinvalidt/ts/v/enum/boundsrejectslotไม่clamp/default/truncate; optionaldefaultsเฉพาะพิสูจน์legacyreaderแล้ว. Invalidlegacygroupsละเฉพาะกลุ่มเสีย/เก็บกลุ่มดี/เตือนผ่านMigrationResult.Messageเดิม; v2ใหม่ต้องvalidทั้งหมด. Blocklyรองรับ3types/enabled/fields/bodyจริง ไม่แก้malformednumberเป็น1/ไม่เปิดdisabledเอง; unsupported→MIGRATION_UNSUPPORTED. Allowlistlegacyแยกv2ไม่rejectsupportedBlocklymetadataเพราะv2strict.

Projectcommitก่อนreceiptใต้lockเดียว; receiptstrictschema/app/mode/hashH/ID.

| State | ผล/การกู้ |
|---|---|
| project+receiptสำเร็จ | migrated |
| projectสำเร็จreceiptwrite/sync/close/replacefail | error/STORE_UNAVAILABLE, คืนprojectIDได้ ไม่รายงานmigrated/ไม่ลบprojectrollback |
| validreceipt+validproject | skipped_up_to_date คงuseredits |
| receiptabent/projectrev1ตรงdeterministicconversionปัจจุบันทั้งmode/name/content | กู้เฉพาะreceiptหลังตรวจใต้lock ใช้hashsourcebytesครั้งกู้ ไม่เขียนprojectซ้ำ |
| receiptabent/projectถูกแก้หรือพิสูจน์ไม่ได้ | STATE_CONFLICT คงproject/sourceไม่สร้างreceiptอ้างสำเร็จ |
| validreceipt/sourcehashเปลี่ยน/destinationมี | skipped_existing คงproject+receiptเดิม |
| corrupt/mismatchedreceiptหรือreceiptมีแต่projectหาย | STATE_CONFLICT ไม่overwrite/resurrect |

## ส่งต่อ/acceptance

Sysrework1: containment/sharedlocks/entitlementrecheck→strictcodec→receipt/legacy→depth/purefuelที่ไม่ติดspec. แยกfileIO/platformlockingจากstore; migrationorchestration/receiptแยกArmandBlocklyadaptersตามหน้าที่ ไม่framework. Checkต้องสองinstances/สองprocesses/crashlockrelease/root-ancestor-receiptjunction/swapfixtureที่setupผ่าน/strictJSON5-6-7arrays/emptyroundtrip/receiptfailทุกขั้น/restartrecovery. macOSต้องruntimeบนmacOSเองไม่ใช้Windowscrosscompileแทน.

## Change Log

- 2026-10-26 — รับarchpacketก่อนGo rework1; NEEDS_REQUIREMENT_CHANGEเฉพาะdraftfuel ส่งspecต่อ ส่วนอื่นพร้อม ไม่SQL/schema/hardware/productionproof.

## Amendment — ผลspecREQ026

2026-10-26 spec090DONE (memory: planning/spec-090-draft-fuel-001.md)/REQ026amendmentมีprecedenceเหนือข้อความรอspecในsectionBlockdepth/fuel: **fuel≤1000ตรวจเฉพาะก่อนRun, Save/Load/Migrationไม่rejectstructurallyvaliddraftเพราะfuel/outputcommands**; ไม่มีdraftbudgetต่อstack/รวมdoc. สูตรpurefuel/structuraldepth/count/disabledvalidationจากarchไม่เปลี่ยน. CheckถอนoracleFuelOverflowของstoreและทดสอบdraftกับRunแยก ไม่เปลี่ยนผลharnessเก่าย้อนหลัง. Archต้องalignDES003sentenceตามคำวินิจฉัย ไม่businessgateใหม่.
