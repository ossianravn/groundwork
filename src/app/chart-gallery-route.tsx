import { useNavigate, useSearch } from "@tanstack/react-router"
import { ChartGallery } from "@/features/reference/charts/chart-gallery"
import { chartFamilies } from "@/features/reference/charts/gallery-families"
import { ReferenceContextLink, ReferencePage } from "./reference-page"
import { chartFamilyOf } from "./chart-gallery-search"

export function ChartGalleryRoute() {
  const search = useSearch({ from: "/reference/charts" })
  const navigate = useNavigate({ from: "/reference/charts" })

  return (
    <ReferencePage title="Charts" active="charts">
      <ChartGallery
        families={chartFamilies}
        family={search.family}
        onFamilyChange={(family) => {
          void navigate({
            search: { family: chartFamilyOf(family) },
            replace: true,
            resetScroll: false,
          })
        }}
        ContextLink={ReferenceContextLink}
      />
    </ReferencePage>
  )
}
