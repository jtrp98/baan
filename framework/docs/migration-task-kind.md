# คู่มือการกำหนด kind (code / docs) และการระบุ worker_tier ใน BAAN

> เริ่มใช้ในเวอร์ชัน 0.32.0 · เพื่อความโปร่งใสและการบริหารต้นทุนของ AI Model อย่างคุ้มค่า

---

## 1. ที่มาและเป้าหมาย

ในการพัฒนาซอฟต์แวร์ด้วย BAAN ลักษณะงานแบ่งออกเป็น 2 กลุ่มที่มีพฤติกรรมและต้นทุนความเสี่ยงต่างกันอย่างสิ้นเชิง:

1. **งาน Code (`kind: "code"`)**:
   - สร้าง/แก้โค้ดและชุดทดสอบอัตโนมัติ
   - ต้องผ่าน Machine Gates (Build, Test, Diff outside owns) และ Verifier
   - มีความเสี่ยงเรื่อง **Rework Penalty** สูง (ถ้าใช้โมเดล Tier ต่ำเกินไปแล้วงานตก จะเสียทั้งเวลาคิว writer และ verifier)
2. **งาน Docs (`kind: "docs"`)**:
   - วิเคราะห์ วางแผน สถาปัตยกรรม (ADR), Requirements, สัญญา (Contracts), Handoff
   - มักทำผ่าน **3-Step Workflow** (โมเดลตัวหลักคิด Outline ร่วมกับผู้ใช้ แล้วให้ Subagent ตัวเบาพิมพ์เอกสารยาว)
   - ไม่มีความเสี่ยงเรื่อง compiler break และแก้ข้อความได้ง่าย

---

## 2. รูปแบบฟิลด์ในใบงาน (Packet / Tasks.json)

```json
{
  "id": "WP-DOC-1",
  "title": "ออกแบบ Architecture & DB Schema",
  "kind": "docs",
  "worker_tier": "t4",
  "tier": "t1",
  "risk": "high",
  "contracts": [{"ref": "shared/contracts/api.md"}]
}
```

```json
{
  "id": "WP-DEV-1",
  "title": "เขียน Endpoint คำนวณยอดเงิน",
  "kind": "code",
  "tier": "t2",
  "worker_tier": "t3",
  "risk": "low",
  "contracts": [{"ref": "shared/contracts/api.md"}]
}
```

---

## 3. กติกาของระบบ (Rules & Constraints)

### 3.1 สำหรับงาน Docs (`kind: "docs"`)
- **การเลือก Worker Tier**:
  - อนุญาตให้ Worker ใช้โมเดล Tier ต่ำ (`worker_tier: "t4"` หรือ `"t5"`) ได้อย่างอิสระ แม้ตัวแผนจะใช้ Tier สูง (`tier: "t1"` หรือ `"t2"`)
  - เหมาะอย่างยิ่งสำหรับการให้ Subagent เป็น Writer พิมพ์เอกสารยาว
- **Hybrid Verification Policy**:
  - **เอกสารทั่วไป**: ข้าม LLM Verifier อัตโนมัติ และตรวจผ่านด้วย `baan --lint-knowledge` + มนุษย์เซ็นอนุมัติ (`decide --approve`)
  - **เอกสารระดับวิกฤต** (`risk: "high"`, มี `contracts`, หรือเกี่ยวกับ ADR/Security/Auth/DB Schema): Core จะส่ง LLM Verifier ค่ายคู่ขนานเข้าตรวจทานเนื้อหาเสมอ

### 3.2 สำหรับงาน Code (`kind: "code"`)
- **Strict High-Risk Guard**:
  - งานที่เป็น `risk: "high"` **ห้าม** ตั้ง `worker_tier` ต่ำกว่า `t2` (หากตั้ง t3–t5 ระบบจะแจ้งเตือนและปรับกลับเป็น t2 เพื่อความปลอดภัย)
- **Contract-Gated Step-down**:
  - อนุญาตให้ Step-down (เช่น `tier: "t2"` -> `worker_tier: "t3"`) ได้เฉพาะงานที่เป็น `risk: "low"` หรือ `"medium"` **และต้องมี `contracts` หรือสเปกที่ pin ชัดเจน** กำกับไว้เท่านั้น

---

## 4. แนวทางการ Migrate แผนงานเดิม (Backward Compatibility)

1. **หากใบงานเดิมไม่ได้ระบุ `kind`**:
   - ระบบจะอนุมานอัตโนมัติจากบทบาท (`role`):
     - `build`, `sys`, `front` -> ถือเป็น `kind: "code"`
     - `spec`, `arch`, `pm`, `survey`, `ui`, `review`, `check` -> ถือเป็น `kind: "docs"`
2. **การอัปเกรดแผนงานเดิมให้โปร่งใส**:
   - เพิ่ม `"kind": "code"` หรือ `"kind": "docs"` ในทุก task/packet ของแผน
   - สำหรับงานพัฒนาโค้ดตามแบบที่มีสเปกนิ่งแล้ว สามารถระบุ `"worker_tier": "t3"` ร่วมกับ `"contracts"` เพื่อประหยัด Token ได้ทันที
