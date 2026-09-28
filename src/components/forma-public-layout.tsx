import type { ReactNode } from "react"
import { ArrowUpRight } from "lucide-react"
import { buttonVariants } from "@/kit/ui/button"
import { PublicLayout, type PublicMenuLink } from "@/kit/shell/public-layout"
import { formaBrand } from "./forma-brand"
import type { PublicDestination, PublicLinkComponent } from "./public-link"
import { PublicResources } from "./public-resources"

const menuLinks: PublicMenuLink<PublicDestination>[] = [
  { destination: "product", label: "Product" },
  { destination: "pricing", label: "Pricing" },
  { destination: "features", label: "Features", section: "features" },
  { destination: "questions", label: "FAQ", section: "questions" },
  { destination: "blog", label: "Articles" },
  { destination: "changelog", label: "Changelog" },
  { destination: "help", label: "Help" },
  { destination: "contact", label: "Contact" },
  { destination: "sign-in", label: "Sign in" },
]

export function FormaPublicLayout({
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
      brand={formaBrand}
      home={{ destination: "home", label: "Forma home" }}
      navigation={
        <>
          <LinkComponent destination="product">Product</LinkComponent>
          <LinkComponent destination="pricing">Pricing</LinkComponent>
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
          <LinkComponent destination="product">Product</LinkComponent>
          <LinkComponent destination="pricing">Pricing</LinkComponent>
          <LinkComponent destination="blog">Articles</LinkComponent>
          <LinkComponent destination="changelog">Changelog</LinkComponent>
          <LinkComponent destination="help">Help</LinkComponent>
          <LinkComponent destination="contact">Contact</LinkComponent>
          <LinkComponent destination="reference">
            Reference library
          </LinkComponent>
          <a
            href="https://github.com/ossianravn/awesome-web-template"
            target="_blank"
            rel="noreferrer"
          >
            Template source <ArrowUpRight aria-hidden="true" />
            <span className="sr-only"> (opens in a new tab)</span>
          </a>
        </>
      }
      footerNote="Forma · Interactive demo"
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
