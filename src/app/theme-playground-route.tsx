import { ThemePlayground } from "@/features/reference/theme-playground"
import type { ThemePreviewPage } from "@/features/reference/theme-preview"
import { ReferencePage } from "./reference-page"
import { useDemoState } from "./demo-state"

const pages: [ThemePreviewPage, ...ThemePreviewPage[]] = [
  { value: "/product", label: "Public page" },
  { value: "/app/demo/overview", label: "Dashboard" },
  { value: "/app/demo/projects", label: "Project table" },
  { value: "/app/demo/settings/profile", label: "Settings form" },
]

export function ThemePlaygroundRoute() {
  const library = useDemoState().presetLibrary

  return (
    <ReferencePage title="Theme playground" active="themes">
      <ThemePlayground
        pages={pages}
        draft={library.draft}
        baseline={library.baseline}
        presets={library.presets}
        error={library.error}
        onChange={library.setDraft}
        onSelect={library.select}
        onSave={library.save}
      />
    </ReferencePage>
  )
}
