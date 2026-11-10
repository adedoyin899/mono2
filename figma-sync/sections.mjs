import { chromium } from '/home/user/mono2/monologg/node_modules/.pnpm/node_modules/playwright/index.mjs';
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome' });
for (const path of ['/', '/product', '/pricing', '/resources']) {
  const p = await (await b.newContext({ viewport: { width: 1440, height: 972 } })).newPage();
  await p.goto('http://localhost:5173' + path); await p.waitForTimeout(1500);
  const r = await p.evaluate(() => ({ H: document.documentElement.scrollHeight, s: [...document.querySelectorAll('h1,h2')].map(h => Math.round(h.getBoundingClientRect().top + scrollY) + ' ' + h.innerText.replace(/\s+/g, ' ').slice(0, 50)), btn: [...document.querySelectorAll('button')].map(x => x.innerText.trim()).filter(t => t && t.length < 30).slice(0, 60) }));
  console.log('==', path, r.H); console.log(r.s.join('\n')); console.log('buttons:', [...new Set(r.btn)].join(' | '));
}
await b.close();
