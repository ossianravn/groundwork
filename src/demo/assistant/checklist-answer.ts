import script from "../data/assistant.json"
import { formatDate, type Project } from "../model"
import { personName, plural, projectLink, projectPath } from "./answer-format"
import type {
  AssistantContext,
  AssistantMessage,
  AssistantReply,
  CreateTasksInput,
} from "./assistant-types"

type Answer = Omit<AssistantReply, "followUps">

const active = (context: AssistantContext) =>
  context.projects.filter((project) => project.status !== "completed")

/** The project a prompt names. */
export function namedProject(prompt: string, context: AssistantContext) {
  const text = prompt.toLowerCase()

  return context.projects.find((project) =>
    text.includes(project.name.toLowerCase()),
  )
}

function askForProject(context: AssistantContext, lead: string): Answer {
  return {
    text: lead,
    question: {
      question: script.checklist.question,
      options: active(context).map((project) => ({
        value: project.id,
        label: project.name,
        description: `due ${formatDate(project.dueDate)}`,
      })),
    },
  }
}

/** The checklist for a project: a plan to review, then tasks to approve. */
export function checklistPlan(
  project: Project,
  context: AssistantContext,
): Answer {
  const owner = personName(context, project.ownerId)

  const tasks = script.checklist.tasks.map((task) => ({
    title: task.title,
    assigneeId: task.owner ? project.ownerId : null,
    assignee: task.owner ? owner : null,
  }))

  const approval: CreateTasksInput = {
    projectId: project.id,
    projectName: project.name,
    tasks,
  }

  return {
    text: `Here is a launch checklist for **${project.name}**. I'll add the tasks once you approve.`,
    plan: {
      title: `Launch checklist for ${project.name}`,
      description: `${plural(tasks.length, "task")} at the end of the project's list. ${owner}, the owner, takes the first two; the rest stay unassigned.`,
      tasks: tasks.map(({ title, assignee }) => ({ title, assignee })),
      complete: true,
    },
    approval,
  }
}

/** A new request for a checklist: plan it, or ask which project first. */
export function checklistAnswer(
  prompt: string,
  context: AssistantContext,
): Answer {
  const project = namedProject(prompt, context)

  if (!project)
    return askForProject(
      context,
      "A launch checklist adds five tasks to one project, so I'll check where they go first.",
    )

  if (project.status === "completed")
    return askForProject(
      context,
      `${project.name} is completed, so it can't take new tasks. Choose an open project instead.`,
    )

  return checklistPlan(project, context)
}

type Part = AssistantMessage["parts"][number]

function lastStep(message: AssistantMessage): Part[] {
  const start = message.parts.reduce(
    (last, part, index) => (part.type === "step-start" ? index : last),
    -1,
  )

  return message.parts.slice(start + 1)
}

/**
 * Continues a turn the person has just acted on: an answered question
 * leads to the plan; an approval runs createTasks (`execute`); a denial
 * records that nothing changed. Returns undefined when there is nothing to
 * continue.
 */
export function continueChecklist(
  message: AssistantMessage,
  context: AssistantContext,
): { answer: AssistantReply; execute?: CreateTasksInput } | undefined {
  const followUps =
    script.intents.find((intent) => intent.id === "tasks")?.followUps ?? []

  for (const part of lastStep(message)) {
    if (
      part.type === "tool-chooseProject" &&
      part.state === "output-available"
    ) {
      const project = context.projects.find(
        (item) => item.id === part.output.projectId,
      )

      return {
        answer: project
          ? { ...checklistPlan(project, context), followUps: [] }
          : { text: "That project is no longer in the workspace.", followUps },
      }
    }

    if (
      part.type === "tool-createTasks" &&
      part.state === "approval-responded"
    ) {
      const { toolCallId, input } = part

      if (!part.approval.approved)
        return {
          answer: {
            resolution: { toolCallId, denied: true },
            text: "Okay, I didn't add any tasks. Ask again whenever you want the checklist.",
            followUps,
          },
        }

      const project = context.projects.find(
        (item) => item.id === input.projectId,
      )

      const added =
        project && project.status !== "completed" ? input.tasks.length : 0

      return {
        execute: added ? input : undefined,
        answer: {
          resolution: {
            toolCallId,
            output: {
              added,
              projectId: input.projectId,
              projectName: input.projectName,
              url: project ? projectPath(project) : "",
            },
          },
          text:
            added && project
              ? `Added ${plural(added, "task")} to ${projectLink(project)}. They're at the end of its task list, where you can edit or remove them.`
              : `${input.projectName} can't take new tasks any more, so nothing was added.`,
          followUps,
        },
      }
    }
  }

  return undefined
}
