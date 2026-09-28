import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { RouterProvider } from "@tanstack/react-router"
import { TooltipProvider } from "@/kit/ui/tooltip"
import { router } from "@/app/router"
import { DemoStateProvider } from "@/app/demo-state-provider"
import { applyTheme, readTheme } from "@/kit/theme/preferences"
import "./styles/demo.css"

applyTheme(readTheme())

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <TooltipProvider>
      <DemoStateProvider>
        <RouterProvider router={router} />
      </DemoStateProvider>
    </TooltipProvider>
  </StrictMode>,
)
