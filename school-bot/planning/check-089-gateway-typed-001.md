# Check089 — G typed logout FAIL2wirefindings

วันที่2026-10-26 · check CodexT2 · run `2026-10-26-10-50-38-check-tier-t2-1agents-zQxhm5`

TaskverdictFAIL, rolestateNEEDS_HUMANเพราะImportant. จริง260assertionsผ่าน258/ตก2: descriptors/GErrorDetailparser2/2, trailervalidator159/159, fakeclientconfig/maintenance/circuit3/3, HTTP→middleware→typedprotobuf→gRPC TestServer94/96. Endpointเป็นcheckserver ไม่ใช่Bimplementation; ไม่มีsocket/DB/hardware. Fullrepro3casespass1/fail2exit1ส่งไว้rawanswer ผู้คุมสกัดscriptตามเดิมเข้าreports/normal-089/gateway-independent-repro.ps1.

| Finding | Expected / actual |
|---|---|
| Important: error disclosure | Internal/INTERNAL_ERRORpairedmessageprovider-secret-stackจากtrustedfakepeerต้อง500sanitized; actualHTTPbodyคืนprovider-secret-stackแม้Development. Middleware:268/TrailerValidator:88 |
| Major: totaldeadline | Bodyรอ16sต้องG504ภายใน15sและRPC0; actual204/16.0046s/RPC1เพราะtimerเริ่มหลังbodyread. Middleware:64/134 |

ผู้ใช้CONTINUEให้แก้งานที่ทำได้ จึงส่งsysAGYT3แก้ทั้งสองก่อน ไม่เลือกรับriskแทนคน ไม่ถามriskacceptanceระหว่างรอบเมื่อfixอยู่ในscope. ImportantยังOPENจนแก้และjpoindependentreaudit. ไม่มีpermissionเปิดproductionจากfindingนี้.

ส่วนที่ผ่าน:204/body0/no-store/UUID, malformed/duplicateauth, spoofedmetadata, duplicateauthority, Origin/methods/siblingroutes/body64KiB, pairedbinarytrailer/status/UUID/RetryAfter/8KiB/4MiBnegatives, RPCcancel/timeout/noretry. Whitespace/URIที่HttpClientnormalizeเองถูกถอนจากbugverdictแล้ว. Sourcecompiledmemory/hashbinding, G/Bproto37c03...635c/folderc97c...7e1a2ตรง.

NOT_RUN: actualBcontrolledstore/hash/quota/parentabsolutedeadline/fullsolution/legacyregression/codegenfresh/productionhost/H5/TLS/private/DBatomicity/fullLogin. Programoffเป็นstaticproofไม่ใช่observedproduction404. ไม่ใช้compile/helpers433แทนwiretests. `gitstatus`readonlytoolคืนnotworktree จึงhashใช้แทนsourcebinding.

## Change Log

- 2026-10-26 — สกัด258/260และส่งrework1/jporeaudit ไม่ปิดImportantหรือรับriskแทนคน.
