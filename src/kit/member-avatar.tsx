import type { CSSProperties } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/kit/ui/avatar"

export interface AvatarPerson {
  name: string
  initials: string
  avatar?: string
}

const hues = ["violet", "teal", "amber", "rose", "green", "sky"] as const

/** The same person always gets the same hue (a djb2 hash of the name). */
function hueOf(name: string) {
  let hash = 5381

  for (const character of name)
    hash = (hash * 33 + (character.codePointAt(0) ?? 0)) >>> 0

  return hues[hash % hues.length] ?? hues[0]
}

// Initials sit on a soft tint of the person's hue; oklab mixing keeps the
// tint's hue next to the near-neutral surface.
const tinted = (name: string): CSSProperties => {
  const hue = `var(--hue-${hueOf(name)})`

  return {
    background: `color-mix(in oklab, ${hue} 22%, var(--card))`,
    color: `color-mix(in oklab, ${hue} 55%, var(--foreground))`,
  }
}

export function MemberAvatar({
  member,
  size = "default",
}: {
  member: AvatarPerson
  size?: "sm" | "default" | "lg"
}) {
  return (
    <Avatar size={size} role="img" aria-label={member.name}>
      {member.avatar && <AvatarImage src={member.avatar} alt="" />}
      <AvatarFallback style={tinted(member.name)}>
        {member.initials}
      </AvatarFallback>
    </Avatar>
  )
}
