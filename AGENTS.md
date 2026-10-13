# Playwright TypeScript Automation Guidelines

## Project Context
This is an automated testing repository built using **Playwright** and **TypeScript** (e.g. testing web applications such as OrangeHRM).

## Core Architecture
- `src/pages/`: Page Object Model (POM) classes encapsulating page locators and user actions.
- `src/fixtures/`: Custom Playwright test fixtures (`base.fixture.ts`) for clean dependency injection.
- `src/helpers/`: Reusable helpers and API clients.
- `src/test-data/`: Static and dynamic test data and constants.
- `src/utils/`: Generic helper utilities.
- `tests/ui/`: UI test specifications (`*.spec.ts`).
- `.agents/rules/`: Detailed modular guidelines (`project-conventions.md`, `page-object-model.md`, `locators-and-assertions.md`, `test-spec-conventions.md`, `fixtures-and-setup.md`, `google-sheets-integration.md`).
- `.agents/mcp_config.json`: Workspace MCP server configurations (Playwright & Google Sheets).

## Essential Rules
1. **Accessibility-First Locators**: Use `getByRole()`, `getByLabel()`, `getByPlaceholder()`, `getByText()`. Avoid fragile CSS and XPath selectors.
2. **Auto-Retrying Assertions**: Always use web-first assertions (`await expect(locator).toBeVisible()`). Never use static boolean assertions (`expect(await ...).toBe(true)`).
3. **No Arbitrary Sleep**: Never use `page.waitForTimeout()`.
4. **Structured Test Steps**: Wrap test steps inside `test.step("...")` for granular HTML reporting.
5. **Fixtures Over Manual Instantiation**: Inject Page Objects using fixtures extended from `@playwright/test`.
6. **Independence**: Every test must run independently and be CI/CD ready.
