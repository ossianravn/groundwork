import {
  Agent,
  AgentHeader,
  AgentInstructions,
  AgentSection,
  AgentTool,
  AgentTools,
} from "@/kit/ai/agent"

export function AgentExample() {
  return (
    <Agent className="max-w-xl">
      <AgentHeader
        name="Release notes writer"
        model="Balanced"
        description="Turns merged work into customer-facing release notes."
      />
      <AgentInstructions>
        Write for customers, not engineers. Group changes by what people can now
        do. Never mention internal ticket numbers.
      </AgentInstructions>
      <AgentTools>
        <AgentTool
          name="listMergedWork"
          description="Reads work completed since the last release."
        />
        <AgentTool
          name="publishNotes"
          description="Publishes the notes to the changelog."
          note="Asks first"
        />
        <AgentTool
          name="notifySubscribers"
          description="Emails the changelog's subscribers."
          enabled={false}
        />
      </AgentTools>
      <AgentSection label="Output">
        <p className="text-muted-foreground">
          Markdown, one section per theme.
        </p>
      </AgentSection>
    </Agent>
  )
}
