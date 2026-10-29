# วิเคราะห์ Workflow การพัฒนาและตรวจสอบ: Develop-All vs Wave-Based vs Task-Based

> วันที่ 2026-10-29 · ตัวอย่างจริงจาก `C:\src\schoolbright\knowledge\school-bot`
> ตัวเลขต้นทุนในข้อ 3.2 เป็นตัวอย่างสมมติ ส่วนตัวเลขในข้อ 3.3 และข้อ 8 วัดจากไฟล์จริง (แผน `plan/tasks-001.json`, รายงานใน `planning/`, run ใน `baan/reports/`)

**นิยามที่ใช้ทั้งเอกสาร**

| ชื่อ | ความหมาย |
|---|---|
| A — Develop All | พัฒนาครบทุก task ก่อน แล้วค่อยเขียน test และตรวจทั้งหมดทีเดียว |
| B — Wave-Based | แบ่ง task เป็น wave ตาม dependency ตรวจให้ผ่านทีละ wave |
| C — Task-Based | พัฒนาและตรวจแบบเจาะจุดทีละ task |
| H — Risk-Gated Waves | แนวทางผสมที่เสนอในเอกสารนี้ (ข้อ 6) |
| L0–L4 | ระดับการตรวจ: L0 test อัตโนมัติราย task · L1 ตรวจอิสระราย task · L2 wave gate · L3 integration · L4 ตรวจปิดโปรเจกต์ |
| fan-out | จำนวน task ที่พึ่ง task นี้ ทั้งทางตรงและทางอ้อม |
| oracle pack | เอกสารย่อต่อ task: AC ตามต้นฉบับ + ท่อน contract พร้อม revision + test cases |

---

## 1. Executive Summary

- **ต้นทุนรวมไม่ได้ขึ้นกับว่าตรวจกี่ครั้ง** มันขึ้นกับสองอย่าง:
  1. **ต้นทุนต่อการตรวจหนึ่งครั้ง** = ค่าโหลด context/อ่าน docs + ค่าตัดสินจริง
  2. **ค่าเสียหายจากการเจอช้า** = bug rate × fan-out × ระยะเวลาที่ปล่อยไว้
- **ต้องแยกการตรวจเป็น 3 ชนิด เพราะต้นทุนต่างกันเป็นสิบเท่า:**
  - **Testing** — เครื่องรัน ถูก รันได้ทุก task
  - **Code Review** — อ่าน diff ราคากลาง
  - **Requirement Verification** — เทียบ AC กับ docs แพงที่สุด เพราะต้องโหลด docs
  - ข้อผิดพลาดที่พบบ่อยคือรวมทั้งสามเป็นคำว่า "ตรวจ" แล้วตัดสินใจไปพร้อมกัน
- **ไม่มีแนวทางไหนชนะทุกสถานการณ์:**
  - A ถูกที่สุดเมื่อ bug น้อยและ task อิสระต่อกัน
  - C เสี่ยงต่ำที่สุด แต่แพงมากถ้าต้องอ่าน docs ใหม่ทุก task
  - B อยู่ตรงกลาง
- **ข้อเสนอคือ H (Risk-Gated Waves):** ใช้ wave เป็นโครง แต่จังหวะตรวจขึ้นกับความเสี่ยงของแต่ละ task
  - งานฐานรากที่ fan-out สูง (schema, contract, auth, migration) ตรวจอิสระทันที ก่อนมีงานต่อยอด
  - งานปลายทาง fan-out ต่ำ ทำแค่ test อัตโนมัติ แล้วรอตรวจเชิงตัดสินรวมทีเดียวตอนจบ wave
  - อ่าน docs ฉบับเต็มครั้งเดียว แล้วกลั่นเป็น oracle pack ต่อ task
- จากตัวอย่างสมมติ (ข้อ 3.2) H **ไม่ได้ถูกที่สุดทุกกรณี แต่ไม่เคยแพงที่สุด** และต้นทุนแกว่งน้อยที่สุดเมื่อสมมติฐานเปลี่ยน
- **ข้อมูลจริงของ school-bot (ข้อ 3.3) ชี้ว่าคอขวดอยู่ที่อื่น:** ปัญหาไม่ได้อยู่ที่การเลือก wave หรือ task แต่อยู่ที่สามเรื่องนี้
  - **oracle ไม่ตรึง** — เคสตรวจโตจาก 101 เป็น 2,234 เคสใน slice เดียว
  - **task ไม่มี AC ผูก** — 35 จาก 110 task จึงตรึงเส้นชัยไม่ได้
  - **งานเอกสาร/ออกแบบกินเวลา agent 44%**

---

## 2. Comparison Table

คะแนน 1–5 โดย **5 = ดีที่สุด** (ต้นทุนต่ำหรือความเสี่ยงต่ำ) · C ในตารางนี้คือ C ที่ใช้ context cache แล้ว

| ปัจจัย | A | B | C | **H** | เหตุผล |
|---|---|---|---|---|---|
| Development Time | 5 | 4 | 3 | 4 | A ทำต่อเนื่องไม่สะดุด · C หยุดสลับไปตรวจทุก task |
| Testing Time | 2 | 4 | 4 | 4 | A เขียน test ทีหลังต้องทำความเข้าใจใหม่ และ test มักแค่ยืนยันสิ่งที่โค้ดทำ แทนที่จะยืนยันว่าตรง AC |
| Verification Cost | 3 | 4 | 2 | 4 | A ตรวจรอบเดียวแต่ก้อนใหญ่ และยังต้องตรวจซ้ำหลังแก้ · C ต้องตรวจ 20 รอบ |
| Doc Reading Cost | 5 | 3 | 3 (ไม่ cache = 1) | 4 | ดูข้อ 4 |
| Context Switching | 5 | 4 | 2 | 3 | H สลับเฉพาะ task เสี่ยงสูงและตอนจบ wave |
| Rework Cost | 1 | 3 | 5 | 4 | งานที่สร้างทับฐานที่พังต้องรื้อตาม |
| Bug Detection Speed | 1 | 3 | 5 | 4 (เสี่ยงสูง = 5) | |
| Debugging Complexity | 1 | 3 | 5 | 4 | ช่วงที่ต้องหาว่าพังที่ไหน: 1 task < 5 task < 20 task |
| Integration Risk | 2 | 4 | 3 | 4 | C ตรวจเฉพาะส่วนที่เปลี่ยน จึงไม่เห็นปัญหาข้าม task จนจบ |
| Regression Risk | 2 | 4 | 3 | 4 | C เจอ regression ข้าม module ช้า ถ้ารันแค่ test ของ task |
| Code Quality | 2 | 4 | 4 | 4 | A เจอปัญหา design ตอนท้าย มักแก้แบบปะผุแทนการ refactor |
| Maintainability | 2 | 4 | 3 | 4 | C ดีราย task แต่ภาพรวมมีโอกาสไม่สอดคล้องกัน |
| Scalability | 1 | 4 | 2 | 5 | A ต้องตรวจ diff ทั้งก้อนซึ่งใหญ่เกิน context ของ agent · C มีรอบตรวจเพิ่มตามจำนวน task และต้องทำต่อกันทีละ task |

**ข้อสังเกตเฉพาะ AI agent (ทำให้ A แย่กว่ากรณีที่ใช้คน):**
- ถ้าให้ LLM ตรวจ diff ของ 20 task พร้อมกัน ความสนใจจะกระจาย และสัดส่วนปัญหาที่ตรวจเจอ (recall) ลดลงตามขนาดก้อน
- agent สร้างงานต่อบนฐานที่พังได้อย่างมั่นใจ bug จึงแพร่ไปเร็วกว่าตอนคนทำ

---

## 3. Cost & Efficiency Analysis

### 3.1 สูตรที่ใช้แยกต้นทุน

```
Total = Certain                       ← เกิดแน่นอน (dev, test, docs, verify, switch, final)
      + p·N·fix₀                      ← ขึ้นกับความถี่ bug (ค่าแก้ฐาน ทุกแนวทางจ่ายเท่ากัน)
      + p·N·recall·(fix_late − fix₀)  ← ค่าปรับจากการเจอช้า (เพิ่มตาม fan-out)
      + p·N·(1−recall)·cost_escape    ← bug หลุดไปถึงผู้ใช้
```

**กฎตัดสิน:** การตรวจราย task คุ้มก็ต่อเมื่อ `p × (fix_late − fix₀) > ค่าตรวจราย task ที่เพิ่มขึ้น`
- `fix_late − fix₀` แปรตาม fan-out ของ task นั้นโดยตรง
- ข้อยกเว้นสำคัญ: ถ้า task ที่ fan-out สูง **ส่งต่อผ่าน interface ที่มี contract test ล็อกไว้แล้ว** สิ่งที่แพร่ต่อคือ interface ไม่ใช่ไส้ใน
  - ให้ตรวจ interface ทันทีด้วย contract test (เครื่องตรวจ ราคาถูก)
  - review ไส้ในเลื่อนไป wave gate ได้

### 3.2 ตัวอย่างสมมติ (ตัวเลขทั้งหมดเป็นสมมติฐาน ไม่ใช่ค่าที่วัดได้จริง)

**สมมติฐาน** (u = หน่วยงานสมมติ):

| ปัจจัย | ค่าที่สมมติ |
|---|---|
| ขนาดงาน | 20 task แบ่งเป็น 4 wave × 5 task |
| Dev | 5u/task |
| เขียน test | 1.5u/task (A ใช้ 2u เพราะเขียนตอนที่ context หายไปแล้ว) |
| อ่าน docs เต็ม | D = 8u |
| อ่าน oracle pack | d = 1u (สร้าง pack ครั้งแรก 12u) |
| ตรวจเชิงตัดสิน | ตรวจเดี่ยว 2u/task · ตรวจเป็นก้อน 1.5u/task · ตรวจ integration ต่อ gate 3u (A ตรวจทีเดียว 6u) |
| ตรวจปิดโปรเจกต์ (B, C, H) | 16u |
| Bug | p = 0.3 → 6 bug |
| ค่าแก้ตามจังหวะที่เจอ | เจอทันที 2u · จบ wave 4u · จบโปรเจกต์ 9u · หลุดถึงผู้ใช้ 25u |
| Recall | ตรวจราย task หรือราย wave 90% · ตรวจ 20 task รวดเดียว 75% |

| | แน่นอน | ตาม bug (ฐาน) | จากการเจอช้า + หลุด | **รวม** |
|---|---|---|---|---|
| A Develop-All | 201 | 9 | 31.5 + 37.5 | **≈279** |
| B Wave (อ่าน docs ทุก wave) | 224 | 10.8 | 10.8 + 15 | **≈261** |
| C อ่าน docs ใหม่ทุก task | 366 | 10.8 | 0 + 15 | **≈392** |
| C + context cache | 238 | 10.8 | 0 + 15 | **≈264** |
| **H Risk-Gated Waves** | 223 | 10.8 | 5.4 + 15 | **≈254** |

**Sensitivity: เปลี่ยนสมมติฐานแล้วผู้ชนะเปลี่ยน**

| สถานการณ์ | A | B | C+cache | H | ถูกที่สุด |
|---|---|---|---|---|---|
| ฐาน (p=0.3, fan-out ปานกลาง) | 279 | 261 | 264 | **254** | H (แต่ H, B, C+cache ห่างกันไม่ถึง 5% ถือว่าใกล้เคียงกัน) |
| bug เยอะ + fan-out สูง (p=0.5, เจอตอนจบโปรเจกต์ = 15u) | 376 | 303 | **281** | 284 | C+cache ≈ H |
| bug น้อย + task อิสระ (p=0.1, เจอตอนจบ = 3u) | **218** | 234 | 247 | 232 | **A** |
| สร้าง pack ไม่ได้ | 279 | 261 | 392 | ≈312 | B |

**อ่านผล:**
- ระหว่าง B, C+cache และ H ค่าคาดหมาย (expected value) ห่างกันน้อย ข้อได้เปรียบจริงของ H คือ**ตัดความเสี่ยงหาง** (tail risk) ของ bug ใน task ที่ fan-out สูง
- A ชนะได้จริงเมื่อ bug น้อยและ task อิสระต่อกัน แต่ต้นทุนแกว่งรุนแรงที่สุด
- C ต้องมี cache ถ้าไม่มี C แพงที่สุดทุกกรณี

### 3.3 ข้อมูลจริงจาก school-bot (วัดได้ ไม่ใช่สมมติ)

**ที่มา:** run ของ BAAN ที่บันทึกใน `baan/reports/` ช่วง 2026-10-21 → 2026-10-28
- ใช้เฉพาะ run ที่ใบงานอ้าง school-bot
- run หลัง commit `10a3875` จะไปอยู่ที่ `<ราก workspace>/reports/baan` ซึ่งตอนนี้ยังว่าง

**สัดส่วนเวลา agent**

| กลุ่ม | role | runs | นาที | สัดส่วนเวลา |
|---|---|---:|---:|---:|
| เขียนโค้ด | sys, front, be | 47 | 453 | 28% |
| ตรวจ | check, jpo, inspect | 56 | 451 | 28% |
| เอกสาร/ออกแบบ/วางแผน | arch, sa, spec, gm, int, ba, dba, vault, planner, pm | 91 | 705 | 44% |
| **รวม** | | **194** | **1,609 (≈27 ชม.)** | |

**ผลตัดสินของ check:** PASS 13 / FAIL 18 (FAIL 58% ของ verdict) · BLOCKED/NEEDS_HUMAN 6

**สถานะแผน** (`plan/tasks-001.json`):
- 110 task — verified 15 (ทุกตัวเป็นงานเอกสาร/UX/BA/contract) · done-local 2 (BE-006 slice logout, BE-039) · **งานโค้ดที่ verified = 0**
- **35/110 task ไม่มี `ac_ids`** รวม SA-001, BE-001, SEC-001, DBA-002, BE-002, DBA-004, TP-002 ซึ่งเป็นฐานรากทั้งหมด

**DAG ลึกมาก (fan-out ทางอ้อม):**

| task | งานที่พึ่งทางอ้อม |
|---|---:|
| SA-001 | 89 |
| BE-001 | 87 |
| DBA-001 | 86 |
| SEC-001, DBA-002 | 81 |
| BE-002, BE-039 | 79 |

เส้นหลัก License เป็นสายเดี่ยว: `BE-002 → BE-003 → BE-004 → BE-005 → BE-007 → BE-006`

**สิ่งที่ข้อมูลจริงบอก:**
1. **เวลาที่ใช้ตรวจเท่ากับเวลาที่ใช้เขียนโค้ด (451 ≈ 453 นาที)** และ FAIL เกินครึ่ง แปลว่าต้นทุนการตรวจในโปรเจกต์นี้ไม่ได้มาจากความถี่ในการตรวจ (task-based ไม่ได้เป็นต้นเหตุ) แต่มาจาก**ขอบเขตการตรวจที่ไม่มีเพดาน** (ดูเรื่อง gRPC logout ในข้อ 8.4)
2. **ส่วนที่แพงที่สุดคืองานเอกสาร (44%)** ดังนั้นการลดค่าอ่าน docs (ข้อ 4) ได้ผลกับโปรเจกต์นี้มากกว่าการเลือกระหว่าง wave กับ task
3. **DAG ที่ลึกขนาดนี้คืออาณาเขตของ C**: งานฐานรากเกือบทุกตัวมี fan-out 70–89 ตามกฎข้อ 3.1 ต้องตรวจทันที การรวม task ฐานรากไปตรวจทีเดียวตอนจบ wave จะเสี่ยงสูง แต่ส่วนปลาย (FE/QA/content) ยังใช้ wave gate ได้

---

## 4. Documentation Optimization

**ต้องอ่าน docs ใหม่ทุก task ไหม?** ไม่ต้อง วิธีคือแยกการวิเคราะห์ requirement ออกจากการตรวจโค้ด:

1. **Requirement Analysis ทำครั้งเดียวต่อ scope** (`spec`/`arch`) ผลลัพธ์คือ **oracle pack ต่อ task**:
   - AC id พร้อมข้อความ**ตามต้นฉบับ** ห้ามถอดความ เพราะการถอดความคือจุดที่ข้อมูลรั่ว
   - ท่อน contract/design พร้อม **revision**
   - test-plan cases · สิ่งที่ไม่อยู่ในขอบเขต (non-goals) · ลิงก์หัวข้อต้นฉบับ
2. **Code Verification** อ่าน pack กับ diff · เปิดต้นฉบับเฉพาะหัวข้อที่ pack ลิงก์ไว้
3. **ครั้งเดียวต่อ wave ได้ไหม?** ได้ แต่ไม่จำเป็น ถ้า docs ไม่เปลี่ยน pack ใช้ข้าม wave ได้ เพราะ **cache key คือ revision ของ docs**

**อ่านฉบับเต็มใหม่เมื่อ (เงื่อนไขที่ทำให้ cache ใช้ไม่ได้):**
- revision ของ docs/contract ที่ pack อ้างถึงเปลี่ยน
- มี `NEEDS_REQUIREMENT_CHANGE` / `NEEDS_DESIGN_CHANGE`
- ผู้ตรวจเจอความกำกวมที่ pack ตอบไม่ได้ (ให้แก้ pack ไม่ใช่เดา)
- ตรวจปิดโปรเจกต์ ต้องเทียบกับต้นฉบับเพื่อจับ pack ที่คลาดเคลื่อน

**ลดต้นทุนโดยไม่เสียความแม่นยำ:**
- ให้คนตรวจอิสระ review pack หนึ่งครั้ง (ถูกกว่าให้ผู้ตรวจทุกคนอ่าน docs เต็ม)
- traceability matrix AC → task → test
- ตรึง oracle ต่อ task

**กรณี school-bot:** มีวัตถุดิบครบ (44 REQ / 187 AC / 82 TP cases และ `ac_ids` ใน JSON) แต่ **35 task ยังไม่มี AC ผูก** task เหล่านี้ทำ oracle pack ไม่ได้ เพราะไม่มีเส้นชัยให้ตรึง
- ผลที่เห็นจริง: slice gRPC logout ผ่าน check ครบแล้ว แต่ลง `verified` ไม่ได้ เพราะไม่มี AC ใดผูก logout transport (`plan/index.md` หัวข้อ Waiting on Human)
- **งานที่ต้องทำก่อนจะลดค่าตรวจได้ คือให้ `spec` ผูก AC ให้ครบ 35 task นี้**

---

## 5. Failure Handling Strategy

**ขั้นแรกคือหาว่าต้นเหตุอยู่ที่ไหน ไม่ใช่สั่งตรวจกว้างไว้ก่อน:**

| ต้นเหตุ | ตรวจซ้ำอะไร | Task ก่อนหน้า |
|---|---|---|
| bug อยู่ในโค้ดของ task เอง และ fix ไม่แตะ interface ที่ใช้ร่วม | test ของ task + เคสที่ตก + impacted tests ของไฟล์ที่แตะ | **ไม่ต้องตรวจซ้ำ** |
| fix เปลี่ยน interface/contract/schema ที่ task อื่นใช้ | ข้างบนทั้งหมด + **ทุก task ที่ใช้งาน interface นั้น** (หาด้วย DAG หรือ `baan --sweep`) + contract/integration tests | ตรวจเฉพาะ task ที่ใช้งาน interface นั้น |
| ต้นเหตุอยู่ที่ task ก่อนหน้า | **เปิด task ต้นเหตุใหม่** ตาม oracle เดิมของมัน ถ้า AC ไม่ได้กำหนดไว้ = ช่องโหว่ของ contract ให้ส่งกลับ `arch` ออก revision ใหม่ แล้ว sweep ผู้ใช้งานทุกตัว | task ต้นเหตุ + ผู้ใช้งานทุกตัว |
| fix แตะของกลาง (auth, config, schema หลัก, build) | Full regression | ทั้งหมด (ตรวจโดยรัน test อัตโนมัติ ไม่ใช่เปิดรอบตรวจเชิงตัดสินใหม่) |

**บันได Verification Scope:**

| ระดับ | เมื่อไหร่ |
|---|---|
| Task-level tests | ทุกการเปลี่ยนแปลง ไม่มีข้อยกเว้น |
| Impacted tests | แตะ module ที่ใช้ร่วม หรือ fix แตะ public interface |
| Integration / contract tests | จบทุก wave · contract/schema/API เปลี่ยน · ก่อนให้งานที่ใช้ interface นั้นต่อของจริง |
| Full regression | ก่อน release/merge เข้า main · แตะของกลาง · ไม่มี coverage map ที่เชื่อถือได้ · fix สะสมตั้งแต่ 3 จุดขึ้นไปใน wave |

**ข้อปฏิบัติ:**
- ถ้า full test suite รันเสร็จในไม่กี่นาที **ให้รันทั้งหมดทุกครั้ง** เพราะการคัดเลือก impacted tests คุ้มเฉพาะเมื่อ suite แพง ส่วนที่ต้องประหยัดคือการตรวจเชิงตัดสินของคนหรือ AI
- **เพดาน rework:** แก้ 2 รอบแล้วไม่ผ่าน ให้ถามคนทันที
- การตรวจซ้ำหลังแก้ ใช้แค่เคสที่ตก + suite ตามขอบเขตเดิม **ไม่ขยายขอบเขตการค้นหา**

---

## 6. Recommended Hybrid Workflow: "Risk-Gated Waves"

| # | คำถาม | คำตอบ |
|---|---|---|
| 1 | อ่าน docs เมื่อไหร่ | ฉบับเต็มครั้งเดียวตอน Phase 0 → oracle pack · อ่านใหม่เฉพาะเมื่อเข้าเงื่อนไขในข้อ 4 · อ่านฉบับเต็มอีกครั้งตอนตรวจปิดโปรเจกต์ |
| 2 | แบ่ง wave อย่างไร | ตามชั้นของ DAG แล้วปรับ: (ก) task ที่ fan-out สูงอยู่ wave แรกๆ และ wave นั้นควรเล็ก (ข) task ที่แตะ module เดียวกันอยู่ wave เดียวกัน (ค) ตัดขอบ wave ที่จุดส่งต่อ contract (ง) ขนาด 3–6 task |
| 3 | สร้าง test cases เมื่อไหร่ | ตัว**เคส**สร้างจาก AC ตอนทำ pack ก่อนเขียนโค้ด · **โค้ด test** เขียนพร้อม task · **contract tests** เขียนตอน task ที่ผลิต interface เสร็จ ก่อนให้งานที่ใช้ interface นั้นเริ่ม |
| 4 | รัน test เมื่อไหร่ | L0 ทุก task · impacted tests เมื่อแตะของที่ใช้ร่วม · ชุดเต็มตอนจบ wave และก่อน release |
| 5 | ตรวจระดับ task เมื่อไหร่ | เฉพาะ task เสี่ยงสูง: schema/migration, public contract, auth/security, ข้อมูลเงิน/ข้อมูลสำคัญ, fan-out สูงที่ไม่มี contract test กั้น → ตรวจอิสระทันทีก่อนงานที่ต่อยอด |
| 6 | Wave verification เมื่อไหร่ | จบทุก wave: ผู้ตรวจอิสระคนเดียวตรวจ diff ทั้ง wave เทียบ pack ของ task เสี่ยงต่ำ + ตรวจความสอดคล้องข้าม task + integration |
| 7 | Full verification เมื่อไหร่ | ครั้งเดียวก่อน release: full regression + E2E + AC trace เทียบ**ต้นฉบับ** + security |
| 8 | task ล้มเหลวตรวจซ้ำแค่ไหน | ตามข้อ 5 |
| 9 | กันตรวจซ้ำซ้อน | **verification ledger**: บันทึก (diff hash, oracle revision, ระดับที่ผ่าน) ถ้าไม่เปลี่ยนให้ข้าม · แต่ละระดับตรวจคนละเรื่อง (L1 = AC ของ task · L2 = ข้าม task · L4 = ระบบ) · oracle ตรึงต่อ task |
| 10 | มั่นใจทั้งระบบ | AC trace ครบ + full regression เขียว + E2E ของเส้นทางหลัก + ตรวจปิดโปรเจกต์เทียบต้นฉบับ |

**กฎเพิ่มเติม:**
- **สายเดี่ยวใน module เดียว เจ้าของเดียว** (เช่น `BE-003 → BE-004 → BE-005 → BE-007`): ไม่ต้องตรวจอิสระทุกข้อต่อ
  - ใช้ L0 + contract test ทุกข้อต่อ
  - ตรวจอิสระที่**แกนที่เสี่ยงที่สุด**หนึ่งจุด และที่**ทางออกของสาย** (ก่อนงานนอกสายเริ่ม)
- **Pipelining:** wave N+1 เริ่มงานที่ไม่พึ่ง output ที่ยังไม่ผ่านการตรวจได้ · ห้ามเริ่มงานที่ต่อยอดจาก task เสี่ยงสูงที่ยังไม่ผ่าน · งานตรวจใช้ slot ไม่เกินครึ่ง
- **ประตูมนุษย์ไม่ใช่ wave:** งานที่ทำบน stub ได้เดินต่อ ประตูผูกกับ task ที่ต่อของจริงเท่านั้น

### Minimum Verification ที่ห้ามข้าม
- Build, type check, lint และ test ของ task ผ่านทุก task
- ตรวจอิสระทันทีสำหรับ task เสี่ยงสูง **ก่อน**มีงานต่อยอด
- Contract/integration test ที่ทุกจุดส่งต่อ interface
- Security review ทุกพื้นผิวโจมตี · ประตูมนุษย์ schema/migration
- Full regression + AC trace ครบ ก่อน release

### เลื่อนไปทำตอนจบ wave หรือจบโปรเจกต์ได้
- Requirement verification ของ task เสี่ยงต่ำที่ไม่มีงานอื่นพึ่ง → จบ wave
- Code quality และ maintainability review → จบ wave
- อ่าน docs ฉบับเต็มซ้ำ → ตรวจปิดโปรเจกต์
- Non-functional/performance → ก่อน release (ยกเว้นงานที่ performance เป็น AC หลัก)
- Finding ด้าน hygiene ที่อยู่นอก AC → backlog ไม่ใช่เหตุให้ FAIL

---

## 7. Workflow Diagram

```
Phase 0  Requirement Analysis (ครั้งเดียว)
         docs ฉบับเต็ม → oracle pack ต่อ task + AC trace + test cases + risk tier
                │
Phase 1  Dependency graph → แบ่ง waves (task fan-out สูงขึ้นก่อน, wave เล็ก)
                │
        ┌───────▼────────────── WAVE n ───────────────────────┐
        │  ต่อ task:  implement + tests → L0 (auto, เสมอ)       │
        │      ├─ risk HIGH → L1 ตรวจอิสระทันที ─┐             │
        │      │                (FAIL → แก้ ≤2 รอบ → ถามคน)    │
        │      └─ risk LOW  → done-local ────────┤             │
        │                                        ▼             │
        │  WAVE GATE (L2/L3): full/impacted tests              │
        │    + review diff ทั้ง wave เทียบ pack (task LOW)       │
        │    + contract/integration tests                      │
        │    + อัปเดต verification ledger                      │
        │  FAIL → แก้ + ตรวจ task ที่ใช้งานผ่าน DAG              │
        └───────┬──────────────────────────────────────────────┘
                │  (wave n+1 เริ่มงานที่ไม่พึ่งของยังไม่ผ่าน ได้เลย)
                ▼
Phase 3  FINAL (L4): full regression + E2E + AC trace เทียบต้นฉบับ
                     + security + ประตูมนุษย์ → release
```

---

## 8. ตัวอย่างจริง: school-bot — 20 task ของเส้น DB → License → Login → Projects

### 8.1 ข้อมูลตั้งต้น (จาก `plan/tasks-001.json`)

| Task | งาน | fan-out ทางอ้อม | AC ที่ผูก | ประตู | สถานะ |
|---|---|---:|---:|---|---|
| SA-001 | Contracts/backend boundaries | 89 | **0** | — | pending |
| BE-001 | Legacy auth จาก source เดิม | 87 | **0** | — | pending |
| DBA-001 | Physical map | 86 | 5 | — | verified |
| SEC-001 | Threat/trust review | 81 | **0** | — | pending |
| DBA-002 | Core DDL/rollback | 81 | **0** | — | pending |
| DBA-003 | ตรวจ core หลังคนรัน SQL | 80 | 5 | G-CORE | pending |
| BE-002 | เชื่อม 4 DB เดิม | 79 | **0** | — | pending |
| BE-039 | web-principal/BFF/session | 79 | 2 | G-AUTH, G-CORE | done-local |
| BE-003 | Admin License | 73 | 4 | — | pending |
| BE-004 | Signed lease (activate/validate) | 72 | 3 | — | pending |
| BE-005 | ย้าย Key | 71 | 3 | — | pending |
| BE-007 | Host entitlement/secure storage | 69 | 8 | — | pending |
| BE-006 | Login/session | 58 | 1 | G-AUTH | done-local (slice logout) |
| DBA-004 | Projects DDL | 50 | **0** | G-GUEST | pending |
| BE-008 | Cloud projects API | 49 | 6 | G-PROJECT-DB | pending |
| BE-009 | Local projects/migration | 33 | 2 | G-GUEST | pending |
| FE-001 | License UI | 32 | 3 | G-UX-ENTRY | pending |
| FE-002 | Login/Guest entry UI | 31 | 1 | G-UX-ENTRY | pending |
| TP-002 | Failure fixtures/harness | 16 | **0** | — | pending |
| QA-001 | ตรวจ DB/License/Login | 8 | 31 | — | pending |

### 8.2 จัด risk tier และ wave ตาม H

**Phase 0 (ก่อน wave ใดๆ):** ให้ `spec` ผูก AC ให้ 7 task ที่ยังว่าง (SA-001, BE-001, SEC-001, DBA-002, BE-002, DBA-004, TP-002) แล้วสร้าง oracle pack ต่อ task
- docs ฉบับเต็ม (44 REQ / 187 AC / 82 TP) อ่านรอบนี้รอบเดียว

| Wave | Tasks | การตรวจ | เหตุผล |
|---|---|---|---|
| W1 Contracts | SA-001 · BE-001 · SEC-001 · TP-002 | SA-001, BE-001, SEC-001 = **L1 ทันที** · TP-002 = gate | สามตัวแรก fan-out 81–89 และเป็นงานเอกสาร/สัญญา ถ้าผิดตรงนี้งานที่เหลือ 80+ task ผิดตาม · TP-002 เป็น fixture ใช้ภายใน QA |
| W2 Data + auth skeleton | DBA-002 · DBA-004 · BE-039 · BE-002 (บน stub DB) | DBA-002, DBA-004 = L1 (schema) + ประตูมนุษย์รัน SQL · BE-039 = L1 + `jpo` (auth) · BE-002 = contract test + gate | BE-002 fan-out 79 แต่งานที่ต่อยอดใช้มันผ่าน interface DB adapter ดังนั้นล็อกด้วย contract test พอ ไม่ต้องตรวจไส้ในทันที |
| W3 License chain | BE-003 → BE-004 → BE-005 → BE-007 | L0 + contract test ทุกข้อต่อ · **L1 + jpo ที่ BE-004** (crypto ของ signed lease = แกนเสี่ยงสุด) · **L1 + jpo ที่ BE-007** (ทางออกของสาย ก่อน BE-006/FE-001) | สายเดี่ยว module เดียว (กฎในข้อ 6) ตรวจอิสระ 2 จุดแทน 4 |
| W4 Login + Projects | BE-006 · BE-008 · BE-009 · DBA-003 (เมื่อ G-CORE เปิด) | BE-006 = L1 + jpo (auth) · BE-008, BE-009 = gate | BE-008/009 อยู่หลัง contract โครงงาน ส่งต่อให้ FE ผ่าน API ที่มี contract test |
| W5 UI + QA | FE-001 · FE-002 · QA-001 | FE = gate อย่างเดียว (UX เซ็นแล้ว + contract test) · QA-001 คือการตรวจ integration ของทั้ง slice (31 AC) | fan-out ทางอ้อมของ FE ส่วนใหญ่คือ QA/packaging ปลายทาง ไม่ได้ต่อยอดตัวโค้ด UI |

**ประตูมนุษย์ไม่หยุด wave:**
- DBA-003 (G-CORE ต้องให้คนรัน SQL) ไม่บล็อก BE-002/BE-003 เพราะงานเหล่านั้นทำบน stub ไปก่อน
- ประตูผูกเฉพาะ task ที่ต่อ DB จริง ตามกติกาข้อ 10 ของ BAAN

**ปริมาณการตรวจเชิงตัดสินของ slice นี้:**

| ประเภท | จำนวน |
|---|---|
| L1 อิสระ | 9 (SA-001, BE-001, SEC-001, DBA-002, DBA-004, BE-039, BE-004, BE-007, BE-006) — 4 ตัวมี jpo ร่วม |
| Wave gate | 5 |
| Integration ของ slice | QA-001 |
| อ่าน docs ฉบับเต็ม | 1 ครั้งตอน Phase 0 |

- ถ้าใช้ C ตรง: ตรวจอิสระ 20 ครั้ง และอ่าน docs ทุก task
- ถ้าใช้ A: งานเส้นหลัก 80+ task ต่อยอดบน SA-001/BE-001 ที่ยังไม่ผ่านการตรวจ

### 8.3 สถานการณ์สมมติ: BE-004 (signed lease) พังหลังจากสร้าง BE-005/BE-007 แล้ว

สมมติว่าตรวจ L1 ที่ทางออกของสาย (BE-007) แล้วพบว่า lease ที่ลงนามไม่ตรวจวันหมดอายุตาม AC ของ BE-004:
1. **ต้นเหตุอยู่ที่ BE-004** → เปิด BE-004 ใหม่ตาม oracle เดิมของ BE-004 (ไม่ใช่ของ BE-007)
2. fix ไม่เปลี่ยน interface ของ lease (รูปแบบ token เหมือนเดิม) → รัน contract test ของ lease + test ของ BE-005/BE-007 (เครื่องรัน) → **ไม่เปิดรอบตรวจอิสระใหม่ให้ BE-005**
3. ถ้า fix **เปลี่ยน**รูปแบบ lease → `arch` ออก revision ของสัญญา → `baan --sweep "<ชื่อฟิลด์/รูปแบบเดิม>"` หาผู้ใช้งาน (BE-005, BE-007, FE-001, ฝั่ง host) → impacted tests ทั้งหมด + L1 เฉพาะส่วนที่เปลี่ยนของ BE-004
4. SA-001, BE-001, DBA-* ไม่ต้องตรวจซ้ำ เพราะ ledger แสดงว่า hash และ oracle revision ไม่เปลี่ยน

### 8.4 กรณีจริง: slice gRPC logout ของ BE-006 (2026-10-26 → 2026-10-28)

| รอบ | รายงาน | ผล | จำนวนเคส |
|---|---|---|---|
| ตรวจแรก | `planning/check-088-grpc-001.md` | FAIL | 101 เคส (ผ่าน 80 / ตก 21) |
| rework 1 | `planning/check-089-grpc-r1-001.md` | FAIL | 150 assertions (ผ่าน 119 / ตก 31) |
| rework 2 | `planning/check-090-grpc-r2-001.md` | FAIL → NEEDS_HUMAN (ครบ 2 รอบ) | **2,222 ผ่าน / 12 ตก** |
| rework 3 | `planning/check-092-grpc-r3-001.md` | PASS | 2,234 / 0 |

ฝั่ง Gateway helper ก็มีลักษณะเดียวกัน: `check-089-gateway-001` ใช้ 1,795 assertions (ตก 3) → rework แล้วผ่านที่ 433 เคส

**ถ้าใช้ H ตามข้อ 5–6 จะต่างอย่างไร:**

| สิ่งที่เกิดจริง | ตามหลัก H |
|---|---|
| เคสโตจาก 101 → 150 → 2,234 ทุกรอบที่ตรวจซ้ำ | ตรวจซ้ำใช้แค่ **เคสที่ตก + suite เดิม** · เคสโจมตีเพิ่มได้ไม่เกิน 20 ต่อ task · finding ใหม่ที่ไม่เกี่ยวกับ fix ไปที่ backlog |
| ตกเพราะพฤติกรรมของ test host (header ซ้ำของ TestServer) | อาการที่เกิดเฉพาะใน test host และเข้าถึงไม่ได้ใน deployment จริง = PASS + backlog |
| ครบ 2 รอบแล้วพักไว้ "ท้ายวง" ตั้งแต่ 2026-10-26 | ถามคนทันทีพร้อมทางเลือก (รับ slice / ตัดขอบเขต / แก้อีกรอบ / ทิ้ง) |
| ผ่านแล้วแต่ลง `verified` ไม่ได้ เพราะไม่มี AC ผูก logout transport | Phase 0 บังคับผูก AC ก่อนเปิด task → ตรึง oracle ได้ตั้งแต่วันแรก |

ข้อ 1–3 ในคอลัมน์ขวาตอนนี้อยู่ใน BAAN แล้ว (กติกาข้อ 12 + `roles/check.md` หัวข้อ Bounded scope ตั้งแต่ 2026-10-28) ส่วนข้อ 4 ยังไม่มี

**ตัวอย่างการตรวจซ้ำที่แคบลงอย่างถูกต้อง:** `check-060-docs-review` รอบ 1 FAIL 4 กลุ่ม → รอบ 2 ตรวจ 16 จุด (ผ่าน 15) → รอบ 3 ตรวจ 3 จุดที่เหลือ เป็นรูปแบบที่ควรใช้กับงานโค้ดด้วย

---

## 9. Final Recommendation

| คำถาม | คำตอบ |
|---|---|
| มีประสิทธิภาพสูงสุด | **H (Risk-Gated Waves)** เพราะต้นทุนการตรวจขึ้นกับความเสี่ยง ไม่ใช่จำนวน task |
| ประหยัดเวลาและต้นทุนที่สุด | **ขึ้นกับเงื่อนไข**: bug น้อย + task อิสระ → A · กรณีทั่วไป → H ≈ B ≈ C+cache · ไม่มี pack → B |
| ลดความเสี่ยงได้ดีที่สุด | C+cache แต่แลกด้วยรอบตรวจที่เยอะ · H ได้ความเสี่ยงเกือบเท่ากันในส่วนที่สำคัญ |
| เหมาะกับ AI coding agents | **H**: agent ไม่มีความจำข้าม session (pack ช่วย) · ตรวจงานตัวเองแบบลำเอียง (ใช้ผู้ตรวจอิสระ) · recall ตกเมื่อ diff ใหญ่ (gate เล็กพอ) · ต่อยอดบนฐานพังอย่างมั่นใจ (ตรวจ task ฐานรากทันที) |
| เหมาะกับ task จำนวนมาก | **H** (หรือ B) |
| เลือก A เมื่อ | prototype/spike, ไม่เกิน 3–5 task, task อิสระ, test suite เดิมแข็งแรง, โค้ดทิ้งได้ |
| เลือก B เมื่อ | coupling ปานกลาง จับกลุ่มตาม module ได้ docs นิ่ง และยังไม่มีข้อมูลความเสี่ยงราย task |
| เลือก C เมื่อ | DAG ลึกเป็นสาย (แบบส่วนฐานของ school-bot), domain เสี่ยงสูง, task น้อย, codebase ไม่คุ้นเคย และต้องมี cache |
| **ถ้าเลือกได้ workflow เดียว** | **H** |

เหตุผลที่เลือก H:
- ไม่แพงที่สุดในทุกสถานการณ์ และต้นทุนแกว่งน้อยที่สุดเมื่อสมมติฐานผิด ตอนเริ่มโปรเจกต์เราไม่รู้ค่า p หรือ fan-out จริง
- **กับ school-bot H จะทำตัวเหมือน C ที่ฐานราก และเหมือน B ที่ปลายทาง** ซึ่งตรงกับรูปร่างของ DAG จริง

**สำหรับ school-bot โดยเฉพาะ เรียงตามผลต่อต้นทุน:**
1. ผูก AC ให้ 35 task ที่ยังว่าง → ตรึง oracle ได้ (ปลดล็อกทุกอย่างที่เหลือ)
2. ใช้ bounded check ตามกติกาข้อ 12 อย่างเคร่งครัด → ตัดต้นเหตุที่ทำให้เวลาตรวจ ≈ เวลาเขียนโค้ด
3. oracle pack ต่อ task → ลดส่วนเอกสาร 44%
4. จัด risk tier: L1 ทันทีที่ฐานราก/auth/schema · wave gate ที่ FE/QA/content

### ช่องว่างใน BAAN ถ้าจะใช้ H เต็มรูปแบบ

อัปเดต 2026-10-29: ช่องว่างทั้งหมดถูกปิดด้วยกติกาข้อ 13 ของ charter และ verification lint ใน `--lint-plan`

| ช่องว่างเดิม | ปิดด้วย |
|---|---|
| **risk tier ต่อ task** | ฟิลด์ `"risk": "high"\|"low"` ใน plan JSON · gm/plan เป็นคนกำหนด · lint เตือน task ฐานรากที่ยังไม่ระบุ |
| **verification gate ระดับ wave** | ฟิลด์ `"wave"` + wave gate (check ใบเดียวต่อ wave สำหรับ task low) ในกติกาข้อ 13 และ `roles/check.md` · lint error เมื่อ wave ย้อน dependency · **ไม่ทำใน `src/scheduler.mjs`** เพราะ run ของ `baan --goal` จบในตัว ส่วน wave ของ H กินหลาย run และมีประตูมนุษย์คั่น จึงเป็นงานของนายช่างตามแผนโปรเจกต์ |
| **verification ledger** | `"oracle"` (revision ที่ใช้ตัดสิน) + `"ref"` (commit ที่ตรวจ) บน task/slice ที่ verified · lint เตือนงาน verified ที่ไม่มี `oracle` · ไม่ทำ diff hash อัตโนมัติ เพราะ lint ไม่ได้เข้าถึง git ของ target |
| **oracle pack** | ไม่สร้างไฟล์ชนิดใหม่ ใช้หัวข้อ Acceptance/References ของ `<task-id>.md` ที่ gm มีอยู่แล้ว (AC ตามต้นฉบับ + revision + TP case ids + non-goals) |
| **เตือน task pending ที่ไม่มี `ac_ids`** | `--lint-plan` เตือนเป็นบรรทัดเดียว เรียงตามจำนวนงานที่พึ่ง |

ยังมีอยู่เหมือนเดิม: oracle ตรึงต่อ task · bounded check (≤20 เคสเพิ่ม) · เพดาน rework 2 รอบแล้วถามทันที · `done-local` · slice verdict · `baan --sweep` · check ใช้ slot ไม่เกินครึ่ง · ประตูผูกกับ task ที่ต่อของจริง
