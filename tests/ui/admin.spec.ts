import { test, expect } from "../../src/fixtures/base.fixture";
import { VALID_USER, ADMIN_SEARCH_DATA } from "../../src/test-data/users.data";

test.describe("Admin - User Management", () => {
  test.beforeEach(async ({ loginPage, dashboardPage }) => {
    await test.step("Login as Admin", async () => {
      await loginPage.goto();
      await loginPage.login(VALID_USER.username, VALID_USER.password);
      await dashboardPage.expectDashboardVisible();
    });
  });

  test(
    "FE-2: Search admin and admin searched will show in admin list",
    { tag: ["@FE-2", "@Admin", "@High", "@smoke", "@regression"] },
    async ({ adminPage }) => {
      await test.step("Click admin in sidebar menu", async () => {
        await adminPage.clickAdminMenu();
      });

      await test.step("Verify System Users page is open with admin table visible", async () => {
        await adminPage.waitForPageReady();
        await adminPage.expectAdminTableVisible();
      });

      await test.step(`Fill admin username field with <${ADMIN_SEARCH_DATA.searchUsername}>`, async () => {
        await adminPage.fillUsername(ADMIN_SEARCH_DATA.searchUsername);
      });

      await test.step("Click button search", async () => {
        await adminPage.clickSearch();
      });

      await test.step(`Verify admin <${ADMIN_SEARCH_DATA.searchUsername}> will show in admin list`, async () => {
        await adminPage.expectRecordsFound();
        await adminPage.expectUsernameInTable(ADMIN_SEARCH_DATA.searchUsername);
      });
    }
  );
});
