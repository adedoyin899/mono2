// CalendarProvider — interface for Google Calendar sync and Meet link generation.
// Real implementation: Phase 8 (Google OAuth 2.0, Calendar API, Meet API).
// Mock: deterministic URLs, no real network calls.

export interface AvailabilityBlock {
  id: string;
  date: Date;
  /** JSON array of time slots: [{start: "09:00", end: "10:00", booked: false}, ...] */
  slots: Array<{ start: string; end: string; booked: boolean }>;
  calendarEventId?: string | null;
}

export interface CalendarProvider {
  /**
   * Generate a Google OAuth 2.0 auth URL for the given user.
   * The user must visit this URL to grant Calendar + Meet access.
   * Phase 8 stores the resulting refresh token encrypted in the DB.
   */
  connect(userId: string): Promise<{ authUrl: string }>;

  /**
   * Push an availability block to the user's Google Calendar.
   * Creates/updates a calendar event and writes back `calendarEventId`.
   * One-way (Monologg → Google) at minimum; two-way sync is Phase 8+.
   */
  pushAvailability(block: AvailabilityBlock): Promise<{ calendarEventId: string }>;

  /**
   * Create a Google Meet link for a confirmed booking.
   * The URL is stored on Booking.meetUrl and surfaced in the Order Room's call button.
   */
  createMeet(bookingId: string): Promise<{ meetUrl: string }>;
}
