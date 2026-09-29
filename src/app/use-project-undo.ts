import { useToast } from "@/kit/ui/use-toast"
import type { ProjectUndo } from "@/demo/project-undo"
import { useDemoState } from "./demo-state"

/**
 * Status and owner changes apply at once and offer Undo in a toast (EDGE-10),
 * rather than asking for confirmation first.
 */
export function useProjectUndo() {
  const { demo } = useDemoState()
  const toast = useToast()

  function offerUndo(title: string, undo: ProjectUndo | null) {
    if (!undo) return

    const id = toast.add({
      title,
      type: "success",
      actionProps: {
        children: "Undo",
        onClick: () => {
          demo.undoProjectChange(undo)
          toast.close(id)
        },
      },
    })
  }

  return {
    completeProject(id: string) {
      const name = demo.projects.find((project) => project.id === id)?.name

      offerUndo(`${name} marked complete`, demo.completeProject(id))
    },
  }
}
