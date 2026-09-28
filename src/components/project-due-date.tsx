import { CalendarDays } from "lucide-react"
import { formatDate } from "@/demo/model"

export function ProjectDueDate({ date }: { date: string }) {
  return (
    <time className="project-due-date" dateTime={date}>
      <CalendarDays aria-hidden="true" />
      <span className="sr-only">Due </span>
      {formatDate(date)}
    </time>
  )
}
