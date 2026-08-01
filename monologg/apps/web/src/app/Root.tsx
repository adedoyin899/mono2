import { Outlet } from "react-router";
import { useState, createContext, useContext } from "react";

interface ThemeContextType {
  isDark: boolean;
  toggle: () => void;
}

export const ThemeContext = createContext<ThemeContextType>({ isDark: false, toggle: () => {} });
export const useTheme = () => useContext(ThemeContext);

/** The dark/light state + persistence logic, factored out of Root so any
 * entry point that doesn't render Root (e.g. the standalone design-system
 * build, which uses a bare MemoryRouter) can still provide a working theme
 * toggle without duplicating the localStorage read/write logic. */
export function useThemeState() {
  const [isDark, setIsDark] = useState(() => {
    try { return localStorage.getItem("monologg-theme") === "dark"; } catch { return false; }
  });

  const toggle = () => {
    const next = !isDark;
    setIsDark(next);
    try { localStorage.setItem("monologg-theme", next ? "dark" : "light"); } catch {}
  };

  return { isDark, toggle };
}

export function Root() {
  const { isDark, toggle } = useThemeState();

  return (
    <ThemeContext.Provider value={{ isDark, toggle }}>
      <div
        className={isDark ? "dark" : ""}
        style={{ minHeight: "100vh", background: "var(--color-bg-canvas)", color: "var(--color-text-primary)" }}
      >
        {/* T3: Skip-to-content link — visible only on keyboard focus */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:rounded-[var(--radius-md)]"
          style={{ background: "var(--color-accent)", color: "var(--color-accent-on)" }}
        >
          Skip to main content
        </a>
        <Outlet />
      </div>
    </ThemeContext.Provider>
  );
}
