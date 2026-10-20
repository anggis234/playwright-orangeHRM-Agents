const fs = require("fs");
const path = require("path");

const TEST_ID_REGEX = /@(FE|BE)-\d+/i;

/**
 * Extract tests from file content
 * Matches: test("title", { tag: [...] }, ...) or test('title', ...)
 */
function extractTestsFromFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const tests = [];

  // Regex to detect test( declarations, excluding test.describe, test.step, test.beforeEach, test.afterEach
  const testDeclarationRegex = /^\s*test(\.(only|skip|fixme))?\s*\(/;
  const excludeRegex = /^\s*test\.(describe|beforeEach|afterEach|step)/;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (testDeclarationRegex.test(line) && !excludeRegex.test(line)) {
      // Gather lines around the declaration up to the opening function body
      let block = "";
      for (let j = i; j < Math.min(lines.length, i + 8); j++) {
        block += " " + lines[j].trim();
        if (block.includes("async") || block.includes("=>") || block.includes("function")) {
          break;
        }
      }

      // Extract title
      const titleMatch = block.match(/test(?:\.\w+)?\s*\(\s*["'`]([^"'`]+)["'`]/);
      const title = titleMatch ? titleMatch[1] : `Test at line ${i + 1}`;

      // Extract tags from { tag: [...] } or { tag: "..." }
      let tags = [];
      const tagArrayMatch = block.match(/tag\s*:\s*\[([^\]]+)\]/);
      if (tagArrayMatch) {
        tags = tagArrayMatch[1]
          .split(",")
          .map((t) => t.trim().replace(/["'`]/g, ""))
          .filter(Boolean);
      } else {
        const tagSingleMatch = block.match(/tag\s*:\s*["'`]([^"'`]+)["'`]/);
        if (tagSingleMatch) {
          tags = [tagSingleMatch[1]];
        }
      }

      // Check for @FE-* or @BE-* tag
      const matchedTag = tags.find((t) => TEST_ID_REGEX.test(t));
      const testId = matchedTag ? matchedTag.toUpperCase() : null;

      tests.push({
        file: filePath,
        line: i + 1,
        title,
        tags,
        testId,
      });
    }
  }

  return tests;
}

/**
 * Collect all .spec.ts files recursively in a directory
 */
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

function main() {
  const args = process.argv.slice(2);
  let filesToValidate = [];

  if (args.length > 0 && fs.existsSync(args[0])) {
    const listContent = fs.readFileSync(args[0], "utf-8");
    filesToValidate = listContent
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f && f.endsWith(".spec.ts"))
      .map((f) => path.resolve(f))
      .filter((f) => fs.existsSync(f));
  }

  // Fallback: validate all specs in tests/ if no files provided or list is empty
  if (filesToValidate.length === 0) {
    filesToValidate = getAllSpecFiles(path.resolve(process.cwd(), "tests"));
  }

  // Also collect all existing tests in repo to detect cross-file duplicates
  const allRepoSpecFiles = getAllSpecFiles(path.resolve(process.cwd(), "tests"));
  const allRepoTests = [];
  for (const file of allRepoSpecFiles) {
    allRepoTests.push(...extractTestsFromFile(path.resolve(file)));
  }

  console.log(`\n🔍 Validating Test IDs in ${filesToValidate.length} spec file(s)...`);

  let hasError = false;
  const missingIdErrors = [];
  const duplicateIdErrors = [];

  // 1. Check for missing Test IDs in target files
  for (const file of filesToValidate) {
    const tests = extractTestsFromFile(file);
    for (const t of tests) {
      if (!t.testId) {
        const displayFile = path.relative(process.cwd(), t.file);
        missingIdErrors.push(
          `  ❌ [Missing Test ID] ${displayFile}:${t.line} - "${t.title}" (tags: [${t.tags.join(", ")}])`
        );
        hasError = true;
      }
    }
  }

  // 2. Check for duplicate Test IDs across the entire repository
  const testIdMap = new Map();
  for (const t of allRepoTests) {
    if (!t.testId) continue;
    if (!testIdMap.has(t.testId)) {
      testIdMap.set(t.testId, []);
    }
    testIdMap.get(t.testId).push(t);
  }

  for (const [testId, occurrences] of testIdMap.entries()) {
    if (occurrences.length > 1) {
      // Only report if at least one occurrence is in the files being validated
      const isRelevant = occurrences.some((o) =>
        filesToValidate.includes(path.resolve(o.file))
      );
      if (isRelevant) {
        const locations = occurrences
          .map(
            (o) =>
              `${path.relative(process.cwd(), o.file)}:${o.line} ("${o.title}")`
          )
          .join("\n      - ");
        duplicateIdErrors.push(`  ❌ [Duplicate Test ID: ${testId}]\n      - ${locations}`);
        hasError = true;
      }
    }
  }

  // Output results
  if (missingIdErrors.length > 0) {
    console.error("\nFound test(s) with missing @FE-* or @BE-* tags:");
    missingIdErrors.forEach((e) => console.error(e));
  }

  if (duplicateIdErrors.length > 0) {
    console.error("\nFound duplicate Test IDs:");
    duplicateIdErrors.forEach((e) => console.error(e));
  }

  if (hasError) {
    console.error("\n🚫 Test ID validation FAILED! Please resolve the errors above.\n");
    process.exit(1);
  }

  console.log("✅ All Test IDs are valid, correctly tagged (@FE-* / @BE-*), and unique!\n");
}

main();
