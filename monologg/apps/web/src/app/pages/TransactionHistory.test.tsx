import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 10: transaction history renders real, owner-scoped data
// with a fee breakdown in live mode; mock mode uses local fixtures (new
// screen, no prior UI to preserve, but same seam contract as every other page).

async function renderPage() {
  const { TransactionHistory } = await import("./TransactionHistory");
  render(
    <MemoryRouter>
      <TransactionHistory />
    </MemoryRouter>,
  );
}

describe("TransactionHistory", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: shows fixture transactions with no network call", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    await renderPage();

    await screen.findByText("Booking ORD-001");
    expect((await screen.findAllByText("Payout")).length).toBeGreaterThan(0);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("live mode: renders real fee breakdown from the API", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async () =>
      new Response(
        JSON.stringify({
          data: [
            {
              id: "txn-1",
              bookingId: "b1",
              direction: "payment",
              state: "ESCROW_HELD",
              currency: "NGN",
              baseAmount: 1_000_000,
              baseAmountFormatted: "₦10,000",
              feeAmount: 150_000,
              feeAmountFormatted: "₦1,500",
              totalAmount: 1_150_000,
              totalAmountFormatted: "₦11,500",
              providerRef: "ref-live-1",
              createdAt: new Date().toISOString(),
            },
          ],
          page: 1,
          pageSize: 100,
          total: 1,
          totalPages: 1,
        }),
        { status: 200 },
      ),
    );
    vi.stubGlobal("fetch", fetchMock);

    await renderPage();

    await screen.findByText("₦11,500");
    expect(screen.getByText(/Base ₦10,000/)).toBeInTheDocument();
    expect(screen.getByText("Ref: ref-live-1")).toBeInTheDocument();
  });

  it("live mode: changing the status filter re-fetches with the state query param", async () => {
    vi.stubEnv("VITE_API_MODE", "live");
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) => new Response(JSON.stringify({ data: [] }), { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    await renderPage();
    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));

    fireEvent.change(screen.getByLabelText("Filter by status"), { target: { value: "REFUNDED" } });

    await waitFor(() => {
      const lastCallUrl = fetchMock.mock.calls[fetchMock.mock.calls.length - 1][0] as string;
      expect(lastCallUrl).toContain("state=REFUNDED");
    });
  });
});
