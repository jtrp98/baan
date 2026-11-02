# sb-compass — Security Audit (DEV workspace, three-repo mode)

Workspace: `C:\src\sb-web-student` (`role: dev`) · Knowledge root (read-only):
`C:\src\schoolbright-knowledge` · Contract source:
`<knowledge>/_docs/module/sb-compass/design.md` (`## Premium Entitlement Rules`,
`## Identity & Scope Rules`, DES-005/DES-006, `### Module B … Security Considerations`)
+ `plan.md` Phase 2 + `requirement.md` REQ-013/014/015.

**Written here, not at the repo root**, per CLAUDE.md ("nothing is written at the repo
root") and matching the sibling `review.md` written by `qa-engineer` in this workspace.

**Scope of Round 1**: the uncommitted Phase 2 (Module B) work in the working tree —
`Helper/InternalNetworkAccessGuard.cs` (new), `Controllers/Api/CompassApiController.cs`
lines 290-314 and 640-755, `ClassOnlineWeb.csproj` line 331. Audited against the real
files on disk, not the implementer's report.

**Scope of Round 2 (re-audit, 2026-09-02)**: the claimed fixes for SEC-01 / SEC-02 /
SEC-03 and the "investigated, not fixed" conclusion on SEC-04. Both helper files are
**untracked**, so `git diff` shows nothing for them — read in full from disk
(`Helper/InternalNetworkAccessGuard.cs`, `Helper/CsrfHeaderGuard.cs`), together with the
real `git diff` of `CompassApiController.cs` / `ClassOnlineWeb.csproj`, `Web.config`,
`App_Start/WebApiConfig.cs`, `Global.asax.cs`, `packages.config` and
`Helper/ApiAuthenticateAttribute.cs`. The implementer's reasoning was treated as a
hypothesis and each of its three premises tested independently.

**Scope of Round 3 (re-audit, 2026-09-02)**: the claimed fix for **SEC-08** (trusted-peer
check + fallback correction) and the "left unfixed, no sink" position on **SEC-09**.
`Helper/InternalNetworkAccessGuard.cs` is now **staged** (`git status` → `AM`), so
`git diff -- ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs` does show the working-tree
edit; I read the whole file from disk anyway. This round adds a mechanical oracle the first
two rounds did not have, at two levels of confidence:

1. **The real project build.** `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build
   -p:Configuration=Debug` — the actual project, actual references, actual NuGet packages —
   **exits 1 with exactly one error** (`-clp:ErrorsOnly` reports a single line). That error
   is in this round's edit. Read-only: `-t:Build` compiles, and nothing was deployed,
   migrated or installed.
2. **Isolated compile + a control.** The file was also compiled alone against the real .NET
   Framework 4.8 reference assemblies with the same Roslyn `csc.exe` that MSBuild drives
   (`…/Microsoft Visual Studio/2022/Community/MSBuild/Current/Bin/Roslyn/csc.exe`), at
   `-langversion:7.3`, `9.0` and `latest` — the same error every time. The **Round-2 version
   of the same file**, extracted from the git index (`git show :ClassOnlineWeb/Helper/…`),
   compiles **clean** under identical flags. So the error is attributable to this round's
   edit and not to the harness, the framework version or the language version.

Also re-checked from the real code: `MatchesEntry`/`IsInRange` for divergence between the
allowlist and trusted-proxy paths, the `CompassApiController` verb/CSRF guards for
SEC-01/02/03 regression, `git diff --stat` for the true blast radius of this round, every
`.config` in the tree for both keys, every `X-Forwarded-For` / `UserHostAddress` reader in
the app, and (for SEC-09) every trace-listener and logging-framework hook in the tree.

**Prior-attempt note.** An earlier Round-3 pass was interrupted by a rate limit and left
this file partially amended — the Open Findings table and this Scope paragraph were
updated, but `## Summary`, `## Findings — Round 3`, `## Accepted Risks`, `## Verdict` and
`## Change Log` still carried Round-2 wording. This pass re-derived every Round-3
conclusion from the real code and build rather than trusting that partial text, and
completed the missing sections. No conclusion below rests on the interrupted pass.

**Scope of Round 4 (re-audit, 2026-09-02)**: the claimed fixes for **SEC-10** (the CS0165
compile error), **SEC-11** (fail-open when the trusted-proxy list is unconfigured but XFF
is present) and the **SEC-09 follow-up** (`settingKey` threaded through
`MatchesEntry`/`LogMalformedEntry`). `Helper/InternalNetworkAccessGuard.cs` is still
`AM` in `git status` — the **index holds the Round-2 version**, so
`git diff -- ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs` renders a
Round-2 → Round-4 diff, not Round-3 → Round-4. I read the whole file from disk as the
authority and used that diff only for blast radius. The mechanical oracle was **reproduced
independently rather than taken from the implementer's report**:

1. **`-t:Build -restore`** — `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build
   -restore -p:Configuration=Debug -clp:ErrorsOnly` → **exit 0, zero error lines**.
2. **`-t:Rebuild -restore`**, because a `Build` alone can be an incremental no-op that
   proves nothing about the current source → **exit 0, `0 Error(s)`, `129 Warning(s)`**,
   and the captured `csc.exe` command line contains `Helper\InternalNetworkAccessGuard.cs`
   at `/langversion:7.3` — i.e. the audited source really was compiled, at the same
   language version Round 3 failed under. `grep -c CS0165` over the full log: **0**.
   `ClassOnlineWeb/bin/ClassOnlineWeb.dll` was produced.
3. **Warning attribution** — no warning in the whole build originates in *any* `Helper/*.cs`
   file, so this round introduced none. The implementer reported 124 warnings and I measured
   129; the delta is `-t:Build` vs `-t:Rebuild -restore` (the extra lines are `NU19xx`
   restore advisories, see **SEC-P4**), not anything in the audited file.

Also re-checked from the real code this round: every reachable outcome of `GetClientIp`
enumerated as a truth table over (trusted-proxy list configured / peer trusted / XFF
present) rather than spot-checked; `MatchesEntry`/`IsInRange`/`NormalizeAddress`/
`AddressesEqual` for divergence introduced by the new `settingKey` parameter;
`CompassApiController.cs` and `Helper/CsrfHeaderGuard.cs` for SEC-03 regression (both
**unmodified** this round — worktree equals index); every `.config` in the tree for both
keys; every XFF/`UserHostAddress` reader in the app; and PRE-03 in the read-only Knowledge
`design.md` to see whether the documentation half of SEC-11 had landed.

---

## Open Findings

| id | Severity | Finding | Location | Owner | Status |
|---|---|---|---|---|---|
| SEC-12 | Minor | **The resolved "client IP" can still be a proxy's own address in three residual states, and the new deny-guard misses two of them because it counts *configured* trusted-proxy entries rather than *usable* ones.** `anyTrustedProxyConfigured` is `GetConfiguredTrustedProxies().Count > 0` — raw entry count. So: (a) trusted list non-empty but **every entry malformed** (`10.0.0.0/8x`, `10.0.0.0/33`, a typo) ⇒ `Count > 0` is true, the SEC-11 deny does not fire, no peer matches, and `GetClientIp` returns the **LB's own private address**; (b) trusted list well-formed but does **not cover the actual LB address** (exact IPs listed and the LB scales to a new ENI) ⇒ identical outcome; (c) peer **is** trusted but XFF is **absent** ⇒ `return directPeer` = the trusted proxy's own address. Exploitable only if `Compass_Recompute_AllowedIPs` also covers that proxy address — which the new code comment forbids but nothing enforces. Silent in all three: the malformed-entry warning has no listener (SEC-09). Cheap enforceable fix: count only entries that parse, and/or deny in `IsAllowed` when the resolved `clientAddress` itself `IsTrustedProxy`. | `Helper/InternalNetworkAccessGuard.cs:212, 217-222, 240` | backend-engineer (hardening) + devops (PRE-03 config discipline) | **Open (new, Round 4) — informational, non-blocking** |
| SEC-09 | Minor | **Half closed in Round 4.** The key-attribution half is **fixed and verified**: `MatchesEntry`/`LogMalformedEntry` now take `settingKey`, `IsAllowed` passes `AllowedIpsAppSettingKey` and `IsTrustedProxy` passes `TrustedProxyCidrsAppSettingKey`, so a malformed trusted-proxy entry is no longer misreported under the allowlist key. What remains is the original defect and it is **unchanged**: `Trace.TraceWarning` has no listener — no `.config` in the tree has a `<system.diagnostics>` section — so the warning goes to `OutputDebugString` and is invisible in production. SEC-02's diagnostic half is met nominally, not operationally, and that invisibility is what makes SEC-12(a) silent. | `Helper/InternalNetworkAccessGuard.cs:120-125`; `ClassOnlineWeb/Web.config`, `prod.config`, `dev.config` | **devops** (listener in config) — the backend half is done | **Open — informational, non-blocking** |
| SEC-04 | Minor | `[ApiAuthenticate]` is a class-level `AuthorizationFilterAttribute` and runs **before** the action body, so the BE-008 404 is not the first thing an unauthenticated prober sees: an unauthenticated request to `recompute/*` returns **401** while a genuinely non-existent route returns **404**. The DES-005 requirement "404/403 โดยไม่เปิดเผยว่ามี endpoint นี้อยู่" therefore does not hold for unauthenticated callers. | `Helper/ApiAuthenticateAttribute.cs:21-42` + `Controllers/Api/CompassApiController.cs:21` vs the in-action guards at `:303-304, 316-317` (post-fix line numbers) | system-analyst (controller-wide 401/404/405 contract), then backend-engineer | **Open — confirmed accurate in Round 2; a 405 oracle was added by the verb narrowing** |
| SEC-05 | Minor | No audit log of who triggered `recompute`. `design.md` Module B names this explicitly as part of failure mode (3) ("ไม่มี audit log ว่าใครสั่ง"). `plan.md` assigns it to no task, so it is neither implemented nor tracked. | `Controllers/Api/CompassApiController.cs:292-302`; `Helper/CompassRankingService.cs:137-158` | system-analyst (contract), then backend-engineer | **Open** |
| SEC-06 | Minor | **Widened in Round 4 — there are now TWO keys and PRE-03 names neither.** `Compass_Recompute_AllowedIPs` **and** `Compass_Recompute_TrustedProxyCIDRs` exist only inside C# constants; re-verified absent from every `.config` in the tree (`grep -rn Compass_Recompute --include=*.config .` → nothing), and PRE-03 in the read-only Knowledge `design.md:869` is **verbatim unchanged** — it still says only "ตั้งค่า IP/internal-network allowlist … ใน configuration" and names no key. After the SEC-11 fix the two keys are **hard-coupled**: setting only the allowlist means every request behind the LB carries XFF, no proxy is trusted, `GetClientIp` returns `null`, and `recompute/*` returns 404 to everyone — PRE-04 cannot be performed. `devops` cannot satisfy PRE-03 from the documents. | `Helper/InternalNetworkAccessGuard.cs:21, 29`; `ClassOnlineWeb/prod.config`; `<knowledge>/…/design.md:869` (PRE-03) | system-analyst (PRE-03 must name both keys + the no-overlap rule) + devops | **Open — now the surviving documentation half of SEC-11** |
| SEC-07 | Minor (audit trail) | `PREMIUM` labels in code comments now sit directly above endpoints that have **zero** server-side entitlement check, while the client-side `localStorage['compass_premium']` gate is still the only "enforcement" in the tree. Nothing in this round is wrong, but the file now reads as if Premium is gated. Documentation/audit-trail concern only. | `Controllers/Api/CompassApiController.cs:645, 682, 739`; `assets/js/compass.js:59-61` | security (this record) / system-analyst | **Recorded** |

**Closed by re-audit (Round 2)** — removed from the live table above, detail retained in
`## Findings — Phase 2` and summarised in `## Closed — re-audited against real code`:

| id | Was | Now | One-line reason |
|---|---|---|---|
| SEC-01 | **Critical** | **Fixed** | `GetClientIp` now takes the rightmost XFF entry; the premise is correct (AWS Classic ELB and ALB both **append**, and ALB's `routing.http.xff_header_processing.mode` defaults to `append`), so the Round-1 single-header spoof no longer works. Residual re-opened narrowly as SEC-08. |
| SEC-02 | **Important** | **Fixed** | CIDR + prefix-bitmask matching verified correct across boundary, byte-order, family-mixing and 12 malformed-entry cases; all malformed entries fail closed. `::1`/`::ffff:` normalisation now works. |
| SEC-03 | **Important** | **Fixed** | `[HttpPost]` only, plus a required `X-Requested-With` header. The "no CORS anywhere" premise is verified four independent ways, so `<img>`/form/cross-origin-XHR CSRF is genuinely blocked, not just narrowed. |

**Closed by re-audit (Round 4)** — removed from the live table above, detail retained in
`## Findings — Round 3` and `## Findings — Round 4`:

| id | Was | Now | One-line reason |
|---|---|---|---|
| SEC-10 | **Important** (blocking, mechanical) | **Fixed** | The `bool hasForwardedHeader` intermediate is gone; `TryGetValues(…, out forwardedValues)` is now the `if` condition itself, so C#'s "definitely assigned when true" state survives to the only read site. **I reproduced the build independently, twice**: `-t:Build -restore` → exit 0, zero error lines; forced `-t:Rebuild -restore` → exit 0, `0 Error(s)`, the file present in the `csc` command line at `/langversion:7.3`, `grep -c CS0165` = 0, `bin/ClassOnlineWeb.dll` produced. Not taken from the implementer's report. |
| SEC-08 | **Important** | **Fixed** | The trusted-peer logic Round 3 already verified as correct now (a) compiles and (b) no longer has its unconfigured default resolve to the proxy's address. Spoofed XFF from an untrusted peer still cannot influence resolution by any path; `IsTrustedProxy` still reuses the same `MatchesEntry`; the full truth table of `GetClientIp` was re-enumerated rather than spot-checked. Residual re-opened narrowly and at **Minor** as SEC-12. |
| SEC-11 | **Important** | **Fixed (code half); documentation half re-routed to SEC-06** | `GetClientIp` returns `null` when XFF is present and no trusted proxy is configured, which breaks the Round-3 chain at step 3: the unsafe-but-functional VPC-CIDR allowlist no longer *works*, because resolution fails before the allowlist is consulted. The operator now gets a loud fail-closed 404 instead of a silent allow-all — that removes the incentive which made this Important. "PRE-03 must name both keys, set together, non-overlapping" is real and **not done**; it now sits in SEC-06 at Minor as an operability finding, not an exploit path. |

**Blocking after Round 4**: **nothing.** Phase 2's `🔒 Security gate` is **CLOSED /
passable** on the security axis. Every finding that ever blocked it — SEC-01, SEC-02,
SEC-03 (Round 2), SEC-08, SEC-10, SEC-11 (Rounds 3-4) — is Fixed against the real code
plus, for the first time in this document, an independently reproduced clean build of the
real project.

**Not blocking this gate**: SEC-12 (Minor, new — informational), SEC-09 (Minor, half
closed — the listener is a `devops` item), SEC-04, SEC-05, SEC-06 (now carrying SEC-11's
documentation half), SEC-07, and the pre-existing SEC-P1/P2/P3/P4. The entitlement chain
(BE-004/005/006/007/012) remains blocked at OQ-15(a1)/(a2)/PRE-06 as a *plan* state, which
is not this gate's business — but it is why SEC-P1 stays Critical and why this IP guard is
still the **only** control on `recompute/*`.

**Closing this gate is not a deploy authorisation.** `## Verdict — Round 4` lists what is
out of this gate's scope and still real for a human to track — in particular SEC-P2 and
the PRE-03 two-key requirement.

Nothing pre-existing is claimed as fixed by either round. Two pre-existing Critical
exposures outside Phase 2's task list are recorded under `## Pre-existing — not this
round` so they are not mistaken for closed.

---

## Summary

### Round 4 (re-audit, 2026-09-02)

**Both Round-3 blockers are genuinely fixed, the project genuinely builds, and Phase 2's
`🔒 Security gate` is now closed.** After three rounds of rejecting claimed fixes I want to
be equally plain when a round holds up: this one does.

**SEC-10 — fixed, and I did not take the build on trust.** The pattern is exactly what the
Round-3 fix direction asked for: the `bool` intermediate is gone and
`request.Headers.TryGetValues("X-Forwarded-For", out forwardedValues)` is now the second
operand of the `if` condition itself, so the compiler's "definitely assigned when true"
state flows straight into the branch that reads it. I traced the definite-assignment
question rather than assuming symmetry with `directPeerAddress`: `forwardedValues` has
exactly **one** read (`:226`, `forwardedValues.LastOrDefault()`), and it sits inside
`if (peerIsTrustedProxy)` nested inside the `TryGetValues` true-branch — so every read is
dominated by the assignment, and no new `out` variable was introduced elsewhere. Then I
reproduced the oracle: `-t:Build -restore` exits 0 with zero error lines, and — because a
`Build` can be an incremental no-op that proves nothing — a forced `-t:Rebuild -restore`
also exits 0 with `0 Error(s)`, with `Helper\InternalNetworkAccessGuard.cs` visible in the
captured `csc.exe` command line at the same `/langversion:7.3` Round 3 failed under, zero
`CS0165` anywhere in the log, and `bin/ClassOnlineWeb.dll` written. No warning in the entire
build originates in any `Helper/*.cs` file. My warning count (129 on `Rebuild -restore`)
differs from the reported 124 purely by restore-time `NU19xx` advisories; nothing in the
audited file.

**SEC-11 — fixed, and the important thing is *why* it is fixed, not that a `return null`
appeared.** Round 3's finding was a chain, and the fix breaks it at step 3 rather than
patching step 5. With the allowlist set and the trusted-proxy key unset, every request
behind the real ALB carries XFF, so `anyTrustedProxyConfigured == false` now returns `null`
**before** the allowlist is consulted. That means the VPC-CIDR value which used to be "the
only value that makes PRE-04 work" no longer works either — there is now **no** allowlist
value that turns the misconfiguration into an allow. The operator's experience changes from
"silently allow every authenticated student" to "404 for everyone, immediately, at PRE-04",
which is the fail-closed, diagnosable outcome the finding asked for. The pressure that made
this Important is gone with it.

**The path this round was told to double-check did not break.** Trusted list empty **and
XFF absent** — the ordinary "no proxy in front, direct connection" case — still falls
through to `return directPeer` and resolves the real peer, because the deny is nested
*inside* the `TryGetValues` branch rather than sitting in front of it. I verified this as a
truth table over all three inputs rather than by reading the intent, and the deny fires on
exactly one combination: XFF present **and** no trusted proxy configured.

**SEC-01/02/03 — no regression, verified mechanically rather than assumed.**
`CompassApiController.cs` and `Helper/CsrfHeaderGuard.cs` are **untouched** this round
(worktree equals index for both), and the real file still shows `[HttpPost]` +
`Route("recompute/national-stats")` at `:295-296` with `IsAllowed` then `HasRequiredHeader`
at `:302-303`, and the same pair at `:315-316` for `recompute/status`. `IsInRange`,
`NormalizeAddress` and `AddressesEqual` do not appear in the diff at all; `MatchesEntry`
changed only by gaining the `settingKey` parameter and passing it to the two
`LogMalformedEntry` calls — no matching logic touched, so Round 2's hand-verified CIDR math
carries forward unchanged to both callers.

**SEC-09 follow-up — done and correct.** `IsAllowed` passes `AllowedIpsAppSettingKey`;
`IsTrustedProxy` passes `TrustedProxyCidrsAppSettingKey`; `LogMalformedEntry` formats
whichever it is given. A malformed trusted-proxy entry is no longer misreported under the
allowlist key. The message text still opens with "malformed allowlist entry" for both
paths, which is cosmetically loose, but the actionable part — the key name — is now right.
The listener is still missing, which is the original SEC-09 and stays with `devops`.

**One new Minor finding, and it is the same *shape* as the last three rounds rather than a
new class.** The Round-4 guard keys off `GetConfiguredTrustedProxies().Count > 0` — the
count of *configured* entries, not *usable* ones. So a trusted-proxy list containing only
malformed entries (a typo like `10.0.0.0/8x`) satisfies `Count > 0`, skips the new deny,
matches no peer, and lands back on `return directPeer` = the LB's own private address — the
exact outcome SEC-11 set out to remove, reached by a different door and silent because the
malformed-entry warning has no listener. The same landing spot is reachable two other ways
(a trusted list that does not cover the LB's actual address; a trusted peer that sends no
XFF). This is **SEC-12** and I am rating it **Minor**, consistently with how I scored the
earlier rounds: unlike Round-3's SEC-11 it needs **two** independent config mistakes
(a broken/incomplete trusted-proxy value **and** an `AllowedIPs` that covers the proxy),
and the documents now steer *away* from it — the file's own comment states the non-overlap
rule explicitly. It does not block the gate. It is worth ~3 lines of hardening whenever the
file is next opened: count only entries that parse, and/or deny in `IsAllowed` when the
resolved client address is itself a trusted proxy.

**What is still not done, and is not this gate's to hold:** PRE-03 in the Knowledge
`design.md:869` is **verbatim unchanged** — it still names no key, let alone both, and no
`.config` in the tree contains either key. I checked rather than assumed. That is now
SEC-06 at Minor: with the SEC-11 fix in place the two keys are hard-coupled, and setting
only the allowlist yields a total, silent-to-the-operator outage of `recompute/*` rather
than an exposure. Fail-closed, so not a gate blocker — but PRE-03 must not be attempted
until it names both.

### Round 3 (re-audit, 2026-09-02)

**The security reasoning in this fix is good and the fix still cannot be accepted.** Those
two facts are independent, and it matters that the report separates them.

On the logic: every one of the implementer's four claims about `GetClientIp` verifies
against the real source. The direct peer is resolved first, checked against a new
fail-closed trusted-proxy list, and X-Forwarded-For is consulted *only* when that peer is
trusted. `IsTrustedProxy` calls the **same** `MatchesEntry` that the allowlist path calls —
I specifically went looking for a second, divergent CIDR implementation (a different
byte-order assumption, a re-derived prefix bound) because that is the classic way a fix
like this reintroduces SEC-02 in a second code path, and there is none: `MatchesEntry`,
`IsInRange`, `NormalizeAddress` and `AddressesEqual` are byte-identical to the Round-2
versions I hand-verified, and the diff only *inserts* around them. A spoofed XFF from an
untrusted peer cannot reach `IsAllowed` by any path — the header variable is never even
read on that branch, and no other code in the app reads XFF for an IP. The
present-but-unusable-XFF fallback bug is genuinely fixed: empty, whitespace and
separators-only all now return `null` (deny) instead of the LB's own address.

Two things stop it anyway:

**It does not build.** `MSBuild` on the real project exits 1 with exactly one error,
CS0165 at `InternalNetworkAccessGuard.cs:205` — `forwardedValues` is assigned by an `out`
inside an `&&` whose result is stored in a `bool`, and C#'s "definitely assigned when true"
state does not survive that assignment. This is **SEC-10**, and it is the first finding in
this document that needed no adversarial argument at all: a compiler settled it. It is also
why the mechanical sweep matters — three rounds of careful source reading did not catch
something a build catches in one command. Practically, it means SEC-08 cannot be closed on
this code, and the *already-closed* SEC-01/02/03 fixes are equally unshippable, because
they live in the file that will not compile.

**It moves the fail-open surface rather than removing it.** This is **SEC-11**, and it is
the finding I would most expect to be argued with, so the mechanism plainly: with the new
key unset — which is the state of the tree today and the state PRE-03 as written will
produce, because PRE-03 names no key — no peer is ever trusted, so XFF is never consulted
and the resolved client IP is the load balancer's private address on **every** request.
Round 2's code resolved the real client in exactly this situation. So the operator who
performs PRE-03 and then PRE-04 finds the endpoint denying everyone, and the value that
makes it work is a VPC/subnet CIDR — which contains the LB's ENI and therefore admits every
authenticated student. Round 2 had this hazard too, but only when XFF was absent or
malformed; Round 3 makes it the default path. The fix is not to revert: it is a fail-closed
guard for "we are demonstrably behind a proxy and cannot identify it", plus a PRE-03 that
names both keys.

SEC-09 was left unfixed by choice and stays **Minor, informational, non-blocking**. The
stated rationale — no logging convention to switch to — is half right, and I checked rather
than assumed: no log4net/NLog/Serilog/App Insights/Elmah in `packages.config`, and no
`<system.diagnostics>` or trace listener in any deployed `.config` (the only matches are
IIS Express failed-request tracing in `.vs/`, disabled and irrelevant). But
`Trace.TraceWarning` already has an app-code precedent at `CompassApiController.cs:450`,
and `Global.asax.cs` drains two real DB log sinks, so a sink does exist. The actual close is
a listener in configuration, which is `devops`' call, not the engineer's — so leaving it is
a defensible decision, and it does not touch this gate either way.

### Round 2 (re-audit, 2026-09-02)

All three claimed fixes hold up under adversarial reading of the real code. This is
unusual enough to say plainly: the implementer's stated reasoning was correct on every
premise I could test, including the two that are easy to get wrong (AWS XFF append-vs-
replace semantics, and the CIDR bitmask boundary math). SEC-01, SEC-02 and SEC-03 move
to **Fixed**.

What is *not* fixed is the structural half of Round 1's SEC-01 fix direction — item (1),
"only consult `X-Forwarded-For` when the immediate peer is a known trusted proxy". The
new code is correct **because of** a deployment fact, not because of anything the code
checks. Nothing in this repository asserts, documents or tests that fact, and the file's
own comment states a fallback rule the code does not implement. That is SEC-08, and it is
the only thing now standing between Phase 2 and its security gate. It is a much smaller
ask than Round 1: a peer check against a configured trusted-proxy list, or a human Accept
with `devops` recording the invariant.

Two smaller notes from this round: the malformed-entry warning has no listener to write
to (SEC-09), and the verb narrowing on `recompute/national-stats` traded a 401 existence
oracle for a 405 one (recorded under SEC-04, which stays Minor and Open as before).

### Round 1

BE-009 / BE-010 / BE-011 (the IDOR fix) are **correct and complete**. I could not
construct any path by which `request.SID` influences identity or the response in the
three methods, the 401 short-circuits before any logic, and no SQL or string
concatenation was introduced anywhere in this round.

BE-008 (the IP allowlist) is **not effective in this deployment**. Its fail-closed
behaviour is genuinely sound — I tried empty, whitespace, `","`, `" , "` and `*` and
every one denies — but its client-IP resolution trusts the leftmost
`X-Forwarded-For` value, which is exactly the attacker-controlled position behind an
AWS load balancer. Because BE-007 (the `compass_admin_ops` entitlement layer) is
blocked at OQ-15/PRE-06 and not implemented, BE-008 is currently the *only* control on
a network-wide `TRUNCATE` beyond "be any logged-in student". The design anticipated
exactly this ("ห้ามตัดชั้นใดชั้นหนึ่งออกเพราะเห็นว่าซ้ำซ้อน — ความซ้ำซ้อนคือจุดประสงค์");
today one of the two layers is missing by plan and the other is bypassable by defect.

One mitigating fact worth stating plainly: **the key is not configured anywhere today**,
so on the current tree both `recompute/*` endpoints return 404 to everyone and the
exploit has nothing to bypass. SEC-01 becomes live the moment `devops` performs PRE-03.
That makes this a pre-deploy fix, not an incident — but it must not deploy as written.

---

## Findings — Phase 2 (Module B — Premium Entitlement & API Authorization)

### SEC-01 — Critical — XFF-spoofable IP allowlist → network-wide `TRUNCATE` by any authenticated student

**Location**: `C:\src\sb-web-student\ClassOnlineWeb\Helper\InternalNetworkAccessGuard.cs:48-63`
(consumed at `Controllers/Api/CompassApiController.cs:297` and `:309`)

**Status**: **Fixed — closed Round 2 (2026-09-02)**. Residual carried forward as SEC-08.

#### Re-audit — Round 2

Fix as landed, `Helper/InternalNetworkAccessGuard.cs:141-160`:

```csharp
string last = forwardedValues.LastOrDefault();
if (!string.IsNullOrWhiteSpace(last))
{
    var parts = last.Split(',').Select(ip => ip.Trim()).Where(ip => ip.Length > 0).ToList();
    if (parts.Count > 0) return parts[parts.Count - 1];   // rightmost
}
var httpContext = HttpContext.Current;
return httpContext?.Request?.UserHostAddress;
```

Answering the three questions put to this re-audit:

**(a) Is "rightmost" correct for AWS EB's default LB? — Yes.** AWS Classic ELB and ALB
both **append** the connecting peer's address to an existing `X-Forwarded-For`; ALB's
`routing.http.xff_header_processing.mode` attribute defaults to `append` (its alternatives
`preserve` and `remove` are opt-in). So the header the app sees is
`<client-supplied…>, <peer as observed by the LB>`, and the rightmost entry is the only
one the LB vouches for. The Round-1 premise stands and the implementer read it correctly.
This is the standard "trust N hops from the right, N=1" resolution.

**(b) Can it still be spoofed? — Not by the Round-1 attack, and not by the two variants
asked about.**

| Attempt | Header the app sees | Resolved IP | Result |
|---|---|---|---|
| `XFF: 10.0.0.5` (Round-1 exploit) | `10.0.0.5, <attacker>` | `<attacker>` | **denied** |
| `XFF: <real>, 10.0.0.5` (append own value last) | `<real>, 10.0.0.5, <attacker>` | `<attacker>` | **denied** |
| `XFF: 10.0.0.5,` / `10.0.0.5, , ,` (trailing garbage) | `10.0.0.5,, <attacker>` | `<attacker>` | **denied** — empty parts are filtered *before* the index, so a trailing comma cannot shift the index off the LB's value |
| `XFF: 10.0.0.5 junk` | `…, <attacker>` | `<attacker>` | **denied** |
| Rightmost is non-parseable | — | garbage string | **denied** — `IsAllowed:33` `IPAddress.TryParse` fails ⇒ `false` |
| Two `X-Forwarded-For` header lines | HTTP.sys coalesces duplicates into one comma-joined value in arrival order; the LB's append lands last | `<attacker>` | **denied** |

The `.Where(ip => ip.Length > 0)`-before-index ordering is what makes the trailing-comma
class of attack fail; had it indexed the raw split it would have returned `""` and fallen
through. That is correct as written, not accidentally.

The one spoof that *does* survive requires the request to reach the app **without
traversing the LB**, or a second proxy hop to exist — neither is a header trick, both are
deployment facts the code does not check. Carried as **SEC-08**.

**(c) Does the fallback only fire when the header is absent? — No. The comment is wrong.**
The comment at line 140 says "Only fall back to UserHostAddress when the header is
entirely absent." The code falls back in three cases, only one of which is absence:

1. header absent (intended);
2. header present but empty/whitespace (`X-Forwarded-For:`) → `IsNullOrWhiteSpace(last)`;
3. header present but only separators (`,` / ` , , `) → `parts.Count == 0`.

In cases 2-3 the resolved IP becomes `UserHostAddress`, i.e. **the load balancer's own
private address**. That is a fail-*open*-shaped path: it is harmless while the allowlist
holds only the school's public ranges, and it becomes allow-all if the allowlist ever
contains the VPC/subnet CIDR — which is the most natural reading of PRE-03's
"internal-network allowlist" and is now expressible for the first time thanks to the
SEC-02 CIDR support. Also carried under **SEC-08**; the correct behaviour is to return
`null` (deny) when the header is present but unusable, rather than silently substituting
the peer.

#### Original finding (Round 1)

The resolver:

```csharp
if (request != null && request.Headers.TryGetValues("X-Forwarded-For", out forwardedValues))
{
    string first = forwardedValues.FirstOrDefault();
    if (!string.IsNullOrWhiteSpace(first))
    {
        string candidate = first.Split(',')[0].Trim();   // <-- leftmost = client-supplied
        if (candidate.Length > 0) return candidate;
    }
}
```

**Why the leftmost value is untrusted here.** This is not a generic "XFF is spoofable"
note — the deployment is confirmed:

- `ClassOnlineWeb/.ebextensions/` (`xray-daemon.config`, `xray.config`, `xray-logs.config`,
  `timezone.config`) — the app is deployed on **AWS Elastic Beanstalk**.
- `ClassOnlineWeb/Web.config:33-38` — the HTTP→HTTPS rewrite rule fires on
  `{HTTP_X_FORWARDED_PROTO}`. That rule can only ever work if requests arrive through a
  proxy that sets forwarded headers, i.e. the EB load balancer terminates TLS.
- AWS ELB/ALB **append** the connecting peer's address to any `X-Forwarded-For` the
  client already sent; they do not replace it. The header the app sees is
  `<attacker-supplied>, <attacker's real IP>`. The **rightmost** entry is the only one
  the LB vouches for; `Split(',')[0]` reads the one the attacker wrote.

**Attack** (single request, requires only a valid student login — the class-level
`[ApiAuthenticate]` cookie check is satisfied by any student):

```
GET /api/v1/student/recompute/national-stats?limit=0
Cookie: AUTH_TOKEN=<any valid student token>
X-Forwarded-For: <any IP present in Compass_Recompute_AllowedIPs>
```

`IsAllowed` returns true → `ud != null` (a student) → `CompassRankingService.StartBackground(0)`
→ `RecomputeAsync` → `Helper/CompassRankingService.cs:401-402`:

```csharp
g.Database.ExecuteSqlCommand("TRUNCATE compass_level_subject_stat");
g.Database.ExecuteSqlCommand("TRUNCATE compass_student_level_score");
```

Both tables are network-wide (every school). `?limit=0` also makes the repopulation a
full-network scan, so the damage window is long and the operation is denial-of-service
grade even where it eventually succeeds. `recompute/status` is bypassable the same way,
disclosing network-level batch state.

**There is no safe way to configure this guard as written.** In production XFF is always
present, so the `HttpContext.Current.Request.UserHostAddress` fallback (line 61-62) is
unreachable — the header short-circuits it. Whatever IP is put in the allowlist becomes
a value the attacker simply types into the header. Configuring the load balancer's own
private address (what `UserHostAddress` would report) is worse still: it makes the layer
pass for **every** request that arrives through the LB.

**Fix direction** (for `backend-engineer` — I do not implement):
1. Only consult `X-Forwarded-For` when the immediate peer (`UserHostAddress`) is a known
   trusted proxy, from configuration; otherwise use `UserHostAddress` alone.
2. When XFF is trusted, walk from the **right** and take the first address that is not
   itself a trusted proxy — never `Split(',')[0]`.
3. Parse with `IPAddress.TryParse` and compare parsed addresses (normalising
   IPv4-mapped IPv6 such as `::ffff:10.0.0.5`), not `string.Equals`.
4. Preferably move this control out of the app entirely — an ALB listener rule / security
   group / IIS IP restriction cannot be spoofed by a header at all. An in-app allowlist
   behind a header is inherently weaker than the network control DES-005 asks for.

### SEC-02 — Important — exact-string matching cannot express the CIDR ranges the contract requires

**Location**: `Helper/InternalNetworkAccessGuard.cs:30` (`allowlist.Contains(clientIp, StringComparer.OrdinalIgnoreCase)`)
and `:33-43` (`GetConfiguredAllowlist`)

**Status**: **Fixed — closed Round 2 (2026-09-02)**

#### Re-audit — Round 2

CIDR support landed at `InternalNetworkAccessGuard.cs:55-128` (`MatchesEntry` +
`IsInRange` + `NormalizeAddress`/`AddressesEqual`). I checked the bitmask math by hand
rather than trusting it, because off-by-one and byte-order errors here fail *open*.

**Prefix/mask math — correct.**

| Check | Verdict |
|---|---|
| Byte order | `GetAddressBytes()` returns network byte order (big-endian) for both families, and the loop compares `[0]` first, so the most-significant byte is compared first. Correct — no host-order flip. |
| Partial-byte mask | `mask = unchecked((byte)(0xFF << (8 - remainingBits)))`: `/25`→`0x80`, `/30`→`0xFC`, `/31`→`0xFE`. The `unchecked` byte cast is what truncates `0xFF<<1 = 0x1FE` to `0xFE`; without it the mask would carry stray high bits into the `int` comparison. Correct, and the `byte & int` promotion is safe because both operands are masked identically. |
| Upper boundary | `/32` (IPv4) → `fullBytes=4, remainingBits=0`; the partial-byte block is skipped, so `addressBytes[4]` is never indexed. No `IndexOutOfRange`. Same for `/128` IPv6. |
| `prefixLength` range | `prefixLength < 0 \|\| > addressBytes.Length * 8` rejected — and validated against the **address** length after normalisation, so a `/33`-on-IPv4 or `/129`-on-IPv6 entry denies rather than throwing. |
| Off-by-one | `/24` matches `10.0.0.0`–`10.0.0.255` and rejects `10.0.1.0`; `/23` accepts `10.0.1.5`. Verified against `10.0.0.0/24`, `/23`, `/25`, `/31`, `/32`. No off-by-one. |
| Family mixing | `address.AddressFamily != network.AddressFamily` ⇒ `false`, checked **after** normalisation, so `::ffff:10.0.0.5` vs `10.0.0.0/24` matches (correct) and IPv4 vs IPv6 denies. |
| `/0` | Matches everything in the family. Mathematically correct CIDR semantics, **not** a defect — but it is a new ops footgun: Round 1 recorded `0.0.0.0/0` as denying (string compare), and it now allows all. Recorded in the updated fail-closed table below so nobody relies on the stale row. |

**Malformed entries cannot match, and cannot crash the check open.** Every path returns
`false`; there is no `catch` that could convert a throw into an allow, and `IsAllowed`
still short-circuits on an empty allowlist and on an unparseable *client* IP before any
entry is consulted.

| Entry | Result | Why |
|---|---|---|
| `not-an-ip` | deny + warn | `TryParse` fails on the exact-IP branch |
| `10.0.0.0/` | deny + warn | `int.TryParse("")` fails |
| `/24` | deny + warn | `TryParse("")` fails on the address part |
| `10.0.0.0/24/8` | deny + warn | `int.TryParse("24/8")` fails (first `/` splits, remainder must be a whole int) |
| `10.0.0.0/abc`, `/1e2`, `/99999999999` | deny + warn | `int.TryParse` fails or overflows |
| `10.0.0.0/-1` | deny | parses to `-1` ⇒ `prefixLength < 0` |
| `10.0.0.0/33`, `::1/129` | deny | `> addressBytes.Length * 8` |
| `10.0.0.0/024`, `10.0.0.0/ 24` | matches `/24` | `int.TryParse` tolerates leading zeros/whitespace — lenient, not unsafe |
| `*` | deny + warn | not an IP, not a CIDR |
| `0.0.0.0/0` | **allows all IPv4** | valid CIDR; see footgun note above |
| `::ffff:0:0/96` | deny | network normalises to IPv4 while the prefix stays 96 ⇒ `> 32`. Fails **closed**; a semantic wart worth knowing, not a hole. |

**The two matching gaps Round 1 named are genuinely closed**: `::1` vs
`0:0:0:0:0:0:0:1` now compare equal (both parse to the same `IPAddress`), and
`::ffff:10.0.0.5` vs `10.0.0.5` now match via `NormalizeAddress`. A proxy-appended
`:port` still denies (`TryParse` fails) — fail-closed, unchanged, and moot here because
neither Classic ELB nor ALB puts a port in `X-Forwarded-For` (it goes in
`X-Forwarded-Port`).

The one half-met claim is "skipped/logged": skipped, yes; *logged*, only into a trace
sink with no listener — see **SEC-09**.

#### Original finding (Round 1)

`design.md` DES-005 says "รายการ IP/**ช่วง network** ที่อนุญาต ต้องอ่านจาก configuration",
and PRE-03 tells `devops` to "ตั้งค่า IP/internal-network allowlist". The implementation
supports single literal addresses only. Consequences, in the order they will actually
happen:

1. `devops` sets `Compass_Recompute_AllowedIPs="10.0.0.0/24"` per PRE-03.
2. Every request is denied (fail-closed, correctly) — the string `10.0.0.0/24` never
   equals a client IP.
3. PRE-04 ("สั่ง recompute ใหม่ทั้งเครือข่ายด้วย `?limit=0` ทันทีหลัง deploy") cannot be
   performed, so this becomes a launch blocker under time pressure.
4. Someone substitutes a value that *does* work — which, per SEC-01, is a value the
   attacker can put in a header.

This is why it is Important rather than Minor: the gap does not fail open by itself, it
manufactures the conditions under which SEC-01 gets exploited. There is also no
diagnostic — a malformed or range-shaped entry is indistinguishable from "not configured"
at runtime, with no log line either way.

Related, lower-impact matching gaps in the same comparison: `::1` vs `0:0:0:0:0:0:0:1`,
`::ffff:10.0.0.5` vs `10.0.0.5`, and any proxy that appends `:port`. All fail **closed**,
so they are correctness/operability issues, not bypasses.

**Fix direction**: accept CIDR notation and compare on parsed `IPAddress` + prefix length;
reject unparseable entries loudly at startup (or log per-request at warn level) rather
than silently treating them as "no allowlist".

### SEC-03 — Important — destructive operation reachable by GET, cookie-authenticated, no CSRF token

**Location**: `Controllers/Api/CompassApiController.cs:290-302`;
`Helper/ApiAuthenticateAttribute.cs:21-42`

**Status**: **Fixed — closed Round 2 (2026-09-02)**

#### Re-audit — Round 2

Two changes landed: `[AcceptVerbs("GET","POST")]` → `[HttpPost]`
(`CompassApiController.cs:296`), and a new `Helper/CsrfHeaderGuard.cs` requiring
`X-Requested-With: XMLHttpRequest`, called in both `recompute/*` actions (lines 303, 316)
immediately after the IP guard.

**(a) Is "zero CORS policy ⇒ safe against custom-header CSRF" true *for this app*? —
Yes. I checked four independent mechanisms, not just `EnableCors`:**

| Mechanism | Evidence | Present? |
|---|---|---|
| Web API CORS | `packages.config` has **no** `Microsoft.AspNet.WebApi.Cors` entry at all — `config.EnableCors(...)` would not even compile. `App_Start/WebApiConfig.cs` registers only `TracingMessageHandler` (X-Ray), the JSON contract resolver, `MapHttpAttributeRoutes` and `DefaultApi`. | no |
| IIS static response headers | no `<httpProtocol>` / `<customHeaders>` anywhere in `Web.config`; grep for `Access-Control` across the whole app tree matches only jQuery source and NuGet XML docs — zero app code, zero config. | no |
| HTTP module / `Application_BeginRequest` | `Global.asax.cs` `Application_Start` does area registration, `WebApiConfig.Register`, `FilterConfig`, `RouteConfig`, `BundleConfig` and a logging `BackgroundWorker`. No header writing, no `BeginRequest`/`EndRequest` handler, no `<modules>` additions in `Web.config`. No OWIN pipeline exists (`WebApiConfig`'s own comment confirms OWIN was removed). | no |
| Legacy plugin cross-origin policy | no `crossdomain.xml`, no `clientaccesspolicy.xml` in the web root. | no |

Supporting detail the implementer did not cite: `Web.config:49` does
`<remove name="OPTIONSVerbHandler" />`, so a CORS preflight cannot even be answered
accidentally by IIS — an `OPTIONS` request falls through to Web API, which has no matching
action. A preflight for a non-safelisted `X-Requested-With` header therefore never
succeeds, and the browser never sends the real request. The claim holds.

**(b) Does it stop a plain form POST / non-JS CSRF, or only fetch/XHR? — It stops both,
and the distinction the question points at lands somewhere else.** A cross-origin
`<form>` POST and an `<img src>` GET cannot set *any* request header — that is a browser
invariant, not a CORS rule — so neither can ever satisfy `HasRequiredHeader`, and both now
fail at the guard with a 404. A cross-origin `fetch`/XHR *can* try to set the header, but
doing so makes the request non-simple and triggers the preflight shown above to fail. So
all three classic vectors are closed. What the header does **not** do:

- it is not a token, so it gives no protection against an attacker who can run script
  **on this origin** (stored XSS / HTML injection anywhere in the app) — such an attacker
  defeats a synchronizer token too, so this is not a regression;
- it protects nothing against a non-browser client holding a stolen cookie — that is
  credential theft, not CSRF, and SEC-P2 (the committed `token_secret`) is the live
  version of that problem;
- **it is an implicit dependency, and a silent one.** The day anyone adds a CORS policy
  with `SupportsCredentials` and a reflected/`*` origin — or an ALB/CloudFront response-
  header policy adds `Access-Control-Allow-*` at the edge, which this repo cannot see —
  this control degrades to nothing with no failing test and no log line. It is documented
  in `CsrfHeaderGuard`'s XML comment, which is the right place; noted here so the
  dependency is on the record rather than folklore.

**(c) Is dropping GET sufficient on its own? — No, and the implementer did not rely on
it.** `[HttpPost]` alone would still be defeated by an auto-submitting cross-origin
`<form method="post">` (no preflight, cookie attached). GET-removal is correct hygiene —
a `TRUNCATE` must not sit behind a safe method, and it also stops link prefetchers,
crawlers and `<img>`/`<script>` triggers — but the header requirement is what actually
closes the vector. The two together are sufficient; either alone is not.

No legitimate caller breaks: grep shows **no** client code calls `recompute/*` at all
(the only `recompute` hits in `assets/js/` are inside `fullcalendar.js`), so the header
requirement costs nothing today. It does add a step to PRE-04, which must now send both
the cookie **and** the header — folded into the PRE-04 note under SEC-06.

Worth recording as a side effect, not a defect: an unauthenticated `GET` to
`recompute/national-stats` now returns **405** from attribute-route action selection
instead of 401. Existence is still disclosed, just by a different status code — see the
SEC-04 addendum.

#### Original finding (Round 1)

`[AcceptVerbs("GET", "POST")]` on `recompute/national-stats` makes a `TRUNCATE` reachable
by a **safe** HTTP method. Authentication is the `AUTH_TOKEN` **cookie** (read via
`JWTToken.CheckToken` in the authorization filter), and no anti-CSRF token is validated
anywhere in the Web API pipeline (`App_Start/WebApiConfig.cs` registers no such filter).

**Attack**: any page an authenticated user visits embeds
`<img src="https://<host>/api/v1/student/recompute/national-stats?limit=0">`. The browser
attaches the cookie; no preflight applies to an image load; the request executes. The
attacker never needs the victim's token.

Today this is stopped by the IP layer — a browser cannot set `X-Forwarded-For`
cross-origin (it is not a forbidden header name, but adding it forces a CORS preflight
that this app does not answer). That means the CSRF exposure is *entirely* dependent on
the layer SEC-01/SEC-02 shows to be fragile, and it is exactly the combination the
design warned against by requiring two independent layers.

**Fix direction**: drop `GET` from the verb list (a state-destroying operation must not be
GET-reachable regardless of the other controls), and treat CSRF explicitly for
cookie-authenticated POST endpoints. Note for later phases: `AI_exercise/submit` and
`certificate/issue` are harmless to CSRF *only* because they persist nothing yet — the
`// TODO: persist the attempt …` at line 716 and `// TODO: verify a persisted PASS …` at
line 753 will change that.

### SEC-04 — Minor — 404 does not actually hide the endpoint from unauthenticated probes

**Location**: `Helper/ApiAuthenticateAttribute.cs:34-41` vs the comment at
`Controllers/Api/CompassApiController.cs:294-296`

**Status**: Open (unchanged — Round 2 **confirms** the implementer's conclusion; no fix
was claimed and none is required of them by this record)

#### Re-audit — Round 2: the implementer's conclusion is accurate

Verified against the real filter, not from memory:

- `Helper/ApiAuthenticateAttribute.cs:18` — `public class ApiAuthenticateAttribute :
  AuthorizationFilterAttribute`, applied at **class level** on
  `CompassApiController.cs:21` (`[ApiAuthenticate]` above `[RoutePrefix("api/v1/student")]`).
- ASP.NET Web API 2 pipeline order is: message handlers → routing → controller selection
  → **authentication filters → authorization filters** → model binding → action filters →
  **action body**. `OnAuthorization` sets `actionContext.Response` and never calls
  `base.OnAuthorization`, which short-circuits the pipeline before the action runs.
- Both `InternalNetworkAccessGuard.IsAllowed` and `CsrfHeaderGuard.HasRequiredHeader` are
  **statements inside the action body** (lines 303-304, 316-317). They therefore
  necessarily run *after* the cookie/JWT check. Confirmed.
- Residual risk as described is accurate: an unauthenticated caller gets **401** with the
  body `{"Message":"Unauthorized: missing or invalid token"}` for a route that exists, and
  **404** for one that does not — so endpoint existence is disclosed to unauthenticated
  probes, and DES-005's "โดยไม่เปิดเผยว่ามี endpoint นี้อยู่" is met only for
  authenticated ones.
- The judgement that restructuring is too risky to do unilaterally is sound and I endorse
  it: `[ApiAuthenticate]` is class-level over **~20 actions**, so any reordering (moving
  the IP check into a filter that precedes authorization, or returning 404 instead of 401)
  changes the response contract for the whole controller and for existing clients. That is
  a controller-wide design decision for `system-analyst`, not a BE-008 patch.

**Round 2 addendum — the verb narrowing added a second oracle.** With `[HttpPost]`, a
`GET` to `recompute/national-stats` is rejected at attribute-route **action selection**,
which happens *before* any filter, so it returns **405 Method Not Allowed** with no
credentials required at all. Previously that request returned 401. Impact is unchanged
(existence was already disclosed at the 401/404 boundary) and severity stays **Minor** —
but if SEC-04 is ever actually fixed, the fix must cover verb-mismatch 405s as well as
401s, or it will only move the oracle again.

#### Original finding (Round 1)

The in-code comment claims the guard is "checked before anything else (including
entitlement, once that layer exists)" and that "rejection looks like a plain 404 so the
endpoint's existence isn't disclosed". Half of that is wrong in a way worth recording:

- `[ApiAuthenticate]` (class-level, `CompassApiController.cs:21`) is an
  `AuthorizationFilterAttribute`. ASP.NET Web API runs authorization filters **before**
  the action body. So the ordering is: cookie/JWT check → *then* IP guard. The claim
  "checked before any JWT/`ud` check" does not hold. (It does hold relative to
  entitlement, which is what DES-005 actually requires — "ก่อน ตรวจ entitlement" — so
  the contract requirement is met; the comment overstates it.)
- Consequence: an unauthenticated request to `recompute/national-stats` gets **401**
  (route matched, filter rejected), whereas a request to a route that does not exist gets
  **404** from routing before any filter. Endpoint existence is therefore disclosed to an
  unauthenticated prober, which is what DES-005's "โดยไม่เปิดเผยว่ามี endpoint นี้อยู่"
  set out to prevent.

For an **authenticated** prober the 404 is adequate: `NotFound()` returns a bodyless 404,
and `WebApiConfig.Register` sets no `IncludeErrorDetailPolicy`, so the default `LocalOnly`
means a remote request to a non-existent route also gets a 404 with no detail body. Bodies
and headers match closely enough that I would not call that a practical distinguisher, and
I found no timing signal (the guard returns before any I/O). The disclosure is entirely at
the unauthenticated 401-vs-404 boundary — and it is the same for every route on this
controller, so fixing it properly is a controller-wide decision, not a BE-008 patch.

### SEC-05 — Minor — no audit log for the destructive operation

**Location**: `Controllers/Api/CompassApiController.cs:292-302`;
`Helper/CompassRankingService.cs:137-158`

**Status**: Open

`design.md` Module B lists failure mode (3) as "`recompute` สั่ง `TRUNCATE` สองตาราง ถ้ากั้นไม่พอ
ผู้ใช้คนเดียวลบสถิติของทุกโรงเรียนได้ **และไม่มี audit log ว่าใครสั่ง**". BE-008 addresses the
gating half and nothing addresses the logging half; no task in `plan.md` Phase 2 owns it.
After a SEC-01 exploitation there would be no record of which `UserData.UserID` or which
source IP initiated the truncation — `StartBackground` records only `State`/`StartedUtc`.
Raising it so the omission is a decision rather than an oversight.

### SEC-06 — Minor — PRE-03 is not actionable: the config key name exists only in source

**Location**: `Helper/InternalNetworkAccessGuard.cs:19`; `ClassOnlineWeb/prod.config`;
`ClassOnlineWeb/dev.config`; `<knowledge>/…/design.md` PRE-03

**Status**: Open

The key `Compass_Recompute_AllowedIPs` appears nowhere except the C# constant — I grepped
`Web.config`, `prod.config`, `dev.config`, `configSource-*.config` and the Knowledge docs.
PRE-03 names no key. `devops` therefore cannot complete PRE-03 from the documents.

This is also the reason the current tree is *safe*: with the key absent,
`GetConfiguredAllowlist()` returns an empty list and both `recompute/*` endpoints return
404 to everyone, including legitimate internal callers. Correct fail-closed behaviour, and
it means SEC-01 is not exploitable **as the tree stands** — it becomes exploitable at
PRE-03. Worth stating in the deploy conversation rather than discovering at cutover.

Adjacent operational note (not a security finding, but it feeds SEC-02's failure story):
PRE-04 requires `devops` to call `recompute?limit=0` right after deploy, but the endpoint
requires **both** an allowlisted IP **and** a valid `AUTH_TOKEN` cookie. A server-side
deploy script has no student cookie. Somebody will need a real answer for how PRE-04 is
executed, and "loosen the guard" must not be it.

### SEC-07 — Minor (audit-trail) — the code now reads as if Premium is enforced; it is not

**Location**: `Controllers/Api/CompassApiController.cs:645, 682, 739`;
`assets/js/compass.js:59-61`

**Status**: Recorded (documentation concern; explicitly *not* to be "fixed" in code this round)

This is the item this round is most likely to be misread on. State of the tree:

- `AI_exercise/path`, `AI_exercise/submit` and `certificate/issue` carry comments
  `// Feature 5 (PREMIUM):` / `// Feature 6 (PREMIUM):` and now also carry a crisp,
  correct-looking identity guard. A reader skimming for "is this endpoint protected?"
  sees `PREMIUM` + an auth check + a design-referencing comment and can easily conclude
  the endpoint is entitlement-gated. **It is not.** No `CheckEntitlement` exists anywhere
  in the codebase; BE-004/005/006/007/012 are `pending` and blocked at OQ-15(a1)/(a2) and
  PRE-06.
- The only Premium "gate" in the tree remains `assets/js/compass.js:60`:
  `CP.isPremium = function () { return … localStorage.getItem('compass_premium') === '1'; }` —
  which `design.md` orders abolished ("เลิกใช้ `localStorage['compass_premium']` โดยสิ้นเชิง").
  Any student can set it from devtools; the server returns full Premium payloads regardless
  because it never checks.
- `certificate/issue` will mint a certificate for any authenticated student for any
  `pathCode`, with no passing-exercise check (`// TODO: verify a persisted PASS …`,
  line 753). That is *correct scoping* — DES-006 explicitly forbids touching certificate
  business logic in BE-011 — but it means "identity fixed" must not be read as
  "certificate issuance authorised".
- Three `debug/*` endpoints remain open to any authenticated student, one of which
  (`debug/national-stats`, line 803) returns **network-wide** statistics. BE-012 would
  gate them and is blocked. The contrast is now sharper than before: `recompute/*` got a
  guard this round, its sibling network-wide-data endpoint did not.

Nothing here is a defect in BE-008/009/010/011. It is recorded so that "Phase 2 landed"
is never read as "Premium entitlement is enforced". Suggested mitigation, for whoever
owns the wording: change the `(PREMIUM)` comments to `(PREMIUM — NOT YET ENFORCED, see
BE-005/BE-007)` so the code says what is true.

---

## Findings — Round 2 (new)

### SEC-08 — Important — the rightmost-XFF fix is correct only because of unenforced, undocumented deployment invariants — **CLOSED in Round 4, see `## Findings — Round 4`**

**Location**: `C:\src\sb-web-student\ClassOnlineWeb\Helper\InternalNetworkAccessGuard.cs:141-160`
(`GetClientIp`), consumed at `Controllers/Api/CompassApiController.cs:303, 316`

**Status**: **Fixed — closed Round 4 (2026-09-02)** · **Opened**: 2026-09-02, Round 2 ·
Was: `backend-engineer` (code) + `devops` (infra invariant). Closure basis is in
`## Findings — Round 4 → SEC-08`; residual carried forward at Minor as **SEC-12**. Text
below is the original finding plus the Round-3 rejection, retained for the record.

This is not a re-statement of SEC-01. The header spoof SEC-01 described is dead. What
survives is that the guard's correctness is **conditional**, and the conditions live
outside the repository where nothing checks them.

**(a) No trusted-peer check.** `GetClientIp` honours `X-Forwarded-For` unconditionally —
it never asks who the immediate peer (`UserHostAddress`) is. "Take the rightmost entry" is
only sound when the request is *guaranteed* to have arrived through exactly the one proxy
that appended it. Two ways that guarantee breaks:

1. **Direct reachability.** If the EC2 instance's port 80/443 can be reached without going
   through the ELB/ALB, the attacker *is* the immediate peer, no append happens, and the
   rightmost entry is whatever the attacker typed — the original Critical bypass, verbatim.
   Elastic Beanstalk's default load-balanced environment restricts the instance security
   group to the LB's security group, so this is probably *not* open today; but I cannot
   verify a security group from this repository, and widened instance SGs are a common
   drift in long-lived EB environments. Nothing in the tree records the assumption.
2. **A second hop.** Insert CloudFront, a WAF-in-front-of-ALB, or any internal reverse
   proxy and the rightmost entry becomes that inner hop's address, not the client's. That
   direction fails **closed** (legitimate internal callers get 404), which is safe but
   creates exactly the operational pressure Round 1's SEC-02 story described — someone
   under launch pressure "fixes" it by widening the allowlist.

**(b) The fallback contradicts its own contract.** The comment at line 140 states the
fallback fires only when the header is "entirely absent". It also fires when the header is
present but empty (`IsNullOrWhiteSpace`, line 147) or contains only separators
(`parts.Count == 0`, line 154). In both cases the resolved client IP becomes the **load
balancer's private address**. Whether that allows anything depends entirely on the
allowlist value:

- allowlist = the school's public IP/CIDR → fallback denies. Harmless.
- allowlist = the VPC/subnet CIDR (e.g. `10.0.0.0/16`) → the LB's ENI address is inside
  it, so **every** request whose XFF resolution reaches the fallback is allowed. With
  ALB `xff_header_processing.mode` set to `preserve` or `remove` (both opt-in, but both
  plausible for an app that only redirects on `X-Forwarded-Proto`), the header is absent
  on every request and the guard degrades to **allow-all through the LB**.

That second bullet is newly *expressible* precisely because SEC-02's fix added CIDR
support, and PRE-03's wording ("IP/internal-network allowlist") reads as an invitation to
configure the internal network. SEC-06 already records that PRE-03 names no key and no
value; this is the security consequence of that gap.

**Why Important, not Critical**: no attack works on the code as written against the
default AWS configuration — each failure mode needs one deployment fact to be different
from the default, and none is confirmed. **Why not Minor**: the impact if any one of them
is different is unchanged from SEC-01 — a network-wide `TRUNCATE` triggered by anyone who
can log in as a student — and BE-007, the second layer that was supposed to make this
survivable, is still not implemented.

**What closes it** (either is sufficient):

1. **Code** — in `GetClientIp`: read `UserHostAddress` first; consult `X-Forwarded-For`
   only when that peer is in a configured trusted-proxy list (new key, e.g.
   `Compass_TrustedProxies`, same fail-closed treatment as the allowlist); and when the
   header is present but yields no usable address, return `null` (deny) instead of falling
   back to the peer. Then correct the comment at line 130-140 to describe what the code
   does. ~10 lines, no architectural change.
2. **Accept + document** — a human Accepts the residual, and `devops` records in
   `deploy.md`: the instance security group admits **only** the LB security group; the
   ALB's `routing.http.xff_header_processing.mode` is `append`; there is exactly one hop;
   PRE-03's value is the school's **public** range and explicitly **not** the VPC CIDR.
   Any future edge component (CloudFront/WAF) re-opens this finding.

Preferred, unchanged from Round 1: move the control to the network layer (ALB listener
rule / security group / IIS IP restriction), where no header can influence it.

#### Re-audit — Round 3 (2026-09-02): fix claimed, **rejected** — but the logic is right

**Status after Round 3: still Open.** Closure option 1 (code) was attempted. I traced the
real `GetClientIp` at `Helper/InternalNetworkAccessGuard.cs:189-219` rather than the report.

Claim-by-claim, against the source:

| Claim | Verdict | Evidence |
|---|---|---|
| (1) New key `Compass_Recompute_TrustedProxyCIDRs`, parsed the same way as `Compass_Recompute_AllowedIPs`, fail-closed if unconfigured | **True** | `GetConfiguredTrustedProxies` (`:92-102`) is the same body as `GetConfiguredAllowlist` with the other key — `Split(',')` → `Trim()` → `Where(Length > 0)`. `IsTrustedProxy` (`:110-118`) returns `false` on `trustedProxies.Count == 0`, so an unset/blank/`","`-only key trusts **no** peer. |
| (2) Peer resolved first, checked via `IsTrustedProxy`, XFF consulted only if the peer is trusted | **True** | `:191-197` resolves `UserHostAddress`, `TryParse`s it and calls `IsTrustedProxy`; `:203` gates the whole XFF block on `peerIsTrustedProxy && hasForwardedHeader`; `:218` returns the peer otherwise. |
| (2a) `IsTrustedProxy` reuses SEC-02's CIDR logic rather than reimplementing it | **True — no divergence** | `:117` is `trustedProxies.Any(entry => MatchesEntry(peerAddress, entry))` — literally the same call `IsAllowed:43` makes. `MatchesEntry`/`IsInRange`/`NormalizeAddress`/`AddressesEqual` are **unchanged** from Round 2 (the diff inserts new methods around them and edits no line inside them), so the hand-verified byte-order, partial-byte-mask, prefix-bound and family-mixing results carry over verbatim to the second path. |
| (3) Present-but-unusable XFF returns `null` (deny), not the peer | **True** | `:206` `if (string.IsNullOrWhiteSpace(last)) return null;` and `:213` `if (parts.Count == 0) return null;`. The `return directPeer` at `:218` is now reachable only when the peer is untrusted, or `request == null`, or `TryGetValues` returned false (header genuinely absent) — which is what the rewritten comment at `:186-188` says. Comment and code now agree; the Round-2 contradiction is gone. |
| (4) It compiles | **False** | See **SEC-10**. CS0165 at `:205`. |

**Attack traces run against the source (all assume SEC-10 were fixed):**

| Scenario | Path through `GetClientIp` | Resolved client IP | Result |
|---|---|---|---|
| Untrusted direct peer + `XFF: 10.0.0.5` (a trusted internal IP) | `peerIsTrustedProxy == false` ⇒ `:203` false ⇒ `:218` | attacker's real address | **denied.** `forwardedValues` is never read on this branch, so the spoof has no route in. |
| Untrusted peer + XFF with many entries, any ordering, duplicate header lines | same — the branch is skipped before any parsing | attacker's real address | **denied.** No parsing happens at all, so no ordering trick applies. |
| Untrusted peer, trusted-proxy key unset (today) | `IsTrustedProxy` → `Count == 0` → false | direct peer | **denied** while the allowlist is unset; **SEC-11** covers the configured case. |
| Trusted peer (real ELB) + `XFF:` (empty) | `:203` true, `last` is `""`/`null` ⇒ `:206` | `null` | **denied.** The Round-2 defect is fixed — it no longer becomes the LB's address. |
| Trusted peer + `XFF: ,,` / `" , , "` | `:203` true, `parts.Count == 0` ⇒ `:213` | `null` | **denied.** |
| Trusted peer + `XFF: junk` | returns `"junk"` | `"junk"` | **denied** at `IsAllowed:41` (`IPAddress.TryParse` fails). |
| `HttpContext.Current` null, or `UserHostAddress` null/empty | `peerIsTrustedProxy` false ⇒ `:218` returns null/`""` | null/`""` | **denied** at `IsAllowed:38`. Fail-closed. |
| Malformed *trusted-proxy* entry (`not-an-ip`, `10.0.0.0/33`, `/`, `10.0.0.0/abc`) | `MatchesEntry` → `false` + warn; no throw | peer not trusted ⇒ XFF ignored | **fail-closed**, same as the allowlist path. |

I found no path by which `X-Forwarded-For` influences the resolved IP when the peer is
untrusted, and no other XFF reader anywhere in the app: a tree-wide grep for
`X-Forwarded-For` / `UserHostAddress` / `X_FORWARDED` in `.cs`/`.cshtml`/`.config` returns
only this file plus `Web.config:36`'s `{HTTP_X_FORWARDED_PROTO}` HTTPS-redirect rule, which
never touches IP resolution. `IsAllowed` calls `GetClientIp` exactly once. So (a) of the
original SEC-08 — "no trusted-peer check" — is **structurally answered** by this fix.

**Two residuals, both non-blocking, recorded so they are not rediscovered as new:**

- The code trusts **exactly one** hop: it takes the rightmost entry outright rather than
  walking right-to-left past addresses that are themselves trusted proxies (SEC-08's fix
  direction item 2). With one hop these are identical. With two (CloudFront/WAF → ALB) the
  rightmost is the inner hop, which is not in the school allowlist, so it **fails closed**.
  Safe as written; worth knowing before an edge component is added.
- Setting `Compass_Recompute_TrustedProxyCIDRs` to `0.0.0.0/0` trusts every peer and
  silently reverts the guard to exact Round-2 behaviour — i.e. back to depending on the
  instance security group — with no log line and no failing check. Symmetric to the
  `0.0.0.0/0`-in-the-allowlist footgun already recorded in SEC-02's Round-2 amendment. A
  code-side hardening (reject `/0`, or warn on very short prefixes, in the trusted-proxy
  list) is cheap; folded into SEC-11's fix direction rather than raised separately, since it
  is the same "no documented safe value" problem.

**What closes SEC-08 now**: fix SEC-10 (the compile error), fix SEC-11 (the
unset-key default), then re-audit. Closure option 2 (human Accept + a `devops` invariant in
`deploy.md`) also remains available and is unchanged — but it would now have to Accept
SEC-11's misconfiguration hazard as well, not just Round 2's infra invariant.

### SEC-09 — Minor — malformed allowlist entries are "logged" to a sink with no listener

**Location**: `Helper/InternalNetworkAccessGuard.cs:84-89`; `ClassOnlineWeb/Web.config`

**Status**: **Open (listener half) — informational, non-blocking** · **Owner**: `devops` ·
**Opened**: 2026-09-02. **Round 4: the key-attribution half is Fixed and verified** —
`MatchesEntry(clientAddress, entry, settingKey)` / `LogMalformedEntry(entry, settingKey)`
now carry the key through, `IsAllowed:43` passes `AllowedIpsAppSettingKey` and
`IsTrustedProxy:117` passes `TrustedProxyCidrsAppSettingKey`, so a malformed trusted-proxy
entry is no longer misreported under the allowlist key. The message text still opens with
"malformed **allowlist** entry" on both paths — cosmetically loose, but the actionable part
(the key name) is now correct, and I am not raising a finding for wording. The
`backend-engineer` half of this item is done; the listener remains with `devops`, and its
absence is what makes **SEC-12**(a) silent.

`LogMalformedEntry` calls `Trace.TraceWarning(...)`. `Web.config` has **no
`<system.diagnostics>` section** and registers no trace listener, so the message goes to
the default listener (`OutputDebugString`) and is not written to any file, event log,
CloudWatch stream or X-Ray trace. Consequence: the operability half of SEC-02's fix — "a
malformed entry is distinguishable from *not configured*" — is satisfied in code but not
in production. A typo in PRE-03's value will still present to `devops` as a silent 404 on
every call, which is the exact diagnosis problem Round 1 raised.

Not a vulnerability: it fails closed and leaks nothing. Fix is a listener (or routing the
warning through whatever the app already uses for logging — `InsertLogAPI` /
`database._tSystemLog` in `Global.asax.cs` are the existing sinks) and it pairs naturally
with SEC-05's missing audit log.

#### Re-audit — Round 3 (2026-09-02): left unfixed by choice — stays Minor, does not block

> Wording note: "non-blocking" below is my severity judgement, **not** a human Acceptance.
> See `## Accepted Risks` — nothing in this document has been Accepted.

**Status: Open, informational, does not block the `🔒 Security gate`.** No fix was
claimed; the position taken was "no established logging convention exists in this codebase
to switch `Trace.TraceWarning` to". I verified that rather than taking it on trust, and it
is **half right**:

| Premise | Verdict | Evidence |
|---|---|---|
| No logging framework to switch to | **True** | `packages.config` has no `log4net`, `NLog`, `Serilog`, `ApplicationInsights` or `Elmah` entry. |
| No trace listener configured | **True** — this is the actual defect, unchanged | No `<system.diagnostics>`, `<trace>`, `TraceListener` or `sharedListeners` in `Web.config`, `prod.config`, `dev.config`, `configSource-*.config` or `Web.Debug/Release.config`. The only matches in the tree are IIS Express `traceFailedRequestsLogging` in `.vs/…/applicationhost.config`, which is `enabled="false"` and is not a .NET trace listener anyway. |
| No precedent for `Trace.TraceWarning` in app code | **False** | `Controllers/Api/CompassApiController.cs:450` already does `System.Diagnostics.Trace.TraceWarning("MBTI persist failed: " + ex.Message);` — same class, same method, in this same module. |
| No sink exists at all | **False** | `Global.asax.cs` drains two real DB sinks on a background worker (`InsertLogAPI._Send_API_Logs` → `TB_Send_API_Log`, and `database._tSystemLog` → `TSystemlog`, with a PostgreSQL/SQL-Server split). |

So `Trace.TraceWarning` is in fact the closest thing this codebase has to a convention for
app-code warnings, and the engineer's choice to leave it is **defensible** — the missing
piece is not a different API call, it is a **listener in configuration**, which is a
`devops` decision about where production diagnostics go. Re-routing accordingly, and
leaving severity at Minor. It fails closed and discloses nothing, so it has no bearing on
the gate.

One small code-side item does belong to `backend-engineer`, unchanged from the Open
Findings row: `LogMalformedEntry` (`:120-125`) hardcodes `AllowedIpsAppSettingKey` in its
message, so a malformed entry in the **trusted-proxy** list is reported as though it were
configured under `Compass_Recompute_AllowedIPs`. With two keys now feeding the same
`MatchesEntry`, that misattribution will actively mislead whoever debugs PRE-03. One-line
fix (pass the key name through); no security impact on its own.

---

## Findings — Round 3 (new)

### SEC-10 — Important (blocking, mechanical) — the SEC-08 fix does not compile; the project does not build — **CLOSED in Round 4 (build reproduced, exit 0), see `## Findings — Round 4`**

**Location**: `C:\src\sb-web-student\ClassOnlineWeb\Helper\InternalNetworkAccessGuard.cs:199-205`
(error reported at `:205,31`)

**Status**: **Fixed — closed Round 4 (2026-09-02)** · **Opened**: 2026-09-02, Round 3 ·
Closure basis (including an independently reproduced `-t:Rebuild`) is in
`## Findings — Round 4 → SEC-10`. Text below is the original finding, retained for the
record.

This is not a security judgement and there is nothing to argue about — a compiler decided
it. Recording it here because it is what stops SEC-08 from closing, and because it blocks
every other fix in the file.

The code as written:

```csharp
IEnumerable<string> forwardedValues;
bool hasForwardedHeader = request != null
    && request.Headers.TryGetValues("X-Forwarded-For", out forwardedValues);

if (peerIsTrustedProxy && hasForwardedHeader)
{
    string last = forwardedValues.LastOrDefault();   // CS0165 here
```

**Why it fails.** C# tracks `out` parameters with the split states "definitely assigned
when true" / "when false". After `request != null && TryGetValues(…, out forwardedValues)`,
`forwardedValues` is definitely assigned *when the expression is true* only — when
`request == null` the right operand never runs. Storing that expression in the `bool`
`hasForwardedHeader` **discards** the split state; the compiler cannot know that
`hasForwardedHeader == true` implies the assignment happened. At the later dereference the
variable is simply "not definitely assigned" ⇒ **CS0165: Use of unassigned local variable
'forwardedValues'**. Note the contrast one statement earlier: `directPeerAddress` (`:194-197`)
is used *inside* the same `&&` chain, where the "when true" state still applies — so that
one is legal. The two look alike and only one of them works.

**Evidence** (read-only; `-t:Build` compiles and deploys nothing):

| Check | Result |
|---|---|
| Real project build — `MSBuild ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug` | **exit 1**; with `-clp:ErrorsOnly`, **exactly one** error line: `InternalNetworkAccessGuard.cs(205,31): error CS0165` |
| Isolated compile, project's own Roslyn `csc`, real .NET Framework 4.8 reference assemblies | same error |
| `-langversion:7.3`, `9.0`, `latest` | same error in all three — not a language-version artifact |
| **Control**: Round-2 version of the same file (`git show :ClassOnlineWeb/Helper/InternalNetworkAccessGuard.cs`), identical flags | **compiles clean** — the breakage is attributable to this round's edit |

**Impact.** The application does not build. Nothing that Round 2 closed can ship either —
SEC-01/02/03's fixes live in this same file. Phase 2 has no shippable artifact, so the
`🔒 Security gate` has nothing to gate even before the SEC-11 argument.

**Fix direction** (`backend-engineer`): call `TryGetValues` in its own `if`, or initialise
`IEnumerable<string> forwardedValues = null;` at the declaration and null-check it at the
use site. Either is one line. Then **run the build before claiming the fix** — three rounds
of source reading did not surface this, and one `MSBuild` invocation did.

### SEC-11 — Important — the trusted-peer fix moves the fail-open surface from an edge case to the default path — **CLOSED in Round 4 (code half; doc half → SEC-06), see `## Findings — Round 4`**

**Location**: `Helper/InternalNetworkAccessGuard.cs:195-218`;
`<knowledge>/…/design.md` PRE-03

**Status**: **Fixed — closed Round 4 (2026-09-02)** for the code half; the documentation
half (PRE-03 must name both keys and a no-overlap rule) is **not done** and moved to
**SEC-06** at Minor, because with the code guard in place it produces a fail-closed outage
rather than an exposure. **Opened**: 2026-09-02, Round 3. Closure basis, including the full
`GetClientIp` truth table, is in `## Findings — Round 4 → SEC-11`. Text below is the
original finding, retained for the record.

The SEC-08 fix is directionally correct and I do not want it reverted. But it changes the
*meaning* of an unconfigured deployment in a way that makes the only functional
configuration an unsafe one, and no document says otherwise.

**The mechanism, step by step:**

1. `Compass_Recompute_TrustedProxyCIDRs` is absent from every `.config` in the tree
   (verified: `Web.config`, `prod.config`, `dev.config`, `configSource-prod.config`,
   `configSource-dev.config`, `Web.Debug.config`, `Web.Release.config` — the string appears
   only in the C# constant and one code comment). So does
   `Compass_Recompute_AllowedIPs` — see the config-state note below.
2. PRE-03 tells `devops` to set an "IP/internal-network allowlist" and **names no key**
   (that is SEC-06, still open). So the realistic PRE-03 sets the allowlist key it can find
   in the source and leaves the trusted-proxy key unset.
3. With it unset, `IsTrustedProxy` returns `false` for every peer, so `:203` is never taken:
   XFF is ignored on **every** request and `GetClientIp` returns the LB's private address
   for **every** request through the LB. Round 2's code resolved the real client here.
4. `devops` then performs PRE-04 (`recompute?limit=0` right after deploy) and finds it
   denied — because the school's public range does not contain the LB's private address.
5. The value that makes it work is the VPC/subnet CIDR (e.g. `10.0.0.0/16`) — now
   expressible thanks to SEC-02's CIDR support. That CIDR contains the LB's ENI, so the
   guard passes for **every** request arriving through the LB, i.e. for **every**
   authenticated student.

Step 5 is the same catastrophic outcome as SEC-01: a network-wide `TRUNCATE` of
`compass_level_subject_stat` and `compass_student_level_score` (`CompassRankingService.cs:401-402`)
triggerable by anyone who can log in as a student. And BE-007, the entitlement layer that
was meant to make that survivable, is still unimplemented (blocked at OQ-15(a1)/(a2)/PRE-06),
so this guard is still the *only* control.

**Why this is a real regression and not just SEC-08 restated.** Round 2 reached the LB's
own address only when XFF was absent or malformed — an edge case. Round 3 reaches it on
every request whenever one key is unset, which is the default and the state PRE-03 produces.
The hazard went from conditional to unconditional. Both rounds share the "allowlist must
never contain the VPC CIDR" requirement; Round 3 is what makes an operator want to put it
there.

**Why Important, not Critical.** Not exploitable on the tree as it stands: both keys are
unset, so `IsAllowed` short-circuits on the empty allowlist (`:35`) and both `recompute/*`
endpoints return 404 to everyone. It needs one deploy-time misconfiguration — but one that
the documents actively steer toward, which is the same reasoning that made Round 1's SEC-02
Important.

**Config state — no new deploy coordination is required *yet*, and that is the good news.**
The new key is genuinely absent from every `.config`, exactly like its sibling in SEC-06.
So this fix does **not** silently create a deploy dependency that has not been arranged; the
tree stays fail-closed on both keys and Phase 2 is no closer to being live than it was. What
it creates is a **two-key coupling** that PRE-03 does not describe, which is why the
documentation half of this finding is not optional.

**Fix direction** (either the code half or the doc half alone is insufficient):

1. **Code** (`backend-engineer`) — make the ambiguous state fail closed instead of resolving
   to the peer. In `IsAllowed`, deny outright when the trusted-proxy list is empty **and**
   the request carries an `X-Forwarded-For` header: that combination means the app is
   demonstrably behind a proxy but cannot identify it, so no client IP can be established.
   That converts step 3 from silent-and-wrong into an immediate, diagnosable denial, and it
   removes any incentive to reach step 5. Optionally also reject `/0` in the trusted-proxy
   list (see the SEC-08 Round-3 residual) so a wildcard cannot silently disable the check.
2. **Documentation** (`system-analyst` for the contract, `devops` for the deploy step) —
   PRE-03 must name **both** keys, state that they are set **together**, and state the
   invariant that they must **not overlap**: `Compass_Recompute_TrustedProxyCIDRs` = the
   LB's private subnet(s) only; `Compass_Recompute_AllowedIPs` = the school's **public**
   range and explicitly **never** the VPC CIDR. This subsumes SEC-06 and the surviving
   documentation half of SEC-08's closure option 2.

---

## Findings — Round 4 (re-audit of SEC-10 / SEC-11 / the SEC-09 follow-up)

### SEC-10 — **Fixed and closed (Round 4)** — the project builds

**Location**: `Helper/InternalNetworkAccessGuard.cs:214-238` · **Closed**: 2026-09-02

**The fix.** The `bool hasForwardedHeader` intermediate that discarded the split
definite-assignment state is gone:

```csharp
IEnumerable<string> forwardedValues;
if (request != null && request.Headers.TryGetValues("X-Forwarded-For", out forwardedValues))
{
    if (!anyTrustedProxyConfigured) { … return null; }
    if (peerIsTrustedProxy)
    {
        string last = forwardedValues.LastOrDefault();   // the only read
        …
    }
}
return directPeer;
```

**Why it is sound, traced rather than pattern-matched.** For `expr1 && expr2`, C# computes
"definitely assigned when true" from `expr2`'s state, and a variable passed as `out` to an
invocation is definitely assigned after that invocation. Using the `&&` **directly as the
`if` condition** keeps that state available inside the true-branch, which is precisely what
storing it in a `bool` destroyed. I then checked the two things that could still go wrong:

1. **Every read is dominated by the assignment.** `forwardedValues` has exactly **one**
   read in the whole file — `:226`, `forwardedValues.LastOrDefault()` — and it sits inside
   `if (peerIsTrustedProxy)`, itself nested inside the `TryGetValues` true-branch. There is
   no read after the block, and the `return directPeer` at `:240` does not touch it.
2. **No new definite-assignment hazard was introduced.** The one other `out` local,
   `directPeerAddress` (`:207-210`), is still consumed *inside* the same `&&` chain where
   the "when true" state applies — legal, and unchanged from Round 3 (that one always
   compiled). No third `out` variable exists.

**Evidence — reproduced independently, not accepted from the report** (read-only; `-t:Build`
and `-t:Rebuild` compile and deploy nothing):

| Check | Result |
|---|---|
| `MSBuild.exe ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -restore -p:Configuration=Debug -clp:ErrorsOnly` | **exit 0**, **zero error lines** |
| Forced `-t:Rebuild -restore -p:Configuration=Debug -v:n` (a `Build` alone can be an incremental no-op and prove nothing about the current source) | **exit 0**, **`0 Error(s)`, `129 Warning(s)`** |
| Was the audited file actually compiled? | Yes — the captured `csc.exe` command line contains `Helper\InternalNetworkAccessGuard.cs`, at **`/langversion:7.3`**, the exact language version Round 3 failed under |
| `grep -c CS0165` over the whole build log | **0** |
| Output artifact | `ClassOnlineWeb/bin/ClassOnlineWeb.dll` written |
| Did this round add any warning? | **No** — no warning in the entire build originates in any `Helper/*.cs` file. All 129 are pre-existing classes (`MSB3277` ×116 reference conflicts, `CS0168` ×108, `CS1998` ×42, `CS0219` ×22, `NU19xx` ×20 — see SEC-P4) |
| Reported vs measured warning count | Implementer said 124, I measured 129. Delta is `-t:Build` vs `-t:Rebuild -restore`; the extra lines are restore-time package advisories. Immaterial, and not in the audited file. |

**Consequence.** For the first time in this document there is a **shippable artifact**, so
SEC-01/02/03's Round-2 fixes and SEC-08/SEC-11's Round-3/4 fixes all now exist in a build.
Closed.

### SEC-11 — **Fixed and closed (Round 4)**, code half; documentation half → SEC-06

**Location**: `Helper/InternalNetworkAccessGuard.cs:212, 215-222` · **Closed**: 2026-09-02

**The fix breaks the chain at step 3, which is the right place.** Round 3's finding was not
"a bad line of code", it was a five-step chain ending in "the only allowlist value that
makes PRE-04 work admits every authenticated student". The fix makes step 3 fail closed:

```csharp
bool anyTrustedProxyConfigured = GetConfiguredTrustedProxies().Count > 0;
…
if (request != null && request.Headers.TryGetValues("X-Forwarded-For", out forwardedValues))
{
    if (!anyTrustedProxyConfigured) return null;   // XFF present, nothing trusted ⇒ deny
    …
}
return directPeer;
```

Because this `return null` happens in `GetClientIp`, `IsAllowed` short-circuits at
`:38` (`string.IsNullOrEmpty(clientIp)`) **before any allowlist entry is consulted**. So
step 5 of the chain is not merely discouraged, it is unreachable: with the trusted-proxy key
unset there is **no** value of `Compass_Recompute_AllowedIPs` — VPC CIDR, `0.0.0.0/0`,
anything — that produces an allow behind the real ALB, because XFF is always present there.
The operator who performs PRE-03 with one key and then PRE-04 gets an immediate, total,
fail-closed 404. That is the diagnosable outcome the finding asked for, and it removes the
operational pressure that made the severity Important.

**Full truth table of `GetClientIp`, re-enumerated rather than spot-checked.** Let
`T` = trusted-proxy list has ≥1 configured entry, `P` = the direct peer parses **and**
matches a trusted entry, `H` = an `X-Forwarded-For` header is present. Note `P ⇒ T`
(`IsTrustedProxy` returns `false` when the list is empty), so `P ∧ ¬T` is unreachable.

| # | T | P | H | Resolved client IP | Verdict |
|---|---|---|---|---|---|
| 1 | ✗ | ✗ | ✗ | `directPeer` — **the real direct peer** | ✅ **The "no proxy in front, direct connection" case still works.** This is the path this round was specifically told to re-confirm, and it is intact: the new deny is nested *inside* the `TryGetValues` branch, so an absent header never reaches it. Not broken by the fix. |
| 2 | ✗ | ✗ | ✓ | **`null` ⇒ deny** | ✅ **SEC-11 fixed.** The exact case Round 3 opened. Behind the real ALB this is every request when the key is unset ⇒ total fail-closed outage, not an allow-all. |
| 3 | ✓ | ✓ | ✓ | rightmost XFF entry (or `null` if empty / separators-only) | ✅ Intended path. Unchanged from Round 3, where it was verified in detail. |
| 4 | ✓ | ✗ | ✓ | `directPeer` | ✅ for the attack it was built for — a caller connecting **directly** with a spoofed XFF resolves to its **own** address and is denied. `forwardedValues` is not read at all on this branch. ⚠️ Two config-error flavours land here badly — see **SEC-12**(a)/(b). |
| 5 | ✓ | ✗ | ✗ | `directPeer` | ✅ Real peer. |
| 6 | ✓ | ✓ | ✗ | `directPeer` = **the trusted proxy's own address** | ⚠️ Residual — **SEC-12**(c). Needs `AllowedIPs` to cover the proxy, which the file's comment forbids. |
| 7 | `HttpContext.Current` null, or `UserHostAddress` null/empty | — | — | `null`/`""` | ✅ Denied at `IsAllowed:38`. Fail-closed. Note `P` is `false` here because of the `IsNullOrEmpty(directPeer)` guard at `:208`. |

**Non-material observation, recorded so it is not rediscovered.** `GetConfiguredTrustedProxies()`
is read twice per call (once via `IsTrustedProxy`, once for `anyTrustedProxyConfigured`), and
`P` is computed before `T`. A config edit landing between the two reads could in principle
yield `P=false, T=true` (row 4) instead of row 3. In practice `ConfigurationManager.AppSettings`
is app-domain-cached and a `Web.config`/`appSettings file=` change recycles the app pool, so
this is theoretical; and the unsafe direction requires SEC-12's overlap precondition anyway.
No finding.

**What did not land: the documentation half.** SEC-11's Round-3 fix direction said neither
half alone is sufficient. That was correct *at Important severity*, where the doc gap was
what steered the operator into the exposure. With the code guard in place the doc gap no
longer produces an exposure — it produces a fail-closed outage — so it drops to an
operability finding and moves to **SEC-06**, which I have widened accordingly. Verified, not
assumed: PRE-03 at `<knowledge>/_docs/module/sb-compass/design.md:869` is **verbatim
unchanged** and still names no key; `grep -rn Compass_Recompute --include=*.config .` over
the whole tree returns **nothing**, so neither key is configured anywhere.

### SEC-08 — **Fixed and closed (Round 4)**

**Location**: `Helper/InternalNetworkAccessGuard.cs:202-241` · **Closed**: 2026-09-02

Round 3 already verified all four of the trusted-peer claims against real source and
rejected the fix on two grounds only: it did not compile (SEC-10) and its unconfigured
default resolved to the proxy's own address (SEC-11). Both are now closed above, and I
re-confirmed the underlying logic is unchanged by this round's edit rather than assuming it:

- `IsTrustedProxy` (`:110-118`) still calls the **same** `MatchesEntry` that `IsAllowed`
  calls, now with an explicit `settingKey`. No second CIDR implementation appeared.
- `IsInRange`, `NormalizeAddress` and `AddressesEqual` **do not appear in the diff at all**
  — Round 2's hand-verified byte-order, partial-byte-mask, prefix-bound and family-mixing
  results carry forward verbatim to both callers.
- A spoofed XFF from an untrusted peer still cannot influence resolution on any path
  (rows 4-5 of the truth table: the header variable is never read there), and a tree-wide
  grep confirms the only other XFF reference in the app is `Web.config`'s
  `HTTP_X_FORWARDED_PROTO` HTTPS-redirect rule, which never touches IP resolution.

Two Round-3 residuals survive as noted, both non-blocking and both already recorded: the
code trusts exactly **one** hop (a second hop such as CloudFront/WAF fails **closed**), and
`0.0.0.0/0` in the trusted-proxy list would trust every peer. The second is now folded into
SEC-12 rather than left loose.

### SEC-12 — Minor — the deny-guard counts *configured* trusted-proxy entries, not *usable* ones, so the proxy's own address is still reachable as the "client IP"

**Location**: `Helper/InternalNetworkAccessGuard.cs:212` (`anyTrustedProxyConfigured`),
`:217-222` (the deny), `:240` (`return directPeer`)

**Status**: **Open** · **Owner**: `backend-engineer` (≈3 lines of hardening) + `devops`
(PRE-03 config discipline) · **Opened**: 2026-09-02 · **Non-blocking**

This is the "fix reveals adjacent gap" pattern this round was asked to look for, so I want
to state both the mechanism and why I am **not** rating it blocking.

**Mechanism.** `anyTrustedProxyConfigured` is `GetConfiguredTrustedProxies().Count > 0` —
the count of comma-separated entries after `Trim()`, with **no validation**. Entry validity
is only ever established later, inside `MatchesEntry`. Three states therefore reach
`return directPeer` with the resolved "client IP" being a **proxy's own address**:

| | State | How `GetClientIp` gets there |
|---|---|---|
| (a) | Trusted-proxy list non-empty but **every entry malformed** — `10.0.0.0/8x`, `10.0.0.0/33`, `10.0.0.0/`, `not-an-ip`, a stray character from a copy-paste | `Count > 0` ⇒ the SEC-11 deny at `:217` is **skipped**; `MatchesEntry` rejects every entry ⇒ `peerIsTrustedProxy == false` ⇒ falls to `:240` ⇒ **the LB's own private address**. Truth-table row 4. |
| (b) | Trusted-proxy list well-formed but does **not cover the LB's actual address** — exact IPs listed and the LB scales to a new ENI, or the wrong subnet was written | identical to (a) |
| (c) | Peer **is** trusted but **XFF is absent** — ALB `routing.http.xff_header_processing.mode` set to `remove`, or any host inside the configured trusted CIDR opening a direct connection without the header | row 6 ⇒ `:240` ⇒ **the trusted proxy's own address** |

In all three the outcome is the one SEC-11 was opened to eliminate, reached by a different
door. If it fires, the impact is unchanged from SEC-01: `IsAllowed` returns `true` for
**every** request arriving through that proxy, i.e. for every authenticated student, on an
endpoint that `TRUNCATE`s two network-wide tables — and BE-007, the second layer, is still
unimplemented.

**Why Minor, not Important — applying the same yardstick as the earlier rounds.**

- **Round-3 SEC-11 needed one config state, and it was the *default*** (key unset), with
  PRE-03 actively steering toward the unsafe value. **SEC-12 needs two independent config
  mistakes**: a broken or incomplete `Compass_Recompute_TrustedProxyCIDRs`, **and** an
  `Compass_Recompute_AllowedIPs` that covers the proxy's address. Either one alone
  fails **closed** — a malformed trusted list with a public-range allowlist denies
  everything.
- **The documents now steer away from it.** The file's own comment (`:189-201`) states the
  coupling and the non-overlap rule explicitly, which is a real change from Round 3 where
  nothing said it anywhere.
- Nothing is live: both keys are absent from every `.config`, so `IsAllowed` still
  short-circuits on the empty allowlist and `recompute/*` returns 404 to everyone today.

**Why it is still worth recording rather than waving through.** It is **silent**. A typo in
(a) produces the same observable behaviour as a correct configuration — the malformed-entry
`Trace.TraceWarning` has no listener (SEC-09), and the endpoint *works*, so nobody
investigates. That is the worst diagnostic profile of any state in this file, and it is the
one an operator under PRE-04 pressure is most likely to create.

**Fix direction** (`backend-engineer`, whenever this file is next open — not a round of its
own):

1. Make the guard count **usable** entries: validate in `GetConfiguredTrustedProxies` (or a
   small `IsWellFormedEntry`) and base `anyTrustedProxyConfigured` on that, so (a) falls into
   the existing `return null` deny instead of skipping it.
2. And/or enforce the non-overlap invariant the comment already states: in `IsAllowed`,
   after `IPAddress.TryParse(clientIp, out clientAddress)`, return `false` when
   `IsTrustedProxy(clientAddress)` — a known proxy address must never *be* the allowlisted
   client. This closes (c) and the configured-range part of (a)/(b) in one line.
3. Optionally reject `/0` (and warn on very short prefixes) in the trusted-proxy list,
   which is the surviving SEC-08 Round-3 residual.

`devops` half: PRE-03 must be executed with both keys and then **verified by observation**
(`recompute/status` from inside and from outside), not by assuming the values took effect.

---

## Closed — re-audited against real code

> **Round-4 note.** SEC-01, SEC-02 and SEC-03 stay **closed** and are now — for the first
> time — closed **in a build that exists**. This round's diff touches only
> `Helper/InternalNetworkAccessGuard.cs`; `CompassApiController.cs` and
> `Helper/CsrfHeaderGuard.cs` are byte-unmodified (worktree equals index for both), and the
> real controller still shows `[HttpPost]` + `Route("recompute/national-stats")` at
> `:295-296` with `IsAllowed` then `HasRequiredHeader` at `:302-303`, and the same pair at
> `:315-316` for `recompute/status` — SEC-03 intact. `IsInRange`/`NormalizeAddress`/
> `AddressesEqual` are absent from the diff and `MatchesEntry` changed only by threading a
> `settingKey` parameter into its two `LogMalformedEntry` calls — SEC-02 intact in both
> callers. SEC-01's header spoof stays dead (truth-table rows 4-5). The Round-3 caveat
> "fixed in source but unshippable" **no longer applies**: `-t:Rebuild` exits 0 and
> `bin/ClassOnlineWeb.dll` is produced.

> **Round-3 note.** SEC-01, SEC-02 and SEC-03 stay **closed** — Round 3 re-checked all
> three against the current code and found no regression. The diff for this round touches
> **only** `Helper/InternalNetworkAccessGuard.cs` (`git diff --stat`: that file plus this
> report), so the controller is untouched: `recompute/national-stats` is still `[HttpPost]`
> and `recompute/status` still `[HttpGet]`, both still calling
> `InternalNetworkAccessGuard.IsAllowed` then `CsrfHeaderGuard.HasRequiredHeader`
> (`CompassApiController.cs:295-322`) — SEC-03 intact. `MatchesEntry`, `IsInRange`,
> `NormalizeAddress` and `AddressesEqual` are byte-identical to the versions hand-verified
> in Round 2, and are now exercised by a second caller with identical semantics — SEC-02
> intact, and not re-broken in the trusted-proxy path. SEC-01's header spoof remains dead
> in every variant (it is, if anything, deader: an untrusted peer's XFF is not parsed at
> all). **But none of it can ship**: all three fixes live in the file that fails to compile
> (SEC-10). "Closed" here means the vulnerability is fixed in source, not that a build
> exists containing the fix.

| id | Severity (was) | Closed | Basis for closure |
|---|---|---|---|
| SEC-01 | **Critical** | 2026-09-02, Round 2 | `GetClientIp` takes the rightmost `X-Forwarded-For` entry. AWS Classic ELB and ALB both append (ALB default `xff_header_processing.mode = append`), so the rightmost entry is LB-vouched. Six spoof variants tested — single spoofed value, spoofed value appended last, trailing commas, trailing garbage, non-parseable rightmost, duplicate header lines — all deny. Residual (unenforced deployment invariants, fallback on empty header) re-opened narrowly as **SEC-08**, not left inside SEC-01. |
| SEC-02 | **Important** | 2026-09-02, Round 2 | CIDR + prefix bitmask implemented and hand-verified: byte order, partial-byte mask (`unchecked` cast), `/0`, `/24`, `/25`, `/31`, `/32`, `/33`, `/128`, `/129`, negative and overflowing prefixes, IPv4↔IPv6 family mixing. Twelve malformed entry forms all deny, none throws, no path converts a bad entry into an allow. `::1`/`0:0:0:0:0:0:0:1` and `::ffff:10.0.0.5`/`10.0.0.5` gaps closed via `NormalizeAddress`. Diagnostic half only nominally met — **SEC-09**. |
| SEC-03 | **Important** | 2026-09-02, Round 2 | `[HttpPost]` + required `X-Requested-With: XMLHttpRequest`. Verified there is no CORS mechanism of any kind: no `Microsoft.AspNet.WebApi.Cors` package, no `EnableCors`, no `<customHeaders>`/`Access-Control` in any config, no HTTP module or `BeginRequest` hook, no OWIN pipeline, no `crossdomain.xml`/`clientaccesspolicy.xml`; `OPTIONSVerbHandler` is explicitly removed. `<img>`, cross-origin `<form>` POST and cross-origin XHR all fail. No legitimate caller regresses (nothing in the tree calls `recompute/*`). |
| SEC-08 | **Important** | 2026-09-02, Round 4 | Trusted-peer check verified correct in Round 3 (all four claims, no CIDR divergence, spoofed XFF unreachable from an untrusted peer); the two grounds for rejection — no build (SEC-10) and the unconfigured default resolving to the proxy's address (SEC-11) — are both now closed. `IsInRange`/`NormalizeAddress`/`AddressesEqual` untouched by this round's diff, so Round 2's CIDR verification carries forward to both callers. Residual re-opened narrowly at **Minor** as SEC-12. |
| SEC-10 | **Important** (mechanical) | 2026-09-02, Round 4 | `TryGetValues(…, out forwardedValues)` is now the `if` condition itself, so "definitely assigned when true" survives to the single read site at `:226`, which is dominated by the assignment. Build reproduced independently: `-t:Build -restore` exit 0/zero errors and a forced `-t:Rebuild -restore` exit 0/`0 Error(s)`, with the file in the `csc` command line at `/langversion:7.3`, zero `CS0165` in the log, and `bin/ClassOnlineWeb.dll` produced. No warning originates in any `Helper/*.cs`. |
| SEC-11 | **Important** | 2026-09-02, Round 4 (code half) | `GetClientIp` returns `null` when XFF is present and no trusted proxy is configured, and `IsAllowed` short-circuits on that at `:38` **before** consulting the allowlist — so no allowlist value can turn the misconfiguration into an allow, and the Round-3 chain is unreachable at step 5. Re-confirmed by full truth table that the "XFF absent, no proxy configured" direct-connection path still resolves the real peer. Documentation half (PRE-03 names both keys, non-overlapping) is **not done** and moved to SEC-06 at Minor. |
| BE-009/010/011 | (IDOR) | 2026-09-02, Round 1 | See the table below — verified in Round 1 and unchanged in the Round 2 diff. |

---

## Clean — verified, no finding

### BE-009 / BE-010 / BE-011 — IDOR via client-supplied `SID` — ✅ closed

I treated the implementer's report as a hypothesis and checked the full method bodies plus
the whole file, not the diff hunks.

| Check | Evidence | Verdict |
|---|---|---|
| `request.SID` never read for identity | `grep -n "SID\|sID\|sid" Controllers/Api/CompassApiController.cs` — every remaining occurrence is either `SID = ud.UserID` (lines 79, 277, 331, 381, 424, 475, 663, 720, 788), the `int sid = ud.UserID` local at line 750, a comment, or the ignored route parameter `sID` at line 31. **No `request.SID` / `.SID` read survives anywhere in the file.** | ✅ |
| 401 short-circuits before any logic | All three methods open with `var ud = UserData; if (ud == null) return ApiFail("Unauthorized", HttpStatusCode.Unauthorized);` at lines 650-651, 687-688, 744-745 — before `pathCode` parsing, before `ExerciseBank(...)`, before any DTO construction. None of the three touches the DB at all, so there is no query that could run first. | ✅ |
| Response identity cannot be re-populated from the request | `VMPathExerciseSet.SID = ud.UserID` (663), `VMExerciseResult.SID = ud.UserID` (720), `CertNo`/`VerifyCode` built from the `int sid = ud.UserID` local (758, 765). All three responses are **fresh object initialisers** — no AutoMapper, no `Mapper.Map`, no reflection copy, no reuse of the request object as the response. I looked specifically for a mapping library: none is referenced in this controller or in `WebApiConfig`. There is no later assignment to `.SID` on any of the three result objects. | ✅ |
| DTO field retained as the contract requires | `SID` still present on `VMAdvicePathRequest` / `VMExerciseSubmitRequest` / `VMCertificateRequest`; server reads it nowhere. Matches DES-006 ("คงฟิลด์ `SID` ไว้ใน request DTO ตามเดิม … แต่ server ต้องไม่อ่านค่านั้นเลย") — removing it would have broken the current client for no security gain. | ✅ |
| `ud == null` added where DES-006 said it was missing | All three previously had no null check (DES-006 line 660 flagged this). Now present. | ✅ |
| BE-011 scope discipline | `IssueCertificate` changes identity only. Eligibility check, guessable cert number and `VerifyCode` are untouched, as DES-006 line 670-672 requires (`sb-compass-certificate` scope). Tracked in SEC-07 so it is not mistaken for accepted-as-secure. | ✅ |

The three IDOR vectors named in `design.md` `## Identity & Scope Rules` (lines 652-658) are
closed. This is a **re-audit of the real code**, so these move from "fix claimed" to Fixed.

### No injection introduced — ✅

- Neither `InternalNetworkAccessGuard.cs` nor any changed hunk in `CompassApiController.cs`
  contains SQL, an ORM query, or a command string. The three fixed methods touch no
  database.
- The only string concatenation added in this round is
  `CertNo = "SBC-" + sid.ToString("D6") + "-" + pathTag` and
  `VerifyCode = "VC-" + sid.ToString("D4") + "XA7"` (lines 758, 765). `sid` is now an `int`
  from `ud.UserID`, formatted numerically — it cannot carry a payload. `pathTag` derives from
  client `pathCode` but is only echoed back in JSON to the same caller, never used in a query.
- I re-read `CompassRankingService.cs:401-410`: the `TRUNCATE` statements are fixed literals
  with no interpolation, and the surrounding `INSERT` uses `NpgsqlParameter` throughout —
  consistent with the design's "raw SQL ต้องใช้ `NpgsqlParameter` เท่านั้น". Unchanged this
  round; confirmed not regressed.
- `csproj` line 331 adds only `<Compile Include="Helper\InternalNetworkAccessGuard.cs" />`.
  No dependency, no build event, no content exposure. Clean.
- **Round 2**: the `csproj` diff adds only the two `<Compile Include>` entries for
  `InternalNetworkAccessGuard.cs` and `CsrfHeaderGuard.cs` — no package reference (in
  particular no CORS package), no build event, no content item. `Helper/CsrfHeaderGuard.cs`
  contains no SQL, no I/O and no configuration read at all. `InternalNetworkAccessGuard`'s
  new code uses only `System.Net.IPAddress` and `System.Diagnostics.Trace`.
  `IPAddress.IsIPv4MappedToIPv6` / `MapToIPv4` require .NET Framework 4.6+; the project
  targets `v4.8` (`ClassOnlineWeb.csproj:20`), so this compiles — worth stating because a
  build failure here would leave the endpoints in whatever state the last successful build
  had.
- Also in the Round 2 working tree, unrelated to any finding:
  `CompassScoreService.AggregateByCanonicalSubjectWeighted` plus its two call sites and a
  rounding change (`Math.Round(a.AverageScore, 0)` → `2`). Pure in-memory LINQ arithmetic
  over already-fetched rows — no SQL, no string concatenation, no identity or
  authorization input, and the credit-weighted average guards its own divide-by-zero. No
  security impact; recorded so it is not mistaken for unreviewed.

### Fail-closed behaviour of the allowlist — ✅ (this specific claim holds)

> **Round 2 amendment — two rows below are now stale.** After the SEC-02 fix, `"*"` still
> denies (and now warns), but **`"0.0.0.0/0"` allows every IPv4 address** — it is valid
> CIDR and `IsInRange` implements it correctly. Every other row still holds: key absent,
> empty/whitespace, `","`, `" , , "`, unresolvable client IP and an `AppSettings` throw all
> still deny, and `IsAllowed` gained one more fail-closed check (`IPAddress.TryParse` on
> the client IP, line 33). The full re-verified matrix, including twelve malformed CIDR
> forms, is in the SEC-02 re-audit above.

Traced `GetConfiguredAllowlist()` + `IsAllowed()` against every malformed input I could
think of; all deny:

| Config value | Result | Why |
|---|---|---|
| key absent | **deny** | `AppSettings[...]` → `null` → `IsNullOrWhiteSpace` → empty list → `Count == 0` |
| `""` / `"   "` / tabs | **deny** | `IsNullOrWhiteSpace` |
| `","` / `" , , "` | **deny** | split → all entries trim to length 0 → `Where(ip => ip.Length > 0)` empties the list |
| `"*"` / `"0.0.0.0/0"` | **deny** | exact string comparison; no client IP ever equals these (this is also SEC-02) |
| `" 10.0.0.5 "` | matches `10.0.0.5` | `Trim()` per entry — correct |
| client IP unresolvable (`null`/empty) | **deny** | explicit `IsNullOrEmpty(clientIp)` check, line 28 |
| `AppSettings` throws | **deny** (as a 500) | exception propagates; no `catch` swallows it into an allow |

No hardcoded IP anywhere in the file — DES-005's "ห้าม hardcode ในโค้ด" is satisfied. The
allowlist is read from `appSettings` on every call with no caching, so a config change takes
effect without a code path that could serve a stale allow. `appSettings file="prod.config"`
(Web.config:14) means the key can legitimately live in `prod.config`.

The fail-closed *logic* is the strongest part of this implementation. It is the **input** to
that logic (SEC-01) that is untrustworthy, and no amount of fail-closed rigour compensates
for an attacker-chosen client IP.

### Ordering relative to entitlement — ✅ (contract requirement met)

DES-005 requires the IP layer "**ก่อน** ตรวจ entitlement". The guard is the first statement
in both action bodies (lines 297, 309), so when BE-007 lands it will necessarily sit after
it. Correct. (The stronger claim in the code comment about preceding the JWT check is wrong
— SEC-04 — but that is not what the contract asked for.)

---

## Pre-existing — not this round, not closed

Recorded so this round's Phase 2 landing is not read as covering them. Neither is a defect
in BE-008/009/010/011; both are on tasks blocked at OQ-15(a1)/(a2)/PRE-06.

| id | Severity | Finding | Location | Status |
|---|---|---|---|---|
| SEC-P1 | **Critical (pre-existing)** | **No server-side Premium entitlement exists at all.** Every endpoint listed in `design.md` `### endpoint ที่ต้องกั้น` — `calculate/score`, `AI_calculate/path`, `AI_advice/path`, `AI_mbti/*`, `AI_exercise/*`, `certificate/issue` — returns its full Premium payload to any authenticated student. The only gate is `localStorage['compass_premium']` in the browser. Attack: `localStorage.setItem('compass_premium','1')` in devtools, or just call the API directly. REQ-013 is not met. Blocked at OQ-15(a1)/(a2) + PRE-06, correctly per `plan.md`; the block is a *plan* state, not a security acceptance. | `Controllers/Api/CompassApiController.cs` (all Premium routes); `assets/js/compass.js:59-61` | **Open — blocked, not accepted** |
| SEC-P2 | **Critical (pre-existing, repo hygiene)** | Live production credentials in tracked files: `configSource-prod.config` (four PostgreSQL connection strings with `Password=Sch001Br1ght@aT2o@$`, two SQL Server with `Password=RRufPZvg6CcM6wbv`) and `prod.config` (`token_secret` — the **JWT signing key** that `[ApiAuthenticate]` trusts — plus `StorageConnectionString` Azure account key, SMTP and SMS passwords, `db_password`, `GradeDb_password`). `configSource-prod.config` was **modified in this working tree** (a credential rotation to `app_academic`), so a rotation happened without moving the secrets out of git. Anyone with repo read access can mint a valid `AUTH_TOKEN` for any user, which also makes every "authenticated student" precondition above trivially satisfiable by an outsider. Out of Phase 2's scope; flagged because the file is in this diff. | `ClassOnlineWeb/configSource-prod.config`; `ClassOnlineWeb/prod.config:11-35`; `ClassOnlineWeb/dev.config` | **Open — out of scope, escalate to a human** |
| SEC-P3 | Important (pre-existing) | Three `debug/*` endpoints open to any authenticated student, one returning **network-wide** data (`debug/national-stats` → `GetAllLevelStats()`, line 803). Their own comments say "Lock down / remove before prod" (line 774). BE-012 would gate them and is blocked at OQ-15. | `Controllers/Api/CompassApiController.cs:775-816` | **Open — blocked (BE-012)** |
| SEC-P4 | Minor→Important (pre-existing, dependency hygiene) · **new information, Round 4** | **NuGet packages with published advisories.** Surfaced by adding `-restore` to this round's build (earlier rounds built without it, so this is new information rather than a new problem): `AutoMapper 7.0.1` — **high** (GHSA-rvv3-g6hj-g44x), `RestSharp 106.11.4` — **high** (GHSA-9pq7-rcxv-47vq), `System.IdentityModel.Tokens.Jwt 5.2.1` — moderate (GHSA-59j7-ghrg-fj52), `NuGet.CommandLine 6.4.0` — **critical** (GHSA-68w7-72jg-6qpp) + high (GHSA-6qmf-mmc7-6c2p). Scoping honestly: of these, only **AutoMapper** appears in this project's actual `csc` `/reference` list, so it is the one with a confirmed runtime path; `NuGet.CommandLine` is build-time tooling, not shipped; `RestSharp` and `System.IdentityModel.Tokens.Jwt` are in the restore graph but not referenced by this project's compile (this app's JWT handling uses `JWT 3.0.1`, so the `System.IdentityModel` advisory does **not** describe the `AUTH_TOKEN` path). Nothing here is Phase 2's work, nothing is exploitable via `recompute/*`, and I have not attempted to construct an exploit. Recorded because a build now prints it on every run and it should be triaged deliberately rather than normalised as noise. | `ClassOnlineWeb/packages.config`; build log `NU1902`/`NU1903`/`NU1904` | **Open — out of scope, route to `devops` for triage** |

---

## Accepted Risks

None. **No finding in this document has been Accepted by a human**, in any round — and
that is still true now that the gate is closed. This is the distinction that matters most
in Round 4, so it is stated first: **the blocking findings were CLOSED BY FIX, not by
acceptance.** SEC-01/02/03/08/10/11 were each re-audited against the real code (and, for
SEC-10, an independently reproduced build) and found genuinely repaired. Nobody accepted a
residual risk to get this gate open.

As of Round 4 the blocking set is **empty**. The findings that remain Open are Minor and
non-blocking **by my severity judgement**, which is not the same thing as an acceptance:

- **SEC-12 is open by my rating, not by anyone's decision.** I rated it Minor because it
  needs two independent config mistakes and the code comment now steers away from it. If a
  human disagrees with that rating — the "silent on a typo" property is a fair reason to —
  it becomes blocking again and no acceptance exists to stop that.
- **SEC-09's listener half is open by choice, not Accepted**; same for SEC-04/05/06/07.
- **SEC-P1 and SEC-P2 are the opposite of accepted.** Both are Critical, both are outside
  Phase 2's task scope, and neither has been decided by anyone. SEC-P2 in particular (the
  committed production `token_secret` and DB passwords) still needs a human, and closing
  this gate does not touch it.
- **Nothing in this document authorises a deploy.** A closed security gate is one input to
  that decision; PRE-03/PRE-04 readiness (SEC-06) and the SEC-P2 credential decision are
  separate human calls.

---

## Verdict — Round 4 (2026-09-02, current)

**Phase 2 `🔒 Security gate`: CLOSED — passable. Zero blocking findings remain.** All six
findings that ever blocked this gate across four rounds are **Fixed by re-audit of the real
code**, not accepted: SEC-01 (Critical), SEC-02, SEC-03, SEC-08, SEC-10, SEC-11 (Important
×5). For the first time in this document there is also a **build**: I reproduced it myself
rather than taking the implementer's word — `-t:Build -restore` exits 0 with zero error
lines, and a forced `-t:Rebuild -restore` exits 0 with `0 Error(s)`, with the audited file
in the `csc` command line at `/langversion:7.3`, zero `CS0165` in the log, and
`bin/ClassOnlineWeb.dll` produced.

| id | Severity | Verdict | Why |
|---|---|---|---|
| **SEC-10** | Important (mechanical) | **FIXED — closed** | The `bool` intermediate is gone; `TryGetValues(…, out forwardedValues)` is the `if` condition itself, so "definitely assigned when true" reaches the single read at `:226`, which is dominated by the assignment. No other `out` local was introduced. Build reproduced independently, twice, including a forced `Rebuild` so it cannot be an incremental no-op. No warning originates in any `Helper/*.cs`. |
| **SEC-11** | Important | **FIXED — closed** (code half) | XFF present + no trusted proxy configured ⇒ `null` ⇒ `IsAllowed` denies at `:38` **before** the allowlist is read. The Round-3 chain is unreachable at step 5: no allowlist value, VPC CIDR included, can turn the misconfiguration into an allow. Doc half (PRE-03) not done → **SEC-06** at Minor. |
| **SEC-11 regression check** | — | **Path intact** | Trusted list empty **+ XFF absent** — the ordinary direct-connection case — still returns the **real direct peer**, because the deny is nested inside the `TryGetValues` branch. Verified as a truth table over all three inputs; the deny fires on exactly one combination. |
| **SEC-08** | Important | **FIXED — closed** | Round 3 had already verified the trusted-peer logic on all four claims with no CIDR divergence; its two grounds for rejection are now closed. `IsInRange`/`NormalizeAddress`/`AddressesEqual` absent from the diff. Residual re-opened narrowly at **Minor** as SEC-12. |
| SEC-01 / 02 / 03 | was Critical / Important ×2 | **Stay closed — no regression, and now shippable** | `CompassApiController.cs` and `CsrfHeaderGuard.cs` unmodified this round (worktree = index); `[HttpPost]` + `Route("recompute/national-stats")` at `:295-296` with both guards at `:302-303`, same pair at `:315-316`; `MatchesEntry` changed only by threading `settingKey`. Round 3's "fixed in source but unshippable" caveat no longer applies. |
| SEC-09 | Minor | **Half closed; listener half Open — non-blocking** | Key attribution **fixed and verified** (`IsAllowed` → `AllowedIpsAppSettingKey`, `IsTrustedProxy` → `TrustedProxyCidrsAppSettingKey`). No trace listener anywhere still — `devops`. |
| **SEC-12** | **Minor (new)** | **Open — non-blocking** | `anyTrustedProxyConfigured` counts *configured* entries, not *usable* ones, so an all-malformed trusted-proxy list (typo) skips the SEC-11 deny and resolves to the LB's own address; same landing spot if the trusted list misses the LB's real address, or if a trusted peer sends no XFF. Needs **two** config mistakes and the code comment now forbids the overlap ⇒ Minor. Silent, so worth ~3 lines of hardening. |
| SEC-04 / 05 / 06 / 07 | Minor | **Open, out of this gate's scope** | SEC-06 **widened**: two keys now, PRE-03 names neither, and after the SEC-11 fix they are hard-coupled. |
| SEC-P1 / P2 / P3 / P4 | Critical ×2, Important, mixed | **Open, out of scope, unchanged** | SEC-P2 (committed production `token_secret` + DB passwords) is still the largest real exposure in this document and still needs a human, independent of this gate. **SEC-P4 is new information** from adding `-restore`. |

**Answering the gate question directly:** yes — Phase 2's `🔒 Security gate` is closed and
passable, and it is closed **by fix**, not by acceptance or by my waving anything through.
Two rounds ago I said the gate had nothing to gate because the project did not build; that
is no longer true, and I verified it with my own build rather than a report. Everything that
remains Open is Minor by my rating.

**But "gate closed" is narrower than "safe to deploy."** These are out of this gate's scope
and every one of them is still real, unfixed and untracked by any code change:

1. **SEC-P2 — Critical, needs a human now.** Live production credentials in tracked files:
   `prod.config`'s `token_secret` (the **JWT signing key** `[ApiAuthenticate]` trusts), plus
   Azure storage key, SMTP/SMS passwords and `db_password`; `configSource-prod.config`'s six
   DB connection strings. Anyone with repo read access can mint a valid `AUTH_TOKEN` for any
   user — which makes every "requires an authenticated student" precondition in this
   document satisfiable by an outsider, including the one protecting `recompute/*`. Nothing
   in four rounds has addressed it and no rotation-plus-removal has happened (the file was
   *modified* in this tree, so a rotation occurred without moving secrets out of git).
2. **SEC-05** — no audit log of who triggered `recompute`. `design.md` Module B named it
   explicitly as part of failure mode (3); `plan.md` assigns it to no task. After an
   incident there would be no record of which `UserID` or source IP initiated the
   `TRUNCATE`. `system-analyst` (contract) → `backend-engineer`.
3. **SEC-06** — PRE-03 unactionable, and now doubly so; see item 6.
4. **SEC-07** — the `(PREMIUM)` comments sit above endpoints with **zero** server-side
   entitlement check, so the code reads as if Premium is gated when it is not.
   Audit-trail/wording only, but it is exactly how a future reader concludes SEC-P1 is
   handled.
5. **The entitlement chain is still blocked, and that is a *plan* state, not a security
   acceptance.** BE-004 / BE-005 / BE-006 / BE-007 / BE-012 remain `pending` behind
   **OQ-15(a1)/(a2)** and **PRE-06**. Consequence, stated plainly: **SEC-P1 (Critical)
   stands** — no `CheckEntitlement` exists anywhere in the codebase, every Premium endpoint
   returns its full payload to any authenticated student, and the only "gate" is
   `localStorage['compass_premium']`, which `design.md` ordered abolished. BE-012 would gate
   the three `debug/*` endpoints (SEC-P3), including the network-wide `debug/national-stats`.
   Because BE-007 is absent, **the IP allowlist this gate just closed is still the *only*
   control on a network-wide `TRUNCATE`** — the design explicitly required two independent
   layers ("ความซ้ำซ้อนคือจุดประสงค์") and one of them is missing by plan.
6. **PRE-03 must configure BOTH keys, together, non-overlapping — and no document says so
   yet.** Verified this round: PRE-03 at `<knowledge>/…/design.md:869` is verbatim
   unchanged and names no key; `grep -rn Compass_Recompute --include=*.config .` returns
   nothing. After the SEC-11 fix the keys are **hard-coupled**:
   `Compass_Recompute_TrustedProxyCIDRs` = the LB's private subnet(s) **only**;
   `Compass_Recompute_AllowedIPs` = the school's **public** range and **never** the VPC
   CIDR; and the two must **not overlap** (SEC-12). Setting only the allowlist now yields
   `recompute/*` returning 404 to **everyone** — fail-closed and safe, but a total outage
   that will present at PRE-04 as "the deploy is broken". `system-analyst` owns the PRE-03
   wording; `devops` owns executing it and verifying by observation, not assumption. Also
   unchanged: **PRE-04 needs both a valid `AUTH_TOKEN` cookie and the `X-Requested-With`
   header**, which no server-side deploy script has — that question still has no answer, and
   "loosen the guard" must not be it.

**Mitigating fact, unchanged and still worth stating**: both keys are absent from every
`.config`, so today `IsAllowed` short-circuits on the empty allowlist and both `recompute/*`
endpoints return 404 to everyone. Nothing in SEC-08/11/12 is live. All of it goes live at
PRE-03 — so PRE-03 should not be performed until item 6 is written down.

Routing after Round 4: **SEC-12 → `backend-engineer`** (≈3 lines, next time the file is
open; not worth a round of its own) **+ `devops`** (config discipline at PRE-03);
**SEC-06 → `system-analyst`** (PRE-03 names both keys + the no-overlap rule) **+ `devops`**;
**SEC-09 → `devops`** (trace listener; the backend half is done); SEC-04 →
`system-analyst` (controller-wide 401/404/405 contract); SEC-05 → `system-analyst` then
`backend-engineer`; SEC-07 → `system-analyst`/wording owner; **SEC-P4 → `devops`** (package
advisory triage); **SEC-P1 → the blocked entitlement chain (plan)**; **SEC-P2 → a human,
now, and independent of this gate.**

---

## Verdict — Round 3 (superseded, retained for the record)

**Phase 2 `🔒 Security gate`: NOT PASSABLE. Three Important findings block it —
SEC-10, SEC-08 and SEC-11.** None has been Accepted by a human.

The single sentence that matters: **the project does not build**, so there is no artifact
to gate, and the fix that would have closed the last Round-2 blocker instead introduced a
compile error and relocated the fail-open surface onto the default configuration path.

| id | Severity | Verdict | Why |
|---|---|---|---|
| **SEC-10** | Important | **Open (new)** — hard blocker | `MSBuild` on the real project exits 1 with exactly one error: CS0165 at `InternalNetworkAccessGuard.cs:205`. Round-2's version of the file compiles clean. One-line fix; must be re-audited with a build. |
| **SEC-08** | Important | **STILL OPEN** — fix claimed, rejected | The trusted-peer logic is **correct** on all four claims and `IsTrustedProxy` reuses SEC-02's `MatchesEntry` with no divergence — but it does not compile (SEC-10) and the untrusted-peer default resolves to the proxy's own address (SEC-11). Both must land. |
| **SEC-11** | Important | **Open (new)** | With the new key unset — today's state, and what PRE-03 as written produces — every LB request resolves to the LB's private address, so the only allowlist value that makes PRE-04 work is a VPC CIDR that admits every authenticated student. Needs a fail-closed code guard **and** a PRE-03 that names both keys with a no-overlap rule. |
| SEC-09 | Minor | **Open — informational, does not block** | Left unfixed by choice. Rationale verified as half right: no logging framework and no trace listener anywhere (true), but `Trace.TraceWarning` has a precedent at `CompassApiController.cs:450` and two DB sinks exist (false). Real close is a listener in config ⇒ re-routed to `devops`. Fails closed, discloses nothing. |
| SEC-01 / 02 / 03 | was Critical / Important ×2 | **Stay closed — no regression** | Re-verified: this round's diff touches only the guard file; the CIDR math is byte-identical to the hand-verified Round-2 code and is now correctly shared by the second path; the controller's `[HttpPost]` + `CsrfHeaderGuard` are intact. Fixed in source, but unshippable while SEC-10 stands. |
| SEC-04 / 05 / 06 / 07 | Minor | **Open, out of this gate's scope** | Unchanged. SEC-06 is now half of SEC-11's documentation fix. |
| SEC-P1 / P2 / P3 | Critical ×2, Important | **Open, out of scope, unchanged** | SEC-P2 (committed production `token_secret` + DB passwords) is still the largest real exposure in this document and still needs a human, independent of this gate. |

**Answering the gate question directly:** it is **not** the case that everything is now
closed or accepted pending only the known out-of-scope items. Two genuinely new blockers
opened in this round, both inside Phase 2's own task scope and both owned by
`backend-engineer`. The out-of-scope set (SEC-05/06/07, SEC-P1/P2/P3, and the entitlement
chain blocked on OQ-15(a1)/(a2)/PRE-06) is unchanged and, as before, does not block this
gate — but it is not what is holding the gate now.

**Cheapest path to a passing gate**, in order:

1. `backend-engineer` — SEC-10: give `forwardedValues` its own `if`, or initialise it to
   `null` and null-check at the use site. **Then run `MSBuild` and confirm exit 0.**
2. `backend-engineer` — SEC-11 code half: in `IsAllowed`, deny when the trusted-proxy list
   is empty **and** an `X-Forwarded-For` header is present. Optionally reject `/0` in the
   trusted-proxy list. While there, one line for SEC-09's key misattribution in
   `LogMalformedEntry`.
3. `system-analyst` + `devops` — SEC-11 doc half (subsumes SEC-06): PRE-03 names both keys,
   set together, non-overlapping; allowlist = school **public** range, never the VPC CIDR;
   trusted-proxy = LB private subnet(s) only.
4. Re-audit (Round 4). SEC-08 closes when 1 and 2 land and a build succeeds.

Alternatively a human Accepts SEC-08 **and** SEC-11 with a `devops` invariant in
`deploy.md` — but SEC-10 must be fixed regardless, since it is a build failure and not a
risk decision.

Still true and still the mitigating fact: **both** `Compass_Recompute_AllowedIPs` and
`Compass_Recompute_TrustedProxyCIDRs` are configured nowhere, so today both `recompute/*`
endpoints return 404 to everyone and nothing in SEC-08/SEC-11 is live. This fix therefore
introduced **no** unarranged deploy dependency. All of it goes live at PRE-03, so
**PRE-03 must not be performed until SEC-08 and SEC-11 are closed or Accepted**, and PRE-04
still needs both a valid `AUTH_TOKEN` cookie and the `X-Requested-With` header, which no
server-side deploy script has (SEC-06).

Routing after Round 3: SEC-10 → `backend-engineer` (build fix, blocking); SEC-11 →
`backend-engineer` (code guard) + `system-analyst`/`devops` (PRE-03 wording); SEC-08 →
stays with `backend-engineer` until 10 and 11 land; SEC-09 → **`devops`** (listener in
config) with a one-line key-attribution fix for `backend-engineer`; SEC-04 →
`system-analyst` (controller-wide 401/404/405 contract); SEC-05 / SEC-06 →
`system-analyst` + `devops`; SEC-07 unchanged (`Recorded`); **SEC-P2 → a human, now.**

---

## Verdict — Round 2 (superseded, retained for the record)

**Phase 2 `🔒 Security gate`: STILL BLOCKED — on one new Important finding, SEC-08, not on
anything from Round 1.**

- SEC-01 (Critical) → **Fixed and closed.** The rightmost-XFF resolution is correct for
  this deployment; every header-only spoof I could construct now denies.
- SEC-02 (Important) → **Fixed and closed.** CIDR math verified by hand; malformed config
  cannot match and cannot crash the check open.
- SEC-03 (Important) → **Fixed and closed.** POST-only plus `X-Requested-With`, and the
  "no CORS" premise it rests on is verified across all four mechanisms this stack could
  use, including the ones the implementer did not check.
- SEC-04 → **confirmed accurate as the implementer reported**, stays Minor/Open. Their
  decision not to restructure a class-level filter unilaterally is the right call.
- **SEC-08 (Important, new)** → the fix is correct *because of* two deployment facts the
  code never checks and no document states: that nothing can reach the app except through
  the single ELB/ALB hop, and that the LB keeps appending to XFF. Plus a concrete code
  defect: the `UserHostAddress` fallback fires on a present-but-empty header, contrary to
  its own comment, which resolves the caller to the load balancer's own private address.
  With BE-007 still unimplemented, this guard is still the *only* control on a
  network-wide `TRUNCATE`, so it should not rest on an unwritten assumption.
- SEC-09 (Minor, new) → malformed-entry warnings have no listener; non-blocking.

**Cheapest path to a passing gate**, in the order I would take it:
1. `backend-engineer`: in `GetClientIp`, gate XFF on a configured trusted-proxy peer and
   return `null` (deny) instead of falling back when the header is present but unusable;
   fix the comment at lines 130-140 to match. ~10 lines, no restructuring, then re-audit.
2. Or: a human Accepts SEC-08 **and** `devops` records the invariant in `deploy.md`
   (instance SG admits only the LB SG; ALB XFF mode `append`; exactly one hop; PRE-03's
   value is the school's public range, never the VPC CIDR).

Unchanged from Round 1 and still true: `Compass_Recompute_AllowedIPs` is configured
nowhere, so today both `recompute/*` endpoints return 404 to everyone and nothing here is
live. All of it becomes live at PRE-03 — so **PRE-03 must not be performed until SEC-08 is
closed or Accepted**, and PRE-04 now needs both a valid `AUTH_TOKEN` cookie and the
`X-Requested-With` header, which no server-side deploy script has today (SEC-06).

Routing after Round 2: SEC-08 → `backend-engineer` (code half) + `devops` (invariant
half); SEC-09 → `backend-engineer` or `devops`; SEC-04 → `system-analyst` as a
controller-wide 401/404/405 contract decision, not a BE-008 patch; SEC-05 / SEC-06 →
`system-analyst` + `devops` unchanged; SEC-07 unchanged (`Recorded`); SEC-P2 (committed
production `token_secret` and DB passwords) → **still unaddressed, still needs a human
now**, and it is the largest real exposure in this document regardless of Phase 2's gate.

---

## Verdict — Round 1 (superseded, retained for the record)

**Phase 2 `🔒 Security gate`: NOT PASSED.**

- BE-009 / BE-010 / BE-011 → **pass**. The IDOR fix is complete and correctly scoped;
  re-audited against real code, no `request.SID` identity read survives, no injection
  introduced.
- BE-008 → **fail**. SEC-01 (Critical): the allowlist is bypassable with one
  `X-Forwarded-For` header behind this app's AWS load balancer, and with BE-007 not yet
  implemented it is the only control on a network-wide `TRUNCATE`. SEC-02 and SEC-03
  (Important) compound it.
- The one piece of good news: `Compass_Recompute_AllowedIPs` is unconfigured, so the tree as
  it stands denies everyone and SEC-01 is not live. It goes live at PRE-03. **This must not
  deploy, and PRE-03 must not be performed, until SEC-01 is fixed and re-audited.**

Route SEC-01 / SEC-02 / SEC-03 / SEC-04 to `backend-engineer`; SEC-05 / SEC-06 to
`system-analyst` + `devops` for the contract and config-documentation halves; SEC-P2 to a
human immediately as a credential-exposure decision independent of this module.

---

## Change Log

- **2026-09-02 — Round 4, re-audit of the claimed SEC-10 / SEC-11 fixes + the SEC-09
  follow-up. Phase 2's `🔒 Security gate` is now CLOSED / passable, with zero blocking
  findings — closed by fix, not by acceptance.** Read the whole
  `Helper/InternalNetworkAccessGuard.cs` from disk as the authority; the file is still `AM`
  with the **Round-2 version in the index**, so `git diff` renders Round-2 → Round-4 and was
  used only for blast radius. **Reproduced the build independently rather than trusting the
  implementer's reported output**: `-t:Build -restore -clp:ErrorsOnly` → exit 0, zero error
  lines, and — because a `Build` can be an incremental no-op — a forced `-t:Rebuild -restore`
  → exit 0, `0 Error(s)`, `129 Warning(s)`, with `Helper\InternalNetworkAccessGuard.cs` in the
  captured `csc.exe` command line at `/langversion:7.3` (the version Round 3 failed under),
  `grep -c CS0165` = 0, and `bin/ClassOnlineWeb.dll` produced; no warning in the entire build
  originates in any `Helper/*.cs` file (measured 129 vs the reported 124 — delta is
  `Build` vs `Rebuild -restore` NU19xx advisories, nothing in the audited file).
  **SEC-10 → Fixed/closed**: the `bool hasForwardedHeader` intermediate is gone,
  `TryGetValues(…, out forwardedValues)` is the `if` condition itself so "definitely assigned
  when true" survives, and I traced that `forwardedValues` has exactly **one** read (`:226`)
  dominated by the assignment with no new `out` local introduced — the pattern is sound, not
  just accepted by the compiler. **SEC-11 → Fixed/closed (code half)**: `anyTrustedProxyConfigured`
  gates a `return null` when XFF is present, and `IsAllowed` short-circuits on that at `:38`
  **before** the allowlist is consulted, so the Round-3 chain is unreachable at step 5 — no
  allowlist value, VPC CIDR included, can convert the misconfiguration into an allow, and the
  operator gets a loud fail-closed 404 at PRE-04 instead of a silent allow-all.
  **Re-confirmed by a full truth table over (list configured / peer trusted / XFF present)
  that the "no proxy in front, direct connection" path was NOT broken** — trusted list empty
  + XFF absent still resolves the real direct peer, because the deny is nested inside the
  `TryGetValues` branch; the deny fires on exactly one of the seven reachable combinations.
  **SEC-08 → Fixed/closed**: both grounds for the Round-3 rejection are gone, and
  `IsInRange`/`NormalizeAddress`/`AddressesEqual` are absent from the diff while `MatchesEntry`
  changed only by threading `settingKey`, so Round 2's hand-verified CIDR math carries forward
  to both callers with no divergence. **SEC-09 follow-up verified done**: `IsAllowed:43` passes
  `AllowedIpsAppSettingKey` and `IsTrustedProxy:117` passes `TrustedProxyCidrsAppSettingKey`, so
  malformed entries log under the correct key; the missing **trace listener** remains Open with
  `devops` and is what makes SEC-12(a) silent. **Confirmed no SEC-01/02/03 regression
  mechanically**: `CompassApiController.cs` and `Helper/CsrfHeaderGuard.cs` are unmodified this
  round (worktree = index), `[HttpPost]` + `Route("recompute/national-stats")` at `:295-296`
  with `IsAllowed` then `HasRequiredHeader` at `:302-303` and the same pair at `:315-316`;
  Round 3's "fixed in source but unshippable" caveat no longer applies. **Opened SEC-12
  (Minor, non-blocking)**: `anyTrustedProxyConfigured` counts *configured* rather than *usable*
  trusted-proxy entries, so an all-malformed list (a typo like `10.0.0.0/8x`) satisfies
  `Count > 0`, skips the new deny, matches no peer and resolves to the **LB's own private
  address** — the outcome SEC-11 removed, reached by another door and silent; same landing spot
  if the trusted list misses the LB's real address, or if a trusted peer sends no XFF. Rated
  **Minor** on the same yardstick as earlier rounds because it needs **two** independent config
  mistakes and the file's own comment now forbids the overlap, versus Round-3 SEC-11's single
  *default* state; fix is ~3 lines (count only parseable entries, and/or deny in `IsAllowed`
  when the resolved client address is itself a trusted proxy). **Opened SEC-P4 (pre-existing,
  out of scope)**: adding `-restore` surfaced NuGet advisories — AutoMapper 7.0.1 (high, the
  only one in this project's `csc` `/reference` list), RestSharp 106.11.4 (high),
  System.IdentityModel.Tokens.Jwt 5.2.1 (moderate — **not** the `AUTH_TOKEN` path, which uses
  `JWT 3.0.1`), NuGet.CommandLine 6.4.0 (critical + high, build-time only) → `devops` triage.
  **Widened SEC-06**: verified PRE-03 at `<knowledge>/…/design.md:869` is **verbatim
  unchanged** and names no key, and `grep -rn Compass_Recompute --include=*.config .` returns
  nothing — so the SEC-11 documentation half did **not** land and now lives here at Minor, since
  with the code guard it yields a fail-closed outage rather than an exposure. SEC-04/05/07 and
  SEC-P1/P2/P3 unchanged. **Nothing Accepted in any round** — the blocking set is empty because
  the fixes were verified, and SEC-P2, SEC-05/06/07, the blocked BE-004/005/006/007/012
  entitlement chain (OQ-15(a1)/(a2)/PRE-06) and the PRE-03 both-keys requirement remain real
  and out of this gate's scope. Closing this gate is **not** a deploy authorisation.
- **2026-09-02 — Round 3, re-audit of the claimed SEC-08 fix + SEC-09's left-unfixed
  position.** Re-done fresh after an earlier Round-3 pass was interrupted by a rate limit;
  that pass had amended only the Open Findings table and the Scope paragraph, so
  `## Summary`, `## Findings — Round 3`, `## Accepted Risks`, `## Verdict` and this log
  still held Round-2 wording. Every conclusion below was re-derived from the real code and
  a real build, not from the partial text, and the stale sections were completed.
  **Added a mechanical oracle this document did not previously have**: `MSBuild
  ClassOnlineWeb/ClassOnlineWeb.csproj -t:Build -p:Configuration=Debug` **exits 1 with
  exactly one error**, plus an isolated Roslyn compile at langversion 7.3/9.0/latest and a
  clean-compiling control extracted from the git index. **Opened SEC-10 (Important,
  blocking)**: `GetClientIp` stores `TryGetValues(…, out forwardedValues)` in a `bool`,
  discarding C#'s "definitely assigned when true" state, then dereferences the variable —
  CS0165 at `:205`; the project does not build, so no artifact contains any Phase-2 fix.
  **SEC-08 → still Open (fix claimed, rejected)** — but the trusted-peer *logic* verifies
  on all four claims: the new `Compass_Recompute_TrustedProxyCIDRs` key is parsed identically
  to the allowlist key and is fail-closed when unset; the direct peer is resolved and
  checked first; `IsTrustedProxy` calls the **same** `MatchesEntry` as `IsAllowed` with **no
  divergence** (`MatchesEntry`/`IsInRange`/`NormalizeAddress`/`AddressesEqual` byte-identical
  to Round 2, so the hand-verified CIDR math is not re-broken in the second path); a spoofed
  XFF from an untrusted peer cannot reach `IsAllowed` by any route (the header variable is
  never read on that branch, and the only other XFF reference in the tree is
  `Web.config:36`'s `HTTP_X_FORWARDED_PROTO` HTTPS redirect); and a trusted peer with a
  present-but-unusable XFF (empty / whitespace / separators-only) now correctly returns
  `null` (deny) instead of the LB's address — eight attack traces tabulated. **Opened
  SEC-11 (Important)**: with the new key unset — today's state and what PRE-03 as written
  produces, since PRE-03 names no key — XFF is never consulted and every LB request resolves
  to the LB's private address, so the only allowlist value that makes PRE-04 work is a VPC
  CIDR containing the LB's ENI, which admits every authenticated student; Round 2 hit this
  only on an absent/malformed header, Round 3 makes it the default path. Needs a fail-closed
  code guard plus a PRE-03 that names both keys with a no-overlap rule. Recorded two
  non-blocking SEC-08 residuals: the code trusts exactly one hop (two hops fail closed), and
  `0.0.0.0/0` in the trusted-proxy list silently reverts to Round-2 behaviour. **Confirmed
  no SEC-01/02/03 regression** — `git diff --stat` shows this round touches only the guard
  file, the controller's `[HttpPost]`/`[HttpGet]` + `CsrfHeaderGuard` are intact at
  `CompassApiController.cs:295-322`, and the CIDR block is unchanged; all three stay closed
  but are unshippable while SEC-10 stands. **Confirmed both config keys are absent from
  every `.config`** (`Web.config`, `prod.config`, `dev.config`, `configSource-prod/dev`,
  `Web.Debug/Release`), so the tree remains fail-closed on both and this fix introduced **no**
  unarranged deploy dependency. **SEC-09 → Open, informational, non-blocking**: the "no
  logging convention" rationale verified as half right (no log4net/NLog/Serilog/App
  Insights/Elmah in `packages.config` and no `<system.diagnostics>` or trace listener in any
  deployed config — but `Trace.TraceWarning` has a precedent at `CompassApiController.cs:450`
  and `Global.asax.cs` drains two DB sinks); the real close is a listener in configuration,
  so re-routed to `devops`, with a one-line key-attribution fix in `LogMalformedEntry` left
  with `backend-engineer`. SEC-04/05/06/07 and SEC-P1/P2/P3 unchanged. **Nothing Accepted**
  in any round. Phase 2's `🔒 Security gate` **does not pass** — blocking set is now
  SEC-10 + SEC-08 + SEC-11.
- **2026-09-02 — Round 2, re-audit of claimed fixes for SEC-01/02/03 + SEC-04
  confirmation.** Read the real code, not the implementer's report: both helper files are
  **untracked**, so `git diff` shows nothing for them and they were read in full from
  disk. **SEC-01 (Critical) → Fixed**: rightmost-`X-Forwarded-For` resolution is correct
  for this deployment (Classic ELB and ALB both append; ALB `xff_header_processing.mode`
  defaults to `append`), and six spoof variants — spoofed value, spoofed value appended
  last, trailing commas, trailing garbage, non-parseable rightmost, duplicate header lines
  — all deny. **SEC-02 (Important) → Fixed**: CIDR bitmask math hand-verified (byte order,
  `unchecked` partial-byte mask, `/0` `/24` `/25` `/31` `/32` `/33` `/128` `/129`, negative
  and overflowing prefixes, family mixing) and twelve malformed entry forms all fail
  closed; `::1` and `::ffff:` normalisation gaps closed. **SEC-03 (Important) → Fixed**:
  `[HttpPost]` + `X-Requested-With`, with the "no CORS" premise verified four ways (no
  `Microsoft.AspNet.WebApi.Cors` package, no `EnableCors`, no `Access-Control`/
  `<customHeaders>` in any config, no HTTP module/`BeginRequest`/OWIN, no
  `crossdomain.xml`/`clientaccesspolicy.xml`, and `OPTIONSVerbHandler` explicitly
  removed); confirmed it blocks `<img>`, cross-origin form POST **and** cross-origin XHR,
  and that no client code calls `recompute/*` so nothing regresses. **SEC-04 confirmed
  accurate** — `ApiAuthenticateAttribute` is a class-level `AuthorizationFilterAttribute`,
  Web API runs it before the action body where both guards live, so unauthenticated probes
  get 401 (and now 405 for a GET) rather than 404; the decision not to restructure
  unilaterally is endorsed, status unchanged. **Opened SEC-08 (Important)**: XFF is trusted
  without any trusted-peer check and the `UserHostAddress` fallback fires on a
  present-but-empty header contrary to its own comment, so correctness depends on two
  unenforced, undocumented deployment invariants. **Opened SEC-09 (Minor)**:
  `Trace.TraceWarning` has no configured listener. Amended the Round-1 fail-closed table
  (`0.0.0.0/0` now allows all IPv4). Reviewed the incidental
  `AggregateByCanonicalSubjectWeighted` change as security-neutral. Confirmed the project
  targets `v4.8`, so `IsIPv4MappedToIPv6`/`MapToIPv4` compile. SEC-05/06/07 and
  SEC-P1/P2/P3 unchanged. Nothing Accepted — SEC-08 is now the sole blocker on Phase 2's
  `🔒 Security gate`.
- **2026-09-02 — Round 1, Phase 2 (Module B) security audit.** Audited the uncommitted
  BE-008/009/010/011 work against `design.md` `## Premium Entitlement Rules`,
  `## Identity & Scope Rules`, DES-005/DES-006 and Module B's Security Considerations.
  **BE-009/010/011 verified Fixed** (full-file grep for `request.SID`, 401 short-circuit
  ordering, response-object construction all checked in the real code). **BE-008 fails**:
  opened SEC-01 (Critical — leftmost `X-Forwarded-For` is attacker-controlled behind the
  confirmed AWS Elastic Beanstalk + ELB deployment; any authenticated student can
  `TRUNCATE` two network-wide tables), SEC-02 (Important — no CIDR support against
  DES-005/PRE-03), SEC-03 (Important — destructive `TRUNCATE` reachable by cookie-authed
  GET with no CSRF token), SEC-04, SEC-05, SEC-06 (Minor), SEC-07 (Minor, audit-trail —
  `PREMIUM` comments now imply enforcement that does not exist). Confirmed **no injection**
  introduced and the allowlist's **fail-closed logic sound** across seven malformed-config
  cases. Recorded SEC-P1/SEC-P2/SEC-P3 as pre-existing and explicitly **not** closed by
  this round. Nothing Accepted. File created at `_docs/module/sb-compass/security.md`
  (contract write path, matching `review.md`) rather than the repo root, per CLAUDE.md's
  "nothing is written at the repo root".
