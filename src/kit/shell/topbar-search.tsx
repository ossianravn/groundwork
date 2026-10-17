"use client"

import { useEffect, useRef, type ReactNode } from "react"
import { Command as CommandPrimitive } from "cmdk"
import { Search, X } from "lucide-react"
import { Button } from "@/kit/ui/button"
import { CommandList } from "@/kit/ui/command"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
} from "@/kit/ui/input-group"
import { Kbd, KbdGroup } from "@/kit/ui/kbd"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/kit/ui/tooltip"

export interface TopbarSearchProps {
  /** Names the magnifier, its tooltip and the field. */
  label: string
  placeholder: string
  open: boolean
  onOpenChange: (open: boolean) => void
  query: string
  onQueryChange: (query: string) => void
  /** The keys that open search, e.g. ["Ctrl", "K"]; the host handles them. */
  hint?: string[]
  keyShortcuts?: string
  /** false when the host filters its own results (cmdk filters by default). */
  shouldFilter?: boolean
  /** The results: CommandEmpty, CommandGroup and CommandItem elements. */
  children: ReactNode
}

/**
 * Top-bar search that stays a magnifier until it's used. Opening it expands
 * the magnifier in place into a field with results below. Escape or a click
 * outside collapses it; Escape also returns focus to the magnifier.
 */
export function TopbarSearch({
  label,
  placeholder,
  open,
  onOpenChange,
  query,
  onQueryChange,
  hint,
  keyShortcuts,
  shouldFilter = true,
  children,
}: TopbarSearchProps) {
  const root = useRef<HTMLDivElement>(null)
  const trigger = useRef<HTMLButtonElement>(null)
  const refocus = useRef(false)

  useEffect(() => {
    if (!open) {
      if (refocus.current) trigger.current?.focus()
      refocus.current = false

      return
    }

    function onPointerDown(event: PointerEvent) {
      if (
        !(event.target instanceof Node) ||
        !root.current?.contains(event.target)
      )
        onOpenChange(false)
    }

    document.addEventListener("pointerdown", onPointerDown)

    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [open, onOpenChange])

  function collapse() {
    refocus.current = true
    onOpenChange(false)
  }

  const keys = hint && (
    <KbdGroup aria-hidden="true">
      {hint.map((key) => (
        <Kbd key={key}>{key}</Kbd>
      ))}
    </KbdGroup>
  )

  return (
    <div
      ref={root}
      className="topbar-search"
      data-open={open ? "" : undefined}
      onKeyDown={(event) => {
        if (event.key !== "Escape" || !open) return
        event.preventDefault()
        event.stopPropagation()
        collapse()
      }}
      onBlur={(event) => {
        const next = event.relatedTarget

        if (open && next instanceof Node && !event.currentTarget.contains(next))
          onOpenChange(false)
      }}
    >
      <Tooltip>
        <TooltipTrigger
          render={
            <Button
              ref={trigger}
              variant="ghost"
              size="icon"
              className="search-trigger"
              aria-label={label}
              aria-keyshortcuts={keyShortcuts}
              aria-expanded={open}
              onClick={() => onOpenChange(true)}
            />
          }
        >
          <Search aria-hidden="true" />
        </TooltipTrigger>
        <TooltipContent>
          {label}
          {keys}
        </TooltipContent>
      </Tooltip>
      {open && (
        <CommandPrimitive
          label={label}
          loop
          shouldFilter={shouldFilter}
          className="topbar-search-field"
        >
          <InputGroup>
            <InputGroupAddon>
              <Search aria-hidden="true" />
            </InputGroupAddon>
            <CommandPrimitive.Input
              data-slot="input-group-control"
              autoFocus
              placeholder={placeholder}
              value={query}
              onValueChange={onQueryChange}
              className="topbar-search-input"
            />
            <InputGroupAddon align="inline-end">
              {keys && <span className="topbar-search-hint">{keys}</span>}
              <InputGroupButton
                size="icon-xs"
                className="topbar-search-close"
                aria-label="Close search"
                onClick={collapse}
              >
                <X aria-hidden="true" />
              </InputGroupButton>
            </InputGroupAddon>
          </InputGroup>
          <CommandList className="topbar-search-results rounded-lg bg-popover p-1 text-popover-foreground shadow-md ring-1 ring-foreground/10">
            {children}
          </CommandList>
        </CommandPrimitive>
      )}
    </div>
  )
}
