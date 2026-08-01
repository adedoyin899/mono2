import { motion } from "motion/react";
import type { SidebarNavItem } from "./Sidebar";

interface BottomNavProps<T extends string> {
  navItems: SidebarNavItem<T>[];
  activeTab: T;
  onTab: (t: T) => void;
  /** Unique per dashboard so the sliding active-indicator doesn't share
   * a shared-layout animation across Talent/Client instances. */
  indicatorId: string;
}

/** Mobile bottom nav shared by TalentDashboard and ClientDashboard —
 * same glass-pill + sliding layoutId indicator, only items/indicatorId differ. */
export function BottomNav<T extends string>({ navItems, activeTab, onTab, indicatorId }: BottomNavProps<T>) {
  return (
    <div
      className="lg:hidden fixed left-0 right-0 z-50 flex justify-center px-3"
      style={{ bottom: "calc(env(safe-area-inset-bottom, 0px) + 10px)" }}
    >
      <div
        className="flex justify-between items-center gap-1 w-full max-w-md h-[64px] px-2 rounded-full glass-panel"
        style={{ boxShadow: "var(--shadow-elevated)" }}
      >
        {navItems.map(item => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTab(item.id)}
              aria-label={item.label}
              className="flex flex-col items-center justify-center flex-1 h-[52px] py-1 relative rounded-full transition-all active:scale-95"
            >
              {active && (
                <motion.div
                  layoutId={indicatorId}
                  className="absolute inset-x-1 inset-y-0.5 rounded-full -z-0"
                  style={{ background: "var(--color-accent-glow)" }}
                />
              )}
              <item.icon className="w-5 h-5 relative z-10 shrink-0" style={{ color: active ? "var(--color-accent)" : "var(--color-text-tertiary)" }} />
              <span className="text-[10px] font-body font-medium mt-0.5 relative z-10 truncate max-w-full px-0.5" style={{ color: active ? "var(--color-accent)" : "var(--color-text-tertiary)" }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
