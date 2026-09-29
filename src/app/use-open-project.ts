import { useLocation, useNavigate, useSearch } from "@tanstack/react-router"
import { useDemoWorkspace } from "./workspace-context"
import { projectReturnTo } from "./project-return"

/** Opens a project page from an action, such as a context menu item. */
export function useOpenProject() {
  const href = useLocation({ select: (location) => location.href })
  const { returnTo } = useSearch({ strict: false })
  const { onOpenDetail } = useDemoWorkspace()
  const navigate = useNavigate()
  const origin = projectReturnTo(returnTo ?? href)

  return (projectId: string) => {
    onOpenDetail(origin)
    void navigate({
      to: "/app/demo/projects/$projectId",
      params: { projectId },
      search: { returnTo: origin },
    })
  }
}
