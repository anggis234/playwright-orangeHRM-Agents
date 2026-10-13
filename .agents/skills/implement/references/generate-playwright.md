# Generate Playwright Checklist

## Overview
Checklist for generating Playwright Page Objects (FE-*), API Helpers (BE-*), custom fixtures, and specs.

### Checklist
- [ ] **Analyze Plan / Scenario:**
  - Read `docs/test-plans/plan-{id}.md` (Category FE/BE, Prerequisites, Steps, Expected Results).
- [ ] **Frontend UI (FE-*) Architecture:**
  - Check whether target POM class already exists in `src/pages/`.
  - If not, create a new class (e.g., `login.page.ts`).
  - Declare locators in constructor as `readonly Locator`.
  - Prioritize `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`, `getByTestId`.
  - Create focused action methods (`fill*`, `click*`, `login*`, `search*`).
  - Create expectation methods (`expect*`) with auto-retrying assertions.
  - Wire into `src/fixtures/base.fixture.ts`.
- [ ] **Backend API (BE-*) Architecture:**
  - Check whether API helper class exists in `src/helpers/` (e.g., `auth.api.ts`).
  - Accept `APIRequestContext` in constructor.
  - Wire into `src/fixtures/base.fixture.ts` or use Playwright built-in `{ request }`.
- [ ] **Spec Implementation:**
  - Save under `tests/ui/<feature>.spec.ts` for FE or `tests/api/<feature>.spec.ts` for BE.
  - Import `{ test, expect }` from `../../src/fixtures/base.fixture`.
  - Divide actions into `test.step()` blocks.
  - Apply standard tags:
    - FE: `{ tag: ["@FE-xx", "@Feature", "@Priority", "@smoke", "@regression"] }`
    - BE: `{ tag: ["@BE-xx", "@Feature", "@Priority", "@api", "@regression"] }`
  - Prohibit hardcoded delays (`page.waitForTimeout`).
