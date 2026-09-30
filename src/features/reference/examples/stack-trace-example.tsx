import { StackTrace } from "@/kit/ui/stack-trace"

export function StackTraceExample() {
  return (
    <StackTrace
      className="max-w-2xl"
      name="TypeError"
      message="Cannot read properties of undefined (reading 'dueDate')"
      frames={[
        {
          name: "formatDue",
          file: "src/lib/format-due.ts",
          line: 5,
          column: 29,
        },
        {
          name: "DueDate",
          file: "src/components/due-date.tsx",
          line: 4,
          column: 32,
        },
        {
          name: "renderWithHooks",
          file: "node_modules/react-dom/cjs/react-dom-client.development.js",
          line: 5613,
          column: 22,
          internal: true,
        },
        {
          name: "updateFunctionComponent",
          file: "node_modules/react-dom/cjs/react-dom-client.development.js",
          line: 8871,
          column: 19,
          internal: true,
        },
        {
          name: "performWorkOnRoot",
          file: "node_modules/react-dom/cjs/react-dom-client.development.js",
          line: 15252,
          column: 7,
          internal: true,
        },
      ]}
    />
  )
}
