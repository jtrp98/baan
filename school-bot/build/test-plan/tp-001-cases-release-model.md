# TP-001 — Release และแบบข้อมูล (TP001-046–TP001-050)

> แก้ล่าสุด 2026-11-02 · แก้โดย inspect · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

PF (Test Profile) คือสภาพแวดล้อมตรวจ และ E คือรหัสหลักฐาน ดู [ทางเข้า TP-001](tp-001.md#profiles), [รายละเอียด Profile](tp-001-profiles.md) และ [กลยุทธ์ transport](index.md#กลยุทธ์-transport)

<a id="tp001-046"></a>

## TP001-046 — POST /v2/admin/releases

AC: [AC-029-01 (สร้าง metadata ถูกต้องแล้ว published=false)](../../modules/app-shell/shared/requirements/req-029.md), [AC-029-02 (Version ผิดรูปแบบ, platform ไม่รองรับ, URL ไม่ใช่ HTTPS, hash ผิด หรือ…)](../../modules/app-shell/shared/requirements/req-029.md) · References: [DES-007 (Release และ trusted update)](../design/des-007.md) · Level: integration · Profiles: PF-API, PF-ADMIN

เงื่อนไขก่อนตรวจ: manifest valid; version 1.2/1.2.3.4/v1.2.3/ว่าง; platform ไม่รองรับ; URL http/มี userinfo/>2048; hash ยาวผิด/ไม่ใช่ hex; signature ว่าง/ผิด/kid ไม่รู้จัก; size 0; role ไม่ใช่ release_publisher

ขั้นตอน: POST /v2/admin/releases; ซ้ำ version/channel/platform; 2 requests พร้อมกัน; Idempotency-Key เดิม; inject signer/commit fail

ผลที่คาด: สร้างได้ published=false lifecycle draft; ซ้ำ→409 RELEASE_EXISTS (race เหลือหนึ่ง); invalid ทุกกรณี→ปฏิเสธ 400 INVALID_RELEASE/ARTIFACT; key เดิมคืน release เดิม; fail ไม่คืนสำเร็จ; role ไม่พอ→403; 201+ETag; publish/withdraw ใช้ If-Match (ขาด→428, ชน→412+details.current_etag); signer ตรวจ immutable trusted CI registry ก่อน sign (stub registry; ไม่มี artifact ใน registry→ปฏิเสธ ไม่ sign ของใหม่); role `release_publisher` รายบุคคล

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-047"></a>

## TP001-047 — GET /updates/check จาก version ต่าง ๆ

AC: [AC-029-03 (Update check คืนเฉพาะ published release ใหม่สุดที่ channel/platform…)](../../modules/app-shell/shared/requirements/req-029.md), [AC-030-01 (เมื่อไม่มี published release ใหม่กว่า ผลตรวจมี available=false,…)](../../modules/app-shell/shared/requirements/req-030.md) · References: DES-007 · Level: integration · Profiles: PF-API, PF-UNIT

เงื่อนไขก่อนตรวจ: releases: draft, published, withdrawn; versions 1.9.0/1.10.0/เท่ากัน; channel/platform ต่างกัน; Mac สอง platform records

ขั้นตอน: GET /updates/check จาก version ต่าง ๆ

ผลที่คาด: คืนเฉพาะ published ใหม่สุดที่ channel/platform ตรงและ version สูงกว่า (เทียบตัวเลข 1.10.0>1.9.0); ไม่คืน draft/withdrawn/เท่ากัน; ไม่มี→available=false release=null install_supported=false

หลักฐานที่ต้องเก็บ: E-API

ผลจริง: NOT_RUN

<a id="tp001-048"></a>

## TP001-048 — กดตรวจอัปเดต

AC: [AC-030-02 (เมื่อมี release ที่เข้าเงื่อนไข ผู้ใช้เห็น metadata…)](../../modules/app-shell/shared/requirements/req-030.md), [AC-030-03 (เมื่อ API เข้าไม่ได้ การตรวจแสดงข้อผิดพลาดและผู้ใช้กลับไปใช้งาน local…)](../../modules/app-shell/shared/requirements/req-030.md) · References: DES-007 · Level: integration · Profiles: PF-HOST, PF-API, PF-UI-WIN

เงื่อนไขก่อนตรวจ: มี release เข้าเงื่อนไข; API timeout/DNS fail/5xx; network+FS+process spy

ขั้นตอน: กดตรวจอัปเดต

ผลที่คาด: เห็น metadata เท่านั้น ไม่มีดาวน์โหลด/ติดตั้ง/execute (spy=0, ไม่เรียก PrepareUpdate/Install); API เข้าไม่ได้→ข้อผิดพลาดและใช้ local ต่อได้ภายใต้ License; การ check ยังเป็น metadata-only และ**ไม่ลงมือ Prepare/Install เองโดยอัตโนมัติ** — ปุ่ม "เตรียมอัปเดต" ปรากฏเฉพาะเมื่อผู้ใช้ขอ (explicit intent ตาม [BR-030-04 (การเตรียม/ติดตั้งอัปเดตเป็นคำสั่งแยกที่ผู้ใช้สั่งเอง (explicit intent) —…)](../../modules/app-shell/shared/requirements/req-030.md)) การ check อย่างเดียวต้องไม่ทำให้ staging มี artifact ([AC-030-04 (การเตรียมอัปเดตเริ่มเฉพาะเมื่อผู้ใช้สั่งเอง และตรวจ trust ครบ)](../../modules/app-shell/shared/requirements/req-030.md) ครึ่งแรก)

หลักฐานที่ต้องเก็บ: E-TRACE+E-UI

ผลจริง: NOT_RUN

<a id="tp001-049"></a>

## TP001-049 — ติดตั้ง MSI

AC: [AC-031-01 (บน Windows 11 25H2 x64 บัญชีทดสอบสะอาดที่มี WebView2 ติดตั้ง MSI…)](../../modules/app-shell/shared/requirements/req-031.md), [AC-031-02 (เมื่อไม่มี WebView2 มีขั้นตอนขอให้ติดตั้ง)](../../modules/app-shell/shared/requirements/req-031.md) · References: DES-007, [มติ 019 (มติ Windows 11 ตามข้อเสนอแรก)](../../shared/decisions/decisions-019.md) · Level: manual · Profiles: PF-INST-WIN

เงื่อนไขก่อนตรวจ: Win11 25H2 x64 บัญชีสะอาด; มี WebView2 / ไม่มี WebView2; PATH ไม่มี dev tools

ขั้นตอน: ติดตั้ง MSI; เปิดสาม mode และ engines ที่บรรจุ; ไม่มี WebView2 → ยกเลิกขั้นตอน

ผลที่คาด: เปิดสาม mode+engines ได้ไม่ต้องติดตั้งเครื่องมือพัฒนา; ไม่มี WebView2→มีขั้นตอนขอติดตั้ง; ยกเลิกแล้วไม่แสดงพร้อมใช้

หลักฐานที่ต้องเก็บ: E-INST+E-UI

ผลจริง: NOT_RUN

<a id="tp001-050"></a>

## TP001-050 — repair

AC: [AC-031-03 (ใน installation ทดสอบ ลบไฟล์ engine แล้ว repair คืนได้)](../../modules/app-shell/shared/requirements/req-031.md), [AC-031-04 (แพ็กเกจเวอร์ชันใหม่อัปเกรด installation ทดสอบได้ และแพ็กเกจเก่ากว่าไม่…)](../../modules/app-shell/shared/requirements/req-031.md) · References: DES-007 · Level: manual · Profiles: PF-INST-WIN

เงื่อนไขก่อนตรวจ: installation ทดสอบ; ลบไฟล์ engine; แพ็กเกจใหม่กว่า/เก่ากว่า; แอปเปิดอยู่ (files-in-use); Projects+Device identity

ขั้นตอน: repair; uninstall; upgrade; ติดตั้งเก่ากว่าทับ

ผลที่คาด: repair คืน engine; uninstall เก็บ Projects และ Device ID เดิม; อัปเกรดได้; เก่ากว่าไม่ downgrade; ไม่ kill process

หลักฐานที่ต้องเก็บ: E-INST

ผลจริง: NOT_RUN



## คำย่อ

API = Application Programming Interface · AC = Acceptance Criteria หรือเกณฑ์ตรวจรับ · DES = Design หรือสัญญาออกแบบ · BR = Business Rule หรือกฎธุรกิจ · CI = Continuous Integration
