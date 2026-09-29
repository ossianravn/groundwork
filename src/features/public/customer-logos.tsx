import { useState } from "react"
import { Pause, Play } from "lucide-react"
import { Button } from "@/kit/ui/button"
import customers from "@/demo/data/public-customers.json"

const marks = new Map([
  ["circle", "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z"],
  ["arch", "M5 20V11a7 7 0 0 1 14 0v9h-4v-9a3 3 0 0 0-6 0v9Z"],
  ["path", "M4 18c4-10 12-2 16-12M4 12c4-6 8 0 12-6"],
  ["square", "M5 5h14v14H5Z"],
  [
    "ring",
    "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  ],
  ["wave", "M3 14c3-4 6 4 9 0s6-4 9 0M3 9c3-4 6 4 9 0s6-4 9 0"],
])

function Logo({ name, mark }: { name: string; mark: string }) {
  return (
    <li className="customer-logo">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d={marks.get(mark)} />
      </svg>
      {name}
    </li>
  )
}

// Fictional sample teams (MKT-03). The marquee variant moves slowly, stops
// on hover or focus, offers Pause, and stays still under reduced motion.
export function CustomerLogos({
  motion = "static",
}: {
  motion?: "static" | "marquee"
}) {
  const [paused, setPaused] = useState(false)
  const teams = customers.teams

  return (
    <section className="customer-logos" aria-labelledby="customer-logos-title">
      <div className="customer-logos-heading">
        <h2 id="customer-logos-title">Teams planning in Tandem</h2>
        <p>Sample teams; the companies are fictional.</p>
        {motion === "marquee" && (
          <Button
            variant="ghost"
            size="sm"
            className="customer-logos-toggle"
            onClick={() => setPaused(!paused)}
          >
            {paused ? (
              <Play aria-hidden="true" data-icon="inline-start" />
            ) : (
              <Pause aria-hidden="true" data-icon="inline-start" />
            )}
            {paused ? "Play" : "Pause"}
            <span className="sr-only"> logo animation</span>
          </Button>
        )}
      </div>
      <div
        className="customer-logos-track"
        data-motion={motion}
        data-paused={paused || undefined}
      >
        <ul>
          {teams.map((team) => (
            <Logo key={team.slug} name={team.name} mark={team.mark} />
          ))}
        </ul>
        {motion === "marquee" && (
          // A second copy makes the loop seamless; it is decoration only.
          <ul aria-hidden="true">
            {teams.map((team) => (
              <Logo key={team.slug} name={team.name} mark={team.mark} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}
