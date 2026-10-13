import type { Reporter, TestCase, TestResult, TestStep } from "@playwright/test/reporter";

export default class StepReporter implements Reporter {
  onTestBegin(test: TestCase): void {
    console.log(`\n🧪 ${test.title}`);
  }

  onStepBegin(test: TestCase, result: TestResult, step: TestStep): void {
    // Only display user-defined test steps (test.step)
    if (step.category === "test.step") {
      console.log(`   ➜ [Step] ${step.title}`);
    }
  }

  onStepEnd(test: TestCase, result: TestResult, step: TestStep): void {
    if (step.category === "test.step") {
      if (step.error) {
        console.log(`   ✖ [Step Failed] ${step.title}`);
      }
    }
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    if (result.status === "passed") {
      console.log(`   ✓ Selesai (${(result.duration / 1000).toFixed(2)}s)\n`);
    } else if (result.status === "failed" || result.status === "timedOut") {
      console.log(`   ✗ Gagal (${(result.duration / 1000).toFixed(2)}s)\n`);
    }
  }
}
