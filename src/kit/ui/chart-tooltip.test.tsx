import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { ChartContext } from "./chart-context"
import { ChartTooltipContent } from "./chart-tooltip"

it("keeps a zero-valued chart label and formats the numeric series value", () => {
  const markup = renderToStaticMarkup(
    <ChartContext.Provider
      value={{ config: { tasks: { label: "Tasks completed" } } }}
    >
      <ChartTooltipContent
        active
        label={0}
        payload={[
          { name: "tasks", value: 1234, graphicalItemId: "tasks-area" },
        ]}
      />
    </ChartContext.Provider>,
  )

  expect(markup).toContain(">0<")
  expect(markup).toContain("Tasks completed")
  expect(markup).toContain((1234).toLocaleString())
})
