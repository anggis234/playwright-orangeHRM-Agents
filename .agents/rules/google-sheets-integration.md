---
description: Google Sheets MCP workflow for managing and syncing test scenarios
globs: "**/*.{spec.ts,ts}"
alwaysApply: false
---

# Google Sheets Test Scenario Sync & Automation

## 1. Overview
This project integrates with Google Sheets via **Model Context Protocol (MCP)** to fetch, create, and synchronize test scenarios directly with automated Playwright specs.

## 2. Connected Spreadsheet Details
* **Spreadsheet Title**: `Scenario OrangeHRM`
* **Spreadsheet ID**: `1bKkHtU7XX7y3YDC2urEegC2Gx803605Xxn92QNhDWPY`
* **Target Sheet**: `All Scenario`

## 3. Sheet Schema & Column Mapping
| Column Header | Column | Purpose | Example |
| :--- | :--- | :--- | :--- |
| `TC ID` | A | Unique Test Case Identifier | `FE-1`, `FE-2`, `BE-1` |
| `Feature` | B | Feature or module name | `Login`, `Dashboard`, `PIM` |
| `Summary` | C | Brief description of the test scenario | `Login with valid credential` |
| `Precondition` | D | Precondition / prerequisites | `User is logged out`, `Valid token` |
| `Step` | E | Detailed step-by-step test instructions | `1. go to login page\n2. fill username...` |
| `Priority` | F | Execution priority | `High`, `Medium`, `Low` |
| `Status AT` | G | Automation status | `Uncreate`, `Planned`, `Created` |

## 4. Automation Workflow
1. **Scenario Discovery**:
   - Query the spreadsheet (`All Scenario`) to identify test cases where `Status AT` is `Uncreate` or pending.
2. **Spec Implementation**:
   - For `FE-*`: Create or update Page Object in `src/pages/` and spec in `tests/ui/*.spec.ts`.
   - For `BE-*`: Create or update API helper in `src/helpers/` and spec in `tests/api/*.spec.ts`.
3. **Status Update**:
   - Once the spec is verified and running, update `Status AT` in the Google Sheet to `Created`.
