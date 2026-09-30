import { useRef, useState } from "react"
import { ChevronRight, Ellipsis, Plus, Send } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
} from "@/kit/ui/empty"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"
import type { Delivery, Webhook, WebhookValues } from "@/demo/integrations"
import { WebhookDialog } from "./webhook-dialog"
import { CodeBlock } from "@/kit/ui/code-block"

/** Indents a JSON response; anything else is shown as it came. */
function readable(body: string) {
  try {
    return JSON.stringify(JSON.parse(body), null, 2)
  } catch {
    // Not JSON: the sample endpoint's raw text is the useful view.
    return body
  }
}

export function WebhookSettings({
  webhooks,
  deliveries,
  onSave,
  onTest,
  failFirstTest,
}: {
  webhooks: Webhook[]
  deliveries: Delivery[]
  onSave: (id: string | null, values: WebhookValues) => void
  onTest: (id: string, failed: boolean) => void
  failFirstTest: boolean
}) {
  const [editing, setEditing] = useState<{ webhook: Webhook | null } | null>(
    null,
  )

  const [announcement, setAnnouncement] = useState("")
  const opener = useRef<HTMLElement | null>(null)
  const tested = useRef(false)

  return (
    <div className="integration-settings">
      <header className="settings-section-heading integration-heading">
        <h2 id="settings-title">Webhooks</h2>
        <Button
          onClick={(event) => {
            opener.current = event.currentTarget
            setEditing({ webhook: null })
          }}
        >
          <Plus data-icon="inline-start" />
          Add endpoint
        </Button>
      </header>
      <ul className="integration-list" aria-label="Webhook endpoints">
        {webhooks.map((webhook) => {
          const history = deliveries.filter(
            (delivery) => delivery.webhookId === webhook.id,
          )

          const latest = history[0]

          return (
            <li key={webhook.id} className="webhook-row">
              <div className="integration-row">
                <div className="integration-record">
                  <div className="integration-record-heading">
                    <h3>{webhook.name}</h3>
                    <Badge variant="secondary">
                      {!latest
                        ? "Not tested"
                        : latest.status < 400
                          ? "Delivered"
                          : "Failed"}
                    </Badge>
                  </div>
                  <p className="integration-url">{webhook.url}</p>
                  <p className="integration-meta">
                    {webhook.events.join(" · ")}
                  </p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    id={`webhook-actions-${webhook.id}`}
                    render={<Button variant="ghost" size="icon-sm" />}
                    aria-label={`Actions for ${webhook.name}`}
                  >
                    <Ellipsis />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        onClick={() => {
                          opener.current = document.getElementById(
                            `webhook-actions-${webhook.id}`,
                          )
                          setEditing({ webhook })
                        }}
                      >
                        Edit endpoint
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
              <details className="webhook-history">
                <summary>
                  Deliveries
                  {history.length > 0 && <span>{history.length}</span>}
                </summary>
                <div className="webhook-history-content">
                  <div className="integration-heading">
                    <p className="settings-note">Simulated deliveries</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const failed = failFirstTest && !tested.current
                        tested.current = true
                        onTest(webhook.id, failed)
                        setAnnouncement(
                          `${webhook.name}: simulated test ${failed ? "failed, HTTP 500" : "delivered, HTTP 200"}.`,
                        )
                      }}
                    >
                      <Send data-icon="inline-start" />
                      {latest?.status === 500 ? "Retry test" : "Send test"}
                    </Button>
                  </div>
                  {!history.length && (
                    <p className="settings-note">No deliveries yet.</p>
                  )}
                  <ul
                    className="delivery-list"
                    aria-label={`Deliveries for ${webhook.name}`}
                  >
                    {history.map((delivery) => (
                      <li key={delivery.id}>
                        <details className="delivery-detail">
                          <summary>
                            <ChevronRight
                              className="delivery-chevron"
                              aria-hidden="true"
                            />
                            <span>
                              {delivery.event}
                              <time dateTime={delivery.date}>
                                {new Date(delivery.date).toLocaleString(
                                  "en-GB",
                                  {
                                    day: "numeric",
                                    month: "short",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  },
                                )}
                              </time>
                            </span>
                            <Badge variant="outline">
                              HTTP {delivery.status}
                            </Badge>
                          </summary>
                          <p className="integration-url">{delivery.url}</p>
                          <CodeBlock
                            className="webhook-response"
                            code={readable(delivery.response)}
                            language="json"
                            filename="Response body"
                          />
                        </details>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          )
        })}
      </ul>
      {!webhooks.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No endpoints</EmptyTitle>
            <EmptyDescription>
              Add an endpoint and choose which events it receives.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <p className="settings-note">
        Demo tests stay on this device. No requests are sent.
      </p>
      <span role="status" className="sr-only">
        {announcement}
      </span>
      {editing && (
        <WebhookDialog
          webhook={editing.webhook}
          returnFocus={opener}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </div>
  )
}
