// Client dashboard helpers (desktop sidebar / mobile bottom nav + More sheet).
const D = { home: 'Dashboard', find: 'Find Performers', projects: 'My Projects', orders: 'Orders', shortlist: 'Shortlist', activity: 'Activity', analytics: 'Analytics' };
const M = { home: 'Home', find: 'Find', projects: 'Projects', orders: 'Orders', shortlist: 'Saved' };
export async function goC(page, vp, key) {
  if (vp === 'd') await page.getByRole('button', { name: new RegExp('^' + D[key] + '$') }).first().click({ timeout: 8000 });
  else if (M[key]) await page.getByRole('button', { name: new RegExp('^' + M[key] + '$') }).last().click({ timeout: 8000 });
  else { await page.getByText('More', { exact: true }).last().click({ timeout: 8000 }); await page.waitForTimeout(700); await page.getByText(new RegExp('^' + D[key] + '$')).last().click({ timeout: 8000 }); }
  await page.waitForTimeout(1300);
}
export const ctab = key => async (page, vp) => goC(page, vp, key);
