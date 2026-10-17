/**
 * The projects a list shows, in its order: list views mark their container
 * `data-quick-view-list` and each project's opener `data-quick-view-id`. Read
 * when a project opens, so J and K follow the list as the person saw it.
 */
export function quickViewList(): string[] {
  return [
    ...new Set(
      [
        ...document.querySelectorAll<HTMLElement>(
          "#main-content [data-quick-view-list] [data-quick-view-id]",
        ),
      ].flatMap((element) => element.dataset.quickViewId ?? []),
    ),
  ]
}
