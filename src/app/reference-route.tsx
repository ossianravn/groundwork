import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { ReferenceHome } from "@/features/reference/reference-home"
import { ComponentCatalog } from "@/features/reference/component-catalog"
import { ComponentDetail } from "@/features/reference/component-detail"
import { components } from "@/features/reference/catalog"
import {
  ReferencePage,
  ReferenceLink,
  ReferenceContextLink,
} from "./reference-page"
import { referenceExamples } from "./reference-examples"

export function ReferenceHomeRoute() {
  return (
    <ReferencePage title="Introduction" active="home">
      <ReferenceHome
        LinkComponent={ReferenceLink}
        ContextLink={ReferenceContextLink}
      />
    </ReferencePage>
  )
}

export function ComponentCatalogRoute() {
  const search = useSearch({ from: "/reference/components" })
  const navigate = useNavigate({ from: "/reference/components" })

  return (
    <ReferencePage title="Components" active="components">
      <ComponentCatalog
        query={search.q}
        category={search.category}
        onChange={(q, category) => {
          void navigate({
            search: { q, category },
            replace: true,
            resetScroll: false,
          })
        }}
        LinkComponent={ReferenceLink}
      />
    </ReferencePage>
  )
}

export function ComponentDetailRoute() {
  const { component } = useParams({ from: "/reference/components/$component" })
  const search = useSearch({ from: "/reference/components/$component" })
  const navigate = useNavigate({ from: "/reference/components/$component" })
  const item = components.find((entry) => entry.id === component)

  return (
    <ReferencePage
      title={item?.name ?? "Component not found"}
      active={component}
    >
      <div className="reference-back">
        <ReferenceLink destination="components">← All components</ReferenceLink>
      </div>
      <ComponentDetail
        key={component}
        id={component}
        example={referenceExamples.find((entry) => entry.id === component)}
        panel={search.panel}
        onPanelChange={(panel) => {
          void navigate({
            search: { ...search, panel },
            replace: true,
            resetScroll: false,
          })
        }}
        LinkComponent={ReferenceLink}
        ContextLink={ReferenceContextLink}
      />
    </ReferencePage>
  )
}
