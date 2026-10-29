# Prompt จัด model ตามงานและความคุ้มค่า

ช่วยเลือก model และ reasoning effort ของค่ายคุณสำหรับ BAAN แล้วเติมเฉพาะคอลัมน์ของคุณในตารางด้านล่าง: Claude ดูแล Claude Code, Gemini ดูแล Agy, GLM ดูแล OpenCode/Z.AI Coding Plan

เป้าหมายคือใช้งานได้ดีโดยไม่เปลืองเวลาและโควตาเกินจำเป็น เลือกจากชนิดงาน ขอบเขต ความเสี่ยง และโอกาสต้องแก้ซ้ำก่อน คะแนน Intelligence Index เป็นข้อมูลประกอบ ไม่ใช่เป้าที่ต้องทำให้เท่า Codex หรือค่ายอื่น และชื่อ effort ข้ามโมเดลไม่ได้มีต้นทุนเท่ากัน

1. ตรวจชื่อ model และ effort ที่ CLI/บัญชีของคุณรองรับจริง ใช้เอกสารปัจจุบันและระบุแหล่งข้อมูล
2. เลือกค่าเริ่มต้นที่เบาที่สุดซึ่งมีเหตุผลว่าจะทำงานระดับนั้นได้ดี อย่าเลือกถูกที่สุดจนมีแนวโน้มต้องแก้ซ้ำ และอย่าเพิ่ม effort เผื่อทุกงานโดยไม่มีเหตุผล
3. แยกงานคิด/ออกแบบ/วิเคราะห์หลายไฟล์ออกจากงานตามแบบที่ชัดเจน t4 เขียน test จากเคสที่กำหนดแล้ว ไม่ใช่ออกแบบ test strategy; t5 สรุป/จัดหมวดจากข้อมูลที่ให้ ไม่ใช่ตัดสินใจสำคัญ
4. สงวน overdrive และ effort สูงสุดไว้กับงานยากจริง ถ้างานเกินขอบเขต tier ให้บอกว่าควรเลือก tier สูงขึ้น ไม่เพิ่มค่าเริ่มต้นให้ทุกงาน
5. เติม Intelligence Index เฉพาะคะแนนที่ตรง model และ effort ใช้เวอร์ชันเดียวกันทั้งตาราง ระบุวันที่และลิงก์ ถ้าไม่มีให้ใส่ N/A ห้ามเดาหรือใช้คะแนน effort อื่น
6. ถ้ามีข้อมูลต้นทุน/เวลา ให้ระบุฐานการวัด ราคา API ต่อ benchmark task ไม่ใช่ค่าใช้จ่ายหรืออัตราหักโควตาของบัญชีสมาชิก ห้ามอ้างว่าประหยัดจริงหากยังไม่วัดงาน BAAN
7. เก็บคอลัมน์ Codex และค่ายอื่นตามเดิม ตอบตารางเต็มพร้อมเหตุผลสั้นๆ แต่ละ tier หากไม่มีโมเดลเหมาะสมให้ใส่ N/A และอธิบายข้อจำกัด ไม่ฝืนจับคู่

แต่ละช่องใช้รูปแบบ `model / effort → Intelligence Index` คำว่า "รอเติม" หมายถึงยังไม่ได้ข้อมูลจากค่ายนั้น

| Tier | งาน | Codex | Claude Code | Agy / Gemini | OpenCode / GLM |
|---|---|---|---|---|---|
| t0 | ปัญหายากที่สุด เกินกำลัง t1; ใช้เป็นกรณีพิเศษ | gpt-6-astra / max → 57 | opus (Opus 5.5) / xhigh → 57 | N/A → null (เพดาน CLI อยู่ที่ t1) | N/A → null |
| t1 | สถาปัตยกรรม ตัดสินใจสำคัญ วิเคราะห์ทางเลือกซับซ้อน | gpt-6.1-sol / high → 50 | opus (Opus 5.5) / high → 52 | gemini-4-argon-high / high → 50 | N/A → null (glm-5.3 / max → 32 ไม่ถึงระดับ) |
| t2 | โค้ดซับซ้อนหลายไฟล์ ออกแบบเคสทดสอบ ตรวจความถูกต้อง/ความปลอดภัย | gpt-6.1-sol / medium → 46 | opus (Opus 5.5) / medium → 48 | gemini-4-argon-medium / medium → N/A | N/A → null (ไม่ถึงระดับ) |
| t3 | พัฒนาตามแบบ งานขอบเขตชัด ความซับซ้อนปานกลาง | gpt-6.1-terra / medium → 38 | sonnet (Sonnet 5.5) / high → 41 | gemini-3.8-flash-medium / medium → 30 | glm-5.3-flash / high → N/A |
| t4 | เขียน test จากเคสที่ระบุ refactor เล็ก แก้ตามรูปแบบเดิม | gpt-6-luna / medium → 18 | haiku (Haiku 5.5) / medium → 25 | gemini-3.8-flash-low / low → 22 | glm-5.3-flash / low → N/A |
| t5 | สรุป จัดหมวด แปลงรูปแบบข้อมูลตามกฎตรงไปตรงมา | gpt-6-luna / low → 10 | haiku (Haiku 5.5) / low → 19 | gemini-3.8-flash-low / low → 22 | glm-5.3-flash / low → N/A |

ข้อมูล Codex: ค่าเริ่มต้นที่เลือกตามความถนัดของโมเดลจาก [OpenAI Docs](https://learn.chatgpt.com/docs/models) ยังไม่ได้วัดคุณภาพหรือโควตากับงาน BAAN จริง คะแนน Intelligence Index v5 ตรวจวันที่ 2026-10-29 จาก [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models)

ข้อมูล Claude Code: model/effort ตรวจจาก [Claude Code docs: model config](https://code.claude.com/docs/en/model-config) และ `claude --help` (v2.1.312) — `--effort` รับ `low`/`medium`/`high`/`xhigh`/`max` ทุกตัวบน Opus/Sonnet/Haiku 5.5 · alias `opus`/`sonnet`/`haiku` ชี้ไปรุ่น 5.5 เฉพาะ Anthropic API/บัญชีสมาชิก (Bedrock/Google Cloud เป็นรุ่น 4.x — คะแนนในตารางใช้ไม่ได้) · คะแนน Intelligence Index v5.0 ตรวจวันที่ 2026-10-29 จาก [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models) หน้าเดียวกับ Codex (ค่า Codex ตรงกันทุกตัว) โดย AA ติดป้าย Opus/Sonnet ว่า "(… with fallback)" · ต้นทุนในวงเล็บข้างล่างคือ Cost per Task ของ AA = ราคา API ต่อ benchmark task ไม่ใช่โควตาบัญชีสมาชิก ยังไม่ได้วัดกับงาน BAAN จริง

- t0 — xhigh ไม่ใช่ max: max ได้ 58 (+1) แต่แพงกว่า ~1.7 เท่า ($10.04 vs $6.05) และช้ากว่า ~6 เท่า (669 vs 115 วิ) เอกสาร Claude Code เตือนว่า max ได้ผลเพิ่มน้อยลงและมักคิดเกิน → max เป็น override รายงานเท่านั้น
- t1 — opus/high → 52 ($3.46): sonnet/xhigh ได้ 50 แต่แพงกว่า ($4.09) · opus/medium 48 บางไปสำหรับการตัดสินใจสำคัญ
- t2 — opus/medium → 48 ($2.45): สูงกว่า sonnet/high (41, $1.64) ชัดเจน งานตรวจความปลอดภัย/ออกแบบเคสพลาดแล้วแก้ซ้ำแพงกว่าส่วนต่าง
- t3 — sonnet/high → 41 ($1.64): sonnet/medium ตกไป 30 ชันเกิน · opus/low (35, $0.98) หรือ haiku/xhigh (34, $0.25 แต่ 56 วิ) น่าลองถ้าวัดงานจริงแล้วผ่าน
- t4 — haiku/medium → 25 ($0.09): รูปแบบกำหนดแล้ว high ($0.16) ไม่จำเป็น · ถ้าต้องคิดหลายไฟล์ให้ขึ้น t3
- t5 — haiku/low → 19 ($0.04): ถ้ากลายเป็นงานตัดสินใจให้ขึ้น t3 แทนการเพิ่ม effort
- ไม่ใช้ Fable 5.1: คะแนนต่ำกว่า Opus ที่ effort เดียวกัน (xhigh 50 vs 57) แพงกว่า ($10.85) และบัญชีสมาชิกต้องใช้ usage credits

ข้อมูล Agy / Gemini: ชื่อ model และ effort ตรวจจาก `agy --version` (v1.4.10), `agy models`, `agy --help`, [Antigravity CLI Reference](https://antigravity.google/docs/cli/reference) และ [Gemini API Thinking Docs](https://ai.google.dev/gemini-api/docs/thinking) — ใน `agy` ชื่อ model ฝังระดับ effort (`low`/`medium`/`high`) ไว้ในรหัสโมเดลโดยตรง (ส่งผ่าน `--model <ชื่อจาก agy models>`) โดยฝั่ง Gemini ที่บัญชี/CLI รองรับจริงมี 6 ตัวคือ `gemini-4-argon-{low,medium,high}` และ `gemini-3.8-flash-{low,medium,high}` (ระดับ `minimal` ถูกตัดออกแล้วใน 3.8 Flash และยังไม่มีระดับ `xhigh`/`max` หรือโมเดล `Gemini 4 Carbon` / `Gemini 3.5 Flash-Lite` ใน `agy models` ปัจจุบัน) · คะแนน Intelligence Index v5.0 ตรวจวันที่ 2026-10-29 จาก [Artificial Analysis](https://artificialanalysis.ai/leaderboards/models) และหน้าโมเดล [Gemini 4 Argon](https://artificialanalysis.ai/models/gemini-4-argon) · ต้นทุนและเวลาในวงเล็บข้างล่างคือ Cost per Task (ราคา API มาตรฐาน $4/$20 ต่อ 1M input/output tokens สำหรับ Argon และ $0.75/$3.75 สำหรับ 3.8 Flash) และ median end-to-end response time บนชุดทดสอบของ AA ไม่ใช่อัตราหักโควตาของบัญชีสมาชิก Agy/G1 credits และยังไม่ได้วัดกับงาน BAAN จริง

- t0 — N/A (`agents.json` = `null`): เพดานสูงสุดของฝั่ง Gemini ใน `agy models` ปัจจุบันคือ `gemini-4-argon-high` ซึ่งใช้ที่ t1 ไปแล้ว (ยังไม่มี `Gemini 4 Carbon (High)` ที่ได้ 59, $7.76 บน AA และไม่มี effort สูงกว่า `high`) จึงไม่มีโมเดล Gemini ที่เป็น overdrive เหนือ t1 จริง
- t1 — gemini-4-argon-high → 50 ($7.68, ~53 วิ): โมเดลเรือธงฝั่ง Gemini สำหรับงานสถาปัตยกรรมและตัดสินใจสำคัญ (context 1M tokens, Terminal-Bench 4.0 บน AA ได้ 57.1%) งานระดับนี้ถ้าตัดสินใจพลาดต้องรื้อทั้งสายงาน จึงใช้ `high` เป็นค่าเริ่มต้นของ t1
- t2 — gemini-4-argon-medium → N/A (AA วัดเฉพาะรุ่น High): เอกสาร Google กำหนด `medium` เป็นค่าเริ่มต้นของ Gemini 4 Argon สำหรับงานวิศวกรรมซอฟต์แวร์หลายไฟล์และงาน agentic มาตรฐาน เพื่อลด thinking tokens และเวลาตอบสนองจาก `high` · ไม่ลดลงไปใช้ `gemini-3.8-flash-high` (31, $7.77) เพราะช่องว่างด้านโค้ด/เทอร์มินัลห่างจาก Argon มาก (Terminal-Bench 4.0 ตกจาก 57.1% เหลือ 19.7%, FrontierCode 2.0 ได้ 18.7% vs 25.7%) เสี่ยงหลุดในงานตรวจความปลอดภัย/ออกแบบเคสทดสอบ/ตรวจรับ
- t3 — gemini-3.8-flash-medium → 30 ($6.26): สำหรับงานพัฒนาตามแบบที่มี UX และสัญญา API/DES กำกับขอบเขตชัดเจน ใช้ `medium` ซึ่งเป็นค่าเริ่มต้นของ 3.8 Flash · ไม่ใช้ `gemini-3.8-flash-high` (31, $7.77, ~30 วิ) เพราะคะแนนเพิ่มเพียง +1 (Terminal-Bench 4.0 เท่ากันที่ 19.7%) แต่เปลือง thinking tokens จน Cost per Task บน AA แพงกว่า `medium` · ถ้างาน t3 ชิ้นใดเริ่มซับซ้อนหลายไฟล์ให้ลอง `gemini-4-argon-low` (AA ไม่มีคะแนนแยก) หรือขยับ task ขึ้น t2 แทนการอัด `flash-high`
- t4 — gemini-3.8-flash-low → 22: งานเขียน test จากเคสที่ระบุแล้วหรือ refactor เล็กตามรูปแบบเดิม ลด effort เป็น `low` เพื่อตัด thinking overhead (Terminal-Bench 4.0 = 10.1%) · ถ้าต้องวิเคราะห์หลายไฟล์หรือออกแบบเคสใหม่ให้ขึ้น t3/t2
- t5 — gemini-3.8-flash-low → 22: งานสรุป/จัดหมวด/แปลงข้อมูลตามกฎตรงไปตรงมา ใช้ตัวเบาสุดของฝั่ง Gemini ที่มีใน `agy models` ปัจจุบัน (ซ้ำกับ t4 เพราะใน CLI ยังไม่มี `Gemini 3.5 Flash-Lite` ที่ได้คะแนน 12, $0.69, 456 t/s บน AA และระดับ `minimal` ถูกยกเลิกใน 3.8 Flash · หากไม่จำกัดเฉพาะตระกูล Gemini ใน `agy models` มี `gpt-oss-120b-medium` เป็นตัวเลือก open-weight สำหรับงานจำนวนมาก แต่บน AA ยังไม่มีคะแนน Intelligence Index v5.0)

ข้อมูล OpenCode / GLM: ชื่อ model และ effort ตรวจจาก `opencode --version` (v2.1.4), `opencode models --standalone`, `opencode run --help` (`-m provider/model#variant`) และการรันจริงบนบัญชี Z.AI Coding Plan ของเครื่องนี้ (`#high`/`#low` ผ่านทั้งคู่) — บัญชีมี 3 ตัวคือ `zai-coding-plan/glm-5.3`, `zai-coding-plan/glm-5.3-flash`, `zai-coding-plan/glm-5.3-highspeed` · effort ส่งเป็น suffix `#low`/`#high`/`#max` ในชื่อ model (ไม่มี `#medium`) · รายละเอียดแผน (โมเดล/multiplier เครดิต) จาก [Z.ai Devpack docs](https://docs.z.ai/devpack/overview) · คะแนน Intelligence Index **v5.0** ตรวจวันที่ 2026-10-29 จาก [Artificial Analysis leaderboard](https://artificialanalysis.ai/leaderboards/models) และ [หน้าโมเดล GLM-5.3](https://artificialanalysis.ai/models/glm-5-3) (ระบุ v5.0 ชัด): GLM-5.3 (max) → 32 ($5.01/task), GLM-5.3 (low) → 23 ($1.57/task), ไม่มีรายการ GLM-5.3 (high) และ GLM-5.3-Flash ไม่แสดงคะแนน · (draft ก่อนหน้าใช้ v4.3.2: max 45 / low 34 / Flash 42 — ไม่ใช้แล้วตามกติกาข้อ 5) · ต้นทุนในวงเล็บคือ Cost per Task ของ AA จากราคา API ไม่ใช่อัตราหักเครดิตของแผน (แผนหักตาม multiplier ต่อ token: GLM-5.3 ≈ 3 เท่าของ Flash) และยังไม่ได้วัดกับงาน BAAN จริง

- t0 — N/A (`agents.json` = `null`): เพดานของฝั่ง GLM คือ `glm-5.3#max` (32) ซึ่งไม่ถึงแม้แต่ t1 · `glm-5.3-highspeed` เป็นโหมดเสิร์ฟเร็วของ 5.3 ตัวเดียวกันที่ปล่อยแบบไม่ประกาศ ไม่มีเอกสาร/คะแนน จึงยังไม่ใช้
- t1 — N/A (`agents.json` = `null`): เพดาน `glm-5.3#max` ได้ 32 ต่ำกว่า t1 ค่ายอื่น (50–52) และต่ำกว่า t3 ของ Codex/Claude (38/41) ด้วย — ใช้เป็น fallback ของงานสถาปัตยกรรม/ตัดสินใจสำคัญไม่ได้
- t2 — N/A (`agents.json` = `null`): เพดาน max ได้ 32 พอๆ กับ `gemini-3.8-flash-high` (31) ที่คอลัมน์ Gemini ปฏิเสธสำหรับ t2 · `#high` ไม่มีคะแนนบน AA และไม่น่าสูงกว่า max · งานหลายไฟล์/ออกแบบเคส/ตรวจความปลอดภัยพลาดแล้วแก้ซ้ำแพง จึงให้ fallback ข้ามไปค่ายอื่น
- t3 — glm-5.3-flash#high → N/A: งานพัฒนาตามแบบขอบเขตชัด — Flash ไม่มีคะแนนบน AA v5.0 (v4.3.2 เคยให้ 42 สูงกว่า 5.3-low) และหักเครดิตแผนเพียง ~1/3 ของ GLM-5.3 ต่อ token · ใช้ `#high` ไม่ใช่ `#low` เพราะเป็นงานเขียนโค้ดจริง เบากว่านั้นเสี่ยงแก้ซ้ำ · ถ้างานเริ่มซับซ้อนหลายไฟล์ให้ขึ้น t2 (ซึ่งจะไปค่ายอื่น) · ควรวัดกับงาน BAAN จริงก่อนไว้ใจเต็มที่
- t4 — glm-5.3-flash#low → N/A: test จากเคสที่กำหนด/refactor เล็ก เป็นงานตามแบบ ใช้ `#low` ตัด thinking overhead (ตรวจการรันจริงผ่าน) · แก้จาก draft เดิมที่วาง `flash#max` ไว้ที่นี่ — effort สูงสุดกับงานตามแบบขัดกติกาข้อ 4 · ถ้าต้องออกแบบเคสใหม่/คิดหลายไฟล์ให้ขึ้น t3
- t5 — glm-5.3-flash#low → N/A: สรุป/จัดหมวด/แปลงข้อมูลตามกฎ — ตัวเบาสุดที่มีเอกสารรองรับ (แผนไม่มีรุ่นเบากว่า; `highspeed` เร็วกว่าแต่ไม่มีเอกสาร/คะแนน ยังไม่เลือก) · ถ้ากลายเป็นงานตัดสินใจให้ขึ้น t3 แทนการเพิ่ม effort
- เรื่องเวอร์ชัน index: draft แรกของคอลัมน์นี้อ้าง v4.3.2 (max 45 / low 34 / Flash 42) เพราะหา v5.0 ไม่พบ — ตรวจซ้ำแล้ว AA เสนอ v5.0 จริง (หน้าโมเดลระบุชัด) และตัวเลข Codex/Claude/Gemini ในตารางตรงกับ v5.0 ทุกตัว จึงย้ายคอลัมน์นี้มาใช้ v5.0 ทั้งหมด

## Change Log

- 2026-10-29 — เตรียม release 0.22.0: GLM ใช้ AA v5.0 ชุดเดียวกับคอลัมน์อื่น (5.3 max = 32) → opencode t0–t2 = null · agy t0 = null · claude t3 ใน `agents.json` แก้เป็น `sonnet/high` ให้ตรงตาราง
- 2026-10-29 — เติมคอลัมน์ OpenCode / GLM: t1 `glm-5.3#max` → 45, t2 `glm-5.3#high`, t3 `flash#high`, t4/t5 `flash#low` + ตั้ง `glm-5.3#max` เป็นเพดานสำรอง t0 ใน `agents.json` (แก้ draft เดิมที่วาง effort กลับหัว: `flash#max` อยู่ t4, 5.3#max อยู่ t2) · ~~คะแนนอ้าง AA v4.3.2~~ — ถูกแทนด้วย entry ด้านบน (v5.0, t0–t2 = null)

- 2026-10-29 — เติมคอลัมน์ Agy / Gemini: คงผัง t1–t5 ตามความเหมาะสมของงาน (`argon-high` / `argon-medium` / `flash-medium` / `flash-low` / `flash-low`) และระบุข้อจำกัด t0 ที่เพดาน CLI ปัจจุบันอยู่ที่ `argon-high` (ซ้ำ t1) พร้อมคะแนน Intelligence Index v5.0 จาก Artificial Analysis
- 2026-10-29 — เติมคอลัมน์ Claude Code: t0 opus/max → xhigh, t2 sonnet/high → opus/medium, t3 sonnet/medium → high, t1/t4/t5 คงเดิม
- 2026-10-29 — สร้าง prompt ให้แต่ละค่ายจัด model ตามงานและความคุ้มค่า พร้อมเติมข้อมูลตัวเองในตาราง
