import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"

export const onboardingRoutes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/onboarding",
    component: lazyRouteComponent(
      () => import("./onboarding-route"),
      "OnboardingEntryRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/onboarding/workspace",
    component: lazyRouteComponent(
      () => import("./onboarding-route"),
      "WorkspaceSetupRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/onboarding/team",
    component: lazyRouteComponent(
      () => import("./onboarding-route"),
      "TeamSetupRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/onboarding/complete",
    component: lazyRouteComponent(
      () => import("./onboarding-route"),
      "SetupCompleteRoute",
    ),
  }),
]
