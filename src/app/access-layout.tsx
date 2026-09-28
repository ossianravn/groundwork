import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { AccessLayout } from "@/features/auth/access-layout"
import { BrandMark } from "@/kit/shell/brand-mark"
import { tandemBrand } from "@/components/tandem-brand"

export function AccessPage(
  props: Omit<ComponentProps<typeof AccessLayout>, "demoLink" | "homeLink">,
) {
  return (
    <AccessLayout
      {...props}
      homeLink={
        <Link to="/" className="brand" aria-label="Tandem home">
          <BrandMark brand={tandemBrand} />
        </Link>
      }
      demoLink={
        <Link
          to="/app/demo/overview"
          search={{ period: 14 }}
          className="access-link text-xs"
        >
          Open demo ↗
        </Link>
      }
    />
  )
}
