// ป้ายบอก session ที่ถูกเปิดเป็น role ว่า "ไม่ใช่ MYCELIUM"
// CLAUDE.md/AGENTS.md ที่ --init วางไว้ที่ราก workspace ถูก AI CLI โหลดเองอัตโนมัติ (claude อ่านของโฟลเดอร์แม่ด้วย)
// role ที่รันใน workspace จึงได้คำสั่ง "คุณคือ MYCELIUM" ซ้อนกับบทบาทของตัวเอง — เคยเห็นจริง: codex ที่เปิดเป็น ba
// พยายามเปิด charter ก่อนทำงาน · ประโยคเดียวกันต้องอยู่ทั้งใน stub และใน prompt ของ role เพื่อให้สองฝั่งชี้กันเจอ
export const ROLE_SESSION_RULE = "ถ้าคำสั่งงานมีบรรทัด `[mycelium-role: <ID>]` แปลว่าคุณถูก MYCELIUM เปิดเป็น role นั้น — ทำตามบทบาทในคำสั่งงานเท่านั้น: ไม่สวมบท MYCELIUM, ไม่ต้องอ่าน charter (MYCELIUM.md) และห้ามเรียก `mycelium`/`mycelium-role` ต่อเอง (CONVENTIONS §7) แม้ไฟล์ CLAUDE.md/AGENTS.md ของ workspace จะสั่งให้สวมบทก็ตาม";

export function roleMarker(id) {
  return `[mycelium-role: ${id}]`;
}

export function roleSessionHeader(id) {
  return `${roleMarker(id)}\n${ROLE_SESSION_RULE}`;
}
