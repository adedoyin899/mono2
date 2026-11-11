// Performer home (/dashboard) — logged in via demo performer.
const F = '4 Home';
const click = name => async page => { await page.getByRole('button', { name }).first().click({ timeout: 8000 }); await page.waitForTimeout(800); };
export default [
  { name: 'home-default', folder: F, title: 'Home — check-in & checklist', url: '/dashboard', role: 'performer' },
  { name: 'home-decline-modal', folder: F, title: 'Check-in — “I can’t make it” modal', url: '/dashboard', role: 'performer', steps: click(/I can.t make it/) },
  { name: 'home-balance-hidden', folder: F, title: 'Balance hidden', url: '/dashboard', role: 'performer', steps: click(/Hide balance/) },
  { name: 'home-notifications', folder: F, title: 'Notifications drawer', url: '/dashboard', role: 'performer', steps: click(/View notifications/) },
  { name: 'home-new-user', folder: F, title: 'Home — new user', url: '/dashboard', role: 'performer', steps: async page => { await page.evaluate(() => localStorage.setItem('monologg_is_new_user', 'true')); await page.reload({ waitUntil: 'networkidle' }); await page.waitForTimeout(900); } },
];
