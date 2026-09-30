import * as React from "react"
import { Streamdown, type Components } from "streamdown"
import { cn } from "cn"
import { CodeBlock } from "@/kit/ui/code-block"
import {
  ResponseLinkContext,
  useResponseLink,
  type RenderResponseLink,
} from "@/kit/ai/response-link"

type ElementProps<T extends keyof React.JSX.IntrinsicElements> =
  React.ComponentProps<T> & { node?: unknown }

/** Streamdown passes its syntax-tree node along; it is not a DOM attribute. */
function domProps<T extends { node?: unknown }>(props: T) {
  const rest = { ...props }
  delete rest.node

  return rest
}

function ResponseLink(props: ElementProps<"a">) {
  const renderLink = useResponseLink()
  const { className, href, ...rest } = domProps(props)
  const external = !!href && /^[a-z]+:/iu.test(href)

  return renderLink({
    href,
    className: cn(
      "font-medium text-brand underline underline-offset-[0.2em] wrap-anywhere",
      className,
    ),
    target: external ? "_blank" : undefined,
    rel: external ? "noreferrer" : undefined,
    ...rest,
  })
}

function element<T extends keyof React.JSX.IntrinsicElements>(
  Tag: T,
  base: string,
) {
  function Element(props: ElementProps<T>) {
    const { className, ...rest } = domProps(props)

    return React.createElement(Tag, { className: cn(base, className), ...rest })
  }

  return Element
}

function BlockCode({ className, children }: ElementProps<"code">) {
  const language = className?.match(/language-([\w-]+)/u)?.[1]

  return (
    <CodeBlock
      className="my-1"
      code={String(children ?? "").replace(/\n$/u, "")}
      language={language}
    />
  )
}

// Defined once: Streamdown memoizes on the identity of this map.
const components: Components = {
  p: element("p", ""),
  h1: element("h3", "text-base font-semibold"),
  h2: element("h3", "text-base font-semibold"),
  h3: element("h3", "text-base font-semibold"),
  h4: element("h4", "font-semibold"),
  h5: element("h5", "font-semibold"),
  h6: element("h6", "font-semibold"),
  strong: element("strong", "font-semibold"),
  ul: element("ul", "list-disc ps-5 [&_li+li]:mt-1"),
  ol: element("ol", "list-decimal ps-5 [&_li+li]:mt-1"),
  li: element("li", "ps-0.5 [&>p]:inline"),
  blockquote: element(
    "blockquote",
    "border-s-2 border-border ps-3 text-muted-foreground",
  ),
  hr: element("hr", "border-border"),
  table: (props: ElementProps<"table">) => (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table
        {...domProps(props)}
        className={cn("w-full border-collapse text-start", props.className)}
      />
    </div>
  ),
  thead: element("thead", "text-xs text-muted-foreground"),
  tbody: element("tbody", "[&>tr:last-child]:border-0"),
  tr: element("tr", "border-b border-border"),
  th: element("th", "px-3 py-2 text-start font-medium whitespace-nowrap"),
  td: element("td", "px-3 py-2 align-top"),
  a: ResponseLink,
  code: BlockCode,
  inlineCode: element(
    "code",
    "rounded bg-muted px-1 py-0.5 font-mono text-[0.8125rem]",
  ),
}

/**
 * Markdown from a model, rendered with kit typography. While streaming,
 * unfinished syntax (an open code fence, half a link) still renders cleanly.
 */
function MessageResponse({
  children,
  streaming = false,
  renderLink,
  className,
}: {
  children: string
  streaming?: boolean
  renderLink?: RenderResponseLink
  className?: string
}) {
  const content = (
    <Streamdown
      data-slot="message-response"
      className={cn(
        "min-w-0 space-y-3 text-sm leading-relaxed wrap-break-word",
        className,
      )}
      components={components}
      isAnimating={streaming}
      controls={false}
      lineNumbers={false}
    >
      {children}
    </Streamdown>
  )

  return renderLink ? (
    <ResponseLinkContext value={renderLink}>{content}</ResponseLinkContext>
  ) : (
    content
  )
}

export { MessageResponse }
