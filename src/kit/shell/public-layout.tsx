import { useRef, useState, type ReactNode } from "react"
import { Menu, SlidersHorizontal, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/kit/ui/sheet"
import { BrandMark } from "./brand-mark"
import { useHeaderOffset } from "./use-header-offset"
import type { ShellBrand, ShellLinkComponent } from "./shell-link"

export interface PublicMenuLink<Destination extends string> {
  destination: Destination
  label: string
  /** Element id on the current page that receives focus after the menu closes. */
  section?: string
}

export function PublicLayout<Destination extends string>({
  children,
  LinkComponent,
  brand,
  home,
  navigation,
  actions,
  menuLinks,
  footerNavigation,
  footerNote,
  legalNavigation,
  onAppearance,
  announcement,
}: {
  children: ReactNode
  LinkComponent: ShellLinkComponent<Destination>
  brand: ShellBrand
  home: { destination: Destination; label: string }
  navigation: ReactNode
  actions: ReactNode
  menuLinks: PublicMenuLink<Destination>[]
  footerNavigation: ReactNode
  footerNote: ReactNode
  legalNavigation: ReactNode
  onAppearance: () => void
  /** A notice above the header, such as AnnouncementBar. */
  announcement?: ReactNode
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const destination = useRef<string | null>(null)
  const header = useHeaderOffset()

  const homeLink = (
    <LinkComponent
      destination={home.destination}
      className="brand"
      aria-label={home.label}
    >
      <BrandMark brand={brand} />
    </LinkComponent>
  )

  return (
    <div className="public-site">
      <a href="#main-content" className="skip-link">
        Skip to content
      </a>
      {announcement}
      <header className="public-header" ref={header}>
        <div className="public-container public-header-row">
          {homeLink}
          <nav aria-label="Main" className="public-desktop-nav">
            {navigation}
          </nav>
          <div className="public-header-actions">
            {actions}
            <Sheet
              open={menuOpen}
              onOpenChange={(open) => {
                setMenuOpen(open)

                if (open) destination.current = null
              }}
              onOpenChangeComplete={(open) => {
                if (!open && destination.current) {
                  const target = document.getElementById(destination.current)
                  target?.scrollIntoView()
                  target?.focus({ preventScroll: true })
                }
              }}
            >
              <SheetTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    className="public-menu-trigger"
                  />
                }
                aria-label="Open navigation"
              >
                <Menu aria-hidden="true" />
              </SheetTrigger>
              <SheetContent
                side="right"
                className="public-menu"
                showCloseButton={false}
                finalFocus={() => !destination.current}
              >
                <SheetHeader className="public-menu-heading">
                  <SheetTitle>Navigation</SheetTitle>
                  <SheetClose
                    render={<Button variant="ghost" size="icon" />}
                    aria-label="Close navigation"
                  >
                    <X aria-hidden="true" />
                  </SheetClose>
                </SheetHeader>
                <nav aria-label="Mobile main" className="public-menu-links">
                  {menuLinks.map((link) => (
                    <LinkComponent
                      key={link.destination}
                      destination={link.destination}
                      onClick={() => {
                        if (link.section) destination.current = link.section

                        setMenuOpen(false)
                      }}
                    >
                      {link.label}
                    </LinkComponent>
                  ))}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>
      {children}
      <footer className="public-footer">
        <div className="public-container">
          <div className="public-footer-main">
            {homeLink}
            <nav aria-label="Footer">{footerNavigation}</nav>
          </div>
          <div className="public-footer-meta">
            <span>{footerNote}</span>
            <nav aria-label="Legal">{legalNavigation}</nav>
            <Button variant="ghost" onClick={onAppearance}>
              <SlidersHorizontal data-icon="inline-start" aria-hidden="true" />
              Appearance
            </Button>
          </div>
        </div>
      </footer>
    </div>
  )
}
