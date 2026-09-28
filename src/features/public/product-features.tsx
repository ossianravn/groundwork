import { Columns3, LayoutGrid, Table2 } from "lucide-react"
import { projectColorStyle } from "@/components/project-color"
import { MemberAvatar } from "@/kit/member-avatar"
import { ProjectDueDate } from "@/components/project-due-date"
import { ProjectMark } from "@/components/project-identity"
import { ProjectStatus } from "@/components/project-status"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/kit/ui/table"
import { initialProjects } from "@/demo/project-fixtures"
import workspace from "@/demo/data/workspace.json"
import content from "@/demo/data/public-product.json"
import { AppearancePreview } from "@/kit/theme/appearance-choices"

const project = initialProjects[0]

const owner = workspace.members.find((member) => member.id === project.ownerId)!

function ViewsExample() {
  return (
    <div className="product-example product-views-example">
      <div className="product-example-surface">
        <Table aria-label="Sample project progress">
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Progress</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {initialProjects.slice(0, 3).map((item) => (
              <TableRow key={item.id}>
                <TableCell>
                  <span className="product-example-project">
                    <ProjectMark color={item.color} />
                    {item.name}
                  </span>
                </TableCell>
                <TableCell>
                  {Math.round((item.completedTasks / item.tasks) * 100)}%
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="product-view-labels">
        <span>
          <Table2 aria-hidden="true" />
          Table
        </span>
        <span>
          <LayoutGrid aria-hidden="true" />
          Cards
        </span>
        <span>
          <Columns3 aria-hidden="true" />
          Board
        </span>
      </div>
    </div>
  )
}

function OwnershipExample() {
  return (
    <div className="product-example">
      <div className="product-example-surface product-owner-example">
        <div className="product-example-project">
          <ProjectMark color={project.color} />
          <strong>{project.name}</strong>
        </div>
        <ProjectStatus status={project.status} />
        <dl>
          <div>
            <dt>Owner</dt>
            <dd>
              <MemberAvatar member={owner} size="sm" />
              {owner.name}
            </dd>
          </div>
          <div>
            <dt>Due date</dt>
            <dd>
              <ProjectDueDate date={project.dueDate} />
            </dd>
          </div>
        </dl>
        <div className="product-example-progress">
          <span>
            {project.completedTasks} / {project.tasks} tasks
          </span>
          <span>
            {Math.round((project.completedTasks / project.tasks) * 100)}%
          </span>
          <progress
            style={projectColorStyle(project.color)}
            value={project.completedTasks}
            max={project.tasks}
            aria-label="Brand refresh completed tasks"
          />
        </div>
      </div>
    </div>
  )
}

function AppearanceExample() {
  return (
    <div className="product-example product-appearance-example">
      <div className="product-theme-pair">
        <div>
          <AppearancePreview mode="light" />
          <span>Light</span>
        </div>
        <div>
          <AppearancePreview mode="dark" />
          <span>Dark</span>
        </div>
      </div>
      <div className="product-appearance-details">
        <span className="product-font-sample">Aa</span>
        <span>
          Type, color
          <br />
          and density
        </span>
        <div
          className="product-accent-samples"
          role="img"
          aria-label="Indigo, teal and neutral accents"
        >
          <span data-swatch="indigo" />
          <span data-swatch="teal" />
          <span data-swatch="neutral" />
        </div>
      </div>
    </div>
  )
}

const examples = [ViewsExample, OwnershipExample, AppearanceExample]

export function ProductFeatures() {
  return (
    <section
      className="public-container product-feature-section"
      aria-label="Project workflows"
    >
      <div className="product-feature-grid">
        {content.features.map((feature, index) => {
          const Example = examples[index]

          return (
            <article key={feature.title}>
              <Example />
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </article>
          )
        })}
      </div>
    </section>
  )
}
