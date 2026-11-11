// Shared helpers for performer dashboard screens.
const D = { home: 'Dashboard', storefront: 'My Profile', rates: 'Rate Cards', calendar: 'Availability', projects: 'Projects', orders: 'Orders', earnings: 'Earnings', analytics: 'Analytics' };
const M = { home: 'Home', orders: 'Orders', rates: 'Rates', projects: 'Projects', calendar: 'Calendar' };
export const wait = (p, ms = 800) => p.waitForTimeout(ms);
export async function goTab(page, vp, key) {
  if (vp === 'd') {
    await page.getByRole('button', { name: new RegExp('^' + D[key] + '$') }).first().click({ timeout: 8000 });
  } else if (M[key]) {
    await page.getByRole('button', { name: new RegExp('^' + M[key] + '$') }).last().click({ timeout: 8000 });
  } else {
    await page.getByText('More', { exact: true }).last().click({ timeout: 8000 });
    await page.waitForTimeout(700);
    const names = { storefront: /Profile|Storefront/, earnings: /Earnings/, analytics: /Analytics/ }[key];
    await page.getByText(names).last().click({ timeout: 8000 });
  }
  await page.waitForTimeout(1300);
}
export const tab = key => async (page, vp) => goTab(page, vp, key);
export const clickRole = (name, o = {}) => async page => { await page.getByRole(o.role || 'button', { name, exact: o.exact }).first().click({ timeout: 8000 }); await page.waitForTimeout(o.ms || 900); };
export const clickText = (text, o = {}) => async page => { await page.getByText(text, { exact: o.exact !== false }).first().click({ timeout: 8000 }); await page.waitForTimeout(o.ms || 900); };
export const seq = (...fns) => async (page, vp) => { for (const f of fns) await f(page, vp); };
