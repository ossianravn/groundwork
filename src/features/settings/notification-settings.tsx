import { useState } from "react"
import { Switch } from "@/kit/ui/switch"
import type { NotificationPreferences } from "@/demo/use-account"
import { SettingsActions } from "./settings-actions"

const categories = [
  {
    id: "assignments",
    label: "Project assignments",
    description: "When you become a project owner.",
  },
  {
    id: "mentions",
    label: "Mentions",
    description: "When someone mentions you.",
  },
  {
    id: "reviews",
    label: "Review requests",
    description: "When work is ready for your review.",
  },
] as const

const channels = [
  { id: "inApp", label: "In app" },
  { id: "email", label: "Email" },
] as const

export function NotificationSettings({
  preferences,
  dirty,
  onChange,
  onSave,
  onCancel,
}: {
  preferences: NotificationPreferences
  dirty: boolean
  onChange: (preferences: NotificationPreferences) => void
  onSave: () => void
  onCancel: () => void
}) {
  const [saved, setSaved] = useState(false)

  return (
    <form
      className="settings-form"
      onSubmit={(event) => {
        event.preventDefault()
        onSave()
        setSaved(true)
      }}
    >
      <header className="settings-section-heading">
        <h2 id="settings-title">Notifications</h2>
        <p>Choose where you hear about your work.</p>
      </header>
      <div className="notification-preferences">
        <div className="notification-head" aria-hidden="true">
          <span />
          {channels.map((channel) => (
            <span key={channel.id}>{channel.label}</span>
          ))}
        </div>
        {categories.map((category) => (
          <div key={category.id} className="notification-row">
            <div>
              <p className="font-medium">{category.label}</p>
              <p className="text-muted-foreground">{category.description}</p>
            </div>
            {channels.map((channel) => (
              <label key={channel.id} className="notification-choice">
                <Switch
                  name={`${category.id}-${channel.id}`}
                  checked={preferences[category.id][channel.id]}
                  onCheckedChange={(checked) =>
                    onChange({
                      ...preferences,
                      [category.id]: {
                        ...preferences[category.id],
                        [channel.id]: checked,
                      },
                    })
                  }
                />
                <span className="sr-only">
                  {category.label}: {channel.label}
                </span>
              </label>
            ))}
          </div>
        ))}
      </div>
      <p className="settings-note">
        Demo preferences only. No notifications are sent.
      </p>
      <SettingsActions
        dirty={dirty}
        saved={saved}
        onCancel={() => {
          onCancel()
          setSaved(false)
        }}
      />
    </form>
  )
}
