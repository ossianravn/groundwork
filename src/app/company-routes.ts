import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"

// Public company pages added with the showcase: customers, integrations,
// about, roadmap and status.
const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers",
  component: lazyRouteComponent(
    () => import("./customers-route"),
    "CustomersRoute",
  ),
})

const customerStoryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/customers/$slug",
  component: lazyRouteComponent(
    () => import("./customers-route"),
    "CustomerStoryRoute",
  ),
})

const integrationsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/integrations",
  component: lazyRouteComponent(
    () => import("./company-route"),
    "IntegrationsRoute",
  ),
})

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/about",
  component: lazyRouteComponent(() => import("./company-route"), "AboutRoute"),
})

const roadmapRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/roadmap",
  component: lazyRouteComponent(
    () => import("./company-route"),
    "RoadmapRoute",
  ),
})

const statusRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/status",
  component: lazyRouteComponent(() => import("./company-route"), "StatusRoute"),
})

export const companyRoutes = [
  customersRoute,
  customerStoryRoute,
  integrationsRoute,
  aboutRoute,
  roadmapRoute,
  statusRoute,
]
