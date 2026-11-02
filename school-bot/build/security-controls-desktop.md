# controls ของ Desktop, engine และ update

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

IPC คือ Inter-Process Communication; CSP คือ Content Security Policy; XSS คือ Cross-Site Scripting; CVE คือรายการช่องโหว่ที่มีรหัสอ้างอิงร่วม. PII คือข้อมูลที่ระบุตัวบุคคลได้; RC คือ Release Candidate.

ผลต่อไปนี้คงข้อสังเกต static วันที่ 2026-10-23; [ขอบเขตที่ตรวจ](security-controls.md).

| การตรวจ | ผล |
|---|---|
| Device binding | device_id เป็นสตริง 8-128 ตัวที่ client ระบุเอง ไม่มี proof-of-possession. Desktop เก็บเป็นไฟล์ plaintext ที่คัดลอกข้ามเครื่องได้ และไม่มี unbind API ดู [SEC001-005 (device binding)](security-findings-04.md) |
| Host gate / entitlement ฝั่ง Desktop | Run, SaveProject, LoadProject ไม่มี gate. ผล ActivateLicense ไม่ถูกเก็บหรือบังคับใช้ และ frontend ส่งต่อ response ดิบ ดู [SEC001-004 (host entitlement)](security-findings-04.md) |
| Trusted engine routing และ IPC | ผ่านในส่วนที่ตรวจ: host เลือก executable จาก registry และหาไฟล์เฉพาะข้าง exe, มี action allowlist ต่อ mode, จำกัด request 64 KB/output 1 MiB/timeout 5 วินาที, ส่ง env ให้ engine เฉพาะที่จำเป็นโดยไม่รับ host env. ไม่ได้ตรวจ validation ใน C++ engine |
| Webview/XSS และ external navigation | ไม่พบ dangerouslySetInnerHTML, eval หรือ new Function ใน frontend/src. CSP มี script-src 'self' และไม่มี unsafe-eval. window.open ถูกเรียกจาก URL คงที่เพียงจุดเดียว (https://www.schoolbot.app) จึงไม่เห็นเส้นที่ข้อมูลภายนอกควบคุมการเปิด URL |
| Update trust (ฝั่ง server และ host) | publish แค่ตั้ง flag. signature ต้องไม่ว่างและ ≤4096 ตัวเท่านั้น ไม่มีการ verify, ไม่มี origin allowlist, ไม่มี withdraw. host ไม่ดาวน์โหลดหรือรันอะไรจึงไม่มีช่องเข้าถึงในตอนนี้. ดู [SEC001-003 (update trust)](security-findings-03.md) |
| Signing ของ artifact ตาม script | สคริปต์ macOS ใช้ ad-hoc codesign และข้อความในสคริปต์ระบุว่าต้องใช้ Developer ID/notarization ก่อนแจกจริง. ใน scripts/ ที่ grep ไม่พบ signtool/Authenticode ของ payload Windows (พบเฉพาะการตรวจลายเซ็น WebView2 bootstrapper) จึงยังไม่มีหลักฐาน Windows signing ผูกกับ [SEC001-003 (update trust)](security-findings-03.md) และ [SEC001-006 (signing custody)](security-findings-05.md) |

## ยังไม่ยืนยัน

ไม่ได้รัน build/test/audit tool ในการตรวจแรก; ไม่ยืนยัน runtime, CVE หรือ license ปัจจุบัน.

## หลักฐาน

- Device binding: ManagementService.cs:47-58<br>SchoolLicense.cs:20-27<br>app/desktopservice.go:70-81<br>app/desktopstorage.go:45-52
- Host gate / entitlement ฝั่ง Desktop: app/desktopservice.go:98-107,118-124<br>app/frontend/src/core/client.ts:55-71,90-94
- Trusted engine routing และ IPC: app/internal/engine/manager.go:28-102,184-190<br>app/internal/engine/environment.go:8-20
- Webview/XSS และ external navigation: app/frontend/index.html:6-9<br>workspace/WorkspaceLogic.ts:622-629<br>workspace/components/MainMenu.tsx:159
- Update trust (ฝั่ง server และ host): ManagementService.cs:74-97<br>DesktopRelease.cs:35-42<br>Program.cs:85-89<br>app/desktopservice.go:109-116
- Signing ของ artifact ตาม script: scripts/build-desktop.sh:95-104<br>scripts/package-desktop.sh:35<br>scripts/prepare-installer-tools.ps1:25-27
