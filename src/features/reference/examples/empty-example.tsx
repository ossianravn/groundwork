import { useState } from "react"
import { Button } from "@/kit/ui/button"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import { initialProjects as projects } from "@/demo/project-fixtures"

export function EmptyExample() {
  const [query, setQuery] = useState("Unmatched")

  const results = projects.filter((project) =>
    project.name.toLowerCase().includes(query.toLowerCase()),
  )

  return results.length ? (
    <ul className="grid gap-2">
      {results.map((project) => (
        <li key={project.id}>{project.name}</li>
      ))}
    </ul>
  ) : (
    <Empty>
      <EmptyHeader>
        <EmptyTitle>No projects found</EmptyTitle>
        <EmptyDescription>No projects match “{query}”.</EmptyDescription>
      </EmptyHeader>
      <Button variant="outline" onClick={() => setQuery("")}>
        Clear search
      </Button>
    </Empty>
  )
}
