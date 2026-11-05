import path from "node:path";
import { TEAM_DIR, memoryRootOf } from "./config.mjs";
import { qualify, uxKnowledgeDirs } from "./knowledge-index.mjs";

export function moduleContext(mods) {
  const write = mods.map((m) => `${m.project.name}/${m.module} — ${m.dir}`);
  const projects = [...new Map(mods.map((m) => [m.project.name, m.project])).values()];
  const deps = [...new Set(mods.flatMap((m) => m.dependsOn.map((d) => qualify(d, m.project.name))))]
    .filter((d) => !mods.some((m) => `${m.project.name}/${m.module}` === d));
  const kr = mods[0].knowledgeRoot;
  return [
    `- งานนี้ทำใน module: ${mods.map((m) => `${m.project.name}/${m.module}`).join(" + ")}${mods.length > 1 ? " (ข้าม module)" : ""}`,
    `- เอกสารของ module (อ่าน): ${write.join(" · ")} · เขียนได้เฉพาะ owns ของ packet; context นี้ไม่ขยายสิทธิ์เขียน knowledge/memory`,
    `- อ่านได้: ${projects.map((p) => path.join(p.dir, "shared")).join(" · ")}${deps.length ? ` · module ที่พึ่ง (อ่านอย่างเดียว): ${deps.join(", ")}` : ""}`,
    "- ต้องแก้ module อื่นนอกจากนี้ = ห้ามแก้เอง เปิด OQ ที่ <project>/shared/oq.md แล้วรายงานกลับ",
    `- ความรู้ UX ตามแพลตฟอร์ม (${mods.map((m) => `${m.module}: ${[m.platform || "ไม่ระบุ", ...m.os].join("/")}`).join(" · ")}): ${[...new Set(mods.flatMap((m) => uxKnowledgeDirs(TEAM_DIR, m.platform, m.os)))].join(" · ")}`,
    `- แผนของ project: ${projects.map((p) => path.join(p.dir, "build", "plan")).join(" · ")} — หยิบเฉพาะ task ที่ช่อง module ตรงกับงานนี้`,
    ...(memoryRootOf(kr) ? [`- memory ของ module: ${mods.map((m) => path.join(memoryRootOf(kr), m.project.name, m.module)).join(" · ")}${mods.length > 1 ? ` · ของข้าม module: ${path.join(memoryRootOf(kr), mods[0].project.name, "_cross")}` : ""}`] : []),
  ].join("\n");
}
