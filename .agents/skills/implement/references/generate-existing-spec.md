# Generate Spec from Existing Spec Checklist

## Overview
Checklist for adding new test scenarios into existing test spec files.

### Checklist
- [ ] Check target spec file: `tests/ui/<feature>.spec.ts` (for FE-*) or `tests/api/<feature>.spec.ts` (for BE-*).
- [ ] Count existing `test(...)` blocks.
- [ ] If existing tests < 25:
  - Append the new scenario inside a logical `test.describe(...)` block.
- [ ] If existing tests >= 25:
  - Create a new numbered file: `<feature>-2.spec.ts` (or next increment).
- [ ] Reuse existing Page Objects, API helpers, and registered fixtures from `src/fixtures/base.fixture.ts`.
- [ ] Wrap steps in `test.step()` aligned with the test scenario.
- [ ] Apply unique test case tags (`@FE-{id}` or `@BE-{id}`).
- [ ] Run test locally to ensure no regressions.
