const fs = require("fs");
const path = require("path");

const TEST_ID_REGEX = /@(FE|BE)-\d+/gi;

function extractTestIdsFromFiles(files) {
  const ids = new Set();
  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const matches = content.match(TEST_ID_REGEX) || [];
    for (const m of matches) {
      ids.add(m.replace("@", "").toUpperCase());
    }
  }
  return Array.from(ids);
}

function getAllSpecFiles(dir, fileList = []) {
  if (!fs.existsSync(dir)) return fileList;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    if (fs.statSync(filePath).isDirectory()) {
      getAllSpecFiles(filePath, fileList);
    } else if (file.endsWith(".spec.ts")) {
      fileList.push(filePath);
    }
  }
  return fileList;
}

async function getAccessToken(clientId, clientSecret, refreshToken) {
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
  const data = await res.json();
  return data.access_token;
}

async function main() {
  const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID;
  const clientId = process.env.GOOGLE_SHEETS_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_SHEETS_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_SHEETS_REFRESH_TOKEN;

  if (!spreadsheetId || !clientId || !clientSecret || !refreshToken) {
    console.log("ℹ️ Google Sheets credentials not configured in environment secrets.");
    console.log("   Skipping Google Sheets synchronization check.");
    process.exit(0);
  }

  const args = process.argv.slice(2);
  let files = [];
  if (args.length > 0 && fs.existsSync(args[0])) {
    const listContent = fs.readFileSync(args[0], "utf-8");
    files = listContent
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f && f.endsWith(".spec.ts") && fs.existsSync(f));
  }
  if (files.length === 0) {
    files = getAllSpecFiles(path.join(process.cwd(), "tests"));
  }

  const testIds = extractTestIdsFromFiles(files);
  if (testIds.length === 0) {
    console.log("ℹ️ No Test IDs found in changed files. Skipping Google Sheets check.");
    process.exit(0);
  }

  console.log(`\n📊 Checking ${testIds.length} Test ID(s) against Google Sheets: ${testIds.join(", ")}...`);

  try {
    const token = await getAccessToken(clientId, clientSecret, refreshToken);
    if (!token) {
      console.warn("⚠️ Unable to acquire Google Sheets token. Skipping sync check.");
      process.exit(0);
    }

    const sheetName = "All Scenario";
    const res = await fetch(
      `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodeURIComponent(sheetName)}!A1:G100`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    const data = await res.json();
    const rows = data.values || [];

    if (rows.length < 2) {
      console.log("⚠️ No data found in sheet All Scenario.");
      process.exit(0);
    }

    const headers = rows[0].map((h) => (h || "").trim().toLowerCase());
    const tcIdCol = headers.findIndex((h) => h.includes("tc") || h.includes("id"));
    const statusCol = headers.findIndex((h) => h.includes("status"));

    for (const testId of testIds) {
      let matchedRow = null;
      for (let i = 1; i < rows.length; i++) {
        const rowVal = rows[i][tcIdCol] ? rows[i][tcIdCol].toString().trim().toUpperCase() : "";
        if (rowVal === testId || rowVal.endsWith("-" + testId)) {
          matchedRow = rows[i];
          break;
        }
      }

      if (matchedRow) {
        const status = statusCol !== -1 ? matchedRow[statusCol] : "N/A";
        console.log(`  ✓ [Google Sheets] Found ${testId} - Status AT: ${status}`);
      } else {
        console.warn(`  ⚠️ [Google Sheets] Test ID ${testId} not found in spreadsheet.`);
      }
    }

    console.log("✅ Google Sheets check completed successfully!\n");
  } catch (err) {
    console.warn("⚠️ Error connecting to Google Sheets:", err.message);
    console.log("Continuing workflow without failing build.");
  }
}

main();
