# SEC-001 — Compliance และ dependencies ใบงาน093

วันที่ 2026-10-29 · jpo · Rev1 · ต่อจาก [หลักฐานและข้อรอคน](security-review-093-evidence-001.md) · ขอบเขต 10 AC ตาม [pack](security-review-093-001.md)

## ข้อมูลส่วนบุคคลและการควบคุม

| Flow / ข้อมูล | แบบ/หลักฐานที่มี | สิ่งที่ยังขาด |
|---|---|---|
| auth/session: SchoolId+Account/Profile, TokenHash, DeviceJkt ที่เชื่อมบุคคล | DES-004 Rev11/012 Rev9: OS store/no raw token log/no-store/จำกัดอายุ; logout local มี JPO092 | full Login/H5/BFF, retention/ลบ local/log/backup; SEC001-001/010/011/013 |
| License/device/key replay | DES-002 Rev3/license-admin-security Rev1: OS store, proof, envelope/read-time TTL900s/cleanup/tombstone | signer/envelope custody+backup expiry จริง; SEC001-005/006/009; key เป็น secret ส่วน DeviceJkt ที่เชื่อมบัญชีต้องคุ้มครองเป็น PII |
| ผลงาน/คะแนน/Arm assessment+ผู้เรียน และ Audit ผู้กระทำ | DES-004 Rev11/teacher-authority Rev1: intersect+tenant/re-check; inventory รับตั้งต้นบางส่วนตาม review060 | resolver จริง, access/masking/encryption ราย store, purpose/retention/ลบ/ส่งออก; SEC001-002/010 |
| update registry/manifest/artifact | DES-007 Rev3/release-trust Rev1: catalog ไม่ต้องบรรจุ PII; audit ผูก publisher | ตรวจ audit/log/RC จริง; ไม่อ้างว่า metadata ทั้งระบบปลอด PII โดยไม่ตรวจ |

ต้องมีคำตัดสิน masking/encryption/access และ retention ต่อ store รวมสำเนา local/log/backup; expiry/revoke/hash ไม่พิสูจน์ anonymization หรือการลบ. ไม่รับ inventory เดิมแทนหลักฐาน deletion ที่ทำงานได้.

## ขอบเขตกฎหมาย

อ่าน [ตัวบท PDPA จากกรมประชาสัมพันธ์](https://law.prd.go.th/th/file/get/file/20231122b19b536a4647f29a6d99e228909779b4120136.PDF) เฉพาะ ม.6/20/22–24: ข้อมูลระบุตัวทางอ้อมอยู่ในนิยาม; ต้องผูกวัตถุประสงค์/ฐานประมวลผลและแจ้งระยะเก็บ; หากใช้ consent ของผู้เยาว์ให้ตรวจ ม.20. ข้อเท็จจริงยังไม่พอประกาศว่าละเมิดแล้วหรือ compliant. H5 คือหลักฐานที่ขาด ไม่สั่ง consent ทุกกิจกรรมและไม่เพิ่ม oracle ใหม่ย้อนหลัง.

GDPR applicability ยังไม่ยืนยัน; [EUR-Lex](https://eur-lex.europa.eu/eli/reg/2016/679/ojv) เปิด full text รอบนี้ติด JavaScript challenge จึงไม่รับรองความครบ/ความเป็นปัจจุบันของการตรวจ GDPR. DPO ต้องให้ข้อเท็จจริง establishment/ผู้ใช้/กิจกรรมจริงก่อนประเมินต่อ.

หากยืนยันการประมวลผลที่ไม่ชอบด้วยกฎหมาย ต้องหยุด flow นั้นและแก้ให้ถูกกฎหมาย; ผู้มีอำนาจรับ residual ทางเทคนิคไม่ได้ทำให้การกระทำผิดกฎหมายกลายเป็นชอบด้วยกฎหมาย. รอบนี้ไม่มีหลักฐานพอตั้ง finding ว่าผิดกฎหมายใหม่หรือสั่งเปลี่ยน requirement.

## Dependency และ license

อ่าน manifests จริงภายใต้ target/school-bot:

- web/src/SchoolBot.Api/SchoolBot.Api.csproj มี Grpc.AspNetCore.Server 2.76.0, Grpc.Tools 2.78.0 (PrivateAssets=All), Google.Protobuf 3.31.1; รายงานวันที่2026-10-23 ว่าไม่มี external PackageReference ใช้กับปัจจุบันไม่ได้.
- app/go.mod: Go1.25.0, wails/v3 beta.30, x/sys v0.46.0 และ indirect modules.
- app/frontend/package.json: React19.3.1, Blockly13.4.0, Phaser4.2.1, Vite8.3.4 และรายการอื่นใน manifest; ไม่ใช้เวอร์ชันจำจากรายงานแทน lockfile ปัจจุบัน.
- engines/zide/THIRD-PARTY-NOTICES.md ระบุ HIDAPI BSD/nlohmann MIT และไฟล์ license ที่ต้องแจก; upstream commit/release hash ยังไม่ยืนยัน (SEC001-015).

รอบนี้ไม่เปลี่ยน dependency ไม่ตรวจ lockfile/transitives/license ทุกตัวและไม่รัน native audit จึงไม่มี CVE/license sign-off. จัดเป็นข้อจำกัดหลักฐาน/งาน RC เดิมที่ SEC-002 ไม่ตั้ง Critical/Important จากการไม่มีผล audit เพียงอย่างเดียว. ก่อน release ต้องตรวจ dependency graph จริงด้วย native audit และ triage reachability รวม runtime/build/distribution; ตรวจ notices ใน payload จริง. ไม่ติดตั้ง package/รัน dependency scripts หรือแก้ lockfileในรอบเอกสารนี้.

## Change Log

- 2026-10-29 — jpo แยกส่วน compliance/dependencies เพื่อให้ไฟล์ pack อยู่ในเพดานขนาด; ไม่เปลี่ยน finding/status และไม่รับรอง release.
