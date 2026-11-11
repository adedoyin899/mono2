import { clickRole, clickText, seq, wait } from './_helpers.mjs';
const R = 'performer';
const st = (name, folder, title, item, extra) => ({ name, folder, title, url: '/settings?role=talent', role: R, steps: item ? async p => { await p.getByRole('button', { name: item }).first().click({ timeout: 8000 }); await wait(p, 1000); if (extra) await extra(p); } : undefined });
const L = '16 Legal';
export default [
  st('set-main', '14 Settings', 'Settings — main'),
  st('set-profile', '14 Settings', 'Settings — Profile', /^Profile$/),
  st('set-personal', '14 Settings', 'Settings — Personal & craft details', /Personal Details/),
  st('set-physical', '14 Settings', 'Settings — Physical attributes', /Physical Attributes/),
  st('set-payment', '14 Settings', 'Settings — Payment details', /Payment details/),
  st('set-notifications', '14 Settings', 'Settings — Notifications', /^Notifications$/),
  st('set-security', '14 Settings', 'Settings — Security & privacy', /Security & Privacy/),
  st('set-escrow', '14 Settings', 'Settings — Escrow policy', /Escrow Policy/),
  st('set-terms', '14 Settings', 'Settings — Terms of service', /Terms of Service/),
  { name: 'set-delete-account', folder: '14 Settings', title: 'Settings — delete account', url: '/settings?role=talent', role: R, steps: async p => { await p.getByRole('button', { name: /Security & Privacy/ }).first().click({ timeout: 8000 }); await wait(p, 900); await p.getByText(/Delete Account/).first().click({ timeout: 8000 }); await wait(p, 900); } },
  { name: 'tx-detail', folder: '15 Transactions & support', title: 'Transaction detail', url: '/transactions?role=talent', role: R, steps: async p => { await p.getByText(/Booking #|Payout/).first().click({ timeout: 8000 }); await wait(p, 1000); } },
  { name: 'public-profile', folder: '13 Public profile', title: 'Public profile (what clients see)', url: '/adaeze-obi' },
  { name: 'tx-history', folder: '15 Transactions & support', title: 'Transactions', url: '/transactions?role=talent', role: R },
  { name: 'support-help', folder: '15 Transactions & support', title: 'Help & support', url: '/support', role: R },
  { name: 'media-kit', folder: '12 Media kit & verification', title: 'Media kit', url: '/media-kit', role: R },
  { name: 'verification', folder: '12 Media kit & verification', title: 'Verification video', url: '/verification', role: R },
  { name: 'legal-terms', folder: L, title: 'Terms of service', url: '/legal/terms' },
  { name: 'legal-privacy', folder: L, title: 'Privacy policy', url: '/legal/privacy' },
  { name: 'legal-cookies', folder: L, title: 'Cookie policy', url: '/legal/cookies' },
];
