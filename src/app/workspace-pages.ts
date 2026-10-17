import {
  Activity,
  ChartNoAxesCombined,
  FolderKanban,
  Inbox,
  LayoutDashboard,
  Sparkles,
} from "lucide-react"
import { defaultActivitySearch } from "./activity-search"
import { defaultAnalyticsSearch } from "./analytics-search"
import { defaultAssistantSearch } from "./assistant-search"
import { defaultInboxSearch } from "./inbox-search"
import { defaultProjectsSearch } from "./projects-search"

/**
 * The workspace's pages, in sidebar order. The sidebar and the command menu
 * both list them; `to` and `search` open each page in its default state.
 */
export const workspacePages = [
  {
    id: "Overview",
    destination: "overview",
    label: "Overview",
    icon: LayoutDashboard,
    to: "/app/demo/overview",
    search: { period: 14 },
  },
  {
    id: "Projects",
    destination: "projects",
    label: "Projects",
    icon: FolderKanban,
    to: "/app/demo/projects",
    search: defaultProjectsSearch,
  },
  {
    id: "Inbox",
    destination: "inbox",
    label: "Inbox",
    icon: Inbox,
    to: "/app/demo/inbox",
    search: defaultInboxSearch,
  },
  {
    id: "Assistant",
    destination: "assistant",
    label: "Assistant",
    icon: Sparkles,
    to: "/app/demo/assistant",
    search: defaultAssistantSearch,
  },
  {
    id: "Analytics",
    destination: "analytics",
    label: "Analytics",
    icon: ChartNoAxesCombined,
    to: "/app/demo/analytics",
    search: defaultAnalyticsSearch,
  },
  {
    id: "Activity",
    destination: "activity",
    label: "Activity",
    icon: Activity,
    to: "/app/demo/activity",
    search: defaultActivitySearch,
  },
] as const
