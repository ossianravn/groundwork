import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"

const specimenTabs = ["overview", "projects", "inbox", "activity"] as const

interface MobileTabsSearchInput {
  tab?: unknown
}

// Reference specimens: alternative shells and conditional patterns shown on
// their own pages, outside the demo's navigation.
const mobileTabsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/specimens/mobile-tabs",
  validateSearch: (search: MobileTabsSearchInput) => ({
    tab: specimenTabs.find((tab) => tab === search.tab) ?? "overview",
  }),
  component: lazyRouteComponent(
    () => import("./specimen-route"),
    "MobileTabsRoute",
  ),
})

const consentRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/specimens/cookie-consent",
  component: lazyRouteComponent(
    () => import("./specimen-route"),
    "ConsentRoute",
  ),
})

export const specimenRoutes = [mobileTabsRoute, consentRoute]
