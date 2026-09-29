import { Avatar, AvatarFallback } from "@/kit/ui/avatar"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/kit/ui/hover-card"

export function HoverCardExample() {
  return (
    <p className="text-sm">
      Owned by{" "}
      <HoverCard>
        <HoverCardTrigger
          href="/app/demo/activity?member=ava"
          className="font-medium underline underline-offset-4"
        >
          Ava Morgan
        </HoverCardTrigger>
        <HoverCardContent align="start" className="grid gap-2">
          <div className="flex items-center gap-3">
            <Avatar size="lg">
              <AvatarFallback>AM</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">Ava Morgan</p>
              <p className="text-muted-foreground">Owner · Design</p>
            </div>
          </div>
          <p className="text-muted-foreground">
            Owns 2 projects. The name links to their activity.
          </p>
        </HoverCardContent>
      </HoverCard>
      .
    </p>
  )
}
