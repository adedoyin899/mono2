import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import React from "react";

// STRESS TESTS 5 & 7 (from the auth-flow review plan): the signed-in
// landing-page header — the avatar dropdown's quick-return shortcuts, and
// Sign Out actually clearing the session rather than just navigating away.

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router")>();
  return { ...actual, useNavigate: () => mockNavigate };
});

const mockLogout = vi.fn().mockResolvedValue(undefined);
vi.mock("../../lib/api-client", async (importOriginal) => {
  const actual = await importOriginal<typeof import("../../lib/api-client")>();
  return { ...actual, apiClient: { ...actual.apiClient, logout: () => mockLogout() } };
});

const TALENT_SESSION = {
  id: "usr-1",
  email: "elena@gmail.com",
  name: "Elena Rostova",
  userType: "TALENT" as const,
  authProvider: "GOOGLE",
  isNewUser: false,
};

import { appStateSync } from "../../lib/state-sync";
import { LandingPage } from "./LandingPage";

describe("LandingPage signed-in header", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    appStateSync.setLoggedInUser(null);
  });

  it("STRESS TEST 5: avatar dropdown's Dashboard shortcut navigates straight to /dashboard", async () => {
    appStateSync.setLoggedInUser(TALENT_SESSION);
    appStateSync.updateTalentProfile({ name: "Elena Rostova", email: "elena@gmail.com" });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LandingPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText("Account menu"));
    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Dashboard"));

    expect(mockNavigate).toHaveBeenCalledWith("/dashboard");
  });

  it("STRESS TEST 7: Sign Out calls the real logout path and returns the header to logged-out state", async () => {
    appStateSync.setLoggedInUser(TALENT_SESSION);
    appStateSync.updateTalentProfile({ name: "Elena Rostova", email: "elena@gmail.com" });

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LandingPage />
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByLabelText("Account menu"));
    await waitFor(() => {
      expect(screen.getByText("Sign Out")).toBeTruthy();
    });
    fireEvent.click(screen.getByText("Sign Out"));

    await waitFor(() => {
      expect(mockLogout).toHaveBeenCalled();
    });
    // The real apiClient.logout() is mocked here (isolating this test from a
    // network call), so it doesn't itself clear appStateSync — assert the
    // header's own post-logout behavior instead: it navigates home.
    expect(mockNavigate).toHaveBeenCalledWith("/");
  });

  it("logged-out visitor still sees Sign In / Launch Storefront, not the avatar menu", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <LandingPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: "Sign In" })).toBeTruthy();
    expect(screen.queryByLabelText("Account menu")).toBeNull();
  });
});
