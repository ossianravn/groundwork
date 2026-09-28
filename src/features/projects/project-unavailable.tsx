import type { ReactNode } from "react"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/kit/ui/empty"

export function ProjectUnavailable({ returnLink }: { returnLink: ReactNode }) {
  return (
    <main id="main-content" className="page-content" tabIndex={-1}>
      <title>Project unavailable · Tandem</title>
      <Empty>
        <EmptyHeader>
          <EmptyTitle>
            <h1>Project unavailable</h1>
          </EmptyTitle>
          <EmptyDescription>
            This project could not be found. Projects created in this demo reset
            when you reload.
          </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>{returnLink}</EmptyContent>
      </Empty>
    </main>
  )
}
