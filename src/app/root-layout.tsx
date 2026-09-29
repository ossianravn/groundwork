import { Outlet, useRouterState } from "@tanstack/react-router"
import { ToastProvider } from "@/kit/ui/toast"
import { RouteProgress } from "@/kit/shell/route-progress"

// Every page shares one toast stack and the route loading bar.
export function RootLayout() {
  const pending = useRouterState({ select: (state) => state.isLoading })

  return (
    <ToastProvider>
      <RouteProgress pending={pending} />
      <Outlet />
    </ToastProvider>
  )
}
