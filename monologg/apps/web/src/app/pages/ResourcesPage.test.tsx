import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { ResourcesPage } from "./ResourcesPage";

describe("ResourcesPage (Figma 178359:18325)", () => {
  it("renders the 1-for-1 Resources Page layout with announcement bar and header", () => {
    render(
      <MemoryRouter>
        <ResourcesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("Monologg Marketplace v3.0 Live")).toBeInTheDocument();
    expect(screen.getByText("FINCRA Escrow Secured")).toBeInTheDocument();
    expect(screen.getByText("3,200+ Verified Talent Profiles")).toBeInTheDocument();
  });

  it("renders the master resources card with Terms of Service, Escrow Guarantee, and Helpdesk sections", () => {
    render(
      <MemoryRouter>
        <ResourcesPage />
      </MemoryRouter>,
    );

    expect(screen.getByRole("button", { name: /Terms of Service/i })).toBeInTheDocument();
    expect(screen.getByText("Escrow Guarantee Policy")).toBeInTheDocument();
    expect(screen.getAllByText("Fair Trade Contracts").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByRole("button", { name: /Support & Community/i }).length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("24/7 Creator Helpdesk")).toBeInTheDocument();
    expect(screen.getByText("Onboarding & EPK Guides")).toBeInTheDocument();
    expect(screen.getAllByText("hello@monologg.co").length).toBeGreaterThanOrEqual(1);
  });

  it("renders the 'Become an Investor' section and allows form submission", () => {
    render(
      <MemoryRouter>
        <ResourcesPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("RAISING SOON!")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Become an Investor" })).toBeInTheDocument();
    expect(screen.getByText(/Follow our investor updates/i)).toBeInTheDocument();

    const firstNameInput = screen.getByLabelText(/First Name/i);
    const lastNameInput = screen.getByLabelText(/Last Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const phoneInput = screen.getByLabelText(/phone no/i);
    const submitBtn = screen.getByRole("button", { name: /Submit Application/i });

    fireEvent.change(firstNameInput, { target: { value: "Ade" } });
    fireEvent.change(lastNameInput, { target: { value: "Oyeniyi" } });
    fireEvent.change(emailInput, { target: { value: "ade@example.com" } });
    fireEvent.change(phoneInput, { target: { value: "+2348012345678" } });

    fireEvent.click(submitBtn);

    expect(screen.getByText(/Thank you for your interest!/i)).toBeInTheDocument();
  });
});
