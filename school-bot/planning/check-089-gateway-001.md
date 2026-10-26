# Check089 — Gateway request helper FAIL

วันที่2026-10-26 · check CodexT2 · run `2026-10-26-09-56-49-check-tier-t2-1agents-rHbWn5`

ตรวจcompiledsourceในmemory/cacheจริง1795assertions ผ่าน1792/ตก3. Sourcehashก่อน/หลังตรง `468039938AC23511572FA440F41CBBEEB9CA7E282DDE46EF845F99D30F5C8121`. ไม่มีproduct/knowledge/gitmutationหรือnetwork/DB. ตรวจBearer656, UUID1014, authority79, allowlist28, Origin/null15ผ่านทั้งหมด; metadataoversize3เคสตก.

Medium: helperคืนRequestเมื่อOriginยาวทำให้metadataเกิน16KiB ขัดgRPCcontract§6. ตัวอย่างprefix+16385/17000/65536ASCIIcharsรวมkey+value16479/17094/65630bytesไม่รวมoverheadยังaccepted. ExpectedcontrolledfailureและRequestnullก่อนRPC. เป็นpreparationproofไม่อ้างRPCจริง. SourceSchoolBotLogoutRequestPreparation.cs:23/42–44.

ส่งsysCodexT2แก้รอบ1ในGคนละrepoกับBwriterและติดตั้งexactregressionที่checkเขียน: reports/gateway-logout-2026-10-26/check-metadata-bounds.ps1 (UTF8BOM); rawsource/commandอยู่run. Regressionย่อ4casesก่อนแก้ผ่าน1ตก3exit1; ไม่แทนfull1795recheck. ProbeBearerScheme3case variantsไม่นับassertionsเพราะspeccase-sensitivityไม่ชัด.

NOT_RUN: Originallowlist/configuration/route/body64KiB/response/trailers/deadline/transporttrust/fullLogin/fullsolution. Packagesยังblockedไม่ใช่helperผ่าน. ไม่มีgateclose/canonicalstatuschange.

## Change Log

- 2026-10-26 — สกัดindependent1795casesและส่งแก้metadata capรอบ1.
