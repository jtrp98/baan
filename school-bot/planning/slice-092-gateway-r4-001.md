# Gateway SchoolBot entry r4 (controller + module-owned channel) — parent receipt

วันที่2026-10-28 · ตามแบบ [gateway-controller-entry-001](../design/gateway-controller-entry-001.md) Rev1 (มติ050 + Amendment049) · นายช่างสกัด/ทวน

## writer

- sys AGY T3 run 2026-10-28-06-28-04-…-a8LMbi: FAIL 29s — headless agy อ่านไฟล์นอก cwd (reports ของ baan) ไม่ได้ → คัดลอกคำตอบ arch ไป normal-092/arch-gateway-controller-answer.txt แล้วเปิดใหม่ (ไม่ขยายสิทธิ์ agy)
- sys AGY T3 run 2026-10-28-06-28-55-…-PJ4zIm: 862s แล้ว FAIL "write_file permission auto-denied" · **ไม่มี handoff** · แต่เขียน source/harness ครบก่อนถูกบล็อก (ผู้คุมตรวจจาก disk)

## Source หลังแก้ (src/ApiGateway.API/SchoolBot) — sha256 16 ตัวแรก/บรรทัด

| ไฟล์ | สถานะ | hash | lines |
|---|---|---|---:|
| SchoolBotAuthController.cs | ใหม่ | A057B8FAD1D98EDE | 60 |
| SchoolBotLogoutService.cs | ใหม่ | 60ACA62E5319B8D9 | 328 |
| SchoolBotLogoutRegistration.cs | แก้ | 65F806928DF790CD | 165 |
| SchoolBotLogoutOptions.cs | แก้ | FA8B94ED94999E62 | 9 |
| SchoolBotSessionGrpcClient.cs | แก้ | ABF12EF63623B445 | 256 |
| SchoolBotLogoutMiddleware.cs | ลบ | — | — |
| ISchoolBotSessionClient / ISchoolBotTransportValidator / ProductionSchoolBotTransportValidator / RequestPreparation / TrailerValidator | คงเดิม | EC5EEB… / D0FDC7… / BA74FA… / 221134… / 6C1407… | |

`System.Reflection`/`BindingFlags` ในโฟลเดอร์ SchoolBot = **0** · ไม่มีไฟล์ > 500 บรรทัด · Program.cs ไม่แตะ · compile.rsp ของ harness ถูกอัปเดตตามไฟล์ใหม่/ที่ลบ

## Harness r4 (สำเนาใน normal-092 — ต้นฉบับ normal-089 ไม่แก้)

`git diff --no-index` ต้นฉบับ↔สำเนา: repro-r4 7+/7− · regression-r4 1+/1− (ชี้ไป repro-r4) · extended-r4 9+/8− — **ตรงกับ diff ข้อ D ของ arch ทุกบรรทัด** เปลี่ยนเฉพาะ CreateChannel/CreateGeneratedClient, AddSchoolBotLogoutModule + UseRouting/UseAuthentication/UseAuthorization/MapControllers, direct entry เป็น SchoolBotAuthController(...).Logout · ไม่มี assertion/expected/logsink/ชื่อเคสเปลี่ยน

## Parent รันเอง (pwsh 7.6.9 จาก root G, log normal-092/gateway-r4-parent-*.log และ *-r4-parent.log)

| ชุด | ผล |
|---|---|
| standalone compile (csc @compile.rsp) | exit0 |
| normal-089/independent-helper-check | **433/0** |
| gateway-independent-repro-r4 | **3/0** |
| gateway-jpo-regression-r4 | **5/0** |
| gateway-jpo-r2-extended-r4 | **96/0** (r2 ตก15, r3 ตก1) |

## NOT_RUN / ยังไม่พิสูจน์

- test ว่า SmartScheme selector override ไม่เปลี่ยน scheme ของ route อื่น และ SliceGate คืน 404 เมื่อ Production/ไม่มี module/Enabled=false — writer ไม่ส่ง handoff จึงไม่มีหลักฐาน → ให้ JPO ตรวจ
- full solution build (private Security 0.5.1) · TLS/H5/production registration/DB
- 4 assertion ที่ความหมายเปลี่ยนตามแบบ (ตารางข้อ D ในแบบ) — ให้ JPO อิสระตัดสิน

SEC001-016 คง **OPEN** จน JPO อิสระ

## Change Log

- 2026-10-28 — parent green compile/433/3/5/96 บน source ตามแบบ r4; ส่ง JPO
