import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { apiClient } from "../../lib/api-client";
import { useDocumentMeta } from "../../lib/documentMeta";
import type { PublicStorefront as PublicStorefrontData } from "@monologg/types";
import { Shield, Award, Play, Music, ArrowRight, Lock, CheckCircle2, Users, Share2 } from "lucide-react";

/**
 * The public marketplace profile (features.md Phase 15, FA-3):
 * monologg.co/[handle] — reachable by anyone, logged out, no account.
 * `handle` is the creator's id (see apps/api's routes/mediaKit.ts and
 * services/publicProfile.ts for the same forward-reference to a real
 * username/slug field no phase's schema has added yet).
 *
 * Deliberately NOT wrapped in RequireAuth (routes.tsx) — this is the one
 * screen in the whole app that must render for a stranger with zero session
 * state. It only ever renders what GET /creators/:id/public returns, which
 * is itself scoped to public-safe fields server-side — there is no private
 * data available to leak here even by mistake.
 */

/* ── Skeleton placeholder for loading state (T2 partial) ── */
function StorefrontSkeleton() {
  const shimmer = {
    background: "var(--color-bg-elevated)",
    borderRadius: "var(--radius-md)",
  };
  return (
    <div className="min-h-screen" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="rounded-[var(--radius-lg)] overflow-hidden" style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)" }}>
          <div className="h-24 w-full animate-pulse" style={shimmer} />
          <div className="px-6 pb-6">
            <div className="flex items-end gap-4 -mt-10 mb-4">
              <div className="w-16 h-16 rounded-full animate-pulse" style={shimmer} />
              <div className="flex gap-2 pb-1">
                <div className="w-16 h-5 rounded-full animate-pulse" style={shimmer} />
              </div>
            </div>
            <div className="w-48 h-7 mb-2 animate-pulse" style={shimmer} />
            <div className="w-32 h-4 mb-4 animate-pulse" style={shimmer} />
            <div className="flex gap-2 mb-4">
              {[1, 2, 3].map(i => <div key={i} className="w-20 h-6 rounded-full animate-pulse" style={shimmer} />)}
            </div>
            <div className="w-full h-16 mb-6 animate-pulse" style={shimmer} />
            <div className="w-28 h-4 mb-3 animate-pulse" style={shimmer} />
            <div className="space-y-3">
              {[1, 2].map(i => <div key={i} className="w-full h-28 animate-pulse" style={shimmer} />)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PublicStorefront() {
  const { handle } = useParams<{ handle: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PublicStorefrontData | null>(null);
  const [notFound, setNotFound] = useState(false);

  const roleThemeClass = searchParams.get("role") === "client" ? "role-client" : "role-talent";

  useEffect(() => {
    if (!handle) return;
    setProfile(null);
    setNotFound(false);
    apiClient
      .getPublicStorefront(handle)
      .then(setProfile)
      .catch(() => setNotFound(true));
  }, [handle]);

  useDocumentMeta(
    profile
      ? {
          title: `${profile.name} — ${profile.nicheLabel} | Monologg`,
          description: profile.bio ?? `Book ${profile.name}, ${profile.nicheLabel.toLowerCase()} on Monologg.`,
          image: handle ? apiClient.getOgImageUrl(handle) : undefined,
          type: "profile",
        }
      : null,
  );

  const [copiedStorefrontLink, setCopiedStorefrontLink] = useState(false);

  const handleShareStorefront = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(window.location.href);
      }
      setCopiedStorefrontLink(true);
      setTimeout(() => setCopiedStorefrontLink(false), 3000);
    } catch {
      setCopiedStorefrontLink(true);
      setTimeout(() => setCopiedStorefrontLink(false), 3000);
    }
  };

  if (notFound) {
    return (
      <div className={`min-h-screen flex flex-col ${roleThemeClass}`} style={{ background: "var(--color-bg-canvas)" }}>
        {/* ── Header with logo & actions ── */}
        <header className="h-14 px-5 flex items-center justify-between sticky top-0 z-40 backdrop-blur-xl" style={{ background: "color-mix(in srgb, var(--color-bg-canvas) 72%, transparent)", borderBottom: "1px solid var(--color-hairline)" }}>
          <Link to="/" aria-label="Monologg home">
            <Logo className="h-5 w-auto" style={{ color: "var(--color-text-primary)" }} />
          </Link>
          <div className="flex items-center gap-2">
            <Button variant="ghost" className="h-9 px-4 text-xs" onClick={() => navigate("/auth")}>
              Sign In
            </Button>
          </div>
        </header>
        <div className="flex-1 max-w-2xl mx-auto px-4 py-8 w-full flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full flex items-center justify-center mb-4" style={{ background: "var(--color-bg-elevated)" }}>
            <Users className="w-7 h-7" style={{ color: "var(--color-text-tertiary)" }} />
          </div>
          <h1 className="font-display text-2xl mb-2" style={{ color: "var(--color-text-primary)" }}>Profile not found</h1>
          <p className="text-sm font-body mb-6 max-w-xs" style={{ color: "var(--color-text-secondary)" }}>This talent link doesn't exist or is no longer available.</p>
          <Button variant="secondary" className="h-10 px-6 text-sm" onClick={() => navigate("/")}>
            Browse Talent on Monologg
          </Button>
        </div>
      </div>
    );
  }

  if (!profile) {
    return <StorefrontSkeleton />;
  }

  return (
    <div className={`${roleThemeClass} min-h-screen flex flex-col`} style={{ background: "var(--color-bg-canvas)" }}>
      {/* ── Branded header — trust starts here ── */}
      <header
        className="h-14 sticky top-0 z-50 px-5 flex items-center justify-between backdrop-blur-xl"
        style={{ background: "color-mix(in srgb, var(--color-bg-canvas) 72%, transparent)", borderBottom: "1px solid var(--color-hairline)" }}
      >
        <Link to="/" aria-label="Monologg home">
          <Logo className="h-5 w-auto" style={{ color: "var(--color-text-primary)" }} />
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="secondary" className="h-9 px-3 text-sm gap-1.5" onClick={handleShareStorefront}>
            <Share2 className="w-3.5 h-3.5" /> {copiedStorefrontLink ? "Copied!" : "Share"}
          </Button>
          <Button variant="ghost" className="h-9 px-4 text-sm" onClick={() => navigate("/auth")}>
            Sign In
          </Button>
          <Button className="h-9 px-4 text-sm" onClick={() => navigate("/auth")}>
            Join Free
          </Button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main className="flex-1">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="rounded-[var(--radius-lg)] overflow-hidden"
            style={{ background: "var(--color-bg-surface)", border: "1px solid var(--color-border-default)", boxShadow: "var(--shadow-card)" }}
          >
            <div className="h-24 w-full" style={{ background: "linear-gradient(135deg, var(--color-accent-glow), var(--color-bg-elevated))" }} />

            <div className="px-6 pb-6">
              <div className="flex items-end gap-4 -mt-10 mb-4">
                <Avatar size="xl" background="var(--color-accent)" color="var(--color-accent-on)">
                  {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </Avatar>
                <div className="pb-1 flex gap-2 flex-wrap">
                  {profile.verified && (
                    <Badge tone="success" className="border border-[var(--color-success)]">
                      <Shield className="w-3 h-3" /> Verified
                    </Badge>
                  )}
                  {profile.celebrityBadge && (
                    <Badge tone="warning" className="border border-[var(--color-gold-primary)]">
                      <Award className="w-3 h-3" /> Celebrity
                    </Badge>
                  )}
                </div>
              </div>

              <h1 className="font-display text-2xl mb-1" style={{ color: "var(--color-text-primary)" }}>{profile.name}</h1>
              <p className="text-sm font-body mb-3" style={{ color: "var(--color-text-secondary)" }}>{profile.nicheLabel} · {profile.location}</p>

              {profile.styleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.styleTags.map((tag) => (
                    <Badge key={tag} tone="neutral" size="lg">{tag}</Badge>
                  ))}
                </div>
              )}

              {profile.bio && (
                <p className="text-sm font-body leading-relaxed mb-6" style={{ color: "var(--color-text-secondary)" }}>{profile.bio}</p>
              )}

              {profile.media.length > 0 && (
                <>
                  <h2 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Showcase</h2>
                  <div className="space-y-3 mb-6">
                    {profile.media.map((asset) => (
                      <div
                        key={asset.id}
                        className="relative rounded-[var(--radius-md)] overflow-hidden flex items-center gap-3 p-4"
                        style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                      >
                        <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: "var(--color-accent)" }}>
                          {asset.kind === "VIDEO" ? (
                            <Play className="w-4 h-4 pl-0.5" style={{ color: "var(--color-accent-on)" }} />
                          ) : (
                            <Music className="w-4 h-4" style={{ color: "var(--color-accent-on)" }} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 text-sm font-body" style={{ color: "var(--color-text-secondary)" }}>
                          {asset.kind === "VIDEO" ? "Reel" : "Audio sample"}
                          {asset.durationSec ? ` · ${Math.round(asset.durationSec)}s` : ""}
                        </div>
                        <a href={asset.url} target="_blank" rel="noreferrer" className="text-xs font-semibold font-body shrink-0" style={{ color: "var(--color-accent)" }}>
                          Play
                        </a>
                      </div>
                    ))}
                  </div>
                </>
              )}

              <h2 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>Booking Services</h2>
              {profile.rateCards.length === 0 ? (
                <p className="text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>No services listed yet.</p>
              ) : (
                <div className="space-y-3">
                  {profile.rateCards.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-[var(--radius-md)] hover:shadow-[var(--shadow-elevated)] transition-shadow"
                      style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-border-default)" }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>{service.title}</span>
                        <span className="font-display text-lg" style={{ color: "var(--color-accent)" }}>{service.price}</span>
                      </div>
                      <div className="text-xs font-body mb-3" style={{ color: "var(--color-text-tertiary)" }}>Delivery: {service.delivery}</div>
                      <Button
                        className="w-full h-10 text-sm gap-2"
                        onClick={() => navigate(`/book/${profile.id}?rateCard=${service.id}`)}
                      >
                        Book Now <ArrowRight className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          {/* ── Trust footer — builds confidence for strangers about to pay ── */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                Escrow-protected payments
              </div>
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                Verified talent profiles
              </div>
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                Money-back guarantee
              </div>
            </div>
            <Link
              to="/"
              className="flex items-center gap-2 text-xs font-body hover:opacity-80 transition-opacity"
              style={{ color: "var(--color-text-tertiary)" }}
            >
              <Logo className="h-3.5 w-auto" style={{ color: "var(--color-text-tertiary)" }} />
              Powered by Monologg
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
