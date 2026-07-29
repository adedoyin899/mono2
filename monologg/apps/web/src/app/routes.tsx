import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { RequireAuth } from "./RequireAuth";
import { LandingPage } from "./pages/LandingPage";
import { AuthFlow } from "./pages/AuthFlow";
import { CreatorOnboarding } from "./pages/CreatorOnboarding";
import { ClientOnboarding } from "./pages/ClientOnboarding";
import { TalentDashboard } from "./pages/TalentDashboard";
import { ClientDashboard } from "./pages/ClientDashboard";
import { OrderRoom } from "./pages/OrderRoom";
import { ProjectBrief } from "./pages/ProjectBrief";
import { Checkout } from "./pages/Checkout";
import { Settings } from "./pages/Settings";
import { TransactionHistory } from "./pages/TransactionHistory";
import { HelpSupport } from "./pages/HelpSupport";
import { LegalPage } from "./pages/LegalPage";
import { DesignSystem } from "./pages/DesignSystem";

// Wraps a page component with the auth guard (features.md Phase 4) — a no-op in the
// default `mock` API mode, real gating once `live` mode + Phase 5 endpoints land.
function protect(Component: React.ComponentType) {
  return function Protected() {
    return (
      <RequireAuth>
        <Component />
      </RequireAuth>
    );
  };
}

// Shared route tree — reused by both the browser-history router (dev server /
// real hosting, see below) and the hash router used for the standalone,
// double-clickable HTML build (see AppStandalone.tsx), since file:// pages
// can't use pushState-based navigation.
export const routeTree = [
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: LandingPage },
      { path: "auth", Component: AuthFlow },
      { path: "onboarding", Component: CreatorOnboarding },
      { path: "onboarding/client", Component: ClientOnboarding },
      { path: "dashboard", Component: protect(TalentDashboard) },
      { path: "client", Component: protect(ClientDashboard) },
      { path: "order/:id", Component: protect(OrderRoom) },
      { path: "brief", Component: protect(ProjectBrief) },
      { path: "checkout", Component: protect(Checkout) },
      { path: "settings", Component: protect(Settings) },
      { path: "transactions", Component: protect(TransactionHistory) },
      { path: "support", Component: protect(HelpSupport) },
      { path: "legal/terms", Component: () => <LegalPage type="terms" /> },
      { path: "legal/privacy", Component: () => <LegalPage type="privacy" /> },
      { path: "design-system", Component: DesignSystem },
    ],
  },
];

export const router = createBrowserRouter(routeTree);
