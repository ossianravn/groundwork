import data from "./data/activity.json"
import { activityKinds, type ActivityKind } from "./activity"
import type { Activity } from "./model"

function isActivityKind(value: string): value is ActivityKind {
  return Object.hasOwn(activityKinds, value)
}

export const initialActivity: Activity[] = data.map((event) => {
  if (!isActivityKind(event.kind))
    throw new Error(`Unknown activity kind: ${event.kind}`)

  return { ...event, kind: event.kind }
})
