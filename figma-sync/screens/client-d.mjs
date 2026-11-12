import { wait } from './_helpers.mjs';
const R = 'client', B = '12 Guest booking', U = '/book/seed-creator-adaeze';
const adv = re => async p => { await p.getByRole('button', { name: re }).first().click({ timeout: 8000 }); await wait(p, 1200); };
const pickSlot = async p => { await p.locator('button:not([disabled])').filter({ hasText: /^(1[1-9]|2[0-9])$/ }).first().click({ timeout: 8000 }); await wait(p, 800); await p.locator('button:not([disabled])').filter({ hasText: /^\d\d:\d\d$/ }).first().click({ timeout: 8000 }); await wait(p, 800); };
const fillBrief = async p => { await p.getByPlaceholder(/Sahara Fintech/).fill('Nike Q1 Campaign Voice-Over'); const d = p.getByPlaceholder(/Describe your project/); if (await d.count()) await d.fill('Warm 60s voice-over, two takes, WAV delivery.'); await wait(p, 600); };
const fillContact = async p => { await p.getByPlaceholder('Your full name').fill('Tunde Bakare'); await p.getByPlaceholder('you@company.com').fill('tunde@filmcraft.ng'); await p.getByPlaceholder(/\+234 800/).fill('+234 803 123 4567'); const c = p.locator('input[type=checkbox]').first(); if (await c.count()) await c.check({ force: true }).catch(() => {}); await wait(p, 700); };
const toBrief = async p => { await pickSlot(p); await adv(/^Continue to Project Brief/)(p); };
const toContact = async p => { await toBrief(p); await fillBrief(p); await adv(/^Continue to (Contact|Agreement)/)(p); };
const toPayment = async p => { await toContact(p); await fillContact(p); await adv(/^Proceed to Payment/)(p); };
const payBtn = /Confirm & Deposit ₦/;
const slowTimers = async p => { await p.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => st(f, t >= 150 && t <= 20000 ? 600000 : t, ...a); }); await p.reload({ waitUntil: 'networkidle' }); await wait(p, 900); };
const S = (name, title, steps, extra = {}) => Object.assign({ name, folder: B, title, url: U, steps }, extra);
export default [
  S('book-brief-filled', 'Guest booking — project brief (filled)', async p => { await toBrief(p); await fillBrief(p); }),
  S('book-contact-filled2', 'Guest booking — contact & agreement (filled)', async p => { await toContact(p); await fillContact(p); }),
  S('book-payment2', 'Guest booking — escrow payment', toPayment),
  S('book-payment-paystack', 'Guest booking — pay with Paystack', async p => { await toPayment(p); await p.getByText(/Pay with Paystack/).first().click({ timeout: 8000 }); await wait(p, 800); }),
  S('book-processing', 'Guest booking — processing payment', async (p, vp) => { await toPayment(p); await p.addScriptTag({ path: '/home/user/mono2/figma-sync/ser.js' }); p.__preD = await p.evaluate(v => new Promise(resolve => { const mo = new MutationObserver(() => { if (/Processing Payment/.test(document.body.innerText)) { mo.disconnect(); document.querySelectorAll('[style*="opacity"]').forEach(e => { e.style.opacity = '1'; e.style.transform = 'none'; }); resolve(window.MLGSER.run({ vp: v })); } }); mo.observe(document.body, { childList: true, subtree: true, characterData: true }); document.querySelector('[aria-label^="Confirm & Deposit"]').click(); setTimeout(() => { mo.disconnect(); resolve(null); }, 4000); }), vp); if (!p.__preD) throw new Error('processing view not caught'); await wait(p, 100); }),
  S('book-confirmed', 'Guest booking — confirmed', async p => { await toPayment(p); await adv(payBtn)(p); await wait(p, 4500); }),
  S('book-unavailable', 'Guest booking — performer unavailable modal', async p => { await p.locator('button[title^="Booked"]').first().click({ timeout: 8000 }); await wait(p, 900); }),
  { name: 'book-set-password', folder: B, title: 'Guest booking — set password', url: '/set-password' },
  { name: 'co-confirmed2', folder: '8 Checkout', title: 'Checkout — booking confirmed', url: '/checkout', role: R, steps: async p => {
      await p.getByPlaceholder(/Sahara Fintech/).fill('Nike Q1 Campaign Voice-Over'); await p.getByRole('button', { name: /Online \/ Remote/ }).first().click(); await wait(p, 500);
      await adv(/Continue to Review/)(p); const c = p.getByRole('checkbox').first(); if (await c.count()) await c.check({ force: true }).catch(() => {}); await wait(p, 500);
      await adv(/^Proceed|^Continue/)(p); await adv(/^Pay ₦.*Paystack|Pay ₦/)(p); await wait(p, 1200);
      await p.getByRole('button', { name: /^Pay ₦/ }).last().click({ timeout: 8000 }).catch(() => {}); await wait(p, 5000); } },
];
