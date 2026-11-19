# MODEL-POLICY — นโยบายคัดเลือกโมเดลและ Prompt อัปเดต `agents.json`

แหล่งความจริงเดียว (Single Source of Truth) สำหรับการจัดผังโมเดลใน [agents.json](agents.json) ของทั้ง 3 ค่าย (`codex`, `agy`, `claude`)
ทุกครั้งที่แก้ไข `agents.json`, provider adapters, หรือเมื่อค่าย AI ปล่อยโมเดลรุ่นใหม่ ต้องอ่านและอัปเดตเอกสารนี้ควบคู่กับ [tests/agents-config.test.mjs](tests/agents-config.test.mjs) เสมอ

---

## 1. กฎคัดเลือกโมเดล (5 ข้อบังคับ)

1. **เฉพาะแพ็กเกจมาตรฐาน ~$20/เดือนเท่านั้น**:
   - **OpenAI (`codex`)**: เฉพาะโมเดลที่รวมใน **ChatGPT Plus ($20/เดือน)** (ไม่ใช้โหมดจ่ายเพิ่ม เช่น Ultrafast ของ Pro)
   - **Google (`agy`)**: เฉพาะโมเดลที่รวมใน **Google AI Pro ($19.99/เดือน)** — ห้ามใส่โมเดลระดับ Ultra (เช่น `gemini-4-carbon`)
   - **Anthropic (`claude`)**: เฉพาะโมเดลที่รวมใน **Claude Pro ($20/เดือน)** (`opus`, `sonnet`, `haiku`) — ห้ามใส่โมเดลที่ต้องหัก usage credits แยกหรือจำกัดเฉพาะ Max/Ultra (เช่น `fable`)
2. **หลัก Pareto Efficiency (Intelligence Index vs Cost per Task)**:
   - **ตัดตัวที่ถูกครอบงำ (Strictly Dominated)** ทิ้งทันที: หากมีรุ่น/effort ที่ทั้งฉลาดกว่า (หรือเท่ากัน) และต้นทุนต่อ task ถูกกว่า ห้ามใช้ตัวที่ด้อยกว่า
   - **ตัดจุดที่ผลตอบแทนลดลงแรง (Diminishing Returns Cliff)**: ห้ามเพิ่ม effort เพียงเพื่อคะแนนเพิ่ม +0.5–1 คะแนนแต่ต้นทุนพุ่ง +50% ขึ้นไป (ตัวอย่าง: ความฉลาด 50 ต้นทุน 1 แต่ 51 ต้นทุน 1.5 → ไม่คุ้ม)
   - **ข้อยกเว้น `t0` Overdrive**: อนุญาตให้ใช้ `xhigh` เฉพาะใน `t0` (งานยากสุด/เฉพาะกิจ `_timeoutSec: 3600` ไม่ใช่ค่าเริ่มต้น) เท่านั้น เมื่อระดับนั้นให้ความสามารถด้านโค้ด/การแก้ปัญหาระดับหัวแถวจริง (และยังหลีกเลี่ยง `max` ที่แพงพุ่งเกินเหตุ)
3. **Coding Capability Guard สำหรับงานโค้ด (`t0`–`t3`)**:
   - งานโค้ด (`t0`–`t3`) ต้องตรวจสอบคะแนนสายโค้ดจริง (**Coding Agent Index** / **Terminal-Bench**) ควบคู่กับ Intelligence Index รวม ไม่ลดรุ่นลงไปใช้โมเดลเล็กที่คะแนนโค้ดตกฮวบจนเกิด Rework Penalty (เช่น คง `sonnet` ใน `t3` แทน `haiku`)
4. **ใช้สเกลเวอร์ชันเดียวกันทั้งตาราง + อ้างแหล่งจริง**:
   - ใช้คะแนน **Artificial Analysis Intelligence Index** เวอร์ชันเดียวกันทุกค่าย ระบุวันที่ตรวจสอบและลิงก์ หาก effort ใดไม่มีคะแนนให้ระบุ `N/A` ห้ามเดาหรือยืมคะแนน effort อื่น
   - ระบุให้ชัดเสมอว่า **Cost per Task** ของ Artificial Analysis เป็นฐานราคา API ต่อ benchmark task เพื่อเทียบความคุ้มค่าเชิงเปรียบเทียบ ไม่ใช่อัตราหักโควตาสมาชิกโดยตรง
5. **Zero Drift**:
   - แก้ `framework/agents.json` เมื่อไร ต้องอัปเดต **ตาราง Snapshot + Change Log** ในไฟล์นี้ และ **Guard Tests** ใน `framework/tests/agents-config.test.mjs` ในรอบเดียวกันทุกครั้ง

---

## 2. ตาราง Snapshot ปัจจุบัน (ตรวจวันที่ 2026-11-19 · AA Intelligence Index v5.0.1)

แหล่งอ้างอิง: [Artificial Analysis Models Leaderboard](https://artificialanalysis.ai/leaderboards/models) (v5.0.1), [OpenAI Models / Codex Docs](https://learn.chatgpt.com/docs/models), [Google Antigravity CLI](https://antigravity.google/docs/cli/reference), [Claude Code Model Config](https://code.claude.com/docs/en/model-config)

| Tier | ลักษณะงานใน BAAN | `codex` (ChatGPT Plus $20) | `agy` (Google AI Pro $19.99) | `claude` (Claude Pro $20) | `_fallback` |
|---|---|---|---|---|---|
| **`t0`** | ปัญหายากที่สุด / Escalation เฉพาะกิจ (`_timeoutSec: 3600`) | `gpt-6.2-astra` / `xhigh` → **61.6** ($2.52) | `gemini-4-neon` / `xhigh` → **61.4** · #1 Coding Agent 58.6 ($6.44) | `opus` (5.5) / `xhigh` → **57** ($6.05) | `["codex", "agy", "claude"]` |
| **`t1`** | สถาปัตยกรรม / ตัดสินใจสำคัญ / High-risk | `gpt-6.2-astra` / `high` → **60.1** ($2.07) | `gemini-4-neon` / `high` → **60** ($3.74) | `opus` (5.5) / `high` → **52** ($3.46) | `["codex", "agy", "claude"]` |
| **`t2`** | **ค่าเริ่มต้น (Default)** โค้ดหลายไฟล์ / Planner / Worker / Verifier | `gpt-6.2-sol` / `xhigh` → **55.7** ($0.65) | `gemini-4-neon` / `medium` → **55** ($1.90) | `opus` (5.5) / `medium` → **48** ($2.45) | `["codex", "agy", "claude"]` |
| **`t3`** | พัฒนาตามแบบมี `contracts` ชัด (`code` step-down) | `gpt-6.2-sol` / `medium` → **52.7** ($0.41) | `gemini-4-neon` / `low` → **44** ($0.75) | `sonnet` (5.5) / `high` → **42** · TB 70.6% ($1.64) | `["codex", "agy", "claude"]` |
| **`t4`** | เขียน Docs / Test ตามเคส / Subagents / Refactor เล็ก | `gpt-6.2-sol` / `low` → **40.6** ($0.18) | `gemini-4-hydrogen` / `low` → **27** ($0.29) | `haiku` (5.5) / `high` → **30** ($0.16) | `["codex", "claude", "agy"]` |
| **`t5`** | สรุป / จัดหมวด / Docs เบา / Micro-tasks | `gpt-6.1-terra` / `low` → **29** ($0.07) | `gemini-3.8-flash` / `low` → **22–23** ($0.24) | `haiku` (5.5) / `low` → **19** ($0.04) | `["codex", "claude", "agy"]` |

### รายการรุ่น/effort ที่ตั้งใจตัดออก (ณ 2026-11-19)

| ค่าย | รุ่น / effort ที่ตัดออก | คะแนน / ต้นทุน | เหตุผล |
|---|---|---|---|
| `codex` | `gpt-6.2-astra` / `max` | 62.1 / $4.00 | ได้ +0.5 คะแนนจาก `xhigh` (61.6) แต่แพงขึ้น +59% |
| `codex` | `gpt-6.2-sol` / `max` | 57.3 / $1.01 | ได้ +1.6 คะแนนจาก `xhigh` (55.7) แต่แพงขึ้น +55% |
| `codex` | `gpt-6.1-terra` / `medium`–`max` | 38–51 / $0.25–0.96 | ถูกครอบงำโดย `gpt-6.2-sol` (`low` 40.6 @ $0.18, `medium` 52.7 @ $0.41) |
| `codex` | `gpt-6-luna` / `high`–`max` | 21–28 / $0.07–0.15+ | ถูกครอบงำโดย `gpt-6.1-terra low` (29 @ $0.07) |
| `agy` | `gemini-4-carbon` | 60 / $4.90–7.76 | นอกแพ็กเกจ $20 และถูกครอบงำโดย `gemini-4-neon high` (60 @ $3.74) |
| `agy` | `gemini-4-neon` / `xhigh` ใน `t1`–`t5` | 61.4 / $6.44 | แพงกว่า `neon high` +72% เพื่อ +1.4 คะแนน — สงวนไว้เฉพาะ `t0` เท่านั้น |
| `agy` | `gemini-4-hydrogen` / `medium`–`xhigh` | 41–54 / $0.80–3.16 | ถูกครอบงำทั้งหมดโดย `gemini-4-neon` (`low` 44 @ $0.75, `medium` 55 @ $1.90) |
| `claude` | `fable` (5.2) ทุกระดับ | 54–65 / $3.10–26.54 | ไม่รวมในแพ็กเกจ Claude Pro $20 (ต้องใช้ usage credits หรือ Max/Ultra) |
| `claude` | `opus` (5.5) / `max` | 58–59 / $10.04 | ได้ +1–2 คะแนนจาก `xhigh` (57) แต่แพงขึ้น +66% และช้ากว่า ~6× |
| `claude` | `sonnet` (5.5) / `xhigh`–`max` | 50–55 / $4.09–10.02 | ถูกครอบงำโดย `opus high` (52 @ $3.46) และ `opus xhigh` (57 @ $6.05) |
| `claude` | `haiku` (5.5) / `max` | 36 / $0.41 | ได้ +1 คะแนนจาก `xhigh` (35 @ $0.25) แต่แพงขึ้น +64% |

---

## 3. Prompt มาตรฐานสำหรับอัปเดต `agents.json` รอบถัดไป

คัดลอกหรือสั่ง AI ด้วย prompt ด้านล่างเมื่อมีค่ายใดปล่อยโมเดลใหม่ หรือก่อนรอบ release สำคัญ:

```markdown
/plan ช่วยตรวจสอบโมเดลรุ่นล่าสุดของทั้ง 3 ค่าย (OpenAI/codex, Google/agy, Anthropic/claude) และประเมินอัปเดต `framework/agents.json` ตามกติกาใน `framework/MODEL-POLICY.md`:

1. **สิทธิ์แพ็กเกจ $20/เดือนเท่านั้น**: ตรวจยืนยันว่าทุกโมเดลที่เสนอรวมอยู่ในแพ็กเกจมาตรฐาน ~$20/เดือน (ChatGPT Plus / Google AI Pro / Claude Pro) — ห้ามเสนอโมเดลระดับ Ultra/Max-only หรือที่ต้องหัก usage credits แยก
2. **Pareto Intelligence Index vs Cost per Task**: ค้นข้อมูลล่าสุดจาก Artificial Analysis Intelligence Index (ใช้เวอร์ชันเดียวกันทุกค่ายและระบุวันที่) พร้อม Cost per Task (USD) ของแต่ละ model × effort
   - ตัดตัวที่ถูกครอบงำ (dominated) ทิ้งทั้งหมด
   - ตัด effort ที่ผลตอบแทนลดลงแรง (เช่น คะแนนเพิ่มแค่ +0.5–1 แต่ต้นทุนเพิ่ม +50% ขึ้นไป) เว้น `t0` overdrive ที่มีหลักฐานด้านโค้ดชัดเจน
3. **Coding Capability สำหรับ `t0`–`t3`**: ตรวจ Coding Agent Index / Terminal-Bench ประกอบ ห้ามลด `t3` ไปใช้โมเดลเล็กที่คะแนนโค้ดตกฮวบจนเสี่ยง Rework Penalty
4. **ตรวจชื่อ `--model` และ `--effort` ที่ CLI รองรับจริง** (`codex`, `agy`, `claude`) และตรวจลำดับ `_fallback` ของทุก tier ให้เรียงตามความคุ้มค่า
5. **Zero Drift**: เสนอแผนแก้ไขพร้อมกันทั้ง 3 จุด ได้แก่ `framework/agents.json`, ตาราง Snapshot + Change Log ใน `framework/MODEL-POLICY.md`, และ `framework/tests/agents-config.test.mjs` แล้วรัน `cd framework && npm test` ให้เขียวครบ
```

---

## 4. Change Log

- **2026-11-19**: ย้ายนโยบายและ prompt มาเก็บแบบ tracked ที่ `framework/MODEL-POLICY.md` · ปรับผังทั้งหมดเป็นแพ็กเกจ $20/เดือนบนสเกล AA Intelligence Index v5.0.1:
  - `codex`: อัปเกรดเป็น `gpt-6.2-astra` (`t0` `xhigh`, `t1` `high`), `gpt-6.2-sol` (`t2` `xhigh`, `t3` `medium`, `t4` `low`), `gpt-6.1-terra` (`t5` `low`) — ตัด `max` ที่ไม่คุ้มและรุ่น `luna`/`terra` ที่ถูกครอบงำออก
  - `agy`: ปลดล็อก `t0` เป็น `gemini-4-neon` (`xhigh` · #1 Coding Agent Index 58.6) และขยับ `t1`–`t3` เป็น `gemini-4-neon` (`high`/`medium`/`low`), คง `t4` `gemini-4-hydrogen` (`low`) และ `t5` `gemini-3.8-flash` (`low`)
  - `claude`: คงสาย Claude Pro $20 (`opus` `xhigh`/`high`/`medium`, `sonnet` `high`, `haiku` `low`) และขยับ `t4` เป็น `haiku` (`high`) · ปรับ `_fallback` ของ `t0` เป็น `["codex", "agy", "claude"]` และ `t4`–`t5` เป็น `["codex", "claude", "agy"]`
- **2026-11-15**: ปรับ `agy t1`–`t4` เป็น `gemini-4-hydrogen` (`xhigh`→`low`) ในรุ่น `0.37.0`
- **2026-11-08**: ปรับสมดุล Coding Intelligence Index (`agy t3` → `argon low`, `codex t4/t5` → `luna high/medium`, `agy t0` → `null`) ในรุ่น `0.32.0`
