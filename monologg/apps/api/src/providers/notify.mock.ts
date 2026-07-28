import type { NotifyProvider } from "./notify.interface.js";

// Mock NotifyProvider — for dev and test environments.
// Logs notifications to stdout instead of sending real emails/SMS.
// Safe to use in tests — zero real sends, but the log output is inspectable.

export const mockNotifyProvider: NotifyProvider = {
  async email(to, template, data) {
    console.log(`[notify.mock] EMAIL → ${to} | template: ${template} | data:`, JSON.stringify(data));
  },

  async sms(to, msg) {
    console.log(`[notify.mock] SMS → ${to} | "${msg}"`);
  },

  async inApp(userId, payload) {
    console.log(`[notify.mock] IN-APP → user:${userId} | payload:`, JSON.stringify(payload));
  },
};
