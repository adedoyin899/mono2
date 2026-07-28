import type { NotifyProvider } from "./notify.interface.js";

// Real NotifyProvider — SendGrid (email) + Twilio (SMS) + Supabase Realtime (in-app).
// TODO Phase 9: implement real sends via provider SDKs.

export const realNotifyProvider: NotifyProvider = {
  async email(_to, _template, _data) {
    throw new Error("[notify.real] SendGrid email integration not yet implemented — Phase 9.");
  },

  async sms(_to, _msg) {
    throw new Error("[notify.real] Twilio SMS integration not yet implemented — Phase 9.");
  },

  async inApp(_userId, _payload) {
    throw new Error("[notify.real] In-app notification persistence not yet implemented — Phase 9.");
  },
};
