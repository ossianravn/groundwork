import type { UIMessage, UIMessageChunk } from "ai"
import { z } from "zod"
import type { AnswerNode, AnswerState } from "@/kit/answer/answer-library"
import type {
  Activity,
  Member,
  Project,
  ProjectFile,
  ProjectTask,
} from "../model"

/** What the scripted assistant can read: the live demo records. */
export interface AssistantContext {
  projects: Project[]
  tasks: ProjectTask[]
  activity: Activity[]
  people: Member[]
  files: ProjectFile[]
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
  /** What the answer is for, so the turn continues with the right reply. */
  purpose: "checklist" | "status" | "catchup" | "land"
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

/**
 * The applyPlan tool: reassigns tasks as a plan proposes, and records the
 * deferred ones as a comment. It runs only after the person approves it.
 */
export type ApplyPlanInput = {
  projectId: string
  projectName: string
  moves: { taskId: string; title: string; to: string; toName: string }[]
  deferred: { taskId: string; title: string }[]
}

export type ApplyPlanOutput = {
  reassigned: number
  deferred: number
  projectId: string
  projectName: string
  url: string
}

/** A choice the person sent from an answer, such as a form's values. */
export type AnswerActionData = {
  /** The showAnswer call it came from. */
  answerId: string
  nodeId: string
  values: AnswerState
}

/**
 * The showAnswer display tool: an answer composed from the answer library,
 * streamed as the tool's input and rendered as it arrives.
 */
export type ShowAnswerInput = {
  title: string
  nodes: AnswerNode[]
}

export type ShowAnswerOutput = { shown: true }

/** The plan as it streams: tasks arrive one by one, then it is complete. */
export interface PlanData {
  title: string
  description: string
  tasks: { title: string; assignee: string | null }[]
  complete: boolean
}

/** A document the assistant drafts; it streams as it is written. */
export interface ArtifactData {
  title: string
  projectId: string
  projectName: string
  /** The project's page, for a link once the draft is posted. */
  url: string
  /** Markdown. */
  content: string
  complete: boolean
}

export interface ReplySource {
  id: string
  url: string
  title: string
  description: string
}

export type TodoStatus = "todo" | "doing" | "done" | "dropped" | "blocked"

/** The assistant's own plan for a request, updated as it works. */
export interface TodoData {
  title: string
  tasks: { id: string; label: string; status: TodoStatus }[]
}

/** Where a reply's work happens, in stream order. */
export type ReplyStage =
  "reasoning" | "steps" | "tool" | "answer" | "text" | "plan" | "artifact"

/** A progress step the assistant reports while it works. */
export interface StepData {
  label: string
  status: "active" | "complete"
  results: string[]
}

export interface AssistantReply {
  /** A working plan: each task is done when its stage has streamed. */
  todo?: { title: string; tasks: { label: string; after: ReplyStage }[] }
  reasoning?: string
  steps?: { id: string; label: string; results: string[] }[]
  tool?: {
    name: "searchProjects"
    input: SearchProjectsInput
    output?: ProjectRow[]
    errorText?: string
  }
  /** An answer built from components, before any text. */
  answer?: ShowAnswerInput
  /**
   * Markdown, empty when an answer says it all. Citations are links to
   * `#source:<id>[,<id>]`.
   */
  text: string
  sources?: ReplySource[]
  /** After the text: a question the person answers (chooseProject). */
  question?: ChooseProjectInput
  /** After the text: a plan, then createTasks awaiting approval. */
  plan?: PlanData
  approval?: CreateTasksInput
  /** After the text: applying a plan, awaiting approval. */
  applyPlan?: ApplyPlanInput
  /** After the text: a document to use outside the conversation. */
  artifact?: ArtifactData
  /** First of all: the outcome of a call approved or denied last turn. */
  resolution?:
    | { toolCallId: string; output: CreateTasksOutput | ApplyPlanOutput }
    | { toolCallId: string; denied: true }
  followUps: string[]
}

type AssistantTools = {
  searchProjects: { input: SearchProjectsInput; output: ProjectRow[] }
  chooseProject: { input: ChooseProjectInput; output: ChooseProjectOutput }
  createTasks: { input: CreateTasksInput; output: CreateTasksOutput }
  showAnswer: { input: ShowAnswerInput; output: ShowAnswerOutput }
  applyPlan: { input: ApplyPlanInput; output: ApplyPlanOutput }
}

type AssistantData = {
  suggestions: string[]
  step: StepData
  todo: TodoData
  plan: PlanData
  /** A project the person attached to their message as context. */
  project: { id: string; name: string }
  artifact: ArtifactData
  /** What the person chose in an answer, sent with their message. */
  action: AnswerActionData
}

export type ModelId = "fast" | "balanced" | "thorough"

/** Sent with each reply's finish: which model answered, and token usage. */
export type AssistantMetadata = {
  model: ModelId
  usage: { input: number; output: number }
}

/** Source descriptions travel in provider metadata under this key. */
export const sourceMetadata = z.object({
  tandem: z.object({ description: z.string() }),
})

export type SourceMetadata = z.infer<typeof sourceMetadata>

export type AssistantMessage = UIMessage<
  AssistantMetadata,
  AssistantData,
  AssistantTools
>

export type AssistantChunk = UIMessageChunk<AssistantMetadata, AssistantData>

export type AssistantScenario = "normal" | "assistant-error" | "tool-error"

/**
 * Tool implementations that change demo records. This demo's "server" runs
 * in the page, so the host supplies them with each request; a real server
 * would run its own.
 */
export interface AssistantActions {
  createTasks: (input: CreateTasksInput) => void
  applyPlan: (input: ApplyPlanInput) => void
}

/** A turn continued after the person decided: the reply, and the approved action to run first. */
export interface Continuation {
  answer: AssistantReply
  run?: (actions: AssistantActions) => void
}

/** What the workspace lets the assistant use (Settings › Assistant). */
export type AssistantToolSettings = {
  searchProjects: boolean
  createTasks: boolean
  draftUpdates: boolean
}

/** What the person changed in each answer, by its showAnswer call. */
export type AnswerStates = { [toolCallId: string]: AnswerState }

/**
 * What the host sends with each request, as a client would send page
 * context to a server: the records to answer from, the tool implementations,
 * what the person changed in answers, and the demo scenario.
 */
export interface AssistantRequest {
  scenario: AssistantScenario
  model: ModelId
  tools: AssistantToolSettings
  context: AssistantContext
  actions: AssistantActions
  answers: AnswerStates
}
