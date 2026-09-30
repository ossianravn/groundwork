import {
  Agent,
  AgentHeader,
  AgentInstructions,
  AgentSection,
  AgentTool,
  AgentTools,
} from "@/kit/ai/agent"
import { Field, FieldLabel } from "@/kit/ui/field"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/kit/ui/select"
import { Switch } from "@/kit/ui/switch"

export interface AgentProfile {
  name: string
  description: string
  instructions: string
  output: string
  tools: {
    id: string
    name: string
    label: string
    description: string
    note?: string
  }[]
}

/**
 * Settings › Assistant: what the workspace assistant is and may do. The
 * agent summary describes it; the controls below change it at once.
 */
export function AssistantSettings({
  agent,
  models,
  model,
  onModelChange,
  enabled,
  onToolChange,
}: {
  agent: AgentProfile
  models: { id: string; name: string; description: string }[]
  model: string
  onModelChange: (id: string) => void
  /** Whether each tool, by id, is on. */
  enabled: Record<string, boolean>
  onToolChange: (id: string, on: boolean) => void
}) {
  const current = models.find((item) => item.id === model)

  return (
    <div className="settings-form assistant-settings">
      <header className="settings-section-heading">
        <h2 id="settings-title">Assistant</h2>
        <p>
          What the workspace assistant can read and do. Changes apply at once.
        </p>
      </header>
      <Agent aria-label="Assistant summary">
        <AgentHeader
          name={agent.name}
          model={current?.name}
          description={agent.description}
        />
        <AgentInstructions>{agent.instructions}</AgentInstructions>
        <AgentTools>
          {agent.tools.map((tool) => (
            <AgentTool
              key={tool.id}
              name={tool.name}
              description={tool.description}
              note={tool.note}
              enabled={enabled[tool.id] ?? true}
            />
          ))}
        </AgentTools>
        <AgentSection label="Output">
          <p className="text-muted-foreground">{agent.output}</p>
        </AgentSection>
      </Agent>
      <section className="assistant-settings-group" aria-label="Model">
        <Field className="assistant-settings-model">
          <FieldLabel htmlFor="assistant-default-model">
            Default model
          </FieldLabel>
          <Select
            value={model}
            onValueChange={(value) => {
              if (value) onModelChange(value)
            }}
          >
            <SelectTrigger id="assistant-default-model">
              <SelectValue>{current?.name}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {models.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <p className="text-muted-foreground">{current?.description}</p>
        </Field>
      </section>
      <section
        className="assistant-settings-group"
        aria-labelledby="assistant-tools"
      >
        <h3 id="assistant-tools">Tools</h3>
        <ul className="assistant-settings-tools">
          {agent.tools.map((tool) => (
            <li key={tool.id}>
              <label className="assistant-settings-tool">
                <span>
                  <span className="font-medium">{tool.label}</span>
                  <span className="text-muted-foreground">
                    {tool.description}
                  </span>
                </span>
                <Switch
                  checked={enabled[tool.id] ?? true}
                  onCheckedChange={(checked) => onToolChange(tool.id, checked)}
                />
              </label>
            </li>
          ))}
        </ul>
        <p className="settings-note">
          With a tool off, the assistant says so and points here instead of
          answering. Creating tasks always asks before it changes anything.
        </p>
      </section>
    </div>
  )
}
