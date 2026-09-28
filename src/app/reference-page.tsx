import { useEffect, useState, type ReactNode, type ComponentProps } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { ReferenceLayout } from "@/features/reference/reference-layout"
import type { ReferenceLinkProps } from "@/features/reference/reference-link"
import { ThemePanel } from "@/kit/theme/theme-panel"
import { useDemoState } from "./demo-state"
import { parseReferenceSearch } from "./reference-search"
import { parsePatternSearch } from "./pattern-search"

export function ReferenceLink({
  destination,
  component = "",
  patternId = "",
  ...props
}: ReferenceLinkProps) {
  const search = useLocation({
    select: (location) => parseReferenceSearch(location.search),
  })

  const patternSearch = useLocation({
    select: (location) => parsePatternSearch(location.search),
  })

  switch (destination) {
    case "states":
      return (
        <Link
          {...props}
          to="/reference/states/$scenario"
          params={{ scenario: "loading" }}
        />
      )
    case "themes":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/reference/themes"
        />
      )
    case "home":
      return <Link activeOptions={{ exact: true }} {...props} to="/reference" />
    case "website":
      return <Link activeOptions={{ exact: true }} {...props} to="/" />
    case "demo":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/app/demo/overview"
          search={{ period: 14 }}
        />
      )
    case "components":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/reference/components"
          search={search}
        />
      )
    case "component":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/reference/components/$component"
          params={{ component }}
          search={{ ...search, panel: "preview" }}
        />
      )
    case "patterns":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/reference/patterns"
          search={patternSearch}
        />
      )
    case "pattern":
      return (
        <Link
          activeOptions={{ exact: true }}
          {...props}
          to="/reference/patterns/$patternId"
          params={{ patternId }}
          search={{ ...patternSearch, example: 0 }}
        />
      )
  }
}

export function ReferenceContextLink({
  href,
  ...props
}: ComponentProps<"a"> & { href: string }) {
  const url = new URL(href, "https://reference.local")

  return (
    <Link
      {...props}
      to={url.pathname}
      search={Object.fromEntries(url.searchParams)}
      hash={url.hash.slice(1)}
    />
  )
}

export function ReferencePage({
  title,
  active,
  children,
}: {
  title: string
  active: string
  children: ReactNode
}) {
  const { appearance } = useDemoState()
  const [themeOpen, setThemeOpen] = useState(false)
  const pathname = useLocation({ select: (location) => location.pathname })

  useEffect(() => {
    document.getElementById("main-content")?.focus({ preventScroll: true })
  }, [pathname])

  return (
    <>
      <title>{title} · Tandem Reference</title>
      <ReferenceLayout
        active={active}
        LinkComponent={ReferenceLink}
        onAppearance={() => setThemeOpen(true)}
      >
        {children}
      </ReferenceLayout>
      <ThemePanel
        open={themeOpen}
        onOpenChange={setThemeOpen}
        theme={appearance.theme}
        saved={appearance.saved}
        feedback={appearance.feedback}
        onRestore={appearance.restoreDefaults}
        onChange={appearance.updateTheme}
      />
    </>
  )
}
