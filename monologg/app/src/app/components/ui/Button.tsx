import * as React from "react";
import { cn } from "../../../lib/utils";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "destructive" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center gap-2 font-body text-[15px] font-semibold tracking-[-0.01em] transition-all duration-[var(--duration-fast,160ms)] ease-[var(--ease-out,ease-out)] disabled:opacity-35 disabled:pointer-events-none active:scale-[0.97] focus-visible:outline-none";

    const variants = {
      /* primary: role accent fill (red for Talent, purple for Client) + on-accent text — WCAG AA */
      primary: "h-[54px] px-7 rounded-[var(--radius-lg)] bg-[var(--color-accent)] text-[var(--color-accent-on)] shadow-[var(--shadow-card)] hover:bg-[var(--color-accent-press)] focus-visible:shadow-[var(--shadow-focus)]",
      /* secondary: neutral inked surface — quiet, high-contrast */
      secondary: "h-[54px] px-7 rounded-[var(--radius-lg)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-strong)] hover:bg-[var(--color-bg-elevated)] focus-visible:shadow-[var(--shadow-focus)]",
      /* ghost: text-only, primary text so it always passes contrast */
      ghost: "h-[54px] px-5 rounded-[var(--radius-lg)] bg-transparent text-[var(--color-text-primary)] opacity-75 hover:opacity-100 hover:bg-[var(--color-bg-elevated)] focus-visible:shadow-[var(--shadow-focus)]",
      destructive: "h-[54px] px-7 rounded-[var(--radius-lg)] bg-[var(--color-error-bg)] text-[var(--color-error)] border border-[var(--color-error)] hover:bg-[var(--color-error)] hover:text-white focus-visible:shadow-[var(--shadow-focus)]",
      icon: "w-[46px] h-[46px] rounded-[var(--radius-md)] bg-[var(--color-bg-surface)] text-[var(--color-text-primary)] border border-[var(--color-border-default)] hover:bg-[var(--color-bg-elevated)] focus-visible:shadow-[var(--shadow-focus)] flex-shrink-0"
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
