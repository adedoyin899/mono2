import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 4: AuthFlow.tsx is wired to real endpoints via api-client, but must
// stay visually/behaviorally identical to the original mock-only prototype in the default
// mock mode. These tests exercise the actual component, not api-client in isolation.
//
// AnimatePresence (mode="wait") delays mounting the next view until the previous one's
// exit transition finishes, so every view switch is awaited via findBy* rather than
// queried synchronously right after the triggering click.

async function renderAuthFlow() {
  const { AuthFlow } = await import("./AuthFlow");
  render(
    <MemoryRouter initialEntries={["/auth"]}>
      <Routes>
        <Route path="/auth" element={<AuthFlow />} />
        <Route path="/onboarding" element={<div>Talent onboarding</div>} />
        <Route path="/onboarding/client" element={<div>Client onboarding</div>} />
        <Route path="/dashboard" element={<div>Talent dashboard</div>} />
        <Route path="/client" element={<div>Client dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("AuthFlow", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: registering as talent navigates to talent onboarding (no visual change)", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    await renderAuthFlow();

    fireEvent.click(screen.getByText("Create Free Account"));
    fireEvent.change(await screen.findByPlaceholderText("Full Name"), {
      target: { value: "Ada Lovelace" },
    });
    fireEvent.change(screen.getByPlaceholderText("Email Address"), {
      target: { value: "ada@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Create Password (min. 8 chars)"), {
      target: { value: "password123" },
    });
    fireEvent.click(screen.getByText(/I agree to the/).closest("label")!.querySelector("div")!);

    fireEvent.click(screen.getByText("Create My Talent Profile"));

    await waitFor(() => {
      expect(screen.getByText("Talent onboarding")).toBeInTheDocument();
    });
  });

  it("mock mode: signing in with a 'client' email navigates to the client dashboard", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    await renderAuthFlow();

    fireEvent.click(screen.getByText("Sign In"));
    fireEvent.change(await screen.findByPlaceholderText("Email Address"), {
      target: { value: "someone@client.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "password123" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Client dashboard")).toBeInTheDocument();
    });
  });

  it("live mode: shows the server's error message on invalid login instead of navigating", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ message: "Invalid email or password" }), {
          status: 401,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
    await renderAuthFlow();

    fireEvent.click(screen.getByText("Sign In"));
    fireEvent.change(await screen.findByPlaceholderText("Email Address"), {
      target: { value: "wrong@example.com" },
    });
    fireEvent.change(screen.getByPlaceholderText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign In" }));

    await waitFor(() => {
      expect(screen.getByText("Invalid email or password")).toBeInTheDocument();
    });
    expect(screen.queryByText("Talent dashboard")).not.toBeInTheDocument();
    expect(screen.queryByText("Client dashboard")).not.toBeInTheDocument();
  });
});
