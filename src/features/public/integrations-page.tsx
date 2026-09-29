import { useState } from "react"
import { Search } from "lucide-react"
import { Input } from "@/kit/ui/input"
import { ToggleGroup, ToggleGroupItem } from "@/kit/ui/toggle-group"
import { Badge } from "@/kit/ui/badge"
import { projectColorStyle } from "@/components/project-color"
import { isProjectColor } from "@/demo/project-colors"
import company from "@/demo/data/public-company.json"

const categories = [
  ...new Set(company.integrations.map((item) => item.category)),
]

// A directory of fictional integrations (MKT-18), filtered by category and
// a search over names and descriptions.
export function IntegrationsPage() {
  const [category, setCategory] = useState("")
  const [query, setQuery] = useState("")
  const terms = query.trim().toLowerCase().split(/\s+/u).filter(Boolean)

  const shown = company.integrations.filter(
    (item) =>
      (!category || item.category === category) &&
      terms.every((term) =>
        `${item.name} ${item.description}`.toLowerCase().includes(term),
      ),
  )

  return (
    <main id="main-content" tabIndex={-1} className="company-page">
      <header className="public-page-heading public-container">
        <h1>Connect the tools you already use.</h1>
        <p>
          Sample integrations for the template. None of them connect to a real
          service.
        </p>
      </header>
      <section
        className="public-container integrations"
        aria-label="Integrations"
      >
        <div className="integrations-filters">
          <div className="integrations-search">
            <Search aria-hidden="true" />
            <Input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search integrations"
              placeholder="Search integrations"
            />
          </div>
          <ToggleGroup
            aria-label="Category"
            className="flex-wrap"
            variant="outline"
            size="sm"
            spacing={1}
            value={[category || "all"]}
            onValueChange={(values) =>
              values[0] && setCategory(values[0] === "all" ? "" : values[0])
            }
          >
            <ToggleGroupItem value="all">All</ToggleGroupItem>
            {categories.map((item) => (
              <ToggleGroupItem key={item} value={item}>
                {item}
              </ToggleGroupItem>
            ))}
          </ToggleGroup>
        </div>
        <p role="status" className="integrations-count">
          {shown.length} {shown.length === 1 ? "integration" : "integrations"}
        </p>
        {shown.length > 0 ? (
          <ul className="integrations-grid">
            {shown.map((item) => (
              <li
                key={item.id}
                style={projectColorStyle(
                  isProjectColor(item.color) ? item.color : "violet",
                )}
              >
                <span className="integration-mark" aria-hidden="true">
                  {item.name[0]}
                </span>
                <div>
                  <h2>{item.name}</h2>
                  <p className="integration-category">{item.category}</p>
                </div>
                {item.status !== "Available" && (
                  <Badge variant="outline">{item.status}</Badge>
                )}
                <p className="integration-description">{item.description}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="integrations-empty">
            No integrations match. Try another word or category.
          </p>
        )}
      </section>
    </main>
  )
}
