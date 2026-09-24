# Monologg — Frontend & Backend Technical Stack Architecture

**Last updated:** 2026-09-24 (Session 78: Full-Stack Frontend & Backend Technical Architecture Documentation)  
**Status:** Living architecture document. Authoritative reference for the language, framework, database, infrastructure, design system, and integration stack across Monologg.

---

## 1. Monorepo Topology & Workspace Structure

Monologg is orchestrated as a high-performance **pnpm monorepo** (`pnpm@9.15.9`, Node.js `>=20`), partitioned into focused applications and shared contract packages:

```
monologg/
├── apps/
│   ├── web/                    # Frontend React 18 SPA (Vite 6, Tailwind CSS v4)
│   └── api/                    # Backend REST API (Fastify 5, Prisma 6, PostgreSQL)
├── packages/
│   └── types/                  # Shared TypeScript interfaces & Zod validation schemas
├── handoff/                    # Living architectural documentation and handover records
├── brand/                      # Brand assets, vectors, and reference logos
├── reference-docs/             # PRD, UX specs, and original Figma Make exports
├── docker-compose.yml          # Containerized local environment (API, Postgres, Redis)
├── pnpm-workspace.yaml         # PNPM workspace definition
└── package.json                # Root workspace scripts & engine constraints
```

---

## 2. Frontend Stack Specification (`apps/web`)

The frontend is a client-side Single Page Application (SPA) designed with a role-adaptive shell (switching accent palettes between **Talent Red** `#F13030` and **Client Purple** `#7B00FE`, with a public marketing suite in **Notion Warm Paper** `#f6f5f4`).

### Core Technology Matrix

| Layer | Technology | Version | Purpose & Architecture |
|---|---|---|---|
| **Language** | **TypeScript** | `^5.9.3` | Enforces type safety in `strict: true` mode; compiled via Vite/esbuild. |
| **Framework** | **React** | `18.3.1` | Concurrent Mode, declarative component tree, hooks, and context. |
| **DOM Renderer** | **react-dom** | `18.3.1` | Client-side DOM mounting and reconciliation. |
| **Build Engine / Dev Server** | **Vite** | `6.4.3` | Ultra-fast Hot Module Replacement (HMR), Rollup-based production bundling. |
| **Compiler Plugin** | `@vitejs/plugin-react` | `4.7.0` | Fast Refresh, JSX transform, and Babel/SWC optimizations. |
| **Routing** | **react-router** | `7.18.2` | Data-driven routing via `createBrowserRouter`; handles protected routes, role gates, dynamic segments (`/[handle]`, `/book/:creatorId`). |
| **Styling Engine** | **Tailwind CSS v4** | `4.1.12` | Next-gen CSS compiler via `@tailwindcss/vite`; zero configuration file required. |
| **Design Tokens** | **CSS Custom Properties** | Native CSS | Defined in `src/styles/tokens.css` as single source of truth for colors, typography, borders, and spacing. |
| **Micro-Animations** | **Motion** (`motion/react`) | `12.23.24` | Modern successor to Framer Motion; layout animations, smooth drawer/modal reveals, spring physics. |
| **Iconography** | **lucide-react** | `0.487.0` | Feather-style SVG icons (~57 unique icons across the app). |
| **Class Utilities** | `clsx` + `tailwind-merge` | `2.1.1` / `3.2.0` | Conditional class joining and intelligent Tailwind class conflict resolution via `cn()`. |
| **Typography** | **Self-Hosted & Web Fonts** | Native CSS | Primary: `General Sans` (display), `Plus Jakarta Sans` (body), `JetBrains Mono` (code/numbers); Marketing: `Inter` & `Source Serif 4`. |
| **Client Auth / SSO** | `@supabase/supabase-js` | `^2.111.0` | Client-side Google OAuth popup/redirect session handling bridged to API backend. |
| **Testing: Unit & Component** | **Vitest** | `^3.2.7` | Blazing-fast test runner with `@testing-library/react` and `jsdom`. |
| **Testing: E2E & A11y** | **Playwright** + `@axe-core` | `^1.62.1` / `^4.12.1` | Cross-browser automated browser testing (Chromium, Firefox, WebKit) with automated WCAG accessibility audits. |
| **Linter & Formatter** | **ESLint 9** + **Prettier 3** | `9.39.5` / `3.9.6` | Modern flat ESLint configuration (`typescript-eslint`) and strict code formatting. |

### Frontend Architecture Patterns

1. **Dual-Mode Operation (`VITE_API_MODE`)**:
   - `VITE_API_MODE=mock` (Default): All views render instantly using rich, local mock fixtures (`TALENTS`, `PROJECTS`, `ORDERS`). Ideal for rapid UI prototyping, offline development, and zero-dependency testing.
   - `VITE_API_MODE=live`: The centralized [`apiClient`](file:///Users/oyeniyiadedoyin/Downloads/figj%20monol/monologg/apps/web/src/lib/api-client.ts) dispatches authenticated HTTP requests to the Fastify API.
2. **Session & Security Primitives**:
   - Access tokens are kept **in memory only** (preventing XSS persistence).
   - Long-lived rotating refresh tokens reside in `localStorage` under `monologg_refresh_token`.
   - Route guard [`RequireAuth.tsx`](file:///Users/oyeniyiadedoyin/Downloads/figj%20monol/monologg/apps/web/src/app/RequireAuth.tsx) transparently protects private dashboards while leaving public storefronts (`/[handle]`) and guest checkout (`/book/:creatorId`) open.
3. **Design System & Token Architecture**:
   - Token cascading occurs via root CSS classes: `.role-talent` injects Red-dominant accents, `.role-client` injects Purple-dominant accents, and `.dark` toggles high-contrast dark mode.
   - Universal form inputs and `<select>` controls are strictly calibrated (`h-[54px]`, custom SVG chevrons, 14px insets).

---

## 3. Backend Stack Specification (`apps/api`)

The backend is a high-throughput, secure REST API built with Fastify, Prisma ORM, and PostgreSQL, designed following the **Hexagonal / Pluggable Provider Architecture**.

### Core Technology Matrix

| Layer | Technology | Version | Purpose & Architecture |
|---|---|---|---|
| **Language** | **TypeScript** | `^5.9.3` | Typed API contracts, request payloads, and service interfaces. |
| **Runtime** | **Node.js (ESM)** | `>=20.0.0` | Native ECMAScript Modules (`"type": "module"`) using standard Node APIs. |
| **Execution Engine** | `tsx` | `^4.23.1` | Zero-config TypeScript execution with native Node env-file injection in dev. |
| **Web Framework** | **Fastify** | `^5.4.0` | Ultra-low overhead, schema-driven Node.js HTTP framework. |
| **CORS Middleware** | `@fastify/cors` | `^10.0.2` | Configurable Cross-Origin Resource Sharing policy for web frontend. |
| **Security Headers** | `@fastify/helmet` | `^13.0.1` | Robust HTTP security headers including Content Security Policy (`default-src 'none'`). |
| **Rate Limiter** | `@fastify/rate-limit` | `^10.2.2` | In-memory and Redis-backed rate limiting across global and sensitive routes (auth, checkout). |
| **HTTP Errors** | `@fastify/sensible` | `^6.0.3` | Standardized HTTP error generation and status code handling. |
| **Logging** | **Pino** / `pino-pretty` | `^13.0.0` | High-performance JSON structured logging with PII log-redaction filters. |
| **Database** | **PostgreSQL** | `15+` | Relational database hosted on **Supabase** with transaction pooling. |
| **ORM & Migrations** | **Prisma ORM** | `^6.19.3` | Schema declaration, declarative SQL migrations, type-safe queries via `@prisma/client`. |
| **Database Driver** | `pg` | `^8.22.0` | Direct Postgres connection and health check verification driver. |
| **Validation** | **Zod** | `^3.23.8` | Boot-time environment validation (`env.ts`) and request body/param parsing. |
| **Password Security** | **Argon2** (`argon2id`) | `^0.45.1` | State-of-the-art password hashing resistant to GPU cracking. |
| **JWT Tokens** | **jsonwebtoken** | `^9.0.3` | HS256 access and refresh tokens with DB-backed reuse and revocation tracking. |
| **Background Queues** | **BullMQ** | `^5.81.2` | Distributed asynchronous task queue for email, SMS, and media indexing jobs. |
| **In-Memory Store** | **ioredis** | `^5.11.1` | High-throughput Redis client powering BullMQ and shared caching. |
| **Document Engine** | **pdf-lib** | `^1.17.1` | Server-side vector PDF generation for automated Performer Media Kits. |
| **Observability** | **Sentry Node** | `^10.69.0` | Distributed error capture, performance profiling, and transaction tracing. |
| **Testing** | **Vitest** | `^3.2.7` | Fast parallel unit and integration test runner (`580+` passing tests). |

---

## 4. Shared Contract Package (`packages/types`)

Located in [`packages/types`](file:///Users/oyeniyiadedoyin/Downloads/figj%20monol/monologg/packages/types/package.json), this library ensures total compile-time and runtime agreement across frontend and backend:

* **Zod Schemas**: Reusable validation objects for Auth payloads, Rate Cards, Bookings, Availability Blocks, and Physical Attributes.
* **TypeScript Types**: Inferred types (`z.infer<typeof ...>`) guaranteeing that changes in backend payload formats immediately trigger typecheck errors in the frontend if unhandled.

---

## 5. External Integrations & Provider Seam Matrix

Monologg employs a **Pluggable Provider Pattern**: every external third party is wrapped in an abstract TypeScript interface and instantiated via a factory that checks `src/config/env.ts`. In development or offline test mode, all providers default to `"mock"`, allowing 100% test passes without real API credentials.

```
                      ┌──────────────────────┐
                      │ Fastify REST Handler │
                      └──────────┬───────────┘
                                 │
                     ┌───────────▼───────────┐
                     │ Abstract Provider Seam│
                     └─────┬───────────┬─────┘
                           │           │
       ENV Provider="mock" │           │ ENV Provider="paystack" / "stripe"
                           ▼           ▼
                   ┌────────────┐ ┌──────────────┐
                   │ Mock Engine│ │ Real Network │
                   └────────────┘ └──────────────┘
```

| Provider Category | Interface Name | Production Implementation | Dev / Test Fallback | Purpose & Protocol |
|---|---|---|---|---|
| **Payments & Escrow** | `PaymentProvider` | **Paystack** (Primary), Stripe, Airwallex | `PaymentMockProvider` | Card/USSD/Bank transfers, escrow holding, release payouts, HMAC-SHA512 webhooks. |
| **Identity / KYC** | `KycProvider` | **Smile Identity** | `KycMockProvider` | Government ID verification, biometric selfie comparison, KYC audit trail. |
| **AI Style Tagging** | `AiTaggingProvider` | **OpenAI** (Vision / Audio APIs) | `AiTaggingMockProvider` | Analyzes performer media files to generate AI vibe & style tags. |
| **Calendar & Video** | `CalendarProvider` | **Google Calendar & Meet** | `CalendarMockProvider` | OAuth2 sync, busy-time checking, and automatic Google Meet video room creation. |
| **Notifications** | `NotifyProvider` | **SendGrid** (Email) + **Twilio** (SMS) | `NotifyMockProvider` | Escrow transaction alerts, booking receipts, automated OTP dispatch. |
| **Background Jobs** | `JobQueueProvider` | **BullMQ + Redis** | `MockJobQueueProvider` | Async retrying queues for non-blocking notification and indexing pipelines. |
| **Storage** | `StorageProvider` | **AWS S3 / Supabase Storage** | `MockStorageProvider` | Presigned URLs for media headshots, voice demos, and verification recordings. |
| **Virus Scanner** | `ScannerProvider` | **ClamAV Daemon** | `MockScannerProvider` | Stream-scans uploaded PDF media kits and attachments for malicious signatures. |

---

## 6. Database Schema & Data Models (Prisma)

The PostgreSQL database is defined in [`apps/api/prisma/schema.prisma`](file:///Users/oyeniyiadedoyin/Downloads/figj%20monol/monologg/apps/api/prisma/schema.prisma) (767 lines, 15 core models):

1. **User & Identity**: `User`, `UserActivity`, `AuthEvent`, `RefreshToken`, `TermsAcceptance`.
2. **Talent & Profiles**: `Creator`, `MediaAsset`, `RateCard`, `AvailabilityBlock`, `CalendarEvent`, `MediaKit`, `VerificationRecording`, `PhysicalAttributes`.
3. **Clients & Casting**: `Client`, `Brief`, `Application`.
4. **Bookings & Escrow**: `Booking`, `Payment`, `PaymentEvent`, `OrderRoom`, `Message`.
5. **Security & Financial**: `WithdrawalRequest`, `WithdrawalOtp`, `KycCheck`, `CalendarConnection`.

### Strict Financial Invariants
* **Zero Float Rule**: All financial numbers (`baseAmount`, `talentFeeAmount`, `clientFeeAmount`, `budgetAmount`) are stored strictly as **integers representing minor units** (kobo, cents) alongside an ISO currency code string (`NGN`, `USD`, `GBP`). Floats are strictly prohibited.
* **Escrow State Machine**: Transitions (`INITIATED` → `ESCROW_LOCKED` → `RELEASING` → `RELEASED`) are guarded by database advisory locks and idempotent webhook event verification (`paymentId, type, eventId`).

---

## 7. Operational Commands & Build Scripts

### Workspace Root (`monologg/`)
* `pnpm dev`: Starts the Vite web development server (`http://localhost:5173`).
* `pnpm api:dev`: Starts the Fastify API with hot reload and env loading (`http://localhost:3001`).
* `pnpm typecheck`: Typechecks all monorepo packages (`@monologg/web`, `@monologg/api`, `@monologg/types`).
* `pnpm test`: Runs both Web and API Vitest test suites.
* `pnpm build`: Produces production bundles for deployment.

### Containerization (`Docker`)
* `docker-compose up`: Boots the containerized backend API, PostgreSQL 15, and Redis instance locally with pre-configured health checks.
