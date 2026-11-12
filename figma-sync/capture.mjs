// Usage: node capture.mjs <outDir> <screensFile.mjs> [nameFilterRegex]
// Each screen: { name, url, role?: 'performer'|'client', vps?: ['d','m'], steps?: async (page, vp)=>{}, sections?: true, folder? }
// Output per screen+vp: <name>.<vp>.json (D with Light/Dark colour pairs), .png, and meta.json / images/index.json.
import { createRequire } from 'module';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
const require = createRequire('/home/user/mono2/monologg/apps/web/');
const { chromium } = require('playwright');
const ser = fs.readFileSync(new URL('./ser.js', import.meta.url), 'utf8');
const [out, screensFile, filter] = process.argv.slice(2);
const screens = (await import(path.resolve(screensFile))).default;
const re = filter ? new RegExp(filter) : null;
fs.mkdirSync(path.join(out, 'images'), { recursive: true });
const BASE = process.env.BASE || 'http://localhost:5173';
const VPS = { d: { width: 1440, height: 972 }, m: { width: 430, height: 844 } };
const metaFile = path.join(out, 'meta.json');
const meta = fs.existsSync(metaFile) ? JSON.parse(fs.readFileSync(metaFile, 'utf8')) : {};

async function login(page, role) {
  await page.goto(BASE + '/auth?mode=signup', { waitUntil: 'networkidle' });
  // the demo buttons are the second Performer/Client pair on the page
  const label = role === 'client' ? 'Client' : 'Performer';
  const btns = page.getByRole('button', { name: label, exact: true });
  await btns.last().click();
  await page.waitForTimeout(1500);
}

function sectionsOf(page) {
  return page.evaluate(() => {
    const els = [...document.querySelectorAll('#root section, #root footer')].filter(e => !e.parentElement.closest('section') && e.getBoundingClientRect().height > 200);
    return els.map(e => { const h = e.querySelector('h1,h2,h3'); return { name: (e.id || (h && h.innerText) || e.tagName).toString().replace(/\s+/g, ' ').trim().slice(0, 40), top: Math.round(e.getBoundingClientRect().top + scrollY), h: Math.round(e.getBoundingClientRect().height) }; });
  });
}

const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args: ['--no-sandbox'] });
const imgs = new Map();
for (const vp of ['d', 'm']) {
  const todo = screens.filter(s => (s.vps || ['d', 'm']).includes(vp) && (!re || re.test(s.name)));
  const roles = [...new Set(todo.map(s => s.role || null))];
  for (const role of roles) {
    const ctx = await browser.newContext({ viewport: VPS[vp], deviceScaleFactor: 1, isMobile: vp === 'm', hasTouch: vp === 'm' });
    const page = await ctx.newPage();
    if (role) await login(page, role);
    for (const s of todo.filter(x => (x.role || null) === role)) {
      const mainPage = page; let page2 = null;
      try {
        if (s.isolate) { page2 = await ctx.newPage(); }
        const page = page2 || mainPage;
        await page.goto(BASE + s.url, { waitUntil: 'networkidle' });
        await page.waitForTimeout(700);
        if (s.steps) await s.steps(page, vp);
        await page.waitForTimeout(1500);
        await page.evaluate(async () => { for (let y = 0; y < document.documentElement.scrollHeight; y += 500) { scrollTo(0, y); await new Promise(r => setTimeout(r, 50)); } });
        if (!s.keepScroll) await page.evaluate(() => scrollTo(0, 0));
        await page.waitForTimeout(400);
        const base = path.join(out, `${s.name}.${vp}`);
        await page.screenshot({ path: base + '.png', fullPage: true });
        await page.addScriptTag({ content: ser });
        const D = page.__preD || await page.evaluate(v => window.MLGSER.run({ vp: v }), vp);
        delete page.__preD;
        fs.writeFileSync(base + '.json', JSON.stringify(D));
        const urls = new Set(); (function c(l) { for (const n of l) { (n.f || []).forEach(f => f && f.im && urls.add(f.im)); if (n.k) c(n.k); } })(D.k);
        urls.forEach(u => imgs.set(u, 1));
        const secs = s.sections ? await sectionsOf(page) : null;
        meta[`${s.name}.${vp}`] = { name: s.name, vp, folder: s.folder || '', title: s.title || s.name, dh: D.dh, bytes: JSON.stringify(D).length, sections: secs, images: [...urls] };
        console.log('OK', s.name, vp, 'bytes', meta[`${s.name}.${vp}`].bytes, 'h', D.dh, 'imgs', urls.size);
      } catch (e) { console.log('FAIL', s.name, vp, e.message.split('\n')[0]); }
      if (page2) await page2.close();
    }
    await ctx.close();
  }
}
// download raster images once
const idxFile = path.join(out, 'images', 'index.json');
const idx = fs.existsSync(idxFile) ? JSON.parse(fs.readFileSync(idxFile, 'utf8')) : {};
const rctx = await browser.newContext();
for (const u of imgs.keys()) {
  if (idx[u] || u.startsWith('data:')) continue;
  try {
    const r = await rctx.request.get(u.startsWith('http') ? u : BASE + u, { timeout: 30000 });
    if (!r.ok()) { console.log('IMG FAIL', u.slice(0, 80), r.status()); continue; }
    const buf = await r.body(); const ct = r.headers()['content-type'] || '';
    const ext = /png/.test(ct) ? 'png' : /webp/.test(ct) ? 'webp' : /gif/.test(ct) ? 'gif' : /svg/.test(ct) ? 'svg' : 'jpg';
    const f = crypto.createHash('sha1').update(u).digest('hex').slice(0, 12) + '.' + ext;
    fs.writeFileSync(path.join(out, 'images', f), buf); idx[u] = { file: f, bytes: buf.length, ct };
  } catch (e) { console.log('IMG FAIL', u.slice(0, 80), e.message.split('\n')[0]); }
}
fs.writeFileSync(idxFile, JSON.stringify(idx, null, 1));
fs.writeFileSync(metaFile, JSON.stringify(meta, null, 1));
await browser.close();
console.log('images', Object.keys(idx).length);
