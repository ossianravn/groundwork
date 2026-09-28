import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { rootRoute } from "./root-route"
import { parseProviderSearch } from "./provider-search"

export const providerRoutes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/provider/$provider",
    validateSearch: parseProviderSearch,
    search: {
      middlewares: [
        stripSearchParams({ intent: "sign-in", scenario: "normal", token: "" }),
      ],
    },
    component: lazyRouteComponent(
      () => import("./provider-route"),
      "ProviderRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/provider/callback",
    validateSearch: parseProviderSearch,
    search: {
      middlewares: [
        stripSearchParams({ intent: "sign-in", scenario: "normal" }),
      ],
    },
    remountDeps: ({ search }) => search.token,
    component: lazyRouteComponent(
      () => import("./provider-callback-route"),
      "ProviderCallbackRoute",
    ),
  }),
]
