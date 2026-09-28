import { projectStatuses, type Project } from "@/demo/model"

export function orderBoardProjects(projects: Project[], order: string[]) {
  const rank = new Map(order.map((id, index) => [id, index]))

  return [...projects].sort(
    (a, b) =>
      (rank.get(a.id) ?? order.length) - (rank.get(b.id) ?? order.length),
  )
}

// Filtered moves replace only visible slots; hidden projects keep their order.
export function mergeBoardOrder(
  current: string[],
  all: string[],
  visible: string[],
) {
  const order = [
    ...current.filter((id) => all.includes(id)),
    ...all.filter((id) => !current.includes(id)),
  ]

  const moved = new Set(visible)
  let index = 0

  return order.map((id) => (moved.has(id) ? visible[index++] : id))
}

export function placeBoardProject(
  projects: Project[],
  id: string,
  targetId: string,
  after = false,
) {
  const active = projects.find((project) => project.id === id)
  const target = projects.find((project) => project.id === targetId)

  const status =
    target?.status ?? projectStatuses.find((status) => status === targetId)

  if (!active || !status || id === targetId) return projects
  const next = projects.filter((project) => project.id !== id)
  const targetIndex = next.findIndex((project) => project.id === targetId)
  const lastInLane = next.map((project) => project.status).lastIndexOf(status)

  const index =
    targetIndex < 0
      ? lastInLane < 0
        ? next.length
        : lastInLane + 1
      : targetIndex + Number(after)

  next.splice(index, 0, { ...active, status })

  return next
}
