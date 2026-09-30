import { z } from "zod"
import data from "./data/coding-agent.json"

// The coding-agent specimen replays one recorded session: an agent fixes a
// failing test in a small repository. The fixture is parsed here so the
// view receives exact step and status types.

const testRun = z.object({
  command: z.string(),
  duration: z.number(),
  output: z.array(z.string()),
  suites: z.array(
    z.object({
      name: z.string(),
      tests: z.array(
        z.object({
          name: z.string(),
          status: z.enum(["passed", "failed", "skipped"]),
          duration: z.number().optional(),
        }),
      ),
    }),
  ),
  failure: z
    .object({
      test: z.string(),
      name: z.string(),
      message: z.string(),
      frames: z.array(
        z.object({
          name: z.string(),
          file: z.string(),
          line: z.number(),
          column: z.number().optional(),
          internal: z.boolean().optional(),
        }),
      ),
    })
    .optional(),
})

const session = z
  .object({
    repository: z.string(),
    branch: z.string(),
    prompt: z.string(),
    reasoning: z.string(),
    explanation: z.string(),
    summary: z.string(),
    failing: testRun,
    passing: testRun,
    read: z.string(),
    diff: z.array(z.string()),
    commit: z.object({
      hash: z.string(),
      message: z.string(),
      body: z.string(),
      author: z.string(),
      date: z.string(),
      files: z.array(
        z.object({
          path: z.string(),
          additions: z.number(),
          deletions: z.number(),
        }),
      ),
    }),
    files: z.array(
      z.object({
        path: z.string(),
        before: z.string(),
        after: z.string().optional(),
      }),
    ),
  })
  .parse(data)

export type TestRun = z.infer<typeof testRun>

export type AgentFile = (typeof session.files)[number]

export type AgentStep =
  | { kind: "prompt" | "reasoning" | "text"; text: string }
  | { kind: "tests"; run: TestRun }
  | { kind: "read"; file: AgentFile }
  | { kind: "edit"; paths: string[]; diff: string }
  | { kind: "commit"; commit: typeof session.commit }

export interface AgentTreeNode {
  name: string
  path: string
  children?: AgentTreeNode[]
  status?: "modified"
}

/** A file's extension, which CodeBlock accepts as its language. */
export function languageOf(path: string) {
  return path.split(".").pop()
}

function fileFor(path: string) {
  const file = session.files.find((candidate) => candidate.path === path)

  if (!file) throw new Error(`Coding agent fixture: no file ${path}`)

  return file
}

const changed = session.commit.files.map((file) => file.path)

const steps: AgentStep[] = [
  { kind: "prompt", text: session.prompt },
  { kind: "reasoning", text: session.reasoning },
  { kind: "tests", run: session.failing },
  { kind: "read", file: fileFor(session.read) },
  { kind: "text", text: session.explanation },
  { kind: "edit", paths: changed, diff: session.diff.join("\n") },
  { kind: "tests", run: session.passing },
  { kind: "commit", commit: session.commit },
  { kind: "text", text: session.summary },
]

export const agentSession = {
  repository: session.repository,
  branch: session.branch,
  files: session.files,
  changed,
  steps,
}

/**
 * Folders and files from the fixture's paths, folders first and each level
 * sorted by name. Files in `modified` are marked.
 */
export function agentTree(modified: string[], prefix = ""): AgentTreeNode[] {
  const below = session.files.flatMap((file) =>
    file.path.startsWith(prefix) ? [file.path.slice(prefix.length)] : [],
  )

  const names = [...new Set(below.map((rest) => rest.split("/")[0] ?? rest))]

  const nodes = names.map((name): AgentTreeNode => {
    const path = prefix + name
    const folder = below.some((rest) => rest.startsWith(`${name}/`))

    if (folder) return { name, path, children: agentTree(modified, `${path}/`) }

    return modified.includes(path)
      ? { name, path, status: "modified" }
      : { name, path }
  })

  return nodes.sort(
    (a, b) =>
      Number(!a.children) - Number(!b.children) || a.name.localeCompare(b.name),
  )
}
