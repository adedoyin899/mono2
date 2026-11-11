// v2 placement library (stored in Figma root sharedPluginData mlg/v2lib). Requires MLG (renderer) evaluated first.
// Layout mirrors v1: Section 8700 wide, title/subtitle, 4 states per row (pitch 2170), desktop at x, mobile at x+1520.
(function () {
  const V = {};
  const ST = { title: 'S:1f594e9795026e9826083552c25bd4177ebacbe6,', sub: 'S:49600c7407e92ac85f269ff1c697c3cc4dfd4237,', label: 'S:697677b4e2732549d7e796029413380e56404a79,', meta: 'S:6093082387ba649da4e70169a7fc50e6ff2615fc,' };
  const PITCH = 2170, ROWH = 1276;
  function paint(hex) { return { type: 'SOLID', color: { r: parseInt(hex.slice(0, 2), 16) / 255, g: parseInt(hex.slice(2, 4), 16) / 255, b: parseInt(hex.slice(4, 6), 16) / 255 } }; }
  async function mk(parent, name, chars, sid, x, y, hex) {
    const st = await figma.getStyleByIdAsync(sid);
    if (st) await figma.loadFontAsync(st.fontName);
    const t = figma.createText();
    parent.appendChild(t);
    t.name = name; t.characters = chars;
    if (st) await t.setTextStyleIdAsync(sid);
    t.fills = [paint(hex)];
    t.x = x; t.y = y;
    return t;
  }
  V.load = async function (pid) {
    const n = await figma.getNodeByIdAsync(pid); const m = new Map();
    for (const t of n.findAll(x => x.type === 'TEXT')) { const s = t.characters; const i = s.indexOf('§'); if (i > 0) m.set(s.slice(0, i), s.slice(i + 1)); }
    return m;
  };
  V.section = async function (page, num, title, sub) {
    let sec = page.children.find(c => c.type === 'SECTION' && c.name.startsWith(num + ' ·'));
    if (sec) return sec;
    let y = 0;
    for (const c of page.children) if (c.x > -1000) y = Math.max(y, c.y + c.height + 480);
    sec = figma.createSection();
    sec.name = num + ' · ' + title;
    sec.fills = [paint('F3F3F1')];
    page.appendChild(sec);
    sec.x = 0; sec.y = y;
    sec.resizeWithoutConstraints(8700, 600);
    await mk(sec, 'Section title', num + ' · ' + title, ST.title, 120, 72, '1A1A1A');
    await mk(sec, 'Section subtitle', sub, ST.sub, 124, 196, '666666');
    return sec;
  };
  // o: {pageId,num,title,sub,code,label,metaExtra,url,payload:Map,keyD,keyM,sdD,sdM(scroll),baseD,baseM}
  V.place = async function (o) {
    const page = await figma.getNodeByIdAsync(o.pageId);
    const sec = await V.section(page, o.num, o.title, o.sub);
    const n = sec.children.filter(c => c.name === 'State label').length;
    const x = 120 + (n % 4) * PITCH, y0 = 294 + Math.floor(n / 4) * ROWH;
    await mk(sec, 'State label', o.code + '  ' + o.label, ST.label, x, y0, '1A1A1A');
    await mk(sec, 'State meta', 'Desktop 1440 × 1024  ·  iPhone 14 Pro Max 430 × 932' + (o.metaExtra ? '   ·   ' + o.metaExtra : ''), ST.meta, x + 2, y0 + 40, '767676');
    const out = {};
    for (const vp of ['d', 'm']) {
      const key = vp === 'd' ? o.keyD : o.keyM; if (!key) continue;
      const fx = vp === 'd' ? x : x + 1520, fy = y0 + 84;
      const nm = o.code + ' ' + o.label + (vp === 'd' ? ' — Desktop' : ' — Mobile');
      const base = vp === 'd' ? o.baseD : o.baseM;
      let f;
      if (base) {
        const bn = await figma.getNodeByIdAsync(base);
        f = MLG.scrollClone(bn, vp === 'd' ? o.sdD : o.sdM, { parent: sec, x: fx, y: fy, name: nm }, vp === 'd');
      } else {
        const D = JSON.parse(o.payload.get(key));
        f = await MLG.device(D, { name: nm, parent: sec, x: fx, y: fy, url: o.url || 'monologg.app' });
      }
      out[vp] = f.id;
    }
    const rows = Math.floor(n / 4) + 1;
    sec.resizeWithoutConstraints(8700, 294 + rows * ROWH + 6);
    return Object.assign(out, { section: sec.id, slot: n });
  };
  globalThis.V2 = V;
  return 1;
})();
