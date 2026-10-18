"use client"

import * as React from "react"
import { cn } from "cn"

/**
 * Text that lights up as it is spoken: words already said in the text
 * colour, the rest muted. `position` counts characters reached, as speech
 * output reports them; without it every word reads as said.
 */
function Transcription({
  text,
  position = Number.POSITIVE_INFINITY,
  className,
  ...props
}: Omit<React.ComponentProps<"p">, "children"> & {
  text: string
  position?: number
}) {
  const words = [...text.matchAll(/\S+/gu)]
  const current = words.filter((word) => word.index < position).length - 1

  return (
    <p
      data-slot="transcription"
      className={cn("text-balance", className)}
      {...props}
    >
      {words.map((word, index) => (
        <React.Fragment key={word.index}>
          {index > 0 && " "}
          <span
            data-slot="transcription-word"
            data-state={
              index < current
                ? "spoken"
                : index === current
                  ? "current"
                  : "upcoming"
            }
            className="transition-colors duration-(--motion-fast) ease-(--ease-standard) data-[state=upcoming]:text-muted-foreground/60"
          >
            {word[0]}
          </span>
        </React.Fragment>
      ))}
    </p>
  )
}

export { Transcription }
