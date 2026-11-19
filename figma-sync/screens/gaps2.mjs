// Gap states: onboarding calendar failure (UI exists but the app never sets the 'error' state, so it is forced
// through the component's own React state setter) and the Find-performers profile (opens the public storefront in a new tab).
const KEY = 'monologg_creator_onboarding_draft';
const filled = { step: 7, gender: 'Female', dob: '1996-04-12', location: 'Lagos', selectedNiche: 'actors',
  tags: ['Dramatic range', 'Yoruba & English', 'Voice-over', 'Stage presence', 'Improv'],
  aiSummary: 'Versatile actor with dramatic range, bilingual delivery in Yoruba and English, and strong stage presence across film and live theatre.',
  rateCards: [
    { id: 'card-1', title: 'Feature Film Audition', description: 'Self-tape audition with two takes and direction notes.', price: '45,000', delivery: '24 Hours' },
    { id: 'card-2', title: 'Commercial Voice-Over', description: 'Up to 60 seconds of recorded voice-over, one revision.', price: '30,000', delivery: '48 Hours' },
  ] };
export default [
  { name: 'onb-7-calendar-error', folder: '3 Onboarding', title: 'Step 7 — Calendar connection failed', url: '/onboarding', role: null, vps: ['d', 'm'],
    steps: async page => {
      await page.evaluate(([k, d]) => localStorage.setItem(k, JSON.stringify(d)), [KEY, filled]);
      await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(900);
      const n = await page.evaluate(() => {
        const btn = [...document.querySelectorAll('button')].find(b => /Connect Google Calendar/.test(b.textContent));
        if (!btn) return -1;
        const key = Object.keys(btn).find(k => k.startsWith('__reactFiber$')); let f = btn[key];
        while (f) {
          if (f.type && typeof f.type === 'function') {
            let h = f.memoizedState; const c = [];
            while (h) { if (h.queue && h.queue.dispatch && h.memoizedState === 'initial') c.push(h.queue.dispatch); h = h.next; }
            if (c.length) { c.forEach(d => d('error')); return c.length; }
          }
          f = f.return;
        }
        return 0;
      });
      console.log('forced calendar error via', n, 'state hook(s)');
      await page.waitForTimeout(900);
    } },
  { name: 'cf-profile-storefront', folder: '5 Find performers', title: 'Performer profile (public storefront, client view)', url: '/1?role=client', role: 'client', vps: ['d', 'm'], steps: async page => { await page.waitForTimeout(1500); } },
];
