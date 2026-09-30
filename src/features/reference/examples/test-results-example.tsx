import { StackTrace } from "@/kit/ui/stack-trace"
import { TestResults } from "@/kit/ui/test-results"

export function TestResultsExample() {
  return (
    <TestResults
      className="max-w-xl"
      duration={1284}
      suites={[
        {
          name: "src/demo/csv.test.ts",
          tests: [
            {
              name: "quotes fields with commas",
              status: "passed",
              duration: 3,
            },
            {
              name: "keeps line breaks inside quotes",
              status: "failed",
              duration: 5,
            },
            { name: "reads a byte-order mark", status: "skipped" },
          ],
        },
        {
          name: "src/demo/team.test.ts",
          tests: [
            { name: "invites a member once", status: "passed", duration: 8 },
          ],
        },
      ]}
      details={(_, test) =>
        test.status === "failed" && (
          <StackTrace
            name="AssertionError"
            message="expected 2 rows, received 3"
            frames={[
              {
                name: "<anonymous>",
                file: "src/demo/csv.test.ts",
                line: 42,
                column: 18,
              },
              {
                name: "runTest",
                file: "node_modules/@vitest/runner/dist/index.js",
                line: 1712,
                column: 26,
                internal: true,
              },
            ]}
          />
        )
      }
    />
  )
}
