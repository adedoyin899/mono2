// Performer journey: marketing & entry (unauthenticated) + auth. Names double as Figma frame names.
const faq = async page => { const q = page.getByRole('button', { name: /What is Monologg/ }).first(); if (await q.count()) await q.click(); await page.waitForTimeout(400); };
const toggle = label => async page => { await page.getByRole('button', { name: new RegExp('^' + label + 's?$', 'i') }).locator('visible=true').first().click(); await page.waitForTimeout(500); };
const fill = async page => {
  await page.getByPlaceholder('Full Name').fill('Adaeze Okafor');
  await page.getByPlaceholder('Email Address').fill('adaeze@example.com');
  await page.getByPlaceholder(/Create Password/).fill('Monologg2026!');
};

export default [
  { name: 'marketing-landing', folder: '1 Marketing & entry', title: 'Landing', url: '/', sections: true },
  { name: 'marketing-product-performer', folder: '1 Marketing & entry', title: 'Product — Performer (FAQ open)', url: '/product', steps: async (p, vp) => { await toggle('Performer')(p).catch(() => {}); await faq(p); }, sections: true },
  { name: 'marketing-product-client', folder: '1 Marketing & entry', title: 'Product — Client (toggle)', url: '/product', steps: toggle('Client'), sections: true },
  { name: 'marketing-pricing-performer', folder: '1 Marketing & entry', title: 'Pricing — Performer (FAQ open)', url: '/pricing', steps: async p => { await toggle('Performer')(p).catch(() => {}); await faq(p); }, sections: true },
  { name: 'marketing-pricing-client', folder: '1 Marketing & entry', title: 'Pricing — Client (toggle)', url: '/pricing', steps: toggle('Client'), sections: true },
  { name: 'marketing-resources-investor', folder: '1 Marketing & entry', title: 'Resources — investor form', url: '/resources#investor', sections: true },
  { name: 'marketing-mobile-menu', folder: '1 Marketing & entry', title: 'Mobile menu', url: '/', vps: ['m'], steps: async p => { await p.getByRole('button', { name: /menu/i }).first().click(); await p.waitForTimeout(600); } },
  { name: 'auth-create-empty', folder: '2 Sign up & sign in', title: 'Welcome / create account (empty)', url: '/auth?mode=signup' },
  { name: 'auth-create-filled', folder: '2 Sign up & sign in', title: 'Create account (filled)', url: '/auth?mode=signup', steps: fill },
  { name: 'auth-signin', folder: '2 Sign up & sign in', title: 'Sign in', url: '/auth?mode=signin' },
  { name: 'auth-reset', folder: '2 Sign up & sign in', title: 'Reset password', url: '/auth?mode=signin', steps: async p => { await p.getByRole('button', { name: /Forgot password/ }).click(); await p.waitForTimeout(500); } },
  { name: 'auth-link-sent', folder: '2 Sign up & sign in', title: 'Reset link sent', url: '/auth?mode=signin', steps: async p => { await p.getByRole('button', { name: /Forgot password/ }).click(); await p.waitForTimeout(400); await p.getByPlaceholder('Email Address').fill('adaeze@example.com'); await p.locator('form button[type=submit], form button').last().click(); await p.waitForTimeout(1200); } },
  { name: 'auth-google-error', folder: '2 Sign up & sign in', title: 'Google error', url: '/auth?mode=signup', steps: async p => { await p.getByRole('button', { name: /Continue with Google/ }).click(); await p.waitForTimeout(1500); } },
];
