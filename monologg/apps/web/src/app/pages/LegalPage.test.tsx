import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LegalPage } from "./LegalPage";

describe("LegalPage", () => {
  it("renders 1-for-1 Terms of Service from Figma (178382:17926)", () => {
    render(
      <MemoryRouter>
        <LegalPage type="terms" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Terms of Service" })).toBeInTheDocument();
    expect(screen.getByText("Last Updated: 29 Oct 2026")).toBeInTheDocument();
    expect(screen.getByText("1. Eligibility & Account Responsibilities")).toBeInTheDocument();
    expect(screen.getByText("2. Data Protection & Regulatory Compliance")).toBeInTheDocument();
    expect(screen.getByText("Compliance Area")).toBeInTheDocument();
    expect(screen.getByText("12. Modifications to Terms")).toBeInTheDocument();
  });

  it("renders 1-for-1 Cookie Settings & Policy from Figma (178383:18857)", () => {
    render(
      <MemoryRouter>
        <LegalPage type="cookies" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Cookie Settings & Policy" })).toBeInTheDocument();
    expect(screen.getByText("Effective Date: October 29, 2026")).toBeInTheDocument();
    expect(screen.getByText("1. Scope & Relationship to Terms of Service")).toBeInTheDocument();
    expect(screen.getByText("2. What Are Cookies?")).toBeInTheDocument();
    expect(screen.getByText("__session_id")).toBeInTheDocument();
    expect(screen.getByText("7. Updates to This Policy")).toBeInTheDocument();
  });

  it("supports privacy route alias with Cookie Settings & Policy content", () => {
    render(
      <MemoryRouter>
        <LegalPage type="privacy" />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: "Cookie Settings & Policy" })).toBeInTheDocument();
    expect(screen.getByText("5. Managing Your Preferences")).toBeInTheDocument();
  });

  it("applies hover microinteraction classes across all section cards (Figma hover state parity)", () => {
    const { container } = render(
      <MemoryRouter>
        <LegalPage type="terms" />
      </MemoryRouter>,
    );

    // Card 4 (Intellectual Property Rights) and all cards share the hover microinteraction
    const card4Heading = screen.getByText("4. Intellectual Property Rights");
    const card4Container = card4Heading.closest("div[data-node-id='178385:19591']");
    expect(card4Container).not.toBeNull();
    expect(card4Container?.className).toContain("hover:bg-[#f9f9f9]");
    expect(card4Container?.className).toContain("hover:border-transparent");
    expect(card4Container?.className).toContain("border-[#e8e8e8]");

    // Verify all 12 cards have the hover microinteraction classes
    const sectionCards = container.querySelectorAll("div[data-node-id='178385:19525'] > div");
    expect(sectionCards.length).toBe(12);
    sectionCards.forEach((card) => {
      expect(card.className).toContain("hover:bg-[#f9f9f9]");
      expect(card.className).toContain("hover:border-transparent");
      expect(card.className).toContain("border-[#e8e8e8]");
    });
  });
});
