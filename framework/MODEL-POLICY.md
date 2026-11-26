# MODEL-POLICY — มาตรฐานการเลือก AI Model & Reasoning Effort, Role-Owned Tiers และ Prompt อัปเดต `agents.json`

แหล่งความจริงเดียว (Single Source of Truth) สำหรับการจัดผังโมเดลและบทบาทใน [agents.json](agents.json) ของทั้ง 3 ค่าย (`codex`, `agy`, `claude`)
ทุกครั้งที่แก้ไข `agents.json`, provider adapters, `src/routing.mjs`, หรือเมื่อค่าย AI ปล่อยโมเดลรุ่นใหม่ ต้องอ่านและอัปเดตเอกสารนี้ควบคู่กับ [tests/agents-config.test.mjs](tests/agents-config.test.mjs), [tests/routing.test.mjs](tests/routing.test.mjs) และ [tests/init.test.mjs](tests/init.test.mjs) เสมอ

---

## 1. เกณฑ์กลางการเลือก AI Model และ Reasoning Effort (Provider-Agnostic Standard)

ใช้เป็นมาตรฐานกลางในการประเมินและเลือก AI จาก Claude, Codex และ Antigravity (AGY) โดยไม่ยึดติดกับชื่อโมเดลหรือผู้ให้บริการ

> **หลักการสำคัญ**: เลือก AI ที่ทำให้งานสำเร็จด้วยคุณภาพตามต้องการ โดยใช้เวลา ต้นทุน และโควตารวมอย่างคุ้มค่าที่สุด ไม่ใช่เลือก AI ที่มีคะแนน Benchmark สูงที่สุดเสมอไป

### 1.1 เกณฑ์ประเมินหลัก (11 ข้อ)

1. **Quality & Accuracy**: ความถูกต้องของผลลัพธ์ · ความสามารถในการทำงานสำเร็จตั้งแต่ครั้งแรก · ความเสี่ยงต่อข้อผิดพลาดและผลกระทบหากทำผิด
2. **Task Complexity**: ความยากและความซับซ้อนของงาน · จำนวนขั้นตอนที่ต้องคิดและดำเนินการ · ความจำเป็นในการวิเคราะห์เชิงลึกหรือวางแผน
3. **Model Capability**: จุดแข็งและจุดอ่อนของแต่ละโมเดล · ความเหมาะสมกับงานประเภทนั้น · ความสามารถด้าน Coding, Debugging, Reasoning, Architecture และการใช้ Tools
4. **Reasoning / Thinking Effort**: ระดับ Effort ที่เพียงพอต่องาน · ประโยชน์ที่ได้รับจากการเพิ่ม Effort · หลีกเลี่ยงการใช้ Effort สูงโดยไม่จำเป็น
5. **Token Consumption**: Input Tokens · Output Tokens · Reasoning / Thinking Tokens · Context ที่สะสมระหว่างทำงาน
6. **Cost & Quota**: ต้นทุนต่อการเรียกใช้งาน · การใช้โควตาหรือเครดิตของแต่ละระบบ · ข้อจำกัดการใช้งานและ Rate Limits · **แยกต้นทุน API ออกจากโควตาการสมัครสมาชิก**
7. **Speed & Latency**: เวลาเริ่มตอบสนอง (TTFT) · ความเร็วในการสร้างผลลัพธ์ (tok/s) · เวลารวมจนงานเสร็จจริง (Time per Task)
8. **Reliability & Retries**: ความสม่ำเสมอของผลลัพธ์ · จำนวนครั้งที่ต้องสั่งใหม่หรือแก้ไข · ต้นทุนและเวลาที่เสียจากการทำงานซ้ำ
9. **Context & Tool Efficiency**: ความสามารถในการจัดการ Context ขนาดใหญ่ · ประสิทธิภาพการอ่านและแก้ไขหลายไฟล์ · การใช้ Terminal, Search, Browser และ Tools · ความสามารถในการทำงานต่อเนื่องหลายขั้นตอน
10. **Cost per Successful Task**: ต้นทุนรวมจนงานสำเร็จ · รวมการ Retry, Debug และ Verification · ไม่ตัดสินจากราคา Token ต่อหน่วยเพียงอย่างเดียว
11. **Risk & Verification**: ระดับความเสี่ยงหาก AI ทำผิด · ความจำเป็นในการตรวจสอบผลลัพธ์ · ความสามารถในการทดสอบและย้อนกลับการเปลี่ยนแปลง · ความปลอดภัยของข้อมูลและสิทธิ์เข้าถึง

### 1.2 หลักการตัดสินใจ (10 ข้อ)

- เลือกโมเดลที่มีความสามารถเพียงพอกับงาน ไม่จำเป็นต้องเป็นโมเดลที่ฉลาดที่สุด
- เลือก Effort ต่ำที่สุดที่ยังให้คุณภาพตามมาตรฐาน
- งานง่ายให้ความสำคัญกับความเร็วและต้นทุน
- งานยากให้ความสำคัญกับความแม่นยำและความสามารถในการ Reasoning
- งานที่มีความเสี่ยงสูงต้องให้ความสำคัญกับ Reliability และ Verification
- งานหลายขั้นตอนให้พิจารณา Context, Tools และความสามารถของ Agent
- เปรียบเทียบต้นทุนต่อผลลัพธ์ที่สำเร็จ ไม่ใช่ต้นทุนต่อ Prompt
- หากโมเดลราคาแพงกว่าทำงานสำเร็จโดย Retry น้อยกว่า อาจคุ้มค่ากว่า
- หากการเพิ่ม Effort ไม่ทำให้คุณภาพดีขึ้นอย่างมีนัยสำคัญ (เช่น ได้คะแนนเพิ่ม < ~10% แต่จ่าย Compute/โควตาเพิ่ม +50% ถึง +90%) ให้ใช้ Effort ที่ต่ำกว่า
- ไม่สมมติว่าโมเดลหรือ Effort ระดับสูงกว่าจะดีกว่าเสมอ

### 1.3 สิ่งที่ต้องประเมินก่อนมอบหมายงาน / ก่อนจัดผัง `agents.json` (8 คำถาม)

1. งานนี้ต้องการผลลัพธ์อะไร และเกณฑ์สำเร็จคืออะไร?
2. งานมีความซับซ้อนและความเสี่ยงระดับใด?
3. AI ตัวใดมีความสามารถเหมาะสมที่สุด?
4. ควรใช้ Reasoning Effort ระดับใด?
5. ต้นทุน เวลา และโควตาที่คาดว่าจะใช้คุ้มค่าหรือไม่?
6. ต้องใช้ Tools, Context หรือการทำงานแบบ Agent มากเพียงใด?
7. ต้องตรวจสอบผลลัพธ์อย่างไร?
8. หากทำไม่สำเร็จ ควร Retry เพิ่ม Effort หรือเปลี่ยนโมเดลเมื่อใด?

### 1.4 รูปแบบอ้างอิงเมื่อประเมินงาน (8 ช่อง — ใช้ตอนทบทวน `agents.json` หรือเมื่อผู้ใช้ขอประเมิน)

`Recommended Platform` · `Recommended Model` · `Recommended Effort` · `Reason` · `Alternative` · `Trade-offs` · `Escalation Rule` · `Verification`

---

## 2. ข้อจำกัดและกฎปฏิบัติเฉพาะของ BAAN (6 ข้อบังคับ)

BAAN แปลงเกณฑ์กลาง 11 ข้อในส่วนที่ 1 ให้ทำงานแบบ deterministic ผ่าน [agents.json](agents.json) + `src/routing.mjs` (**0 Token Overhead ตอนรันงานจริง**) ภายใต้กรอบแพ็กเกจ ~\$20/เดือน:

1. **ขอบเขตแพ็กเกจและสิทธิ์โมเดลของแต่ละค่าย (แยกโควตา 5 ชม./รายสัปดาห์ออกจากราคา API)**:
   - **OpenAI (`codex`)**: เฉพาะโมเดลใน **ChatGPT Plus (\$20/เดือน)** (`gpt-6.2-astra`, `gpt-6.2-sol`, `gpt-6.1-terra`) — โควตา 5 ชม. + รายสัปดาห์ (`astra` ~5–45 msg/5ชม. vs `sol` ~15–160 msg/5ชม.)
   - **Google (`agy`)**: ใช้สิทธิ์โมเดลที่เปิดใช้งานได้จริงใน Antigravity (`agy models`) — **`gemini-pro-orchestrator` / `gemini-pro-orchestrator-neon`** (Native Orchestrator สำหรับ `planner`, `spec.t1`, `pm.t1`, `testplan.t1`; ไม่ส่ง `--effort`), **`gemini-4-carbon`** (`high` สำหรับ `t1` งานสถาปัตยกรรมซับซ้อน/ความปลอดภัย/DB Migration/Critical Audit), **`gemini-4-neon`** (`high`/`medium`/`low` งานมาตรฐานและ UI/UX), และ **`gemini-4-hydrogen`** (`low` สำหรับงานเร็ว/Contracted/Docs `t2`–`t3` / subagent สำรวจ) — *(ปลด `gemini-3.8-flash` และ `gemini-4-argon` ออกตามรอบสิ้นเดือน 2026-11)*
   - **Anthropic (`claude`)**: เฉพาะโมเดลใน **Claude Pro (\$20/เดือน)** (`opus`, `sonnet`, `haiku`) — โควตา 5 ชม. + รายสัปดาห์คิดตาม Compute (`sonnet` ~10–45 msg/5ชม. เป็นฐานประจำวัน; สงวน `opus` ไว้เฉพาะงานยาก/ตรวจรับเพื่อไม่ให้ล็อกโควตา); ห้ามใส่รุ่นที่หัก credits แยกหรือจำกัด Max/Ultra (เช่น `fable`)
2. **หลัก Pareto Efficiency 4 มิติ (Quality · Compute Cost/Task · Speed/Latency · Quota)**:
   - `Cost per Task` บน Artificial Analysis คือ `Tokens Used × Compute Weight per Token` ซึ่งสะท้อนภาระโควตาและเวลาจริงได้ตรงกว่าราคาต่อ 1M Token เปล่าๆ
   - **ตัดตัวที่ถูกครอบงำ (Strictly Dominated)** ทิ้งทั้งหมด (`gemini-4-hydrogen` ระดับ `medium`–`xhigh`, `gpt-6.1-terra` ระดับ `medium`–`max`, `gpt-6-luna` ทุกระดับ, `sonnet` ระดับ `xhigh`–`max`)
   - **ตัด Effort ที่ผลตอบแทนตกหน้าผา** (ได้คะแนนเพิ่ม < ~10% แต่จ่าย Compute เพิ่ม +55%–75% หรือช้าลงหนัก): ห้ามใช้ `max` ทุกตัว, **ห้ามใช้ `gemini-4-neon / xhigh`** (+2.3% แลก +72% และรอ ~21.5 นาที → เพดาน `neon` อยู่ที่ `high`), และ **ห้ามใช้ `gpt-6.2-sol / xhigh`** (+5.7% จาก `medium` แลก +59% → งานปกติใช้ `medium` / งานย่อยใช้ `low`)
   - **ข้อยกเว้น `t1` Overdrive (`_timeoutSec: 3600`)**: อนุญาต `xhigh` เฉพาะ `gpt-6.2-astra` และ `claude opus` ใน `t1` ของสายวิศวกรรม/ฐานข้อมูล/ตรวจรับ (`planner`, `arch`, `dba`, `worker`, `build`, `verifier`, `check`) เท่านั้น ส่วน `agy` ใช้ `gemini-pro-orchestrator` (สำหรับ planning/orchestration) หรือ `gemini-4-carbon / high` (สำหรับ deep code/arch/audit)
3. **Role-Owned Tiers & Provider-Native Harness (แต่ละบทบาทมีบันได Tier ของตัวเอง)**:
   - แต่ละบทบาททั้ง 14 Roles ประกาศ `tiers` ตามความยาก ความเร็วที่ต้องการ และความเสี่ยงจริงของสายงาน (`t1` สูงสุด → `t3`/`t4` ต่ำสุด)
   - ฝั่ง **`agy` ทำงานแบบ Antigravity-Native** (Orchestrator + 9 Common Skills + built-in/dynamic subagents) จึงเลือกโมเดลตามลักษณะงานจริง: `Orchestrator` วางแผน/แตกงาน · `Carbon` งานคิดลึก/audit วิกฤต · `Neon` งานมาตรฐาน/UI · `Hydrogen` งานเร็วและเอกสาร
   - งาน `kind: "docs"` แยกเข้าบทบาท **`docs`** (`t1` Critical ADR/Contracts · `t2` Standard Docs · `t3` Light/Index/Subagent Explore)
4. **Availability-Driven Specialist Routing (อิงความพร้อมใช้งานจาก `local.json` โดยตรง)**:
   - แต่ละ role (และแต่ละ tier เมื่อต่างกัน เช่น `docs.t1` vs `docs.t2`) ประกาศลำดับค่าย `preference` แล้วเลือกค่ายอันดับ 1 ที่เปิดใน `local.json` อัตโนมัติ
   - `verifier` มี `mustDifferFromWorker: true` เพื่อแยกค่ายจาก `worker` อัตโนมัติเมื่อเปิด ≥2 ค่าย (เปิด 1 ค่ายใช้ fresh independent session) และ `--agent` จะบังคับเฉพาะ Worker/Planner (ไม่ทับ Verifier เว้นแต่ระบุ `--verifier-agent`)
   - **Contract-Gated High-Risk Worker & Rework Guard**: งาน `risk: "high"` ที่มี `contracts` หรือ pinned `read_first` เริ่ม `worker` ที่ `t3` (`gpt-6.2-sol / medium`) ได้ เพื่อถนอมโควตา `astra`; งานที่ไม่มี contract ชัดยังคงขั้นต่ำ `t2` และ `t2` จะยังไม่ขึ้น `t1` (`xhigh`) จนกว่า `rework >= 2`
   - **Interactive-First & Headless Guardrails**: โหมดเริ่มต้นเป็น `interactive` (เปิด CLI แยก 4 หน้าต่าง 2×2 Grid) ส่วนโหมด `--headless` บังคับเพดาน `budget.max_commands` (default 60/40) และรีเซ็ต session ใหม่เมื่อ `cacheReadTokens >= 1.5M` หรือเข้าสู่ rework รอบใหม่
5. **Strict No-Impersonation (ไม่สวมรอยเมื่อติดลิมิต)**:
   - หากเกิด rate limit / quota / capacity error ระหว่างรัน ระบบจะหยุดทันทีด้วย `waiting_human` (`PROVIDER_LIMIT`) ไม่แอบสลับค่ายหรือลดรุ่นแทน
   - หากผู้ใช้ระบุ `--agent <x>` ที่ปิดใน `local.json` จะ error ทันที
6. **Zero Drift**:
   - แก้ `framework/agents.json` หรือ `src/routing.mjs` เมื่อไร ต้องอัปเดตเอกสารนี้ + `tests/agents-config.test.mjs` + `tests/routing.test.mjs` + `tests/init.test.mjs` ในรอบเดียวกันทุกครั้ง

---

## 3. ตารางเปรียบเทียบโมเดลครบ 4 มิติ (ตรวจวันที่ 2026-11-19 · AA Intelligence Index v5.0.1)

แหล่งอ้างอิง: [Artificial Analysis Models Leaderboard](https://artificialanalysis.ai/leaderboards/models) (v5.0.1), [OpenAI Models / Codex Docs](https://learn.chatgpt.com/docs/models), [Google Antigravity CLI](https://antigravity.google/docs/cli/reference), [Claude Code Model Config](https://code.claude.com/docs/en/model-config)

### 3.1 ภาพรวมทุกโมเดลใน 3 แพ็กเกจ \$20/เดือน (คุณภาพ · ต้นทุน/Task · ความเร็ว/เวลา · โควตา)

| ค่าย | รุ่น / Effort | AA v5.0.1 | Cost/Task | ความเร็วพ่น / เวลาโดยประมาณ | สถานะใน BAAN |
|---|---|---:|---:|---|---|
| `agy` | `gemini-4-hydrogen` / `low` | 27 | \$0.29 | ~185 tok/s · TTFT ~5.6s · ~1.3 นาที | ใช้ (`t4` / `t3` งานย่อย / `docs.t2`–`t3`) — ระดับเดียวของ `hydrogen` ที่คุ้ม |
| `agy` | `gemini-4-hydrogen` / `medium`–`xhigh` | 41–54 | \$0.80–3.16 | ~185 tok/s แต่คิดยาว (~3.7–13.7 นาที) | **ตัดออก** — แพ้ `neon low/medium` ทั้งคะแนน ราคา และเวลา |
| `agy` | `gemini-4-neon` / `low` | 44 | \$0.75 | ~105 tok/s · ~3.7 นาที | ใช้ (`t4` / `t3` งานย่อย UI/Arch) |
| `agy` | `gemini-4-neon` / `medium` | 55 | \$1.90 | ~105 tok/s · ~8.3 นาที | ใช้ (**Sweet Spot** งานมาตรฐาน & UI) |
| `agy` | `gemini-4-neon` / `high` | 60 | \$3.74 | ~101 tok/s · TTFT ~40.6s · ~14.8 นาที | ใช้ (`t2` งานยาก / Design System) |
| `agy` | `gemini-4-neon` / `xhigh` | 61.4 | \$6.44 | ~110 tok/s · TTFT ~56.5s · ~21.5 นาที | **ตัดออก** (+2.3% แลก +72% และช้า ~21.5 นาที) |
| `agy` | `gemini-4-carbon` / `high` | 60+ | \$4.90–7.76 | Deep Reasoning | ใช้ (เฉพาะ `t1` Critical Arch / Security / DB / Audit) |
| `agy` | `gemini-pro-orchestrator` / `orchestrator-neon` | Native | — | Multi-step Orchestration | ใช้ (`planner.t1–t3`, `spec.t1`, `pm.t1`, `testplan.t1` — ไม่ส่ง `--effort`) |
| `codex` | `gpt-6-luna` / ทุกระดับ | 10–28 | \$0.07–0.15 | เร็วมาก | **ตัดออก** — โดน `terra low` ทับ |
| `codex` | `gpt-6.1-terra` / `low` | 29 | \$0.07 | เร็ว · TTFT ~2.3s *(non-reasoning)* · ~1.2 นาที | ใช้ (`docs.t3` / subagent) |
| `codex` | `gpt-6.1-terra` / `medium`–`max` | 38–51 | \$0.25–0.96 | เร็ว–กลาง | **ตัดออก** — โดน `sol low/medium` ทับ |
| `codex` | `gpt-6.2-sol` / `low` | 40.6 | \$0.18 | ~101–112 tok/s · เร็วมาก (15–160 msg/5ชม.) | ใช้ (`t4` / `t3` งานย่อย / `docs.t2`) |
| `codex` | `gpt-6.2-sol` / `medium` | 52.7 | \$0.41 | ~101–112 tok/s · เร็ว–กลาง (15–160 msg/5ชม.) | ใช้ (**Sweet Spot** งานปกติ) |
| `codex` | `gpt-6.2-sol` / `xhigh`–`max` | 55.7–57.3 | \$0.65–1.01 | คิดยาวขึ้น | **ตัดออก** (`xhigh` +5.7% แลก +59% · `max` ตกหน้าผา) |
| `codex` | `gpt-6.2-astra` / `high` | 60.1 | \$2.07 | **~50 tok/s** *(ช้ากว่า sol 2×)* · 5–45 msg/5ชม. | ใช้ (`t2` งานยาก/เสี่ยงสูงเท่านั้น) |
| `codex` | `gpt-6.2-astra` / `xhigh` | 61.6 | \$2.52 | ~50 tok/s · ช้า (~12+ นาที) | ใช้ (เฉพาะ `t1` Overdrive) |
| `codex` | `gpt-6.2-astra` / `max` | 62.1 | \$4.00 | ~50 tok/s · TTFT ~198s · ~13.7 นาที | **ตัดออก** (+0.8% แลก +59%) |
| `claude` | `haiku` (5.5) / `low` | 19 | \$0.04 | เร็วสุดในค่าย · เบากว่า Sonnet 12–16× | ใช้ (`docs.t3`) |
| `claude` | `haiku` (5.5) / `high` | 30 | \$0.16 | เร็วมาก | ใช้ (`docs.t2`) |
| `claude` | `haiku` (5.5) / `max` | 36 | \$0.41 | — | **ตัดออก** (+2.9% แลก +64%) |
| `claude` | `sonnet` (5.5) / `high` | 42 *(TB 70.6%)* | \$1.64 | **~122 tok/s** · TTFT ~0.88s · 10–45 msg/5ชม. | ใช้ (**Sweet Spot งานประจำวัน/คุยสด** ถนอมโควตา Pro) |
| `claude` | `sonnet` (5.5) / `xhigh`–`max` | 50–55 | \$4.09–10.02 | คิดยาวมาก | **ตัดออก** — แพ้ `opus high/xhigh` ทั้งคะแนนและราคา |
| `claude` | `opus` (5.5) / `medium` | 48 | \$2.45 | ~106–118 tok/s · TTFT สูงกว่า Sonnet · กินโควตาสูง | ใช้เฉพาะ `verifier.t3`, `check.t3`, `docs.t1` |
| `claude` | `opus` (5.5) / `high` | 52 | \$3.46 | ~106–118 tok/s · TTFT นานขึ้น | ใช้ (`t2` งานยาก/Senior QA และ `t1` สาย BA/PM/UX) |
| `claude` | `opus` (5.5) / `xhigh` | 57 | \$6.05 | ~106–118 tok/s · กินโควตา 5 ชม. หนัก | ใช้ (เฉพาะ `t1` Overdrive/Critical Audit) |
| `claude` | `opus` (5.5) / `max` | 58–59 | \$10.04 | TTFT ~345s+ · ช้ากว่า ~6× | **ตัดออก** (+2–3% แลก +66%) |

---

## 4. ตาราง Role-Owned Tiers ปัจจุบันใน `agents.json` (14 Roles)

### 4.1 สถาปัตยกรรมและวางแผน (`planner` [default `t3`], `arch` [default `t2`]) — `pref: agy → codex → claude`

| Tier | ลักษณะงาน | `agy` (`Orchestrator` / `Carbon` / `Neon`) | `codex` | `claude` |
|---|---|---|---|---|
| **`t1`** | สถาปัตยกรรมข้ามระบบ / Core Foundation / Overdrive (`3600s`) | `planner`: `gemini-pro-orchestrator` · `arch`: `gemini-4-carbon` / `high` | `gpt-6.2-astra` / `xhigh` (**61.6**, \$2.52) | `opus` / `xhigh` (**57**, \$6.05) |
| **`t2`** | ออกแบบโมดูลใหญ่ / ADR / Multi-Repo Plan | `planner`: `gemini-pro-orchestrator-neon` · `arch`: `gemini-4-neon` / `high` | `gpt-6.2-astra` / `high` (**60.1**, \$2.07) | `opus` / `high` (**52**, \$3.46) |
| **`t3`** | วางแผนฟีเจอร์มาตรฐาน / API & DB Contract โมดูลเดียว | `planner`: `gemini-pro-orchestrator-neon` · `arch`: `gemini-4-neon` / `medium` | `gpt-6.2-sol` / `medium` (**52.7**, \$0.41) | `sonnet` / `high` (**42** · TB 70.6%, \$1.64) |
| **`t4`** | ปรับโครงสร้างเล็ก / แตกงานย่อยในโมดูลเดิม | `gemini-4-neon` / `low` (**44**, \$0.75) | `gpt-6.2-sol` / `low` (**40.6**, \$0.18) | `sonnet` / `high` (**42** · TB 70.6%, \$1.64) |

### 4.2 พัฒนาโค้ดและแก้บั๊ก (`worker` [default `t3`], `build` [default `t3`]) — `pref: codex → agy → claude`

| Tier | ลักษณะงาน (เทียบทีม Dev จริง) | `codex` | `agy` | `claude` |
|---|---|---|---|---|
| **`t1`** | Principal Dev: งานโคตรยาก / Concurrency / Security / Escalation (`3600s`) | `gpt-6.2-astra` / `xhigh` (**61.6**, \$2.52) | `gemini-4-carbon` / `high` | `opus` / `xhigh` (**57**, \$6.05) |
| **`t2`** | Senior Dev: งานยาก / High-Risk Code (ไม่มี Contract ชัด) / Complex Bugfix *(ขั้นต่ำ `risk: high` แบบไม่มี contract)* | `gpt-6.2-astra` / `high` (**60.1**, \$2.07) | `gemini-4-neon` / `high` (**60**, \$3.74) | `opus` / `high` (**52**, \$3.46) |
| **`t3`** | Standard Dev: งานปกติ / Multi-File Feature / Bugfix มาตรฐาน *(Default)* | `gpt-6.2-sol` / `medium` (**52.7**, \$0.41) | `gemini-4-neon` / `medium` (**55**, \$1.90) | `sonnet` / `high` (**42** · TB 70.6%, \$1.64) |
| **`t4`** | Contracted Dev: งานมีสเปก+Contract ชัด / Unit Tests / Refactor เล็ก | `gpt-6.2-sol` / `low` (**40.6**, \$0.18) | `gemini-4-hydrogen` / `low` (**27**, \$0.29) | `sonnet` / `high` (**42** · TB 70.6%, \$1.64) |

### 4.3 ตรวจรับอิสระและท้าทายระบบ (`verifier` [default `t2`], `check` [default `t2`]) — `pref: claude → agy → codex`

| Tier | ลักษณะงาน | `claude` | `agy` | `codex` |
|---|---|---|---|---|
| **`t1`** | Critical Audit: Security / Auth / PII / DB Migration / Money / Release (`3600s`) | `opus` / `xhigh` (**57**) | `gemini-4-carbon` / `high` | `gpt-6.2-astra` / `xhigh` (**61.6**) |
| **`t2`** | Senior QA: ตรวจรับอิสระมาตรฐาน / High-Risk / Bugfix *(Default)* | `opus` / `high` (**52**) | `gemini-4-neon` / `high` (**60**) | `gpt-6.2-astra` / `high` (**60.1**) |
| **`t3`** | Focused QA: งาน Low-Risk / Contracted Feature / Test-Mapping | `opus` / `medium` (**48**) | `gemini-4-neon` / `medium` (**55**) | `gpt-6.2-sol` / `medium` (**52.7**) |

### 4.4 วิเคราะห์ธุรกิจ, บริหารขอบเขต และวางแผนทดสอบ (`spec`, `pm`, `testplan` [default `t2`]) — `pref: claude → agy → codex`

| Tier | ลักษณะงาน | `claude` | `agy` | `codex` |
|---|---|---|---|---|
| **`t1`** | Lead BA/PM/TestPlan: โดเมนซับซ้อน / กฎธุรกิจข้ามโมดูล / E2E ข้ามระบบ | `opus` / `high` (**52**) | `gemini-pro-orchestrator` | `gpt-6.2-astra` / `high` (**60.1**) |
| **`t2`** | Standard BA/PM/TestPlan: Requirement/AC, แตก Wave และ Test Plan ประจำโมดูล *(Default)* | `sonnet` / `high` (**42**) | `gemini-4-neon` / `medium` (**55**) | `gpt-6.2-sol` / `medium` (**52.7**) |
| **`t3`** | Quick Refinement: ปรับแก้ AC / เคลียร์ OQ ย่อย / Delta Test Plan | `sonnet` / `high` (**42**) | `gemini-4-hydrogen` / `low` (**27**) | `gpt-6.2-sol` / `low` (**40.6**) |

### 4.4.1 สถาปนิกฐานข้อมูล (`dba` [default `t2`]) — `pref: codex → agy → claude`

| Tier | ลักษณะงาน | `codex` | `agy` | `claude` |
|---|---|---|---|---|
| **`t1`** | Critical DB Migration / High-Concurrency Schema / Overdrive (`3600s`) | `gpt-6.2-astra` / `xhigh` (**61.6**, \$2.52) | `gemini-4-carbon` / `high` | `opus` / `xhigh` (**57**, \$6.05) |
| **`t2`** | Standard DBA: ตรวจ DBML / Index / SQL Migration มาตรฐาน *(Default)* | `gpt-6.2-astra` / `high` (**60.1**, \$2.07) | `gemini-4-neon` / `high` (**60**, \$3.74) | `opus` / `high` (**52**, \$3.46) |
| **`t3`** | Light Schema Check / Query Review ย่อย | `gpt-6.2-sol` / `medium` (**52.7**, \$0.41) | `gemini-4-neon` / `medium` (**55**, \$1.90) | `sonnet` / `high` (**42**, \$1.64) |

### 4.5 ทีมออกแบบหน้าจอ UX/UI (`survey`, `ui`, `review` [default `t2`]) — `pref: agy → claude → codex`

| Tier | ลักษณะงาน | `agy` (`Carbon` / `Neon`) | `claude` | `codex` |
|---|---|---|---|---|
| **`t1`** | Lead UX/UI: วาง Design System / Multi-Step Flow / Full Visual & WCAG Audit | `gemini-4-carbon` / `high` | `opus` / `high` (**52**) | `gpt-6.2-astra` / `high` (**60.1**) |
| **`t2`** | Standard UX/UI: ออกแบบหน้าจอ / Feasibility / Handoff *(Default)* | `gemini-4-neon` / `medium` (**55**) | `sonnet` / `high` (**42**) | `gpt-6.2-sol` / `medium` (**52.7**) |
| **`t3`** | UI Polish: ปรับ Component ย่อย / Copy / State / Quick WCAG Check | `gemini-4-neon` / `low` (**44**) | `sonnet` / `high` (**42**) | `gpt-6.2-sol` / `low` (**40.6**) |

### 4.6 เอกสารและ Knowledge (`docs` [default `t2`]) — `pref` แยกตาม Tier

| Tier | ลักษณะงาน | `preference` | `codex` | `claude` | `agy` |
|---|---|---|---|---|---|
| **`t1`** | Critical Docs: ADR / API & DB Contracts / Security Spec | `claude → agy → codex` | `gpt-6.2-sol` / `medium` (**52.7**, \$0.41) | `opus` / `medium` (**48**, \$2.45) | `gemini-4-neon` / `medium` (**55**, \$1.90) |
| **`t2`** | Standard Docs: REQ/OQ/Handoff/Defect ตามแผนที่อนุมัติ *(Default)* | `codex → claude → agy` | `gpt-6.2-sol` / `low` (**40.6**, \$0.18) | `haiku` / `high` (**30**, \$0.16) | `gemini-4-hydrogen` / `low` (**27**, \$0.29) |
| **`t3`** | Light / Micro Docs: INDEX / Changelog / สรุป / Subagent สำรวจ | `codex → claude → agy` | `gpt-6.1-terra` / `low` (**29**, \$0.07) | `haiku` / `low` (**19**, \$0.04) | `gemini-4-hydrogen` / `low` (**27**, \$0.29) |

### รายการรุ่น/effort ที่ตั้งใจตัดออก (ณ 2026-11-19)

| ค่าย | รุ่น / effort ที่ตัดออก | คะแนน / ต้นทุน | เหตุผล (อิงเกณฑ์ 11 ข้อ) |
|---|---|---|---|
| `codex` | `gpt-6.2-astra` / `max` | 62.1 / \$4.00 | ได้ +0.8% จาก `xhigh` (61.6) แต่แพงขึ้น +59% และ TTFT ~198s |
| `codex` | `gpt-6.2-sol` / `xhigh`–`max` | 55.7–57.3 / \$0.65–1.01 | `xhigh` ได้แค่ +5.7% จาก `medium` (52.7 @ \$0.41) แต่จ่ายเพิ่ม +59% · `max` ตกหน้าผา +55% |
| `codex` | `gpt-6.1-terra` / `medium`–`max` | 38–51 / \$0.25–0.96 | ถูกครอบงำโดย `gpt-6.2-sol` (`low` 40.6 @ \$0.18, `medium` 52.7 @ \$0.41) |
| `codex` | `gpt-6-luna` / ทุกระดับ | 10–28 / \$0.07–0.15 | ถูกครอบงำโดย `gpt-6.1-terra low` (29 @ \$0.07) |
| `agy` | `gemini-4-neon` / `xhigh` (ทุกบทบาท) | 61.4 / \$6.44 | ได้แค่ +2.3% จาก `high` (60 @ \$3.74) แต่แพงขึ้น +72% และช้าลงเป็น ~21.5 นาที (ใช้ `gemini-4-carbon` หรือ `gemini-pro-orchestrator` สำหรับ `t1` แทน) |
| `agy` | `gemini-4-hydrogen` / `medium`–`xhigh` | 41–54 / \$0.80–3.16 | พ่น thinking tokens ยาวกว่า 2–3.3× ทำให้กินโควตาเท่า/แพงกว่า `neon` และจบงานช้าพอๆ กันหรือช้ากว่า ขณะคะแนนต่ำกว่า |
| `agy` | `gemini-3.8-flash` / `gemini-4-argon` | — | ถูกปลด/เอาออกจากแพลตฟอร์มสิ้นเดือน 2026-11 (`docs.t3` ย้ายไป `gemini-4-hydrogen / low`, เอา `ARGON WEEKLY` ออกจาก Monitor UI) |
| `claude` | `fable` (5.2) ทุกระดับ | 54–65 / \$3.10–26.54 | ไม่รวมในแพ็กเกจ Claude Pro \$20 (ต้องใช้ usage credits หรือ Max/Ultra) |
| `claude` | `opus` (5.5) / `max` | 58–59 / \$10.04 | ได้ +2–3% จาก `xhigh` (57) แต่แพงขึ้น +66% และ TTFT ~345s+ (~6× ช้ากว่า) |
| `claude` | `sonnet` (5.5) / `xhigh`–`max` | 50–55 / \$4.09–10.02 | ถูกครอบงำโดย `opus high` (52 @ \$3.46) และ `opus xhigh` (57 @ \$6.05) |
| `claude` | `haiku` (5.5) / `max` | 36 / \$0.41 | ได้ +2.9% จาก `xhigh` (35 @ \$0.25) แต่แพงขึ้น +64% |

---

## 5. Prompt มาตรฐานสำหรับอัปเดต `agents.json` รอบถัดไป

```markdown
/plan ช่วยตรวจสอบโมเดลรุ่นล่าสุดของทั้ง 3 ค่าย (OpenAI/codex, Google/agy, Anthropic/claude) และประเมินอัปเดต Role-Owned Tiers ใน `framework/agents.json` ตามเกณฑ์กลาง 11 ข้อและกฎปฏิบัติใน `framework/MODEL-POLICY.md`:

1. **สิทธิ์แพ็กเกจ ~\$20/เดือน + โควตา 5 ชม./รายสัปดาห์**: ยืนยันทุกโมเดลว่าอยู่ใน ChatGPT Plus / Google AI Pro / Claude Pro และแยกต้นทุน API ออกจากโควตาแพ็กเกจจริง (ระวังรุ่นที่ล็อกโควตา 5 ชม. เร็วในงานประจำวัน)
2. **ประเมินครบ 4 มิติ (Quality · Compute Cost/Task · Speed/Latency · Quota)**: ดึงข้อมูลล่าสุดจาก Artificial Analysis Intelligence Index (เวอร์ชันเดียวกันทุกค่าย + ระบุวันที่), Output Speed (tok/s), TTFT และ Time per Task — ตัดตัวที่ถูกครอบงำและ effort ที่ได้คะแนน < ~10% แต่จ่าย Compute/เวลาพุ่ง +50% ขึ้นไป
3. **Role-Owned Tiers & Specialist Affinity**: ตรวจครบทั้ง 14 Roles (`planner`, `worker`, `verifier`, `docs`, `arch`, `dba`, `spec`, `pm`, `build`, `testplan`, `check`, `survey`, `ui`, `review`) โดยชั่งน้ำหนัก Reliability/Retries, Context & Tool Efficiency, Cost per Successful Task และ Risk/Verification
4. **ตรวจชื่อ `--model` และ `--effort` ที่ CLI รองรับจริง** และยืนยัน Strict No-Impersonation
5. **Zero Drift**: อัปเดต `framework/agents.json`, ตารางใน `framework/MODEL-POLICY.md`, `framework/LEARNING.md` (ถ้าอ้างถึงรุ่น/effort), `framework/tests/agents-config.test.mjs`, `framework/tests/routing.test.mjs`, `framework/tests/init.test.mjs` พร้อมรัน `cd framework && npm test` ให้เขียวครบ และซิงค์ stubs ด้วย `node framework/bin/baan.mjs sync --all --stubs-only --no-self-update`
```

---

## 6. Change Log

- **2026-11-26 (Claude Code Native Harness — helper agents)**: เพิ่ม helper subagents ฝั่ง `claude` ใน `.claude/agents/` โดย**ไม่แก้ `agents.json`**: `scout` อ้าง `docs.t3` (`haiku / low`) สำหรับสำรวจ read-only, `scribe` อ้าง `docs.t2` (`haiku / high`) สำหรับเขียน knowledge และ `auditor` อ้าง `verifier.t3` (`opus / medium`) สำหรับตรวจอิสระ — เหตุผล: built-in `Explore` ของ Claude Code รันบนโมเดลที่ `opus` ชี้เมื่อใช้แพ็ก subscription จึงกินโควตา Pro \$20 โดยไม่จำเป็น ส่วน `codex` และ `agy` ไม่เปลี่ยน

- **2026-11-26 (Remove `flash` & `argon` from `agy`)**: ถอด `gemini-3.8-flash` และ `gemini-4-argon` ออกจาก `agents.json`, `prompts/agy/models.json`, `prompt-compiler.mjs`, `monitor-ui/telemetry.js` (`ARGON WEEKLY`), roles และ skills ทั้งหมดก่อนปลดรุ่นสิ้นเดือน โดยย้าย `docs.t3` และงานสำรวจ/เอกสารเบาของ `agy` ไปใช้ `gemini-4-hydrogen / low` แทน

- **2026-11-26 (Antigravity-Native Harness + Entitled Model Lineup)**: ปรับเฉพาะฝั่ง `agy` ให้ใช้สิทธิ์โมเดลจริงบน Antigravity (`gemini-pro-orchestrator` / `gemini-pro-orchestrator-neon`, `gemini-4-carbon`, `gemini-4-neon`, `gemini-4-hydrogen`, `gemini-3.8-flash`) ควบคู่ Native Orchestrator + 9 Common Skills ใน `.agents/skills/` โดยคงผัง \$20/เดือนและ Pareto ของ `claude` และ `codex` ไว้เหมือนเดิมทั้งหมด

- **2026-11-20 (Add `dba` & `testplan` Roles for `baan flow`)**: เพิ่มบทบาท **`dba`** (`codex → agy → claude`, default `t2`) และ **`testplan`** (`claude → agy → codex`, default `t2`) เป็น 14 Roles ภายใต้กรอบแพ็ก \$20/เดือนและหลัก Pareto เหมือนเดิมทุกประการ

- **2026-11-19 (11-Criteria + 4D Speed/Quota Lean Tuning)**: ผนวกเกณฑ์กลาง 11 ข้อ + ตารางเทียบ 4 มิติทุกโมเดลลงใน `MODEL-POLICY.md` และปรับจูน `agents.json` ให้คุ้มค่าบนแพ็ก \$20/เดือน — ลดเพดาน `agy` จาก `gemini-4-neon / xhigh` → `high` (ทุก `t1`), ลด `codex` งานปกติ `gpt-6.2-sol / xhigh` → `medium` และงานย่อย → `low`, และปรับ `claude` งานปกติ/คุยสดจาก `opus / medium` → `sonnet / high` เพื่อถนอมโควตา 5 ชม. และเพิ่มความเร็วตอบสนอง
- **2026-11-19 (Role-Owned Tiers & 3-Provider Native Redesign)**: ยกเครื่อง `agents.json` จาก global `t0..t5` เป็น **Role-Owned Tiers ครบ 12 Roles** (`planner`, `worker`, `verifier`, `docs`, `arch`, `spec`, `pm`, `build`, `check`, `survey`, `ui`, `review`) พร้อม Availability-Driven Specialist Routing อิง `local.json`, Strict No-Impersonation (`PROVIDER_LIMIT` → `waiting_human`), และ 3-Provider Native Execution Prompts / Workspace Agents
- **2026-11-19**: ย้ายนโยบายและ prompt มาเก็บแบบ tracked ที่ `framework/MODEL-POLICY.md` · ปรับผังทั้งหมดเป็นแพ็กเกจ \$20/เดือนบนสเกล AA Intelligence Index v5.0.1
- **2026-11-15**: ปรับ `agy t1`–`t4` เป็น `gemini-4-hydrogen` (`xhigh`→`low`) ในรุ่น `0.37.0`
- **2026-11-08**: ปรับสมดุล Coding Intelligence Index ในรุ่น `0.32.0`
