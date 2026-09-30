import { CodeBlock } from "@/kit/ui/code-block"

const code = `export function ProjectDue({ date }: { date: string }) {
  const overdue = date < today()

  return (
    <time dateTime={date} data-overdue={overdue || undefined}>
      {formatDate(date)}
    </time>
  )
}`

export function CodeBlockExample() {
  return (
    <CodeBlock
      className="max-w-xl"
      code={code}
      language="tsx"
      filename="project-due.tsx"
      lineNumbers
    />
  )
}
