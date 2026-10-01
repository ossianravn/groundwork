import { Ellipsis } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { Badge } from "@/kit/ui/badge"
import { Snippet } from "@/kit/ui/snippet"
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
import type { ApiKey } from "@/demo/integrations"
import { formatDate } from "@/demo/model"
import { CreateKeyDialog } from "./create-key-dialog"
import { ApiUsageChart } from "./api-usage-chart"

export function ApiKeySettings({
  keys,
  onCreate,
  onRevoke,
}: {
  keys: ApiKey[]
  onCreate: (name: string, access: string) => string
  onRevoke: (id: string) => void
}) {
  return (
    <div className="integration-settings">
      <header className="settings-section-heading integration-heading">
        <h2 id="settings-title">API keys</h2>
        <CreateKeyDialog onCreate={onCreate} />
      </header>
      <ApiUsageChart keys={keys} />
      <ul className="integration-list" aria-label="API keys">
        {keys.map((key) => (
          <li key={key.id} className="integration-row">
            <div className="integration-record">
              <div className="integration-record-heading">
                <h3>{key.name}</h3>
                <Badge variant="secondary">
                  {key.revoked ? "Revoked" : "Active"}
                </Badge>
              </div>
              <p>
                <code>•••• {key.suffix}</code> · {key.access}
              </p>
              <p className="integration-meta">
                Created {formatDate(key.created)} ·{" "}
                {key.lastUsed
                  ? `Last used ${formatDate(key.lastUsed)}`
                  : "Never used"}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="ghost" size="icon-sm" />}
                aria-label={`Actions for ${key.name}`}
              >
                <Ellipsis />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="text-destructive"
                    disabled={key.revoked}
                    onClick={() => onRevoke(key.id)}
                  >
                    Revoke key
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </li>
        ))}
      </ul>
      {!keys.length && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>No API keys</EmptyTitle>
            <EmptyDescription>
              Create a key to try the integration workflow.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      <section className="integration-usage" aria-labelledby="api-usage-title">
        <h3 id="api-usage-title">Make a request</h3>
        <p>Send a key as a bearer token, for example to list projects:</p>
        <Snippet
          prefix="$"
          label="request"
          code={`curl https://api.tandem.example/v1/projects -H "Authorization: Bearer $TANDEM_API_KEY"`}
        />
      </section>
      <p className="settings-note">
        Demo keys cannot access an API, and the address is illustrative. Changes
        reset on reload.
      </p>
    </div>
  )
}
