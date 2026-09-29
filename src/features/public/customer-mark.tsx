import customers from "@/demo/data/public-customers.json"

const marks = new Map([
  ["circle", "M12 4a8 8 0 1 1 0 16 8 8 0 0 1 0-16Z"],
  ["arch", "M5 20V11a7 7 0 0 1 14 0v9h-4v-9a3 3 0 0 0-6 0v9Z"],
  ["path", "M4 18c4-10 12-2 16-12M4 12c4-6 8 0 12-6"],
  ["square", "M5 5h14v14H5Z"],
  [
    "ring",
    "M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm0 5a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z",
  ],
  ["wave", "M3 14c3-4 6 4 9 0s6-4 9 0M3 9c3-4 6 4 9 0s6-4 9 0"],
])

/** A fictional team's simple line mark, drawn in the current colour. */
export function CustomerMark({
  slug,
  className,
}: {
  slug: string
  className?: string
}) {
  const mark = customers.teams.find((team) => team.slug === slug)?.mark ?? ""

  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={marks.get(mark)} />
    </svg>
  )
}
