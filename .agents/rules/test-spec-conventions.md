---
trigger: always_on
description: Test specification writing standards, organization, step grouping, and tagging
globs: "tests/**/*.spec.ts"
---

# Test Specification Conventions

## 1. Test Structure Standards
Organize test files logically using `test.describe()`, `test.beforeEach()`, and `test.step()`:

```typescript
import { test, expect } from "../../src/fixtures/base.fixture";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    "TC-01: Login with valid credentials",
    { tag: ["@smoke", "@auth", "@login", "@regression"] },
    async ({ loginPage, dashboardPage }) => {
      await test.step("Enter valid username and password", async () => {
        await loginPage.login("Admin", "admin123");
      });

      await test.step("Verify successful redirect to Dashboard", async () => {
        await dashboardPage.expectDashboardVisible();
      });
    }
  );

  test(
    "TC-02: Login with invalid credentials displays error",
    { tag: ["@auth", "@negative", "@regression"] },
    async ({ loginPage }) => {
      await test.step("Enter invalid credentials", async () => {
        await loginPage.login("invalidUser", "wrongPass");
      });

      await test.step("Verify error message appears", async () => {
        await loginPage.expectErrorMessage("Invalid credentials");
      });
    }
  );
});
```

## 2. Step-by-Step Reporting with `test.step()`
- Always divide test actions into distinct `test.step()` blocks.
- This creates clear, human-readable execution logs in Playwright's HTML report and trace viewer.
- Align step descriptions with the test scenarios (e.g. from the test case management sheet).

## 3. Tagging Guidelines
- Pass tags via the second argument object: `{ tag: ['@FE-1', '@Login', '@High', '@smoke', '@regression'] }`.
- Never put `@tags` directly inside the test title string.
- Common categories:
  - **ID**: `@FE-{id}` (Frontend UI) or `@BE-{id}` (Backend API)
  - **Feature**: `@Login`, `@Dashboard`, `@Admin`, `@PIM`
  - **Priority**: `@High`, `@Medium`, `@Low`
  - **Type**: `@smoke`, `@regression`, `@e2e`, `@negative`, `@api`

## 4. File Size & Maintenance
- Maximum 20–25 test cases per `*.spec.ts` file.
- When test cases for a feature exceed this limit, split them into logical sub-files (e.g., `login.spec.ts`, `login-1.spec.ts`, `login-2.spec.ts`).