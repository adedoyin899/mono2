import { useEffect, useState } from "react";
import { useNavigate, useParams, Link, useSearchParams } from "react-router";
import { motion } from "motion/react";
import { Avatar } from "../components/ui/Avatar";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Logo } from "../components/ui/Logo";
import { apiClient } from "../../lib/api-client";
import { appStateSync } from "../../lib/state-sync";
import { useDocumentMeta } from "../../lib/documentMeta";
import type { PublicStorefront as PublicStorefrontData } from "@monologg/types";
import {
  Shield, Award, Play, Music, ArrowRight, Lock, CheckCircle2, Users, Share2,
  Instagram, Youtube, Twitter, Linkedin, Globe
} from "lucide-react";
import { WatchPerformanceReelModal } from "../components/WatchPerformanceReelModal";

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
  const [showWatchReelModal, setShowWatchReelModal] = useState(false);

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
          <p className="text-sm font-body mb-6 max-w-xs" style={{ color: "var(--color-text-secondary)" }}>This performer link doesn't exist or is no longer available.</p>
          <Button variant="secondary" className="h-10 px-6 text-sm" onClick={() => navigate("/")}>
            Browse Performers on Monologg
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
            <div
              className="h-32 sm:h-40 md:h-44 w-full relative overflow-hidden"
              style={{
                background: "linear-gradient(135deg, #8B0000 0%, #DC2626 50%, #450A0A 100%)",
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            </div>

            <div className="px-6 pb-6">
              <div className="flex items-end justify-between -mt-12 sm:-mt-14 mb-4">
                <Avatar size="xl" background="var(--color-accent)" color="var(--color-accent-on)" className="ring-4 ring-[var(--color-bg-surface)] shadow-md">
                  {profile.name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase()}
                </Avatar>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" className="h-8 px-3 text-xs gap-1.5" onClick={handleShareStorefront}>
                    <Share2 className="w-3.5 h-3.5" /> {copiedStorefrontLink ? "Copied!" : "Share"}
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-wrap mb-1">
                <h1 className="font-display text-2xl sm:text-3xl font-bold" style={{ color: "var(--color-text-primary)" }}>
                  {profile.name}
                </h1>
                {profile.verified && (
                  <Badge tone="success" className="border border-[var(--color-success)] text-xs">
                    <Shield className="w-3 h-3" /> Verified
                  </Badge>
                )}
                {profile.celebrityBadge && (
                  <Badge tone="warning" className="border border-[var(--color-gold-primary)] text-xs">
                    <Award className="w-3 h-3" /> Celebrity
                  </Badge>
                )}
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Available for Booking
                </span>
              </div>

              <p className="text-xs sm:text-sm font-body mb-4" style={{ color: "var(--color-text-secondary)" }}>
                {profile.nicheLabel} · {profile.location}
              </p>

              {/* Social Presence Links */}
              <div className="flex items-center gap-2 flex-wrap mb-4 pt-3 border-t border-[var(--color-hairline)]">
                <a
                  href={`https://instagram.com/${profile.name.toLowerCase().replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body border border-[var(--color-border-default)] hover:border-[var(--color-accent)] bg-[var(--color-bg-elevated)] transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Instagram className="w-3.5 h-3.5 text-pink-500" />
                  <span>@{profile.name.toLowerCase().replace(/\s+/g, "")}</span>
                </a>
                <a
                  href={`https://youtube.com/@${profile.name.toLowerCase().replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body border border-[var(--color-border-default)] hover:border-[var(--color-accent)] bg-[var(--color-bg-elevated)] transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Youtube className="w-3.5 h-3.5 text-red-500" />
                  <span>@{profile.name.toLowerCase().replace(/\s+/g, "")}</span>
                </a>
                <a
                  href={`https://twitter.com/${profile.name.toLowerCase().replace(/\s+/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-body border border-[var(--color-border-default)] hover:border-[var(--color-accent)] bg-[var(--color-bg-elevated)] transition-colors"
                  style={{ color: "var(--color-text-secondary)" }}
                >
                  <Twitter className="w-3.5 h-3.5 text-sky-500" />
                  <span>@{profile.name.toLowerCase().replace(/\s+/g, "")}</span>
                </a>
              </div>

              {profile.styleTags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {profile.styleTags.map((tag) => (
                    <Badge key={tag} tone="neutral" size="md">{tag}</Badge>
                  ))}
                </div>
              )}

              {profile.bio && (
                <div className="mb-6 p-4 rounded-[var(--radius-md)]" style={{ background: "var(--color-bg-elevated)", border: "1px solid var(--color-hairline)" }}>
                  <p className="text-xs sm:text-sm font-body leading-relaxed" style={{ color: "var(--color-text-secondary)" }}>
                    {profile.bio}
                  </p>
                </div>
              )}

              {/* Featured Performance Reel (Reduced Height) */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2.5">
                  <h3 className="text-sm font-semibold font-body" style={{ color: "var(--color-text-primary)" }}>
                    Featured Performance Reel
                  </h3>
                  <button
                    onClick={() => setShowWatchReelModal(true)}
                    className="text-xs font-semibold hover:underline flex items-center gap-1"
                    style={{ color: "var(--color-accent)" }}
                  >
                    <Play className="w-3 h-3" /> Watch Full Reel
                  </button>
                </div>

                <div
                  className="relative h-48 sm:h-56 md:h-60 w-full rounded-[var(--radius-lg)] overflow-hidden group cursor-pointer border shadow-sm"
                  style={{
                    background: "var(--color-bg-elevated)",
                    borderColor: "var(--color-border-default)",
                  }}
                  onClick={() => setShowWatchReelModal(true)}
                >
                  <img
                    src="https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80&fit=crop"
                    alt="Reel"
                    className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div
                      className="w-14 h-14 rounded-full flex items-center justify-center pl-1 shadow-xl transition-transform group-hover:scale-110"
                      style={{ background: "var(--color-accent)" }}
                    >
                      <Play className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-black/60 text-white backdrop-blur-md">
                    Featured Performance Reel
                  </div>
                  <div className="absolute bottom-3 right-3 px-2 py-1 rounded font-mono text-xs text-white bg-black/60 backdrop-blur-md">
                    01:30
                  </div>
                </div>
              </div>

              {/* Rate Cards Section with Book Now CTA */}
              <h2 className="text-sm font-semibold font-body mb-3" style={{ color: "var(--color-text-primary)" }}>
                Rate Cards
              </h2>
              {profile.rateCards.length === 0 ? (
                <p className="text-sm font-body" style={{ color: "var(--color-text-tertiary)" }}>No services listed yet.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {profile.rateCards.map((service) => (
                    <div
                      key={service.id}
                      className="p-4 rounded-[var(--radius-lg)] border flex flex-col justify-between hover:shadow-[var(--shadow-elevated)] transition-all"
                      style={{
                        background: "var(--color-bg-elevated)",
                        borderColor: "var(--color-border-default)",
                        borderLeft: "3px solid var(--color-accent)",
                      }}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-sm font-bold font-body" style={{ color: "var(--color-text-primary)" }}>{service.title}</span>
                          <span className="font-display text-lg font-bold" style={{ color: "var(--color-accent)" }}>{service.price}</span>
                        </div>
                        <div className="text-xs font-body mb-4" style={{ color: "var(--color-text-secondary)" }}>Delivery: {service.delivery}</div>
                      </div>
                      <Button
                        className="w-full h-10 text-xs font-semibold gap-2 mt-auto"
                        onClick={() => navigate(`/book/${profile.id}?rateCard=${service.id}`)}
                      >
                        Book Now <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>

          <WatchPerformanceReelModal
            isOpen={showWatchReelModal}
            onClose={() => setShowWatchReelModal(false)}
            videoUrl={
              profile.media.find((m) => m.kind === "VIDEO")?.url ||
              "https://assets.mixkit.co/videos/preview/mixkit-acting-audition-sample-4244-large.mp4"
            }
            title={`${profile.name} — Performance Reel`}
            canUpload={false}
          />

          {/* ── Trust footer — builds confidence for strangers about to pay ── */}
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-6 flex-wrap justify-center">
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                <Lock className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                Escrow-protected payments
              </div>
              <div className="flex items-center gap-1.5 text-xs font-body" style={{ color: "var(--color-text-tertiary)" }}>
                <Shield className="w-3.5 h-3.5" style={{ color: "var(--color-success)" }} />
                Verified performer profiles
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
