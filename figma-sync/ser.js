// DOM -> MLG renderer JSON serializer. Injected into the page; call window.MLGSER.run().
// Output: D = {vp,bg,dh,sy,C:[light hex],CD:[dark hex],S:[style tuples],I:{},G:{},k:[nodes]}
// Colours: every use is a "slot" (closure re-evaluated in dark mode), then deduped as (light,dark) pairs.
(function () {
  const cv = document.createElement('canvas'); cv.width = cv.height = 1;
  const cx = cv.getContext('2d', { willReadFrequently: true });
  const cc = new Map();
  const h2 = n => n.toString(16).padStart(2, '0');
  function hex(str) {
    if (!str) return null;
    if (cc.has(str)) return cc.get(str);
    cx.clearRect(0, 0, 1, 1); cx.fillStyle = '#000'; cx.fillStyle = str; cx.fillRect(0, 0, 1, 1);
    const d = cx.getImageData(0, 0, 1, 1).data;
    const r = d[3] === 0 ? null : h2(d[0]) + h2(d[1]) + h2(d[2]) + (d[3] < 255 ? h2(d[3]) : '');
    cc.set(str, r); return r;
  }
  const COLRE = /(?:rgba?|oklch|oklab|lab|lch|hsla?|color|color-mix)\((?:[^()]|\([^()]*\))*\)/g;
  function splitTop(s) { const out = []; let d = 0, cur = ''; for (const ch of s) { if (ch === '(') d++; if (ch === ')') d--; if (ch === ',' && d === 0) { out.push(cur.trim()); cur = ''; } else cur += ch; } if (cur.trim()) out.push(cur.trim()); return out; }

  let slots, S, Smap, I, G, count;
  const slot = get => { slots.push(get); return slots.length - 1; };
  const styleIdx = t => { const k = JSON.stringify(t); if (!Smap.has(k)) { Smap.set(k, S.length); S.push(t); } return Smap.get(k); };
  const hashStr = s => { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return (h >>> 0).toString(36); };

  const num = v => parseFloat(v) || 0;
  const docRect = el => { const r = el.getBoundingClientRect(); return [r.left + scrollX, r.top + scrollY, r.width, r.height]; };

  function colorSlot(el, prop, pseudo) { return slot(() => hex(getComputedStyle(el, pseudo || null)[prop])); }

  function parseGradient(el, bgi) {
    // returns {l|r, s:[[pos, slot]]} or null
    const m = bgi.match(/^(linear|radial)-gradient\((.*)\)$/s); if (!m) return null;
    const parts = splitTop(m[2]); const out = { s: [] };
    let first = parts[0], stopsFrom = 0;
    if (m[1] === 'linear') {
      const ang = first.match(/^(-?[\d.]+)deg/); const dir = first.match(/to (top|bottom|left|right)( (top|bottom|left|right))?/);
      if (ang) { out.l = parseFloat(ang[1]); stopsFrom = 1; }
      else if (dir) { const k = dir[1] + (dir[3] ? ' ' + dir[3] : ''); out.l = { top: 0, right: 90, bottom: 180, left: 270, 'top right': 45, 'right top': 45, 'bottom right': 135, 'right bottom': 135, 'bottom left': 225, 'left bottom': 225, 'top left': 315, 'left top': 315 }[k] ?? 180; stopsFrom = 1; }
      else { out.l = 180; if (/^in /.test(first)) stopsFrom = 1; }
    } else { out.r = /^(circle|ellipse|closest|farthest|at |[\d.]+(px|%))/.test(first) ? first.replace(/^in \S+\s*/, '') : ''; stopsFrom = out.r || /^in /.test(first) ? 1 : 0; out.r = out.r || ''; }
    const stops = parts.slice(stopsFrom); const n = stops.length;
    stops.forEach((st, i) => {
      const cm = st.match(COLRE); if (!cm) return;
      const pm = st.replace(cm[0], '').trim().match(/(-?[\d.]+)%/);
      const pos = pm ? parseFloat(pm[1]) / 100 : (n > 1 ? i / (n - 1) : 0);
      const idx = i;
      out.s.push([pos, slot(() => { const cur = splitTop(((getComputedStyle(el).backgroundImage.match(/gradient\((.*)\)/s) || [])[1]) || ''); const sp = cur.slice(stopsFrom)[idx] || ''; const c2 = sp.match(COLRE); return c2 ? hex(c2[0]) : null; })]);
    });
    return out.s.length ? out : null;
  }

  function shadows(el, cs) {
    const bs = cs.boxShadow; if (!bs || bs === 'none') return null;
    const out = [];
    splitTop(bs).forEach((sh, i) => {
      const cm = sh.match(COLRE); if (!cm) return;
      const rest = sh.replace(cm[0], '').trim(); const inset = /inset/.test(rest);
      const nums = rest.replace('inset', '').trim().split(/\s+/).map(num);
      const [x = 0, y = 0, blur = 0, spread = 0] = nums;
      const ci = slot(() => { const p = splitTop(getComputedStyle(el).boxShadow)[i] || ''; const c = p.match(COLRE); return c ? hex(c[0]) : null; });
      out.push([inset ? 1 : 0, x, y, blur, spread, ci]);
    });
    return out.length ? out : null;
  }

  function radius(cs, w, h) {
    const m = Math.min(w, h) / 2;
    const r = ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomRightRadius', 'borderBottomLeftRadius'].map(k => Math.min(m, num(cs[k])));
    if (r.every(v => v === 0)) return 0;
    return r.every(v => v === r[0]) ? r[0] : r;
  }

  function textStyle(el, cs) {
    const fam = (cs.fontFamily.split(',')[0] || 'Inter').replace(/["']/g, '').trim();
    const ls = cs.letterSpacing === 'normal' ? 0 : num(cs.letterSpacing);
    const lh = cs.lineHeight === 'normal' ? 0 : num(cs.lineHeight);
    const tdl = cs.textDecorationLine;
    const tt = cs.textTransform;
    return styleIdx([fam, num(cs.fontWeight) || 400, num(cs.fontSize), lh, ls, colorSlot(el, 'color'), cs.fontStyle === 'italic' ? 1 : 0, /line-through/.test(tdl) ? 's' : /underline/.test(tdl) ? 'u' : 0, tt === 'uppercase' ? 'U' : tt === 'lowercase' ? 'L' : tt === 'capitalize' ? 'T' : 0]);
  }

  function visible(el, cs) {
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.visibility === 'collapse') return false;
    if (num(cs.opacity) === 0) return false;
    return true;
  }

  function svgNode(el, cs, b) {
    const cl = (el.getAttribute('class') || '');
    const lm = cl.match(/lucide-([a-z0-9-]+)/);
    if (lm || /lucide/.test(cl)) {
      const name = lm ? lm[1] : 'icon-' + hashStr(el.innerHTML);
      if (!I[name]) I[name] = el.innerHTML;
      const fill = cs.fill && cs.fill !== 'none' ? colorSlot(el, 'fill') : undefined;
      const n = { t: 'i', ic: name, b, c: colorSlot(el, 'stroke'), sw: num(cs.strokeWidth) || 2 };
      if (fill !== undefined && hex(cs.fill)) n.fl = fill;
      return n;
    }
    // generic graphic: inline resolved colours
    const clone = el.cloneNode(true);
    const orig = [el, ...el.querySelectorAll('*')], cl2 = [clone, ...clone.querySelectorAll('*')];
    orig.forEach((o, i) => { const c = cl2[i]; const s = getComputedStyle(o); ['fill', 'stroke'].forEach(p => { const v = s[p]; if (v && v !== 'none') { const hx = hex(v); if (hx) c.setAttribute(p, '#' + hx.slice(0, 6)); } }); c.removeAttribute('class'); c.removeAttribute('style'); });
    clone.setAttribute('width', b[2]); clone.setAttribute('height', b[3]);
    if (!clone.getAttribute('viewBox')) clone.setAttribute('viewBox', `0 0 ${b[2]} ${b[3]}`);
    const markup = new XMLSerializer().serializeToString(clone);
    const h = hashStr(markup + b[2] + b[3]); G[h] = markup;
    return { t: 'g', h, b };
  }

  function zOf(cs) { const z = parseInt(cs.zIndex); return isNaN(z) ? 0 : z; }

  function textNodes(el, cs, out, fixed) {
    const rng = document.createRange();
    for (const ch of el.childNodes) {
      if (ch.nodeType !== 3) continue;
      const raw = ch.textContent; const pre = /^pre/.test(cs.whiteSpace);
      const tx = pre ? raw : raw.replace(/\s+/g, ' ').trim(); if (!tx) continue;
      rng.selectNodeContents(ch);
      const rects = [...rng.getClientRects()].filter(r => r.width > 0 && r.height > 0);
      if (!rects.length) continue;
      const l = Math.min(...rects.map(r => r.left)), t = Math.min(...rects.map(r => r.top)), r2 = Math.max(...rects.map(r => r.right)), b2 = Math.max(...rects.map(r => r.bottom));
      const lines = new Set(rects.map(r => Math.round(r.top / 3))).size;
      const n = { t: 'x', tx, b: [l + scrollX, t + scrollY, r2 - l, b2 - t], st: textStyleCache(el, cs) };
      const ta = cs.textAlign; if (ta === 'center') n.an = 'c'; else if (ta === 'right' || ta === 'end') n.an = 'r';
      if (lines > 1) n.ml = 1;
      if (cs.textOverflow === 'ellipsis' && lines === 1) n.fw = 1;
      if (fixed) n.fx = 1;
      out.push(n); count++;
    }
  }
  const tsc = new WeakMap();
  function textStyleCache(el, cs) { if (!tsc.has(el)) tsc.set(el, textStyle(el, cs)); return tsc.get(el); }

  function nameFor(el, cs) {
    const tag = el.tagName.toLowerCase();
    const txt = (el.innerText || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (tag === 'button' || el.getAttribute('role') === 'button') return 'Button / ' + (txt || el.getAttribute('aria-label') || 'icon');
    if (tag === 'input' || tag === 'textarea' || tag === 'select') return 'Input / ' + (el.placeholder || el.getAttribute('aria-label') || el.name || tag);
    if (tag === 'a') return 'Link / ' + (txt || 'link');
    if (tag === 'img') return 'Image / ' + (el.alt || 'image');
    if (/^h[1-6]$/.test(tag)) return tag.toUpperCase() + ' / ' + txt;
    return el.getAttribute('data-figma-name') || el.getAttribute('aria-label') || (['nav', 'header', 'footer', 'main', 'section', 'aside', 'form', 'dialog'].includes(tag) ? tag : 'Frame');
  }

  function walk(el, out, inFixed, depth) {
    if (depth > 60 || count > 12000) return;
    const cs = getComputedStyle(el);
    if (!visible(el, cs)) return;
    const tag = el.tagName.toLowerCase();
    if (['script', 'style', 'noscript', 'template', 'head', 'meta', 'link', 'title'].includes(tag)) return;
    const b = docRect(el);
    const fixed = cs.position === 'fixed' || cs.position === 'sticky';
    const fx = fixed && !inFixed;
    const vw = document.documentElement.clientWidth;
    if (b[0] >= vw + 1 || b[0] + b[2] <= -1) { if (!(b[2] === 0)) return; }
    if (tag === 'svg' || tag === 'SVG') { if (b[2] > 0 && b[3] > 0) { const n = svgNode(el, cs, b); if (fx) n.fx = 1; if (num(cs.opacity) < 1) n.o = num(cs.opacity); out.push(n); count++; } return; }
    if (b[2] <= 0 && b[3] <= 0 && cs.overflow === 'visible') { for (const c of el.children) walk(c, out, inFixed || fixed, depth + 1); return; }

    // paint detection
    const bgHex = hex(cs.backgroundColor);
    const bgi = cs.backgroundImage;
    const bw = ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'].map(k => cs[k.replace('Width', 'Style')] === 'none' ? 0 : num(cs[k]));
    const hasBorder = bw.some(v => v > 0);
    const sh = shadows(el, cs);
    const bb = /blur\(([\d.]+)px\)/.exec(cs.backdropFilter || cs.webkitBackdropFilter || '');
    const isImg = tag === 'img' && el.currentSrc;
    const isInput = ['input', 'textarea', 'select'].includes(tag);
    const clip = cs.overflow !== 'visible' || cs.overflowX !== 'visible' || cs.overflowY !== 'visible';
    const hasBg = bgHex || (bgi && bgi !== 'none');
    const o = num(cs.opacity);
    const paint = hasBg || hasBorder || sh || bb || isImg || (clip && radius(cs, b[2], b[3])) || o < 1 || fx || isInput;
    const node = { t: 'f', b, k: [] };
    const target = paint ? node.k : out;
    if (paint) {
      node.n = nameFor(el, cs);
      const fills = [];
      if (bgHex) fills.push(colorSlot(el, 'backgroundColor'));
      if (bgi && bgi !== 'none') {
        splitTop(bgi).forEach(layer => {
          if (/gradient\(/.test(layer)) { const g = parseGradient(el, layer); if (g) fills.push(g); }
          else { const um = layer.match(/url\("?(.*?)"?\)/); if (um) fills.push({ im: um[1], fit: cs.backgroundSize === 'contain' ? 'FIT' : 'FILL' }); }
        });
      }
      if (isImg) fills.push({ im: el.currentSrc, fit: cs.objectFit === 'contain' ? 'FIT' : 'FILL' });
      if (fills.length) node.f = fills.reverse();
      if (hasBorder) {
        const nz = ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'].find((k, i) => bw[i] > 0);
        node.s = { w: bw.every(v => v === bw[0]) ? bw[0] : bw, c: colorSlot(el, nz) };
      }
      const r = radius(cs, b[2], b[3]); if (r) node.r = r;
      if (sh) node.e = sh;
      if (bb) node.bb = parseFloat(bb[1]);
      if (o < 1) node.o = o;
      if (clip) node.cl = 1;
      if (fx) node.fx = 1;
      const z = zOf(cs); if (z) node.z = z;
      if (isImg) { node.im = el.currentSrc; }
    } else if (fx) { node.fx = 1; }
    if (isInput) {
      const v = (el.value || el.placeholder || '').toString();
      if (v && tag !== 'select') {
        const rng = el.getBoundingClientRect(); const pl = num(cs.paddingLeft);
        const ph = !el.value;
        const ps = ph ? getComputedStyle(el, '::placeholder') : cs;
        const st = styleIdx([(cs.fontFamily.split(',')[0] || 'Inter').replace(/["']/g, '').trim(), num(cs.fontWeight) || 400, num(cs.fontSize), cs.lineHeight === 'normal' ? 0 : num(cs.lineHeight), cs.letterSpacing === 'normal' ? 0 : num(cs.letterSpacing), slot(() => hex((ph ? getComputedStyle(el, '::placeholder') : getComputedStyle(el)).color)), 0, 0, 0]);
        const type = (el.type || '').toLowerCase();
        const txt = type === 'password' ? '•'.repeat(Math.min(v.length, 12)) : v;
        const lh = num(cs.lineHeight) || num(cs.fontSize) * 1.25;
        target.push({ t: 'x', tx: txt, b: [rng.left + scrollX + pl + num(cs.borderLeftWidth), rng.top + scrollY + (rng.height - lh) / 2, Math.max(1, rng.width - pl * 2), lh], st, fw: 1 }); count++;
      }
      if (paint) out.push(node); count++; return;
    }
    // children (elements + text nodes in DOM order)
    textNodes(el, cs, target, false);
    const kids = [...el.children];
    for (const c of kids) walk(c, target, inFixed || fixed, depth + 1);
    // keep DOM order roughly: text first then elements is a simplification; sort by y/x for stability
    if (paint) { out.push(node); count++; }
    else if (fx && target === out) { /* nothing */ }
  }

  function remapColors(D, pairs) {
    const idxOf = new Map(); const C = [], CD = [];
    const get = i => { if (i === null || i === undefined) return i; const k = pairs[i].join('|'); if (!idxOf.has(k)) { idxOf.set(k, C.length); C.push(pairs[i][0]); CD.push(pairs[i][1]); } return idxOf.get(k); };
    const fixNode = n => {
      if (n.f) n.f = n.f.map(f => typeof f === 'number' ? get(f) : f.s ? Object.assign(f, { s: f.s.map(([p, c]) => [p, get(c)]) }) : f);
      if (n.s) n.s.c = get(n.s.c);
      if (n.e) n.e = n.e.map(e => { e[5] = get(e[5]); return e; });
      if (n.c !== undefined && n.t === 'i') n.c = get(n.c);
      if (n.fl !== undefined) n.fl = get(n.fl);
      if (n.k) n.k.forEach(fixNode);
    };
    D.k.forEach(fixNode);
    D.S = D.S.map(t => { t = t.slice(); t[5] = get(t[5]); return t; });
    D.bg = get(D.bg);
    D.C = C; D.CD = CD;
  }

  function pruneEmpty(list) {
    return list.filter(n => { if (n.k) { n.k = pruneEmpty(n.k); if (!n.k.length && !n.f && !n.s && !n.e && !n.im && !n.bb) return false; } return true; });
  }

  window.MLGSER = {
    run(opts = {}) {
      slots = []; S = []; Smap = new Map(); I = {}; G = {}; count = 0;
      const root = document.documentElement;
      const wasDark = root.classList.contains('dark');
      if (wasDark) root.classList.remove('dark');
      const style = document.createElement('style'); style.textContent = '*,*::before,*::after{transition:none!important;animation:none!important}'; document.head.appendChild(style);
      const k = [];
      const bgEl = [document.body, root].find(e => hex(getComputedStyle(e).backgroundColor)) || document.body;
      const bg = slot(() => hex(getComputedStyle(bgEl).backgroundColor) || 'ffffff');
      const rootEl = document.getElementById('root') || document.body;
      walk(rootEl, k, false, 0);
      // fixed overlays portaled outside #root
      for (const c of document.body.children) if (c !== rootEl) walk(c, k, false, 0);
      const light = slots.map(g => g());
      root.classList.add('dark');
      const dark = slots.map(g => g());
      root.classList.remove('dark'); if (wasDark) root.classList.add('dark');
      style.remove();
      const pairs = light.map((l, i) => [l || '000000', dark[i] || l || '000000']);
      const D = { vp: opts.vp || (innerWidth > 800 ? 'd' : 'm'), bg, dh: document.documentElement.scrollHeight, sy: scrollY, S, I, G, k: pruneEmpty(k) };
      remapColors(D, pairs);
      return D;
    },
  };
})();
