import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.resolve(process.cwd(), ".env") });

interface GoogleTokenResponse {
  access_token: string;
  expires_in: number;
  token_type: string;
}

interface SheetValuesResponse {
  values?: string[][];
}

export interface TestCaseScenario {
  tcId: string;
  feature: string;
  summary: string;
  precondition: string;
  step: string;
  priority: string;
  statusAt: string;
  rowIndex: number;
}

export class GoogleSheetsHelper {
  private static async getAccessToken(): Promise<string> {
    const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID;
    const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;
    const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;

    if (!clientId || !clientSecret || !refreshToken) {
      throw new Error("Missing Google Sheets OAuth credentials in .env");
    }

    const res = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });

    const data = (await res.json()) as GoogleTokenResponse;
    if (!data.access_token) {
      throw new Error(`Failed to refresh Google token: ${JSON.stringify(data)}`);
    }
    return data.access_token;
  }

  /**
   * Convert zero-based column index to A1 notation letter (0 -> A, 1 -> B, ..., 6 -> G)
   */
  private static columnIndexToLetter(index: number): string {
    let temp = index;
    let letter = "";
    while (temp >= 0) {
      letter = String.fromCharCode((temp % 26) + 65) + letter;
      temp = Math.floor(temp / 26) - 1;
    }
    return letter;
  }

  /**
   * Fetch all rows from spreadsheet sheet
   */
  public static async fetchSheetRows(
    sheetName: string = "All Scenario"
  ): Promise<string[][]> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID in .env");
    }

    const token = await this.getAccessToken();
    const readUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      sheetName
    )}!A1:Z100`;

    const getRes = await fetch(readUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = (await getRes.json()) as SheetValuesResponse;
    return data.values || [];
  }

  /**
   * Get all test cases mapped from dynamic headers
   */
  public static async getAllTestCases(
    sheetName: string = "All Scenario"
  ): Promise<TestCaseScenario[]> {
    const rows = await this.fetchSheetRows(sheetName);
    if (rows.length < 2) return [];

    const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
    const tcIdCol = headers.findIndex((h) => h.includes("tc") || h.includes("id"));
    const featureCol = headers.findIndex((h) => h.includes("feature"));
    const summaryCol = headers.findIndex((h) => h.includes("summary"));
    const preconCol = headers.findIndex((h) => h.includes("precondition") || h.includes("prerequisite"));
    const stepCol = headers.findIndex((h) => h.includes("step"));
    const priorityCol = headers.findIndex((h) => h.includes("priority"));
    const statusCol = headers.findIndex((h) => h.includes("status"));

    const scenarios: TestCaseScenario[] = [];

    for (let i = 1; i < rows.length; i++) {
      const row = rows[i];
      const tcId = tcIdCol !== -1 ? (row[tcIdCol] || "").trim() : "";
      if (!tcId) continue;

      scenarios.push({
        tcId,
        feature: featureCol !== -1 ? (row[featureCol] || "").trim() : "",
        summary: summaryCol !== -1 ? (row[summaryCol] || "").trim() : "",
        precondition: preconCol !== -1 ? (row[preconCol] || "").trim() : "",
        step: stepCol !== -1 ? (row[stepCol] || "").trim() : "",
        priority: priorityCol !== -1 ? (row[priorityCol] || "").trim() : "",
        statusAt: statusCol !== -1 ? (row[statusCol] || "").trim() : "",
        rowIndex: i + 1,
      });
    }

    return scenarios;
  }

  /**
   * Get a specific test case scenario by TC ID (e.g. "FE-1", "FE-2", "BE-1", or 1)
   */
  public static async getTestCase(
    tcId: string | number,
    sheetName: string = "All Scenario"
  ): Promise<TestCaseScenario | null> {
    const scenarios = await this.getAllTestCases(sheetName);
    const target = String(tcId).trim().toLowerCase();

    const matched = scenarios.find((s) => {
      const current = s.tcId.toLowerCase();
      return current === target || current.endsWith("-" + target);
    });

    return matched || null;
  }

  /**
   * Get all test cases that have Status AT as "Uncreate" (case-insensitive)
   */
  public static async getUncreatedTestCases(
    sheetName: string = "All Scenario"
  ): Promise<TestCaseScenario[]> {
    const scenarios = await this.getAllTestCases(sheetName);
    return scenarios.filter(
      (s) => s.statusAt.trim().toLowerCase() === "uncreate"
    );
  }

  /**
   * Get the next pending test case that has Status AT as "Uncreate"
   */
  public static async getNextUncreatedTestCase(
    sheetName: string = "All Scenario"
  ): Promise<TestCaseScenario | null> {
    const uncreated = await this.getUncreatedTestCases(sheetName);
    return uncreated.length > 0 ? uncreated[0] : null;
  }

  /**
   * Update the status of a specific Test Case ID in Google Sheets dynamically
   * @param tcId Test Case ID (e.g. "FE-1", "FE-2", "BE-1", or 1)
   * @param newStatus New status (e.g. "Planned", "Created", "Passed")
   * @param sheetName Sheet tab name (defaults to "All Scenario")
   */
  public static async updateTestCaseStatus(
    tcId: string | number,
    newStatus: string,
    sheetName: string = "All Scenario"
  ): Promise<boolean> {
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
    if (!spreadsheetId) {
      throw new Error("Missing GOOGLE_SHEETS_SPREADSHEET_ID in .env");
    }

    const rows = await this.fetchSheetRows(sheetName);
    if (rows.length < 2) return false;

    const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
    const tcIdCol = headers.findIndex((h) => h.includes("tc") || h.includes("id"));
    const statusCol = headers.findIndex((h) => h.includes("status"));

    if (tcIdCol === -1 || statusCol === -1) {
      console.error("Could not locate TC ID or Status column in headers:", rows[0]);
      return false;
    }

    const targetTcStr = String(tcId).trim().toLowerCase();
    let targetRowIndex = -1;

    for (let i = 1; i < rows.length; i++) {
      const cellVal = rows[i][tcIdCol] ? rows[i][tcIdCol].toString().trim().toLowerCase() : "";
      if (cellVal === targetTcStr || cellVal.endsWith("-" + targetTcStr)) {
        targetRowIndex = i + 1; // 1-based index in sheets
        break;
      }
    }

    if (targetRowIndex === -1) {
      console.warn(`TC ID ${targetTcStr} not found in sheet ${sheetName}`);
      return false;
    }

    const statusColLetter = this.columnIndexToLetter(statusCol);
    const updateRange = `${sheetName}!${statusColLetter}${targetRowIndex}`;
    const token = await this.getAccessToken();

    const updateUrl = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(
      updateRange
    )}?valueInputOption=USER_ENTERED`;

    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        values: [[newStatus]],
      }),
    });

    return updateRes.ok;
  }
}
