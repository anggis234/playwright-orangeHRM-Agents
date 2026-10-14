const fs = require("fs");
const path = require("path");

const MAX_TESTS_PER_FILE = parseInt(process.env.MAX_TESTS_PER_FILE || "25", 10);

function countTestsInFile(filePath) {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines = content.split("\n");
  const testDeclarationRegex = /^\s*test(\.(only|skip|fixme))?\s*\(/;
  const excludeRegex = /^\s*test\.(describe|beforeEach|afterEach|step)/;
  let count = 0;

  for (const line of lines) {
    if (testDeclarationRegex.test(line) && !excludeRegex.test(line)) {
      count++;
    }
  }

  return count;
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

function main() {
  const args = process.argv.slice(2);
  let filesToValidate = [];

  if (args.length > 0 && fs.existsSync(args[0])) {
    const listContent = fs.readFileSync(args[0], "utf-8");
    filesToValidate = listContent
      .split("\n")
      .map((f) => f.trim())
      .filter((f) => f && f.endsWith(".spec.ts") && fs.existsSync(f));
  }

  if (filesToValidate.length === 0) {
    filesToValidate = getAllSpecFiles(path.join(process.cwd(), "tests"));
  }

  console.log(`\n📏 Validating Max Test Cases per file (Limit: ${MAX_TESTS_PER_FILE}) in ${filesToValidate.length} file(s)...`);

  let hasError = false;

  for (const file of filesToValidate) {
    const testCount = countTestsInFile(file);
    if (testCount > MAX_TESTS_PER_FILE) {
      console.error(
        `  ❌ [Limit Exceeded] ${file} has ${testCount} tests (maximum allowed: ${MAX_TESTS_PER_FILE}).` +
          ` Please split into numbered sub-files (e.g. <feature>-2.spec.ts).`
      );
      hasError = true;
    } else {
      console.log(`  ✓ ${file}: ${testCount} / ${MAX_TESTS_PER_FILE} tests`);
    }
  }

  if (hasError) {
    console.error("\n🚫 Max Test Cases validation FAILED! Please split oversized spec files.\n");
    process.exit(1);
  }

  console.log("\n✅ All spec files comply with the maximum test cases limit!\n");
}

main();
