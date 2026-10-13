---
description: Project architecture, directory structure, and coding standards for tsPlaywright
alwaysApply: true
---

# Project Conventions & Architecture

## 1. Tech Stack
- **Framework**: [Playwright](https://playwright.dev/) (`@playwright/test`) + **TypeScript**
- **Runtime**: Node.js (v20+)
- **Configuration**: `playwright.config.ts`
- **Environment Management**: `.env` (managed with `dotenv`)

## 2. Directory Structure
```text
tsPlaywright/
├── .agents/                    # Agent customizations (rules, skills, mcp_config.json)
│   ├── rules/                  # Project-specific guidelines
│   └── mcp_config.json         # Workspace MCP configuration
├── src/
│   ├── pages/                  # Page Object Model (POM) classes
│   ├── fixtures/               # Custom Playwright fixtures (e.g. base.fixture.ts)
│   ├── helpers/                # API helpers and custom utilities
│   ├── test-data/              # Test data, constants, credentials
│   └── utils/                  # Reusable utility functions
├── tests/
│   ├── ui/                     # End-to-end UI test specifications (*.spec.ts)
│   └── api/                    # API test specifications (if applicable)
├── playwright-report/          # HTML test execution report
└── playwright.config.ts        # Main Playwright test configuration
```

## 3. General Rules
1. **Isolation**: Every test must be completely independent and idempotent. Do not rely on previous tests to set state.
2. **Clean Imports**:
   - Prefer structured imports. If path aliases are configured (`@pages/*`, `@fixtures/*`), use them consistently.
   - For spec files using custom fixtures, import `{ test, expect }` from `@fixtures/base.fixture` or `../../src/fixtures/base.fixture`.
3. **Environment Variables**:
   - Store sensitive data (credentials, secrets, base URLs) in `.env`.
   - Never commit `.env` or credential files to version control (`.gitignore`).
4. **CI/CD Hygiene**:
   - Never leave `test.only()` committed in test specs.
   - All tests must pass in headless mode (`npx playwright test`).
5. **No Hardcoded Delays**:
   - Never use arbitrary `page.waitForTimeout(5000)`. Always use web-first auto-retrying assertions or dynamic state waits.
