import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductPage } from "./ProductPage";

describe("ProductPage (Figma 178359:17305)", () => {
  beforeEach(() => {
    window.scrollTo = vi.fn();
  });

  it("renders announcement bar, header, and Performer Portal hero", () => {
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>,
    );

    // Top announcement bar
    expect(screen.getByText("Monologg Marketplace v3.0 Live")).toBeInTheDocument();
    expect(screen.getByText("FINCRA Escrow Secured")).toBeInTheDocument();
    expect(screen.getByText("3,200+ Verified Talent Profiles")).toBeInTheDocument();

    // Performer Portal hero
    expect(screen.getAllByText("Performer Portal").length).toBeGreaterThanOrEqual(1);
    expect(
      screen.getByRole("heading", { name: "Build your personal digital stage" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/Pitch on live casting briefs, set your custom service rates/i),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /Get started for free/i }).length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 7-step interactive showcase without duplicating artboard sections", () => {
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>,
    );

    // Check presence of the 7 steps
    expect(screen.getByText("Interactive AI Agent")).toBeInTheDocument();
    expect(screen.getByText("Custom Rate Cards & Micro-Deliverables")).toBeInTheDocument();
    expect(screen.getByText("Real-Time Performer Analytics & Visitor Intelligence")).toBeInTheDocument();
    expect(screen.getByText("Escrow Security")).toBeInTheDocument();
    expect(screen.getByText("Direct Proposal Bidding:")).toBeInTheDocument();
    expect(screen.getByText("Sleek Bio Storefront")).toBeInTheDocument();
    expect(screen.getByText("Integrated Scheduling")).toBeInTheDocument();

    // Step 0 is active by default
    expect(
      screen.getByText(/Ditch scattered bio links for a mobile storefront/i),
    ).toBeInTheDocument();

    // Clicking step 1 switches active step and reveals its description
    const rateCardsStep = screen.getByText("Custom Rate Cards & Micro-Deliverables");
    fireEvent.click(rateCardsStep);

    expect(
      screen.getByText(/Set clear baseline prices for gigs and fan requests/i),
    ).toBeInTheDocument();
    expect(screen.getByText("Custom Rate Card")).toBeInTheDocument();
  });

  it("renders the Client Portal section with 4 capability cards and 6 studio logos", () => {
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("client Portal")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "The Upwork for Performer Acquisition" }),
    ).toBeInTheDocument();

    // 4 cards
    expect(screen.getByText("Verified Creator Pool")).toBeInTheDocument();
    expect(screen.getByText("Chat with AI Performer Profiles")).toBeInTheDocument();
    expect(screen.getByText("Post Gigs & Micro-Briefs")).toBeInTheDocument();
    expect(screen.getByText("Secure Contracts & Escrow Payments")).toBeInTheDocument();

    // 6 studio logos
    expect(screen.getAllByAltText("Vimeo").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Netflix").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Amazon Prime").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Disney+").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Hulu").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByAltText("Twitch").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Trusted by top media houses")).toBeInTheDocument();
  });

  it("renders Thespian AI section and toggles between Performer and Client views", () => {
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Thespian ai")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Performance Intelligence Engine" }),
    ).toBeInTheDocument();

    // Default: Performer tab
    expect(screen.getByText("What Thespian AI Does for the Performer")).toBeInTheDocument();
    expect(screen.getByText("Your Digital AI Agent")).toBeInTheDocument();
    expect(screen.getByText("Instant AI Onboarding")).toBeInTheDocument();

    // Toggle to Client tab
    const clientTabBtn = screen.getAllByRole("button", { name: /client/i })[0];
    fireEvent.click(clientTabBtn);

    expect(screen.getByText("What Thespian AI Does for the Client")).toBeInTheDocument();
    expect(screen.getByText("Your Automated Casting Butler")).toBeInTheDocument();
    expect(screen.getByText("Vibe & Texture Matching")).toBeInTheDocument();
    expect(screen.getByText("Automated Logistics")).toBeInTheDocument();
    expect(screen.getByText("Start hiring today")).toBeInTheDocument();
  });

  it("renders 10 FAQ accordion items and expands on click", () => {
    render(
      <MemoryRouter>
        <ProductPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { name: "Frequently Asked Questions" }),
    ).toBeInTheDocument();

    // Default item 0 is open
    expect(
      screen.getByText(/Monologg is like Upwork for Actors, Public speakers/i),
    ).toBeInTheDocument();

    // Click item 4: "How does Thespian AI work?"
    const faqBtn = screen.getByRole("button", { name: /How does Thespian AI work\?/i });
    fireEvent.click(faqBtn);

    expect(
      screen.getByText(/When performers upload their monologues or voice reels, Thespian AI analyzes/i),
    ).toBeInTheDocument();
  });
});
