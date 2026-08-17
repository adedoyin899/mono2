# Monologg (`mono2`) — Performing Arts Talent & Booking Platform

[![Deploy with Vercel](https://vercel.com/button)](https://mono2.vercel.app)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)
![React](https://img.shields.io/badge/React-18.3-61dafb)
![Fastify](https://img.shields.io/badge/Fastify-5.2-green)
![Prisma](https://img.shields.io/badge/Prisma-6.3-2D3748)

**Monologg** is a brief-to-booking pipeline and talent storefront platform for performing arts and the creator economy. It seamlessly connects verified creators (actors, voice artists, comedians, comperes) with hiring clients (casting directors, brand agencies, event leads).

---

## 🚀 Live Demo & Deployment

- **Production App**: [https://mono2.vercel.app](https://mono2.vercel.app)
- **Vercel Project Dashboard**: [https://vercel.com/adedoyin899s-projects/mono2](https://vercel.com/adedoyin899s-projects/mono2)
- **GitHub Repository**: [https://github.com/adedoyin899/mono2](https://github.com/adedoyin899/mono2)

---

## 🛠️ Tech Stack & Workspace Architecture

Monologg is structured as a high-performance **pnpm monorepo** located in the [`monologg/`](./monologg) directory:

| Workspace Package | Description | Stack |
|---|---|---|
| [`monologg/apps/web`](./monologg/apps/web) | Frontend Web Application & Client/Talent Shell | React 18, Vite 6, Tailwind CSS v4, Motion, Lucide Icons |
| [`monologg/apps/api`](./monologg/apps/api) | Full-Stack REST API Service & Providers | Fastify 5, Prisma 6, Postgres, Vitest, Supabase Auth Bridge |
| [`monologg/packages/types`](./monologg/packages/types) | Shared Type Definitions & Domain Interfaces | TypeScript |

---

## ✨ Key Features

- **Role-Adaptive Interface**: Seamless switching between Creator (Mono-Red theme) and Client (Mono-Purple theme).
- **Storefront & Media Kit**: Rich physical attributes, video reels, interactive style tag editor, and shareable booking links.
- **Project Brief & Escrow Pipeline**: 4-step brief creator, multi-currency budget inputs (`NGN`, `USD`, `GBP`, `EUR`, `GHS`, `KES`, `ZAR`), and Paystack-backed escrow payment flow.
- **Interactive Global Radar & Vector Map**: Real-time performer network visualization with location nodes (Lagos, Accra, Nairobi, Joburg, London, NY).
- **Google OAuth & Verification**: Real Supabase identity bridge, avatar persistence, and 2-step passcode withdrawal protection.

---

## 💻 Local Development Setup

```bash
# Clone the repository
git clone https://github.com/adedoyin899/mono2.git
cd mono2/monologg

# Install workspace dependencies
npx pnpm install

# Start local dev server (Web & API)
npm run dev

# Run full workspace typecheck
npm run typecheck

# Run test suite
npm run test

# Build production bundle
npm run build
```

---

## 📄 Handoff Documentation

Detailed technical documentation and session history are maintained in [`monologg/handoff/`](./monologg/handoff):

- [Implementation Log (`log.md`)](./monologg/handoff/log.md)
- [Implementation Plan (`implementation-plan.md`)](./monologg/handoff/implementation-plan.md)
- [Bug & Issue Log (`bug.md`)](./monologg/handoff/bug.md)
- [Design Architecture (`design.md`)](./monologg/handoff/design.md)
- [Process & Workflow (`process.md`)](./monologg/handoff/process.md)
