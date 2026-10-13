---
description: Page Object Model (POM) design patterns and conventions
globs: "src/pages/**/*.ts"
alwaysApply: false
---

# Page Object Model (POM) Conventions

## 1. Class Structure Standard
Every Page Object represents a web page or reusable UI component:

```typescript
import { expect, type Locator, type Page } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.usernameInput = page.getByPlaceholder("Username");
    this.passwordInput = page.getByPlaceholder("Password");
    this.loginButton = page.getByRole("button", { name: "Login" });
    this.errorMessage = page.getByRole("alert");
  }

  /**
   * Navigate to the target page
   */
  async goto(path: string = "/web/index.php/auth/login") {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  /**
   * Wait for key page indicators or loading states
   */
  async waitForPageReady() {
    await expect(this.usernameInput).toBeVisible();
  }

  /**
   * Action methods: prefix with action verbs (fill, click, login, submit)
   */
  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  /**
   * Verification methods: prefix with expect*
   */
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
```

## 2. POM Rules
1. **Encapsulation**: All locators must be `readonly Locator` and initialized inside the `constructor`.
2. **Accessibility-First Selectors**: Prioritize `getByRole`, `getByLabel`, `getByPlaceholder`, `getByText`. Avoid brittle CSS selectors and XPath.
3. **No Hardcoded Test Data**: Pass credentials, search queries, or form inputs as method arguments.
4. **Action vs Assertion Naming**:
   - Actions: `fill*`, `click*`, `select*`, `navigateTo*`, `search*`.
   - Assertions: `expect*` (e.g., `expectLoginSuccess()`, `expectErrorMessage()`).
   - Getters: `get*` (e.g., `getRowCount()`, `getHeaderTitle()`).
5. **Page Readiness**: Provide `waitForPageReady()` when pages have dynamic AJAX/SPAs or loading spinners.
