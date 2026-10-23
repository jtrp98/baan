# QA round001 — auth flow local subset

วันที่2026-10-24 · ผู้ตรวจ: check/Codex t2 · verdictจาก [ผล check](../planning/auth-flow-check-response-002.json) ไม่ใช่คำตัดสินของsys

2026-10-24: ยืนยัน PASS เฉพาะ local/runtime และ static contract ที่ตรวจครบจาก parent actual run ไม่รัน build/tests ซ้ำ ไม่แก้ไฟล์ ปิด SEC040-001 เฉพาะ local per-process ตาม conditional close ของ jpo043; PostgreSQL integration/atomic rollback ยัง NOT_RUN และ Important เดิม 6 ข้อยัง OPEN

| Scope | Verdict | หลักฐาน |
| --- | --- | --- |
| Gateway outcome decoder local | PASS | TRX มี GatewayOutcome*/GatewaySecretTests ผ่าน 3874 cases; ตรวจ source/tests เทียบ acceptance ทั้ง 8 หมวด ครอบคลุม operation/stage/outcome, malformed input, bounds และ secret lifecycle |
| Logout API/usecase และ limiting local | PASS | Logout tests ผ่าน 88 cases ใช้ production Program/pipeline/endpoint/LogoutService/limiter โดยแทนเฉพาะ ISessionLogoutStore พร้อม middleware กำหนด peer สำหรับทดสอบ; ครบ security criteria 1–8 |
| Repository Actor/DDL static | PASS | PostgresSessionLogoutStore.cs:44–63 ตรง canonical A และตัวอย่าง sys044 ครบ 6 กรณี; ตรวจ Session 17 fields, AuditEvent 13 fields และ INSERT 12 fields กับ DDL; token_hash:Varchar และ request_id:Uuid ตรงชนิด |
| PostgreSQL integration/atomic rollback | NOT_RUN | ไม่มี PostgreSQL execution; transaction/revoke/audit/invalid-row rollback ตรวจได้เฉพาะ source ไม่ยืนยันสถานะข้อมูลจริง |

## Actual run

[ผลรันจริง](../planning/auth-flow-test-check-002.json): 4032 passed / 0 failed / 0 skipped, exit 0. [TRXที่ผ่าน](auth-flow-tests-002.trx) · [TRXรอบแรก](auth-flow-tests-001.trx). ชุดนี้รวมregressionเดิม70casesกับtestsใหม่จากcheck; แยกจากTP001 77casesที่ยัง NOT_RUN. ใช้syntheticfixtures และin-processAPI/teststore ไม่มีconnectionไปDBจริง

## ขอบเขต

- Gatewaywebdecoder: ทดสอบclosedparser/outcomes/securitybounds; TerminalCandidateไม่ใช่authentication/session และไม่ยืนยันwire/runtimeของGateway
- logout: endpoint/usecase/hash/error/limitingกับteststore; productionPostgreSQLSQL/transactionตรวจstaticเท่านั้น ไม่ใช่PGatomicity/rollbackruntimeproof
- fullLogin, canonicalBE002/BE006/BE039, G-AUTH/H5 และsecuritygatesเดิมไม่ถูกปิดจากroundนี้

## Tests / findings / limits จากcheck

Tests:

- รอบนี้ไม่เพิ่มหรือแก้ tests; อ้างชุด 12 ไฟล์ใน auth-flow-check-response-001.json ของ041
- อ้างการแก้ fixtures และเพิ่ม LogoutWindowTests/LogoutDefaultLimitTests ใน auth-flow-fixtures-response-001.json ของ045

Findings: ไม่มี

Limitations:

- PostgreSQL integration, actual session state, SQL acceptance และ atomic rollback ยัง NOT_RUN; fake store ไม่พิสูจน์สิ่งเหล่านี้
- default window60วินาทีตรวจผ่านmetadata ไม่ได้รอครบ60วินาที; renewalตามเวลาจริงพิสูจน์เฉพาะconfigured1/2วินาที
- manifest001/002พิสูจน์deltaระดับไฟล์; ไม่มีsource001เต็มสำหรับbyte diffภายในไฟล์ การยืนยันActorใช้sourceปัจจุบันเทียบcontractและหลักฐาน041/044
- ไม่ให้PASSแก่canonical BE-002/BE-006/BE-039, full Login, 77TPcases หรือgatesเดิม; Important6ยังOPEN
- ไม่ยืนยันGateway wire parity, cross-pod capacity, H5/deployment, UIหรือhardware; ไม่แก้source/tests/knowledge ไม่ใช้Git ไม่รันSQL/DB/network/login และไม่rebuild EXE/installer

SEC040-001: CLOSEDเฉพาะlocal scopeตามcheck+เงื่อนไขjpo043. [jpo](../planning/logout-security-response-002.json) · security disposition: ใช้ close_when ใน logout-security-response-002.json ของ jpo043: source limiter ไม่เปลี่ยนและ actual TRX มี successful cases ครบ8criteria ปิดเฉพาะ logout limiting ภายใน process ไม่ขยายเป็น cross-pod/deployment/full security

| เกณฑ์ | ผล | หลักฐาน |
| --- | --- | --- |
| 1 | PASS | LogoutRateLimitTests.AcceptedRouteVariantsShareTheCanonicalRouteQuotaAndErrorEnvelope — Passed5cases<br>LogoutRateLimitTests.SpoofedHeadersBodyAndTokenCannotCreateNewTrustedSourcePartitions — Passed5cases; canonical tokens ต่างค่า storeถูกเรียกไม่เกินquota |
| 2 | PASS | SpoofedHeadersBodyAndTokenCannotCreateNewTrustedSourcePartitions — loopback IPv4/IPv6, external IPv4/IPv6 และ missing peer; spoof headers/body/request ID ไม่เปลี่ยนpartition และ peerอื่นแยกquota<br>LogoutRateLimitTests.MappedAddressesAndMissingAddressesShareTheirDeclaredBuckets — Passed3cases |
| 3 | PASS | LogoutConcurrencyTests.HeldStoreCallsEnforceGlobalCapWithoutQueueAndReleaseAfterCompletionOrFailure — Passed3cases; ถือstoreข้ามpeerแล้ว12คำขอถูก429ภายในtimeout โดยstore countไม่เพิ่ม<br>LogoutDefaultLimitTests.DefaultConcurrencyQuotaHoldsEightCallsAndRejectsTheNinthWithoutQueueing — Passed; source/workใช้ AttemptAcquire และ QueueLimit=0 ทั้งคู่ |
| 4 | PASS | HeldStoreCallsEnforceGlobalCapWithoutQueueAndReleaseAfterCompletionOrFailure — success/unavailable/unexpected ผ่านและกลับมาถือpermitได้ครบ2<br>LogoutConcurrencyTests.ClientCancellationCannotFreeCapacityWhileTheStoreIsStillRunning — Passed; ยัง429หลังcancelจนstoreจบ แล้วcapacityกลับมา |
| 5 | PASS | AcceptedRouteVariantsShareTheCanonicalRouteQuotaAndErrorEnvelope — ผ่านทั้ง5route variants; ตรวจ429/RATE_LIMITED/v2 envelope/UUIDตรงheader/no-store<br>HeldStoreCallsEnforceGlobalCapWithoutQueueAndReleaseAfterCompletionOrFailure — concurrency rejection ไม่มีRetry-After; source rejectionตรวจRetry-Afterช่วงที่ถูกต้อง และ sourceอ่านจากlease metadata |
| 6 | PASS | LogoutEndpointTests.MissingOrMalformedBearerReturns204WithoutCallingTheStore — Passed19cases; MultipleAuthorizationValuesCannotReachTheStore — Passed<br>LogoutRateLimitTests.MalformedBearerNeitherConsumesQuotaNorEntersStoreWhenTheQuotaIsExhausted — Passed<br>HeldStoreCallsEnforceGlobalCapWithoutQueueAndReleaseAfterCompletionOrFailure — raw-invalid matrixและหลายAuthorizationยัง204เมื่อconcurrencyเต็ม<br>LogoutEndpointTests.CanonicalTokenSendsOnlyItsSha256AndNeedsNoLicenseOrMutationHeaders — Passed3cases<br>LogoutRateLimitTests.EveryPossibleFinalBase64urlCharacterHonorsUnusedBits — Passed |
| 7 | PASS | LogoutDefaultLimitTests.DefaultSourceQuotaAllowsThirtyCallsAndAdvertisesTheSixtySecondWindow — Passed; default30และ60ผ่านRetry-After metadata<br>DefaultConcurrencyQuotaHoldsEightCallsAndRejectsTheNinthWithoutQueueing — Passed; default8<br>LogoutConfigurationTests.InvalidCapsFailAtStartupInsteadOfDisablingProtection — Passed27cases ครบ3keys<br>LogoutConfigurationTests.LogoutCapsDoNotChangeV1LicenseOrUpdateQuotas — Passed<br>LogoutWindowTests.ConfiguredFixedWindowRenewsWithoutChangingPeerOrRestartingThePipeline(seconds:1/2) — Passedทั้งคู่; duration1.1351275/2.7972853วินาที พร้อมตรวจquotaหลังrenewal |
| 8 | PASS | LogoutEndpointTests.StorageUnavailableReturns503WithUuidAndNoSecretOrProviderDetails — Passed<br>LogoutEndpointTests.UnexpectedStoreFailureDoesNotLeakExceptionText — Passed<br>HeldStoreCallsEnforceGlobalCapWithoutQueueAndReleaseAfterCompletionOrFailure และ ClientCancellationCannotFreeCapacityWhileTheStoreIsStillRunning — Passed; ตรวจresponses/logsไม่มีsynthetic token, PII และconnection-string sentinels<br>SHA256 production16ไฟล์ตรงsnapshot002 ผูกผลกับsource revisionที่ตรวจ |

## Change Log

- 2026-10-24 — นายช่างบันทึกverdictจากcheckและactualrun; คง110tasks pending/77TPcases NOT_RUN/Important6OPEN
