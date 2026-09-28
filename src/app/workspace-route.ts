import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"

interface WorkspaceSearch {
  inspect?: string
}

export const workspaceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/app/demo",
  validateSearch: (search): WorkspaceSearch => {
    try {
      return {
        inspect:
          search.inspect == null
            ? undefined
            : String(search.inspect) || undefined,
      }
    } catch {
      // Uncoercible JSON query values do not identify a project.
      return {}
    }
  },
  component: lazyRouteComponent(() => import("./demo-app"), "DemoApp"),
})
