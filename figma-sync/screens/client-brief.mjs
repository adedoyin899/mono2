import { wait } from './_helpers.mjs';
const R = 'client', F = '7 Post a brief';
const btn = (p, re, o = {}) => p.getByRole('button', { name: re }).first().click({ timeout: 6000, ...o });
const s1 = async p => { await p.getByPlaceholder(/Nike Q1/).fill('Nike Q1 Campaign Voice-Over'); await btn(p, /Commercial \/ Ad Campaign/); await btn(p, /Online \/ Remote/); await wait(p, 500); };
const next = async p => { await p.getByRole('button', { name: /^Continue/ }).first().click({ timeout: 6000 }); await wait(p, 900); };
const s2 = async p => { await p.getByRole('button', { name: /Voice|Actor|Compere|Comedian|Artist|Creator|Speaker/i }).first().click({ timeout: 6000 }).catch(() => {}); await wait(p, 500); const t = p.getByPlaceholder(/Lagos, Abuja, or Remote/); if (await t.count()) await t.fill('Remote'); const d = p.getByPlaceholder(/Describe your project/); if (await d.count()) await d.fill('A warm, authoritative 60-second voice-over for the Nike Q1 campaign across radio and social.'); await wait(p, 500); };
const s4 = async p => { const c = p.getByRole('checkbox').first(); if (await c.count()) await c.check({ force: true }).catch(() => {}); else await p.getByText(/I agree|agree to/i).first().click({ force: true }).catch(() => {}); await wait(p, 600); };
const S = (name, title, steps) => ({ name, folder: F, title, url: '/brief', role: R, steps });
export default [
  S('brief-1-empty', 'Step 1 — Project details (empty)', async () => {}),
  S('brief-1-filled', 'Step 1 — Project details (filled)', s1),
  S('brief-2-requirements', 'Step 2 — Requirements', async p => { await s1(p); await next(p); }),
  S('brief-2-filled', 'Step 2 — Requirements (filled)', async p => { await s1(p); await next(p); await s2(p); }),
  S('brief-3-assets', 'Step 3 — Assets', async p => { await s1(p); await next(p); await s2(p); await next(p); }),
  S('brief-4-agreement', 'Step 4 — Review & agreement', async p => { await s1(p); await next(p); await s2(p); await next(p); await next(p); }),
  S('brief-4-agreed', 'Step 4 — Agreement accepted', async p => { await s1(p); await next(p); await s2(p); await next(p); await next(p); await s4(p); }),
  S('brief-5-budget', 'Step 5 — Budget & publish', async p => { await s1(p); await next(p); await s2(p); await next(p); await next(p); await s4(p); await next(p); }),
  S('brief-5-card', 'Step 5 — Fund with Paystack card', async p => { await s1(p); await next(p); await s2(p); await next(p); await next(p); await s4(p); await next(p); await p.getByText(/Paystack Card/).first().click({ timeout: 6000 }); await wait(p, 800); }),
  S('brief-published', 'Brief published', async p => { await s1(p); await next(p); await s2(p); await next(p); await next(p); await s4(p); await next(p); await p.getByRole('button', { name: /Publish Project/ }).first().click({ timeout: 6000 }); await wait(p, 2200); }),
];
