import { expect, type Locator, type Page } from "@playwright/test";

export class DashboardPage {
  readonly page: Page;
  readonly dashboardHeading: Locator;
  readonly sideNav: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dashboardHeading = page.getByRole("heading", { name: "Dashboard" });
    this.sideNav = page.getByRole("navigation", { name: "Sidepanel" });
  }

  /**
   * Navigate directly to the dashboard page
   */
  async goto(path: string = "/web/index.php/dashboard/index") {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  /**
   * Wait for dashboard indicators to become ready
   */
  async waitForPageReady() {
    await expect(this.dashboardHeading).toBeVisible();
  }

  /**
   * Verify successful redirect to Dashboard and core components are visible
   */
  async expectDashboardVisible() {
    await expect(this.page).toHaveURL(/.*dashboard/);
    await expect(this.dashboardHeading).toBeVisible();
    await expect(this.sideNav).toBeVisible();
  }

  /**
   * Verify specific sidebar navigation menu item is visible
   */
  async expectMenuItemVisible(menuName: string) {
    await expect(this.page.getByRole("link", { name: menuName })).toBeVisible();
  }
}
