import type { CalendarProvider } from "./calendar.interface.js";

// Mock CalendarProvider — for dev and test environments.
// Returns deterministic URLs; no real OAuth or Google API calls.

export const mockCalendarProvider: CalendarProvider = {
  async connect(userId) {
    return {
      authUrl: `https://mock.accounts.google.com/o/oauth2/auth?state=${userId}&scope=calendar+meet`,
    };
  },

  async pushAvailability(block) {
    return { calendarEventId: `mock_cal_event_${block.id}` };
  },

  async createMeet(bookingId) {
    return { meetUrl: `https://meet.google.com/mock-${bookingId.slice(0, 8)}` };
  },
};
