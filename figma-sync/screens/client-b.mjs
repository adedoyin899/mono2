import { ctab } from './_chelpers.mjs';
import { seq, wait } from './_helpers.mjs';
import orderScreens from './perf-orderroom.mjs';
const R = 'client';
const KEY = 'monologg_client_onboarding_draft';
const seedOnb = o => async p => { await p.evaluate(([k, d]) => localStorage.setItem(k, JSON.stringify(d)), [KEY, Object.assign({ step: 2, brandName: 'FilmCraft Studios', category: 'Creative Agency', website: 'https://filmcraft.ng', selectedCategories: [], hiringFrequency: '' }, o)]); await p.reload({ waitUntil: 'networkidle' }); await wait(p, 900); };
const book = seq(ctab('shortlist'), async p => { await p.getByRole('button', { name: /Book Now/ }).first().click({ timeout: 8000 }); await wait(p, 1500); });
const go = re => async p => { await p.getByRole('button', { name: re }).first().click({ timeout: 8000 }); await wait(p, 1100); };
const C = '8 Checkout';
export default [
  { name: 'c-onb-2', folder: '3 Onboarding', title: 'Step 2 — What do you hire for?', url: '/onboarding/client', steps: seedOnb({}) },
  { name: 'c-onb-2-selected', folder: '3 Onboarding', title: 'Step 2 — Crafts selected', url: '/onboarding/client', steps: seedOnb({ selectedCategories: ['actors', 'comedians', 'creators'], hiringFrequency: 'Monthly' }) },
  { name: 'c-checkout-summary', folder: C, title: 'Checkout — booking summary', url: '/client', role: R, steps: book },
  { name: 'c-checkout-review', folder: C, title: 'Checkout — review & agreement', url: '/client', role: R, steps: seq(book, go(/Continue|Review|Next|Proceed/i)) },
  { name: 'c-checkout-payment', folder: C, title: 'Checkout — payment', url: '/client', role: R, steps: seq(book, go(/Continue|Review|Next|Proceed/i), async p => { const c = p.getByRole('checkbox').first(); if (await c.count()) await c.check({ force: true }).catch(() => {}); await wait(p, 500); }, go(/Continue|Payment|Next|Proceed/i)) },
  { name: 'book-slot', folder: '12 Guest booking', title: 'Guest booking — choose slot', url: '/book/seed-creator-adaeze' },
  { name: 'c-set-settings-profile', folder: '13 Settings', title: 'Settings — Profile', url: '/settings?role=client', role: R, steps: go(/^Profile$/) },
  { name: 'c-set-billing', folder: '13 Settings', title: 'Settings — Billing / payment', url: '/settings?role=client', role: R, steps: go(/Payment|Billing/i) },
  { name: 'c-set-notifications', folder: '13 Settings', title: 'Settings — Notifications', url: '/settings?role=client', role: R, steps: go(/^Notifications$/) },
  { name: 'c-set-security', folder: '13 Settings', title: 'Settings — Security & privacy', url: '/settings?role=client', role: R, steps: go(/Security/) },
  { name: 'c-set-escrow', folder: '13 Settings', title: 'Settings — Escrow policy', url: '/settings?role=client', role: R, steps: go(/Escrow Policy/) },
  ...orderScreens.filter(s => ['or-review-client', 'or-revision', 'or-release-modal', 'or-complete', 'or-dispute'].includes(s.name)).map(s => Object.assign({}, s, { name: 'c' + s.name, role: R, title: s.title.replace('(client view)', '').trim() })),
];
