# SchoolBot — SA สำรวจฐานสำหรับข้อเสนออุปกรณ์และ OS

- วันที่: 2026-10-21
- ผู้ใช้มอบหมายทีมสำรวจอุปกรณ์และตรวจข้อจำกัดโค้ด/เครื่องเป้าหมาย เสนอรุ่นหุ่นและ OS ขั้นต่ำให้ตรวจภายหลัง ผู้ใช้เป็นผู้อนุมัติและตรวจรับภาพรวม
- มติ: requirement/decisions-016.md; ต่อเนื่องจาก decisions-014/015 ที่ตอบ human questions แล้ว
- งานนี้เป็น technical evidence สนับสนุน BA-003/004 และ SA-003 ไม่ใช่งาน implementation หรือการปิด human gates
- Mode read-only; ไม่แก้ code/plan/requirement, ไม่ build/install/deploy/SQL, ไม่เปิดพอร์ต/ส่ง probe/motion/upload/torque หรือสั่งอุปกรณ์ ไม่มีการยอมรับ risk แทนคน
- Dispatch แล้ว: mycelium-role --agent codex --role sa --tier t1 --date 2026-10-21 --cwd C:/src/schoolbright/target/school-bot-v2 --task-file C:/src/schoolbright/knowledge/school-bot/task-005.md; session 56654, gpt-6-astra/high, timeout 1800s
- Report directory: C:/src/AICode/baan/baan/reports/2026-10-21-13-34-47-sa-tier-t1-1agents-HjWmXL
- ผลส่งกลับ DONE/exit 0 ใน 626.4s; บันทึก [hardware survey](../design/hardware-survey-001.md), [OS proposal](../design/os-compatibility-001.md) และ patch index ของ SA แล้ว ดู [ผลตรวจ](sa-survey-review-001.md) การสำรวจ source เสร็จ แต่ยังไม่มี physical/hardware/install acceptance
- หลักฐานเพิ่มเติมจากผู้คุม: [ข้อมูลเครื่องปัจจุบัน](host-inventory-001.md) อ่าน OS/Serial inventory อย่างเดียว แยกจาก machine/hardware acceptance ของโรงเรียน

## Inputs — index first / explicit allowlist

Knowledge root C:/src/schoolbright/knowledge/school-bot:

- index.md; requirement/index.md; design/index.md; open-questions/index.md; plan/index.md; backlog.md
- requirement/decisions-008.md, decisions-013.md, decisions-014.md, decisions-015.md, decisions-016.md
- plan/BA-003.md, plan/BA-004.md, plan/SA-003.md, plan/gates-001.md
- open-questions/oq-006.md, oq-008.md, oq-011.md
- design/des-001.md, des-006.md, des-007.md, quality-attributes.md, risks.md
- requirement/req-009.md, req-014.md, req-015.md, req-021.md, req-031.md, req-032.md

Source root C:/src/schoolbright/target/school-bot-v2:

- AGENTS.md; CLAUDE.md; README.md; docs/INSTALLERS.md
- app/go.mod; app/installer/SchoolBot.Installer.csproj; app/frontend/package.json
- scripts/build-desktop.sh, build-desktop.ps1, package-desktop.sh, package-desktop.ps1, common.ps1, build-installer-shell.ps1
- engines/zide/engine.json; engines/zide/CMakeLists.txt; engines/zide/docs/API.md; engines/zide/docs/INTEGRATION.md
- engines/zide/src/discovery.cpp, transport.cpp, transport_hid.cpp, transport_serial.cpp, actions.cpp, protocol.cpp, request.cpp
- engines/zide/include/ อนุญาต rg เฉพาะ headers ที่ src ข้างต้น include เพื่อยืนยัน protocol/device constants
- engines/zide/scripts/ อนุญาต rg --files เฉพาะ build scripts ที่ root scripts เรียกโดยตรง แล้วอ่านไฟล์ที่เกี่ยว
- app/*.go เฉพาะ OS/architecture/runtime packaging checks ที่ source ข้างต้นอ้าง อนุญาต rg ภายใน glob นี้เพื่อพบ callers; ห้ามดูไฟล์ผู้ใช้/credentials/ข้อมูลนักเรียน

ไม่เปิด repo อื่นโดยไม่มี dependency ตรงที่พิสูจน์ได้ ไม่ต้องอ่าน UI/mockups หรือออกแบบหน้าจอ และไม่ต้องอ่าน MYCELIUM.md ตาม role exception

## ผลส่งมอบ

1. Hardware evidence: code รองรับ protocol/transport/device identity อะไรจริง พร้อม path:line; แยกค่าคงที่/ชื่อ engine ออกจากรุ่นสินค้า/board revision/firmware ที่ยังไม่มี physical evidence อย่าเดารุ่นจาก VID/PID หรือชื่อ Zide เพียงอย่างเดียว
2. ข้อเสนอรายการสำรวจอุปกรณ์จริง: matrix รุ่น/board/firmware/VID/PID/transport/OS/calibration/stop/disconnect/ผู้รับรอง ระบุวิธีและหลักฐานที่ต้องเก็บ ไม่มีการเปิด device จากงานนี้ ถ้าไม่มี physical access ให้รายงานข้อจำกัดตรง ๆ และทำ source-backed ส่วนที่ทำได้ให้ครบ
3. OS evidence: แยก hard constraint ใน source/build/installer/pinned dependencies จาก README target และ unknown compatibility ให้ระบุ Windows/macOS/architecture, engines bundled, native Darwin gaps, API server แยก installer, signing/notarization และเครื่องทดสอบที่ต้องมี
4. ร่าง proposal OS ขั้นต่ำอย่างมีเงื่อนไขตามหลักฐาน ไม่เลือกแทนผู้ใช้ ไม่อ้าง vendor support/current lifecycle จากความจำ; หากต้องอ้างภายนอกตรวจ official docs ของรุ่นที่ pin และระบุ URL/วันที่ตรวจ ถ้าตรวจไม่ได้ให้ทำเครื่องหมายต้องตรวจแทนอ้างว่ารองรับแล้ว
5. ส่ง technical questions/รายการที่ต้องทดสอบจริงให้ BA-003/004 และผู้ใช้ตรวจเมื่อมี artifact พร้อม ไม่ถามซ้ำว่าใครอนุมัติ/จะให้ทีมเสนอหรือไม่ ไม่ตั้งคำถามธุรกิจให้เดาข้อเท็จจริงจาก code

## Output protocol

ส่ง JSON object เดียวใน fenced json:

```
{"files":[{"path":"design/hardware-survey-001.md","content":"exact complete markdown"},{"path":"design/os-compatibility-001.md","content":"exact complete markdown"}],"design_index_patch":"unified diff เฉพาะเพิ่ม links ของสองเอกสารและวันที่ ไม่ regenerate index", "handoff":"ผล/หลักฐาน/ข้อจำกัด/ผู้รับ", "state":"DONE หรือ NEEDS_HUMAN หรือ BLOCKED ตามงานจริง"}
```

แต่ละไฟล์ Markdown ภาษาไทย <=10 KiB มี Change Log 2026-10-21 แยกข้อเท็จจริง/ข้อเสนอ/สิ่งที่ยังไม่ตรวจ ไม่สวมว่าได้ตรวจเครื่องหรือหุ่นจริง ยังไม่อนุมัติ min OS หรือ hardware model และไม่แก้สถานะใน plan

MYCELIUM บันทึก output เชิงกลตาม ownership บทบาทนี้ไม่เขียนไฟล์เอง ไม่เรียก role ต่อ

## Change Log

- 2026-10-21 — บันทึก SA survey สองไฟล์และผลตรวจ root; รอผู้ใช้ตรวจ candidate และหลักฐานอุปกรณ์จริงตาม gates
- 2026-10-21 — MYCELIUM เตรียม SA survey ตามการมอบหมายผู้ใช้ใน decisions-016
