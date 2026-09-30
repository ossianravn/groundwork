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
  followUps: string[]
}

type AssistantTools = {
  searchProjects: { input: SearchProjectsInput; output: ProjectRow[] }
}

type AssistantData = { suggestions: string[]; step: StepData }

/** Source descriptions travel in provider metadata under this key. */
export const sourceMetadata = z.object({
  tandem: z.object({ description: z.string() }),
})

export type SourceMetadata = z.infer<typeof sourceMetadata>

export type AssistantMessage = UIMessage<never, AssistantData, AssistantTools>

export type AssistantChunk = UIMessageChunk<never, AssistantData>

export type AssistantScenario = "normal" | "assistant-error" | "tool-error"

/**
 * What the host sends with each request, as a client would send page
 * context to a server: the records to answer from and the demo scenario.
 */
export interface AssistantRequest {
  scenario: AssistantScenario
  context: AssistantContext
}
