import type { CalendarProvider } from "./calendar.interface.js";

// Real CalendarProvider — Google Calendar + Meet API implementation.
// TODO Phase 8: implement Google OAuth 2.0 connect, Calendar API pushAvailability,
// and Meet API createMeet. Store encrypted refresh tokens per user.

export const realCalendarProvider: CalendarProvider = {
  async connect(_userId) {
    throw new Error("[calendar.real] Google Calendar integration not yet implemented — Phase 8.");
  },

  async pushAvailability(_block) {
    throw new Error("[calendar.real] Google Calendar pushAvailability not yet implemented — Phase 8.");
  },

  async createMeet(_bookingId) {
    throw new Error("[calendar.real] Google Meet createMeet not yet implemented — Phase 8.");
  },
};
