import { createRoute, lazyRouteComponent } from "@tanstack/react-router"
import { rootRoute } from "./root-route"

// Public company pages added with the showcase: customers and their stories.
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

export const companyRoutes = [customersRoute, customerStoryRoute]
