# Check089 — B gRPC rework1 FAIL150assertions

วันที่2026-10-26 · check CodexT2 · run `2026-10-26-10-22-48-check-tier-t2-1agents-YzLBHx`

FAIL: direct83pass/27fail, generatedclient→TestServer→protobuf→realserver21pass/2fail, additionalboundary12pass/2fail, logredaction3pass/0fail รวม119pass/31fail/150assertions/exit1. ตรวจPE/PDB/sourcebindingก่อนloadbytesและรันใหม่หลังexternalbuild; latestAPIDLLhash `EE689C722377758E95A72004108047D0651E7B5EF6BF43500CA116B7EA561112`.

## ส่ง arch/sys รอบ2

| ระดับ | Finding |
|---|---|
| Major | คู่InvalidArgument/INVALID_REQUEST, PermissionDenied/FORBIDDEN, ResourceExhausted/PAYLOAD_TOO_LARGEนอกpacketallowlist |
| Medium | metadataไม่รวม32bytesoverheadต่อfield ทำให้รวม16385ยังOK/store1 |
| Medium | traceparentuppercaseผ่านทั้งdirect/wire ต้องreject |
| Minor | x-langTH/ENผ่าน ต้องตรงth/en |

Peerfailclosed/tokenmalformedstore0/quota/concurrency/capturedpeer/permits/cancel/deadline15sผ่านรอบนี้. ห้ามแก้กลับหรือใช้4032/4077regressionแทนwireacceptance. Needexactnegativeboundarypairจากarchเพื่อไม่เลือกsemanticcodeเองซ้ำ; ใช้เฉพาะexistingpacketpairs ไม่เพิ่มpubliccode/เปลี่ยนproto/livegateเอง. รอSchoolBotGowriterจบก่อนsysAGYT3rework2; ถ้ายังFAILหลังรอบ2รวมถามผู้ใช้ ไม่เปิดรอบ3.

ผู้ตรวจส่งtestsourceเป็นgzip/base64 PACKchunksในrawstderr. ผู้คุมสกัดครบencoded12172chars/decoded42683bytesเป็นreports/school-bot/normal-089/grpc-independent-bundle.txt (C#classesdirect/wire/extra/generatedclient/logrecorder) ไม่แก้expected. finalanswerอ้างRun-IndependentLogout.ps1แต่ไฟล์ยังไม่มีและbundleที่สกัดเป็นC#ไม่ใช่PSwrapper; ให้sysติดตั้งwrapperจากinvocationที่รันจริงในstderr/Checksource โดยไม่แต่งexpectedใหม่. ไม่อ้างparent150checksรันแล้วจนมีwrapperและผลจริง.

NOT_RUN:Gadapter/pairedtrailerrejection/Gactualparser/fullLogin/DBatomicity/H5; canonicaltasks/gatesคงเดิม. ผลนี้เป็นsubsetFAILไม่ทำcanonicalBE006/039เป็นblockedทั้งงานเอง.

## Change Log

- 2026-10-26 — สกัดindependent150assertions/4groupsและtestsourceจริง; แยกwrapperที่ยังไม่ได้ส่งมอบจากsourceที่ได้แล้ว.
