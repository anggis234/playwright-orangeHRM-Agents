import { test, expect } from "../../src/fixtures/base.fixture";
import { VALID_USER, INVALID_USERNAME_USER } from "../../src/test-data/users.data";

test.describe("Authentication - Login", () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test(
    "FE-1: Login with valid credential",
    { tag: ["@FE-1", "@Login", "@High", "@smoke", "@regression"] },
    async ({ loginPage, dashboardPage }) => {
      await test.step("Enter valid username and password and click login", async () => {
        await loginPage.login(VALID_USER.username, VALID_USER.password);
      });

      await test.step("Verify successful redirect to Dashboard and core elements visible", async () => {
        await dashboardPage.expectDashboardVisible();
        await dashboardPage.expectMenuItemVisible("Admin");
        await dashboardPage.expectMenuItemVisible("PIM");
      });
    }
  );

  test(
    "FE-2: Login with invalid username",
    { tag: ["@FE-2", "@Login", "@High", "@negative", "@regression"] },
    async ({ loginPage, page }) => {
      await test.step("Enter invalid username and valid password and click login", async () => {
        await loginPage.login(INVALID_USERNAME_USER.username, INVALID_USERNAME_USER.password);
      });

      await test.step("Verify error message appears and user remains on login page", async () => {
        await loginPage.expectErrorMessage("Invalid credentials");
        await expect(page).toHaveURL(/.*login/);
      });
    }
  );
});

