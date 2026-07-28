import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
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
import { DesignSystem } from "./pages/DesignSystem";

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
      { path: "dashboard", Component: TalentDashboard },
      { path: "client", Component: ClientDashboard },
      { path: "order/:id", Component: OrderRoom },
      { path: "brief", Component: ProjectBrief },
      { path: "checkout", Component: Checkout },
      { path: "settings", Component: Settings },
      { path: "design-system", Component: DesignSystem },
    ],
  },
];

export const router = createBrowserRouter(routeTree);
