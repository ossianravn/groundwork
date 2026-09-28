import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
} from "@tanstack/react-router"
import { parseBilling } from "@/demo/billing"
import { rootRoute } from "./root-route"
import { parseHelpSearch } from "./help-search"
import { parseContactSearch } from "./contact-search"

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: lazyRouteComponent(() => import("./public-route"), "PublicRoute"),
})

const productRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/product",
  component: lazyRouteComponent(() => import("./public-route"), "ProductRoute"),
})

const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/pricing",
  validateSearch: parseBilling,
  component: lazyRouteComponent(() => import("./public-route"), "PricingRoute"),
})

const blogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog",
  component: lazyRouteComponent(() => import("./resource-route"), "BlogRoute"),
})

const articleRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/blog/$slug",
  component: lazyRouteComponent(
    () => import("./resource-route"),
    "ArticleRoute",
  ),
})

const helpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help",
  validateSearch: parseHelpSearch,
  search: { middlewares: [stripSearchParams({ q: "" })] },
  component: lazyRouteComponent(() => import("./resource-route"), "HelpRoute"),
})

const guideRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/help/$slug",
  component: lazyRouteComponent(() => import("./resource-route"), "GuideRoute"),
})

const changelogRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/changelog",
  component: lazyRouteComponent(
    () => import("./resource-route"),
    "ChangelogRoute",
  ),
})

const releaseRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/changelog/$version",
  component: lazyRouteComponent(
    () => import("./resource-route"),
    "ReleaseRoute",
  ),
})

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/contact",
  validateSearch: parseContactSearch,
  search: { middlewares: [stripSearchParams({ scenario: "normal" })] },
  component: lazyRouteComponent(
    () => import("./public-info-route"),
    "ContactRoute",
  ),
})

const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/privacy",
  component: lazyRouteComponent(
    () => import("./public-info-route"),
    "PrivacyRoute",
  ),
})

const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/terms",
  component: lazyRouteComponent(
    () => import("./public-info-route"),
    "TermsRoute",
  ),
})

export const publicRoutes = [
  indexRoute,
  productRoute,
  pricingRoute,
  blogRoute,
  articleRoute,
  helpRoute,
  guideRoute,
  changelogRoute,
  releaseRoute,
  contactRoute,
  privacyRoute,
  termsRoute,
]
