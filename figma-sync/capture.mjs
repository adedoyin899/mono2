// Usage: node capture.mjs <outDir> <name>=<path> [<name>=<path> ...]
// Captures each route at desktop (1440x972) and mobile (430x844): D JSON (light+dark pairs) + screenshot.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
const require = createRequire('/home/user/mono2/monologg/apps/web/');
const { chromium } = require('playwright');
const ser = fs.readFileSync(new URL('./ser.js', import.meta.url), 'utf8');
const [out, ...jobs] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const BASE = process.env.BASE || 'http://localhost:5173';
const VPS = { d: { width: 1440, height: 972 }, m: { width: 430, height: 844 } };

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });
for (const vp of ['d', 'm']) {
  const ctx = await browser.newContext({ viewport: VPS[vp], deviceScaleFactor: 1, isMobile: vp === 'm', hasTouch: vp === 'm' });
  const page = await ctx.newPage();
  for (const job of jobs) {
    const [name, p] = job.split('=');
    await page.goto(BASE + p, { waitUntil: 'networkidle' });
    await page.waitForTimeout(800);
    // scroll through to trigger lazy/in-view animations, then back to top
    await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 600) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); } scrollTo(0, 0); });
    await page.waitForTimeout(400);
    await page.addScriptTag({ content: ser });
    const D = await page.evaluate(v => window.MLGSER.run({ vp: v }), vp);
    const base = path.join(out, `${name}.${vp}`);
    fs.writeFileSync(base + '.json', JSON.stringify(D));
    await page.screenshot({ path: base + '.png', fullPage: true });
    const nodes = (function c(l) { return l.reduce((a, n) => a + 1 + (n.k ? c(n.k) : 0), 0); })(D.k);
    console.log(name, vp, 'nodes', nodes, 'colors', D.C.length, 'styles', D.S.length, 'icons', Object.keys(D.I).length, 'graphics', Object.keys(D.G).length, 'bytes', JSON.stringify(D).length, 'h', D.dh);
  }
  await ctx.close();
}
await browser.close();
