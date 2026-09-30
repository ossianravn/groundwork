import { cn } from "cn"
import { Button } from "@/kit/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/kit/ui/popover"
import { Progress } from "@/kit/ui/progress"

const number = new Intl.NumberFormat("en-GB")

const compact = new Intl.NumberFormat("en-GB", {
  notation: "compact",
  maximumFractionDigits: 1,
})

/** A small ring filled to the share of the window in use. */
function Ring({ share }: { share: number }) {
  const circumference = 2 * Math.PI * 7

  return (
    <svg viewBox="0 0 18 18" className="size-4.5 -rotate-90" aria-hidden="true">
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        strokeWidth="2"
        className="stroke-border"
      />
      <circle
        cx="9"
        cy="9"
        r="7"
        fill="none"
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - Math.min(share, 1))}
        className={share > 0.8 ? "stroke-destructive" : "stroke-foreground"}
      />
    </svg>
  )
}

/**
 * How much of the model's context window the conversation uses, as a ring
 * that opens a breakdown: tokens used, what they were for and an estimated
 * cost. Pass the numbers from the model's usage reports.
 */
function Context({
  used,
  max,
  breakdown = [],
  cost,
  className,
}: {
  used: number
  max: number
  breakdown?: { label: string; tokens: number }[]
  /** Already formatted, such as "$0.003". */
  cost?: string
  className?: string
}) {
  const share = max ? used / max : 0

  const percent =
    share > 0 && share < 0.01 ? "<1%" : `${Math.round(share * 100)}%`

  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={cn("rounded-full", className)}
            aria-label={`Context: ${percent} of ${compact.format(max)} tokens used`}
          />
        }
      >
        <Ring share={share} />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 gap-3">
        <div className="grid gap-1.5">
          <p className="flex items-baseline justify-between gap-2">
            <span className="font-medium">Context window</span>
            <span className="text-muted-foreground tabular-nums">
              {percent}
            </span>
          </p>
          <Progress
            value={Math.min(share * 100, 100)}
            aria-label="Context used"
          />
          <p className="text-xs text-muted-foreground tabular-nums">
            {number.format(used)} of {number.format(max)} tokens
          </p>
        </div>
        {(breakdown.length > 0 || cost) && (
          <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1 border-t border-border pt-2 text-xs tabular-nums">
            {breakdown.map((row) => (
              <div key={row.label} className="contents">
                <dt className="text-muted-foreground">{row.label}</dt>
                <dd className="text-end">{number.format(row.tokens)}</dd>
              </div>
            ))}
            {cost && (
              <div className="contents">
                <dt className="text-muted-foreground">Estimated cost</dt>
                <dd className="text-end">{cost}</dd>
              </div>
            )}
          </dl>
        )}
      </PopoverContent>
    </Popover>
  )
}

export { Context }
