import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import { PublicLayout, type PublicMenuLink } from "@/kit/shell/public-layout"
import { tandemBrand } from "./tandem-brand"
import type { PublicDestination, PublicLinkComponent } from "./public-link"
import { PublicResources } from "./public-resources"
import { TandemAnnouncement } from "./tandem-announcement"
import { PublicFooterGroup } from "@/kit/shell/public-footer-group"

const menuLinks: PublicMenuLink<PublicDestination>[] = [
  { destination: "product", label: "Product" },
  { destination: "pricing", label: "Pricing" },
  { destination: "customers", label: "Customers" },
  { destination: "integrations", label: "Integrations" },
  { destination: "features", label: "Features", section: "features" },
  { destination: "questions", label: "FAQ", section: "questions" },
  { destination: "blog", label: "Articles" },
  { destination: "changelog", label: "Changelog" },
  { destination: "roadmap", label: "Roadmap" },
  { destination: "help", label: "Help" },
  { destination: "status", label: "Status" },
  { destination: "about", label: "About" },
  { destination: "contact", label: "Contact" },
  { destination: "sign-in", label: "Sign in" },
]

export function TandemPublicLayout({
  children,
  LinkComponent,
  onAppearance,
}: {
  children: ReactNode
  LinkComponent: PublicLinkComponent
  onAppearance: () => void
}) {
  return (
    <PublicLayout
      LinkComponent={LinkComponent}
      brand={tandemBrand}
      home={{ destination: "home", label: "Tandem home" }}
      announcement={<TandemAnnouncement LinkComponent={LinkComponent} />}
      navigation={
        <>
          <LinkComponent destination="product">Product</LinkComponent>
          <LinkComponent destination="pricing">Pricing</LinkComponent>
          <LinkComponent destination="customers">Customers</LinkComponent>
          <PublicResources LinkComponent={LinkComponent} />
        </>
      }
      actions={
        <>
          <LinkComponent destination="sign-in" className="public-sign-in">
            Sign in
          </LinkComponent>
          <LinkComponent destination="demo" className={buttonVariants()}>
            Open demo
            <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
          </LinkComponent>
        </>
      }
      menuLinks={menuLinks}
      footerNavigation={
        <>
          <PublicFooterGroup title="Product">
            <LinkComponent destination="product">Product</LinkComponent>
            <LinkComponent destination="pricing">Pricing</LinkComponent>
            <LinkComponent destination="customers">Customers</LinkComponent>
            <LinkComponent destination="integrations">
              Integrations
            </LinkComponent>
          </PublicFooterGroup>
          <PublicFooterGroup title="Resources">
            <LinkComponent destination="blog">Articles</LinkComponent>
            <LinkComponent destination="changelog">Changelog</LinkComponent>
            <LinkComponent destination="roadmap">Roadmap</LinkComponent>
            <LinkComponent destination="help">Help</LinkComponent>
            <LinkComponent destination="status">Status</LinkComponent>
          </PublicFooterGroup>
          <PublicFooterGroup title="Company">
            <LinkComponent destination="about">About</LinkComponent>
            <LinkComponent destination="careers">Careers</LinkComponent>
            <LinkComponent destination="contact">Contact</LinkComponent>
          </PublicFooterGroup>
          <PublicFooterGroup title="Template">
            <LinkComponent destination="reference">
              Reference library
            </LinkComponent>
            <a
              href="https://github.com/ossianravn/groundwork"
              target="_blank"
              rel="noreferrer"
            >
              Template source <ArrowUpRight aria-hidden="true" />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          </PublicFooterGroup>
        </>
      }
      footerNote="Tandem · Interactive demo"
      legalNavigation={
        <>
          <LinkComponent destination="privacy">Privacy</LinkComponent>
          <LinkComponent destination="terms">Terms</LinkComponent>
        </>
      }
      onAppearance={onAppearance}
    >
      {children}
    </PublicLayout>
  )
}
