import { useState } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"
import {
  isStateScenario,
  stateScenarios,
  stateGroups,
  stateSource,
} from "./state-catalog"
import { StateProjects } from "./state-projects"
import { StateEditor } from "./state-editor"
import { StateTeam } from "./state-team"
import { PatternSource } from "./pattern-source"
import type { ReferenceContextLinkComponent } from "./reference-link"

export function StateGallery({
  scenario,
  onScenario,
  readSource,
  ContextLink,
}: {
  scenario: string
  onScenario: (scenario: string) => void
  readSource: (path: string) => Promise<string>
  ContextLink: ReferenceContextLinkComponent
}) {
  const [revision, setRevision] = useState(0)

  if (!isStateScenario(scenario))
    return (
      <Empty>
        <EmptyHeader>
          <EmptyTitle>Scenario not found</EmptyTitle>
          <EmptyDescription>
            Choose an available example from the state gallery.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button onClick={() => onScenario("loading")}>Browse states</Button>
        </EmptyContent>
      </Empty>
    )

  const item = stateScenarios[scenario]
  const choices = Object.entries(stateScenarios).map(([value, entry]) => ({
    value,
    label: entry.label,
  }))

  return (
    <div className="reference-stack state-gallery">
      <header className="reference-heading">
        <h1>State gallery</h1>
        <p>
          Explore a state and its recovery. Each example has its own temporary
          workspace; your demo stays unchanged.
        </p>
      </header>
      <div className="state-toolbar">
        <label htmlFor="state-scenario">Scenario</label>
        <Select
          items={choices}
          value={scenario}
          onValueChange={(value) => {
            if (value) onScenario(value)
          }}
        >
          <SelectTrigger id="state-scenario">
            <SelectValue />
          </SelectTrigger>
          <SelectContent alignItemWithTrigger={false}>
            {stateGroups.map((group) => (
              <SelectGroup key={group}>
                <SelectLabel>{group}</SelectLabel>
                {choices
                  .filter(
                    ({ value }) =>
                      isStateScenario(value) &&
                      stateScenarios[value].group === group,
                  )
                  .map((choice) => (
                    <SelectItem key={choice.value} value={choice.value}>
                      {choice.label}
                    </SelectItem>
                  ))}
              </SelectGroup>
            ))}
          </SelectContent>
        </Select>
        <Button
          variant="outline"
          onClick={() => setRevision((value) => value + 1)}
        >
          <RotateCcw />
          Reset
        </Button>
      </div>
      <section className="state-example" aria-label={`${item.label} example`}>
        <div className="state-example-context">
          <h2>{item.label}</h2>
          <p>{item.description}</p>
        </div>
        <div className="state-preview" key={`${scenario}-${revision}`}>
          {scenario === "destructive-action" ? (
            <StateTeam />
          ) : item.group === "Results" ? (
            <StateProjects scenario={scenario} />
          ) : (
            <StateEditor scenario={scenario} />
          )}
        </div>
      </section>
      <details className="state-notes">
        <summary>Behavior &amp; boundaries</summary>
        <p>{item.boundary}</p>
        <p>
          Reset, changing scenarios or reloading restores the fixture. This URL
          shares the starting scenario, not your changes.
        </p>
        <div className="reference-context-links">
          <ContextLink
            href={
              scenario === "destructive-action"
                ? "/app/demo/settings/team"
                : "/app/demo/projects"
            }
          >
            {scenario === "destructive-action"
              ? "Open team settings"
              : "Open Projects"}
          </ContextLink>
        </div>
      </details>
      <PatternSource
        paths={[
          `src/features/reference/${stateSource(scenario)}.tsx`,
          item.source,
        ]}
        readSource={readSource}
      />
    </div>
  )
}
