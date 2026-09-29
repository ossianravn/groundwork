import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { workspaceRoute } from "./workspace-route"
import {
  defaultWorkspaceSearch,
  parseWorkspaceSearch,
} from "./workspace-search-params"

export const projectImportRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "projects/import",
  component: lazyRouteComponent(
    () => import("./project-import-route"),
    "ProjectImportRoute",
  ),
})

export const searchRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "search",
  validateSearch: parseWorkspaceSearch,
  search: { middlewares: [stripSearchParams(defaultWorkspaceSearch)] },
  component: lazyRouteComponent(() => import("./search-route"), "SearchRoute"),
})
