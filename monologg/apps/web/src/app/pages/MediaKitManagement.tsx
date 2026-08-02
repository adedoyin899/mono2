import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { ChevronLeft, FileText, RefreshCw, Upload, RotateCcw, Download, Share2 } from "lucide-react";
import { apiClient, type MediaKitStatus } from "../../lib/api-client";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";

// PWA-20 (features.md Phase 12A.1) — new screen, Media Kit management inside
// the talent profile. Mode toggle, Regenerate, Upload/Replace/Revert, with a
// clear "Currently showing: Auto | Your upload" status per the spec.
export function MediaKitManagement() {
  const navigate = useNavigate();
  const [status, setStatus] = useState<MediaKitStatus | null>(null);
  const [busy, setBusy] = useState<"regenerate" | "upload" | "revert" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = () => apiClient.getMediaKitStatus().then(setStatus);
  useEffect(() => { load(); }, []);

  const s = {
    text: { color: "var(--color-text-primary)" } as React.CSSProperties,
    secondary: { color: "var(--color-text-secondary)" } as React.CSSProperties,
    tertiary: { color: "var(--color-text-tertiary)" } as React.CSSProperties,
    surface: { background: "var(--color-bg-surface)", border: "1px solid var(--color-hairline)" } as React.CSSProperties,
  };

  const handleRegenerate = async () => {
    setBusy("regenerate");
    setError(null);
    try {
      setStatus(await apiClient.regenerateMediaKit());
    } finally {
      setBusy(null);
    }
  };

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-selecting the same file after an error
    if (!file) return;

    setBusy("upload");
    setError(null);
    try {
      setStatus(await apiClient.uploadMediaKit(file));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed — please try a different PDF.");
    } finally {
      setBusy(null);
    }
  };

  const handleRevert = async () => {
    setBusy("revert");
    setError(null);
    try {
      setStatus(await apiClient.revertMediaKitToAuto());
    } finally {
      setBusy(null);
    }
  };

  const [copiedLink, setCopiedLink] = useState(false);

  const handleDownload = () => {
    const kitUrl = status ? apiClient.getMediaKitPublicUrl(status.creatorId) : "#";
    const link = document.createElement("a");
    link.href = kitUrl;
    link.download = `MediaKit_${status?.creatorId || "Talent"}.pdf`;
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShare = async () => {
    const url = window.location.origin + (status ? apiClient.getMediaKitPublicUrl(status.creatorId) : "/media-kit");
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(url);
      }
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 3000);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "var(--color-bg-canvas)" }}>
      <div className="h-16 flex items-center gap-3 px-4 sticky top-0 z-40 glass-panel" style={{ borderBottom: "1px solid var(--color-hairline)" }}>
        <button
          aria-label="Go back"
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-[var(--radius-full)] flex items-center justify-center hover:opacity-80 active:scale-95 transition-all"
          style={{ background: "var(--color-bg-elevated)", color: "var(--color-text-secondary)" }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div className="text-sm font-semibold font-display" style={s.text}>Media Kit</div>
      </div>

      <div className="flex-1 px-4 py-5 max-w-lg mx-auto w-full space-y-5">
        <div className="rounded-[var(--radius-xl)] p-5 flex items-center gap-4" style={{ ...s.surface, boxShadow: "var(--shadow-card)" }}>
          <div className="w-12 h-12 rounded-[var(--radius-lg)] flex items-center justify-center shrink-0" style={{ background: "var(--color-accent-soft)", color: "var(--color-accent)" }}>
            <FileText className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold font-body" style={s.text}>
              Currently showing: {status?.mode === "UPLOAD" ? "Your upload" : "Auto"}
            </div>
            <div className="text-xs font-body mt-0.5" style={s.tertiary}>
              {status?.mode === "AUTO"
                ? `Auto-generated from your public profile (v${status.autoVersion})`
                : status?.uploadSizeBytes
                  ? `${(status.uploadSizeBytes / 1024 / 1024).toFixed(1)} MB PDF`
                  : "A PDF you uploaded"}
            </div>
          </div>
          <Badge tone={status?.mode === "UPLOAD" ? "accent" : "success"}>{status?.mode ?? "…"}</Badge>
        </div>

        {copiedLink && (
          <div className="rounded-[var(--radius-lg)] p-3 text-xs font-body flex items-center justify-between" style={{ background: "var(--color-success-bg)", color: "var(--color-success)" }}>
            <span>Media kit link copied to clipboard!</span>
            <span className="font-mono">✓</span>
          </div>
        )}

        {error && (
          <div className="rounded-[var(--radius-lg)] p-3 text-sm font-body" style={{ background: "var(--color-error-bg)", color: "var(--color-error)" }}>
            {error}
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={handleDownload}
            className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-lg)] text-sm font-semibold font-body border hover:border-[var(--color-accent)] transition-all"
            style={{ ...s.surface, color: "var(--color-text-primary)" }}
          >
            <Download className="w-4 h-4" /> Download
          </button>
          <button
            type="button"
            onClick={handleShare}
            className="flex items-center justify-center gap-2 h-12 rounded-[var(--radius-lg)] text-sm font-semibold font-body border hover:border-[var(--color-accent)] transition-all"
            style={{ ...s.surface, color: "var(--color-text-primary)" }}
          >
            <Share2 className="w-4 h-4 text-[var(--color-accent)]" /> {copiedLink ? "Link Copied!" : "Share link"}
          </button>
        </div>

        <div className="space-y-3">
          <Button className="w-full h-12" variant="secondary" onClick={handleRegenerate} disabled={busy !== null}>
            <RefreshCw className={`w-4 h-4 ${busy === "regenerate" ? "animate-spin" : ""}`} />
            {busy === "regenerate" ? "Regenerating…" : "Regenerate from profile"}
          </Button>

          <input ref={fileInputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileSelected} />
          <Button className="w-full h-12" variant="secondary" onClick={handleUploadClick} disabled={busy !== null}>
            <Upload className="w-4 h-4" />
            {busy === "upload" ? "Uploading…" : status?.mode === "UPLOAD" ? "Replace upload" : "Upload / Replace"}
          </Button>

          {status?.mode === "UPLOAD" && (
            <Button className="w-full h-12" variant="ghost" onClick={handleRevert} disabled={busy !== null}>
              <RotateCcw className="w-4 h-4" />
              {busy === "revert" ? "Reverting…" : "Revert to auto-generated"}
            </Button>
          )}
        </div>

        <p className="text-xs font-body text-center" style={s.secondary}>
          PDF only, up to 20MB. Your kit is available at monologg.co/[handle]/kit.
        </p>
      </div>
    </div>
  );
}
