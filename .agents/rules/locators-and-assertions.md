---
description: Locator strategy, waiting patterns, and web-first assertions
globs: "**/*.{spec.ts,ts}"
alwaysApply: false
---

# Locator Strategy & Web-First Assertions

## 1. Locator Priority (Accessibility-First)
Always prioritize user-facing locators in the following order:

1. `page.getByRole(...)` — Buttons, headings, links, dialogs, checkboxes
2. `page.getByLabel(...)` — Form fields with attached `<label>`
3. `page.getByPlaceholder(...)` — Inputs with placeholder text
4. `page.getByText(...)` — Non-interactive text content
5. `page.getByAltText(...)` / `page.getByTitle(...)` — Images or title tooltips
6. `page.getByTestId(...)` — Explicit test identifiers (`data-testid`)

```typescript
// GOOD: Resilient, accessible locators
page.getByRole("button", { name: "Login" });
page.getByPlaceholder("Username");
page.getByLabel("Password");

// BAD: Brittle implementation-dependent selectors
page.locator(".oxd-button--main");
page.locator("#app > div.orangehrm-login-layout > div input");
page.locator("//button[contains(@class, 'orangehrm-login-button')]");
```

## 2. Web-First Auto-Retrying Assertions
Always use Playwright's web-first assertions that automatically wait and retry until the condition passes or timeout is reached:

```typescript
// GOOD: Auto-retrying assertions
await expect(page.getByRole("heading", { name: "Dashboard" })).toBeVisible();
await expect(page).toHaveURL(/.*dashboard/);
await expect(locator).toHaveText("Invalid credentials");
await expect(locator).toBeEnabled();

// BAD: Immediate evaluation without auto-retry
expect(await locator.isVisible()).toBeTruthy();
expect(await page.textContent(".error")).toBe("Invalid credentials");
```

## 3. Dynamic Waiting Patterns
- **Built-in Waiting**: Most Playwright actions (`click()`, `fill()`) auto-wait for element actionable states (attached, visible, stable, enabled).
- **Navigation/URL**: Use `await page.waitForURL('/dashboard')` or `await expect(page).toHaveURL(...)`.
- **Network States**: Use `await page.waitForLoadState('networkidle')` or `await page.waitForResponse(...)` for API-driven state transitions.
- **FORBIDDEN**: `await page.waitForTimeout(...)` (hard sleep). Never use fixed pauses.
