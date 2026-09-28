import { useRef, useState } from "react"
import { Plus } from "lucide-react"
import {
  Combobox,
  ComboboxChip,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
} from "@/kit/ui/combobox"
import { Field, FieldLabel } from "@/kit/ui/field"
import { canonicalProjectTags, projectTagKey } from "@/demo/project-tags"

export function ProjectTagField({
  tags,
  options,
  onChange,
}: {
  tags: string[]
  options: string[]
  onChange: (tags: string[]) => void
}) {
  const anchor = useRef<HTMLDivElement | null>(null)
  const [query, setQuery] = useState("")

  const known = canonicalProjectTags([...options, ...tags], []).sort((a, b) =>
    a.localeCompare(b),
  )

  const selected = canonicalProjectTags(tags, known)
  const candidate = query.trim()

  const canCreate =
    !!candidate &&
    !known.some((tag) => projectTagKey(tag) === projectTagKey(candidate))

  const items = canCreate ? [...known, candidate] : known

  return (
    <Field>
      <FieldLabel htmlFor="edit-project-tags">Tags</FieldLabel>
      <Combobox
        multiple
        autoHighlight
        items={items}
        value={selected}
        inputValue={query}
        onInputValueChange={setQuery}
        filter={(item, search) =>
          projectTagKey(item).includes(projectTagKey(search))
        }
        onValueChange={(value) => {
          onChange(canonicalProjectTags(value, known))
          setQuery("")
        }}
      >
        <ComboboxChips ref={anchor}>
          {selected.map((tag) => (
            <ComboboxChip key={tag} removeLabel={`Remove ${tag}`}>
              {tag}
            </ComboboxChip>
          ))}
          <ComboboxChipsInput
            id="edit-project-tags"
            placeholder="Select or create tags…"
          />
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Type a tag name.</ComboboxEmpty>
          <ComboboxList>
            {(item: string) => (
              <ComboboxItem key={item} value={item}>
                {canCreate && item === candidate ? (
                  <>
                    <Plus aria-hidden="true" />
                    <span>Create “{item}”</span>
                  </>
                ) : (
                  item
                )}
              </ComboboxItem>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </Field>
  )
}
