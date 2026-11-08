import { readFileSync, writeFileSync } from "node:fs";

// Build reverse byte mapping: Character -> original byte (0x00-0xFF)
// Recovers UTF-8 bytes that were decoded as CP874 / Windows-874 + CP1252 ANSI
const charToByte = new Map();

for (let b = 0; b <= 0x7f; b++) charToByte.set(String.fromCharCode(b), b);
for (let b = 0xa1; b <= 0xfb; b++) charToByte.set(String.fromCharCode(b - 0xa0 + 0x0e00), b);
charToByte.set("\u00a0", 0xa0);

const win874Known = {
  "\u20ac": 0x80, "\u2026": 0x85, "\u2018": 0x91, "\u2019": 0x92,
  "\u201c": 0x93, "\u201d": 0x94, "\u2022": 0x95, "\u2013": 0x96, "\u2014": 0x97,
};
for (const [ch, b] of Object.entries(win874Known)) charToByte.set(ch, b);

const win1252Extra = {
  "\u201a": 0x82, "\u0192": 0x83, "\u201e": 0x84, "\u2020": 0x86, "\u2021": 0x87,
  "\u02c6": 0x88, "\u2030": 0x89, "\u0160": 0x8a, "\u2039": 0x8b, "\u0152": 0x8c,
  "\u017d": 0x8e, "\u02dc": 0x98, "\u2122": 0x99, "\u0161": 0x9a, "\u203a": 0x9b,
  "\u0153": 0x9c, "\u017e": 0x9e, "\u0178": 0x9f,
};
for (const [ch, b] of Object.entries(win1252Extra)) charToByte.set(ch, b);

// Direct control characters 0x80-0x9F if not mapped
for (let b = 0x80; b <= 0x9f; b++) {
  const ch = String.fromCharCode(b);
  if (!charToByte.has(ch)) charToByte.set(ch, b);
}

// Characteristic patterns of UTF-8 Thai bytes (0xE0 0xB8 / 0xE0 0xB9) misread as CP874
const MOJIBAKE_THAI_PATTERN = /(?:เธ[ก-ฮ\x80-\x9f\u0100-\u2150]|เน[ก-ฮ\x80-\x9f\u0100-\u2150])/;

export function detectMojibake(text) {
  if (typeof text !== "string" || !text) return false;
  const matches = text.match(new RegExp(MOJIBAKE_THAI_PATTERN, "g"));
  return Boolean(matches && matches.length >= 3);
}

export function repairMojibake(text) {
  if (typeof text !== "string") return text;
  const bytes = [];
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (charToByte.has(ch)) {
      bytes.push(charToByte.get(ch));
    } else {
      throw new Error(`อักขระที่ไม่รู้จักสำหรับการถอดรหัส Mojibake: '${ch}' (U+${ch.charCodeAt(0).toString(16).toUpperCase()}) ที่ตำแหน่ง ${i}`);
    }
  }
  const decoded = Buffer.from(bytes).toString("utf8");
  if (decoded.includes("\uFFFD") && !text.includes("\uFFFD")) {
    throw new Error("ผลการถอดรหัสมีอักขระเสีย (U+FFFD) — ข้อมูลอาจไม่ใช่ Mojibake รูปแบบ CP874");
  }
  return decoded;
}

export function repairFile(filePath, { write = false, dryRun = false, indent = 2 } = {}) {
  const raw = readFileSync(filePath, "utf8");
  const isBOM = raw.charCodeAt(0) === 0xfeff;
  const cleanInput = isBOM ? raw.slice(1) : raw;

  const isMojibake = detectMojibake(cleanInput);
  if (!isMojibake) {
    return {
      file: filePath,
      ok: true,
      modified: false,
      message: "ไม่พบข้อความ Mojibake ในไฟล์",
    };
  }

  const repaired = repairMojibake(cleanInput);

  let formatted = repaired;
  if (filePath.endsWith(".json")) {
    try {
      const parsed = JSON.parse(repaired);
      formatted = JSON.stringify(parsed, null, indent) + "\n";
    } catch (err) {
      throw new Error(`ไฟล์ JSON ไม่ถูกต้องหลังถอดรหัส: ${err.message}`);
    }
  }

  if (write && !dryRun) {
    writeFileSync(filePath, formatted, "utf8");
  }

  return {
    file: filePath,
    ok: true,
    modified: true,
    dryRun,
    originalLength: cleanInput.length,
    repairedLength: formatted.length,
    message: dryRun ? "ตรวจพบและถอดรหัสได้เรียบร้อย (dry-run ไม่ได้เขียนไฟล์)" : "ซ่อมแซมและบันทึกไฟล์เรียบร้อย",
  };
}
