import { transitiveFanOut } from "./plan.mjs";

export const needsPlanning = (p) => !!p.needs_planning || !!p.contracts?.length || (p.budget?.expected_minutes ?? 0) > 120;

export function verification(p, packages = []) {
  const text = [p.goal, p.title, ...(p.risk_tags ?? [])].join(" ");
  if (p.kind === "docs") {
    const isCritical = p.risk === "high" || (p.contracts?.length ?? 0) > 0 || /adr|contract|security|auth|pii|password|token|สิทธิ์|สัญญาร่วม|สถาปัตยกรรม|database|schema/i.test(text);
    return isCritical ? ["acceptance"] : [];
  }
  const lenses = new Set();
  if (p.kind === "bugfix") lenses.add("acceptance");
  if (/auth|security|pii|password|token|สิทธิ์|ข้อมูลส่วนบุคคล/i.test(text)) lenses.add("security");
  if (/schema|migration|database|ฐานข้อมูล/i.test(text)) lenses.add("db");
  const fanout = transitiveFanOut(packages.map((p) => ({ id: p.id, dependsOn: p.depends_on ?? [] }))).get(p.id) ?? 0;
  const needs = p.risk === "high" || lenses.size > 0 || /money|payment|score|grade|เงิน|คะแนน|public.contract/i.test(text)
    || fanout >= Math.max(1, Math.ceil(packages.length / 4)) || p.milestone || p.release
    || p.result?.test_changes?.length > 0 || p.gate?.test_changes?.length > 0 || p.gate?.unmapped?.length > 0;
  if (needs && !lenses.size) lenses.add("acceptance");
  return [...lenses];
}
export function triage(packages, direct = false) {
  const repositories = new Set(packages.map((p) => p.repo.path));
  const parallel = repositories.size > 1 && packages.filter((p) => (p.budget?.expected_minutes ?? 0) >= 30).length >= 2;
  const simple = packages.length === 1 && !packages[0].needs_planning && !(packages[0].contracts?.length) && (packages[0].budget?.expected_minutes ?? 0) <= 120;
  return { mode: (direct || simple) && packages.length === 1 ? "direct" : parallel ? "parallel" : "planned", needsPlanning: !direct && packages.some(needsPlanning),
    answers: { packages: packages.length, repositories: repositories.size, parallelWorthwhile: parallel } };
}
