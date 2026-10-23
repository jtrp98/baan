# Release Notes — 🏗️ BAAN

ใหม่สุดไว้บนสุด · เวอร์ชันอยู่ที่ `package.json`

## 0.15.1 — 2026-10-23 · fallback ข้ามตัวรันที่ไม่ได้ติดตั้งแทนที่จะล้ม

### แก้
- **ตัวรันที่ไม่ได้ติดตั้งบนเครื่องถูกข้ามไปตัวถัดไปแทนที่จะล้มจบ** — เดิมสลับต่อเฉพาะ error โควตา ทำให้เครื่องที่ไม่มี opencode CLI เจอ codex ติดโควตาแล้วล้มที่ "command not found" แทนที่จะไปต่อ agy · ตอนนี้จับเพิ่มจาก error/stderr ของ process (spawn ENOENT / command not found / not recognized) — งานยังไม่ได้เริ่มรันจึงสลับต่อได้โดยไม่เสี่ยงเผาโควตาค่ายอื่น · ไม่ดูจากคำตอบของ role เพราะ check อาจรายงาน "command not found" ของงานที่ตรวจ ซึ่งไม่ใช่อาการของตัวรัน · log แยกเหตุผล "ไม่ได้ติดตั้งบนเครื่อง" ออกจาก "ติดโควตา/limit" · **คำเตือน ⚠ ของ 0.15.0 เลิกจำเป็น: เครื่องไม่ติดตั้ง opencode ก็แค่ถูกข้ามเฉยๆ** · tests 98 → 100

## 0.15.0 — 2026-10-23 · เพิ่มตัวรันที่สี่ opencode — GLM ผ่าน Z.AI Coding Plan (cost 0)

### ⚠ ต้องทำตอนอัปเกรด (รู้ไว้)
- **opencode เข้าลำดับ fallback ทุก tier (`codex→opencode→agy→claude`)** — เครื่องที่ไม่มี opencode CLI: เมื่อ codex ติดโควตา ระบบจะสลับไป opencode แล้วล้มด้วย "command not found" แทนที่จะไปต่อที่ agy (spawn ล้มไม่ใช่ limit error จึงไม่สลับต่อ) · **ถ้าใช้ GLM:** ติดตั้ง `npm i -g opencode-ai` + `opencode auth login` (เลือก Z.AI Coding Plan) ครั้งเดียวต่อเครื่อง · **ถ้าไม่ใช้ GLM:** ถือ `agents.json` เดิมของตัวเองต่อ หรือลบ opencode ออกจาก `_fallback` ใน agents.json ของ workspace

### เพิ่ม
- **ตัวรันที่สี่: opencode (GLM ผ่าน Z.AI Coding Plan — เหมาจ่าย cost 0 ต่อครั้ง)** — tier: t2=`glm-5.3#max` · t3=`glm-5.3#high` · t4=`glm-5.3-flash#max` · t5=`glm-5.3-flash#high` (จัดตาม Intelligence Index ที่ผู้ใช้วัด: 5.3 max ≈ sonnet high) · t0/t1 = null (GLM เพดาน t2 — fallback ข้ามไปค่ายอื่นอัตโนมัติ) · ลำดับ `_fallback` ทุก tier เป็น codex→opencode→agy→claude · effort ฝังใน model string ผ่าน `#variant` (ต้องใช้ opencode ≥ 2.1.4 — ทดสอบจริง: รันได้ ตอบถูก #max คิดนานกว่า #low) · read-only = ไม่ใส่ `--auto` (non-interactive ปฏิเสธการกระทำที่ต้องขออนุญาตเอง) · write = `--auto` · ต้อง `opencode auth login` เลือก Z.AI Coding Plan ก่อนใช้ · smoke จริงผ่านครบ: t2 glm-5.3#max อ่าน knowledge จริงจบ DONE ตรง marker / t4 flash#max อ่าน / t5 flash#high เขียนไฟล์จริง · tests 96 → 98

## 0.14.0 — 2026-10-23 · planner กันชนไฟล์ตอน parallel + gm เป็นเจ้าของ release runbook

### เพิ่ม
- **กติกา parallel ระดับไฟล์** — task implement ที่เขียน target repository เดียวกันต้อง serialize (หรือระบุในใบงานว่าไฟล์/path ไม่ชนกันแน่) แม้จะไม่แชร์ API contract — เดิมคำแนะนำของ planner พูดถึง parallel เฉพาะระดับ contract ทำให้สอง task ขนานที่แตะโมดูลเดียวกันใน working tree เดียวกันเสี่ยงชนกันโดยไม่มีใครเลี่ยงให้ · แก้ทั้งใน prompt ของ planner และหน้าที่ role plan
- **gm เป็นเจ้าของ release runbook** — ก่อนปิดรอบ release ให้ gm รวม SQL/rollback ของ vault + ลำดับ deploy + สิ่งที่มนุษย์ต้องรัน เป็น runbook เดียวพร้อมจุด rollback ไว้ใต้ `plan\**` — ปิดช่องว่างที่งาน release ไม่มีเจ้าของ โดยไม่เพิ่ม role ใหม่ (การรันจริงยังเป็นของมนุษย์เหมือนเดิม)

## 0.13.0 — 2026-10-23 · มาตรฐานเอกสารข้อมูลอ่านรู้เรื่อง + DBML คู่ data model + แก้ auto-commit

### เพิ่ม
- **กำหนด DBML เป็นผลส่งมอบคู่ relational data model** — แบบเต็มพร้อม Note ไทย/กลุ่มสี และภาพ integration ย่อเมื่อมีตารางเดิม พร้อมคู่มือสี/เส้นและข้อจำกัด · arch ดูแล artifact; vault เทียบ SQL; inspect/check ตรวจ parser/version/dialect และ physical/logical refs รวม structural comparison เมื่องานเปลี่ยนเฉพาะคำอธิบาย; นายช่างบันทึกก่อน final knowledge commit
- **เพิ่มมาตรฐานคู่มือ data model** — หน้าที่ตาราง/หนึ่งแถว/ความหมายทุกฟิลด์/JSON/enum และตารางเก่าที่ใช้พร้อมคอลัมน์เชื่อมและหลักฐาน · กำหนดผู้รับผิดชอบให้ชัด: arch ดูแลคู่มือหลัก, vault เทียบ physical SQL, inspect/check ตรวจความครบถ้วนในขอบเขตงาน; นายช่างตรวจและบันทึกก่อนส่งต่อ
- อนุญาตตามลิงก์ตรงจาก data-model/index ไปยังส่วนของสัญญาที่แยกไฟล์ และแยกการขยายคำอธิบายออกจากการเปลี่ยน schema/การตรวจ runtime
- ปรับเอกสาร/บทบาทด้วยกลไกประกอบ prompt เดิม — คำสั่งและวิธีใช้กับผู้ใช้ไม่เปลี่ยน · tests 94 → 96 กรณี

### แก้
- **auto-commit knowledge อ่านชื่อ module/path ผิดเมื่อรายการแรกใน git status เป็น tracked file ที่แก้แต่ยังไม่ stage** — คง stdout ของ porcelain แบบ raw ไม่ตัด leading space พร้อม regression test กับ Git repo ชั่วคราว
- แก้กติกา Git ที่ขัดกับฟีเจอร์: อนุญาตเฉพาะ configured knowledge commits และกำหนดให้นายช่างเรียก commit หลังบันทึก output/เอกสารของตัวเองครบ ไม่อาศัย hook ของ role ที่จบไปก่อนหน้านั้น

## 0.12.0 — 2026-10-22 · เปลี่ยนชื่อ MYCELIUM→BAAN + prompt อังกฤษทั้งระบบ + auto commit ที่เก็บเอกสาร

### ⚠ ต้องทำตอนอัปเกรด
- **เปลี่ยนชื่อ project ทั้งระบบ: MYCELIUM → BAAN (🏗️ นายช่าง) ธีมงานก่อสร้าง** — คำสั่ง `mycelium`/`mycelium-role` → `baan`/`baan-role` (คำสั่งเก่ายังใช้ได้ผ่าน bin compat) · role ทั้ง 11 เปลี่ยน ID+ตำแหน่ง: `planner→plan` นักวางผัง · `pm→gm` ผู้จัดการหน้างาน · `ba→spec` ผู้เขียนข้อกำหนด · `sa→arch` สถาปนิก · `ux→int` นักออกแบบตกแต่งภายใน · `fe→front` ช่างหน้างาน · `be→sys` ช่างระบบ · `dba→vault` ผู้ดูแลห้องนิรภัย · `tp→inspect` หัวหน้าตรวจรับ · `qa→check` ผู้ตรวจงานอิสระ · `sec→jpo` จป. — **ID เก่าทุกรุ่น (ba/sa/fe และชื่อยาว business-analyst ฯลฯ) ยังใช้ได้เป็น alias** ทั้ง `--role`, แผนเก่าและ `--plan-file`
- **repo ย้ายราก `project-ai` → `baan` และย้ายโฟลเดอร์ package `mycelium/` → `baan/`** — ใคร `npm link` จาก path เก่าต้อง clone ใหม่ที่ path ปัจจุบันแล้ว `npm link` อีกครั้ง (ตัวคำสั่งและพฤติกรรมไม่เปลี่ยน)
- config ของ workspace เปลี่ยนชื่อเป็น `baan.config.json` — ชื่อเก่า `mycelium.config.json` และ `mycelium/mycelium.json` ยังถูกพบอัตโนมัติ (อยากได้ชื่อใหม่ให้รัน `baan --init` ที่ราก workspace ซึ่งจะย้ายให้เอง) · env `BAAN_CONFIG` มาแทน `MYCELIUM_CONFIG` (ตัวเก่ายังรับ) · ตัวอย่างใน package เป็น `baan.example.json`
- **ผู้ใช้ agy ต้องติดตั้ง agent profile `baan-readonly` ต่อเครื่อง** (เดิม `mycelium-readonly`) — ไฟล์อยู่ที่ `setup/agy/` เหมือนเดิม แค่ชื่อใหม่ (profile เก่าที่ติดตั้งไว้ไม่ถูกอ้างอีกต่อไป ลบได้) · charter เปลี่ยนชื่อไฟล์ `MYCELIUM.md` → `BAAN.md` · workspace ที่ `--init` ไว้แล้ว: รัน `baan --init` อีกครั้งเพื่ออัปเดต CLAUDE.md/AGENTS.md stub

### เปลี่ยน
- **prompt ที่ส่งเข้า AI ทั้งหมดเป็นภาษาอังกฤษ** — เนื้อหา role ทั้ง 11 ไฟล์, CONVENTIONS.md, ป้าย `[baan-role:]`/ข้อยกเว้น, หัวข้อประกอบ prompt (date/assignment/context) และบล็อก context ระหว่าง task · **ผลลัพธ์ยังเป็นไทยเหมือนเดิม** — บังคับด้วยกฎ "Working language" ในทุก role + CONVENTIONS §11 (เอกสาร/คำตอบไทย ศัพท์เทคนิค/โค้ด/ID อังกฤษ) · หัวไฟล์ role (`# บทบาท:`/`> หน้าที่:`/`> tier:`) คงไว้เป็นไทยเพื่อ `--list` และตารางเอกสาร · ตรวจจริงแล้วกับ agy: prompt อังกฤษ ตอบไทยครบทั้งฉบับ (schoolbright 2026-10-22)
- **ยกระดับบทบาททุกตำแหน่งให้คมขึ้น มี "philosophy" เฉพาะตัว** — spec เค้นความต้องการจริงด้วยคำถามเชิงรุก (ห้ามยอมรับคำกำกวม ถามจนทดสอบได้) · arch เรียบง่ายก่อนเสมอ (ของเดิมที่ใช้ได้ชนะท่ายาก แต่กล้าเปลี่ยนรากฐานเมื่อผิดทาง — "เสาหลักของบ้าน รากฐานไม่ดีไม่ใช่บ้านที่ดี") · plan แผนเล็กที่สุดที่ได้งาน (task เกินความจำเป็น = แผนบกพร่อง) · gm คุ้มกัน scope creep · front ทำเป๊ะตามที่ขอ ไม่เพิ่มของที่ไม่ได้ขอ · sys validation ทุกขาเข้า + boring defensive code · vault schema ที่ทำให้บั๊กเป็นไปไม่ได้ · inspect ล่าช่องโหว่ ไม่ใช่แค่ครอบคลุม · check เดินหน้าเป็นศัตรูของโค้ด (สมมติว่าพังจนพิสูจน์ว่าไม่พัง) · jpo ตรวจตามพื้นผิวจริง จัดระดับตามความเสี่ยงจริง

### เพิ่ม
- **auto commit ที่เก็บเอกสาร (knowledge) หลังจบ run** — knowledge root ที่เป็น git repo ถูก commit ให้อัตโนมัติตอนจบ run ของทั้ง `baan` และ `baan-role` · แยก commit ต่อ module (โฟลเดอร์ย่อยแรกใต้ knowledge) ข้อความอังกฤษสั้นรูปแบบ `module: add|update|remove <ไฟล์> [+N more]` · commit ของ module หนึ่งไม่กลืนของที่ staged ค้างข้าม module · ไม่ใช่ git repo = ข้ามเงียบๆ · git พังไม่กระทบผล run · เรียกด้วยมือได้ด้วย `baan --commit`
- **เอกสารเขียนใหม่เป็นการแนะนำโปรเจกต์** — `README.md` ของ package มี "BAAN คืออะไร / เริ่มต้นใช้งาน" ตอนต้น ตัดเหตุผลเฉพาะวงในออก (ประวัติทดสอบรายรุ่นอยู่ที่ RELEASE-NOTES ฉบับนี้) · README ราก repo เป็นหน้าแรกบางๆ ชี้มาคู่มือเดียว
- tests 87 → 94 กรณี (ชุดใหม่: parse/group/ข้อความของ auto commit รวม integration กับ git repo จริงใน temp dir)

## 0.11.0 — 2026-10-22 · timeout รวมศูนย์ + tier กลาง–ล่างตาม Intelligence Index + agy อ่านไฟล์นอก workspace ได้

### ⚠ ต้องทำตอนอัปเกรด (รู้ไว้)
- **tier t3–t5 เปลี่ยน model/effort ของ codex และ agy** — t3 codex `gpt-6.1-sol` medium→**low** · t4 codex `gpt-6-luna` medium→**high** + agy `gemini-3.8-flash-medium`→**flash-low** · t5 codex `gpt-6-luna` low→**medium** · เหตุผล: จัดตาม Intelligence Index ให้สติปาร์ตี้ใน tier เดียวกันใกล้กัน (เดิม t3 ของ codex สูงกว่าเพื่อน 7–8 คะแนนจนเผาโควตาเกินจำเป็น และตอน fallback ความสามารถกระโดดหนักในแผนเดียว) · ผู้ใช้ที่แก้ `agents.json` ของตัวเองไว้ = ยังใช้ของตัวเองต่อ (ไม่พัง แค่ไม่ได้รับการจัดใหม่)
- **timeout เริ่มต้นขยับ 600 → 1800 วินาที (t0: 900 → 3600)** — งานที่ค้างจะถูก kill ช้าขึ้นกว่าเดิม · คุมค่าเดิมได้ด้วย `defaults.timeout_sec` ใน workspace config, `_timeoutSec` ของ tier หรือ `--timeout` เหมือนเดิม

### เปลี่ยน
- **priority ของ timeout เป็นชุดเดียวทุกจุด** (role, PM/planner, งานในแผน, fallback): `--timeout` ที่ระบุเอง > `_timeoutSec` ของ tier > `defaults.timeout_sec` ของ workspace > 1800 วินาที · ค่าที่เลือกต้องเป็น integer 1–86400 — ค่าผิด = error ทันที ไม่เปลี่ยนเป็น default เงียบๆ
- `mycelium-role` อ่าน `defaults.timeout_sec` ด้วย workspace loader ร่วม (ค้นจาก `--cwd` หรือไดเรกทอรีที่เรียก รองรับ `MYCELIUM_CONFIG`) โดยไม่เปลี่ยน agent, cwd หรือโหมดสิทธิ์จาก workspace defaults

### แก้
- **agy เคยได้คำตอบว่างเปล่าเมื่องานอ้างไฟล์นอก cwd** (เช่น SA @ t1 ที่ cwd=target อ่าน `knowledge/` ไม่ได้ตอน fallback จาก codex — พบจริงที่ schoolbright 2026-10-22) — jetski ของ agy กันอ่านไฟล์นอก workspace และ headless ปฏิเสธคำขอแทนการถาม · ตอนนี้ MYCELIUM ส่ง `--add-dir <ราก workspace>` ให้ agy **เฉพาะโหมดอ่าน** (ค้นรากจาก `mycelium.config.json` เดินขึ้นจาก cwd — ไม่เจอ config = ไม่ส่ง) · โหมด `--write` ไม่ส่ง เพราะ `--add-dir` ขยายขอบเขต *การเขียน* ตามไปด้วย (ทดสอบแล้วใน accept-edits) — งานเขียนที่ต้องอ่านไฟล์นอก cwd ให้ฝังเนื้อหาใน task หรือรัน read แยกก่อน

### เพิ่ม
- **`workspaceDirArgs` ใน `agents.json`** — กลไกส่ง `--add-dir` ของ agy แบบ placeholder `<WORKSPACE_ROOT>` (ใช้ได้กับ agent อื่นด้วยถ้า CLI นั้นมี flag แบบเดียวกัน)
- **`smoke:live` ปลอม sandbox เป็นรูป workspace จริง** (มี `mycelium.config.json` ที่ราก + ไฟล์ลับนอก cwd ของ agent) และเพิ่มช่องตรวจ "อ่านนอก cwd" — sandbox เดิมอยู่ใน %TEMP% ซึ่งเป็น safe area ของ jetski จึงตรวจไม่พบบั๊กแบบที่เจอจริง
- จัดส่ง `scripts/live-smoke.mjs` มากับ package ด้วย (0.10.0 ลืมใส่ `files` — ผู้ติดตั้งรัน `npm run smoke:live` ไม่ได้ทั้งที่เอกสารสั่งใช้)
- tests 80 (0.10.0) → 86 กรณี

### ผลทดสอบจริงก่อนปล่อย (2026-10-22)
- `npm run smoke:live -- --tier t1 --agents agy` และ `--tier t4 --agents agy`: **PASS ครบทุกช่อง** (t4 รวมคอลัมน์ใหม่ "อ่านนอก cwd")
- งานจริงที่ schoolbright: `mycelium-role --agent agy --role sa --tier t1` ที่ cwd=target อ่าน `req-043.md`/`des-008.md` ใน `knowledge/` ได้ (completed + อ้าง path จริง) — คือกรณีเดิมที่ได้คำตอบว่างตอน fallback จาก codex
- codex ติดโควตาถึง 27 ต.ค. 2026 — config ใหม่ของ codex ทุกตัว (sol-low @ t3, luna-high @ t4, luna-medium @ t5) ผ่านการเปิด session จริง (CLI รับ model/effort ถูกต้อง) แต่ยังตรวจพฤติกรรมเต็มไม่ได้ · เมื่อโควตากลับ รัน `npm run smoke:live -- --tier t3 --agents codex` และ `--tier t4 --agents codex` ได้เลย

## Change Log

- 2026-10-21: บันทึก timeout fix ที่ยังไม่ release
- 2026-10-22: ปรับ t3–t5 ตาม Intelligence Index (fallback parity) — แยก commit จาก timeout
- 2026-10-22: แก้ agy อ่านนอก workspace ไม่ได้ใน headless + smoke ครอบคลุมกรณีนี้

## 0.10.0 — 2026-10-17 · ตัวรันทั้ง 3 ค่ายผ่าน live smoke + role ไม่สวมบท MYCELIUM ซ้อน + กติกาสไตล์โค้ด

### แก้
- **session ที่ถูกเปิดเป็น role ไม่สวมบท MYCELIUM ซ้อนแล้ว** — CLAUDE.md/AGENTS.md ที่ `--init` วางไว้ถูก AI CLI โหลดเองอัตโนมัติ (claude อ่านของโฟลเดอร์แม่ด้วย) role จึงได้คำสั่ง "คุณคือ MYCELIUM" ซ้อนกับบทบาทของตัวเอง (พบจาก smoke จริงที่ schoolbright: codex ที่เปิดเป็น `ba` พยายามเปิด charter ก่อนทำงาน)
  - prompt ของทุก role (รวม PM/planner และงานไม่ผูก role = `adhoc`) ขึ้นต้นด้วยป้าย `[mycelium-role: <ID>]` + ประโยคข้อยกเว้น
  - stub ของ `--init` มีประโยคข้อยกเว้นเดียวกันอยู่ก่อนคำสั่งสวมบท — เจอป้ายนี้ = ทำตามบทบาท ไม่อ่าน charter ไม่เรียก mycelium/mycelium-role ต่อ
- **agy `--write` ใช้ได้แล้ว** — `--mode accept-edits` เคยอยู่หลัง `--print` จน `--print` กลืนเป็น prompt แล้วล้ม exit 2 ทุกครั้ง · ย้ายไว้ก่อน `--print` + test กันลำดับ
- **agy read-only บังคับห้ามเขียนได้จริงแล้ว** — `--mode plan` เดิมยังเขียนไฟล์ได้ และ `--sandbox` กันแค่ terminal · `readArgs` เป็น `["--agent", "mycelium-readonly", "--print"]` คู่กับ custom agent profile ระดับผู้ใช้ (`~/.gemini/config/agents/mycelium-readonly/agent.md` ตัด write tools ออกจาก toolset) และ `PreToolUse` guard hook (`~/.gemini/config/mycelium-readonly-guard.js` บังคับ allowlist คำสั่งอ่านอย่างเดียวเฉพาะเซสชัน `mycelium-readonly`)
- **claude รันคำสั่งได้ตามโหมด** — `-p` ไม่มีคนกดอนุมัติ tool จึงเคยรันคำสั่งไม่ได้เลย · read-only: `--allowedTools` เฉพาะ Read/Grep/Glob + คำสั่งอ่านอย่างเดียว (git status/log/diff/show ฯลฯ) · write: เพิ่ม Edit/Write/Bash/PowerShell
- **CONVENTIONS §8: ทำไม่ได้เพราะสภาพแวดล้อม = `BLOCKED`** — เคยเห็น role จบ `DONE` ทั้งที่รันคำสั่งไม่ได้ จนนับเป็น completed

### เพิ่ม
- **กติกาสไตล์โค้ดและ comment ของ `fe`/`be`/`qa`** (role ที่เขียนโค้ดลง target — หมวดเดียวกันทั้งสามไฟล์ + test กันไม่ให้ต่างกัน): เขียนให้เหมือนโค้ดรอบข้างใน target ห้ามเปลี่ยนสไตล์/reformat/refactor นอก task · comment เฉพาะ "why" ห้าม comment what · ห้ามใส่ task id หรือ ID เอกสาร (T1/BL/REQ/DES ฯลฯ) ลงในโค้ดหรือ comment — การโยงงานอยู่ใน handoff เท่านั้น (สำหรับ `qa` รวมถึงชื่อเคส test — traceability AC ↔ test อยู่ใน test plan ของ `tp`)
- **`setup/agy/`** — profile `mycelium-readonly` ของ agy (agent.md + guard hook + ตัวอย่าง hooks.json + ขั้นตอนติดตั้ง) มากับ package
- **`npm run smoke:live`** (`scripts/live-smoke.mjs`) — ทดสอบตัวรันจริงทุกค่ายด้วยค่าที่เดาไม่ได้และตรวจบนดิสก์: อ่านไฟล์ · คำสั่งอ่านอย่างเดียว · รันโค้ด · read-only กันเขียนจริง · `--write` · สถานะไม่เกินจริง (ใช้โควตาจริง ไม่อยู่ใน `npm test`)
- tests 72 (0.9.0) → 80 กรณี

### ผลทดสอบจริงก่อนปล่อย (2026-10-17)
- `npm run smoke:live -- --tier t3`: **claude / codex / agy PASS ครบทุกช่อง** (อ่านไฟล์ · git log · read-only กันเขียนบนดิสก์ · `--write` · สถานะตรงจริง) — claude ผ่านที่ t1/t3/t5 ด้วย
- e2e งานจริง (โปรเจกต์จำลองที่มีสไตล์เฉพาะ + spec 5 AC): `be` → `DONE`, `qa` → `PASS` **ทั้งสามค่าย** · test ลับ 8/8 · สไตล์ตรง target · ไม่มี task/AC id ในโค้ด · ไม่เพิ่ม comment · ไม่มี state-changing git ค้าง
- shell ของ codex (`setup refresh had errors`) แก้ที่เครื่องแล้ว — `codex doctor` = `✓ sandbox` (เป็นเรื่องของเครื่อง ไม่เกี่ยวกับ package)

### ⚠ ต้องทำตอนอัปเกรด
- **ใช้ agy แบบ read-only (ค่าเริ่มต้น และ fallback ทุก tier) ต้องมี agent profile `mycelium-readonly` ในเครื่อง** — ไม่มี = agy ล้มทุกงาน read-only (ไม่ใช่ข้อผิดพลาดโควตา จึงไม่สลับตัวรัน) · ไฟล์ทั้งหมดมากับ package ที่ `setup/agy/` — ทำตาม `setup/agy/README.md` (คัดลอก `agent.md` + `mycelium-readonly-guard.js` ไป `~/.gemini/config/` และรวม entry จาก `hooks.example.json` เข้า `hooks.json` ของเครื่องเอง โดยไม่ทับ hook เดิม) · ตรวจด้วย `agy agents` (ต้องเห็น `mycelium-readonly`) แล้ว `npm run smoke:live -- --agents agy`
- workspace ที่ `--init` ไว้แล้ว: รัน `mycelium --init` ที่ราก workspace อีกครั้งเพื่อให้ CLAUDE.md/AGENTS.md มีข้อยกเว้น (ไฟล์ที่ผู้ใช้เขียนเองจะถูกข้าม — เพิ่มประโยคข้อยกเว้นจาก `src/role-guard.mjs` เอง)

## 0.9.0 — 2026-10-17 · โหมดหลักได้สถานะงาน/fallback เดียวกับโหมดอัตโนมัติ + ID role สั้น

### เปลี่ยน
- **`mycelium-role` cwd เริ่มต้น = ไดเรกทอรีที่เรียก** (เดิม = โฟลเดอร์แม่ของ package → role อ่านผิด repo เงียบๆ เมื่อลืม `--cwd`)
- **`mycelium-role` ตัดสินผลด้วย output state ท้ายคำตอบ** — role ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` = งานไม่สำเร็จแม้ CLI exit 0 · exit 0 เฉพาะเมื่อทุกตัว completed
- โฟลเดอร์ผลของ `mycelium-role` มีชื่อ role + suffix สุ่ม — เปิดหลาย role พร้อมกันในวินาทีเดียวไม่เขียนทับกันอีก
- **ID role สั้นลง**: `pm` `ba` `sa` `ux` `fe` `be` `dba` `tp` `sec` (`planner`/`qa` เท่าเดิม) — ไฟล์ย้ายเป็น `roles/<ID>.md` · ชื่อยาวเดิม (เช่น `business-analyst`) ยังใช้ได้เป็น alias ทั้ง `--role` และในแผน (plan.json เก่า/`--plan-file` ถูกแปลงให้เอง จึง resume run เดิมได้)
- **tier ตรงกันทุกที่**: แก้บรรทัด tier ในไฟล์ role และตาราง README ที่เพี้ยนจากโค้ด (SA เคยเขียน t0–t1 แต่ใช้จริง t1 · PM/security t1–t2 แต่ใช้จริง t2 · FE/BE t2–t3 แต่เลือกได้ t2–t5)
- คำอธิบายใหม่: "ผู้คุมทีม AI 11 role: แตกงาน เปิด session ราย role ผ่าน claude/codex/agy ส่งต่อ context และหยุดถามคนที่ประตูมนุษย์" · `dba` แสดงชื่อเป็น Database Advisor (ตรงกับหน้าที่ที่ปรึกษา ห้ามรัน SQL)

### เพิ่ม
- `mycelium-role` สลับตัวรันเมื่อติดโควตาตาม `_fallback` ของ tier (agent เดียว + `--tier`) · `--no-fallback` ปิดได้ · `report.json` มี `state`/`marker`/`fallback`
- **วันที่ของงานใน prompt ทุก role** + PM/planner — ค่าเริ่มต้น = วันที่ local ของเครื่อง · `--date YYYY-MM-DD` ทั้งสองคำสั่ง · CONVENTIONS §4 ให้ role ใช้วันที่นี้แทนการถาม (role รัน non-interactive ถามไม่ได้)
- หัวไฟล์ role รูปแบบเดียว: `# บทบาท:` ชื่อแสดง · `> หน้าที่:` หนึ่งบรรทัด · `> tier:` — `--list` แสดง ID/ชื่อ/tier/หน้าที่/ชื่อเดิม และ prompt ของ planner ได้หน้าที่ของแต่ละ role ด้วย
- กลไก fallback รวมเป็น `runWithFallback` ชุดเดียว (งานในแผน, PM/planner, mycelium-role) · `mycelium-role` ประกอบ prompt ผ่าน `roleDirective` ร่วมกับโหมดอัตโนมัติ
- tests 54 → 72 กรณี: cwd, runDir ไม่ชน, state/fallback ของ mycelium-role, วันที่ใน prompt, alias ชื่อ role และ test กันตาราง role/tier เพี้ยนจากโค้ด

### ⚠ ต้องทำตอนอัปเกรด
- สคริปต์/session ที่เรียก `mycelium-role` โดยไม่ส่ง `--cwd` และพึ่ง cwd เดิม (โฟลเดอร์แม่ของ package) — ส่ง `--cwd` ให้ชัด
- ผู้ที่ใช้ exit code ของ `mycelium-role`: ตอนนี้ role ที่ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` ได้ exit 1 (เดิม 0) — อ่านบรรทัด `สรุป:` เพื่อดูสถานะราย agent
- ใครอ้าง path ไฟล์ role ตรงๆ (เช่น `roles/business-analyst.md`) เปลี่ยนเป็น `roles/<ID>.md` · คำสั่ง `--role` ชื่อเดิมไม่ต้องแก้ (alias) · workspace ที่ `--init` ไว้แล้ว: รัน `mycelium --init` อีกครั้งเพื่ออัปเดตหัวข้อ CLAUDE.md/AGENTS.md (ไม่บังคับ)

## 0.8.0 — 2026-10-17 · เติม agy กลับทุก tier ด้วย Gemini 4 Argon

### เปลี่ยน
- **agy ใช้ได้ครบทุก tier แล้ว** หลัง Gemini 4 Argon เปิดตัว: t0/t1 = `gemini-4-argon-high` · t2 = `gemini-4-argon-medium` (t3–t5 คง `gemini-3.8-flash` เดิม)
- ข้อจำกัด: agy ไม่มี effort `max` ให้ — ที่ t0 จึงใช้ argon-high เป็นเพดานสูงสุด (ต่างจาก claude/codex ที่ได้ max)
- ตรวจชื่อ model จริงจาก `agy models` ก่อนเติม · อัปเดตตาราง tier ladder ใน README + charter ให้ตรง

### เพิ่ม
- tests ตรวจ `agents.json` (ทุก tier ประกาศครบสาม agent · รูปแบบ entry ถูกต้อง · argon อยู่ t0–t2, flash อยู่ t3–t5) — รวม 48 กรณี

## 0.7.0 — 2026-10-16 · config เหลือไฟล์เดียว `mycelium.config.json` ที่ราก workspace

### เปลี่ยน
- config ของ workspace จาก `<workspace>\mycelium\mycelium.json` (โฟลเดอร์ซ้อนชื่อไฟล์) → **`<workspace>\mycelium.config.json`** ไฟล์เดียว
- discovery เดินหาขึ้นจากจุดที่เรียก **ตัวใกล้สุดชนะ** — workspace ซ้อนกันได้ · แผนเก่า `mycelium\mycelium.json` ยังถูกพบได้ (ไม่พังทันทีเมื่ออัปเกรด)
- `mycelium --init` ย้าย config แผนเก่าให้อัตโนมัติ + ทำไฟล์นำทาง (CLAUDE.md/AGENTS.md) ใหม่ให้ชี้ตำแหน่งถูก

### ⚠ ต้องทำตอนอัปเกรด
- workspace ที่ตั้งไว้สมัย 0.5–0.6: รัน `mycelium --init` ที่ราก workspace หนึ่งครั้ง ระบบจะย้าย config เป็นแผนใหม่ให้เอง

(พร้อมกันนี้เพิ่ม `mycelium --init` ใน 0.6.0 สำหรับผู้ที่พลาด: สร้าง CLAUDE.md/AGENTS.md ให้ AI session สวมบท MYCELIUM เอง + config จาก template)

## 0.6.0 — 2026-10-16 · `mycelium --init` ติดตั้ง workspace ครั้งเดียว จบเรื่องสวมบท

### เพิ่ม
- **`mycelium --init`** — รันครั้งเดียวที่ราก workspace (เช่น `C:\src\schoolbright`):
  - สร้าง `mycelium\mycelium.json` จากตัวอย่าง (ถ้ายังไม่มี — ถ้ามีอยู่แล้วไม่แตะ)
  - สร้าง **`CLAUDE.md`** (Claude Code โหลดอัตโนมัติ) และ **`AGENTS.md`** (codex และ agent อื่นโหลดอัตโนมัติ) ที่ราก workspace
  - สองไฟล์นี้เป็น "ทางเข้า" ที่ชี้ไป charter `MYCELIUM.md` ตัวจริงใน package — เปิด AI session ที่ workspace ได้เลย สวมบท MYCELIUM เองโดยไม่ต้องพิมพ์คำสั่ง และ charter ตกรุ่นไม่ได้เพราะไม่มีสำเนา
- รัน `--init` ซ้ำได้: config ของผู้ใช้ไม่ถูกแตะ · stub ที่เราสร้างไว้ถูก regenerate · ไฟล์ CLAUDE.md ที่ผู้ใช้เขียนเองจะถูกข้ามพร้อมเตือน (ไม่ทับเด็ดขาด)

## 0.5.0 — 2026-10-16 · แยก config ออกจาก package

config ของ workspace (targets/knowledge paths ของแต่ละเครื่อง) ย้ายออกจาก package — update version หรือ clone package ใหม่จะไม่ทับ config อีกต่อไป

### เพิ่ม
- **config discovery**: เดินหา `<dir>\mycelium\mycelium.json` ขึ้นจากไดเรกทอรีที่เรียก (เช่นเรียกจากใน `C:\src\schoolbright\...` จะเจอ `C:\src\schoolbright\mycelium\mycelium.json` เอง)
- `--config <file>` และ env `MYCELIUM_CONFIG` สำหรับระบุตำแหน่งตรงๆ (ชนะ discovery)
- `mycelium --list` แสดงว่าอ่าน config จากไหน · ไม่พบ target จะบอกตำแหน่ง config ที่ใช้อยู่ด้วย
- `mycelium.example.json` — template ตัวอย่างใน package แทนไฟล์จริง

### เปลี่ยน
- `mycelium.json` หายไปจาก package (ย้ายเป็นของ workspace แต่ละที่) — `files` ใน package.json ใช้ example แทน
- เรียกจากนอก workspace ที่ไม่มี config → ใช้ default ในโค้ด (ไม่มี targets) พร้อมข้อความแนะนำ

### ⚠ ต้องทำตอนอัปเกรด
- ย้าย config เดิมไปวางที่ `<ราก workspace>\mycelium\mycelium.json` (เช่น `C:\src\schoolbright\mycelium\mycelium.json`) หรือส่ง `--config` ทุกครั้ง

## 0.4.0 — 2026-10-16 · แยกโครงสร้างไฟล์

แยกโค้ดจาก 2 ไฟล์ใหญ่ (938 บรรทัดรวม) เป็น `bin/` + `src/` ตามโครงสร้างที่ AUDIT ข้อ 7 แนะนำ

### เปลี่ยน
- `bin/mycelium.mjs` + `bin/mycelium-role.mjs` — entrypoint เหลือแค่ parse args และลำดับใหญ่ (~195 บรรทัด/ไฟล์)
- `src/` แยกหน้าที่: `config` (การตั้งค่า/targets/roles) · `runner` (spawn AI CLI) · `prompts` (ประกอบ prompt) · `plan` (validation แผน DAG) · `scheduler` (สถานะงาน/execute) · `run-store` (checkpoint/manifest/resume)
- กลไก spawn/args/stdin/timeout ที่เคยซ้ำในสองคำสั่ง รวมเป็น `src/runner.mjs` ชุดเดียว
- comment เหลือเฉพาะเหตุผล (why) ที่โค้ดบอกเองไม่ได้ · ลบของไม่ใช้ (`PLANNER_TIERS_ROLES`, ตัวช่วย smoke ชั่วคราว)

### ⚠ ต้องทำตอนอัปเกรด
- path ของ bin เปลี่ยน — เครื่องที่ link ไว้ต้อง `npm link` ใหม่หนึ่งครั้ง

## 0.3.0 — 2026-10-16 · แก้ความถูกต้องตาม AUDIT.md (2026-10-15)

แก้ P1 ครบ 5 ข้อ + P2 สองข้อ พร้อม regression tests 35 กรณี (`npm test` — จำลอง provider ไม่ใช้โควตา)

### เพิ่ม
- **สถานะงานแยกจาก exit code** — task เป็น `completed` เฉพาะเมื่อรันจบ + มีคำตอบ + output state ท้ายคำตอบ (CONVENTIONS §8) เป็น `DONE`/`PASS`; role ตอบ `NEEDS_*`/`FAIL`/`BLOCKED` ถือว่างานล้มแม้ exit code เป็น 0
- **checkpoint ราย task** (`<id>.status.json`) เขียนทันทีแบบ atomic พร้อม attempt และ artifact paths
- **manifest ของ run** (`run.json`) เก็บ resolved target/cwd/write/projectCtx — `--resume` คืนบริบทเดิมอัตโนมัติ (flag ที่ส่งเองชนะเสมอ)
- **exit code ใหม่**: 0 เมื่อทุก task completed เท่านั้น · 1 เมื่อมี needs_*/fail/timeout/blocked พร้อมสาเหตุราย task
- context ส่งต่อระหว่าง task แนบสถานะ + path ฉบับเต็ม และแจ้งเมื่อถูกตัดที่ 6,000 ตัวอักษร

### แก้
- **dependency ผ่านเฉพาะงานที่ completed** — เดิมงาน fail แล้วงานลูกยังรันต่อและ pipeline จบ exit 0 ได้; ตอนนี้งานลูกถูก mark `blocked` แต่งานอิสระยังทำต่อจนจบ
- **resume เลิกเชื่อไฟล์คำตอบลอยๆ** — เดิมมี answer ไม่ว่าง = สำเร็จ ทำให้งาน timeout ที่มี output บางส่วนถูกข้าม; ตอนนี้เชื่อเฉพาะ checkpoint completed ที่มีคำตอบจริง
- **`--dry-run` ถูกกันทุก route** — เดิม `--plan-file`/`--resume` ข้ามจุดตรวจจนเรียก provider จริง; ตอนนี้การ์ดอยู่ใน `execute` จุดเดียว
- **plan validation ก่อน spawn ใดๆ** — id จำกัด pattern `[A-Za-z0-9][A-Za-z0-9_-]{0,63}` (กัน path traversal เพราะ id คือชื่อไฟล์), ตรวจ types ของ tasks/dependsOn/humanGates, self-dependency, cycle, และขอบเขต `--max-parallel`/`--timeout`
- **CONVENTIONS.md ติด package** แล้ว (`npm pack` ยืนยัน) — เดิมติดตั้งจาก tarball แล้วกติกากลางหายเงียบๆ; ตอนนี้อ่านไม่ได้ = หยุดชัดเจน · planner ได้กติกากลางครบเหมือน role อื่น

### ⚠ ต้องทำตอนอัปเกรด
- run ที่สร้างก่อน 0.3.0 ไม่มี checkpoint — `--resume` จะรันงานใหม่ทั้งหมด (โดย design เพื่อไม่เชื่อผลที่ไม่รู้สถานะ)

## 0.2.0 — 2026-10-15 · ทีม 11 role + CONVENTIONS + โหมดอัตโนมัติ

### เพิ่ม
- บทบาททีม 11 ตำแหน่งใน `roles/` (planner ถึง security) พร้อม `CONVENTIONS.md` เป็นกติกากลางที่แนบให้ทุก role อัตโนมัติ
- โหมดอัตโนมัติทั้งก้อน: `mycelium --goal "..."` — goal → PM → planner (แผน DAG) → execute ตาม wave · planner เลือก tier ได้เฉพาะ frontend/backend-engineer
- output state มาตรฐานตาม charter: `DONE`/`PASS`/`FAIL`/`BLOCKED`/`NEEDS_*`
- tier ladder t0–t5 (claude/codex/agy) + FIXED_ROLE_TIER + humanGates รวมรายงานตอนจบ

### แก้
- ข้อความ console อ้าง path เก่า `ai-team/roles/` → `roles/`

## ก่อน 0.2.0 (ช่วง POC — 2026-10-14)

พิสูจน์กลไกก่อนตั้งทีม: agent CLI ทั้งสาม (claude/codex/agy) อ่านไฟล์จริงได้, เปลี่ยน model/effort ตาม tier ได้จริง (ผ่าน 15/15), role directive ส่งถึง agent จริง — รายละเอียดอยู่ใน `README.md` หัวข้อผลการทดสอบ

## ถัดไป (ยังค้างจาก audit)

- task-level write scope + จัดคิวงานที่เขียน path เดียวกัน — ก่อนใช้ `--write` กับงานจริง
- humanGate เป็น object ผูกกับ task พร้อมหลักฐานการอนุมัติ
- Git baseline ของทั้ง workspace เพื่อรีวิว/ย้อนการเปลี่ยนแปลง
