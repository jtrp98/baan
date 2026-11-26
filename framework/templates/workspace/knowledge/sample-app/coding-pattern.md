# Coding Pattern: sample-app

## Layering & Rules
- แยก HTTP/UI handler ออกจาก business service และ data access
- ใช้ explicit error handling ไม่กลืน exception โดยไม่มี log/rethrow
- ทุกฟีเจอร์ต้องมี unit/integration test ตรงตาม Acceptance Criteria
