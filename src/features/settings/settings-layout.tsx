import type { ComponentType, ReactNode } from "react"
import {
  KeyRound,
  Webhook,
  Bell,
  Palette,
  UserRound,
  Building2,
  Users,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  Sparkles,
} from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
} from "@/kit/ui/dropdown-menu"

const settingsSections = [
  { id: "profile", label: "Profile", icon: UserRound },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "workspace", label: "Workspace", icon: Building2 },
  { id: "team", label: "Team", icon: Users },
  { id: "assistant", label: "Assistant", icon: Sparkles },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "api-keys", label: "API keys", icon: KeyRound },
  { id: "webhooks", label: "Webhooks", icon: Webhook },
] as const

export type SettingsSection = (typeof settingsSections)[number]["id"]

export type SettingsLinkProps = {
  section: SettingsSection
  children?: ReactNode
  className?: string
  "aria-current"?: "page"
}

export function SettingsLayout({
  section,
  LinkComponent,
  children,
}: {
  section: SettingsSection
  LinkComponent: ComponentType<SettingsLinkProps>
  children: ReactNode
}) {
  return (
    <main
      id="main-content"
      tabIndex={-1}
      className="page-content settings-page"
    >
      <h1 className="sr-only">Settings</h1>
      <div className="settings-layout" data-section={section}>
        <nav aria-label="Settings" className="settings-navigation">
          <div className="settings-mobile-navigation">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={<Button variant="outline" />}
                aria-label="Settings section"
              >
                {settingsSections.find((item) => item.id === section)?.label}
                <ChevronDown aria-hidden="true" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuGroup>
                  {settingsSections.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      render={
                        <LinkComponent
                          section={item.id}
                          aria-current={
                            section === item.id ? "page" : undefined
                          }
                        />
                      }
                    >
                      <item.icon aria-hidden="true" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="settings-navigation-links">
            {settingsSections.map((item) => (
              <LinkComponent
                key={item.id}
                section={item.id}
                aria-current={section === item.id ? "page" : undefined}
              >
                <item.icon aria-hidden="true" />
                <span>{item.label}</span>
              </LinkComponent>
            ))}
          </div>
        </nav>
        <section className="settings-section" aria-labelledby="settings-title">
          {children}
        </section>
      </div>
    </main>
  )
}
