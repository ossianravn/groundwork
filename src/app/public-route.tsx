import { Link, useNavigate, useSearch } from "@tanstack/react-router"
import { HomePage } from "@/features/public/home-page"
import { ProductPage } from "@/features/public/product-page"
import { PricingPage, type PlanLinkProps } from "@/features/public/pricing-page"
import { PublicPage, PublicLink, StoryLink } from "./public-page"

export function PublicRoute() {
  return (
    <PublicPage title="A clearer view of your projects">
      <HomePage LinkComponent={PublicLink} StoryLink={StoryLink} />
    </PublicPage>
  )
}

export function ProductRoute() {
  return (
    <PublicPage title="Product">
      <ProductPage LinkComponent={PublicLink} />
    </PublicPage>
  )
}

function PlanLink({ selection, ...props }: PlanLinkProps) {
  return (
    <Link
      {...props}
      to="/auth/sign-up"
      search={{ returnTo: "/app/demo/projects", token: "", ...selection }}
    />
  )
}

export function PricingRoute() {
  const { billing } = useSearch({ from: "/pricing" })
  const navigate = useNavigate()

  return (
    <PublicPage title="Pricing">
      <PricingPage
        billing={billing}
        onBillingChange={(value) => {
          void navigate({
            to: "/pricing",
            search: { billing: value },
            replace: true,
            resetScroll: false,
          })
        }}
        PlanLink={PlanLink}
      />
    </PublicPage>
  )
}
