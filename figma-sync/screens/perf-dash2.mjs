import { tab, clickRole, clickText, seq, wait } from './_helpers.mjs';
const R = 'performer';
const A = '7 Availability', J = '8 Projects', O = '9 Orders', E = '10 Earnings', N = '11 Analytics';
const day = n => async p => { await p.getByRole('button', { name: new RegExp('^' + n + '$') }).first().click({ timeout: 8000 }); await wait(p, 900); };
const rday = n => async p => { await p.getByRole('button', { name: new RegExp('^' + n + '$') }).first().click({ button: 'right', timeout: 8000 }); await wait(p, 900); };
const openFintech = seq(tab('projects'), async p => { await p.getByRole('button', { name: /^Fintech Explainer Series/ }).first().click({ timeout: 8000 }); await wait(p, 1300); });
const proj = seq(tab('projects'), clickText('Nike Q1 Campaign', { exact: false, ms: 1200 }));
export default [
  { name: 'cal-month', folder: A, title: 'Availability — month', url: '/dashboard', role: R, steps: tab('calendar') },
  { name: 'cal-week', folder: A, title: 'Availability — week', url: '/dashboard', role: R, steps: seq(tab('calendar'), clickRole(/^Week$/)) },
  { name: 'cal-day', folder: A, title: 'Availability — day', url: '/dashboard', role: R, steps: seq(tab('calendar'), clickRole(/^Day$/)) },
  { name: 'cal-sync-modal', folder: A, title: 'Google Calendar sync modal', url: '/dashboard', role: R, steps: seq(tab('calendar'), clickRole(/Connect Google Calendar/)) },
  { name: 'cal-context-menu', folder: A, title: 'Right-click menu', url: '/dashboard', role: R, steps: seq(tab('calendar'), rday(12)) },
  { name: 'cal-day-selected', folder: A, title: 'Day selected — add slot / event', url: '/dashboard', role: R, steps: seq(tab('calendar'), day(12)) },
  { name: 'proj-browse', folder: J, title: 'Projects — browse', url: '/dashboard', role: R, steps: tab('projects') },
  { name: 'proj-filters', folder: J, title: 'Projects — filter modal', url: '/dashboard', role: R, steps: seq(tab('projects'), async p => { await p.getByText('Filters', { exact: true }).first().scrollIntoViewIfNeeded(); await p.getByText('Filters', { exact: true }).first().click({ force: true, timeout: 8000 }); await wait(p, 900); }) },
  { name: 'proj-my-applications', folder: J, title: 'My applications', url: '/dashboard', role: R, steps: seq(tab('projects'), clickRole(/My Applications/)) },
  { name: 'proj-no-results', folder: J, title: 'Projects — no results', url: '/dashboard', role: R, steps: seq(tab('projects'), async p => { await p.getByPlaceholder(/Search projects/).fill('zzzzzz'); await wait(p, 900); }) },
  { name: 'proj-detail-applied', folder: J, title: 'Project detail — applied (Nike)', url: '/dashboard', role: R, steps: proj },
  { name: 'proj-detail-closed', folder: J, title: 'Project detail — applications closed', url: '/dashboard', role: R, steps: seq(tab('projects'), clickText('Film Auditions', { exact: false, ms: 1200 })) },
  { name: 'proj-detail-open', folder: J, title: 'Project detail — open to apply', url: '/dashboard', role: R, steps: seq(tab('projects'), async p => { await p.getByRole('button', { name: /^Fintech Explainer Series/ }).first().click({ timeout: 8000 }); await wait(p, 1300); }) },
  { name: 'proj-detail-open-2', folder: J, title: 'Project detail — open (Tech Summit)', url: '/dashboard', role: R, steps: seq(tab('projects'), clickText('Tech Summit', { exact: false, ms: 1200 })) },
  { name: 'orders-list', folder: O, title: 'Orders — chat / list view', url: '/dashboard', role: R, steps: tab('orders') },
  { name: 'orders-cards', folder: O, title: 'Orders — detailed cards', url: '/dashboard', role: R, steps: seq(tab('orders'), clickRole(/Detailed Cards View/)) },
  { name: 'earn-default', folder: E, title: 'Earnings', url: '/dashboard', role: R, steps: tab('earnings') },
  { name: 'earn-withdraw', folder: E, title: 'Withdraw — amount', url: '/dashboard', role: R, steps: seq(tab('earnings'), clickRole(/Withdraw Funds/)) },
  { name: 'analytics-default', folder: N, title: 'Analytics — 6 months', url: '/dashboard', role: R, steps: tab('analytics') },
  { name: 'analytics-reviews', folder: N, title: 'Reviews modal', url: '/dashboard', role: R, steps: seq(tab('analytics'), clickText('Reviews', { exact: true, ms: 1000 })) },
  { name: 'pd-tab-roles', folder: J, title: 'Project detail — Roles & requirements', url: '/dashboard', role: R, steps: seq(openFintech, clickText('Roles & Requirements', { exact: false })) },
  { name: 'pd-tab-script', folder: J, title: 'Project detail — Script & materials', url: '/dashboard', role: R, steps: seq(openFintech, clickText('Script & Materials', { exact: false })) },
  { name: 'pd-tab-escrow', folder: J, title: 'Project detail — Client & escrow', url: '/dashboard', role: R, steps: seq(openFintech, clickText('Client & Escrow', { exact: false })) },
  { name: 'pd-apply-pitch', folder: J, title: 'Apply — audition pitch entered', url: '/dashboard', role: R, steps: seq(openFintech, async p => { await p.getByPlaceholder(/Highlight relevant/).fill('I have 6 years of voice-over work for fintech and telco brands and can deliver a warm, conversational read.'); await wait(p, 600); }) },
  { name: 'pd-applied', folder: J, title: 'Application submitted', url: '/dashboard', role: R, steps: seq(openFintech, async p => { await p.getByPlaceholder(/Highlight relevant/).fill('I have 6 years of voice-over work for fintech and telco brands.'); await p.getByRole('button', { name: /Submit Application/ }).click({ timeout: 8000 }); await wait(p, 1500); }) },
];
