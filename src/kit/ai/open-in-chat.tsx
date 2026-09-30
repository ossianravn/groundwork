import * as React from "react"
import { ArrowUpRight, ChevronDown, MessageSquare } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"

/**
 * Takes a question about the current page to a chat: your own assistant or
 * an outside one. The menu lists destinations; outside ones open in a new tab
 * with the question filled in (see `chatLinks`).
 */
function OpenInChat({
  label = "Open in chat",
  children,
}: {
  label?: string
  /** OpenInChatItem entries. */
  children: React.ReactNode
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={<Button variant="outline" size="sm" type="button" />}
      >
        <MessageSquare data-icon="inline-start" aria-hidden="true" />
        {label}
        <ChevronDown data-icon="inline-end" aria-hidden="true" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-60">
        {children}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * One destination. With `href` it is an outside link that opens in a new tab;
 * pass `render` for an in-app link from your router instead.
 */
function OpenInChatItem({
  icon,
  label,
  href,
  render,
}: {
  icon: React.ReactNode
  label: string
  href?: string
  render?: React.ReactElement
}) {
  const external = !render

  return (
    <DropdownMenuItem
      className="gap-2.5"
      render={
        render ?? <a href={href} target="_blank" rel="noopener noreferrer" />
      }
    >
      <span className="flex size-4 shrink-0 items-center justify-center">
        {icon}
      </span>
      <span className="flex-1">{label}</span>
      {external && (
        <>
          <ArrowUpRight
            className="size-3.5 text-muted-foreground"
            aria-hidden="true"
          />
          <span className="sr-only">(opens in a new tab)</span>
        </>
      )}
    </DropdownMenuItem>
  )
}

export { OpenInChat, OpenInChatItem }
