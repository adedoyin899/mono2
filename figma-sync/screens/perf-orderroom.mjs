import { clickRole, clickText, seq, wait } from './_helpers.mjs';
const R = 'performer', F = '9 Orders & order room';
const open = async p => { await p.goto('http://localhost:5173/order/ORD-001', { waitUntil: 'networkidle' }); await wait(p, 1200); };
const sub = async p => { await p.getByRole('button', { name: /^Submit Deliverable$/ }).first().click({ timeout: 8000 }); await wait(p, 900); };
const submitAll = async p => { await sub(p); await p.getByRole('button', { name: /Use demo file/ }).click({ timeout: 6000 }); await wait(p, 600); await p.getByRole('button', { name: /^Submit Deliverable$/ }).last().click({ timeout: 6000 }); await wait(p, 1500); };
const toClient = async p => { await p.getByRole('button', { name: /^Client$/ }).first().click({ timeout: 6000 }); await wait(p, 1200); };
const S = (name, title, steps, extra = {}) => Object.assign({ name, folder: F, title, url: '/order/ORD-001', role: R, steps }, extra);
export default [
  S('or-deliverables', 'Order room — Deliverables (remote)', async () => {}),
  S('or-brief', 'Order room — Brief & files', clickRole(/Brief & Files/)),
  S('or-fees', 'Order room — Fee breakdown', async p => { await p.getByText(/Fee breakdown/).first().click({ force: true, timeout: 8000 }); await wait(p, 700); }, { vps: ['d'] }),
  S('or-submit-digital', 'Submit deliverable — digital files', sub),
  S('or-submit-staged', 'Submit deliverable — file staged', seq(sub, clickRole(/Use demo file/))),
  S('or-submit-onsite', 'Submit deliverable — onsite evidence', seq(sub, clickRole(/Onsite Gig/))),
  S('or-dispute', 'Order room — Dispute', clickRole(/^Dispute$/)),
  S('or-review', 'Order room — Review & 48h auto-release', submitAll),
  S('or-review-client', 'Order room — Review (client view)', seq(submitAll, toClient)),
  S('or-revision', 'Order room — Request revision', seq(submitAll, toClient, clickRole(/Request Revision/))),
  S('or-release-modal', 'Release payment — confirm', seq(submitAll, toClient, clickRole(/Release|Approve/))),
  S('or-complete', 'Order room — Complete & rating', seq(submitAll, toClient, clickRole(/Release|Approve/), async p => { await p.getByRole('button', { name: /Confirm Release/ }).click({ timeout: 6000 }); await wait(p, 1800); })),
];
