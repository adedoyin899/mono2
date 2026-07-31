import { fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 16 (FA-5): PWA-18, the logged-out external booking flow.
// The visitor never sees a "sign up" step — this exercises the full step
// sequence (slot → summary/escrow explainer → context note → name/email →
// payment → confirmed) and confirms it calls the unauthenticated guest-
// checkout endpoints, never the session-gated ones.

const PROFILE = {
  id: "creator-1",
  name: "Adaeze Obi",
  niche: "VO_ARTIST",
  nicheLabel: "Voice-Over Artist",
  location: "Lagos",
  bio: "Warm, multilingual voice artist.",
  styleTags: [],
  verified: true,
  celebrityBadge: false,
  media: [],
  rateCards: [
    { id: "rc-1", title: "Voice-Over Session", price: "₦1,000", basePriceAmount: 100_000, basePriceCurrency: "NGN", delivery: "Same Day" },
  ],
};
const RATE_CARDS = PROFILE.rateCards;

async function renderFlow() {
  const { ExternalBookingEntry } = await import("./ExternalBookingEntry");
  render(
    <MemoryRouter initialEntries={["/book/creator-1?rateCard=rc-1"]}>
      <Routes>
        <Route path="/book/:creatorId" element={<ExternalBookingEntry />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("ExternalBookingEntry (PWA-18)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("walks a logged-out visitor through every step and calls only the unauthenticated guest-checkout endpoints", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const calledUrls: string[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
        const url = String(input);
        calledUrls.push(url);
        // No Authorization header should ever be sent — there's no session yet.
        const headers = new Headers(init?.headers);
        expect(headers.has("Authorization")).toBe(false);

        if (url.endsWith("/public")) {
          return new Response(JSON.stringify(PROFILE), { status: 200, headers: { "content-type": "application/json" } });
        }
        if (url.endsWith("/rate-cards")) {
          return new Response(JSON.stringify(RATE_CARDS), { status: 200, headers: { "content-type": "application/json" } });
        }
        if (url.includes("/open-slots")) {
          return new Response(JSON.stringify({ date: "2026-08-10", openSlots: [{ start: "00:00", end: "23:59" }] }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (url.endsWith("/public/bookings")) {
          return new Response(
            JSON.stringify({
              id: "booking-guest-1",
              creatorId: "creator-1",
              clientId: "client-guest-1",
              rateCardId: "rc-1",
              baseAmount: 100_000,
              currency: "NGN",
              talentFeeAmount: 11_000,
              clientFeeAmount: 15_000,
              slotDate: "2026-08-10",
              slotStart: "08:00",
              slotEnd: "09:00",
              state: "PENDING_PAYMENT",
              origin: "PUBLIC_LINK",
            }),
            { status: 201, headers: { "content-type": "application/json" } },
          );
        }
        if (url.endsWith("/booking-guest-1/pay")) {
          return new Response(JSON.stringify({ checkoutUrl: "https://pay.example/x", providerRef: "ref-guest-1", status: "INITIATED" }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        if (url.endsWith("/webhooks/paystack")) {
          return new Response(JSON.stringify({ received: true, processed: true }), {
            status: 200,
            headers: { "content-type": "application/json" },
          });
        }
        throw new Error(`Unexpected fetch: ${url}`);
      }),
    );

    await renderFlow();

    // Step: slot picker.
    await screen.findByText("Book Adaeze Obi");
    fireEvent.click(await screen.findByRole("button", { name: "08:00" }));
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step: summary + escrow explainer.
    await screen.findByText("Booking Summary");
    expect(screen.getByText(/held safely/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step: context note (optional, not chat).
    await screen.findByText("A bit of context");
    expect(screen.getByText(/not a conversation/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Continue/i }));

    // Step: name + email.
    await screen.findByText("Your details");
    fireEvent.change(screen.getByPlaceholderText("Your name"), { target: { value: "Jamie Guest" } });
    fireEvent.change(screen.getByPlaceholderText("you@example.com"), { target: { value: "jamie@example.com" } });
    fireEvent.click(screen.getByRole("button", { name: /Continue to Payment/i }));

    // Step: payment — "Step 2 of 3" progress indicator per the PRD.
    await screen.findByText(/Step 2 of 3/i);
    fireEvent.click(screen.getByRole("button", { name: /Confirm & Deposit/i }));

    // Step: confirmed, with the PWA-19 account-surfacing copy.
    await screen.findByText("Booking Confirmed!", {}, { timeout: 3000 });
    expect(screen.getByText(/We've created your account/i)).toBeInTheDocument();
    expect(screen.getByText("jamie@example.com")).toBeInTheDocument();

    expect(calledUrls.some((u) => u.endsWith("/public/bookings"))).toBe(true);
    expect(calledUrls.some((u) => u.endsWith("/booking-guest-1/pay"))).toBe(true);
    expect(calledUrls.every((u) => !u.includes("/api/v1/bookings"))).toBe(true); // never the authenticated route
  });
});
