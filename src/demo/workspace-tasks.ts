import type { Dispatch, SetStateAction } from "react"
import {
  addProjectTasks,
  applyTaskChange,
  type NewTask,
  type TaskChange,
  type TaskContext,
  type TaskRecords,
} from "./project-tasks"
import { captureProjectUndo } from "./project-undo"

type Records = TaskRecords & { resetDone: boolean }

/** The workspace's task actions over its shared records. */
export function workspaceTasks<T extends Records>(
  state: T,
  setState: Dispatch<SetStateAction<T>>,
  context: TaskContext,
  onChange: () => void,
) {
  return {
    // Task edits apply at once; the caller may offer Undo (removal does).
    changeTask(change: TaskChange) {
      const records = applyTaskChange(state, change, context)

      onChange()
      setState({ ...state, ...records, resetDone: false })

      return captureProjectUndo(state, records)
    },

    // Applied to the latest records, so a caller holding an older render
    // (the assistant's tool) cannot overwrite other edits.
    addTasks(projectId: string, tasks: NewTask[]) {
      onChange()
      setState((current) => ({
        ...current,
        ...addProjectTasks(current, projectId, tasks, context).records,
        resetDone: false,
      }))
    },
  }
}
