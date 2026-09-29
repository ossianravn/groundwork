import { ScrollArea } from "@/kit/ui/scroll-area"

const releases = Array.from({ length: 24 }, (_, index) => ({
  version: `0.${Math.floor(index / 6)}.${index % 6}`,
  note: ["Fixes", "Tasks", "Search", "Files", "Views", "Import"][index % 6],
}))

export function ScrollAreaExample() {
  return (
    <ScrollArea
      className="h-64 max-w-xs rounded-lg border"
      viewportProps={{ role: "region", "aria-label": "Release history" }}
    >
      <ol className="grid p-3 pr-5 text-sm">
        {releases.map((release) => (
          <li
            key={release.version}
            className="flex justify-between border-b py-2 last:border-b-0"
          >
            <span className="font-medium tabular-nums">{release.version}</span>
            <span className="text-muted-foreground">{release.note}</span>
          </li>
        ))}
      </ol>
    </ScrollArea>
  )
}
