import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"
import { workspaceRoute } from "./workspace-route"
import { parseAccessSearch } from "./access-search"

export const securityRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/security",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "SecurityRoute",
  ),
})

export const verificationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/verify",
  validateSearch: parseAccessSearch,
  remountDeps: ({ search }) => search.token,
  component: lazyRouteComponent(
    () => import("./verification-route"),
    "VerificationRoute",
  ),
})
