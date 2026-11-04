import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";
import {
  MobileMenuButton,
  BespokeMobileNavDrawer,
  BespokeMobileBottomDock,
  MAIN_PAGES,
} from "./BespokeMobileNav";
import { ThemeContext } from "../Root";

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockThemeContext = {
  isDark: false,
  toggle: vi.fn(),
};

const LOGGED_IN_TALENT = {
  id: "usr-talent-1",
  email: "emeka@monologg.co",
  name: "Emeka Johnson",
  userType: "TALENT" as const,
  authProvider: "EMAIL",
  isNewUser: false,
};

const LOGGED_IN_CLIENT = {
  id: "usr-client-1",
  email: "sarah@filmcraft.com",
  name: "Sarah Jenkins",
  userType: "CLIENT" as const,
  authProvider: "GOOGLE",
  isNewUser: false,
};

function renderWithProviders(ui: React.ReactElement, initialPath = "/") {
  return render(
    <ThemeContext.Provider value={mockThemeContext}>
      <MemoryRouter initialEntries={[initialPath]}>{ui}</MemoryRouter>
    </ThemeContext.Provider>,
  );
}

describe("BespokeMobileNav Suite", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("MobileMenuButton", () => {
    it("renders with closed state accessibility attributes", () => {
      renderWithProviders(<MobileMenuButton isOpen={false} onClick={vi.fn()} />);
      const btn = screen.getByRole("button", { name: "Open navigation menu" });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("aria-expanded", "false");
    });

    it("renders with open state accessibility attributes and calls onClick", () => {
      const onClick = vi.fn();
      renderWithProviders(<MobileMenuButton isOpen={true} onClick={onClick} />);
      const btn = screen.getByRole("button", { name: "Close navigation menu" });
      expect(btn).toBeInTheDocument();
      expect(btn).toHaveAttribute("aria-expanded", "true");

      fireEvent.click(btn);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("BespokeMobileNavDrawer", () => {
    it("renders all 4 main pages when open with active state highlighted", () => {
      const onClose = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="product"
          isOpen={true}
          onClose={onClose}
          loggedInUser={null}
        />,
        "/product",
      );

      // Verify all 4 main pages are rendered
      MAIN_PAGES.forEach((page) => {
        expect(screen.getByText(page.label)).toBeInTheDocument();
      });

      // Product should have "Active" badge
      expect(screen.getByText("Active")).toBeInTheDocument();

      // Click on Pricing
      fireEvent.click(screen.getByText("Pricing"));
      expect(onClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/pricing");
    });

    it("renders quick role portals for Find Performers and Find Gigs", () => {
      const onClose = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="home"
          isOpen={true}
          onClose={onClose}
          loggedInUser={null}
        />,
      );

      expect(screen.getByText("Find Performers")).toBeInTheDocument();
      expect(screen.getByText("Find Gigs")).toBeInTheDocument();

      fireEvent.click(screen.getByText("Find Performers"));
      expect(onClose).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/onboarding/client");
    });

    it("renders logged-out auth CTAs when no user session", () => {
      const onClose = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="home"
          isOpen={true}
          onClose={onClose}
          loggedInUser={null}
        />,
      );

      const signInBtn = screen.getByText("Sign In to Account");
      const signUpBtn = screen.getByText("Get Started for Free");
      expect(signInBtn).toBeInTheDocument();
      expect(signUpBtn).toBeInTheDocument();

      fireEvent.click(signInBtn);
      expect(mockNavigate).toHaveBeenCalledWith("/auth?mode=signin");
    });

    it("renders logged-in user details and shortcuts for Performer", () => {
      const onClose = vi.fn();
      const onSignOut = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="home"
          isOpen={true}
          onClose={onClose}
          loggedInUser={LOGGED_IN_TALENT}
          displayName="Emeka Johnson"
          displayAvatar="/avatar.png"
          isClientSession={false}
          onSignOut={onSignOut}
        />,
      );

      expect(screen.getByText("Emeka Johnson")).toBeInTheDocument();
      expect(screen.getByText("emeka@monologg.co")).toBeInTheDocument();
      expect(screen.getByText("Performer")).toBeInTheDocument();

      // Shortcuts
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Storefront")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
      expect(screen.getByText("Support")).toBeInTheDocument();

      // Sign out
      const signOutBtn = screen.getByText("Sign Out");
      fireEvent.click(signOutBtn);
      expect(onSignOut).toHaveBeenCalledTimes(1);
    });

    it("renders logged-in user details and shortcuts for Client workspace", () => {
      const onClose = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="home"
          isOpen={true}
          onClose={onClose}
          loggedInUser={LOGGED_IN_CLIENT}
          displayName="Sarah Jenkins"
          isClientSession={true}
        />,
      );

      expect(screen.getByText("Sarah Jenkins")).toBeInTheDocument();
      expect(screen.getByText("sarah@filmcraft.com")).toBeInTheDocument();
      expect(screen.getByText("Client")).toBeInTheDocument();
      expect(screen.getByText("Post Brief")).toBeInTheDocument();
    });

    it("triggers theme toggle button and navigates to legal policies", () => {
      const onClose = vi.fn();
      renderWithProviders(
        <BespokeMobileNavDrawer
          activePage="home"
          isOpen={true}
          onClose={onClose}
          loggedInUser={null}
        />,
      );

      const themeBtn = screen.getByRole("button", { name: "Toggle theme" });
      fireEvent.click(themeBtn);
      expect(mockThemeContext.toggle).toHaveBeenCalledTimes(1);

      fireEvent.click(screen.getByText("Terms"));
      expect(mockNavigate).toHaveBeenCalledWith("/terms");
    });
  });

  describe("BespokeMobileBottomDock", () => {
    it("renders thumb-friendly dock with 4 main pages and menu toggle", () => {
      const onToggle = vi.fn();
      renderWithProviders(
        <BespokeMobileBottomDock
          activePage="pricing"
          isMenuOpen={false}
          onToggleMenu={onToggle}
          loggedInUser={null}
        />,
        "/pricing",
      );

      expect(screen.getByLabelText("Home")).toBeInTheDocument();
      expect(screen.getByLabelText("Product")).toBeInTheDocument();
      expect(screen.getByLabelText("Pricing")).toBeInTheDocument();
      expect(screen.getByLabelText("Resources")).toBeInTheDocument();
      expect(screen.getByLabelText("Open menu")).toBeInTheDocument();

      // Navigate to Home
      fireEvent.click(screen.getByLabelText("Home"));
      expect(mockNavigate).toHaveBeenCalledWith("/");

      // Toggle menu
      fireEvent.click(screen.getByLabelText("Open menu"));
      expect(onToggle).toHaveBeenCalledTimes(1);
    });

    it("shows Close state when menu is open in bottom dock", () => {
      const onToggle = vi.fn();
      renderWithProviders(
        <BespokeMobileBottomDock
          activePage="home"
          isMenuOpen={true}
          onToggleMenu={onToggle}
          loggedInUser={null}
        />,
      );

      expect(screen.getByLabelText("Close menu")).toBeInTheDocument();
      expect(screen.getByText("Close")).toBeInTheDocument();
    });
  });
});
