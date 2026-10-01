import * as React from "react"
import { cn } from "cn"

/**
 * Progress toward a goal as a ring, with the figure (or anything else) in
 * its centre, like shadcn's radial chart with text. It is a meter: the
 * value, its range and a label are exposed, so the ring is never the only
 * place the number lives.
 */
function RadialProgress({
  value,
  max = 100,
  label,
  color = "var(--brand)",
  thickness = 3,
  children,
  className,
}: {
  value: number
  max?: number
  /** Names the meter, such as "Brand refresh: 75% complete". */
  label: string
  /** A CSS colour for the arc. */
  color?: string
  /** Ring width as a share of the 36-unit box. */
  thickness?: number
  /** The centre, usually the percentage. */
  children?: React.ReactNode
  className?: string
}) {
  const share = max > 0 ? Math.min(1, Math.max(0, value / max)) : 0
  const radius = 18 - thickness / 2

  return (
    <span
      data-slot="radial-progress"
      role="meter"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={label}
      className={cn(
        "relative inline-grid size-11 shrink-0 place-items-center",
        className,
      )}
    >
      <svg
        viewBox="0 0 36 36"
        className="absolute inset-0 size-full -rotate-90"
        aria-hidden="true"
      >
        <circle
          cx="18"
          cy="18"
          r={radius}
          fill="none"
          stroke="var(--muted)"
          strokeWidth={thickness}
        />
        {share > 0 && (
          <circle
            cx="18"
            cy="18"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            pathLength={100}
            // A full ring closes; anything less leaves a round-capped gap.
            strokeDasharray={`${share === 1 ? 100 : Math.min(share * 100, 97)} 100`}
          />
        )}
      </svg>
      {children && (
        <span
          className="relative text-[0.6875rem] font-semibold tabular-nums"
          aria-hidden="true"
        >
          {children}
        </span>
      )}
    </span>
  )
}

export { RadialProgress }
