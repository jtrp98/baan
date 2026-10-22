# SchoolBot — PM output/render protocol

## Output protocol — PM เป็นเจ้าของเนื้อหา MYCELIUM บันทึกเชิงกล

บทบาท read-only ไม่เขียนไฟล์ ให้ตอบ JSON object เดียวใน fenced json แล้ว handoff สั้น+state. เพื่อไม่ต้องพิมพ์ 74 ใบงานซ้ำ ให้ใช้ adoption/render contract นี้ (เป็นการรับเนื้อหาเดิมโดย PM ชัดเจน ไม่มอบให้ผู้คุมแต่งแผน):

```
{
  "adoption": "คำรับ proposal โดย PM และข้อจำกัดชัดเจน",
  "source": "planning/tasks-001.json",
  "task_overrides": {"SA-001": {"goal": "...", "depends_on": [], "gate_ids": [], "...existing source fields only...": "..."}},
  "additional_tasks": [],
  "gates": ["full canonical gate objects id/description/refs/close_evidence"],
  "task_template": {
    "Goal": "ข้อความใช้ {goal} และ metadata {id} {owner} {tier} {phase} {effort_days}",
    "References": "{req_refs}\n{ac_ids}\n{des_refs}",
    "Scope": "PM wording using {goal} / {outputs} and source fields",
    "Out of Scope": "PM wording bounded to task and charter",
    "Expected Output": "{outputs}",
    "Acceptance": "{acceptance}",
    "Dependencies": "{dependencies}\n{gate_refs}",
    "Handoff": "PM wording using {owner} and evidence; no self-verdict"
  },
  "task_sections": {"SA-001": {"Scope": "optional full section override incl clarification"}},
  "files": [{"path":"plan/index.md", "content":"EXACT markdown"}, {"path":"plan/gates-001.md", "content":"..."}, {"path":"plan/dispatch-001.md", "content":"..."}, {"path":"backlog.md", "content":"..."}],
  "first_wave": ["..."],
  "handoff": "...",
  "state": "DONE or NEEDS_HUMAN"
}
```

- Omit overrides not needed; override objects shallow-merge original task field values, do not delete original IDs. additional_tasks source schema same Planner. PM explicitly adopts all unoverridden source fields as canonical
- task_template 8 exact keys, rendered per task with markdown title, dated Change Log automatically added verbatim rule `2026-10-21 — PM รับจาก Planner; MYCELIUM บันทึกตาม adoption/render contract`
- Renderer allowed placeholders ONLY: id,owner,tier,phase,effort_days,goal,req_refs,ac_ids,des_refs,outputs,acceptance,dependencies,gate_refs. References rendered links to ../requirement/req-NNN.md and ../design/des-NNN.md; AC IDs text; outputs bullet list; dependencies links task-ID.md; gate_refs gate IDs+plan/gates-001.md link; missing arrays rendered `ไม่มีรายการในข้อเสนอ; ตรวจตามเอกสารอ้างอิงและขอบเขตงานนี้` ไม่มีการเติมเนื้อหาเอง
- task_sections optional per-task overrides use same placeholders. Canonical task JSON mechanically merged from adopted source + PM overrides + status pending, stored plan/tasks-001.json. No root-authored product decisions
- files exact markdown by PM: index Release Scope/Waiting on Human/phases/table Task|Name|Owner|Phase|Depends|Status (all74rows pending); gates/dispatch support; backlog append-only with BL-NNN only if real finding. Keep each markdown ~4–10KiB by short table names and split detail; task files can be shorter. If required index exceeds budget, keep table and split scope/gates details
- preserve all 31 REQ/109 AC associations. Include concrete acceptance/evidence/next-role route in template or task_sections. No empty task templates. Paths relative knowledge root, only plan/** and backlog.md
- No extra massive prose outside JSON. PM state may NEEDS_HUMAN for downstream gates without blocking creation of complete reviewable plan. Handoff starts Waiting on Human, then ready tasks, then findings

## Change Log

- 2026-10-21 — แยก protocol จาก task-004 หลัง PM ส่งผล รักษา brief เดิมและลดขนาดใบงาน
