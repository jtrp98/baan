# Git workflow — BAAN และ Knowledge

ปรับโครงสร้างวันที่ 2026-11-05: source ของ npm package ย้ายจาก `baan/` เป็น `framework/` ส่วน `knowledge/` นำเข้าด้วย Git subtree จาก `https://github.com/jtrp98/knowledge-sb.git` branch `main`

```text
baan/                         # origin: jtrp98/baan, branch dev/golf
├── .git/
├── framework/                # npm package BAAN
├── knowledge/                # tracked files ของ subtree ไม่มี .git ซ้อน
├── GIT_WORKFLOW.md
└── README.md
```

## เหตุผลที่เลือก subtree

| ประเด็น | Subtree ที่ใช้ | Submodule |
| --- | --- | --- |
| clone ปกติได้ไฟล์ครบ | ได้ | ต้อง initialize/update หรือใช้ --recurse-submodules |
| แก้ไฟล์ knowledge ใน project | commit ผ่าน Git หลัก แล้ว split/push เฉพาะ knowledge | commit ใน Git ของ submodule |
| พัฒนาแยกอิสระ | ใช้ clone ของ knowledge แยก แล้ว pull เข้ามา | ทำใน submodule ได้โดยตรง |
| ใช้ร่วมหลาย project | แต่ละ project pull/push remote เดียวกัน | แต่ละ project pin commit ของ submodule |
| ประวัติ | เก็บ commit เดิมครบและเชื่อมเข้ากราฟหลักตอน import | กราฟประวัติแยกจากกันทั้งหมด |

Subtree ไม่ใช่ nested Git repository จริง: `git -C knowledge status` จะอ่าน Git ของ BAAN และ `git -C knowledge push` จะ push BAAN จึงต้องใช้คำสั่ง subtree ด้านล่าง ถ้าต้องมี `.git` แยกใน `knowledge/` และแยกกราฟประวัติโดยสมบูรณ์ ต้องเลือก submodule พร้อมยอมใช้ recursive clone

การนำเข้าครั้งนี้ใช้ **full history ไม่ใช้ `--squash`** เพื่อรักษา commit ID เดิมและให้ clone ใหม่ split ได้โดยมีประวัติต้นทางครบ ไม่ rewrite/reset ประวัติเดิมของทั้งสอง repo ดูประวัติ BAAN โดยไม่ไล่เข้า parent ของ knowledge ด้วย `git log --first-parent` หรือดูเฉพาะ source ด้วย `git log -- framework`

อ้างอิง: [Git subtree manual](https://github.com/git/git/blob/master/contrib/subtree/git-subtree.adoc), [Git submodule manual](https://git-scm.com/docs/git-submodule)

## Clone และตั้งค่าครั้งแรก

```bash
git clone https://github.com/jtrp98/baan.git
cd baan
git status --short --branch
git remote -v
git remote add knowledge https://github.com/jtrp98/knowledge-sb.git
git fetch knowledge main
cd framework
npm link
npm test
```

Clone ปกติได้ทั้ง `framework/` และ `knowledge/` โดยไม่ต้อง clone เพิ่ม คำสั่งเพิ่ม remote/fetch จำเป็นเฉพาะผู้ที่จะ sync knowledge เพราะ Git ไม่ส่ง local remote config มากับ clone หากมี remote `knowledge` อยู่แล้ว ให้ตรวจ `git remote get-url knowledge` ว่าตรง URL ด้านบนก่อนใช้ และไม่ต้อง add ซ้ำ

Repository หลักใช้ default branch `dev/golf` การ clone จาก GitHub จะได้โครงสร้างนี้หลัง push commits ของการย้ายขึ้น `origin/dev/golf` แล้ว

## Commit และ pull/push BAAN

รันคำสั่ง Git จากราก repo และเลือก stage เฉพาะไฟล์ของงาน:

```bash
git status --short --branch
git pull --ff-only origin dev/golf
git add framework README.md GIT_WORKFLOW.md .gitignore
```

ก่อน commit ทุกครั้งให้รัน `npm test` จาก `framework/` และรอให้ผ่าน จากนั้นกลับราก repo:

```bash
git commit -m "ปรับ framework เพื่อให้ตรงพฤติกรรมที่ต้องการ"
git push origin dev/golf
```

ไม่ stage `knowledge/` ใน commit เดียวกับ source เพื่อให้ประวัติที่ split กลับ knowledge มีเฉพาะงานเอกสาร ตรวจ `git diff --cached --stat` ก่อน commit; package version ยังเป็นรุ่นเดิม การย้ายครั้งนี้ไม่ใช่ release

## Pull knowledge เข้า BAAN

เริ่มด้วย working tree/index สะอาด ตรวจสถานะและรัน tests จาก `framework/` ให้ผ่านก่อน เพราะ `subtree pull` อาจสร้าง merge commit แล้วรันจากราก repo:

```bash
git status --short --branch
git subtree pull --prefix=knowledge knowledge main -m "รับ knowledge ล่าสุดเพื่อให้เอกสารของ project ตรงกับส่วนกลาง"
git push origin dev/golf
```

ใช้รูปแบบ full history นี้ต่อเนื่อง ไม่เติม `--squash` ระหว่าง sync คำสั่งนี้เปลี่ยนเฉพาะ subtree และ merge history ที่เกี่ยวข้อง ไม่ส่ง source ใน `framework/` ไป knowledge

## แก้ knowledge ใน BAAN แล้ว sync กลับส่วนกลาง

แก้ `knowledge/` แล้วรัน tests จาก `framework/` ให้ผ่าน ก่อนกลับราก repo:

```bash
git status --short --branch
git add knowledge
git diff --cached --stat
git commit -m "ปรับ knowledge เพื่อบันทึกข้อกำหนดปัจจุบัน"
git subtree pull --prefix=knowledge knowledge main -m "รวม knowledge ส่วนกลางก่อนส่งการแก้ไขกลับ"
git subtree push --prefix=knowledge knowledge main
git push origin dev/golf
```

รัน tests ก่อน subtree pull ด้วยถ้าไม่ได้รันบนสถานะปัจจุบัน `subtree push` จะสร้างประวัติเฉพาะเนื้อหาใต้ `knowledge/` ที่มีรากเป็น README และโฟลเดอร์เอกสารของ knowledge แล้ว push ไป `knowledge-sb/main` โดยไม่ force

ถ้า remote ใช้ protected branch ให้ส่ง branch ใหม่แทน แล้วเปิด PR ใน knowledge repository:

```bash
git subtree push --prefix=knowledge knowledge knowledge-update
```

เมื่อ PR merge แล้วให้ subtree pull `main` กลับเข้า BAAN และ push BAAN ตามปกติ

## พัฒนา knowledge อย่างอิสระ

ใช้ repo เดิม `C:/src/schoolbright/knowledge` หรือ clone แยกไว้นอก BAAN:

```bash
git clone https://github.com/jtrp98/knowledge-sb.git knowledge-work
cd knowledge-work
git status --short --branch
git pull --ff-only origin main
git add <files>
git commit -m "ปรับเอกสารร่วมเพื่อให้หลาย project ใช้ข้อมูลเดียวกัน"
git push origin main
```

จากนั้นเข้า BAAN แล้วใช้ `git subtree pull --prefix=knowledge knowledge main` ตามหัวข้อก่อนหน้า Project อื่นที่ใช้ subtree เดียวกันก็ pull URL/branch นี้เช่นกัน แต่ละ project เก็บ snapshot ของตน การเปลี่ยนแปลงจึงไม่วิ่งอัตโนมัติจนกว่าจะ sync และ commit/push project นั้น

สำหรับ project ใหม่ เริ่มจาก Git repo ที่มี initial commit และ working tree สะอาด:

```bash
git remote add knowledge https://github.com/jtrp98/knowledge-sb.git
git subtree add --prefix=knowledge knowledge main -m "เพิ่ม knowledge ส่วนกลางเพื่อใช้ร่วมกับ project อื่น"
```

## Conflicts และ push ถูกปฏิเสธ

หาก subtree pull มี conflict ให้ตรวจ `git status`, แก้ไฟล์ที่ขัดกัน, `git add <files>` แล้วรัน tests จาก `framework/` ให้ผ่านก่อน `git commit` เพื่อจบ merge จากนั้นตรวจ diff และ push ตามปกติ หากยังไม่พร้อมแก้ ใช้ `git merge --abort` เฉพาะ merge ที่กำลังทำอยู่ ไม่ reset หรือ force push

หาก push knowledge ถูกปฏิเสธเพราะมี commit ใหม่บนส่วนกลาง ให้ pull/แก้ conflict/test/commit ก่อน แล้ว push ใหม่ ไม่ใช้ `--force` และไม่เปลี่ยน URL ของ `origin`

## Snapshot ที่นำเข้าครั้งแรกและข้อมูลสำรอง

BAAN ก่อนย้ายอยู่ที่ `878c2f0ffc04b13b464530b0776458b48c8cae1f` ส่วน knowledge ต้นทางอยู่ที่ `50e455ef619a82d870e2d86dc7bb29b83902a2d6` บน `main` ซึ่งนำหน้า remote ขณะตรวจ 8 commits (`origin/main` คือ `b701995219438e15ea944916c2aec5dcf09e5800`)

ผู้ใช้ยืนยันให้นำเข้าไฟล์แก้ค้างทั้ง 18 ไฟล์ด้วย ระหว่างเตรียมงาน session อื่นได้ commit/push ไฟล์เหล่านี้เป็น `67e9f66af05f30a2df76f230d2d845a5535d8a78` แล้ว จึงตรวจ tree ของ snapshot เทียบกับ commit นี้ว่าตรงกันทุกไฟล์ และนำเข้า commit เดิมโดยตรง (tree `c55b5e8823e1ccfb5c22f50d5c4ec0ad0321b98b`) รวมทั้ง 8 commits ก่อนหน้า ไม่สร้าง commit ซ้ำหรือ commit/stash/reset ใน `C:/src/schoolbright/knowledge`

สำรองก่อนย้ายที่ `.release/git-structure-20261105/` (ถูก ignore):

- `baan-before.bundle` เก็บ refs และประวัติเดิมของ BAAN
- `knowledge-source/` เป็นสำเนาเต็มของ knowledge รวม `.git`, index และ working tree ที่แก้ค้าง
- `knowledge-before.bundle` เก็บประวัติและ refs ของ knowledge ก่อน snapshot
- `knowledge-working.patch` เก็บ diff แบบ binary เทียบ HEAD
- `knowledge-import/` เป็นสำเนาสำหรับตรวจ snapshot เทียบ commit ที่นำเข้า
- `*-before.txt` และไฟล์นำทาง local เก็บสถานะ/HEAD/remotes ก่อนย้าย

สำรองเหล่านี้อยู่เฉพาะเครื่องนี้ ไม่ติด clone และไม่ควร commit เพราะมีข้อมูล local เมื่อต้องตรวจ backup ให้ clone bundle ไป directory ใหม่ ไม่ restore ทับ repo ที่กำลังทำงาน

หลัง commit จาก session อื่น repo ต้นทางเดิมสะอาดและ `main` ตรงกับ `origin/main` แล้ว การนำเข้าครั้งนี้จึงใช้ commit เดียวกับส่วนกลาง การแก้ไขในอนาคตใช้ workflow ปกติด้านบน

## ผลต่อเครื่องเดิมหลังย้าย source

คำสั่งทดสอบ/ติดตั้งใช้ `cd framework` แทน `cd baan` และรัน `npm link` ใหม่หากเคย link จากตำแหน่งเดิม Workspace config/ไฟล์นำทางภายนอก repo ที่อ้าง path package เดิมต้องชี้ `framework/` และรัน `baan --init --workspace <workspace>` ตามปกติ การย้ายนี้ไม่แก้ config ใน workspace อื่น

`reports/`, `.release/` และข้อมูล local ที่ถูก ignore ในโฟลเดอร์ `baan/` เดิมยังอยู่ที่เดิม จึงอาจเห็นโฟลเดอร์ `baan/` เพิ่มบนเครื่องเดิม แต่ clone ใหม่มี source ใน `framework/` เท่านั้น ไม่ย้าย/ลบ run history

BAAN `--commit` ออกแบบให้ทำงานกับ knowledge/memory ที่มี Git repo ของตนเอง จึงใช้ repo ต้นทางแยกสำหรับคำสั่งนั้น ส่วน `knowledge/` ที่เป็น subtree ให้ commit/sync ด้วย Git ตามคู่มือนี้

## ตรวจ clone และ subtree

หลัง commit แล้วสามารถทดสอบใน directory ใหม่:

```bash
git clone <path-to-this-repo> <new-validation-directory>
git -C <new-validation-directory> status --short
git -C <new-validation-directory> ls-tree HEAD framework knowledge
git -C <new-validation-directory> subtree split --prefix=knowledge
```

ต้องมี tree ทั้งสองโฟลเดอร์และไม่มี gitlink mode `160000` จากนั้นรัน `npm test` ใน `framework/` ของ clone นั้น การทดสอบ local clone ยืนยันเนื้อหาที่ commit แล้ว ส่วนการ clone URL บน GitHub จะได้ข้อมูลใหม่หลัง push เท่านั้น
