import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { workspaceRoute } from "./workspace-route"
import { defaultActivitySearch, parseActivitySearch } from "./activity-search"

export const activityRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "activity",
  validateSearch: parseActivitySearch,
  search: { middlewares: [stripSearchParams(defaultActivitySearch)] },
  component: lazyRouteComponent(
    () => import("./activity-route"),
    "ActivityRoute",
  ),
})
