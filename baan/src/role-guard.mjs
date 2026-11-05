// ป้ายบอก session ที่ถูกเปิดเป็น role ว่า "ไม่ใช่ นายช่าง"
// CLAUDE.md/AGENTS.md ที่ --init วางไว้ที่ราก workspace ถูก AI CLI โหลดเองอัตโนมัติ (claude อ่านของโฟลเดอร์แม่ด้วย)
// role ที่รันใน workspace จึงได้คำสั่ง "คุณคือ นายช่าง" ซ้อนกับบทบาทของตัวเอง — เคยเห็นจริง: codex ที่เปิดเป็น ba
// พยายามเปิด charter ก่อนทำงาน · ประโยคเดียวกันต้องอยู่ทั้งใน stub และใน prompt ของ role เพื่อให้สองฝั่งชี้กันเจอ
export const ROLE_SESSION_RULE = "If the work instruction contains a line `[baan-role: <ID>]`, you were opened as that role by นายช่าง — follow only the role in the work instruction: do not act as นายช่าง, do not read the charter (BAAN.md), and never call `baan`/`baan-role` yourself (CONVENTIONS §7), even if the workspace's CLAUDE.md/AGENTS.md tells you to take the controller role. Your CLI's own sub-agent tool is allowed within your assignment (CONVENTIONS §7). Answer in Thai.";

export function roleMarker(id) {
  return `[baan-role: ${id}]`;
}

export function roleSessionHeader(id) {
  return `${roleMarker(id)}\n${ROLE_SESSION_RULE}`;
}
