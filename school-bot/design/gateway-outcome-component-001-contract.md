# Gateway outcome component — Callable API และที่วาง

> Rev 1 · แก้ล่าสุด 2026-11-02 · แก้โดย arch · ขอโดย ผู้ใช้ (เรียบเรียงตามกติกาเอกสารใหม่ ความหมายไม่เปลี่ยน)

ส่วนต่อของ [Gateway outcome component](gateway-outcome-component-001.md) ส่วนนี้อธิบายCallable API และที่วาง อ่านต่อเนื่องตามลำดับในไฟล์ทางเข้า.

Component นี้ decode และ normalize ผล Login ฝั่ง web เป็น API ภายใน solution ใช้ร่วม [Desktop login adapter](desktop-login-adapter-001.md) และไม่สร้าง identity/session. สถานะอยู่ที่ [index](index.md).

## Callable API และที่วาง

namespace SchoolBot.Infrastructure.Authentication; ทุก type ต่อไปนี้เป็น public CLR เพื่อเรียกข้าม assembly ภายใน solution ไม่ใช่ public HTTP DTO.

`public static GatewayOutcome Decode(GatewaySourceKind sourceKind, GatewayOperation operation, GatewayStage stage, int httpStatus, ReadOnlySpan<byte> utf8Json)` บน static class GatewayOutcomeDecoder.

Enums: GatewaySourceKind={Web,Mobile}; GatewayOperation={Login,FirstPassword,TwoFactorSend,TwoFactorVerify,ContactSend,ContactVerify}; GatewayStage={Initial,PasswordChange,TwoFactor,Contact}; GatewayOutcomeKind={Rejected,PasswordChange,TwoFactor,Contact,Sent,TerminalCandidate}. กำหนดค่าตามลำดับเริ่ม0; enum นอกชุดไม่ยอมรับ.

GatewayOutcome เป็น sealed class, constructor ไม่ public, properties get-only: Kind:GatewayOutcomeKind, SourceKind:GatewaySourceKind, NextStage:GatewayStage?, Token:GatewaySecret?, ChangeToken:GatewaySecret?, ChallengeToken:GatewaySecret?, TrustedDeviceToken:GatewaySecret?, ExpiresAt:DateTimeOffset?, Ref:string?, Masked:string?, ResendAfterSeconds:int?, Failure:GatewayFailure?. ไม่คืน raw JSON, user, claims, roles, channels หรือ missing.

GatewayFailure เป็น sealed class มี Status:int และ Code:string เท่านั้น. Code อยู่ในชุด INVALID_INPUT/UNAUTHORIZED/FORBIDDEN/RATE_LIMITED/AUTH_UNAVAILABLE. ไม่มี upstream message/details/requestId หรือ exception ในผลลัพธ์. Rejected มี Failure และ field payload ทุกตัวเป็น null; outcome อื่น Failure=null. ทุก field ที่ไม่ได้ระบุในตาราง outcome ต้อง null.

GatewaySecret เป็น sealed IDisposable, private byte[] เก็บ UTF-8 ของค่าหลัง JSON unescape; internal constructor. API `int ByteLength { get; }`, `int CopyTo(Span<byte> destination)`, `void Dispose()`. CopyTo คืนจำนวน bytes; destination เล็กไปโยน ArgumentException โดยไม่คัดลอกบางส่วน; หลัง dispose ทั้ง ByteLength/CopyTo โยน ObjectDisposedException. Dispose idempotent และ zero buffer. ไม่มี getter string/byte[]/implicit conversion. GatewayOutcome.Dispose() dispose secret ทั้งหมดและทำซ้ำได้. ToString ของ outcome คืนเฉพาะ Kind; secret คืน [REDACTED]. ใส่ System.Text.Json converters ที่ Read/Write โยน NotSupportedException สำหรับ outcome/secret เพื่อกัน accidental serialization. ไม่ใช้ record ที่พิมพ์ properties อัตโนมัติ. ห้าม log rawbody/secret/ref/masked; ไม่มี logger ใน component. Caller เป็นเจ้าของ input buffer และสำเนาจาก CopyTo; ต้องล้างเมื่อใช้จบ. ไม่อ้าง zeroization ของ managed parser/string ทั้งหมด.

วาง GatewayOutcomeDecoder.cs, GatewayOutcome.cs, GatewaySecret.cs ใต้ web/src/SchoolBot.Infrastructure/Authentication/ และ GatewayOutcomeDecoderTests.cs ใต้ web/tests/SchoolBot.Tests/. ไม่แก้ Program/DI/Application/Domain หรือเพิ่ม package.
