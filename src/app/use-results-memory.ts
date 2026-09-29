import { useCallback, useRef, useState } from "react"
import type { ColumnVisibilityState } from "@tanstack/react-table"
import { initialProjectTableState } from "@/features/overview/project-table-state"
import { resultsLocationKey } from "./project-return"
import { builtInViews } from "./saved-views"

export function useResultsMemory() {
  const [overviewTable, setOverviewTable] = useState(initialProjectTableState)
  const [activityExpanded, setActivityExpanded] = useState(false)
  const [boardOrder, setBoardOrder] = useState<string[]>([])
  const [savedViews, setSavedViews] = useState(builtInViews)
  const [gettingStartedHidden, setGettingStartedHidden] = useState(false)

  const [projectColumns, setProjectColumns] = useState<ColumnVisibilityState>(
    {},
  )

  const focus = useRef(new Map<string, string>())

  const rememberFocus = useCallback(
    (href: string, element: HTMLElement | null) => {
      focus.current.set(resultsLocationKey(href), element?.id || "projects")
    },
    [],
  )

  const getFocus = useCallback((href: string) => {
    const key = resultsLocationKey(href)
    const id = focus.current.get(key)

    return id
      ? (document.getElementById(id) ?? document.getElementById("projects"))
      : null
  }, [])

  return {
    overviewTable,
    activityExpanded,
    setActivityExpanded,
    setOverviewTable,
    projectColumns,
    boardOrder,
    setBoardOrder,
    setProjectColumns,
    savedViews,
    setSavedViews,
    gettingStartedHidden,
    setGettingStartedHidden,
    rememberFocus,
    getFocus,
    reset: () => {
      setOverviewTable(initialProjectTableState)
      setActivityExpanded(false)
      setBoardOrder([])
      setProjectColumns({})
      setSavedViews(builtInViews)
      setGettingStartedHidden(false)
      focus.current.clear()
    },
  }
}
