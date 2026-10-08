import type * as React from "react"
import { z } from "zod"

/**
 * One element of an answer: a component from the library by name, its
 * props and any child elements. A model writes these as a display tool's
 * input; `id` is unique within the answer, so state can refer to it.
 */
export interface AnswerNode {
  id: string
  type: string
  props?: unknown
  children?: AnswerNode[]
}

/** A node as it streams: until it is complete, any field may be missing. */
export interface AnswerNodeDraft {
  id?: string
  type?: string
  props?: unknown
  children?: (AnswerNodeDraft | undefined)[]
}

/** An answer as it streams, such as a display tool's partial input. */
export interface AnswerDraft {
  title?: string
  nodes?: (AnswerNodeDraft | undefined)[]
}

/**
 * A value an answer keeps or sends: plain JSON, so it can travel with the
 * message to the model.
 */
export type AnswerValue =
  | string
  | number
  | boolean
  | null
  | AnswerValue[]
  | { [key: string]: AnswerValue }

/** The values a person changed inside an answer, by key. */
export type AnswerState = { [key: string]: AnswerValue }

export interface AnswerComponentProps<Props> {
  props: Props
  /** The node's id, unique within the answer. */
  nodeId: string
  /** The node's children, already rendered. */
  children?: React.ReactNode
}

export type AnswerRender = { element: React.ReactNode } | { issue: string }

export interface AnswerComponent<Schema extends z.ZodType = z.ZodType> {
  name: string
  /** What it shows and when to use it, written for the model. */
  description: string
  props: Schema
  /** Renders while its node is still being written; others wait. */
  streams: boolean
  /** Holds the node's place while it is being written. */
  placeholder?: React.ReactNode
  /** Validates the node's props and renders it, or says why it can't. */
  render: (node: AnswerNode, children: React.ReactNode) => AnswerRender
  /** The node in words, for copying, announcing and summaries. */
  text: (node: AnswerNode) => string
}

/**
 * A component the model can use in an answer: a name, a description for
 * the model, a Zod schema for its props and the React component that draws
 * them. The schema validates whatever the model wrote before it renders.
 */
export function defineAnswerComponent<Schema extends z.ZodType>({
  name,
  description,
  props,
  component: Component,
  streams = false,
  placeholder,
  text,
}: {
  name: string
  description: string
  props: Schema
  component: React.ComponentType<AnswerComponentProps<z.output<Schema>>>
  /** Text and headings read well while written; charts and figures don't. */
  streams?: boolean
  placeholder?: React.ReactNode
  text?: (props: z.output<Schema>) => string
}): AnswerComponent<Schema> {
  return {
    name,
    description,
    props,
    streams,
    placeholder,
    render(node, children) {
      const parsed = props.safeParse(node.props ?? {})

      if (!parsed.success) return { issue: z.prettifyError(parsed.error) }

      return {
        element: (
          <Component props={parsed.data} nodeId={node.id}>
            {children}
          </Component>
        ),
      }
    },
    text(node) {
      const parsed = props.safeParse(node.props ?? {})

      return parsed.success && text ? text(parsed.data) : ""
    },
  }
}

const wellFormedNode = z.object({
  id: z.string(),
  type: z.string(),
  props: z.unknown().optional(),
  children: z.array(z.unknown()).optional(),
})

/**
 * Parses the nodes of a possibly unfinished answer into well-formed ones:
 * while the input streams, the last node may still lack its type, and
 * anything that isn't a node at all is left out.
 */
export const answerNodeList: z.ZodType<AnswerNode[]> = z.lazy(() =>
  z
    .array(z.unknown())
    .catch([])
    .transform((items) =>
      items.flatMap((item): AnswerNode[] => {
        const node = wellFormedNode.safeParse(item)

        if (!node.success) return []

        const { id, type, props, children = [] } = node.data

        return [{ id, type, props, children: answerNodeList.parse(children) }]
      }),
    ),
)

/** The node written last, which is still open while the answer streams. */
export function lastNodeId(nodes: AnswerNode[]): string | undefined {
  const last = nodes.at(-1)

  if (!last) return undefined

  return lastNodeId(last.children ?? []) ?? last.id
}

/**
 * The components an answer may use. It renders answers (with
 * AnswerRenderer), validates finished ones, describes itself for a model's
 * system prompt and gives the JSON schema of a display tool's input.
 */
export function createAnswerLibrary(components: AnswerComponent[]) {
  const byName = new Map(components.map((item) => [item.name, item]))

  const node: z.ZodType<AnswerNode> = z.lazy(() =>
    z.union(
      components.map((item) =>
        z.object({
          id: z.string(),
          type: z.literal(item.name),
          props: item.props,
          children: z.array(node).optional(),
        }),
      ),
    ),
  )

  const input = z.object({
    title: z.string().describe("What the answer is about, in a few words."),
    nodes: z.array(node),
  })

  function text(nodes: AnswerNode[]): string {
    return nodes
      .flatMap((item) => [
        byName.get(item.type)?.text(item) ?? "",
        text(item.children ?? []),
      ])
      .filter(Boolean)
      .join("\n\n")
  }

  return {
    components,
    get: (name: string) => byName.get(name),
    text,
    /** Problems with a finished answer, as path and message. */
    validate(answer: AnswerDraft): string[] {
      const parsed = input.safeParse(answer)

      return parsed.success
        ? []
        : parsed.error.issues.map(
            (issue) => `${issue.path.join(".")}: ${issue.message}`,
          )
    },
    /** The display tool's input schema, for a model's tool definition. */
    toolInputSchema: () => z.toJSONSchema(input),
    /** The components in words, for a model's system prompt. */
    describe: () =>
      components
        .map(
          (item) =>
            `## ${item.name}\n${item.description}\nProps: ${JSON.stringify(z.toJSONSchema(item.props))}`,
        )
        .join("\n\n"),
  }
}

export type AnswerLibrary = ReturnType<typeof createAnswerLibrary>
