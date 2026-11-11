// Performer onboarding (8 steps) driven by seeding the localStorage draft, then reloading.
const KEY = 'monologg_creator_onboarding_draft';
const base = { step: 1, gender: '', dob: '', location: '', selectedNiche: null, tags: [], aiSummary: '', rateCards: [] };
const filled = { gender: 'Female', dob: '1996-04-12', location: 'Lagos', selectedNiche: 'actors',
  tags: ['Dramatic range', 'Yoruba & English', 'Voice-over', 'Stage presence', 'Improv'],
  aiSummary: 'Versatile actor with dramatic range, bilingual delivery in Yoruba and English, and strong stage presence across film and live theatre.',
  rateCards: [
    { id: 'card-1', title: 'Feature Film Audition', description: 'Self-tape audition with two takes and direction notes.', price: '45,000', delivery: '24 Hours' },
    { id: 'card-2', title: 'Commercial Voice-Over', description: 'Up to 60 seconds of recorded voice-over, one revision.', price: '30,000', delivery: '48 Hours' },
  ] };
const seed = (o, after) => async (page, vp) => {
  await page.evaluate(([k, d]) => localStorage.setItem(k, JSON.stringify(d)), [KEY, Object.assign({}, base, o)]);
  await page.reload({ waitUntil: 'networkidle' });
  await page.waitForTimeout(900);
  if (after) await after(page, vp);
};
const F = '3 Onboarding';
const mk = (name, title, o, extra = {}, after) => Object.assign({ name, folder: F, title, url: '/onboarding', role: null, steps: seed(o, after) }, extra);
export default [
  mk('onb-1-empty', 'Step 1 — Personal details (empty)', { step: 1, dob: '' }),
  mk('onb-1-filled', 'Step 1 — Personal details (filled)', { step: 1, gender: 'Female', dob: '1996-04-12', location: 'Lagos' }),
  mk('onb-2-craft', 'Step 2 — Craft (default)', { step: 2, gender: 'Female', dob: '1996-04-12', location: 'Lagos' }),
  mk('onb-2-craft-selected', 'Step 2 — Craft (Comedian selected)', { step: 2, selectedNiche: 'comedians', gender: 'Female', dob: '1996-04-12', location: 'Lagos' }),
  mk('onb-3-reel', 'Step 3 — Reel upload', { step: 3, selectedNiche: 'actors' }),
  mk('onb-3-reel-toolarge', 'Step 3 — Reel upload (150MB error)', { step: 3, selectedNiche: 'actors' }, {}, async page => {
    await page.locator('input[type=file]').setInputFiles('/tmp/claude-0/-home-user-mono2/86610d36-9022-57d0-8679-792583b44638/scratchpad/big151.mp4');
    await page.waitForTimeout(800);
  }),
  mk('onb-4-analysing', 'Step 4 — Analysing with Thespian AI', { step: 4, selectedNiche: 'actors' }, { isolate: true }, async page => {
    await page.addInitScript(() => { const st = window.setTimeout; window.setTimeout = (f, t, ...a) => (t >= 2500 ? 0 : st(f, t, ...a)); });
    await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(900);
  }),
  mk('onb-5-tags', 'Step 5 — AI tags & summary', { step: 5, selectedNiche: 'actors', tags: filled.tags, aiSummary: filled.aiSummary }),
  mk('onb-6-rates', 'Step 6 — Rate cards', { step: 6, selectedNiche: 'actors', tags: filled.tags, aiSummary: filled.aiSummary, rateCards: filled.rateCards }),
  mk('onb-7-calendar', 'Step 7 — Connect calendar', Object.assign({}, filled, { step: 7 })),
  mk('onb-7-calendar-connected', 'Step 7 — Calendar connected', Object.assign({}, filled, { step: 7 }), {}, async page => {
    await page.getByRole('button', { name: /Connect Google Calendar/ }).click(); await page.waitForTimeout(1200);
  }),
  mk('onb-8-summary', 'Step 8 — Terms & payout summary', Object.assign({}, filled, { step: 8 })),
];
