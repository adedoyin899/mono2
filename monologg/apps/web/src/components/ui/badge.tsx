import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-sm border px-1.5 py-0.5 text-xs font-medium whitespace-nowrap transition-colors [&>svg]:pointer-events-none [&>svg]:size-3",
  {
    variants: {
      variant: {
        default: "border-transparent bg-ink text-ink-foreground",
        secondary: "border-transparent bg-secondary text-secondary-foreground",
        outline: "text-foreground",
        brand: "border-brand/20 bg-brand/10 text-brand",
        success: "border-success/20 bg-success/10 text-success",
        warning:
          "border-warning/25 bg-warning/12 text-[color-mix(in_oklch,var(--warning)_70%,var(--foreground))]",
        destructive: "border-destructive/20 bg-destructive/10 text-destructive",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

type BadgeProps = React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean
    dot?: boolean
    tone?: "neutral" | "accent" | "success" | "warning" | "error"
    size?: "sm" | "md" | "lg"
  }

function Badge({
  className,
  variant,
  tone,
  size,
  dot = false,
  asChild = false,
  children,
  ...props
}: BadgeProps) {
  const Comp = asChild ? Slot.Root : "span"

  const effectiveVariant = variant || (
    tone === "accent"
      ? "brand"
      : tone === "success"
      ? "success"
      : tone === "warning"
      ? "warning"
      : tone === "error"
      ? "destructive"
      : tone === "neutral"
      ? "secondary"
      : undefined
  )

  const sizeClass = size === "lg" ? "px-2.5 py-1 text-xs" : size === "sm" ? "px-1.5 py-0.5 text-[11px]" : ""

  return (
    <Comp
      data-slot="badge"
      className={cn(badgeVariants({ variant: effectiveVariant }), sizeClass, className)}
      {...props}
    >
      {dot && <span aria-hidden className="size-1.5 bg-current" />}
      {children}
    </Comp>
  )
}

export { Badge, badgeVariants }
export type { BadgeProps }
