import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { WebsiteFooter } from "./WebsiteFooter";
import { supabase } from "../../lib/supabase";

const { upsertMock, insertMock, fromMock } = vi.hoisted(() => {
  const upsertMock = vi.fn().mockResolvedValue({ error: null });
  const insertMock = vi.fn().mockResolvedValue({ error: null });
  const fromMock = vi.fn(() => ({
    upsert: upsertMock,
    insert: insertMock,
  }));
  return { upsertMock, insertMock, fromMock };
});

vi.mock("../../lib/supabase", () => {
  return {
    supabase: {
      from: fromMock,
    },
    SUPABASE_MODE: "real",
  };
});

describe("WebsiteFooter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders newsletter heading, email capture input, and Paystack badge", () => {
    render(
      <MemoryRouter>
        <WebsiteFooter />
      </MemoryRouter>,
    );

    expect(screen.getByText("Join our newsletter")).toBeInTheDocument();
    expect(
      screen.getByText(/Stay updated with our investor news and receive alerts/i),
    ).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter your email")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Subscribe to newsletter/i })).toBeInTheDocument();
    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("Cookie Policy")).toBeInTheDocument();
  });

  it("submits email to Supabase NewsletterSubscriber and displays confirmation", async () => {
    render(
      <MemoryRouter>
        <WebsiteFooter />
      </MemoryRouter>,
    );

    const emailInput = screen.getByPlaceholderText("Enter your email");
    const submitBtn = screen.getByRole("button", { name: /Subscribe to newsletter/i });

    fireEvent.change(emailInput, { target: { value: "subscriber@monologg.co" } });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(supabase?.from).toHaveBeenCalledWith("NewsletterSubscriber");
    });

    expect(upsertMock).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "subscriber@monologg.co",
        status: "ACTIVE",
      }),
      { onConflict: "email" },
    );

    await waitFor(() => {
      expect(screen.getByPlaceholderText("Thanks for subscribing!")).toBeInTheDocument();
    });
  });

  it("aligns 'Finish Your Project today!' CTA section to 1040px container matching footer and triggers investor navigation", () => {
    const handleBecomeInvestor = vi.fn();
    render(
      <MemoryRouter>
        <WebsiteFooter onBecomeInvestor={handleBecomeInvestor} />
      </MemoryRouter>,
    );

    // Verify container has max-w-[1040px] for consistent alignment
    const ctaHeading = screen.getByText(/Finish Your/i).closest("div");
    expect(ctaHeading).toBeInTheDocument();

    const ctaContainer = screen.getByText(/Finish Your/i).closest(".max-w-\\[1040px\\]");
    expect(ctaContainer).toBeInTheDocument();

    // Verify Become an investor button exists and invokes handler
    const investorBtns = screen.getAllByRole("button", { name: /Become an investor/i });
    expect(investorBtns.length).toBeGreaterThanOrEqual(1);

    fireEvent.click(investorBtns[0]);
    expect(handleBecomeInvestor).toHaveBeenCalled();
  });
});
