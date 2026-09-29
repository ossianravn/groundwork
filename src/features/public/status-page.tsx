import { CircleCheck } from "lucide-react"
import { formatDate } from "@/demo/model"
import company from "@/demo/data/public-company.json"

const days = 90

// A sample status page (MKT-22): the current state, 90 days per component
// (older on the left), and the incident history with its updates.
export function StatusPage() {
  const { components, incidents } = company.status

  return (
    <main id="main-content" tabIndex={-1} className="company-page">
      <header className="public-page-heading public-container">
        <h1>Tandem status.</h1>
        <p>
          Sample status for the template; the demo runs in your browser and has
          no live service.
        </p>
      </header>
      <div className="status public-container">
        <p className="status-summary" role="status">
          <CircleCheck aria-hidden="true" />
          All systems operational
        </p>
        <ul className="status-components" aria-label="Components">
          {components.map((component) => {
            const uptime = (
              ((days - component.incidentDays.length) / days) *
              100
            ).toFixed(2)

            return (
              <li key={component.id}>
                <div className="status-component-heading">
                  <h2>{component.name}</h2>
                  <span>{component.status}</span>
                </div>
                <ol
                  className="status-days"
                  aria-label={`${uptime}% uptime over ${days} days`}
                >
                  {Array.from({ length: days }, (_, index) => {
                    const ago = days - 1 - index

                    return (
                      <li
                        key={ago}
                        data-incident={
                          component.incidentDays.includes(ago) || undefined
                        }
                      />
                    )
                  })}
                </ol>
                <p className="status-days-legend" aria-hidden="true">
                  <span>{days} days ago</span>
                  <span>{uptime}% uptime</span>
                  <span>Today</span>
                </p>
              </li>
            )
          })}
        </ul>
        <section aria-labelledby="incidents-title" className="status-incidents">
          <h2 id="incidents-title">Past incidents</h2>
          <ol>
            {incidents.map((incident) => (
              <li key={incident.id}>
                <h3>{incident.title}</h3>
                <p className="status-incident-meta">
                  <time dateTime={incident.date}>
                    {formatDate(incident.date, { year: "numeric" })}
                  </time>{" "}
                  · {incident.component} · {incident.impact} impact
                </p>
                <ol className="status-updates">
                  {incident.updates.map((update) => (
                    <li key={update.time}>
                      <strong>{update.label}</strong> {update.time}:{" "}
                      {update.text}
                    </li>
                  ))}
                </ol>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </main>
  )
}
