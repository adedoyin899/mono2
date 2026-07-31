import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { Button } from "../components/ui/Button";
import { apiClient } from "../../lib/api-client";
import type { PublicRateCard, PublicStorefront } from "@monologg/types";
import { ChevronLeft, Lock } from "lucide-react";

/**
 * The entry point for the external-visitor booking flow (features.md Phase
 * 16, FA-5) — reached from a public storefront's "Book" action (Phase 15),
 * before any account exists. Deliberately NOT wrapped in RequireAuth: the
 * whole point of Phase 16 is a logged-out visitor converting into a client.
 *
 * This is Phase 15's stop-here stub, not Phase 16's implementation: it
 * proves the route exists, is reachable without a session, and carries the
 * chosen creator/service through — the deferred-account, escrow-first guest
 * checkout itself is Phase 16's own scope.
 */
export function ExternalBookingEntry() {
  const { creatorId } = useParams<{ creatorId: string }>();
  const [searchParams] = useSearchParams();
  const rateCardId = searchParams.get("rateCard");
  const navigate = useNavigate();

  const [creator, setCreator] = useState<PublicStorefront | null>(null);
  const [rateCard, setRateCard] = useState<PublicRateCard | null>(null);

  useEffect(() => {
    if (!creatorId) return;
    apiClient.getPublicStorefront(creatorId).then(setCreator).catch(() => {});
    apiClient
      .getCreatorRateCardsPublic(creatorId)
      .then((cards) => {
        setRateCard(cards.find((c) => c.id === rateCardId) ?? cards[0] ?? null);
      })
      .catch(() => {});
  }, [creatorId, rateCardId]);

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="h-16 flex items-center gap-3 px-4" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold font-display" style={{ color: "var(--color-text-primary)" }}>Book {creator?.name ?? "…"}</div>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center max-w-sm mx-auto w-full">
        <div className="w-16 h-16 rounded-full flex items-center justify-center mb-5" style={{ background: "var(--color-accent-soft)" }}>
          <Lock className="w-7 h-7" style={{ color: "var(--color-accent)" }} />
        </div>
        <h1 className="font-display text-xl mb-2" style={{ color: "var(--color-text-primary)" }}>Guest checkout is on its way</h1>
        <p className="text-sm font-body mb-6" style={{ color: "var(--color-text-secondary)" }}>
          {rateCard ? (
            <>You're about to book <strong>{rateCard.title}</strong> ({rateCard.price}) with <strong>{creator?.name}</strong>. </>
          ) : null}
          Booking without an account — escrow-first, with an account created only once you pay — is being built next.
        </p>
        <Button variant="secondary" className="w-full h-11" onClick={() => navigate("/auth")}>
          Sign up or sign in to book now
        </Button>
      </div>
    </div>
  );
}
