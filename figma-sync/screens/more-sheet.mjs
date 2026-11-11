import { wait } from './_helpers.mjs';
const more = async p => { await p.getByText('More', { exact: true }).last().click({ timeout: 8000 }); await wait(p, 1000); };
export default [
  { name: 'p-more-sheet', folder: '4 Home', title: 'More sheet', url: '/dashboard', role: 'performer', vps: ['m'], steps: more },
  { name: 'c-more-sheet', folder: '4 Home', title: 'More sheet', url: '/client', role: 'client', vps: ['m'], steps: more },
];
