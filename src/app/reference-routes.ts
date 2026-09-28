import {
  createRoute,
  lazyRouteComponent,
  stripSearchParams,
  redirect,
} from "@tanstack/react-router"
import { rootRoute } from "./root-route"
import {
  defaultPatternFilters,
  parsePatternSearch,
  parsePatternDetailSearch,
} from "./pattern-search"
import {
  defaultReferenceSearch,
  parseReferenceSearch,
  parseComponentSearch,
} from "./reference-search"

const referenceHome = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference",
  component: lazyRouteComponent(
    () => import("./reference-route"),
    "ReferenceHomeRoute",
  ),
})

const componentCatalog = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/components",
  validateSearch: parseReferenceSearch,
  search: { middlewares: [stripSearchParams(defaultReferenceSearch)] },
  component: lazyRouteComponent(
    () => import("./reference-route"),
    "ComponentCatalogRoute",
  ),
})

const componentDetail = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/components/$component",
  validateSearch: parseComponentSearch,
  search: {
    middlewares: [
      stripSearchParams({ ...defaultReferenceSearch, panel: "preview" }),
    ],
  },
  component: lazyRouteComponent(
    () => import("./reference-route"),
    "ComponentDetailRoute",
  ),
})

const patternIndex = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/patterns",
  validateSearch: parsePatternSearch,
  search: { middlewares: [stripSearchParams(defaultPatternFilters)] },
  component: lazyRouteComponent(
    () => import("./pattern-route"),
    "PatternIndexRoute",
  ),
})

const patternDetail = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/patterns/$patternId",
  validateSearch: parsePatternDetailSearch,
  search: {
    middlewares: [stripSearchParams({ ...defaultPatternFilters, example: 0 })],
  },
  component: lazyRouteComponent(
    () => import("./pattern-route"),
    "PatternDetailRoute",
  ),
})

const themePlayground = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/themes",
  component: lazyRouteComponent(
    () => import("./theme-playground-route"),
    "ThemePlaygroundRoute",
  ),
})

const stateIndex = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/states",
  beforeLoad: () => {
    throw redirect({
      to: "/reference/states/$scenario",
      params: { scenario: "loading" },
    })
  },
})

const stateGallery = createRoute({
  getParentRoute: () => rootRoute,
  path: "/reference/states/$scenario",
  component: lazyRouteComponent(
    () => import("./state-gallery-route"),
    "StateGalleryRoute",
  ),
})

export const referenceRoutes = [
  referenceHome,
  componentCatalog,
  componentDetail,
  patternIndex,
  patternDetail,
  themePlayground,
  stateIndex,
  stateGallery,
]
