---
name: implement
description: >-
  Implement Playwright Page Objects (FE-*) or API Helpers (BE-*), custom fixtures, test data, and specs
  from a test plan (docs/test-plans/plan-{id}.md) or Google Sheets scenario. Discovers UI/API endpoints,
  creates POMs in src/pages/ or API clients in src/helpers/, wires fixtures in src/fixtures/base.fixture.ts,
  writes specs in tests/ui/ or tests/api/, runs verification, and syncs status back to Google Sheets.
---

# Implement Playwright Automation from Test Plan

## Overview
Workflow to turn a test plan (`docs/test-plans/plan-{TC_ID}.md`) or Google Sheets scenario (`FE-*` for Frontend UI, `BE-*` for Backend API) into production-ready Playwright automated tests.

---

## Master Workflow (Phases 1 - 8)

| # | Phase | Output / Done When |
|---|---|---|
| 1 | **Read Plan & Inputs** | Plan parsed (`TC ID` prefix `FE-*` or `BE-*`, `Prerequisites`, `Test Steps`, `Expected Results`, `Tags`). |
| 2 | **Discovery** | For `FE-*`: UI & accessible locators discovered. For `BE-*`: Endpoints, request schemas, and responses discovered. |
| 3 | **Test Data & Preconditions** | Test data/credentials organized under `src/test-data/` or `.env`. |
| 4 | **Architecture Implementation** | For `FE-*`: Page Object in `src/pages/`. For `BE-*`: API helper in `src/helpers/`. |
| 5 | **Fixture Registration** | Fixtures registered in `src/fixtures/base.fixture.ts` for clean dependency injection. |
| 6 | **Spec Implementation** | For `FE-*`: spec in `tests/ui/<feature>.spec.ts`. For `BE-*`: spec in `tests/api/<feature>.spec.ts`. |
| 7 | **Sanity & Test Run** | Run `npx playwright test` to verify passing execution and clean HTML report. |
| 8 | **Google Sheet Sync** | Update `Status AT` in Google Sheets (`All Scenario`) to `Created`. |

---

## Phase 1: Read Inputs & Test Plan

1. **Input:** The argument passed to `/implement` or recent `docs/test-plans/plan-{TC_ID}.md` (e.g. `plan-FE-1.md` or `plan-BE-1.md`).
   - If not provided, inspect `docs/test-plans/` or ask user for the TC ID (e.g., `FE-1`, `BE-1`).
2. **Extract:**
   - **Category:** `FE` (Frontend UI) vs `BE` (Backend API) based on ID prefix.
   - **TC ID & Feature:** e.g., `FE-1` / `Login` or `BE-1` / `AuthAPI`.
   - **Preconditions:** Extracted from sheet's `Precondition` column and baseline setup. Check if `[X]` (ready) or `[ ]` (needs setup).
   - **Test Steps:** Sequential UI actions (`FE`) or API requests (`BE`).
   - **Expected Result:** Target assertion checkpoints.
   - **Tags:** e.g., `{ tag: ["@FE-1", "@Login", "@High", "@smoke", "@regression"] }`.

---

## Phase 2: Discovery (UI / API)

### For Frontend UI (`FE-*`):
1. **Live Discovery via Playwright MCP:**
   - Inspect live page elements, snapshots, and accessibility trees when exploring new or dynamic screens.
2. **Accessibility-First Priority:**
   - `page.getByRole(...)` (button, textbox, heading, link, alert)
   - `page.getByLabel(...)` (labeled form fields)
   - `page.getByPlaceholder(...)` (inputs with placeholder)
   - `page.getByText(...)` (visible text)
   - `page.getByTestId(...)` (test attributes)
   - **Prohibited:** Fragile CSS classes (`.oxd-button--main`) and brittle XPath.

### For Backend API (`BE-*`):
1. **Endpoint & Payload Discovery:**
   - Identify endpoint path (e.g., `/web/index.php/api/v2/...`), HTTP method (`GET`, `POST`, `PUT`, `DELETE`).
   - Identify request headers, payload format (JSON/Form), authentication requirements (cookies/Bearer token).
   - Identify expected response status codes and body attributes.

---

## Phase 3: Test Data Management (`src/test-data/` & `.env`)

1. Store static constants and test data in `src/test-data/` (e.g., `src/test-data/users.data.ts`).
2. Store environment URLs and secret credentials in `.env` (e.g., `BASE_URL`, `ADMIN_USERNAME`, `ADMIN_PASSWORD`).
3. Never hardcode credentials directly in Page Objects, API helpers, or test specs.

---

## Phase 4: Architecture Implementation

### A. Frontend UI (`FE-*`): Page Object Model (`src/pages/`)
1. Create or extend POM class in `src/pages/` (e.g., `login.page.ts`, `dashboard.page.ts`).
2. Declare locators in constructor as `readonly Locator`.
3. Implement action methods (`fill*`, `click*`, `login*`, `search*`).
4. Implement verification methods (`expect*`) with auto-retrying assertions.
5. Implement page readiness check (`waitForPageReady()`).

### B. Backend API (`BE-*`): API Helper (`src/helpers/`)
1. Create or extend API helper class in `src/helpers/` (e.g., `auth.api.ts`, `employee.api.ts`).
2. Accept `APIRequestContext` in constructor:
   ```typescript
   import { type APIRequestContext, type APIResponse } from "@playwright/test";

   export class AuthApi {
     constructor(private readonly request: APIRequestContext) {}

     async login(credentials: object): Promise<APIResponse> {
       return await this.request.post("/web/index.php/auth/validate", {
         data: credentials,
       });
     }
   }
   ```

---

## Phase 5: Fixture Registration (`src/fixtures/base.fixture.ts`)

Wire Page Objects and API clients into `src/fixtures/base.fixture.ts`:

```typescript
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";
import { AuthApi } from "../helpers/auth.api";

export type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  authApi: AuthApi;
};

export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },
  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },
  authApi: async ({ request }, use) => {
    await use(new AuthApi(request));
  },
});

export { expect };
```

---

## Phase 6: Test Spec Implementation

### File Placement:
- **`FE-*` (UI)**: `tests/ui/<feature>.spec.ts` (kebab-case).
- **`BE-*` (API)**: `tests/api/<feature>.spec.ts` (kebab-case).

### Consolidation & 25 Test Limit:
- If target spec file exists and has `< 25` tests, append a new `test(...)` block.
- If it already has 25 tests, create numbered sub-file: `<feature>-2.spec.ts`.

### Spec Standards:
1. Always import `{ test, expect }` from `../../src/fixtures/base.fixture`.
2. Wrap each major action/checkpoint in `test.step()`.
3. Pass tags in second argument object `{ tag: [...] }`:
   - FE Tag: `{ tag: ["@FE-1", "@Login", "@High", "@smoke", "@regression"] }`
   - BE Tag: `{ tag: ["@BE-1", "@Login", "@High", "@api", "@regression"] }`
4. Prohibit `page.waitForTimeout()` (no hardcoded sleeps).

*Example UI Spec (`tests/ui/login.spec.ts`):*
```typescript
import { test, expect } from "../../src/fixtures/base.fixture";
import { VALID_USER } from "../../src/test-data/users.data";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    "FE-1: Login with valid credentials",
    { tag: ["@FE-1", "@Login", "@High", "@smoke", "@regression"] },
    async ({ loginPage, dashboardPage }) => {
      await test.step("Enter valid username and password", async () => {
        await loginPage.login(VALID_USER.username, VALID_USER.password);
      });

      await test.step("Verify successful redirect to Dashboard", async () => {
        await dashboardPage.expectDashboardVisible();
      });
    }
  );
});
```

*Example API Spec (`tests/api/login.spec.ts`):*
```typescript
import { test, expect } from "../../src/fixtures/base.fixture";
import { VALID_USER } from "../../src/test-data/users.data";

test.describe("Authentication API", () => {
  test(
    "BE-1: Validate user login API",
    { tag: ["@BE-1", "@Login", "@High", "@api", "@regression"] },
    async ({ request }) => {
      let response;
      await test.step("Send login request", async () => {
        response = await request.post("/web/index.php/auth/validate", {
          data: VALID_USER,
        });
      });

      await test.step("Verify response status", async () => {
        expect(response.status()).toBe(200);
      });
    }
  );
});
```

---

## Phase 7: Sanity & Verification

1. Run the test:
   - For UI: `npx playwright test tests/ui/<feature>.spec.ts`
   - For API: `npx playwright test tests/api/<feature>.spec.ts`
   - Or by tag: `npx playwright test -g "@FE-1"`
2. Check terminal output: steps must be cleanly logged via `StepReporter`.
3. Check Playwright HTML report / trace if any step fails.
4. Verify no `test.only()` remains.

---

## Phase 8: Google Sheets Sync

Once the test passes:
1. Locate row in Google Sheets (`All Scenario`) matching `TC ID` (e.g., `FE-1`, `BE-1`).
2. Update `Status AT` (Column G) from `Uncreate` / `UnCreate` / `Planned` to `Created` using `GoogleSheetsHelper.updateTestCaseStatus(tcId, 'Created')`.
3. Notify the user with test results and updated status.

