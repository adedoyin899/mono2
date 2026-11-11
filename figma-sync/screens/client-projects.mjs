import { ctab } from './_chelpers.mjs';
import { seq, wait } from './_helpers.mjs';
const R = 'client', F = '6 My Projects';
const open = seq(ctab('projects'), async p => { await p.getByRole('button', { name: /View Project/ }).first().click({ timeout: 8000 }); await wait(p, 1500); });
const click = (re, ms = 1000) => async p => { await p.getByRole('button', { name: re }).first().click({ timeout: 8000 }); await wait(p, ms); };
const S = (name, title, steps) => ({ name, folder: F, title, url: '/client', role: R, steps: seq(open, steps) });
export default [
  S('cp-applicants', 'Project detail — Applicants & casting', async () => {}),
  S('cp-filter-shortlisted', 'Applicants — shortlisted filter', click(/^Shortlisted/)),
  S('cp-filter-rejected', 'Applicants — rejected filter (empty)', click(/^Rejected/)),
  S('cp-applicant-profile', 'Applicant profile & reels', click(/View Profile & Reels/, 1400)),
  S('cp-select-hire', 'Applicant — select / hire', click(/Select \/ Hire/, 1200)),
  S('cp-tab-overview', 'Project detail — Overview & brief', click(/Overview & Brief/)),
  S('cp-tab-roles', 'Project detail — Roles & requirements', click(/Roles & Requirements/)),
  S('cp-tab-script', 'Project detail — Script & materials', click(/Script & Materials/)),
  S('cp-tab-escrow', 'Project detail — Escrow & protection', click(/Escrow & Protection/)),
  S('cp-state-draft', 'Lifecycle — Draft', click(/^Draft$/)),
  S('cp-state-inprogress', 'Lifecycle — In progress', click(/^In Progress$/)),
  S('cp-state-review', 'Lifecycle — Review', click(/^Review$/)),
  S('cp-state-completed', 'Lifecycle — Completed', click(/^Completed$/)),
  S('cp-state-closed', 'Lifecycle — Closed', click(/^Closed$/)),
  S('cp-publish-escrow', 'Publish & fund escrow — modal', seq(click(/^Draft$/), click(/Publish & Fund Escrow/, 1300))),
  { name: 'cf-filters', folder: '5 Find performers', title: 'Find performers — filters', url: '/client', role: R, steps: seq(ctab('find'), async p => { await p.getByText('Filters', { exact: true }).first().click({ force: true, timeout: 8000 }); await wait(p, 1000); }) },
  { name: 'cf-profile', folder: '5 Find performers', title: 'Performer profile', url: '/client', role: R, steps: seq(ctab('find'), async p => { await p.getByText('Adaeze Obi', { exact: false }).first().click({ force: true, timeout: 8000 }); await wait(p, 1400); }) },
];
