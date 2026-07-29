import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { afterEach, describe, expect, it, vi } from "vitest";

// features.md Phase 7: CreatorOnboarding.tsx's "Thespian AI" step must reflect
// REAL job state (queued -> tagging -> done/failed) in live mode — not a fixed
// timer — and must never claim identity verification (X3: that's a fully
// separate KYC system). Mock mode preserves the original timed simulation
// (no network), matching every other mock-mode screen in this codebase.

async function renderOnboarding() {
  const { CreatorOnboarding } = await import("./CreatorOnboarding");
  const { container } = render(
    <MemoryRouter>
      <CreatorOnboarding />
    </MemoryRouter>,
  );
  return container;
}

async function goToUploadStep(container: HTMLElement) {
  // Step 1: niche is pre-selected ("actor"); just continue.
  fireEvent.click(screen.getByText("Continue"));

  // Step 2: select a file.
  await screen.findByText("Upload your showcase reel");
  const fileInput = container.querySelector('input[type="file"]') as HTMLInputElement;
  const file = new File(["reel-bytes"], "reel.mp4", { type: "video/mp4" });
  fireEvent.change(fileInput, { target: { files: [file] } });

  fireEvent.click(await screen.findByText("Upload & Analyse"));
}

describe("CreatorOnboarding — AI style tagging (features.md Phase 7)", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
    vi.resetModules();
  });

  it("mock mode: never claims identity verification, and makes no network calls", async () => {
    vi.stubEnv("VITE_API_MODE", undefined as unknown as string);
    const fetchMock = vi.fn();
    vi.stubGlobal("fetch", fetchMock);

    const container = await renderOnboarding();
    await goToUploadStep(container);

    await screen.findByText("Thespian AI is analysing your reel to generate style tags…");
    expect(screen.queryByText(/verification/i)).not.toBeInTheDocument();

    await waitFor(
      () => {
        expect(screen.getByText("Your style tags are ready.")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText("Style Tags Generated")).toBeInTheDocument();
    expect(screen.queryByText(/verification is confirmed/i)).not.toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("live mode: drives the processing view from real job state (queued -> tagging -> done), not a fixed timer", async () => {
    vi.stubEnv("VITE_API_MODE", "live");

    let mediaPollCount = 0;
    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (url === "/api/v1/creators/me/media/presign" && method === "POST") {
        return new Response(JSON.stringify({ uploadUrl: "/api/v1/uploads/local/tok1", mediaAssetId: "media-1" }), {
          status: 201,
        });
      }
      if (url === "/api/v1/uploads/local/tok1" && method === "PUT") {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      if (url === "/api/v1/creators/me/media/media-1/confirm" && method === "POST") {
        return new Response(JSON.stringify({ id: "media-1", taggingStatus: "TAGGING" }), { status: 202 });
      }
      if (url === "/api/v1/creators/me/media/media-1" && method === "GET") {
        mediaPollCount += 1;
        const taggingStatus = mediaPollCount < 2 ? "TAGGING" : "DONE";
        return new Response(JSON.stringify({ id: "media-1", taggingStatus }), { status: 200 });
      }
      if (url === "/api/v1/creators/me" && method === "GET") {
        return new Response(
          JSON.stringify({ id: "creator-1", styleTags: ["Cinematic", "Bold"], verification: "UNVERIFIED" }),
          { status: 200 },
        );
      }
      throw new Error(`Unhandled fetch in test: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const container = await renderOnboarding();
    await goToUploadStep(container);

    await screen.findByText("Thespian AI is analysing your reel to generate style tags…");

    await waitFor(
      () => {
        expect(screen.getByText("Your style tags are ready.")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );

    // Real tags came from the polled job + profile fetch, not the hardcoded mock list.
    expect(screen.getByText("Cinematic")).toBeInTheDocument();
    expect(screen.getByText("Bold")).toBeInTheDocument();
    expect(screen.queryByText("Warm Texture")).not.toBeInTheDocument();

    // The real endpoints were actually driven — this is job-state-driven, not a timer.
    expect(fetchMock).toHaveBeenCalledWith("/api/v1/creators/me/media/presign", expect.anything());
    expect(mediaPollCount).toBeGreaterThanOrEqual(2);
  });

  it("live mode: a FAILED job offers a retry path, never a verified badge", async () => {
    vi.stubEnv("VITE_API_MODE", "live");

    const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
      const method = init?.method ?? "GET";
      if (url === "/api/v1/creators/me/media/presign" && method === "POST") {
        return new Response(JSON.stringify({ uploadUrl: "/api/v1/uploads/local/tok1", mediaAssetId: "media-1" }), {
          status: 201,
        });
      }
      if (url === "/api/v1/uploads/local/tok1" && method === "PUT") {
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      }
      if (url === "/api/v1/creators/me/media/media-1/confirm" && method === "POST") {
        return new Response(JSON.stringify({ id: "media-1", taggingStatus: "TAGGING" }), { status: 202 });
      }
      if (url === "/api/v1/creators/me/media/media-1" && method === "GET") {
        return new Response(JSON.stringify({ id: "media-1", taggingStatus: "FAILED" }), { status: 200 });
      }
      throw new Error(`Unhandled fetch in test: ${method} ${url}`);
    });
    vi.stubGlobal("fetch", fetchMock);

    const container = await renderOnboarding();
    await goToUploadStep(container);

    await waitFor(
      () => {
        expect(screen.getByText("Style tagging didn't complete.")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByText("Try again")).toBeInTheDocument();
    expect(screen.queryByText(/verified/i)).not.toBeInTheDocument();
  });
});
