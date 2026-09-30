import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { workspaceRoute } from "./workspace-route"
import {
  defaultAssistantSearch,
  parseAssistantSearch,
} from "./assistant-search"

export const assistantRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "assistant",
  validateSearch: parseAssistantSearch,
  search: { middlewares: [stripSearchParams(defaultAssistantSearch)] },
  component: lazyRouteComponent(
    () => import("./assistant-route"),
    "AssistantRoute",
  ),
})
