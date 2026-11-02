# รายละเอียดความปลอดภัยและเงื่อนไขการแก้

> แก้ล่าสุด 2026-11-02 · แก้โดย jpo · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

TTL คือ Time to Live หรือระยะเวลาที่อนุญาตให้เก็บหรือใช้; JWS คือ JSON Web Signature; RC คือ Release Candidate.

ข้อสังเกตเดิมคงความหมายตามวันที่ตรวจ; สถานะปัจจุบันรวมผลตรวจต่อมาของข้อนั้น.

## SEC001-003 — ห่วงโซ่ update trust ยังไม่มี: signature ไม่ถูก verify, ไม่มี origin allowlist, ไม่มี withdraw หรือ audit และยังไม่มีหลักฐาน signing ของ installer จริง

**สถานะปัจจุบัน:** เปิด · Important. แบบ [Manifest signer และ publisher pin](design/release-trust-001.md) และ [DES-007 (Release และ trusted update)](design/des-007.md) Rev3 รวมเงื่อนไข mitigation แล้ว ยังต้องพิสูจน์สิทธิ์ registry/custody, pin จริง, negative tests และ Release Candidate (RC) จริง. Four-eyes ที่ API เป็นทางเลือกเมื่อครบเงื่อนไขควบคุม; การแยกผู้ควบคุมที่มีความหมายอยู่ที่ CI protected environment.

ลักษณะข้อค้นพบ: planned_gap. ข้อสังเกตและผลกระทบต่อไปนี้มาจากการตรวจ 2026-10-23.

ผลกระทบ: ณ วันที่ตรวจครั้งแรกยังไม่เปิดช่องโจมตีเพราะ host ไม่ดาวน์โหลดหรือรันอะไร (install_supported=false). แต่ถ้าเพิ่ม PrepareUpdate/InstallPreparedUpdate ก่อนปิดช่องนี้ ผู้ถือ admin key ใส่ URL https ใดก็ได้ที่ผ่านการตรวจแค่รูปแบบแล้วให้เครื่องนักเรียนรัน installer นั้นได้. build macOS ที่มีตอนนี้เป็น ad-hoc signed

วิธีแก้: ห้ามเปิดดาวน์โหลด/ติดตั้งจนมีครบ: manifest ลงนาม ES256 + trust root ฝังใน host (แยก key จาก license), hash ของ artifact หลัง signing/notarization, verify ซ้ำก่อนส่งให้ OS installer จาก staging ที่ป้องกัน, origin allowlist และไม่ตาม cross-origin redirect, ปฏิเสธ version ≤ ที่ติดตั้งและ manifest หมดอายุ, publish ผ่านบัญชีรายบุคคลพร้อม audit และ evidence_ref; four-eyes เป็นทางเลือกเมื่อครบเงื่อนไขควบคุม, มี withdraw, Windows Authenticode และ macOS Developer ID + notarization ก่อนแจกจริง

ผู้รับ: be (ร่วม sa สำหรับ disposition ตาม [SA-001 (Contracts/update)](plan/index.md))

การตรวจซ้ำ: jpo re-audit บน source จริง: manifest ปลอม, hash ไม่ตรง, signature ผิด, kid ไม่รู้จัก, redirect ข้าม origin, version ย้อนหลัง และ release ที่ withdraw ต้องไม่ถูก execute. ตรวจ signature ของ RC จริงใน [SEC-002 (RC Security)](plan/index.md)

เงื่อนไขลดความเสี่ยงและปิดข้อค้นพบ: เหตุผลของ arch มีช่อง: JWS+hash ไม่อิสระจากเส้นทาง publish เพราะ DES-007 ให้ trusted release signer ลงนาม manifest_input ที่ผู้ดูแลส่ง (url+sha256) ผู้ถือ release_publisher หรือ API ที่ถูกยึดจึงได้ manifest ลงนามถูกต้องของ artifact ใดก็ได้ ตัวตรวจที่อิสระจริงคือ OS publisher signature (DES-007) จึงต้อง pin ตัวตนผู้เผยแพร่ ลายเซ็นที่ถูกต้องของใครก็ได้ไม่พอ เมื่อครบเงื่อนไขบังคับในแบบ Manifest signer และ publisher pin แล้ว four-eyes เป็น optional และ release_publisher รายบุคคล+audit+evidence_ref เป็น baseline พอ (four-eyes ที่มีความหมายอยู่ที่ CI protected environment ไม่ใช่ที่ API) [มติ 025 (auth ข้ามระบบ, admin โรงเรียน, publish, สอบซ่อม และ Desktop)](requirement/decisions-025.md) นโยบายเผยแพร่หลักสูตรและคลังข้อสอบ ครอบเฉพาะหลักสูตร/คลังข้อสอบ ถ้าจะขยายต้องให้ผู้ใช้ตัดสินนโยบายธุรกิจ สถานะยังเปิด Important จนแก้และตรวจซ้ำ

ข้อมูลที่ยังต้องระบุ: product owner (ผู้ตัดสินนโยบายธุรกิจ) ยืนยันว่าคงสัญญา 'release_publisher คนเดียว' หรือขยาย นโยบายเผยแพร่หลักสูตรและคลังข้อสอบ ให้ครอบ release และระบุผู้ถือสิทธิ์ signing ของ OS cert

## ยังไม่ยืนยัน

ข้อมูลที่ยังต้องพิสูจน์ระบุในสถานะปัจจุบันและวิธีตรวจซ้ำของแต่ละข้อ. การแก้แบบยังไม่ยืนยัน implementation; ตัวเลข TTL/limit เดิมยังต้องยืนยัน ยกเว้น replay 15 นาทีตาม [มติ 046 (อนุมัติ replay License 15 นาที)](requirement/decisions-046.md).

## หลักฐาน

- ต้นฉบับ mitigation อ้างเงื่อนไข MUST-1..4; แบบ release-trust-001 และ DES-007 Rev3 รวมเงื่อนไขแล้วตามผลตรวจ 2026-10-24.

- SEC001-003: ManagementService.cs:74-97; DesktopRelease.cs:35-42; Program.cs:85-89,120; scripts/build-desktop.sh:95-104; knowledge/school-bot/design/des-007.md:33-48
- งานที่รับข้อค้นพบนี้: BE-018, BE-019, BE-022, DBA-006, SA-001
- planning/security-mitigation-001.md (memory)
- planning/security-gap-sync-review-001.md (memory)
- DES-007:37 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- DES-007:48 (ตำแหน่งที่ผล mitigation เดิมอ้าง)
- ข้อสังเกตเดิม DES-007:33 กับ :37 ระบุผู้ลงนามไม่ตรงกัน; ผลตรวจ 2026-10-24 ระบุว่า release-trust-001 และ DES-007 Rev3 ฝังเงื่อนไข mitigation แล้ว โดยยังไม่ปิด finding.
