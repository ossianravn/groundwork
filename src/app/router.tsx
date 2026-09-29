import { onboardingRoutes } from "./onboarding-routes"
import { emailLinkRoutes } from "./email-link-routes"
import { providerRoutes } from "./provider-routes"
import { activityRoute } from "./activity-routes"
import { projectImportRoute, searchRoute } from "./search-routes"
import { securityRoute, verificationRoute } from "./security-routes"
import { parseWebhookSearch, defaultWebhookSearch } from "./webhook-search"
import { workspaceRoute } from "./workspace-route"
import {
  createRoute,
  createRouter,
  lazyRouteComponent,
  redirect,
  stripSearchParams,
} from "@tanstack/react-router"
import { defaultProjectsSearch, parseProjectsSearch } from "./projects-search"
import { resultsLocationKey } from "./project-return"
import {
  parseProjectDetailSearch,
  parseProjectEditorSearch,
} from "./project-editor-search"
import { parseAccessSearch, parseSignUpSearch } from "./access-search"
import { rootRoute } from "./root-route"
import { publicRoutes } from "./public-routes"
import { referenceRoutes } from "./reference-routes"
import {
  parseAnalyticsSearch,
  defaultAnalyticsSearch,
} from "./analytics-search"
import { parseInboxSearch, defaultInboxSearch } from "./inbox-search"
import { parseReportPeriodSearch } from "./report-period-search"

const overviewRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "overview",
  validateSearch: (search) => parseReportPeriodSearch(search, 14),
  component: lazyRouteComponent(
    () => import("./overview-route"),
    "OverviewRoute",
  ),
})

const workspaceIndexRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "/",
  beforeLoad: () => {
    throw redirect({ to: "/app/demo/overview", search: { period: 14 } })
  },
})

const projectsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "projects",
  validateSearch: parseProjectsSearch,
  search: { middlewares: [stripSearchParams(defaultProjectsSearch)] },
  component: lazyRouteComponent(
    () => import("./projects-route"),
    "ProjectsRoute",
  ),
})

const projectDetailRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "projects/$projectId",
  validateSearch: parseProjectDetailSearch,
  component: lazyRouteComponent(
    () => import("./project-detail-route"),
    "ProjectDetailRoute",
  ),
})

const analyticsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "analytics",
  validateSearch: parseAnalyticsSearch,
  search: { middlewares: [stripSearchParams(defaultAnalyticsSearch)] },
  component: lazyRouteComponent(
    () => import("./analytics-route"),
    "AnalyticsRoute",
  ),
})

const inboxRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "inbox",
  validateSearch: parseInboxSearch,
  search: { middlewares: [stripSearchParams(defaultInboxSearch)] },
  component: lazyRouteComponent(() => import("./inbox-route"), "InboxRoute"),
})

const projectCreateRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "projects/new",
  validateSearch: parseProjectEditorSearch,
  search: { middlewares: [stripSearchParams({ scenario: "normal" })] },
  component: lazyRouteComponent(
    () => import("./project-editor-route"),
    "ProjectEditorRoute",
  ),
})

const projectEditRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "projects/$projectId/edit",
  validateSearch: parseProjectEditorSearch,
  search: { middlewares: [stripSearchParams({ scenario: "normal" })] },
  component: lazyRouteComponent(
    () => import("./project-editor-route"),
    "ProjectEditorRoute",
  ),
})

const settingsIndexRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings",
  beforeLoad: () => {
    throw redirect({ to: "/app/demo/settings/profile" })
  },
})

const profileRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/profile",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "ProfileRoute",
  ),
})

const appearanceRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/appearance",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "AppearanceRoute",
  ),
})

const notificationsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/notifications",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "NotificationsRoute",
  ),
})

const workspaceSettingsRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/workspace",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "WorkspaceSettingsRoute",
  ),
})

const teamRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/team",
  component: lazyRouteComponent(() => import("./settings-route"), "TeamRoute"),
})

const apiKeysRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/api-keys",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "ApiKeysRoute",
  ),
})

const billingRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/billing",
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "BillingRoute",
  ),
})

const webhooksRoute = createRoute({
  getParentRoute: () => workspaceRoute,
  path: "settings/webhooks",
  validateSearch: parseWebhookSearch,
  search: { middlewares: [stripSearchParams(defaultWebhookSearch)] },
  component: lazyRouteComponent(
    () => import("./settings-route"),
    "WebhooksRoute",
  ),
})

const signInRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/sign-in",
  validateSearch: parseAccessSearch,
  search: { middlewares: [stripSearchParams({ token: "" })] },
  component: lazyRouteComponent(() => import("./access-route"), "SignInRoute"),
})

const signUpRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/sign-up",
  validateSearch: parseSignUpSearch,
  search: { middlewares: [stripSearchParams({ token: "" })] },
  component: lazyRouteComponent(() => import("./access-route"), "SignUpRoute"),
})

const forgotPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/forgot-password",
  validateSearch: parseAccessSearch,
  search: { middlewares: [stripSearchParams({ token: "" })] },
  component: lazyRouteComponent(
    () => import("./recovery-route"),
    "ForgotPasswordRoute",
  ),
})

const resetPasswordRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/auth/reset-password",
  validateSearch: parseAccessSearch,
  search: { middlewares: [stripSearchParams({ token: "" })] },
  remountDeps: ({ search }) => search.token,
  component: lazyRouteComponent(
    () => import("./recovery-route"),
    "ResetPasswordRoute",
  ),
})

export const router = createRouter({
  routeTree: rootRoute.addChildren([
    ...publicRoutes,
    ...referenceRoutes,
    signInRoute,
    verificationRoute,
    signUpRoute,
    forgotPasswordRoute,
    ...emailLinkRoutes,
    ...providerRoutes,
    resetPasswordRoute,
    ...onboardingRoutes,
    workspaceRoute.addChildren([
      workspaceIndexRoute,
      overviewRoute,
      projectsRoute,
      inboxRoute,
      analyticsRoute,
      activityRoute,
      searchRoute,
      projectImportRoute,
      projectDetailRoute,
      projectCreateRoute,
      projectEditRoute,
      settingsIndexRoute,
      profileRoute,
      appearanceRoute,
      notificationsRoute,
      securityRoute,
      workspaceSettingsRoute,
      teamRoute,
      billingRoute,
      apiKeysRoute,
      webhooksRoute,
    ]),
  ]),
  scrollRestoration: true,
  getScrollRestorationKey: (location) =>
    [
      "/app/demo/projects",
      "/app/demo/overview",
      "/app/demo/inbox",
      "/app/demo/analytics",
      "/app/demo/activity",
    ].includes(location.pathname)
      ? resultsLocationKey(location.href)
      : (location.state.__TSR_key ?? location.href),
})

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router
  }
}
