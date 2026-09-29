import { getRouteApi } from "@tanstack/react-router"
import { useToast } from "@/kit/ui/use-toast"
import { SavedViewsMenu } from "@/features/projects/saved-views-menu"
import type { ProjectsSearch } from "./projects-search"
import { sameView, savedViewSearch, viewNameError } from "./saved-views"
import { useDemoWorkspace } from "./workspace-context"

const route = getRouteApi("/app/demo/projects")

/** Saved views for Projects: they read and write the route's search. */
export function ProjectSavedViews({ search }: { search: ProjectsSearch }) {
  const navigate = route.useNavigate()
  const toast = useToast()
  const { results } = useDemoWorkspace()
  const views = results.savedViews
  const current = savedViewSearch(search)
  const active = views.find((view) => sameView(view.search, current))

  return (
    <SavedViewsMenu
      views={views}
      activeId={active?.id ?? null}
      onApply={(id) => {
        const view = views.find((item) => item.id === id)

        if (!view) return

        void navigate({
          search: (previous) => ({ ...previous, ...view.search, page: 1 }),
          resetScroll: false,
        })
      }}
      onSave={(name) => {
        const error = viewNameError(name, views)

        if (!error)
          results.setSavedViews([
            ...views,
            {
              id: crypto.randomUUID(),
              name: name.trim(),
              search: current,
              builtIn: false,
            },
          ])

        return error
      }}
      onDelete={(id) => {
        const view = views.find((item) => item.id === id)

        results.setSavedViews(views.filter((item) => item.id !== id))
        toast.add({ title: `Deleted ${view?.name ?? "the view"}` })
      }}
      onCopyLink={() => {
        navigator.clipboard.writeText(window.location.href).then(
          () => toast.add({ title: "Link copied", type: "success" }),
          () =>
            toast.add({
              title: "Couldn’t copy the link",
              description: "Copy it from the address bar instead.",
              type: "error",
            }),
        )
      }}
    />
  )
}
