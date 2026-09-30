import type { UIMessage, UIMessageChunk } from "ai"
import { z } from "zod"
import type { Activity, Member, Project } from "../model"

/** What the scripted assistant can read: the live demo records. */
export interface AssistantContext {
  projects: Project[]
  activity: Activity[]
  people: Member[]
  referenceDate: string
}

/** One project as the searchProjects tool returns it (JSON-shaped). */
export type ProjectRow = {
  id: string
  name: string
  owner: string
  status: string
  dueDate: string
  tasks: number
  openTasks: number
}

export type SearchProjectsInput = {
  status: string[]
  fields: string[]
}

/** The chooseProject tool: a question the person answers in the page. */
export type ChooseProjectInput = {
  question: string
  options: { value: string; label: string; description: string }[]
}

export type ChooseProjectOutput = { projectId: string }

export type ChecklistTask = {
  title: string
  assigneeId: string | null
  assignee: string | null
}

/** The createTasks tool, which runs only after the person approves it. */
export type CreateTasksInput = {
  projectId: string
  projectName: string
  tasks: ChecklistTask[]
}

export type CreateTasksOutput = {
  added: number
  projectId: string
  projectName: string
  /** Where the tasks are, for a link in the outcome. */
  url: string
}

/** The plan as it streams: tasks arrive one by one, then it is complete. */
export interface PlanData {
  title: string
  description: string
  tasks: { title: string; assignee: string | null }[]
  complete: boolean
}

export interface ReplySource {
  id: string
  url: string
  title: string
  description: string
}

/** A progress step the assistant reports while it works. */
export interface StepData {
  label: string
  status: "active" | "complete"
  results: string[]
}

export interface AssistantReply {
  reasoning?: string
  steps?: { id: string; label: string; results: string[] }[]
  tool?: {
    name: "searchProjects"
    input: SearchProjectsInput
    output?: ProjectRow[]
    errorText?: string
  }
  /** Markdown. Citations are links to `#source:<id>[,<id>]`. */
  text: string
  sources?: ReplySource[]
  /** After the text: a question the person answers (chooseProject). */
  question?: ChooseProjectInput
  /** After the text: a plan, then createTasks awaiting approval. */
  plan?: PlanData
  approval?: CreateTasksInput
  /** First of all: the outcome of a call approved or denied last turn. */
  resolution?:
    | { toolCallId: string; output: CreateTasksOutput }
    | { toolCallId: string; denied: true }
  followUps: string[]
}

type AssistantTools = {
  searchProjects: { input: SearchProjectsInput; output: ProjectRow[] }
  chooseProject: { input: ChooseProjectInput; output: ChooseProjectOutput }
  createTasks: { input: CreateTasksInput; output: CreateTasksOutput }
}

type AssistantData = {
  suggestions: string[]
  step: StepData
  plan: PlanData
}

/** Source descriptions travel in provider metadata under this key. */
export const sourceMetadata = z.object({
  tandem: z.object({ description: z.string() }),
})

export type SourceMetadata = z.infer<typeof sourceMetadata>

export type AssistantMessage = UIMessage<never, AssistantData, AssistantTools>

export type AssistantChunk = UIMessageChunk<never, AssistantData>

export type AssistantScenario = "normal" | "assistant-error" | "tool-error"

/**
 * Tool implementations that change demo records. This demo's "server" runs
 * in the page, so the host supplies them with each request; a real server
 * would run its own.
 */
export interface AssistantActions {
  createTasks: (input: CreateTasksInput) => void
}

/**
 * What the host sends with each request, as a client would send page
 * context to a server: the records to answer from, the tool implementations
 * and the demo scenario.
 */
export interface AssistantRequest {
  scenario: AssistantScenario
  context: AssistantContext
  actions: AssistantActions
}
