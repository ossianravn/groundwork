import { Avatar, AvatarFallback, AvatarImage } from "@/kit/ui/avatar"

export interface AvatarPerson {
  name: string
  initials: string
  avatar?: string
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
      <AvatarFallback>{member.initials}</AvatarFallback>
    </Avatar>
  )
}
