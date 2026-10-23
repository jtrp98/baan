# ใบงาน042 — sys แก้ SEC040-001 จำกัด logout ก่อนใช้ DB

วันที่2026-10-23 · sys/Codex t2 writeเฉพาะlogoutlimiting · Exact K=C:/src/schoolbright/knowledge/school-bot; B=C:/src/schoolbright/target/school-bot. อ่านK/index.md→K/plan/index.md→K/design/index.md แล้ว K/planning/logout-security-response-001.json ทั้งfinding, K/design/des-004.md/logout และ K/design/data-contract-rules.md/429/v2envelope. อ่านB/AGENTS/READMEและimplementation038จริงเฉพาะProgram/LogoutEndpoint/Service/infrastructureที่ต้องต่อ

แก้jpoMediumSEC040-001ที่พบจริง: canonicalBearerปลอมทำให้เปิดDBconnection/transactionได้ไม่จำกัดจำนวนงาน. ใช้built-inrate-limiting/concurrencyที่มีใน.NETและrepoก่อน ไม่เพิ่มpackage/framework/distributedstoreเอง. จำกัดตาม**trusted connection peer/source** (ไม่เชื่อX-Forwarded-For/bodyaccountที่ไม่ผ่านproxytrust) และจำกัดจำนวนlogoutDBงานพร้อมกัน **ก่อนเข้าสู่store**; queueต้องbounded/ควร0สำหรับlogout. เลือกdefaultlocalcapsที่ชัดและconfigurableตามรูปแบบเดิม บันทึกชื่อ/defaultในREADMEเดิม ไม่อ้างglobalcrosspodlimit/productionSLA. ข้อจำกัดpeerหลังgatewayอาจรวมหลายclientให้ระบุว่าlocaldefenseระหว่างรอH5trustedsource

เมื่อเกินlimitคืน429 RATE_LIMITED ด้วยv2errorenvelope/request_id UUID/no-store; Retry-Afterถ้ามีmetadataใช้ค่าที่ตรวจแล้ว ห้ามinventว่าDB/Gatewayresetแล้ว. ปกติmissing/invalidtokenยัง204และไม่callstore, logoutไม่ต้องauthentication/License/If-Match/idempotency. ไม่ลดtokenvalidation/hash/redaction/transactionหรือเปลี่ยนpostgresSQL/schema. ไม่เปิดrate/counter bypassผ่านheader/routeหรือใช้rawtoken/PIIเป็นpartitionkey/log. จำกัดserviceworksที่ถูกเรียกจริง ไม่เป็นDIregistrationที่ไม่ใช้

งาน039อีกwriterแก้เฉพาะInfrastructure/Authentication/* ไม่แตะที่นั่น. งานนี้อนุญาตProgram/LogoutEndpointและhelper/config/serviceที่จำเป็น+webREADME เดิม; บอกexactfiles. **อย่ารันbuild/testพร้อมwriter039** ผู้คุมจะให้check041รันchecksรวมหลังสองwriterจบ; รอบนี้ตรวจsource/diffและส่งimplementationพร้อมtestinstructions/ค่าcapsเพื่อcheckเขียนadversarialtestอิสระ. ไม่มีtestที่แค่mirrorlimiterimplementation. ห้ามDB/network/SQL/login/Go/UI/hardware/knowledge/gitmutation/rolechain; ไม่อ่านenvsecretจริง

Code-onlyfixจากjpoไม่ใช่schema/businessscopeใหม่;429มีในcatalogกลาง ไม่ขอhumanapprovalเพิ่ม. ถ้ามีcontractgapที่ไม่ใช่implementationchoiceให้ระบุexactgapแล้วทำส่วนอิสระที่ทำได้ ไม่แต่งpolicyนอกfinding. ไม่ปิดfinding/ให้PASSเอง รอcheckและjpoอ่านซ้ำ

คืนfencedJSON<=2500tokens {"state":"DONE|NEEDS_DESIGN_CHANGE|BLOCKED","summary":"...","files_changed":[],"limiting":{"source":"...","window":"...","concurrency":"...","configuration":"names/defaults only"},"checks":[],"test_instructions":[],"limitations":[],"handoff":[]}

## Change Log
- 2026-10-23 — นายช่างส่งfixjpoMediumที่พบจากpubliclogoutจริง คู่ขนานกับ039ซึ่งแก้คนละไฟล์ ไม่รันbuildพร้อมกัน
