# Phase 5 — source implementation and local evidence, 2026-11-04

Implementation report: [SchoolBot Phase 5 report](../../../../target/school-bot/docs/phase5-implementation-2026-11-04.md).

The requested BE-015..018, BE-031..038, FE-013..015, FE-018..024 and QA-011..016 records now describe implementation progress and remaining acceptance work. FE-016 is also updated because account-scoped progress is part of the delivered flow. IDs, ownership, dependencies, phase assignment and gate definitions are preserved. Existing verified records are not downgraded. `in-progress` means source/local evidence exists; it does not mean production acceptance passed.

## Code-only continuation

User instruction: “ไม่ต้องทดสอบ ทำแค่ code ก็พอ”. Subsequent work adds key-file loading/local setup source, a strict PostgreSQL school authority adapter, current export-teacher resolution, existing PGGrade cell discovery and transactional CAS/receipt writer source, a legacy calculation/document port, skipped-cell handling and overlapping-export rejection. No subsequent build/test/lint, live database connection, key generation, server start or deployment was performed. The counts below predate these changes and do not validate them.

PostgreSQL uses the new adapters; timestamp-zone configuration is mandatory. Unknown movement/non-active/duplicate histories remain denied. Grade writes still require a separately supplied reviewed `GradeExportWriteAuthorization`; a config switch cannot approve parity/coexistence. Keep/replace resolution, fresh preview confirmation, atomic supersession and unknown-commit receipt reconciliation have now been coded across the service/Gateway/teacher UI. QA tasks remain in progress, with execution of new checks omitted at the user's request.

Local results: SchoolBot 4,445 tests; Gateway SchoolBot slice 34 tests; Go six packages plus vet; desktop frontend 24 tests plus production build/asset scan; teacher web eight tests plus targeted TypeScript/ESLint; helper eight unit tests plus five isolated BFF tests. Admin feature TypeScript has zero feature errors but 33 dependency diagnostics, so the whole repository is not declared clean.

The helper reuses its existing login and sends a server-signed 60-second JWT assertion. Its same-origin BFF and Gateway both use `/api/service-school-bot/admin/...`. Desktop license proofs use the exact versionless HTTP path, and SchoolBot validates that same path; client and server must be updated together. Gateway maps the exact active TAdmin relation; deployment signing configuration still needs to be supplied. No CR creation, new permission grant, production mutation, or BAAN execution was performed. Source changes were committed separately per repository at the user's request; the route correction remains code-only and untested.

## Browser evidence

Real Admin form components were rendered with fixture-only data. Checks cover metadata/lesson save callbacks, keyboard focus, loading disable state and mobile horizontal overflow. This is component evidence, not deployed full-flow acceptance.

- [Desktop screenshot](phase5-admin-desktop-2026-11-04.png)
- [Mobile screenshot](phase5-admin-mobile-2026-11-04.png)

## Outstanding acceptance dependencies

- Trusted transport/module deployment and real helper signing configuration.
- Verification of the strict school authority adapter and general movement/history policy.
- Existing curriculum import provenance migration and re-scaffold; input UI accepts normalized Sheet JSON.
- Verification of PGGrade writer/calculator/coexistence/CAS/receipt source, export-principal resolver, keep/replace/supersession and unknown-commit recovery, plus approved write evidence; no live grade export is enabled.
- Signed content inventory, full browser login/permission flows and complete production-like QA-011..QA-016 matrix.

These dependencies are retained explicitly in task notes. No gate or QA verdict is marked passed by this report.
