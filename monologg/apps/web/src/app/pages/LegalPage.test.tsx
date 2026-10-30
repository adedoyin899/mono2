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
});
