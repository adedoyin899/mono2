import { wait } from './_helpers.mjs';
const R = 'client';
const adv = re => async p => { await p.getByRole('button', { name: re }).first().click({ timeout: 8000 }); await wait(p, 1100); };
const nextBtn = /^(Continue|Proceed|Review|Pay|Confirm)/i;
const cont = /^Continue/;
const sumFilled = async p => { await p.getByPlaceholder(/Sahara Fintech/).fill('Nike Q1 Campaign Voice-Over'); await p.getByRole('button', { name: /Online \/ Remote/ }).first().click(); await p.getByPlaceholder(/Key instructions/).fill('60s warm VO, two takes, deliver WAV.').catch(() => {}); await wait(p, 600); };
const toReview = async p => { await sumFilled(p); await adv(/Continue to Review/)(p); };
const agree = async p => { const c = p.getByRole('checkbox').first(); if (await c.count()) await c.check({ force: true }).catch(() => {}); else await p.getByText(/I agree|agree to/i).first().click({ force: true }).catch(() => {}); await wait(p, 600); };
const pickSlot = async p => { await p.locator('button:not([disabled])').filter({ hasText: /^(1[1-9]|2[0-9])$/ }).first().click({ timeout: 8000 }); await wait(p, 800); await p.locator('button:not([disabled])').filter({ hasText: /^\d\d:\d\d$/ }).first().click({ timeout: 8000 }); await wait(p, 800); };
const fillBrief = async p => { for (const [ph, v] of [[/title|name/i, 'Nike Q1 Campaign Voice-Over'], [/describe|brief|details|notes/i, 'Warm 60s voice-over, two takes, WAV delivery.']]) { const f = p.locator('input[type=text], textarea').filter({ has: p.locator(':scope') }).first(); } await p.locator('input[type=text]').first().fill('Nike Q1 Campaign Voice-Over').catch(() => {}); await p.locator('textarea').first().fill('Warm 60s voice-over, two takes, WAV delivery.').catch(() => {}); await wait(p, 600); };
const fillContact = async p => { const t = p.locator('input[type=text]'); if (await t.count()) await t.first().fill('Tunde Bakare').catch(() => {}); const e = p.locator('input[type=email]'); if (await e.count()) await e.first().fill('tunde@filmcraft.ng').catch(() => {}); const ph = p.locator('input[type=tel]'); if (await ph.count()) await ph.first().fill('08031234567').catch(() => {}); await agree(p); await wait(p, 600); };
const C = '8 Checkout', B = '12 Guest booking';
export default [
  { name: 'co-summary', folder: C, title: 'Checkout — booking summary', url: '/checkout', role: R },
  { name: 'co-summary-filled', folder: C, title: 'Checkout — details entered', url: '/checkout', role: R, steps: sumFilled },
  { name: 'co-review', folder: C, title: 'Checkout — review & agreement', url: '/checkout', role: R, steps: toReview },
  { name: 'co-review-agreed', folder: C, title: 'Checkout — agreement accepted', url: '/checkout', role: R, steps: async p => { await toReview(p); await agree(p); } },
  { name: 'co-payment', folder: C, title: 'Checkout — payment', url: '/checkout', role: R, steps: async p => { await toReview(p); await agree(p); await adv(nextBtn)(p); } },
  { name: 'book-slot-selected', folder: B, title: 'Guest booking — slot selected', url: '/book/seed-creator-adaeze', steps: pickSlot },
  { name: 'book-brief', folder: B, title: 'Guest booking — project brief', url: '/book/seed-creator-adaeze', steps: async p => { await pickSlot(p); await adv(cont)(p); } },
  { name: 'book-agreement', folder: B, title: 'Guest booking — contact & agreement', url: '/book/seed-creator-adaeze', steps: async p => { await pickSlot(p); await adv(cont)(p); await fillBrief(p); await adv(cont)(p); } },
  { name: 'book-payment', folder: B, title: 'Guest booking — escrow payment', url: '/book/seed-creator-adaeze', steps: async p => { await pickSlot(p); await adv(cont)(p); await fillBrief(p); await adv(cont)(p); await fillContact(p); await adv(cont)(p); } },
  { name: 'book-contact-filled', folder: B, title: 'Guest booking — contact filled', url: '/book/seed-creator-adaeze', steps: async p => { await pickSlot(p); await adv(cont)(p); await fillBrief(p); await adv(cont)(p); await fillContact(p); } },
  { name: 'co-paystack', folder: C, title: 'Checkout — Paystack secure checkout', url: '/checkout', role: R, isolate: true, steps: async p => { await p.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => (t >= 900 && t <= 4000 ? 0 : st(f, t, ...a)); }); await p.reload({ waitUntil: 'networkidle' }); await wait(p, 800); await toReview(p); await agree(p); await adv(nextBtn)(p); await adv(/Pay|Confirm|Escrow|Fund/i)(p); } },
];
