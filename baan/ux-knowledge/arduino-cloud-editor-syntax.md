---
topic: Arduino Cloud Editor · smart syntax (สี + autocomplete + วงเล็บ)
updated: 2026-10-29
source: ทดสอบจริงบน https://app.arduino.cc/sketches/81fa38ae-d33c-479d-b805-ec5b748cc565 (สเก็ตช์ทดสอบที่ผู้ใช้ให้ · Chrome macOS · 2026-10-29) อ่านสีด้วย getComputedStyle และอ่านรายการแนะนำจาก DOM · ส่วนที่มาจากเอกสาร @uxsa (อ่านโค้ด JS ของหน้า) ติดป้าย [uxsa]
used_by: Designer, Reviewer, Feasibility (งานตัวแก้โค้ด เช่น block-lab โหมดโค้ด)
rule: ไฟล์นี้เก็บเฉพาะสิ่งที่พบใน Arduino จริง ไม่มีข้อเสนอหรือความเห็น · การนำไปใช้ให้ผู้ใช้ตัดสินและบันทึกใน OQ ของ module
---

# Arduino Cloud Editor: smart syntax (ข้อเท็จจริงที่พบ)

ป้าย: **[ทดสอบ]** = เห็นเองจากการพิมพ์/อ่าน DOM · **[uxsa]** = จากเอกสาร @uxsa ที่อ่านโค้ดของหน้า ยังไม่ได้ตรวจซ้ำ · **[คำนวณ]** = คำนวณจากค่าที่วัดได้

## AS1 ตัวแก้โค้ด

- CodeMirror 6 (`.cm-editor`) [ทดสอบ]
- ฟอนต์ Roboto Mono 12px · ไม่มีตัวหนาในโค้ดเลย (font-weight 400 ทุกคำ) [ทดสอบ]
- มีระบบแนะนำ 2 ระบบ: รายการคำ (ทำงาน) และ LSP + clangd (มีโค้ดแต่ปิด `isLspEnabled` = false) [uxsa]

## AS2 สีตามกลุ่มคำ [ทดสอบ]

| สิ่งที่พิมพ์ | class ที่พบ | สี | คอนทราสต์บนขาว [คำนวณ] |
|---|---|---|---|
| `int` `void` | ไวยากรณ์ | teal #00979D | 3.55 |
| `if` | ไวยากรณ์ | เขียวมะกอก #728E00 | 3.76 |
| `String` | `kw-type` | teal #00979D | 3.55 |
| `OUTPUT` `HIGH` | `kw-literal` | teal #00979D | 3.55 |
| `setup` `loop` `pinMode` `delay` | `kw-hints` | เขียวมะกอก #728E00 | 3.76 |
| `println` `write` (หลังจุด) | `kw-hints` | เขียวมะกอก #728E00 | 3.76 |
| `Serial` `Servo` | `kw-builtin` | ส้ม #D35400 | 4.17 |
| `Delay(` (สะกดผิด) · `myFunc(` (ฟังก์ชันที่ผู้ใช้ตั้ง) | ไวยากรณ์ (การเรียก) | ส้ม #D35400 | 4.17 |
| ตัวเลข `5` `90` | ไวยากรณ์ | #8A7B52 | 4.17 |
| ข้อความ `"hi"` | ไวยากรณ์ | teal เข้ม #005C5F | 7.79 |
| คอมเมนต์ `// c` `/* */` | ไวยากรณ์ | เทา #7F8C8D | 3.48 |
| ตัวแปร `x` `t` `s` · เครื่องหมาย | ไวยากรณ์ | ดำ #171E21 | 16.88 |

ข้อเท็จจริงที่ตามมา [ทดสอบ]:
- สีจากพจนานุกรม (`kw-*`) ทับสีตามไวยากรณ์
- `Delay(` (สะกดผิด) กับ `myFunc(` (ชื่อที่ผู้ใช้ตั้ง) ได้สีเดียวกับ `Serial` · ไม่มีอะไรบอกว่าสะกดผิด
- ชื่อเปล่าที่ไม่ได้เรียก (`x`, `myVar`) เป็นดำ
- `if` เป็นสีเดียวกับฟังก์ชัน Arduino ส่วน `int` เป็นสีเดียวกับค่าคงที่
- ไม่มีการแจ้งข้อผิดพลาดระหว่างพิมพ์

## AS3 รายการคำ [uxsa]

`ARDUINO_KEYWORDS` 356 คำ 4 กลุ่ม: `hints` 278 (ฟังก์ชัน/เมธอด) · `builtIn` 55 (คลาส/ไลบรารี) · `literal` 19 (ค่าคงที่) · `type` 4 (boolean, byte, word, String) · ใช้ทั้งแนะนำและลงสี (regex `\b(...)\b`) · รายการเดียวทุกบอร์ด

## AS4 autocomplete [ทดสอบ]

- ขึ้นเองหลังพิมพ์ตัวอักษรตัวแรก (ต้องพิมพ์ทีละตัว) ใต้เคอร์เซอร์
- ส่วนที่ตรงเป็นตัวหนาสี teal · ท้ายแถวมีป้ายกลุ่มตัวเอียงสีเทา (`hints` / `builtIn` / `type`) · แถวที่เลือกพื้น teal อ่อน · หน้าแถวมีไอคอนหลอดไฟ
- เรียงตามตัวอักษร · Enter หรือ Tab = ใส่คำที่เลือก **ไม่ใส่ `()` ให้**
- ผลที่ได้จริง:

| พิมพ์ | ผล |
|---|---|
| `s` | 35 คำ: scanNetworks, scrollDisplayLeft, scrollDisplayRight, seek, sendAnalog, sendDigitalPortPair, sendDigitalPorts, sendString, sendSysex, serialEvent, setBand, setBitOrder, setClockDivider, setCursor, setDataMode, setDNS, setFirmwareVersion, setMode, setPINUsed, setSpeed, setTextSize, setTimeout, setup, shiftIn, shiftOut, shutdown, sin, size, sqrt, startLoop, step, stop, stroke, subnetMask, switchPIN |
| `a` | 14 คำ: abs, addParameter, analogRead, analogReadResolution, analogReference, analogWrite, analogWriteResolution, answerCall, attach, attached, attachGPRS, attachInterrupt, autoscroll, available |
| `b` | 20 คำ: background, beep, begin, beginPacket, beginSD, beginSMS, beginSpeaker, beginTFT, beginTransmission, beginWrite, bit, bitClear, bitRead, bitSet, bitWrite, blink, blinkVersion, boolean `type`, buffer, byte `type` |
| `i` | 8 คำ: image, interrupts, isActionDone, isDirectory, isListening, isPIN, isPressed, isValid (ไม่มี `int` `if`) |
| `Ser` | Serial, Server, Servo (`builtIn`) |
| `Dig` | ไม่มี (แยกตัวพิมพ์เล็ก-ใหญ่) |
| `dW` | ไม่มี (ไม่จับแบบ fuzzy) |
| `Serial.` / `Serial.p` | ไม่มี |
| `Servo s; s.a` | ไม่มี |
| `// dig` | digitalRead, digitalWrite (แนะนำในคอมเมนต์) |
| `dig` | digitalRead, digitalWrite |

- ไม่มี keyword C/C++ ในรายการแนะนำ · ไม่แนะนำตัวแปรที่ผู้ใช้ตั้ง · ไม่มีคำอธิบายหรือพารามิเตอร์
- มีตารางเมธอดหลังจุดเฉพาะ `Bridge` (เช่น `Bridge.pro` → provide, provide_safe) [uxsa]
- แนะนำในข้อความ `"dig` ด้วย [uxsa]

## AS5 วงเล็บและเครื่องหมายคู่ [ทดสอบ]

| พิมพ์ | ผล |
|---|---|
| `(` | `()` เคอร์เซอร์อยู่กลาง |
| `)` เมื่อตัวถัดไปคือ `)` | ข้ามไป ไม่ซ้อน |
| `{` | `{}` เคอร์เซอร์อยู่กลาง |
| `[` | `[]` |
| `"` | `""` |
| `'` | `''` |
| Enter ระหว่าง `{}` | แตกเป็น 3 บรรทัด เยื้องบรรทัดกลาง ตัวปิดอยู่บรรทัดล่าง |
| Backspace ในคู่ว่าง `()` / `{}` | ลบแค่ตัวเปิด เหลือตัวปิด (ทดสอบผ่านเครื่องมืออัตโนมัติ ผลอาจต่างจากการกดจริง) |

## AS6 ระบบ LSP ถ้าเปิด [uxsa]

ส่ง `didChange` + `completion` ไป clangd · มี snippet ช่องพารามิเตอร์, คำอธิบาย, เพิ่ม `#include`, signature help, hover, diagnostics สด, rename, go to definition · ต้องมี server

## AS7 keyword C/C++ และผลเพิ่ม [ทดสอบ]

ทดสอบ 2026-10-29 บน sketch `27731eb5-…` (Chrome Windows · พิมพ์ด้วยเครื่องมืออัตโนมัติ · อ่านสีด้วย getComputedStyle · font-weight 400 ทุกคำ ตรงกับ AS1)

| สิ่งที่พิมพ์ | class | สี |
|---|---|---|
| `for` `while` `else` `return` `switch` `break` `#include` | ไวยากรณ์ | เขียวมะกอก #728E00 (rgb 114,142,0) |
| `true` `false` | `kw-literal` | เทา #7F8C8D (rgb 127,140,141) · ต่างจาก `HIGH`/`OUTPUT` (teal) ใน AS2 |
| `long` `float` `char` `unsigned` | ไวยากรณ์ | teal #00979D (rgb 0,151,157) |

- ไม่มีตัวหนาและไม่มีตัวเอียงในโค้ดเลย
- Backspace ในคู่ว่าง `()` ลบแค่ตัวเปิด เหลือ `)` (ตรงกับ AS5 ซ้ำ)
- พิมพ์ `don't` ในคอมเมนต์ `// don't set`: ไม่เติม `'` คู่ให้หลังตัวอักษร
- พิมพ์ `// don't set` แล้วกด Enter: ขึ้นบรรทัดใหม่ ไม่ใส่คำจากรายการ (ไม่พบรายการแนะนำตอนอ่าน DOM · ต่างจากแถว `// dig` ใน AS4 ที่เคยแนะนำในคอมเมนต์ · ยังไม่ทราบสาเหตุ อาจเพราะพิมพ์ไวหรือเพราะเป็นคำ `set` หลัง `'`)
- สีที่ได้ไม่ตรงกับตาราง AS2 บางแถวตามที่เดา: `true`/`false` เป็นเทา ไม่ใช่ teal

## ที่ยังไม่ได้ตรวจ

การแจ้งข้อผิดพลาดตอน Verify (ต้องมี Cloud Agent) · สีของ `#include <...>` ทั้งบรรทัด · hover บนคำ (ชี้แล้วไม่มี tooltip ในการทดสอบครั้งแรก) · Backspace ในคู่วงเล็บด้วยการกดจริง · Enter ตอนรายการแนะนำขึ้นในคอมเมนต์ (ผล AS4 กับ AS7 ไม่ตรงกัน)
