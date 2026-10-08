import { expect, it } from "vitest"
import { renderToStaticMarkup } from "react-dom/server"
import { z } from "zod"
import { useAnswerState } from "./answer-context"
import { answerBlocks } from "./answer-definitions"
import {
  answerNodeList,
  createAnswerLibrary,
  defineAnswerComponent,
  lastNodeId,
  type AnswerDraft,
  type AnswerState,
} from "./answer-library"
import { AnswerRenderer } from "./answer-renderer"

function Counter() {
  const [count] = useAnswerState("count", z.number(), 0)

  return <output>{`Count ${count}`}</output>
}

const counter = defineAnswerComponent({
  name: "Counter",
  description: "Shows a count kept in the answer's state.",
  props: z.object({}),
  component: Counter,
})

const library = createAnswerLibrary([...answerBlocks, counter])

const answer = {
  title: "Brand refresh",
  nodes: [
    {
      id: "heading",
      type: "Heading",
      props: { text: "Brand refresh is on track", detail: "24 of 32 done" },
    },
    {
      id: "text",
      type: "Text",
      props: { markdown: "The team **completed 7 tasks** this week." },
    },
    {
      id: "numbers",
      type: "Section",
      props: { title: "This week" },
      children: [
        {
          id: "figures",
          type: "Figures",
          props: { items: [{ label: "Open", value: "8", trend: [12, 10, 8] }] },
        },
      ],
    },
    {
      id: "owners",
      type: "Callout",
      props: { tone: "attention", title: "Two tasks have no owner" },
    },
  ],
}

const render = (
  nodes: AnswerDraft["nodes"],
  streaming = false,
  state?: AnswerState,
) =>
  renderToStaticMarkup(
    <AnswerRenderer
      nodes={nodes}
      library={library}
      streaming={streaming}
      state={state}
    />,
  )

it("validates a finished answer and says what is wrong with a broken one", () => {
  expect(library.validate(answer)).toEqual([])

  const broken = library.validate({
    title: "Broken",
    nodes: [{ id: "a", type: "Figures", props: { items: [] } }],
  })

  expect(broken.join(" ")).toMatch(/nodes\.0/u)
})

it("reads an unfinished answer and finds the node still being written", () => {
  const nodes = answerNodeList.parse([
    { id: "a", type: "Heading", props: { text: "Bra" } },
    { id: "b" },
    "not a node",
    { id: "c", type: "Section", children: [{ id: "d", type: "Text" }] },
  ])

  expect(nodes.map((node) => node.id)).toEqual(["a", "c"])
  expect(lastNodeId(nodes)).toBe("d")
})

it("renders the answer, its children and figures in words", () => {
  const markup = render(answer.nodes)

  expect(markup).toContain("Brand refresh is on track")
  expect(markup).toContain("<strong")
  expect(markup).toContain("This week")
  expect(markup).toContain("Two tasks have no owner")

  expect(library.text(answer.nodes)).toContain("Open: 8")
})

it("holds the place of a node being written until it can be read", () => {
  const open = [
    answer.nodes[0],
    { id: "figures", type: "Figures", props: { items: [{ label: "Op" }] } },
  ]

  const streaming = render(open, true)

  expect(streaming).toContain('data-slot="skeleton"')
  expect(streaming).not.toContain("Op<")

  // Text reads well while it is written, so it renders straight away.
  expect(
    render([{ id: "t", type: "Text", props: { markdown: "Hal" } }], true),
  ).toContain("Hal")

  // Once the answer is finished, invalid or unknown nodes are left out.
  const finished = render([...open, { id: "x", type: "Unknown", props: {} }])

  expect(finished).not.toContain('data-slot="skeleton"')
  expect(finished).toContain("Brand refresh is on track")
})

it("reads state the host kept, and falls back when it isn't valid", () => {
  const nodes = [{ id: "c", type: "Counter", props: {} }]

  expect(render(nodes, false, { count: 3 })).toContain("Count 3")
  expect(render(nodes, false, { count: "three" })).toContain("Count 0")
})

it("describes itself for a model: a recursive tool schema and the components", () => {
  const schema = JSON.stringify(library.toolInputSchema())

  expect(schema).toContain('"Heading"')
  expect(schema).toContain('"children"')
  expect(library.describe()).toContain("## Figures")
})
