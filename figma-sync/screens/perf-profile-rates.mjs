import { tab, clickRole, clickText, seq, wait } from './_helpers.mjs';
const R = 'performer';
const P = '5 My Profile', Q = '6 Rate cards';
export default [
  { name: 'profile-default', folder: P, title: 'My Profile', url: '/dashboard', role: R, steps: tab('storefront') },
  { name: 'profile-edit', folder: P, title: 'My Profile — in-page edit', url: '/dashboard', role: R, steps: seq(tab('storefront'), clickRole(/^Edit Profile$/)) },
  { name: 'profile-share', folder: P, title: 'Share profile', url: '/dashboard', role: R, steps: seq(tab('storefront'), clickRole(/Share/)) },
  { name: 'profile-upload-reel', folder: P, title: 'Upload reel', url: '/dashboard', role: R, steps: seq(tab('storefront'), clickRole(/Replace Reel/)) },
  { name: 'rates-list', folder: Q, title: 'Rate cards — list (2 of 2)', url: '/dashboard', role: R, steps: tab('rates') },
  { name: 'rates-edit', folder: Q, title: 'Rate cards — edit card', url: '/dashboard', role: R, steps: seq(tab('rates'), clickRole(/^Edit$/)) },
  { name: 'rates-new', folder: Q, title: 'Rate cards — new card', url: '/dashboard', role: R, steps: seq(tab('rates'), clickRole(/^Remove$/), async p => { await wait(p, 600); const c = p.getByRole('button', { name: /confirm|yes|remove/i }).last(); if (await c.count()) await c.click().catch(() => {}); await wait(p, 700); }, clickRole(/New|Add|Create/i)) },
  { name: 'rates-empty', folder: Q, title: 'Rate cards — empty', url: '/dashboard', role: R, steps: seq(tab('rates'), async p => { for (let i = 0; i < 2; i++) { await p.getByRole('button', { name: /^Remove$/ }).first().click({ timeout: 5000 }).catch(() => {}); await wait(p, 600); const c = p.getByRole('button', { name: /confirm|yes, remove|^remove$/i }).last(); if (await c.count()) await c.click().catch(() => {}); await wait(p, 700); } }) },
];
