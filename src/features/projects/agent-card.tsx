import type { LucideIcon } from "lucide-react"
import { ChevronDown } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/kit/ui/dropdown-menu"

export interface AgentDescription {
  label: string
  icon: LucideIcon
  /** What it does for the person, in one line. */
  promise: string
  /** What it will read, from the project's records now. */
  reads: string
  /** What it will produce, drawn from the same records. */
  produces: string[]
  /** When the person decides, before anything changes. */
  policy: string
}

/**
 * One agent the project can run (design-system.md, agents): what it does,
 * what it reads and produces, when the person approves, and how it last
 * went, with Start and a schedule.
 */
export function AgentCard({
  agent,
  lastRun,
  unavailable,
  scheduled,
  onScheduleChange,
  onStart,
}: {
  agent: AgentDescription
  /** "17 Sept · Posted to Comments", or nothing before its first run. */
  lastRun?: string
  /** Why it can't start now, in place of Start's action. */
  unavailable?: string
  scheduled: boolean
  onScheduleChange: (scheduled: boolean) => void
  onStart: () => void
}) {
  const Icon = agent.icon

  return (
    <article className="agent-card" aria-labelledby={`agent-${agent.label}`}>
      <header className="agent-card-head">
        <span className="agent-card-icon" aria-hidden="true">
          <Icon />
        </span>
        <div>
          <h3 id={`agent-${agent.label}`}>{agent.label}</h3>
          <p>{agent.promise}</p>
        </div>
      </header>
      <dl className="agent-card-facts">
        <div>
          <dt>Reads</dt>
          <dd>{agent.reads}</dd>
        </div>
        <div>
          <dt>Produces</dt>
          <dd>
            <ul className="agent-card-preview">
              {agent.produces.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </dd>
        </div>
        <div>
          <dt>Approval</dt>
          <dd>{agent.policy}</dd>
        </div>
        <div>
          <dt>Last run</dt>
          <dd>
            {lastRun ?? "Not run yet"}
            {scheduled && " · Runs every Friday"}
          </dd>
        </div>
      </dl>
      <footer className="agent-card-actions">
        {unavailable && <p className="agent-card-note">{unavailable}</p>}
        <div className="agent-card-start" data-control-group="">
          <Button
            size="sm"
            disabled={Boolean(unavailable)}
            aria-label={`Start: ${agent.label}`}
            onClick={onStart}
          >
            Start
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<Button size="sm" />}
              aria-label={`Schedule: ${agent.label}`}
            >
              <ChevronDown aria-hidden="true" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuCheckboxItem
                checked={scheduled}
                onCheckedChange={onScheduleChange}
              >
                Every Friday
              </DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </footer>
    </article>
  )
}
