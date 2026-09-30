import * as React from "react"

/**
 * Renders links inside AI output: responses, sources and citations. Hosts
 * provide one that routes internal paths with their own router; the default
 * is a plain anchor.
 */
export type RenderResponseLink = (
  props: React.ComponentProps<"a">,
) => React.ReactElement

export const ResponseLinkContext = React.createContext<RenderResponseLink>(
  (props) => React.createElement("a", props),
)

export function useResponseLink() {
  return React.useContext(ResponseLinkContext)
}
