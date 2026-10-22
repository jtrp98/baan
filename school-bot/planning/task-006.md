# SchoolBot — SA ทบทวน Windows 10 x64

- วันที่: 2026-10-21
- ต่องาน SA session 01a15eab-eb91-75e2-a20a-f17ba55f6e79 ที่เปิดด้วย mycelium-role sa/t1; ยังเป็น [mycelium-role: sa] ตามบทบาทเดิม ห้ามเรียก role ต่อ
- คำตอบใหม่ผู้ใช้: ต้องรองรับ Windows 10 x64 ด้วย ให้ทีมตรวจ edition/build และปรับข้อเสนอขั้นต่ำก่อนยืนยัน ตาม decisions-017
- ทำ technical review และ patch เอกสาร ไม่แก้ code, ไม่ build/install/SQL/อุปกรณ์จริง, ไม่เปลี่ยน plan/REQ, ไม่อนุมัติ scope หรือ risk แทนผู้ใช้
- Dispatch: ต่อ Codex CLI session SA เดิมแบบ read-only, gpt-6-astra/high, exec session 24579; ผลเก็บ codex.windows10.answer.txt/jsonl/stderr.txt ใน report directory C:/src/AICode/baan/baan/reports/2026-10-21-13-34-47-sa-tier-t1-1agents-HjWmXL
- ผล: CLI exit 0, role NEEDS_HUMAN สำหรับทางเลือก Home/Pro; บันทึก [Windows10 review](../design/windows10-compatibility-001.md) และ OS Rev2 แล้ว ดู [ผลตรวจ](sa-survey-review-002.md) ส่ง [คำถามแนวทาง Setup](human-questions-005.md) รอผู้ใช้เลือก ไม่มีการแก้โค้ดหรือทดสอบติดตั้งจริง
- ข้อยุติถัดมา: ผู้ใช้เปลี่ยนเป็น Windows11 ตาม [decisions-019](../requirement/decisions-019.md) สาขา Win10/คำถาม Home-Pro ยุติ ดูผล preflight และมติใหม่ที่ [task-007](task-007.md)

## Inputs — index first

Knowledge root C:/src/schoolbright/knowledge/school-bot:

- index.md; design/index.md; requirement/index.md; open-questions/index.md; plan/index.md
- requirement/decisions-017.md, decisions-016.md, decisions-008.md
- design/os-compatibility-001.md; design/des-007.md; design/quality-attributes.md
- planning/sa-survey-review-001.md; planning/host-inventory-001.md; planning/human-questions-004.md
- requirement/req-009.md, req-031.md; open-questions/oq-011.md

Source root C:/src/schoolbright/target/school-bot-v2:

- AGENTS.md; README.md; docs/INSTALLERS.md; app/go.mod; app/go.sum; app/frontend/package.json
- scripts/common.ps1, build-desktop.ps1, package-desktop.ps1, build-installer-shell.ps1
- app/installer/SchoolBot.Installer.csproj; app/installer/app.manifest
- app/build/windows/Package.wxs, InstallerUI.wxs, InstallerDialogs.wxs
- app/runtime_windows.go และ app/*.go เฉพาะ package/runtime/OS checks อนุญาต rg เพื่อพบ caller ที่เกี่ยว
- engines/zide/scripts/build.ps1; engines/zide/src/discovery.cpp, transport.cpp, transport_hid.cpp, transport_serial.cpp; engines/zide/engine.json
- อนุญาตอ่านค่า go env GOMODCACHE หรือหา module cache เดิมแบบ read-only ตาม path ของ portable Go ใน common.ps1; อ่านเฉพาะ go.mod/release notes และ Windows code ของ Wails v3.0.0-beta.30/x/sys v0.46.0 ที่ติดตั้งอยู่เพื่อหา API minimum ห้ามดาวน์โหลด module หรือเปลี่ยน dependencies อย่าอ่าน credentials
- อนุญาตอ้าง official docs ของ pinned versions และ Microsoft Windows/.NET/WebView2 lifecycle ต้องตรวจปัจจุบัน ไม่เดา edition/build/ESU policy ถ้าเข้าไม่ได้ระบุข้อจำกัด

## ตรวจให้ได้ข้อเสนอที่ใช้ตัดสินใจจริง

1. แยกสามเรื่อง: minimum ที่ source/runtime บังคับ, vendor-supported OS matrix และ business target ที่ผู้ใช้ยืนยัน Win10 x64 ต้องอยู่ใน scope ห้ามใช้ Windows11-only proposal แทน
2. แยก Home/Pro 22H2 build19045, Enterprise/LTSC/LTSB builds ที่มีหลักฐานตาม official matrix ระบุ version/build/edition/patch prerequisite และสิ่งที่ยังไม่ทดสอบ ห้ามสรุปว่า vendor ไม่อยู่ใน support list เท่ากับ runtime รันไม่ได้ หรือว่า ESU ทำให้ .NET support กลับมาเอง
3. ตรวจ setup EXE self-contained .NET10.0.13 เทียบ direct MSI/Go desktop/engine/WebView2/driver ว่าข้อจำกัดต่างกันอย่างไร ไม่แนะนำ bypass updater/signing หรือ silently drop setup UX เพื่ออ้างรองรับ
4. เสนอทางเลือกที่เป็นรูปธรรมสำหรับ Win10 รวมข้อเสนอ candidate build ต่ำสุด/edition จากหลักฐาน พร้อมผลต่อ target machines และ engineering work ถ้าต้องเลือกธุรกิจให้เตรียมคำถาม 1 ข้อพร้อมตัวเลือกที่เข้าใจง่ายหลังเตรียม artifact แล้ว ไม่ถามให้ผู้ใช้เดาข้อเท็จจริงจาก code
5. บอกชัดว่า local inventory เป็น Win11 ของเครื่องปัจจุบัน ไม่ใช่ Win10/เครื่องโรงเรียน จึงยังไม่มี compatibility proof จริง จัด test matrix ต่อ edition/build/setup+MSI/3 modes/license/local/cloud/native/repair/upgrade/uninstall โดยไม่รันทดสอบเอง

## Output

ส่ง JSON object เดียวใน fenced json:

```
{"files":[{"path":"design/windows10-compatibility-001.md","content":"complete exact markdown <=10KiB"}],"patch":"unified diff เฉพาะ amend design/os-compatibility-001.md และ design/index.md ให้ Rev2/ชี้เอกสารใหม่/ใช้มติ Win10 ไม่ regenerate; คุมแต่ละไฟล์<=10KiB", "question":{"title":"optional concrete business question","options":["..."]},"handoff":"ผล หลักฐาน ข้อจำกัด ผู้รับต่อ", "state":"DONE หรือ NEEDS_HUMAN ตามสิ่งที่ยังต้องตัดสิน"}
```

ของเดิมแก้เฉพาะจุด+Change Log วันที่ 2026-10-21 ไม่ต้องคัดลอก hardware survey เดิม ไม่เปิด role ต่อ MYCELIUM บันทึกเอกสารจาก output ตาม ownership

## Change Log

- 2026-10-21 — มติถัดมายุติสาขา Win10 ตามคำสั่งผู้ใช้ ไม่รอ human choice เดิมอีก
- 2026-10-21 — บันทึก output SA และ patch แบบ amend; ตรวจ static ผ่าน ส่งทางเลือก Home/Pro ให้ผู้ใช้ตาม human gate
- 2026-10-21 — MYCELIUM ส่งคำตอบใหม่ให้ SA session เดิมตรวจ Windows 10 และปรับข้อเสนอ
