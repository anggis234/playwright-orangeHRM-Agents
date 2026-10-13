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
   * Navigate to the login page
   */
  async goto(path: string = "/web/index.php/auth/login") {
    await this.page.goto(path);
    await this.waitForPageReady();
  }

  /**
   * Wait for key login page indicators
   */
  async waitForPageReady() {
    await expect(this.usernameInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.loginButton).toBeVisible();
  }

  /**
   * Perform user login
   */
  async login(username: string, pass: string) {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(pass);
    await this.loginButton.click();
  }

  /**
   * Assert error message is visible with expected text
   */
  async expectErrorMessage(message: string) {
    await expect(this.errorMessage).toContainText(message);
  }
}
