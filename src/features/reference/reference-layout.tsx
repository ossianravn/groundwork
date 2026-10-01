import { useRef, useState, type ReactNode } from "react"
import { Menu, SlidersHorizontal, X, ArrowUpRight } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { BrandMark } from "@/kit/shell/brand-mark"
import { tandemBrand } from "@/components/tandem-brand"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/kit/ui/sheet"
import { componentCategories, components } from "./catalog"
import type { ReferenceLinkComponent } from "./reference-link"

export function ReferenceLayout({
  active,
  LinkComponent,
  onAppearance,
  children,
}: {
  active: string
  LinkComponent: ReferenceLinkComponent
  onAppearance: () => void
  children: ReactNode
}) {
  const [open, setOpen] = useState(false)
  const navigating = useRef(false)

  const navigation = (
    <>
      <LinkComponent
        destination="home"
        aria-current={active === "home" ? "page" : undefined}
      >
        Introduction
      </LinkComponent>
      <LinkComponent
        destination="components"
        aria-current={active === "components" ? "page" : undefined}
      >
        All components
      </LinkComponent>
      <LinkComponent
        destination="patterns"
        aria-current={active === "patterns" ? "page" : undefined}
      >
        Patterns
      </LinkComponent>
      <LinkComponent
        destination="charts"
        aria-current={active === "charts" ? "page" : undefined}
      >
        Charts
      </LinkComponent>
      <LinkComponent
        destination="themes"
        aria-current={active === "themes" ? "page" : undefined}
      >
        Themes
      </LinkComponent>
      <LinkComponent
        destination="states"
        aria-current={active === "states" ? "page" : undefined}
      >
        States
      </LinkComponent>
      {componentCategories.map((category) => (
        <div className="reference-nav-group" key={category}>
          <span>{category}</span>
          {components
            .filter((item) => item.category === category)
            .map((item) => (
              <LinkComponent
                key={item.id}
                destination="component"
                component={item.id}
                aria-current={active === item.id ? "page" : undefined}
              >
                {item.name}
              </LinkComponent>
            ))}
        </div>
      ))}
    </>
  )

  return (
    <div className="reference-site">
      <a className="skip-link" href="#main-content">
        Skip to content
      </a>
      <header className="reference-header">
        <div className="reference-header-inner">
          <LinkComponent
            destination="home"
            className="brand"
            aria-label="Tandem reference"
          >
            <BrandMark brand={tandemBrand} />
          </LinkComponent>
          <span className="reference-header-label">Reference</span>
          <nav aria-label="Examples" className="reference-header-links">
            <LinkComponent destination="website">Website</LinkComponent>
            <LinkComponent destination="demo">
              Open demo <ArrowUpRight aria-hidden="true" />
            </LinkComponent>
          </nav>
          <Button
            variant="ghost"
            size="icon"
            aria-label="Customize appearance"
            onClick={onAppearance}
          >
            <SlidersHorizontal />
          </Button>
          <Sheet
            open={open}
            onOpenChange={(value) => {
              if (value) navigating.current = false
              setOpen(value)
            }}
            onOpenChangeComplete={(value) => {
              if (!value && navigating.current)
                document
                  .getElementById("main-content")
                  ?.focus({ preventScroll: true })
            }}
          >
            <SheetTrigger
              className="reference-mobile-trigger"
              render={<Button variant="ghost" size="icon" />}
              aria-label="Browse reference"
            >
              <Menu />
            </SheetTrigger>
            <SheetContent
              side="left"
              showCloseButton={false}
              finalFocus={() => !navigating.current}
            >
              <SheetHeader className="reference-menu-heading">
                <SheetTitle>Reference</SheetTitle>
                <SheetClose
                  render={<Button variant="ghost" size="icon" />}
                  aria-label="Close navigation"
                >
                  <X />
                </SheetClose>
              </SheetHeader>
              <nav
                aria-label="Reference mobile"
                className="reference-navigation"
                onClick={(event) => {
                  if (
                    !(event.target instanceof Element) ||
                    !event.target.closest("a")
                  )
                    return
                  navigating.current = true
                  setOpen(false)
                }}
              >
                {navigation}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>
      <div className="reference-layout">
        <aside className="reference-sidebar">
          <nav aria-label="Reference" className="reference-navigation">
            {navigation}
          </nav>
        </aside>
        <main id="main-content" tabIndex={-1} className="reference-main">
          {children}
        </main>
      </div>
    </div>
  )
}
