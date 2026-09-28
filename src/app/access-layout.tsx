import type { ComponentProps } from "react"
import { Link } from "@tanstack/react-router"
import { AccessLayout } from "@/features/auth/access-layout"
import { BrandMark } from "@/kit/shell/brand-mark"
import { formaBrand } from "@/components/forma-brand"

export function AccessPage(
  props: Omit<ComponentProps<typeof AccessLayout>, "demoLink" | "homeLink">,
) {
  return (
    <AccessLayout
      {...props}
      homeLink={
        <Link to="/" className="brand" aria-label="Forma home">
          <BrandMark brand={formaBrand} />
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
