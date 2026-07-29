import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router";
import { describe, expect, it } from "vitest";
import { LegalPage } from "./LegalPage";
import { CURRENT_TERMS_VERSION } from "@monologg/types";

describe("LegalPage", () => {
  it("renders Terms of Service with the current version and a draft-placeholder notice", () => {
    render(
      <MemoryRouter>
        <LegalPage type="terms" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Terms of Service")).toBeInTheDocument();
    expect(screen.getByText(new RegExp(`Version ${CURRENT_TERMS_VERSION}`))).toBeInTheDocument();
    expect(screen.getByText(/has not been through legal review/)).toBeInTheDocument();
  });

  it("renders Privacy Policy content distinctly from Terms", () => {
    render(
      <MemoryRouter>
        <LegalPage type="privacy" />
      </MemoryRouter>,
    );

    expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
    expect(screen.getByText(/What We Collect/)).toBeInTheDocument();
  });
});
