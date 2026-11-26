---
name: code-review
description: Use to review code, PRs, or branch diffs independently without trusting the author's narrative — dispatches parallel read-only audit lenses (correctness, security/auth/multi-tenant, DB/concurrency, coding pattern) and reports file:line findings.
metadata:
  author: baan
  version: "1.0.0"
  argument-hint: "[target-repo | branch | diff-scope]"
---

# 🔎 `code-review` — ตรวจโค้ดแบบอิสระหลายมิติ (Zero Shared-Assumption Bias)

รักษามาตรฐานการตรวจรับอิสระของ BAAN: ตัดสินจาก diff, โค้ดจริง, contracts และ test logs เท่านั้น ห้ามเชื่อคำอธิบายของคนเขียนโค้ด

## ขั้นตอนปฏิบัติ (Antigravity-Native)

1. **Read-Only Isolation**:
   - ห้ามแก้ไขโค้ดในระหว่างรีวิว อ่านเฉพาะ `git diff`, ไฟล์ที่เปลี่ยนเต็มไฟล์รอบจุดที่แก้, contracts และ `<project>/coding-pattern.md`
   - ห้ามรับคำอธิบายหรือข้ออ้างของคนทำเป็นหลักฐาน — หากถูกเรียกต่อจาก `verify-before-done` ให้รับเฉพาะ AC, contracts, diff และ path เท่านั้น
2. **Parallel Audit Lenses (ใช้ `run_workflow` หรือ `invoke_subagent` สำหรับงานหลายไฟล์/ความเสี่ยงสูง)**:
   แบ่งตรวจขนานกัน 4 มุมมอง:
   - **Lens A — Correctness & Edge Cases**: ครบทุก AC หรือไม่? มี off-by-one, null/empty, invalid state transition หรือ silent fallback หรือไม่?
   - **Lens B — Security, Auth & Multi-Tenant**: input validation, injection, privilege escalation, PII leak, school/tenant scoping
   - **Lens C — DB, Concurrency & Idempotency**: race condition, missing transaction/lock, N+1 query, retry duplication, resource leak
   - **Lens D — Pattern & Maintainability**: ตรง `<project>/coding-pattern.md` หรือไม่? มี logic ซ้ำซ้อนหรือ unrelated refactor นอกขอบเขตหรือไม่?
3. **รูปแบบรายงาน (Zero Sycophancy)**:
   - แยกตามระดับความรุนแรง: `Critical` · `High` · `Medium` · `Low`
   - ทุกประเด็นต้องระบุ **`file:line`**, พฤติกรรมที่ผิดพลาด/ความเสี่ยง, หลักฐานจากโค้ดจริง, และแนวทางแก้ที่ชัดเจน
   - หากมีเทสต์ที่ยังไม่ครอบคลุมจุดเสี่ยง ให้ระบุเป็น adversarial test case ที่ต้องเพิ่ม
   - ห้ามรายงานว่า "ผ่าน" ถ้ายังไม่ได้ตรวจหลักฐานไฟล์หรือผลทดสอบจริง
