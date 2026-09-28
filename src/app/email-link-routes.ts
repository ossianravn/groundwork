import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { rootRoute } from "./root-route"
import { parseAccessSearch, parseEmailReceiptSearch } from "./access-search"

export const emailLinkRoutes = [
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/magic-link",
    validateSearch: parseAccessSearch,
    search: { middlewares: [stripSearchParams({ token: "" })] },
    component: lazyRouteComponent(
      () => import("./email-link-route"),
      "MagicLinkRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/check-email",
    validateSearch: parseEmailReceiptSearch,
    search: {
      middlewares: [stripSearchParams({ token: "", purpose: "recovery" })],
    },
    component: lazyRouteComponent(
      () => import("./email-link-route"),
      "EmailReceiptRoute",
    ),
  }),
  createRoute({
    getParentRoute: () => rootRoute,
    path: "/auth/callback",
    validateSearch: parseAccessSearch,
    remountDeps: ({ search }) => search.token,
    component: lazyRouteComponent(
      () => import("./email-link-route"),
      "SignInCallbackRoute",
    ),
  }),
]
