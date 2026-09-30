import { Snippet } from "@/kit/ui/snippet"

export function SnippetExample() {
  return (
    <div className="grid max-w-md gap-2">
      <p className="text-sm text-muted-foreground">
        Add the code block to your project:
      </p>
      <Snippet
        prefix="$"
        label="install command"
        code="npx shadcn add ossianravn/groundwork/code-block"
      />
    </div>
  )
}
