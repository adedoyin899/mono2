import { ctab } from './_chelpers.mjs';
import { clickRole, clickText, seq, wait } from './_helpers.mjs';
const R = 'client';
const asClient = async p => { await p.getByRole('button', { name: /^Client$/ }).first().click({ timeout: 6000 }); await wait(p, 700); };
const fillC = async p => { await asClient(p); await p.getByPlaceholder(/Full Name|Company|Name/i).first().fill('FilmCraft Studios'); await p.getByPlaceholder('Email Address').fill('hello@filmcraft.ng'); await p.getByPlaceholder(/Create Password/).fill('Monologg2026!'); };
const E = '2 Sign up & sign in', O = '3 Onboarding', H = '4 Home', F = '5 Find performers', P = '6 My Projects';
export default [
  { name: 'c-auth-create-empty', folder: E, title: 'Welcome — create account (empty)', url: '/auth?mode=signup', steps: asClient },
  { name: 'c-auth-create-filled', folder: E, title: 'Create account (filled)', url: '/auth?mode=signup', steps: fillC },
  { name: 'c-auth-signin', folder: E, title: 'Sign in', url: '/auth?mode=signin', steps: asClient },
  { name: 'c-onb-1', folder: O, title: 'Step 1 — Tell us about you', url: '/onboarding/client' },
  { name: 'c-home', folder: H, title: 'Home — wallet & nudges', url: '/client', role: R },
  { name: 'c-home-fund', folder: H, title: 'Fund wallet', url: '/client', role: R, steps: clickRole(/Fund Wallet/) },
  { name: 'c-home-balance-hidden', folder: H, title: 'Balance hidden', url: '/client', role: R, steps: clickRole(/Hide balance/) },
  { name: 'c-home-notifications', folder: H, title: 'Notifications drawer', url: '/client', role: R, steps: clickRole(/View notifications/) },
  { name: 'c-find', folder: F, title: 'Find performers', url: '/client', role: R, steps: ctab('find') },
  { name: 'c-find-shortlisted', folder: F, title: 'Find performers — shortlist toggled', url: '/client', role: R, steps: seq(ctab('find'), clickRole(/^Shortlist Chidi/)) },
  { name: 'c-find-no-results', folder: F, title: 'Find performers — no results', url: '/client', role: R, steps: seq(ctab('find'), async p => { await p.getByRole('textbox').first().fill('zzzzzz'); await wait(p, 900); }) },
  { name: 'c-projects', folder: P, title: 'My projects', url: '/client', role: R, steps: ctab('projects') },
  { name: 'c-project-detail', folder: P, title: 'Project detail', url: '/client', role: R, steps: seq(ctab('projects'), clickRole(/View Project/, { ms: 1300 })) },
  { name: 'c-orders', folder: '9 Orders', title: 'Orders', url: '/client', role: R, steps: ctab('orders') },
  { name: 'c-shortlist', folder: '10 Shortlist', title: 'Shortlist', url: '/client', role: R, steps: ctab('shortlist') },
  { name: 'c-activity', folder: '11 Activity & analytics', title: 'Activity history', url: '/client', role: R, steps: ctab('activity') },
  { name: 'c-analytics', folder: '11 Activity & analytics', title: 'Hiring & budget analytics', url: '/client', role: R, steps: ctab('analytics') },
  { name: 'c-settings', folder: '13 Settings', title: 'Settings — main', url: '/settings?role=client', role: R },
  { name: 'c-transactions', folder: '14 Transactions', title: 'Transactions', url: '/transactions?role=client', role: R },
  { name: 'c-mkt-landing', folder: '1 Marketing & entry', title: 'Landing — signed in as client', url: '/', role: R },
  { name: 'c-mkt-account-menu', folder: '1 Marketing & entry', title: 'Account menu (client)', url: '/', role: R, vps: ['d'], steps: async p => { await p.getByRole('button', { name: /account|profile|FS|user/i }).first().click({ timeout: 6000 }); await wait(p, 900); } },
  { name: 'c-mkt-mobile-menu', folder: '1 Marketing & entry', title: 'Mobile menu (client)', url: '/', role: R, vps: ['m'], steps: async p => { await p.getByRole('button', { name: /menu/i }).first().click({ timeout: 6000 }); await wait(p, 900); } },
];
