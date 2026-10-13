---
description: Custom Playwright fixture setup and dependency injection
globs: "src/fixtures/**/*.ts"
alwaysApply: false
---

# Custom Fixtures & Dependency Injection

## 1. Why Use Custom Fixtures?
Custom fixtures eliminate repetitive instantiation like `const loginPage = new LoginPage(page)` in every single test. Instead, Playwright injects initialized page objects directly into test functions.

## 2. Base Fixture Standard (`src/fixtures/base.fixture.ts`)
```typescript
import { test as base, expect } from "@playwright/test";
import { LoginPage } from "../pages/login.page";
import { DashboardPage } from "../pages/dashboard.page";

// Declare fixture types
export type CustomFixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
};

// Extend base Playwright test
export const test = base.extend<CustomFixtures>({
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },
});

export { expect };
```

## 3. Usage in Test Specs
Always import `test` and `expect` from the custom fixture instead of `@playwright/test`:

```typescript
// In tests/ui/login.spec.ts:
import { test, expect } from "../../src/fixtures/base.fixture";

test("Login test", async ({ loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login("Admin", "admin123");
  await dashboardPage.expectDashboardVisible();
});
```

## 4. Automatic Cleanup & State Management
- Use the `await use(...)` pattern to guarantee teardown actions are executed after each test completes.
- For authenticated sessions, consider Playwright's `storageState` to reuse login cookies/tokens across tests without repeating the UI login form.
