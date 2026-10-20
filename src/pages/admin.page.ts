import { expect, type Locator, type Page } from "@playwright/test";

export class AdminPage {
  readonly page: Page;
  readonly pageHeading: Locator;
  readonly adminSidebarLink: Locator;
  readonly usernameSearchInput: Locator;
  readonly searchButton: Locator;
  readonly resetButton: Locator;
  readonly adminTable: Locator;
  readonly recordsFoundText: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageHeading = page.getByRole("heading", { name: "System Users" });
    this.adminSidebarLink = page.getByRole("link", { name: "Admin" });
    this.usernameSearchInput = page
      .locator(".oxd-input-group")
      .filter({ hasText: "Username" })
      .locator("input");
    this.searchButton = page.getByRole("button", { name: "Search" });
    this.resetButton = page.getByRole("button", { name: "Reset" });
    this.adminTable = page.getByRole("table");
    this.recordsFoundText = page
      .locator("span")
      .filter({ hasText: /Records? Found/i })
      .first();
  }

  /**
   * Navigate directly to the System Users (Admin) page
   */
  async goto(path: string = "/web/index.php/admin/viewSystemUsers") {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  /**
   * Click Admin menu link from the sidebar
   */
  async clickAdminMenu() {
    await this.adminSidebarLink.click();
    await this.waitForPageReady();
  }

  /**
   * Wait for the Admin / System Users page to be ready
   */
  async waitForPageReady() {
    await expect(this.page).toHaveURL(/viewSystemUsers|viewAdminModule/);
    await expect(this.pageHeading).toBeVisible();
    await expect(this.searchButton).toBeVisible();
  }

  /**
   * Fill the Username search field
   */
  async fillUsername(username: string) {
    await this.usernameSearchInput.fill(username);
  }

  /**
   * Click the Search button and wait for user API request to complete
   */
  async clickSearch() {
    const searchResponsePromise = this.page.waitForResponse(
      (resp) =>
        resp.url().includes("/api/v2/admin/users") && resp.status() === 200
    );
    await this.searchButton.click();
    await searchResponsePromise;
  }

  /**
   * Perform complete search by username
   */
  async searchByUsername(username: string) {
    await this.fillUsername(username);
    await this.clickSearch();
  }

  /**
   * Assert the admin list table is visible
   */
  async expectAdminTableVisible() {
    await expect(this.adminTable).toBeVisible();
  }

  /**
   * Assert a specific username appears in the admin list table
   */
  async expectUsernameInTable(username: string) {
    await expect(
      this.adminTable.getByRole("cell", { name: username, exact: true })
    ).toBeVisible();
  }

  /**
   * Assert that the records count text is visible and does not say 'No Records Found'
   */
  async expectRecordsFound() {
    await expect(this.recordsFoundText).toBeVisible();
    await expect(this.recordsFoundText).not.toHaveText(/No Records Found/i);
  }
}
