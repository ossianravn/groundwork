import { createRootRoute, Outlet } from "@tanstack/react-router"
import { Button, buttonVariants } from "@/kit/ui/button"

export const rootRoute = createRootRoute({
  component: Outlet,
  notFoundComponent: () => (
    <main className="route-message">
      <h1>Page not found</h1>
      <p>This page is not part of the demo yet.</p>
      <a href="/app/demo/overview" className={buttonVariants()}>
        Open overview
      </a>
    </main>
  ),
  errorComponent: ({ reset }) => (
    <main className="route-message">
      <h1>The page could not load</h1>
      <p>Try loading the page again.</p>
      <Button onClick={reset}>Try again</Button>
    </main>
  ),
})
