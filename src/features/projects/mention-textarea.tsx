import { useId, useRef, useState, type ComponentProps } from "react"
import { Textarea } from "@/kit/ui/textarea"
import { MemberAvatar } from "@/kit/member-avatar"
import type { Member } from "@/demo/model"

// "@" followed by up to two words, ending at the caret.
const trigger = /(?:^|\s)@([^\s@]*(?: [^\s@]*)?)$/u

interface Query {
  start: number
  end: number
  matches: Member[]
}

/**
 * A textarea that suggests teammates after "@" (TABL-13). Arrow keys move
 * through the suggestions, Enter or Tab inserts "@Full Name", and Escape
 * closes the list without leaving the field. Ctrl or Cmd+Enter submits.
 */
export function MentionTextarea({
  value,
  onValueChange,
  members,
  onSubmit,
  ...props
}: Omit<ComponentProps<"textarea">, "value" | "onChange" | "onSubmit"> & {
  value: string
  onValueChange: (value: string) => void
  members: Member[]
  onSubmit: () => void
}) {
  const listId = useId()
  const field = useRef<HTMLTextAreaElement>(null)
  const [query, setQuery] = useState<Query | null>(null)
  const [active, setActive] = useState(0)

  function detect(text: string, caret: number) {
    const match = trigger.exec(text.slice(0, caret))
    const typed = match?.[1].toLowerCase() ?? ""

    const matches = match
      ? members.filter((member) =>
          [member.name, ...member.name.split(" ")].some((part) =>
            part.toLowerCase().startsWith(typed),
          ),
        )
      : []

    setActive(0)
    setQuery(
      matches.length
        ? { start: caret - typed.length - 1, end: caret, matches }
        : null,
    )
  }

  function insert(member: Member) {
    if (!query) return

    const mention = `@${member.name} `
    const next = value.slice(0, query.start) + mention + value.slice(query.end)
    const caret = query.start + mention.length

    onValueChange(next)
    setQuery(null)
    requestAnimationFrame(() => {
      field.current?.focus()
      field.current?.setSelectionRange(caret, caret)
    })
  }

  const option = (index: number) => `${listId}-${index}`

  return (
    <div className="mention-field">
      <Textarea
        {...props}
        ref={field}
        value={value}
        aria-autocomplete="list"
        aria-controls={query ? listId : undefined}
        aria-activedescendant={query ? option(active) : undefined}
        onChange={(event) => {
          onValueChange(event.target.value)
          detect(event.target.value, event.target.selectionStart)
        }}
        onClick={(event) => detect(value, event.currentTarget.selectionStart)}
        onBlur={() => setQuery(null)}
        onKeyDown={(event) => {
          if (query) {
            const count = query.matches.length

            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault()
              setActive(
                (active + (event.key === "ArrowDown" ? 1 : -1) + count) % count,
              )
            } else if (event.key === "Enter" || event.key === "Tab") {
              event.preventDefault()
              insert(query.matches[active])
            } else if (event.key === "Escape") {
              event.preventDefault()
              event.stopPropagation()
              setQuery(null)
            }

            return
          }

          if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
            event.preventDefault()
            onSubmit()
          }
        }}
      />
      {query && (
        <ul
          id={listId}
          role="listbox"
          aria-label="Teammates"
          className="mention-list"
        >
          {query.matches.map((member, index) => (
            <li
              key={member.id}
              id={option(index)}
              role="option"
              aria-selected={index === active}
              className="mention-option"
              // Keep focus in the textarea while choosing with a pointer.
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => insert(member)}
            >
              <span aria-hidden="true">
                <MemberAvatar member={member} size="sm" />
              </span>
              {member.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
