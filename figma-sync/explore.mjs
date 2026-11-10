import { chromium } from '/home/user/mono2/monologg/node_modules/.pnpm/node_modules/playwright/index.mjs';
const B = 'http://localhost:5173';
const out = {};
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' }).catch(() => chromium.launch());
const dump = async (p, key) => {
  await p.waitForTimeout(700);
  const d = await p.evaluate(() => {
    const vis = e => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none'; };
    const t = e => (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 50);
    return { url: location.pathname + location.search, h: [...document.querySelectorAll('h1,h2,h3')].filter(vis).map(t).filter(Boolean).slice(0, 25), btn: [...new Set([...document.querySelectorAll('button,a,[role=tab]')].filter(vis).map(t).filter(Boolean))].slice(0, 120), height: document.documentElement.scrollHeight };
  });
  out[key] = d;
  await p.screenshot({ path: `explore/${key}.png` });
};
for (const [role, vp] of [['performer', { width: 1440, height: 972 }], ['client', { width: 1440, height: 972 }], ['performer-m', { width: 430, height: 844 }], ['client-m', { width: 430, height: 844 }]]) {
  const ctx = await browser.newContext({ viewport: vp }); const p = await ctx.newPage();
  await p.goto(B + '/auth?mode=signup'); await p.waitForTimeout(800);
  const label = role.startsWith('performer') ? 'Performer' : 'Client';
  await p.locator('button', { hasText: new RegExp('^\\s*' + label + '\\s*$') }).last().click().catch(e => console.log('nologin', role, e.message.slice(0, 80)));
  await p.waitForTimeout(1200); await dump(p, role + '_home');
  const navTexts = await p.evaluate(() => [...document.querySelectorAll('aside button, nav button, aside a, nav a, [class*=fixed] button')].filter(e => e.getBoundingClientRect().width > 0).map(e => (e.innerText || e.getAttribute('aria-label') || '').trim()).filter(Boolean));
  out[role + '_nav'] = navTexts;
  for (const n of [...new Set(navTexts)].slice(0, 14)) {
    if (/sign out|log out|dark|light|portal/i.test(n)) continue;
    const loc = p.locator('aside button, nav button, aside a, nav a, [class*=fixed] button').filter({ hasText: new RegExp('^\\s*'+n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*$') }).first();
    if (!(await loc.count())) continue;
    await loc.click().catch(() => {}); await dump(p, role + '_' + n.replace(/\W+/g, '_').slice(0, 20));
  }
  await ctx.close();
}
for (const path of ([] && ['/', '/product', '/pricing', '/resources', '/legal/terms', '/legal/privacy', '/legal/cookies', '/auth', '/onboarding', '/onboarding/client', '/emeka', '/book/1', '/set-password'])) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 972 } }); const p = await ctx.newPage();
  await p.goto(B + path); await dump(p, 'pub' + path.replace(/\W+/g, '_')); await ctx.close();
}
await browser.close();
import fs from 'fs'; fs.writeFileSync('explore.json', JSON.stringify(out, null, 1));
console.log(Object.keys(out).join('\n'));
