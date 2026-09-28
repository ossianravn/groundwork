import { useNavigate, useParams } from "@tanstack/react-router"
import { StateGallery } from "@/features/reference/state-gallery"
import { ReferencePage, ReferenceContextLink } from "./reference-page"
import { readPatternSource } from "./pattern-sources"

export function StateGalleryRoute() {
  const { scenario = "loading" } = useParams({ strict: false })
  const navigate = useNavigate()

  return (
    <ReferencePage title="State gallery" active="states">
      <StateGallery
        scenario={scenario}
        readSource={readPatternSource}
        ContextLink={ReferenceContextLink}
        onScenario={(next) =>
          void navigate({
            to: "/reference/states/$scenario",
            params: { scenario: next },
          })
        }
      />
    </ReferencePage>
  )
}
