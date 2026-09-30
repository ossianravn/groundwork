import { Separator } from "@/kit/ui/separator"
import { Sources } from "@/kit/ai/sources"

export function SourcesExample() {
  return (
    <div className="grid max-w-xl gap-3 text-sm">
      <p>
        Website redesign has the most open work: 27 of 48 tasks with two weeks
        to go.
      </p>
      <Separator />
      <Sources
        sources={[
          {
            href: "/app/demo/projects/website",
            title: "Website redesign",
            description: "In progress · due 8 Oct · 27 of 48 tasks open",
          },
          {
            href: "/app/demo/activity",
            title: "Activity",
            description: "7 events, 18 – 24 Sept",
          },
          {
            href: "https://ai-sdk.dev/docs/reference/ai-sdk-ui/use-chat",
            title: "useChat reference",
          },
        ]}
      />
    </div>
  )
}
