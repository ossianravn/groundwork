import { useNavigate, useParams, useSearch } from "@tanstack/react-router"
import { PatternIndex } from "@/features/reference/pattern-index"
import { PatternDetail } from "@/features/reference/pattern-detail"
import { patterns } from "@/features/reference/pattern-catalog"
import {
  ReferencePage,
  ReferenceLink,
  ReferenceContextLink,
} from "./reference-page"
import { readPatternSource } from "./pattern-sources"

export function PatternIndexRoute() {
  const search = useSearch({ from: "/reference/patterns" })
  const navigate = useNavigate({ from: "/reference/patterns" })
  return (
    <ReferencePage title="Patterns" active="patterns">
      <PatternIndex
        filters={search}
        LinkComponent={ReferenceLink}
        onChange={(filters) => {
          void navigate({ search: filters, replace: true, resetScroll: false })
        }}
      />
    </ReferencePage>
  )
}

export function PatternDetailRoute() {
  const { patternId } = useParams({ from: "/reference/patterns/$patternId" })
  const search = useSearch({ from: "/reference/patterns/$patternId" })
  const navigate = useNavigate({ from: "/reference/patterns/$patternId" })
  const item = patterns.find((pattern) => pattern.id === patternId)
  return (
    <ReferencePage title={item?.title ?? "Pattern not found"} active="patterns">
      <div className="reference-back">
        <ReferenceLink destination="patterns">← All patterns</ReferenceLink>
      </div>
      <PatternDetail
        key={patternId}
        id={patternId}
        exampleIndex={search.example}
        onExampleChange={(example) => {
          void navigate({
            search: { ...search, example },
            replace: true,
            resetScroll: false,
          })
        }}
        readSource={readPatternSource}
        LinkComponent={ReferenceLink}
        ContextLink={ReferenceContextLink}
      />
    </ReferencePage>
  )
}
