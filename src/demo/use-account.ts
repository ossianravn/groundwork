import { useState } from "react"
import initial from "./data/account.json"
import { useSecurity } from "./use-security"

export type AccountProfile = typeof initial.profile

export type NotificationPreferences = typeof initial.notifications

export function profileInitials(name: string) {
  return name
    .trim()
    .split(/\s+/u)
    .slice(0, 2)
    .map((part) => Array.from(part)[0])
    .join("")
    .toLocaleUpperCase()
}

export function useAccount() {
  const security = useSecurity()
  const [email, setEmail] = useState(initial.email)
  const [profile, setProfile] = useState(initial.profile)
  const [profileDraft, setProfileDraft] = useState(initial.profile)
  const [profileRevision, setProfileRevision] = useState(0)
  const [notifications, setNotifications] = useState(initial.notifications)

  const [notificationDraft, setNotificationDraft] = useState(
    initial.notifications,
  )

  function saveProfile() {
    const next = {
      ...profileDraft,
      name: profileDraft.name.trim(),
      bio: profileDraft.bio.trim(),
    }

    if (!next.name) return false
    setProfile(next)
    setProfileDraft(next)

    return true
  }

  function reset() {
    security.reset()
    setEmail(initial.email)
    setProfileRevision((revision) => revision + 1)
    setProfile(initial.profile)
    setProfileDraft(initial.profile)
    setNotifications(initial.notifications)
    setNotificationDraft(initial.notifications)
  }

  return {
    security,
    email,
    startAccount: (name: string, nextEmail: string) => {
      security.reset(true)
      const next = { name, bio: "", avatar: "" }
      setEmail(nextEmail)
      setProfile(next)
      setProfileDraft(next)
      setProfileRevision((revision) => revision + 1)
      setNotifications(initial.notifications)
      setNotificationDraft(initial.notifications)
    },
    profile,
    profileDraft,
    profileRevision,
    setProfileDraft,
    profileDirty: JSON.stringify(profile) !== JSON.stringify(profileDraft),
    saveProfile,
    cancelProfile: () => {
      setProfileDraft(profile)
      setProfileRevision((revision) => revision + 1)
    },
    notificationDraft,
    setNotificationDraft,
    notificationsDirty:
      JSON.stringify(notifications) !== JSON.stringify(notificationDraft),
    saveNotifications: () => setNotifications(notificationDraft),
    cancelNotifications: () => setNotificationDraft(notifications),
    reset,
  }
}
