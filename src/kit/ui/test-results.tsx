import * as React from "react"
import { CircleCheck, CircleMinus, CircleX, Timer } from "lucide-react"
import { cn } from "cn"

export type TestStatus = "passed" | "failed" | "skipped"

export interface TestCase {
  name: string
  status: TestStatus
  /** Milliseconds. */
  duration?: number
}

export interface TestSuite {
  name: string
  tests: TestCase[]
}

const icons = {
  passed: { icon: CircleCheck, className: "text-(--success)", label: "Passed" },
  failed: { icon: CircleX, className: "text-destructive", label: "Failed" },
  skipped: {
    icon: CircleMinus,
    className: "text-muted-foreground",
    label: "Skipped",
  },
}

function count(suites: TestSuite[], status: TestStatus) {
  return suites.reduce(
    (sum, suite) =>
      sum + suite.tests.filter((test) => test.status === status).length,
    0,
  )
}

/**
 * A test run: a summary line and bar, then each suite's tests with their
 * status in words as well as colour. Pass `details` to show more under a
 * test, such as a failure's stack trace.
 */
function TestResults({
  suites,
  duration,
  details,
  className,
}: {
  suites: TestSuite[]
  /** Milliseconds for the whole run. */
  duration?: number
  /** Extra content under a test, such as a failure's stack trace. */
  details?: (suite: TestSuite, test: TestCase) => React.ReactNode
  className?: string
}) {
  const passed = count(suites, "passed")
  const failed = count(suites, "failed")
  const skipped = count(suites, "skipped")
  const total = passed + failed + skipped

  return (
    <section
      data-slot="test-results"
      aria-label="Test results"
      className={cn("grid min-w-0 gap-3 text-sm", className)}
    >
      <div className="grid gap-1.5">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span
            className={cn(
              "font-medium",
              failed ? "text-destructive" : "text-(--success)",
            )}
          >
            {failed ? `${failed} failed` : "All passed"}
          </span>
          <span className="text-muted-foreground">
            {passed} passed{skipped ? `, ${skipped} skipped` : ""} of {total}
          </span>
          {duration !== undefined && (
            <span className="ms-auto inline-flex items-center gap-1 text-xs text-muted-foreground">
              <Timer className="size-3.5" aria-hidden="true" />
              {duration} ms
            </span>
          )}
        </p>
        <div
          className="flex h-1.5 overflow-hidden rounded-full bg-muted"
          aria-hidden="true"
        >
          <span className="bg-(--success)" style={{ flexGrow: passed }} />
          <span className="bg-destructive" style={{ flexGrow: failed }} />
          <span
            className="bg-muted-foreground/40"
            style={{ flexGrow: skipped }}
          />
        </div>
      </div>
      {suites.map((suite) => (
        <section
          key={suite.name}
          className="grid gap-1"
          aria-label={suite.name}
        >
          <h4 className="font-mono text-xs text-muted-foreground">
            {suite.name}
          </h4>
          <ul className="grid">
            {suite.tests.map((test) => {
              const { icon: Icon, className: tone, label } = icons[test.status]
              const extra = details?.(suite, test)

              return (
                <li key={test.name} className="grid gap-2 py-1">
                  <span className="flex min-w-0 items-start gap-2">
                    <Icon
                      className={cn("mt-0.5 size-4 shrink-0", tone)}
                      aria-hidden="true"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="sr-only">{label}: </span>
                      {test.name}
                    </span>
                    {test.duration !== undefined && (
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {test.duration} ms
                      </span>
                    )}
                  </span>
                  {extra && <div className="ps-6">{extra}</div>}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
    </section>
  )
}

export { TestResults }
