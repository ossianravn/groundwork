import { ArrowUpRight } from "lucide-react"
import type {
  PublicDestination,
  PublicLinkComponent,
} from "@/components/public-link"

const steps: {
  title: string
  description: string
  action: string
  destination: PublicDestination
}[] = [
  {
    title: "Bring your projects in",
    description:
      "Create a project with an owner and a due date, or import a spreadsheet and fix what needs it.",
    action: "Try the import",
    destination: "import",
  },
  {
    title: "Break the work down",
    description:
      "Add tasks, assign them and tick them off. Progress follows the tasks, not a status report.",
    action: "Open a project",
    destination: "project-detail",
  },
  {
    title: "Work it out together",
    description:
      "Comment with @mentions, attach files, and undo anything that went the wrong way.",
    action: "See the comments",
    destination: "project-comments",
  },
  {
    title: "See it all at once",
    description:
      "Follow every project on the Timeline, and save the views your team comes back to.",
    action: "Open the timeline",
    destination: "timeline",
  },
]

// Four steps from first project to the big picture (MKT-24); each opens the
// part of the demo it describes.
export function HowItWorks({
  LinkComponent,
}: {
  LinkComponent: PublicLinkComponent
}) {
  return (
    <section
      className="how-it-works public-container"
      aria-labelledby="how-it-works-title"
    >
      <div className="public-section-heading">
        <h2 id="how-it-works-title">How it works.</h2>
        <p>Four steps, each one open in the sample workspace.</p>
      </div>
      <ol>
        {steps.map((step, index) => (
          <li key={step.title}>
            <span className="how-it-works-number" aria-hidden="true">
              {String(index + 1).padStart(2, "0")}
            </span>
            <h3>{step.title}</h3>
            <p>{step.description}</p>
            <LinkComponent destination={step.destination}>
              {step.action}
              <ArrowUpRight aria-hidden="true" />
            </LinkComponent>
          </li>
        ))}
      </ol>
    </section>
  )
}
