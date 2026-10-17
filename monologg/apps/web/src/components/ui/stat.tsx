import * as React from "react"
import { ArrowDownRight, ArrowRight, ArrowUpRight } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

type StatDirection = "up" | "down" | "flat"

type StatDelta = {
  value: string
  direction: StatDirection
  /** Which direction is good news. Defaults to "up". */
  goodWhen?: "up" | "down"
}

type StatProps = Omit<React.ComponentProps<"div">, "onClick" | "children"> & {
  label: React.ReactNode
  value: React.ReactNode
  hint?: React.ReactNode
  delta?: StatDelta
  icon?: React.ReactNode
  /** Makes the tile an accessible toggle button. */
  onClick?: () => void
  selected?: boolean
  /** Drop the border and background, e.g. inside a StatGroup. */
  bare?: boolean
}

const deltaIcon = {
  up: ArrowUpRight,
  down: ArrowDownRight,
  flat: ArrowRight,
} as const

function StatDeltaChip({ delta }: { delta: StatDelta }) {
  const { value, direction, goodWhen = "up" } = delta
  const Icon = deltaIcon[direction]
  const variant =
    direction === "flat"
      ? "secondary"
      : direction === goodWhen
        ? "success"
        : "destructive"
  const word =
    direction === "up" ? "up" : direction === "down" ? "down" : "unchanged"

  return (
    <Badge
      data-slot="stat-delta"
      variant={variant}
      className="font-mono tabular-nums"
    >
      <Icon aria-hidden />
      <span className="sr-only">{word} </span>
      {value}
    </Badge>
  )
}

function Stat({
  label,
  value,
  hint,
  delta,
  icon,
  onClick,
  selected,
  bare = false,
  className,
  ...props
}: StatProps) {
  const interactive = typeof onClick === "function"
  const base = cn(
    "flex w-full flex-col gap-3 p-4 text-left",
    !bare && "rounded-lg border bg-card text-card-foreground",
    selected && !bare && "border-brand",
    className
  )

  const body = (
    <>
      <span className="flex items-center justify-between gap-2">
        <span className="eyebrow text-muted-foreground">{label}</span>
        {icon && (
          <span
            aria-hidden
            className="text-muted-foreground [&>svg]:size-4 [&>svg]:shrink-0"
          >
            {icon}
          </span>
        )}
      </span>
      <span className="flex flex-wrap items-end justify-between gap-2">
        <span className="heading text-3xl tabular-nums">{value}</span>
        {delta && <StatDeltaChip delta={delta} />}
      </span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </>
  )

  if (interactive) {
    return (
      <button
        type="button"
        data-slot="stat"
        data-selected={selected ? "" : undefined}
        aria-pressed={!!selected}
        onClick={onClick}
        className={cn(
          base,
          "transition-colors outline-none hover:border-foreground/25 focus-visible:ring-[3px] focus-visible:ring-ring",
          bare && "hover:bg-muted/50"
        )}
        {...(props as React.ComponentProps<"button">)}
      >
        {body}
      </button>
    )
  }

  return (
    <div data-slot="stat" className={base} {...props}>
      {body}
    </div>
  )
}

/**
 * Grid of bare stats with hairline dividers. `columns` is the maximum: the
 * group is a container, so it shows 2 columns when narrow and only reaches
 * `columns` once its own width allows (3 from 36rem, 4 from 42rem).
 */
function StatGroup({
  className,
  columns = 4,
  children,
  ...props
}: React.ComponentProps<"div"> & { columns?: 2 | 3 | 4 }) {
  return (
    <div
      data-slot="stat-group"
      role="group"
      className={cn("@container overflow-hidden rounded-lg border", className)}
      {...props}
    >
      {/* Each tile draws its right/bottom hairline; the negative margin hides the outermost ones, so any wrap stays correct. */}
      <div
        className={cn(
          "-mr-px -mb-px grid grid-cols-1 @3xs:grid-cols-2",
          columns === 3 && "@xl:grid-cols-3",
          columns === 4 && "@2xl:grid-cols-4",
          "[&>[data-slot=stat]]:rounded-none [&>[data-slot=stat]]:[border-width:0_1px_1px_0] [&>[data-slot=stat]]:bg-card"
        )}
      >
        {children}
      </div>
    </div>
  )
}

export { Stat, StatGroup }
export type { StatProps, StatDelta, StatDirection }
