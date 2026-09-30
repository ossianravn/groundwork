import * as React from "react"
import { FileText } from "lucide-react"
import { cn } from "cn"
import { Shimmer } from "@/kit/ui/shimmer"

/**
 * Something the assistant made to be used outside the conversation, such as
 * a document: a titled surface with its actions in the header and the
 * content below. Actions act on the artifact, not the conversation.
 */
function Artifact({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="artifact"
      className={cn(
        "grid min-w-0 overflow-hidden rounded-lg border border-border bg-background",
        className,
      )}
      {...props}
    />
  )
}

function ArtifactHeader({
  title,
  description,
  streaming = false,
  icon,
  children,
}: {
  title: string
  description?: React.ReactNode
  /** The content is still arriving. */
  streaming?: boolean
  icon?: React.ReactNode
  /** ArtifactActions. */
  children?: React.ReactNode
}) {
  return (
    <header
      data-slot="artifact-header"
      className="flex min-w-0 flex-wrap items-center gap-x-3 border-b border-border py-(--control-padding-block) ps-3 pe-1.5"
    >
      <span
        className="flex size-4 shrink-0 text-muted-foreground"
        aria-hidden="true"
      >
        {icon ?? <FileText className="size-4" />}
      </span>
      <div className="grid min-w-0 flex-1 basis-40 py-1.5">
        <h3 className="truncate text-sm font-medium">
          {streaming ? <Shimmer>{title}</Shimmer> : title}
        </h3>
        {description && (
          <p className="truncate text-xs text-muted-foreground">
            {description}
          </p>
        )}
      </div>
      {children}
    </header>
  )
}

function ArtifactActions({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact-actions"
      role="group"
      aria-label="Artifact actions"
      className={cn("ms-auto flex shrink-0 items-center gap-0.5", className)}
      {...props}
    />
  )
}

/** The artifact itself; long content scrolls within a bounded height. */
function ArtifactContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="artifact-content"
      tabIndex={0}
      className={cn(
        "max-h-[28rem] overflow-y-auto p-4 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset",
        className,
      )}
      {...props}
    />
  )
}

/** A line under the content, such as where the artifact was used. */
function ArtifactFooter({
  className,
  ...props
}: React.ComponentProps<"footer">) {
  return (
    <footer
      data-slot="artifact-footer"
      className={cn(
        "flex flex-wrap items-center gap-2 border-t border-border px-3 py-2 text-xs text-muted-foreground",
        className,
      )}
      {...props}
    />
  )
}

export {
  Artifact,
  ArtifactHeader,
  ArtifactActions,
  ArtifactContent,
  ArtifactFooter,
}
