import { useEffect, useState, type ComponentProps, type ReactNode } from "react"
import { Link, useLocation } from "@tanstack/react-router"
import { TandemPublicLayout } from "@/components/tandem-public-layout"
import type { PublicLinkProps } from "@/components/public-link"
import { ThemePanel } from "@/kit/theme/theme-panel"
import { useDemoState } from "./demo-state"
import { defaultProjectsSearch } from "./projects-search"
import { releases } from "@/features/resources/content"

export function PublicLink({ destination, ...props }: PublicLinkProps) {
  switch (destination) {
    case "reference":
      return <Link {...props} to="/reference" />
    case "contact":
      return <Link {...props} to="/contact" search={{ scenario: "normal" }} />
    case "privacy":
      return <Link {...props} to="/privacy" />
    case "terms":
      return <Link {...props} to="/terms" />
    case "blog":
      return <Link {...props} to="/blog" />
    case "changelog":
      return <Link {...props} to="/changelog" />
    case "customers":
      return <Link {...props} to="/customers" />
    case "integrations":
      return <Link {...props} to="/integrations" />
    case "about":
    case "careers":
      return (
        <Link
          {...props}
          to="/about"
          hash={destination === "careers" ? "careers" : ""}
        />
      )
    case "roadmap":
      return <Link {...props} to="/roadmap" />
    case "status":
      return <Link {...props} to="/status" />
    case "latest-release":
      return (
        <Link
          {...props}
          to="/changelog/$version"
          params={{ version: releases[0].version }}
        />
      )
    case "help":
      return <Link {...props} to="/help" search={{ q: "" }} />
    case "product":
      return <Link {...props} to="/product" />
    case "pricing":
      return <Link {...props} to="/pricing" search={{ billing: "monthly" }} />
    case "project-comments":
      return (
        <Link
          {...props}
          to="/app/demo/projects/$projectId"
          params={{ projectId: "brand" }}
          search={{ returnTo: "/app/demo/projects" }}
          hash="comment-draft"
        />
      )
    case "import":
      return <Link {...props} to="/app/demo/projects/import" />
    case "timeline":
      return (
        <Link
          {...props}
          to="/app/demo/projects"
          search={{ ...defaultProjectsSearch, view: "timeline" }}
        />
      )
    case "project-detail":
      return (
        <Link
          {...props}
          to="/app/demo/projects/$projectId"
          params={{ projectId: "brand" }}
          search={{ returnTo: "/app/demo/projects" }}
        />
      )
    case "home":
    case "features":
    case "questions":
      return (
        <Link
          {...props}
          to="/"
          hash={destination === "home" ? "" : destination}
        />
      )
    case "demo":
      return <Link {...props} to="/app/demo/overview" search={{ period: 14 }} />
    case "projects":
    case "board":
      return (
        <Link
          {...props}
          to="/app/demo/projects"
          search={{
            ...defaultProjectsSearch,
            view: destination === "board" ? "board" : "table",
          }}
        />
      )
    case "sign-in":
    case "sign-up":
      return (
        <Link
          {...props}
          to={destination === "sign-in" ? "/auth/sign-in" : "/auth/sign-up"}
          search={{ returnTo: "/app/demo/overview?period=14", token: "" }}
        />
      )
  }
}

export function StoryLink({
  slug,
  ...props
}: Omit<ComponentProps<"a">, "href"> & { slug: string }) {
  return <Link {...props} to="/customers/$slug" params={{ slug }} />
}

export function PublicPage({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  const { appearance } = useDemoState()
  const [themeOpen, setThemeOpen] = useState(false)
  const { hash, pathname } = useLocation()

  useEffect(() => {
    document
      .getElementById(hash || "main-content")
      ?.focus({ preventScroll: true })
  }, [hash, pathname])

  return (
    <>
      <title>{`${title} · Tandem`}</title>
      <TandemPublicLayout
        LinkComponent={PublicLink}
        onAppearance={() => setThemeOpen(true)}
      >
        {children}
      </TandemPublicLayout>
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
