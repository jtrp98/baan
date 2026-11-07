# 🚀 คู่มือเริ่มต้นใช้งาน BAAN (Getting Started)

คู่มือนี้สำหรับทุกบทบาทในทีม ไม่ว่าจะเป็น **Developer**, **Product Manager (PM)**, **QA**, หรือ **UX/UI Designer** ที่ต้องการเริ่มต้นใช้งานระบบ BAAN ร่วมกับ Knowledge Base (เช่น `knowledge-sb`) ในโฟลเดอร์งานใหม่ หรือทำงานประจำวันใน workspace ปัจจุบัน

---

## 1. ภาพรวมสถาปัตยกรรม

ระบบแบ่งออกเป็น 2 ส่วนหลักที่ทำงานร่วมกัน:
1. **BAAN (`jtrp98/baan`):** ตัวเครื่องมือ CLI ("นายช่าง") ที่เป็นศูนย์กลางควบคุมทีม AI พร้อม 8 บทบาท:
   - **ทีมสร้าง:** `spec` (BA), `arch` (SA), `pm` (นายงาน), `build` (Dev), `check` (QA)
   - **ทีมออกแบบ:** `survey` (สำรวจหน้าจอ), `ui` (ออกแบบหน้าจอ), `review` (ตรวจแบบหน้าจอ)
2. **Knowledge Base (เช่น `jtrp98/knowledge-sb`):** คลังความรู้ สเปกหน้าจอ (Wireframe/Specs), กฎเกณฑ์ทางธุรกิจ, Data Schema, และ Design System ที่ทุกคนในทีมเข้าถึงร่วมกัน

---

## 2. เริ่มต้นในโฟลเดอร์ใหม่ (`folder x`)

เมื่อคุณเปิดโฟลเดอร์งานใหม่ (`folder x`) ผ่าน AI CLI ตัวใดก็ได้:
- **Claude Code** (`claude`)
- **OpenAI Codex CLI** (`codex`)
- **Google Antigravity** (`agy`)

### 🌟 วิธีที่ 1: สั่งผ่าน AI แชทด้วย "Golden Prompt" (ง่ายที่สุด)
ก๊อปปี้ข้อความนี้ไปวางในช่องแชทของ AI ได้ทันที:

```markdown
ช่วยติดตั้ง BAAN และเชื่อมต่อ knowledge ให้พร้อมใช้งานในโฟลเดอร์นี้:
1. ตรวจสอบว่าเครื่องนี้มีคำสั่ง baan หรือยัง (where baan / which baan)
   - ถ้ายังไม่มี ให้ clone https://github.com/jtrp98/baan ไปไว้ที่ ~/.baan แล้วรัน npm link ในโฟลเดอร์ framework
2. รัน baan --init --knowledge-git https://github.com/jtrp98/knowledge-sb ในโฟลเดอร์นี้
3. ตรวจสอบความพร้อมและสรุปบทบาททีม (spec, arch, pm, build, check, survey, ui, review) ให้ทราบ
```

AI จะตรวจสอบเครื่อง ติดตั้ง CLI อัตโนมัติ (หากยังไม่มี), โคลน knowledge, วางโครงสร้าง agent stubs และสร้าง `CLAUDE.md` / `AGENTS.md` ให้พร้อมเริ่มงานทันที!

---

### 💻 วิธีที่ 2: ติดตั้งผ่าน Terminal ด้วยตนเอง

หากต้องการติดตั้งเองผ่าน Terminal ก่อนเปิด AI:

```bash
# ขั้นตอนที่ 1: ติดตั้ง BAAN CLI ลงเครื่อง (ทำครั้งแรกครั้งเดียวของเครื่อง)
git clone https://github.com/jtrp98/baan.git ~/.baan
cd ~/.baan/framework
npm link

# ตรวจสอบการติดตั้ง
baan --version

# ขั้นตอนที่ 2: เริ่มต้นโปรเจกต์ใน folder x
cd /path/to/folder-x
baan --init --knowledge-git https://github.com/jtrp98/knowledge-sb
```

---

## 3. การทำงานประจำวันใน Workspace (เช่น `schoolbright`)

สำหรับทุกคนในทีม โดยเฉพาะ **UX/UI Designer** หรือผู้ที่ไม่ถนัดคำสั่ง Git (`push`, `pull`, `rebase`, `conflict`):
**คุณไม่ต้องพิมพ์คำสั่ง Git เองอีกต่อไป!**

### 💬 คำสั่งพูดในแชทที่สั่ง AI ได้ทันที

เมื่อเปิด AI ใน workspace ที่ติดตั้งไว้แล้ว (เช่น `C:\src\schoolbright`):

| สิ่งที่ต้องการทำ | สิ่งที่พิมพ์บอก AI ในแชท |
|---|---|
| **เริ่มงานตอนเช้า / ดึงงานล่าสุด** | *"ซิงค์"* หรือ *"ดึงอันล่าสุดลงมา"* |
| **ออกแบบหน้าจอเสร็จ / ส่งงานขึ้น GitHub** | *"ส่งงานขึ้น github ให้ด้วย"* หรือ *"ซิงค์"* |
| **ดึงความรู้อย่างเดียว ไม่ส่งงานขึ้น** | *"ดึงความรู้อย่างเดียว"* |
| **ตรวจดูว่ามีอะไรใหม่ไหม** | *"ตรวจดูว่ามีอัปเดตไหม"* |

---

### ⚙️ สิ่งที่ `baan sync` จัดการให้เบื้องหลัง

เมื่อคุณสั่ง *"ซิงค์"* ระบบจะเรียกคำสั่ง `baan sync` ซึ่งจะทำขั้นตอนอัตโนมัติ:

1. **BAAN Self-Update:** ตรวจสอบว่าตัวแม่ BAAN มีเวอร์ชันใหม่หรือไม่ หากมี จะสั่ง `git pull` + `npm link` อัปเกรดตัวเองเป็นรุ่นล่าสุดให้อัตโนมัติ
2. **Refresh Agent Stubs:** ปรับปรุงไฟล์ `.claude/agents/*.md`, skills, `CLAUDE.md`, และ `AGENTS.md` ใน workspace ให้ตรงกับ BAAN รุ่นล่าสุด
3. **Safe Auto-Commit:** หากทีม UX/UI มีการเขียนสเปกหน้าจอหรือแก้เอกสารค้างไว้ใน `knowledge/` ระบบจะจัดกลุ่มและ commit ให้อัตโนมัติด้วยชื่อที่สวยงาม เช่น `school-bot/ui: add student-card.md`
4. **Pull & Rebase:** ดึงความรู้ล่าสุดจากเพื่อนร่วมทีมด้วย `git pull --rebase --autostash` ป้องกันปัญหา merge conflict
5. **Push Remote:** ส่ง commit ขึ้น GitHub ทันทีเพื่อให้เพื่อนร่วมทีมเห็นงาน
6. **Auto-Index:** รีเฟรช `knowledge-index.json` ทำให้ AI ค้นหาเอกสารและหน้าจอใหม่เจอทันที

---

## 4. ตัวเลือกเพิ่มเติมของคำสั่ง `baan sync` (Terminal)

หากต้องการรันผ่าน Terminal เองโดยตรง:

```bash
# ซิงค์ครบวงจร (Self-update + Knowledge auto-commit + Pull + Push + Re-index)
baan sync

# ดึงข้อมูลอย่างเดียว ไม่ push
baan sync --pull-only

# จำลองการทำงาน ตรวจสอบไฟล์ค้างโดยยังไม่ commit หรือ pull
baan sync --dry-run

# ซิงค์เฉพาะ knowledge โดยไม่อัปเดตตัวแม่ BAAN
baan sync --no-self-update
```
