// features.md Phase 10: the current legal-terms version, shared so apps/web
// (registration checkbox + legal pages) and apps/api (TermsAcceptance rows)
// can never drift apart — one source of truth, not two hardcoded strings.
// Bump this string whenever the terms/privacy content changes; existing
// TermsAcceptance rows keep recording whatever version a user actually saw.
export const CURRENT_TERMS_VERSION = "2026-07-29";
