import { Kbd, KbdGroup } from "@/kit/ui/kbd"
import type { ComponentProps, ComponentType } from "react"
import { ArrowLeft, ArrowUpRight, BookOpen, Keyboard, Mail } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/kit/ui/dialog"
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/kit/ui/accordion"
import { guides } from "@/features/resources/content"

export type HelpLinkProps = Omit<ComponentProps<"a">, "href"> & {
  page: "help" | "contact"
  slug?: string
}

export type HelpLinkComponent = ComponentType<HelpLinkProps>

export type HelpView = "help" | "shortcuts"

export function WorkspaceHelp({
  open,
  view,
  onViewChange,
  onOpenChange,
  pathname,
  LinkComponent,
}: {
  open: boolean
  view: HelpView
  onViewChange: (view: HelpView) => void
  onOpenChange: (open: boolean) => void
  pathname: string
  LinkComponent: HelpLinkComponent
}) {
  const slugs =
    pathname.includes("projects") || pathname.endsWith("activity")
      ? ["create-and-edit-projects", "move-projects", "explore-and-reset"]
      : pathname.includes("settings")
        ? ["manage-the-team", "change-appearance", "explore-and-reset"]
        : ["explore-and-reset", "create-and-edit-projects", "change-appearance"]

  const related = slugs.flatMap((slug) =>
    guides.filter((guide) => guide.slug === slug),
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="workspace-help" showCloseButton={false}>
        <DialogHeader showCloseButton>
          <DialogTitle>
            {view === "help" ? "Help" : "Keyboard shortcuts"}
          </DialogTitle>
        </DialogHeader>
        {view === "help" ? (
          <>
            <Accordion>
              {related.map((guide) => (
                <AccordionItem key={guide.slug} value={guide.slug}>
                  <AccordionTrigger>{guide.title}</AccordionTrigger>
                  <AccordionContent>
                    <p>{guide.summary}</p>
                    <LinkComponent
                      page="help"
                      slug={guide.slug}
                      className="help-guide-link"
                      onClick={() => onOpenChange(false)}
                    >
                      Read guide <ArrowUpRight aria-hidden="true" />
                    </LinkComponent>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
            <div className="help-actions">
              <LinkComponent
                page="help"
                className="help-action"
                onClick={() => onOpenChange(false)}
              >
                <BookOpen aria-hidden="true" />
                Help center
                <ArrowUpRight aria-hidden="true" />
              </LinkComponent>
              <Button
                variant="ghost"
                className="help-action"
                onClick={() => onViewChange("shortcuts")}
              >
                <Keyboard data-icon="inline-start" aria-hidden="true" />
                Keyboard shortcuts<Kbd>?</Kbd>
              </Button>
              <LinkComponent
                page="contact"
                className="help-action"
                onClick={() => onOpenChange(false)}
              >
                <Mail aria-hidden="true" />
                Contact
                <ArrowUpRight aria-hidden="true" />
              </LinkComponent>
            </div>
          </>
        ) : (
          <>
            <dl className="shortcut-list">
              <div>
                <dt>Find a project</dt>
                <dd>
                  <KbdGroup>
                    <Kbd>Ctrl / ⌘</Kbd>
                    <Kbd>K</Kbd>
                  </KbdGroup>
                </dd>
              </div>
              <div>
                <dt>Keyboard shortcuts</dt>
                <dd>
                  <Kbd>?</Kbd>
                </dd>
              </div>
              <div>
                <dt>Close an overlay</dt>
                <dd>
                  <Kbd>Esc</Kbd>
                </dd>
              </div>
            </dl>
            <Button
              variant="ghost"
              className="justify-self-start"
              onClick={() => onViewChange("help")}
            >
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              Back to help
            </Button>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
